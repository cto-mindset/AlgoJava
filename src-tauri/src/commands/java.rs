use std::path::Path;

use tauri::{AppHandle, Manager};

use crate::errors::AppError;
use crate::models::java::{ExecutionOutcome, ExecutionRequest, JdkInfo};
use crate::services::{java_executor, jdk_detector};

#[tauri::command]
pub async fn detect_java_runtime(custom_jdk_path: Option<String>) -> Result<JdkInfo, AppError> {
    tauri::async_runtime::spawn_blocking(move || {
        jdk_detector::detect_jdk(custom_jdk_path.as_deref())
    })
    .await
    .map_err(|e| AppError::ExecutionError(format!("JDK detection task failed: {e}")))
}

#[tauri::command]
pub async fn validate_jdk_path(jdk_path: String) -> Result<JdkInfo, AppError> {
    tauri::async_runtime::spawn_blocking(move || {
        jdk_detector::validate_jdk_dir(Path::new(jdk_path.trim()))
    })
    .await
    .map_err(|e| AppError::ExecutionError(format!("JDK validation task failed: {e}")))?
}

#[tauri::command]
pub async fn execute_java_code(
    app: AppHandle,
    request: ExecutionRequest,
) -> Result<ExecutionOutcome, AppError> {
    let cache_root = app.path().app_cache_dir().ok();
    tauri::async_runtime::spawn_blocking(move || {
        java_executor::execute_java_sync(&request, cache_root.as_deref())
    })
    .await
    .map_err(|e| AppError::ExecutionError(format!("Java execution worker failed: {e}")))?
}
