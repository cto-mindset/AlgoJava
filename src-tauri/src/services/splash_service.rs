use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Clone, Serialize)]
pub struct SplashProgressPayload {
    pub message: String,
    pub progress: u8,
}

#[derive(Default)]
pub struct SplashState {
    finished: AtomicBool,
    latest: Mutex<Option<SplashProgressPayload>>,
}

impl SplashState {
    pub fn record_progress(&self, message: String, progress: u8) -> SplashProgressPayload {
        let payload = SplashProgressPayload {
            message,
            progress: clamp_progress(progress),
        };
        if let Ok(mut guard) = self.latest.lock() {
            *guard = Some(payload.clone());
        }
        payload
    }

    pub fn latest_progress(&self) -> Option<SplashProgressPayload> {
        self.latest.lock().ok().and_then(|guard| guard.clone())
    }

    pub fn mark_finished(&self) {
        self.finished.store(true, Ordering::SeqCst);
    }

    pub fn is_finished(&self) -> bool {
        self.finished.load(Ordering::SeqCst)
    }
}

pub fn clamp_progress(progress: u8) -> u8 {
    progress.min(100)
}

pub fn emit_splash_progress(
    app: &AppHandle,
    state: &SplashState,
    message: String,
    progress: u8,
) {
    let payload = state.record_progress(message, progress);
    if !state.is_finished() {
        let _ = app.emit_to("splashscreen", "splash-progress", payload);
    }
}

pub fn show_splash_if_not_finished(
    app: &AppHandle,
    state: &SplashState,
) -> Option<SplashProgressPayload> {
    if state.is_finished() {
        return None;
    }
    if let Some(splash_window) = app.get_webview_window("splashscreen") {
        let _ = splash_window.show();
    }
    state.latest_progress()
}

pub fn reveal_main_and_close_splash(app: &AppHandle, state: &SplashState) {
    state.mark_finished();
    if let Some(main_window) = app.get_webview_window("main") {
        let _ = main_window.show();
        let _ = main_window.set_focus();
    }
    if let Some(splash_window) = app.get_webview_window("splashscreen") {
        let _ = splash_window.close();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn clamp_progress_bounds_to_100() {
        assert_eq!(clamp_progress(0), 0);
        assert_eq!(clamp_progress(45), 45);
        assert_eq!(clamp_progress(100), 100);
        assert_eq!(clamp_progress(250), 100);
    }

    #[test]
    fn splash_progress_payload_serializes_expected_fields() {
        let payload = SplashProgressPayload {
            message: "Detecting JDK...".to_string(),
            progress: clamp_progress(82),
        };
        let json = serde_json::to_value(&payload).expect("serialize splash payload");
        assert_eq!(json["message"], "Detecting JDK...");
        assert_eq!(json["progress"], 82);
    }

    #[test]
    fn splash_state_caches_latest_progress_and_tracks_completion() {
        let state = SplashState::default();
        assert!(!state.is_finished());
        assert!(state.latest_progress().is_none());

        let recorded = state.record_progress("Opening database...".to_string(), 55);
        assert_eq!(recorded.progress, 55);

        let latest = state.latest_progress().expect("latest cached payload");
        assert_eq!(latest.message, "Opening database...");
        assert_eq!(latest.progress, 55);

        state.mark_finished();
        assert!(state.is_finished());
    }
}
