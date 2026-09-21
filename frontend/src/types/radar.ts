export type RadarNodeState = "INGESTING" | "FLAGGED";

export type BackgroundDLStage =
  | "INITIAL_INGEST"
  | "MODEL_1_ANOMALY"
  | "MODEL_2_CRIME"
  | "MODEL_3_VERIFY"
  | "FLAGGED_THREAT"
  | "CLEARED_BENIGN";

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
    predictedCrime: ThreatClassification | string;
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

export interface PersonalInfo {
  aadharVoterId: string; // Generic placeholder e.g. [Aadhaar Redacted]
  fullName: string;
  demography: {
    age?: number | string;
    sex?: string;
    location?: string;
    text?: string;
  };
  contactDetails: {
    phone: string;
    email: string;
    altPhone?: string;
  };
  occupation: string;
  syndicateAffiliation?: string;
  nexusAffiliation?: string;
  knownAssociates?: string;
}

export interface FIRDetails {
  firId: string;
  firDate: string;
  policeStation: string;
  crpcSection: string;
  crpcBnsSection?: string;
  statusOfCharges: string;
  accusedList?: string;
  firCopy: {
    documentNumber: string;
    filingOfficer: string;
    ledgerHash: string;
    summaryText: string;
    certifiedSeal: string;
  };
}

export interface CDRCallRecord {
  direction?: "OUTGOING" | "INCOMING" | string;
  caller: string;
  receiver: string;
  callType: string;
  duration: string;
  tower: string;
  timestamp?: string;
}

export interface CDRDetails {
  targetId?: string;
  callerIdNumber: string;
  receiverIdNumber: string;
  callTypeAndDuration: string;
  towerLocation: string;
  records?: CDRCallRecord[];
}

export interface RadarNode {
  id: string;
  ip: string;
  mac: string;
  subnet: string;
  state: RadarNodeState; // "INGESTING" | "FLAGGED"
  flagged: boolean;
  
  // High-value threat intelligence metadata & Canvas display labels
  name?: string;
  accusedName?: string;
  ispDhcp?: string;
  location?: string;
  threatType?: ThreatClassification | string;
  crimeType?: ThreatClassification | string; // alias for compatibility
  confidence?: number;

  // 3-Panel Inspection Data
  personalInfo?: PersonalInfo;
  firDetails?: FIRDetails;
  cdrDetails?: CDRDetails;
  
  // Background DL stage progression (not cluttering graph)
  backgroundStage?: BackgroundDLStage;
  stage?: string; // alias for compatibility with existing views
  
  // Zero-noise fade animation state
  isFadingOut?: boolean;
  fadeOpacity?: number;
  ingressTimestamp?: number;
  
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
  
  // Deep Learning pipeline telemetry & audit logs
  modelTelemetry?: ModelStageTelemetry;
  stageLogs?: { stage: string; message: string; timestamp: string }[];
  
  // Simulation targets
  isThreatTarget?: boolean;
  expectedCrimeTarget?: ThreatClassification;
  expectedConfidenceTarget?: number;
  anomalyScoreTarget?: number;
  
  // D3-force simulation coordinates
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  
  [key: string]: any;
}

export interface RadarLink {
  id?: string;
  source: string | RadarNode;
  target: string | RadarNode;
  relationship: "SHARED_MAC" | "CO_SUBNET" | "SHARED_MAC_HARDWARE" | "SHARED_SUBNET_CIDR" | "ROUTED_TRAFFIC" | string;
  sharedAttribute?: "MAC" | "SUBNET" | string;
  label?: string;
  color?: string;
  confidence?: string;
  waveOffset?: number;
  [key: string]: any;
}

export interface RadarMetrics {
  totalIngested: number;
  activeIngesting: number;
  confirmedThreats: number;
  clearedBenign: number;
  activeLinks: number;
  currentTps: number;
}

export interface StreamStateInfo {
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  queueIndex: number;
  maxQueue: number;
  metrics: RadarMetrics;
  flaggedNodes: RadarNode[];
}

export interface RadarStreamHandle {
  focusNode: (nodeId: string) => void;
  focusSyndicate?: (syndicateKey: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  resetSimulation: () => void;
  getSnapshot: () => { nodes: RadarNode[]; links: RadarLink[] };
  streamNext: () => void;
  togglePlay: () => void;
  setSpeed: (speed: 1 | 2 | 5) => void;
  resetStream: () => void;
}
