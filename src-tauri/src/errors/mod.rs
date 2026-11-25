use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("No Java Development Kit (JDK) detected. Please install JDK 17+ or select a JDK folder in Settings.")]
    JdkNotFound,

    #[error("Invalid JDK path: {0}")]
    InvalidJdkPath(String),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Java execution failed: {0}")]
    ExecutionError(String),

    #[error("Storage error: {0}")]
    StorageError(String),

    #[error("I/O error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
}

#[derive(Debug, Serialize)]
struct SerializedError<'a> {
    code: &'static str,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    details: Option<&'a str>,
}

impl AppError {
    pub fn code(&self) -> &'static str {
        match self {
            Self::JdkNotFound => "JDK_NOT_FOUND",
            Self::InvalidJdkPath(_) => "INVALID_JDK_PATH",
            Self::ValidationError(_) => "VALIDATION_ERROR",
            Self::ExecutionError(_) => "EXECUTION_ERROR",
            Self::StorageError(_) => "STORAGE_ERROR",
            Self::IoError(_) => "IO_ERROR",
            Self::SerializationError(_) => "SERIALIZATION_ERROR",
        }
    }
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        SerializedError {
            code: self.code(),
            message: self.to_string(),
            details: None,
        }
        .serialize(serializer)
    }
}
