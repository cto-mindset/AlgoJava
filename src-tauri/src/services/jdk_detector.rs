use std::collections::HashSet;
use std::env;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::{Duration, Instant};

use crate::errors::AppError;
use crate::models::java::JdkInfo;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

#[derive(Debug, Clone)]
struct JdkCandidate {
    root: PathBuf,
    javac: PathBuf,
    java: PathBuf,
    source: &'static str,
}

fn tool_names() -> (&'static str, &'static str) {
    if cfg!(windows) {
        ("javac.exe", "java.exe")
    } else {
        ("javac", "java")
    }
}

fn configure_command(cmd: &mut Command) {
    cmd.stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(windows)]
    cmd.creation_flags(CREATE_NO_WINDOW);
}

/// Normalize a user-supplied or discovered path into a `(jdk_root, javac, java)` tuple.
pub fn resolve_jdk_binaries(path: &Path) -> Option<(PathBuf, PathBuf, PathBuf)> {
    let (javac_name, java_name) = tool_names();

    // Case 1: path points directly to JDK root (`<root>/bin/javac`).
    let bin_dir = path.join("bin");
    let root_javac = bin_dir.join(javac_name);
    let root_java = bin_dir.join(java_name);
    if root_javac.is_file() && root_java.is_file() {
        return Some((path.to_path_buf(), root_javac, root_java));
    }

    // Case 2: path points to the `bin` folder itself (`<root>/bin`).
    let direct_javac = path.join(javac_name);
    let direct_java = path.join(java_name);
    if direct_javac.is_file() && direct_java.is_file() {
        let root = path
            .file_name()
            .and_then(|n| n.to_str())
            .filter(|n| n.eq_ignore_ascii_case("bin"))
            .and_then(|_| path.parent().map(Path::to_path_buf))
            .unwrap_or_else(|| path.to_path_buf());
        return Some((root, direct_javac, direct_java));
    }

    None
}

/// Parse Java version output from `javac -version` or `java -version`.
/// Examples:
/// - `javac 21.0.4` -> `("21.0.4", 21)`
/// - `javac 17.0.12` -> `("17.0.12", 17)`
/// - `javac 1.8.0_412` -> `("1.8.0_412", 8)`
/// - `openjdk version "21.0.5" 2024-10-15` -> `("21.0.5", 21)`
pub fn parse_java_version_output(output: &str) -> Option<(String, u32)> {
    for line in output.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // Quoted version string: openjdk version "21.0.5"
        if let Some(start) = trimmed.find('"') {
            let rest = &trimmed[start + 1..];
            if let Some(end) = rest.find('"') {
                let ver = rest[..end].trim();
                if let Some(major) = parse_major_version(ver) {
                    return Some((ver.to_string(), major));
                }
            }
        }

        // Unquoted token: javac 21.0.4 / javac 23-ea
        for token in trimmed.split_whitespace() {
            let cleaned = token.trim_matches('"');
            if let Some(major) = parse_major_version(cleaned) {
                return Some((cleaned.to_string(), major));
            }
        }
    }

    None
}

pub fn parse_major_version(version: &str) -> Option<u32> {
    let first_char = version.chars().next()?;
    if !first_char.is_ascii_digit() {
        return None;
    }

    let core = version.split(['-', '+', '_']).next()?;
    let mut parts = core.split('.');
    let first: u32 = parts.next()?.parse().ok()?;
    if first == 1 {
        if let Some(second_str) = parts.next() {
            if let Ok(second) = second_str.parse::<u32>() {
                return Some(second);
            }
        }
    }
    Some(first)
}

fn run_version_probe(executable: &Path, arg: &str) -> Option<String> {
    let mut cmd = Command::new(executable);
    cmd.arg(arg);
    configure_command(&mut cmd);

    let mut child = cmd.spawn().ok()?;
    let deadline = Instant::now() + Duration::from_secs(5);

    loop {
        match child.try_wait() {
            Ok(Some(_status)) => {
                let output = child.wait_with_output().ok()?;
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                let combined = format!("{stdout}\n{stderr}");
                return Some(combined);
            }
            Ok(None) => {
                if Instant::now() >= deadline {
                    let _ = child.kill();
                    let _ = child.wait();
                    return None;
                }
                thread::sleep(Duration::from_millis(20));
            }
            Err(_) => return None,
        }
    }
}

fn probe_candidate(candidate: &JdkCandidate) -> Option<JdkInfo> {
    let javac_out = run_version_probe(&candidate.javac, "-version")?;
    let (version, major) = parse_java_version_output(&javac_out).or_else(|| {
        let java_out = run_version_probe(&candidate.java, "-version")?;
        parse_java_version_output(&java_out)
    })?;

    // Also ensure `java -version` succeeds so runtime matches compiler.
    run_version_probe(&candidate.java, "-version")?;

    Some(JdkInfo {
        detected: true,
        version: Some(version),
        major_version: Some(major),
        jdk_path: Some(candidate.root.to_string_lossy().into_owned()),
        javac_path: Some(candidate.javac.to_string_lossy().into_owned()),
        java_path: Some(candidate.java.to_string_lossy().into_owned()),
        source: candidate.source.to_string(),
        warning: None,
    })
}

fn push_candidate(
    out: &mut Vec<JdkCandidate>,
    seen_roots: &mut HashSet<PathBuf>,
    path: &Path,
    source: &'static str,
) {
    if let Some((root, javac, java)) = resolve_jdk_binaries(path) {
        let canonical = std::fs::canonicalize(&root).unwrap_or(root);
        if seen_roots.insert(canonical.clone()) {
            out.push(JdkCandidate {
                root: canonical,
                javac,
                java,
                source,
            });
        }
    }
}

fn collect_system_candidates() -> Vec<JdkCandidate> {
    let mut candidates = Vec::new();
    let mut seen = HashSet::new();

    if let Ok(java_home) = env::var("JAVA_HOME") {
        if !java_home.trim().is_empty() {
            push_candidate(&mut candidates, &mut seen, Path::new(&java_home), "JAVA_HOME");
        }
    }

    if let Some(path_var) = env::var_os("PATH") {
        for dir in env::split_paths(&path_var) {
            push_candidate(&mut candidates, &mut seen, &dir, "PATH");
        }
    }

    #[cfg(windows)]
    {
        collect_windows_registry_jdks(&mut candidates, &mut seen);

        let mut roots: Vec<PathBuf> = vec![
            PathBuf::from(r"C:\Program Files\Eclipse Adoptium"),
            PathBuf::from(r"C:\Program Files\Java"),
            PathBuf::from(r"C:\Program Files\Microsoft"),
            PathBuf::from(r"C:\Program Files\Amazon Corretto"),
            PathBuf::from(r"C:\Program Files\BellSoft"),
            PathBuf::from(r"C:\Program Files\Zulu"),
            PathBuf::from(r"C:\Program Files\Semeru"),
        ];

        if let Ok(user_profile) = env::var("USERPROFILE") {
            let home = PathBuf::from(user_profile);
            roots.push(home.join(".jdks"));
            roots.push(home.join("scoop").join("apps"));
        }

        for parent in roots {
            if let Ok(entries) = std::fs::read_dir(parent) {
                for entry in entries.flatten() {
                    let p = entry.path();
                    if p.is_dir() {
                        push_candidate(&mut candidates, &mut seen, &p, "system_scan");
                        let current = p.join("current");
                        if current.is_dir() {
                            push_candidate(&mut candidates, &mut seen, &current, "system_scan");
                        }
                    }
                }
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        if let Ok(entries) = std::fs::read_dir("/Library/Java/JavaVirtualMachines") {
            for entry in entries.flatten() {
                let home = entry.path().join("Contents").join("Home");
                if home.is_dir() {
                    push_candidate(&mut candidates, &mut seen, &home, "system_scan");
                }
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        for parent in ["/usr/lib/jvm", "/usr/java"] {
            if let Ok(entries) = std::fs::read_dir(parent) {
                for entry in entries.flatten() {
                    let p = entry.path();
                    if p.is_dir() {
                        push_candidate(&mut candidates, &mut seen, &p, "system_scan");
                    }
                }
            }
        }
    }

    candidates
}

#[cfg(windows)]
fn collect_windows_registry_jdks(out: &mut Vec<JdkCandidate>, seen: &mut HashSet<PathBuf>) {
    use winreg::RegKey;
    use winreg::enums::HKEY_LOCAL_MACHINE;

    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    for key_path in [
        r"SOFTWARE\JavaSoft\JDK",
        r"SOFTWARE\JavaSoft\Java Development Kit",
        r"SOFTWARE\Eclipse Adoptium\JDK",
    ] {
        if let Ok(jdk_key) = hklm.open_subkey(key_path) {
            for subkey_name in jdk_key.enum_keys().flatten() {
                if let Ok(ver_key) = jdk_key.open_subkey(&subkey_name) {
                    if let Ok(java_home) = ver_key.get_value::<String, _>("JavaHome") {
                        push_candidate(out, seen, Path::new(&java_home), "windows_registry");
                    }
                    if let Ok(hotspot_msi) = ver_key.open_subkey("hotspot\\MSI") {
                        if let Ok(path) = hotspot_msi.get_value::<String, _>("Path") {
                            push_candidate(out, seen, Path::new(&path), "windows_registry");
                        }
                    }
                }
            }
        }
    }
}

/// Validate a specific user-provided JDK directory.
pub fn validate_jdk_dir(path: &Path) -> Result<JdkInfo, AppError> {
    if !path.exists() {
        return Err(AppError::InvalidJdkPath(format!(
            "Directory does not exist: {}",
            path.display()
        )));
    }

    let (root, javac, java) = resolve_jdk_binaries(path).ok_or_else(|| {
        AppError::InvalidJdkPath(format!(
            "Could not find both javac and java executables under '{}'. Make sure you select a JDK (not a JRE-only installation).",
            path.display()
        ))
    })?;

    let candidate = JdkCandidate {
        root,
        javac,
        java,
        source: "custom",
    };

    probe_candidate(&candidate).ok_or_else(|| {
        AppError::InvalidJdkPath(format!(
            "Found binaries under '{}', but failed to execute 'javac -version' and 'java -version'.",
            path.display()
        ))
    })
}

/// Detect the active JDK, preferring `custom_path` when supplied.
pub fn detect_jdk(custom_path: Option<&str>) -> JdkInfo {
    if let Some(raw_custom) = custom_path.map(str::trim).filter(|s| !s.is_empty()) {
        match validate_jdk_dir(Path::new(raw_custom)) {
            Ok(info) => return info,
            Err(err) => {
                // Fall back to reporting the validation problem cleanly so user knows custom path failed.
                return JdkInfo {
                    detected: false,
                    version: None,
                    major_version: None,
                    jdk_path: Some(raw_custom.to_string()),
                    javac_path: None,
                    java_path: None,
                    source: "custom".to_string(),
                    warning: Some(err.to_string()),
                };
            }
        }
    }

    let candidates = collect_system_candidates();
    let mut best: Option<JdkInfo> = None;

    for candidate in &candidates {
        if let Some(info) = probe_candidate(candidate) {
            let replace = match &best {
                None => true,
                Some(current) => {
                    // Prefer JAVA_HOME/PATH over scan; otherwise prefer newer major version.
                    let info_priority = source_priority(&info.source);
                    let curr_priority = source_priority(&current.source);
                    if info_priority != curr_priority {
                        info_priority > curr_priority
                    } else {
                        info.major_version.unwrap_or(0) > current.major_version.unwrap_or(0)
                    }
                }
            };
            if replace {
                best = Some(info);
            }
        }
    }

    best.unwrap_or_else(|| JdkInfo {
        detected: false,
        version: None,
        major_version: None,
        jdk_path: None,
        javac_path: None,
        java_path: None,
        source: "none".to_string(),
        warning: Some(
            "No JDK installation found in JAVA_HOME, PATH, or standard system locations. Install JDK 17+ or select a custom JDK folder."
                .to_string(),
        ),
    })
}

fn source_priority(source: &str) -> u8 {
    match source {
        "custom" => 4,
        "JAVA_HOME" => 3,
        "PATH" => 2,
        _ => 1,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn parses_modern_and_legacy_java_versions() {
        assert_eq!(
            parse_java_version_output("javac 21.0.4"),
            Some(("21.0.4".to_string(), 21))
        );
        assert_eq!(
            parse_java_version_output("javac 17.0.12\n"),
            Some(("17.0.12".to_string(), 17))
        );
        assert_eq!(
            parse_java_version_output("javac 1.8.0_412"),
            Some(("1.8.0_412".to_string(), 8))
        );
        assert_eq!(
            parse_java_version_output("openjdk version \"23.0.1\" 2024-10-15\nOpenJDK Runtime Environment"),
            Some(("23.0.1".to_string(), 23))
        );
        assert_eq!(parse_java_version_output("not a version"), None);
    }

    #[test]
    fn resolves_jdk_root_or_bin_directory() {
        let dir = tempdir().expect("create tempdir");
        let bin = dir.path().join("bin");
        fs::create_dir_all(&bin).expect("create bin");

        let (javac_name, java_name) = tool_names();
        fs::write(bin.join(javac_name), b"").expect("stub javac");
        fs::write(bin.join(java_name), b"").expect("stub java");

        let from_root = resolve_jdk_binaries(dir.path()).expect("resolve from root");
        assert_eq!(from_root.0, dir.path());

        let from_bin = resolve_jdk_binaries(&bin).expect("resolve from bin");
        assert_eq!(from_bin.0, dir.path());
    }

    #[test]
    fn rejects_nonexistent_and_incomplete_jdk_paths() {
        let missing = validate_jdk_dir(Path::new("Z:\\definitely\\missing\\jdk_path"));
        assert!(matches!(missing, Err(AppError::InvalidJdkPath(_))));

        let dir = tempdir().expect("create tempdir");
        let bin = dir.path().join("bin");
        fs::create_dir_all(&bin).expect("create bin");
        let (_, java_name) = tool_names();
        fs::write(bin.join(java_name), b"").expect("jre-only java");

        let jre_only = validate_jdk_dir(dir.path());
        assert!(matches!(jre_only, Err(AppError::InvalidJdkPath(_))));
    }

    #[test]
    fn custom_invalid_jdk_returns_warning_without_panicking() {
        let info = detect_jdk(Some("C:\\nonexistent_custom_jdk_9999"));
        assert!(!info.detected);
        assert_eq!(info.source, "custom");
        assert!(info.warning.is_some());
    }
}
