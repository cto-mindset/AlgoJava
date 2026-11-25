mod commands;
mod database;
mod errors;
mod models;
mod services;

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
        .invoke_handler(tauri::generate_handler![
            commands::java::detect_java_runtime,
            commands::java::validate_jdk_path,
            commands::java::execute_java_code,
            commands::storage::get_storage_info,
            commands::storage::clear_app_cache,
            commands::storage::export_progress_file,
            commands::storage::import_progress_file,
            commands::system::get_app_build_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
