// Law Enforcement Security Audit & Access Control Types

export type LawEnforcementRole =
  | "INVESTIGATOR"
  | "CYBER_ANALYST"
  | "INTELLIGENCE_ANALYST"
  | "SUPERVISOR"
  | "AUDITOR"
  | "SYSTEM_ADMIN";

export type UserRole = LawEnforcementRole;

export type AuditActionType =
  | "LOGIN"
  | "LOGOUT"
  | "CASE_OPENED"
  | "EVIDENCE_VIEWED"
  | "EVIDENCE_EXPORTED"
  | "FIR_ACCESSED"
  | "CDR_ACCESSED"
  | "GRAPH_QUERIED"
  | "AI_ANALYSIS_EXECUTED"
  | "MODEL_RESULT_REVIEWED"
  | "PERMISSIONS_CHANGED"
  | "EVIDENCE_INTEGRITY_VERIFIED"
  | "SUBPOENA_GENERATED";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  analystName: string;
  role: LawEnforcementRole;
  action: AuditActionType;
  resourceType: string;
  resourceId: string;
  caseId: string;
  result: "SUCCESS" | "DENIED" | "FLAGGED_ANOMALY";
  sourceIp: string;
  userAgent: string;
  eventHash: string;
  previousHash: string; // Append-only cryptographic link
}

export interface UserSessionProfile {
  id: string;
  badgeNumber: string;
  name: string;
  rank: string;
  role: LawEnforcementRole;
  clearanceLevel: "TOP_SECRET_LEO" | "CONFIDENTIAL_STATE" | "RESTRICTED";
  jurisdiction: string;
  assignedCases: string[];
  activeCaseId: string;
  sessionTokenExpiry: string;
  ipAddress: string;
}
