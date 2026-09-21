export type DLStage =
  | "INGESTED"
  | "MODEL_1_ANOMALY"
  | "MODEL_2_CRIME"
  | "MODEL_3_VERIFY"
  | "FLAGGED"
  | "CLEARED";

export type ThreatClassification =
  | "C2_TUNNEL_BEACON"
  | "DATA_EXFILTRATION"
  | "CREDENTIAL_STUFFING"
  | "RANSOMWARE_PROPAGATION"
  | "TOR_EXIT_ROUTING"
  | "PORT_SCAN_RECON"
  | "BENIGN_TELEMETRY"
  | "CLEARED_TRAFFIC";

export interface ModelStageTelemetry {
  stage1Anomaly?: {
    anomalyScore: number; // 0.00 to 1.00
    reconstructionLoss: number;
    latencyMs: number;
    isAnomalous: boolean;
    evaluatedAt: string;
  };
  stage2Crime?: {
    predictedCrime: ThreatClassification;
    softmaxProbability: number;
    secondaryClass?: string;
    featureWeights: Record<string, number>;
    evaluatedAt: string;
  };
  stage3Ensemble?: {
    ensembleRiskScore: number; // 0 to 100
    bayesianConfidence: number; // 0 to 100%
    threatIntelMatch: boolean;
    finalVerdict: "CONFIRMED_THREAT" | "CLEARED_BENIGN";
    evaluatedAt: string;
  };
}

export interface StreamNode {
  id: string;
  ip: string;
  mac: string;
  subnet: string;
  stage: DLStage;
  crimeType?: ThreatClassification | string;
  confidence?: number;
  flagged: boolean;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  
  // High-value threat intelligence metadata & Canvas labels
  name?: string;
  accusedName?: string;
  ispDhcp?: string;
  location?: string;
  threatType?: ThreatClassification | string;
  state?: "INGESTING" | "FLAGGED";
  isFadingOut?: boolean;
  fadeOpacity?: number;

  // 3-Panel Inspection Data
  personalInfo?: {
    aadharVoterId: string;
    fullName: string;
    demography: { age: number | string; sex: string; location: string };
    contactDetails: { phone: string; email: string; altPhone?: string };
    occupation: string;
    nexusAffiliation: string;
  };
  firDetails?: {
    firId: string;
    firDate: string;
    policeStation: string;
    crpcSection: string;
    statusOfCharges: string;
    firCopy: {
      documentNumber: string;
      filingOfficer: string;
      ledgerHash: string;
      summaryText: string;
      certifiedSeal: string;
    };
  };
  cdrDetails?: {
    callerIdNumber: string;
    receiverIdNumber: string;
    callTypeAndDuration: string;
    towerLocation: string;
    records?: Array<{
      timestamp: string;
      caller: string;
      receiver: string;
      callType: string;
      duration: string;
      tower: string;
    }>;
  };

  // Forensic extracted telemetry
  asnOrg?: string;
  country?: string;
  countryCode?: string;
  portMatrix?: string;
  protocol?: string;
  bytesTransferred?: string;
  timestamp: string;
  ja3Fingerprint?: string;
  sha256Hash?: string;
  md5Hash?: string;
  geoCoords?: string;
  
  // Deep Learning pipeline telemetry
  modelTelemetry?: ModelStageTelemetry;
  stageLogs?: { stage: DLStage; message: string; timestamp: string }[];
  
  // Dynamic cluster identifier
  clusterId?: string;
  [key: string]: any;
}

export interface StreamLink {
  id?: string;
  source: string | StreamNode;
  target: string | StreamNode;
  relationship: "SHARED_SUBNET" | "SHARED_MAC_INTERFACE" | "ROUTED_C2_FLOW" | string;
  color?: string;
  confidence?: string;
  [key: string]: any;
}

export interface StreamMetrics {
  totalIngested: number;
  activeInPipeline: number;
  confirmedThreats: number;
  clearedBenign: number;
  activeClusters: number;
  currentTps: number;
}
