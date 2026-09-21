// AI Investigation Engine Types - 3-Stage Deep Learning & Explainability

export type AIPipelineStage =
  | "STAGE_1_CYBER_TELEMETRY"
  | "STAGE_2_BEHAVIOR_NETWORK"
  | "STAGE_3_RISK_FUSION";

export type HumanReviewDecision =
  | "CONFIRM_INVESTIGATIVE_LEAD"
  | "MARK_INCORRECT"
  | "NEEDS_MORE_EVIDENCE"
  | "ESCALATE_TO_SUPERVISOR";

export interface FeatureContribution {
  featureName: string;
  weight: number; // e.g. +24
  category: "NETWORK_ANOMALY" | "TEMPORAL" | "IDENTITY_COLLISION" | "PROTOCOL" | "RELATIONAL";
  explanation: string;
}

export interface AIAssessmentRecord {
  id: string;
  targetEntityId: string;
  targetIdentifier: string; // e.g. "115.112.45.12"
  caseRef: string;
  modelVersion: string; // e.g. "CyberGraph-DL-v3.4"
  inferenceTimestamp: string;
  latencyMs: number;
  stage1Output: {
    anomalyScore: number;
    reconstructionLoss: number;
    packetCount: number;
    protocolEntropy: number;
    status: "COMPLETE" | "PROCESSING" | "NOMINAL";
  };
  stage2Output: {
    predictedClassification: string;
    softmaxProbability: number;
    subgraphCentralityScore: number;
    status: "COMPLETE" | "PROCESSING";
  };
  stage3Output: {
    fusedRiskScore: number; // 0 - 100
    confidencePercentage: number; // 0 - 100%
    preliminaryFinding: string;
    status: "COMPLETE" | "PENDING_REVIEW";
  };
  featureContributions: FeatureContribution[];
  humanReview?: {
    reviewedBy: string;
    reviewTimestamp: string;
    decision: HumanReviewDecision;
    notes: string;
    evidenceLinkedIds: string[];
  };
}
