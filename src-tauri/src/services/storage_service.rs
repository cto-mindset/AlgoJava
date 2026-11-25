use std::fs;
use std::path::Path;

use tauri::{AppHandle, Manager};

use crate::errors::AppError;
use crate::models::storage::{AppBuildInfo, ClearCacheResult, StorageInfo};

const MAX_IMPORT_BYTES: u64 = 10 * 1024 * 1024; // 10 MB

fn dir_size_bytes(path: &Path) -> u64 {
    let Ok(entries) = fs::read_dir(path) else {
        return 0;
    };
    let mut total = 0u64;
    for entry in entries.flatten() {
        let p = entry.path();
        if p.is_dir() {
            total = total.saturating_add(dir_size_bytes(&p));
        } else if let Ok(meta) = entry.metadata() {
            total = total.saturating_add(meta.len());
        }
    }
    total
}

fn file_size_if_exists(path: &Path) -> u64 {
    fs::metadata(path).map(|m| m.len()).unwrap_or(0)
}

pub fn get_storage_info(app: &AppHandle) -> Result<StorageInfo, AppError> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| AppError::StorageError(e.to_string()))?;
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    let db_path = config_dir.join("algojava.db");
    let db_wal = config_dir.join("algojava.db-wal");
    let db_shm = config_dir.join("algojava.db-shm");

    let db_size_bytes = file_size_if_exists(&db_path)
        .saturating_add(file_size_if_exists(&db_wal))
        .saturating_add(file_size_if_exists(&db_shm));

    let java_runs_cache = cache_dir.join("java_runs");
    let cache_size_bytes = dir_size_bytes(&java_runs_cache);

    Ok(StorageInfo {
        storage_dir: config_dir.to_string_lossy().into_owned(),
        cache_dir: cache_dir.to_string_lossy().into_owned(),
        db_file_path: db_path.to_string_lossy().into_owned(),
        db_size_bytes,
        cache_size_bytes,
    })
}

/// Clear only transient execution caches (`app_cache_dir/java_runs`),
/// never touching `algojava.db` or user settings in `app_config_dir` / `app_data_dir`.
pub fn clear_app_cache(app: &AppHandle) -> Result<ClearCacheResult, AppError> {
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|e| AppError::StorageError(e.to_string()))?;

    let java_runs_dir = cache_dir.join("java_runs");
    if !java_runs_dir.exists() {
        return Ok(ClearCacheResult {
            cleared_bytes: 0,
            removed_entries: 0,
        });
    }

    let mut cleared_bytes = 0u64;
    let mut removed_entries = 0usize;

    for entry in fs::read_dir(&java_runs_dir)?.flatten() {
        let p = entry.path();
        if p.is_dir() {
            cleared_bytes = cleared_bytes.saturating_add(dir_size_bytes(&p));
            fs::remove_dir_all(&p)?;
        } else {
            cleared_bytes = cleared_bytes.saturating_add(file_size_if_exists(&p));
            fs::remove_file(&p)?;
        }
        removed_entries += 1;
    }

    Ok(ClearCacheResult {
        cleared_bytes,
        removed_entries,
    })
}

fn validate_json_file_path(path: &Path) -> Result<(), AppError> {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.eq_ignore_ascii_case("json"))
        .unwrap_or(false);
    if !ext {
        return Err(AppError::ValidationError(
            "Only .json files are supported for progress import/export.".to_string(),
        ));
    }
    Ok(())
}

pub fn export_progress_file(path: &Path, json_payload: &str) -> Result<usize, AppError> {
    validate_json_file_path(path)?;
    if let Some(parent) = path.parent() {
        if !parent.as_os_str().is_empty() && !parent.exists() {
            return Err(AppError::StorageError(format!(
                "Destination directory does not exist: {}",
                parent.display()
            )));
        }
    }
    fs::write(path, json_payload.as_bytes())?;
    Ok(json_payload.len())
}

pub fn import_progress_file(path: &Path) -> Result<String, AppError> {
    validate_json_file_path(path)?;
    let meta = fs::metadata(path)?;
    if !meta.is_file() {
        return Err(AppError::ValidationError(
            "Selected path is not a regular file.".to_string(),
        ));
    }
    if meta.len() > MAX_IMPORT_BYTES {
        return Err(AppError::ValidationError(
            "Selected JSON file exceeds the 10 MB import size limit.".to_string(),
        ));
    }
    let content = fs::read_to_string(path)?;
    Ok(content)
}

pub fn get_app_build_info(app: &AppHandle) -> AppBuildInfo {
    let pkg = app.package_info();
    AppBuildInfo {
        app_version: pkg.version.to_string(),
        build_date: option_env!("ALGOJAVA_BUILD_DATE")
            .unwrap_or("2026.11.25")
            .to_string(),
        tauri_version: tauri::VERSION.to_string(),
        rust_edition: "2024".to_string(),
        target_os: std::env::consts::OS.to_string(),
        target_arch: std::env::consts::ARCH.to_string(),
        build_profile: if cfg!(debug_assertions) {
            "debug".to_string()
        } else {
            "release".to_string()
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn export_and_import_reject_non_json_extensions() {
        let dir = tempdir().expect("tempdir");
        let txt = dir.path().join("backup.txt");
        let err = export_progress_file(&txt, "{}");
        assert!(matches!(err, Err(AppError::ValidationError(_))));
    }

    #[test]
    fn export_and_import_round_trip_valid_json() {
        let dir = tempdir().expect("tempdir");
        let json_path = dir.path().join("algojava-backup.json");
        let payload = r#"{"schemaVersion":1,"progress":[]}"#;

        let bytes = export_progress_file(&json_path, payload).expect("export");
        assert_eq!(bytes, payload.len());

        let loaded = import_progress_file(&json_path).expect("import");
        assert_eq!(loaded, payload);
    }
}
