use std::collections::BTreeMap;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum RecoveryStatus {
    Proven,
    Committing,
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
#[serde(rename_all = "kebab-case")]
pub enum ManifestStatus {
    Prepared,
    Committing,
    Committed,
    Recovering,
    Recovered,
    Compensated,
    PartiallyRecovered,
    Failed,
    Expired,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ManifestBinding {
    pub operation_id: String,
    pub kind: String,
    pub scope: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecoveryManifest {
    pub id: String,
    pub status: ManifestStatus,
    pub reason: String,
    pub bindings: Vec<ManifestBinding>,
    pub proof_digest: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub committed_operation_ids: Vec<String>,
    pub recovered_operation_ids: Vec<String>,
    pub outstanding_operation_ids: Vec<String>,
    pub failure: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ManifestLedger {
    pub manifests: BTreeMap<String, RecoveryManifest>,
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
pub struct ManifestAuthorizationRecord {
    pub manifest_id: String,
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
    #[serde(default)]
    pub event: Option<String>,
    pub session_id: Option<String>,
    pub turn_id: Option<String>,
    #[serde(default)]
    pub agent_id: Option<String>,
    #[serde(default)]
    pub agent_type: Option<String>,
    #[serde(default)]
    pub permission_mode: Option<String>,
    #[serde(default)]
    pub model: Option<String>,
    pub cwd: String,
    pub tool_name: Option<String>,
    pub command_digest: Option<String>,
    pub blocked: bool,
    pub findings: Vec<HookFinding>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecoveryPosture {
    pub level: String,
    pub hook_observed: bool,
    pub independent_authority: bool,
    pub platform: String,
    pub exact_adapters: Vec<String>,
    pub limitations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsequenceNode {
    pub id: String,
    pub kind: String,
    pub label: String,
    pub state: String,
    #[serde(default)]
    pub attributes: BTreeMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsequenceEdge {
    pub id: String,
    pub from: String,
    pub to: String,
    pub relation: String,
    pub state: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsequenceGraph {
    pub schema_version: u32,
    pub generated_at: Option<DateTime<Utc>>,
    pub posture: RecoveryPosture,
    pub nodes: Vec<ConsequenceNode>,
    pub edges: Vec<ConsequenceEdge>,
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

    #[test]
    fn parses_subagent_lifecycle_receipt_without_a_tool_call() {
        let event: HookEvent = serde_json::from_str(
            r#"{"timestamp":"2026-07-16T00:00:00Z","event":"SubagentStart","sessionId":"parent","turnId":"child-turn","agentId":"worker-42","agentType":"worker","permissionMode":"bypassPermissions","model":"gpt-test","cwd":"/repo","toolName":null,"commandDigest":null,"blocked":false,"findings":[]}"#,
        )
        .expect("valid subagent event");
        assert_eq!(event.event.as_deref(), Some("SubagentStart"));
        assert_eq!(event.agent_id.as_deref(), Some("worker-42"));
        assert_eq!(event.tool_name, None);
    }

    #[test]
    fn parses_living_consequence_graph_without_capabilities() {
        let graph: ConsequenceGraph = serde_json::from_str(
            r#"{"schemaVersion":1,"generatedAt":"2026-07-18T00:00:00Z","posture":{"level":"degraded","hookObserved":true,"independentAuthority":false,"platform":"linux","exactAdapters":["filesystem.delete"],"limitations":["host sandbox"]},"nodes":[{"id":"operation:1","kind":"operation","label":"filesystem.delete","state":"proven","attributes":{"operationId":"1"}}],"edges":[]}"#,
        )
        .expect("valid consequence graph");
        assert_eq!(graph.posture.level, "degraded");
        assert_eq!(graph.nodes[0].kind, "operation");
        assert!(!graph.nodes[0].attributes.contains_key("capability"));
    }

    #[test]
    fn parses_partially_recovered_manifest_without_capabilities() {
        let manifest: RecoveryManifest = serde_json::from_str(
            r#"{"id":"33333333-3333-4333-8333-333333333333","status":"partially-recovered","reason":"two effects","bindings":[{"operationId":"11111111-1111-4111-8111-111111111111","kind":"filesystem.delete","scope":["filesystem:/repo/a"]},{"operationId":"22222222-2222-4222-8222-222222222222","kind":"sqlite.mutate","scope":["filesystem:/repo/app.db"]}],"proofDigest":"manifest-proof","createdAt":"2026-07-18T00:00:00Z","expiresAt":"2026-07-18T00:05:00Z","committedOperationIds":["11111111-1111-4111-8111-111111111111"],"recoveredOperationIds":[],"outstandingOperationIds":["11111111-1111-4111-8111-111111111111"],"failure":"live state changed","capability":"ignored"}"#,
        )
        .expect("valid manifest");
        assert_eq!(manifest.status, ManifestStatus::PartiallyRecovered);
        assert_eq!(manifest.outstanding_operation_ids.len(), 1);
    }
}
