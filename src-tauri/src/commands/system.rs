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
    use base64::Engine as _;

    let Some(obj) = updater.and_then(|v| v.as_object()) else {
        return false;
    };

    if obj.get("requireSignedVersion").and_then(|v| v.as_bool()) != Some(true) {
        return false;
    }

    for danger_key in [
        "dangerousInsecureTransportProtocol",
        "dangerousAcceptInvalidCerts",
        "dangerousAcceptInvalidHostnames",
    ] {
        if obj.get(danger_key).and_then(|v| v.as_bool()) == Some(true) {
            return false;
        }
    }

    let pubkey_raw = obj
        .get("pubkey")
        .and_then(|v| v.as_str())
        .map(str::trim)
        .unwrap_or("");
    if pubkey_raw.is_empty() || pubkey_raw.contains("REPLACE_WITH") {
        return false;
    }

    let Ok(decoded_bytes) = base64::engine::general_purpose::STANDARD.decode(pubkey_raw) else {
        return false;
    };
    let Ok(decoded_str) = std::str::from_utf8(&decoded_bytes) else {
        return false;
    };
    let lines: Vec<&str> = decoded_str.trim().lines().collect();
    if lines.len() < 2
        || !lines[0].starts_with("untrusted comment:")
        || !lines[1].starts_with("RW")
        || lines[1].len() < 40
    {
        return false;
    }

    let Some(endpoints) = obj.get("endpoints").and_then(|v| v.as_array()) else {
        return false;
    };
    if endpoints.is_empty() {
        return false;
    }

    endpoints.iter().all(|entry| {
        entry
            .as_str()
            .map(str::trim)
            .is_some_and(|url| url.starts_with("https://") && url.len() > 8)
    })
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
    use base64::Engine as _;
    use serde_json::json;

    fn sample_valid_pubkey() -> String {
        base64::engine::general_purpose::STANDARD.encode(
            "untrusted comment: minisign public key ABCD1234\nRWRTYUIOPLKJHGFDSAZXCVBNM1234567890abcdef123456\n",
        )
    }

    #[test]
    fn rejects_empty_or_invalid_pubkey_insecure_endpoints_or_disabled_security_flags() {
        let valid_pubkey = sample_valid_pubkey();
        let valid_url = "https://github.com/cto-mindset/algojava-releases/releases/latest/download/latest.json";

        assert!(!is_valid_updater_config_value(None));
        assert!(!is_valid_updater_config_value(Some(&json!({
            "pubkey": "",
            "requireSignedVersion": true,
            "endpoints": [valid_url]
        }))));
        assert!(!is_valid_updater_config_value(Some(&json!({
            "pubkey": "not-valid-base64!!!",
            "requireSignedVersion": true,
            "endpoints": [valid_url]
        }))));
        assert!(!is_valid_updater_config_value(Some(&json!({
            "pubkey": valid_pubkey,
            "requireSignedVersion": true,
            "endpoints": [valid_url, "http://insecure.example.com/latest.json"]
        }))));
        assert!(!is_valid_updater_config_value(Some(&json!({
            "pubkey": valid_pubkey,
            "requireSignedVersion": false,
            "endpoints": [valid_url]
        }))));
        assert!(!is_valid_updater_config_value(Some(&json!({
            "pubkey": valid_pubkey,
            "requireSignedVersion": true,
            "dangerousAcceptInvalidCerts": true,
            "endpoints": [valid_url]
        }))));
        assert!(is_valid_updater_config_value(Some(&json!({
            "pubkey": sample_valid_pubkey(),
            "requireSignedVersion": true,
            "endpoints": [valid_url]
        }))));
    }
}
