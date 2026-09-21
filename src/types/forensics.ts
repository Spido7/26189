export type EntityType =
  | "Criminal_IP"
  | "Device_MAC"
  | "PhoneNumber"
  | "Person"
  | "FIR"
  | "Cellular_BTS"
  | "BTC_Wallet";

export type ThreatLevel = "CRITICAL" | "HIGH" | "ELEVATED" | "MEDIUM" | "LOW" | "INFORMATIONAL";

export interface ForensicHashes {
  md5?: string;
  sha256?: string;
  ja3Tls?: string;
  ssdeep?: string;
  [key: string]: string | undefined;
}

export interface NetworkMetadata {
  asnOrg?: string;
  rDns?: string;
  portMatrix?: string;
  ipAddress?: string;
  macAddress?: string;
  protocol?: string;
  [key: string]: string | undefined;
}

export interface TelephonyMetadata {
  imei?: string;
  imsi?: string;
  callDuration?: string;
  carrier?: string;
  cellLacCid?: string;
  azimuth?: string;
  [key: string]: string | undefined;
}

export interface GeoTelemetry {
  coordinates?: string;
  locationName?: string;
  confidenceRadius?: string;
  method?: string;
  [key: string]: string | undefined;
}

export interface LegalMetadata {
  penalCode?: string;
  custodySeal?: string;
  firNumber?: string;
  policeStation?: string;
  caseRef?: string;
  [key: string]: string | undefined;
}

export interface HexByteRow {
  offset: string;
  bytesHex1: string;
  bytesHex2: string;
  ascii: string;
  threatOffset?: boolean;
}

export interface ForensicNode {
  id: string;
  type: EntityType;
  title: string;
  subtitle: string;
  identifier: string;
  threatLevel: ThreatLevel;
  cvssScore?: number;
  status: "ACTIVE" | "QUARANTINED" | "INSPECTED" | "FLAGGED" | "PENDING";
  lastActive: string;
  xPercent?: number;
  yPercent?: number;
  degreeCount?: number;
  caseRef?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  hashes?: ForensicHashes;
  network?: NetworkMetadata;
  telephony?: TelephonyMetadata;
  geo?: GeoTelemetry;
  legal?: LegalMetadata;
  hexDump?: HexByteRow[];
  extraMeta?: Record<string, string>;
  [key: string]: any;
}

export interface ForensicEdge {
  id: string;
  source: string | ForensicNode;
  target: string | ForensicNode;
  fromId?: string;
  toId?: string;
  label: string;
  style?: "solid" | "dashed" | "glowing";
  colorType?: "threat" | "telecom" | "record" | "accused" | "neutral";
  confidence?: string;
  [key: string]: any;
}

export interface GraphData {
  nodes: ForensicNode[];
  links: ForensicEdge[];
}

export type GraphLayoutMode = "forceAtlas2" | "hierarchical" | "radial";
