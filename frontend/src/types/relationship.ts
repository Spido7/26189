// DFIR Relationship Types - Edge Correlations in Knowledge Graph

export type RelationshipCategory =
  | "OBSERVED"
  | "ASSOCIATED_WITH"
  | "REGISTERED_TO"
  | "COMMUNICATED_WITH"
  | "USED_DURING"
  | "APPEARS_IN"
  | "LOCATED_AT"
  | "RESOLVES_TO"
  | "SHARED_DEVICE"
  | "CO_ACCUSED_IN"
  | "ROUTED_TRAFFIC"
  | "MULE_ACCOUNT_FOR"
  | "TRANSFERRED_FUNDS";

export type EvidenceOrigin =
  | "OBSERVED_NETWORK_DATA"
  | "PROVIDER_DERIVED_DATA"
  | "DATABASE_CORRELATION"
  | "AI_INFERENCE"
  | "HUMAN_INVESTIGATOR_CONCLUSION"
  | "JUDICIAL_FIR_RECORD";

export interface DFIRRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  category: RelationshipCategory;
  label: string;
  confidence: number; // 0 - 100%
  provenance: EvidenceOrigin;
  sourceDescription: string;
  evidenceRefId?: string;
  authorizationContext?: string; // e.g. "CrPC Sec 91 Subpoena", "MHA 5(2) Intercept Warrant"
  firstObserved: string;
  lastObserved: string;
  isConfirmedByAnalyst?: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
  attributes?: Record<string, string | number | boolean>;
}
