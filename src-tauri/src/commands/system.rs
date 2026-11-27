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

fn is_valid_updater_config_value(updater: Option<&serde_json::Value>) -> bool {
    let Some(obj) = updater.and_then(|v| v.as_object()) else {
        return false;
    };

    let pubkey = obj
        .get("pubkey")
        .and_then(|v| v.as_str())
        .map(str::trim)
        .unwrap_or("");
    if pubkey.is_empty() || pubkey.contains("REPLACE_WITH") {
        return false;
    }

    let has_https_endpoint = obj
        .get("endpoints")
        .and_then(|v| v.as_array())
        .map(|items| {
            items.iter().any(|entry| {
                entry
                    .as_str()
                    .map(str::trim)
                    .is_some_and(|url| url.starts_with("https://") && url.len() > 8)
            })
        })
        .unwrap_or(false);

    has_https_endpoint
}

#[tauri::command]
pub fn is_updater_configured(app: AppHandle) -> bool {
    is_valid_updater_config_value(app.config().plugins.0.get("updater"))
}

#[tauri::command]
pub fn restart_app(app: AppHandle) {
    app.restart();
}

#[cfg(test)]
mod tests {
    use super::is_valid_updater_config_value;
    use serde_json::json;

    #[test]
    fn rejects_empty_or_placeholder_pubkey_or_insecure_endpoint() {
        assert!(!is_valid_updater_config_value(None));
        assert!(!is_valid_updater_config_value(Some(&json!({
            "pubkey": "",
            "endpoints": ["https://github.com/cto-mindset/algojava-releases/releases/latest/download/latest.json"]
        }))));
        assert!(!is_valid_updater_config_value(Some(&json!({
            "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IHBsYWNlaG9sZGVy",
            "endpoints": ["http://insecure.example.com/latest.json"]
        }))));
        assert!(is_valid_updater_config_value(Some(&json!({
            "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk=",
            "endpoints": ["https://github.com/cto-mindset/algojava-releases/releases/latest/download/latest.json"]
        }))));
    }
}
