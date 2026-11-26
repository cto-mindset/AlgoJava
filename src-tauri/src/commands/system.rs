use tauri::{AppHandle, State};

use crate::models::storage::AppBuildInfo;
use crate::services::splash_service::{self, SplashProgressPayload, SplashState};
use crate::services::storage_service;

#[tauri::command]
pub fn get_app_build_info(app: AppHandle) -> AppBuildInfo {
    storage_service::get_app_build_info(&app)
}

#[tauri::command]
pub fn show_splash_screen(
    app: AppHandle,
    state: State<'_, SplashState>,
) -> Option<SplashProgressPayload> {
    splash_service::show_splash_if_not_finished(&app, &state)
}

#[tauri::command]
pub fn update_splash_status(
    app: AppHandle,
    state: State<'_, SplashState>,
    message: String,
    progress: u8,
) {
    splash_service::emit_splash_progress(&app, &state, message, progress);
}

#[tauri::command]
pub fn finish_splash_screen(app: AppHandle, state: State<'_, SplashState>) {
    splash_service::reveal_main_and_close_splash(&app, &state);
}
