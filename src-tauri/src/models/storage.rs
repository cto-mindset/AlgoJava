use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageInfo {
    pub storage_dir: String,
    pub cache_dir: String,
    pub db_file_path: String,
    pub db_size_bytes: u64,
    pub cache_size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClearCacheResult {
    pub cleared_bytes: u64,
    pub removed_entries: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppBuildInfo {
    pub app_version: String,
    pub build_date: String,
    pub tauri_version: String,
    pub rust_edition: String,
    pub target_os: String,
    pub target_arch: String,
    pub build_profile: String,
}
