mod commands;
mod database;
mod errors;
mod models;
mod services;

use std::time::Duration;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:algojava.db", database::migrations::get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init());

    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build());

    builder
        .manage(services::splash_service::SplashState::default())
        .setup(|app| {
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                std::thread::sleep(Duration::from_secs(7));
                if let Some(main_window) = handle.get_webview_window("main") {
                    if !main_window.is_visible().unwrap_or(true) {
                        let state = handle.state::<services::splash_service::SplashState>();
                        services::splash_service::reveal_main_and_close_splash(&handle, &state);
                    }
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::java::detect_java_runtime,
            commands::java::validate_jdk_path,
            commands::java::execute_java_code,
            commands::storage::get_storage_info,
            commands::storage::clear_app_cache,
            commands::storage::export_progress_file,
            commands::storage::import_progress_file,
            commands::system::get_app_build_info,
            commands::system::show_splash_screen,
            commands::system::update_splash_status,
            commands::system::finish_splash_screen,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
