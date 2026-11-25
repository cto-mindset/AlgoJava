use tauri::AppHandle;

use crate::models::storage::AppBuildInfo;
use crate::services::storage_service;

#[tauri::command]
pub fn get_app_build_info(app: AppHandle) -> AppBuildInfo {
    storage_service::get_app_build_info(&app)
}
