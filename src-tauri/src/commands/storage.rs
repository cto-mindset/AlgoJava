use std::path::PathBuf;

use tauri::AppHandle;

use crate::errors::AppError;
use crate::models::storage::{ClearCacheResult, StorageInfo};
use crate::services::storage_service;

#[tauri::command]
pub async fn get_storage_info(app: AppHandle) -> Result<StorageInfo, AppError> {
    storage_service::get_storage_info(&app)
}

#[tauri::command]
pub async fn clear_app_cache(app: AppHandle) -> Result<ClearCacheResult, AppError> {
    storage_service::clear_app_cache(&app)
}

#[tauri::command]
pub async fn export_progress_file(path: String, payload_json: String) -> Result<usize, AppError> {
    let dest = PathBuf::from(path);
    tauri::async_runtime::spawn_blocking(move || {
        storage_service::export_progress_file(&dest, &payload_json)
    })
    .await
    .map_err(|e| AppError::StorageError(format!("Export task failed: {e}")))?
}

#[tauri::command]
pub async fn import_progress_file(path: String) -> Result<String, AppError> {
    let src = PathBuf::from(path);
    tauri::async_runtime::spawn_blocking(move || storage_service::import_progress_file(&src))
        .await
        .map_err(|e| AppError::StorageError(format!("Import task failed: {e}")))?
}
