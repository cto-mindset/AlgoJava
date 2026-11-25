use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JdkInfo {
    pub detected: bool,
    pub version: Option<String>,
    pub major_version: Option<u32>,
    pub jdk_path: Option<String>,
    pub javac_path: Option<String>,
    pub java_path: Option<String>,
    pub source: String,
    pub warning: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecutionConfig {
    pub custom_jdk_path: Option<String>,
    pub timeout_seconds: u64,
    pub memory_limit_mb: u32,
}

impl Default for ExecutionConfig {
    fn default() -> Self {
        Self {
            custom_jdk_path: None,
            timeout_seconds: 15,
            memory_limit_mb: 256,
        }
    }
}

impl ExecutionConfig {
    pub fn clamped_timeout_seconds(&self) -> u64 {
        self.timeout_seconds.clamp(1, 120)
    }

    pub fn clamped_memory_limit_mb(&self) -> u32 {
        self.memory_limit_mb.clamp(64, 2048)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestCaseSpec {
    pub id: i64,
    pub case_number: i32,
    pub display_input: String,
    pub input_args_json: String,
    pub expected_output: String,
    pub is_hidden: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecutionRequest {
    pub source_code: String,
    pub method_name: String,
    pub method_signature: String,
    pub parameter_types: Vec<String>,
    pub return_type: String,
    pub test_cases: Vec<TestCaseSpec>,
    pub config: ExecutionConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CompilerDiagnostic {
    pub line: Option<u32>,
    pub column: Option<u32>,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct TestCaseResultDto {
    pub test_case_id: i64,
    pub case_number: i32,
    pub display_input: String,
    pub expected_output: String,
    pub actual_output: Option<String>,
    pub passed: bool,
    pub error_message: Option<String>,
    pub execution_time_ms: u64,
    pub is_hidden: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecutionOutcome {
    pub status: String,
    pub compiled: bool,
    pub compiler_output: String,
    pub diagnostics: Vec<CompilerDiagnostic>,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
    pub execution_time_ms: u64,
    pub timed_out: bool,
    pub output_truncated: bool,
    pub passed_count: usize,
    pub total_count: usize,
    pub test_results: Vec<TestCaseResultDto>,
}
