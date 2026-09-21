// Core DFIR Entity Types - Law Enforcement Investigation Data Model

export type EntityCategory =
  | "PERSON"
  | "IP"
  | "PHONE"
  | "DEVICE"
  | "FIR"
  | "CASE"
  | "LOCATION"
  | "ORGANIZATION"
  | "DOMAIN"
  | "TRANSACTION"
  | "EVENT"
  | "EVIDENCE";

export type RiskLevel = "CRITICAL" | "HIGH" | "ELEVATED" | "NOMINAL" | "UNKNOWN";

export interface GeoLocation {
  latitude?: number;
  longitude?: number;
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
  accuracyRadiusMeters?: number;
}

export interface TelecomMetadata {
  imei?: string;
  imsi?: string;
  msisdn?: string;
  carrier?: string;
  circle?: string;
  simType?: "PREPAID" | "POSTPAID" | "ESIM" | "UNKNOWN";
  kycStatus?: "VERIFIED" | "SUSPICIOUS" | "FORGED" | "UNVERIFIED";
}

export interface NetworkHostMetadata {
  ipAddress: string;
  asn?: string;
  asnOrg?: string;
  isp?: string;
  subnet?: string;
  reverseDns?: string;
  countryCode?: string;
  openPorts?: number[];
  firstObserved?: string;
  lastObserved?: string;
  threatIntelCategory?: string;
}

export interface DFIRNodeEntity {
  id: string;
  category: EntityCategory;
  primaryLabel: string;
  secondaryLabel: string;
  identifier: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  confidence: number; // 0 - 100
  caseRef: string;
  syndicateGroup?: "JAMTARA_MUMBAI" | "HAWALA_BENGALURU" | "EXTORTION_DELHI" | string;
  status: "ACTIVE" | "MONITORED" | "SUBPOENAED" | "RESOLVED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  tags: string[];
  
  // Specific Metadata Sub-objects
  networkMeta?: NetworkHostMetadata;
  telecomMeta?: TelecomMetadata;
  geoMeta?: GeoLocation;
  demographicMeta?: {
    fullName?: string;
    alias?: string;
    age?: number;
    gender?: string;
    residence?: string;
    aadhaarRef?: string; // [Aadhaar Redacted]
    occupation?: string;
  };
  customAttributes?: Record<string, string | number | boolean>;
}
