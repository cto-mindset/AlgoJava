use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::thread;
use std::time::{Duration, Instant};

use tempfile::TempDir;

use crate::errors::AppError;
use crate::models::java::{CompilerDiagnostic, ExecutionOutcome, ExecutionRequest};
use crate::services::harness_generator::{generate_java_harness, parse_runner_stdout};
use crate::services::jdk_detector::detect_jdk;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

const MAX_OUTPUT_BYTES: usize = 64 * 1024;

struct BoundedOutput {
    text: String,
    truncated: bool,
}

fn configure_subcommand(cmd: &mut Command, cwd: &Path) {
    cmd.current_dir(cwd)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(windows)]
    cmd.creation_flags(CREATE_NO_WINDOW);
}

fn read_stream_bounded<R: Read + Send + 'static>(
    stream: Option<R>,
    max_bytes: usize,
) -> thread::JoinHandle<BoundedOutput> {
    thread::spawn(move || {
        let Some(mut reader) = stream else {
            return BoundedOutput {
                text: String::new(),
                truncated: false,
            };
        };

        let mut buf = Vec::with_capacity(4096);
        let mut chunk = [0u8; 4096];
        let mut truncated = false;

        loop {
            match reader.read(&mut chunk) {
                Ok(0) => break,
                Ok(n) => {
                    if buf.len() < max_bytes {
                        let remaining = max_bytes - buf.len();
                        let to_copy = remaining.min(n);
                        buf.extend_from_slice(&chunk[..to_copy]);
                        if to_copy < n {
                            truncated = true;
                        }
                    } else {
                        truncated = true;
                    }
                }
                Err(_) => break,
            }
        }

        BoundedOutput {
            text: String::from_utf8_lossy(&buf).into_owned(),
            truncated,
        }
    })
}

fn terminate_process_tree(child: &mut Child) {
    #[cfg(windows)]
    {
        let pid = child.id().to_string();
        let mut kill_cmd = Command::new("taskkill");
        kill_cmd.args(["/F", "/T", "/PID", &pid]);
        kill_cmd
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .creation_flags(CREATE_NO_WINDOW);
        let _ = kill_cmd.status();
    }

    let _ = child.kill();
    let _ = child.wait();
}

struct ProcessResult {
    exit_code: Option<i32>,
    timed_out: bool,
    stdout: String,
    stderr: String,
    truncated: bool,
}

fn run_with_timeout(mut cmd: Command, timeout: Duration) -> Result<ProcessResult, AppError> {
    let mut child = cmd.spawn()?;
    let stdout_handle = read_stream_bounded(child.stdout.take(), MAX_OUTPUT_BYTES);
    let stderr_handle = read_stream_bounded(child.stderr.take(), MAX_OUTPUT_BYTES);

    let deadline = Instant::now() + timeout;
    let mut timed_out = false;
    let mut exit_code = None;

    loop {
        match child.try_wait()? {
            Some(status) => {
                exit_code = status.code();
                break;
            }
            None => {
                if Instant::now() >= deadline {
                    timed_out = true;
                    terminate_process_tree(&mut child);
                    break;
                }
                thread::sleep(Duration::from_millis(15));
            }
        }
    }

    let out = stdout_handle.join().unwrap_or(BoundedOutput {
        text: String::new(),
        truncated: false,
    });
    let err = stderr_handle.join().unwrap_or(BoundedOutput {
        text: String::new(),
        truncated: false,
    });

    Ok(ProcessResult {
        exit_code,
        timed_out,
        stdout: out.text,
        stderr: err.text,
        truncated: out.truncated || err.truncated,
    })
}

/// Parse `javac` diagnostic lines such as:
/// `Solution.java:4: error: ';' expected`
pub fn parse_javac_diagnostics(compiler_output: &str) -> Vec<CompilerDiagnostic> {
    let mut diagnostics = Vec::new();
    for line in compiler_output.lines() {
        let trimmed = line.trim();
        if let Some(after_file) = trimmed.strip_prefix("Solution.java:") {
            let parts: Vec<&str> = after_file.splitn(3, ':').collect();
            if parts.len() >= 3 {
                if let Ok(line_num) = parts[0].trim().parse::<u32>() {
                    let msg = format!("{}: {}", parts[1].trim(), parts[2].trim());
                    diagnostics.push(CompilerDiagnostic {
                        line: Some(line_num),
                        column: None,
                        message: msg,
                    });
                    continue;
                }
            }
        }
        if trimmed.contains("error:") || trimmed.contains("warning:") {
            diagnostics.push(CompilerDiagnostic {
                line: None,
                column: None,
                message: trimmed.to_string(),
            });
        }
    }
    diagnostics
}

fn create_isolated_temp_dir(cache_root: Option<&Path>) -> Result<TempDir, AppError> {
    if let Some(root) = cache_root {
        let java_runs = root.join("java_runs");
        fs::create_dir_all(&java_runs)?;
        return Ok(tempfile::Builder::new()
            .prefix("exec_")
            .tempdir_in(&java_runs)?);
    }

    Ok(tempfile::Builder::new()
        .prefix("algojava_exec_")
        .tempdir()?)
}

/// Compile and execute user Java code against automated test cases inside a temporary directory.
pub fn execute_java_sync(
    request: &ExecutionRequest,
    cache_root: Option<&Path>,
) -> Result<ExecutionOutcome, AppError> {
    let jdk = detect_jdk(request.config.custom_jdk_path.as_deref());
    if !jdk.detected {
        if let Some(warning) = jdk.warning {
            if request
                .config
                .custom_jdk_path
                .as_deref()
                .map(str::trim)
                .is_some_and(|s| !s.is_empty())
            {
                return Err(AppError::InvalidJdkPath(warning));
            }
        }
        return Err(AppError::JdkNotFound);
    }

    let javac_path = PathBuf::from(jdk.javac_path.ok_or(AppError::JdkNotFound)?);
    let java_path = PathBuf::from(jdk.java_path.ok_or(AppError::JdkNotFound)?);

    let harness = generate_java_harness(
        &request.source_code,
        &request.method_name,
        &request.parameter_types,
        &request.return_type,
        &request.test_cases,
    )?;

    let temp_dir = create_isolated_temp_dir(cache_root)?;
    let work_dir = temp_dir.path();

    fs::write(work_dir.join("Solution.java"), &harness.sanitized_solution_source)?;
    fs::write(work_dir.join("AlgoJavaRunner.java"), &harness.runner_source)?;

    let compile_timeout = Duration::from_secs(20);
    let exec_timeout = Duration::from_secs(request.config.clamped_timeout_seconds());
    let xmx_flag = format!("-Xmx{}m", request.config.clamped_memory_limit_mb());

    // Step 1: Compile user Solution.java independently for clean line-accurate error messages.
    let mut javac_sol = Command::new(&javac_path);
    javac_sol.args(["-encoding", "UTF-8", "Solution.java"]);
    configure_subcommand(&mut javac_sol, work_dir);
    let sol_compile = run_with_timeout(javac_sol, compile_timeout)?;

    if sol_compile.timed_out {
        return Ok(ExecutionOutcome {
            status: "timeout".to_string(),
            compiled: false,
            compiler_output: "Compilation timed out after 20 seconds.".to_string(),
            diagnostics: vec![],
            stdout: String::new(),
            stderr: sol_compile.stderr,
            exit_code: sol_compile.exit_code,
            execution_time_ms: 20_000,
            timed_out: true,
            output_truncated: sol_compile.truncated,
            passed_count: 0,
            total_count: request.test_cases.len(),
            test_results: vec![],
        });
    }

    if sol_compile.exit_code != Some(0) {
        let compiler_output = if sol_compile.stderr.trim().is_empty() {
            sol_compile.stdout.trim().to_string()
        } else {
            sol_compile.stderr.trim().to_string()
        };
        let diagnostics = parse_javac_diagnostics(&compiler_output);
        return Ok(ExecutionOutcome {
            status: "compile_error".to_string(),
            compiled: false,
            compiler_output,
            diagnostics,
            stdout: String::new(),
            stderr: String::new(),
            exit_code: sol_compile.exit_code,
            execution_time_ms: 0,
            timed_out: false,
            output_truncated: sol_compile.truncated,
            passed_count: 0,
            total_count: request.test_cases.len(),
            test_results: vec![],
        });
    }

    // Step 2: Compile the test runner harness against Solution.class.
    let mut javac_runner = Command::new(&javac_path);
    javac_runner.args(["-encoding", "UTF-8", "-cp", ".", "AlgoJavaRunner.java"]);
    configure_subcommand(&mut javac_runner, work_dir);
    let runner_compile = run_with_timeout(javac_runner, compile_timeout)?;

    if runner_compile.exit_code != Some(0) || runner_compile.timed_out {
        let raw_err = runner_compile.stderr.trim();
        let friendly = format!(
            "Could not match the expected method signature `{}`.\n\nDetails:\n{}",
            request.method_signature, raw_err
        );
        return Ok(ExecutionOutcome {
            status: "compile_error".to_string(),
            compiled: false,
            compiler_output: friendly.clone(),
            diagnostics: vec![CompilerDiagnostic {
                line: None,
                column: None,
                message: format!(
                    "Expected method signature `{}` in class Solution.",
                    request.method_signature
                ),
            }],
            stdout: String::new(),
            stderr: String::new(),
            exit_code: runner_compile.exit_code,
            execution_time_ms: 0,
            timed_out: runner_compile.timed_out,
            output_truncated: runner_compile.truncated,
            passed_count: 0,
            total_count: request.test_cases.len(),
            test_results: vec![],
        });
    }

    // Step 3: Execute AlgoJavaRunner inside the JVM with configured heap and timeout bounds.
    let started = Instant::now();
    let mut java_cmd = Command::new(&java_path);
    java_cmd.args([
        xmx_flag.as_str(),
        "-XX:TieredStopAtLevel=1",
        "-Dfile.encoding=UTF-8",
        "-cp",
        ".",
        "AlgoJavaRunner",
    ]);
    configure_subcommand(&mut java_cmd, work_dir);

    let run_res = run_with_timeout(java_cmd, exec_timeout)?;
    let total_elapsed_ms = started.elapsed().as_millis() as u64;

    let (user_stdout, test_results) =
        parse_runner_stdout(&run_res.stdout, &harness.nonce, &request.test_cases);

    let passed_count = test_results.iter().filter(|r| r.passed).count();
    let total_count = test_results.len();

    let status = if run_res.timed_out {
        "timeout".to_string()
    } else if run_res.exit_code != Some(0) && test_results.iter().all(|r| r.actual_output.is_none()) {
        "runtime_error".to_string()
    } else if passed_count == total_count {
        "passed".to_string()
    } else {
        "failed".to_string()
    };

    // TempDir drops right here, removing temporary .java and .class files.
    drop(temp_dir);

    Ok(ExecutionOutcome {
        status,
        compiled: true,
        compiler_output: String::new(),
        diagnostics: vec![],
        stdout: user_stdout,
        stderr: run_res.stderr,
        exit_code: run_res.exit_code,
        execution_time_ms: total_elapsed_ms,
        timed_out: run_res.timed_out,
        output_truncated: run_res.truncated,
        passed_count,
        total_count,
        test_results,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::java::ExecutionConfig;

    #[test]
    fn execution_config_clamps_timeout_and_memory_safely() {
        let low = ExecutionConfig {
            custom_jdk_path: None,
            timeout_seconds: 0,
            memory_limit_mb: 8,
        };
        assert_eq!(low.clamped_timeout_seconds(), 1);
        assert_eq!(low.clamped_memory_limit_mb(), 64);

        let high = ExecutionConfig {
            custom_jdk_path: None,
            timeout_seconds: 9999,
            memory_limit_mb: 32768,
        };
        assert_eq!(high.clamped_timeout_seconds(), 120);
        assert_eq!(high.clamped_memory_limit_mb(), 2048);
    }

    #[test]
    fn javac_diagnostic_parser_extracts_line_and_message() {
        let output = "Solution.java:3: error: ';' expected\n        return a + b\n                    ^\n1 error\n";
        let diags = parse_javac_diagnostics(output);
        assert_eq!(diags.len(), 1);
        assert_eq!(diags[0].line, Some(3));
        assert!(diags[0].message.contains("';' expected"));
    }

    #[test]
    fn bounded_stream_reader_clamps_large_output() {
        let data = vec![b'x'; 200];
        let handle = read_stream_bounded(Some(std::io::Cursor::new(data)), 64);
        let res = handle.join().expect("join reader");
        assert!(res.truncated);
        assert_eq!(res.text.len(), 64);
    }

    #[test]
    fn temp_dir_cleans_up_after_drop() {
        let base = tempfile::tempdir().expect("base tempdir");
        let created_path = {
            let isolated = create_isolated_temp_dir(Some(base.path())).expect("isolated");
            let p = isolated.path().to_path_buf();
            assert!(p.exists());
            p
        };
        assert!(!created_path.exists());
    }
}
