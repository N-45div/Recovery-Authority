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

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AuthorizationStatus {
    Pending,
    Approved,
    Expired,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthorizationRecord {
    pub operation_id: String,
    pub status: AuthorizationStatus,
    pub proof_digest: String,
    pub requested_at: DateTime<Utc>,
    pub approved_at: Option<DateTime<Utc>>,
    pub expires_at: DateTime<Utc>,
    pub approval_digest: Option<String>,
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

    #[test]
    fn parses_human_authorization_without_exposing_capability() {
        let authorization: AuthorizationRecord = serde_json::from_str(
            r#"{"operationId":"11111111-1111-4111-8111-111111111111","status":"approved","proofDigest":"proof","requestedAt":"2026-07-16T00:00:00Z","approvedAt":"2026-07-16T00:01:00Z","expiresAt":"2026-07-16T00:05:00Z","approvalDigest":"approval","capability":"ignored"}"#,
        )
        .expect("valid authorization record");
        assert_eq!(authorization.status, AuthorizationStatus::Approved);
        assert_eq!(authorization.approval_digest.as_deref(), Some("approval"));
    }
}
