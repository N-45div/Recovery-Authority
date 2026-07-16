use std::collections::BTreeMap;

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
pub struct RecoveryOperation {
    pub id: String,
    pub kind: String,
    pub status: RecoveryStatus,
    pub paths: Vec<String>,
    pub reason: String,
    pub proof_digest: String,
    pub state_witness: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub committed_at: Option<DateTime<Utc>>,
    pub recovered_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct OperationLedger {
    pub operations: BTreeMap<String, RecoveryOperation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HookFinding {
    pub category: String,
    pub executable: String,
    pub reason: String,
    pub adapter_available: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HookEvent {
    pub timestamp: DateTime<Utc>,
    pub session_id: Option<String>,
    pub turn_id: Option<String>,
    pub cwd: String,
    pub tool_name: String,
    pub command_digest: Option<String>,
    pub blocked: bool,
    pub findings: Vec<HookFinding>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_hook_receipt_without_command_text() {
        let event: HookEvent = serde_json::from_str(
            r#"{"timestamp":"2026-07-16T00:00:00Z","sessionId":"s1","turnId":"t1","cwd":"/repo","toolName":"Bash","commandDigest":"abc","blocked":true,"findings":[{"category":"filesystem.delete","executable":"rm","reason":"rm removes state","adapterAvailable":true}]}"#,
        )
        .expect("valid hook event");
        assert!(event.blocked);
        assert_eq!(event.findings[0].category, "filesystem.delete");
    }
}
