// DFIR Evidence & Chain of Custody Types

export type EvidenceFormat =
  | "PCAP"
  | "ZEEK_LOG"
  | "SURICATA_EVE"
  | "SYSLOG"
  | "JSON"
  | "CSV"
  | "NETFLOW"
  | "MEMORY_DUMP"
  | "DISK_IMAGE"
  | "CDR_EXCEL"
  | "MOBILE_EXTRACTION"
  | "WARRANT_PANCHNAMA";

export type IntegrityVerificationState =
  | "VERIFIED"
  | "TAMPER_SUSPECTED"
  | "PENDING_VERIFICATION"
  | "HASH_MISMATCH";

export interface CustodyTransferRecord {
  step: number;
  action: "ACQUIRED" | "HASHED" | "TRANSFERRED" | "ANALYZED" | "VERIFIED" | "PRESENTED_TO_COURT";
  officerName: string;
  badgeNumber: string;
  organization: string;
  timestamp: string;
  notes: string;
  digitalSignature?: string;
}

export interface DFIREvidenceItem {
  id: string;
  caseId: string;
  title: string;
  format: EvidenceFormat;
  sourceDevice: string;
  seizureLocation: string;
  sizeBytes: number;
  sizeFormatted: string;
  sha256Hash: string;
  md5Hash?: string;
  acquiredAt: string;
  seizingOfficer: string;
  custodyStatus: "IN_VAULT" | "CHECKED_OUT_LAB" | "COURT_CUSTODY" | "ARCHIVED";
  integrityState: IntegrityVerificationState;
  blockchainAnchor?: {
    ledgerNetwork: string; // e.g. "Gov-Hyperledger-Fabric-Node-4" or "Ethereum-Private-Rollup"
    blockNumber: number;
    transactionHash: string;
    blockTimestamp: string;
    verifiedOnChain: boolean;
    isSimulated: boolean;
  };
  custodyChain: CustodyTransferRecord[];
  tags: string[];
}
