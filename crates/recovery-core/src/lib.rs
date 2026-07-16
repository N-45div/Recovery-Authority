use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum RecoveryStatus {
    Proven,
    Committed,
    Recovered,
    Expired,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecoveryOperationSummary {
    pub id: String,
    pub kind: String,
    pub status: RecoveryStatus,
    pub paths: Vec<String>,
    pub proof_digest: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}
