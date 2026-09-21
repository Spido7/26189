import { ForensicEdge, ForensicNode, GraphData } from "@/types/forensics";

export const MOCK_FORENSIC_NODES: ForensicNode[] = [
  {
    id: "node-tor-ip",
    type: "Criminal_IP",
    title: "185.220.101.5",
    subtitle: "Tor Exit Relay // AS200052",
    identifier: "CRIMINAL_IP // 185.220.101.5",
    threatLevel: "CRITICAL",
    cvssScore: 9.8,
    status: "ACTIVE",
    lastActive: "2024-10-24 03:14:22 UTC",
    caseRef: "FIR-2024-8842",
    hashes: {
      md5: "e99a18c428cb38d5f260853678922e03",
      sha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      ja3Tls: "771,4865-4866-4867,0-23-65281-10-11,29-23-24,0",
      ssdeep: "12288:j65NkxW8yG0m4Pz0Q8aRk7+uP4kKqfT",
    },
    network: {
      asnOrg: "AS200052 - Flokinet Iceland",
      rDns: "exit-relay-4.tor-node.is",
      portMatrix: "80/TCP, 443/TCP, 9001/TCP [TOR]",
      ipAddress: "185.220.101.5",
      protocol: "TCP/TLSv1.3",
    },
    telephony: {
      imei: "356938035643809",
      imsi: "404450123456789",
      callDuration: "14m 32s / Encrypted VoLTE",
      carrier: "AirTel VoLTE Gateway",
    },
    geo: {
      coordinates: "64.1466° N, 21.9426° W (IS)",
      locationName: "Reykjavik, Iceland",
      confidenceRadius: "± 450m via Cell Triangulation",
      method: "MaxMind GeoIP2 ISP City + BGP Peer",
    },
    legal: {
      penalCode: "IT Act Sec 66C/66D, IPC 420",
      custodySeal: "SHA-256 Verified Ledger #0x99A",
      firNumber: "FIR-2024-8842",
      policeStation: "Cyber Crime Police Station Bangalore",
      caseRef: "CCPS/CR/8842/2024",
    },
    hexDump: [
      {
        offset: "00000000",
        bytesHex1: "4500 003c 1a2b 4000",
        bytesHex2: "4006 b2a1 b9dc 6505",
        ascii: "|E..<.+@.@...e.|",
      },
      {
        offset: "00000010",
        bytesHex1: "c0a8 0164 2329 0050",
        bytesHex2: "0000 0000 0000 0000",
        ascii: "|...d#).P........|",
      },
      {
        offset: "00000020",
        bytesHex1: "a002 7210 f14a 0000",
        bytesHex2: "0204 05b4 0402 080a",
        ascii: "|..r..J..........|",
        threatOffset: true,
      },
    ],
  },
  {
    id: "node-device-mac",
    type: "Device_MAC",
    title: "00:1A:2B:6F:43:89",
    subtitle: "IMEI: 356938035643809",
    identifier: "DEVICE_MAC // 00:1A:2B:6F:43:89",
    threatLevel: "HIGH",
    cvssScore: 8.9,
    status: "FLAGGED",
    lastActive: "2024-10-24 03:10:04 UTC",
    caseRef: "FIR-2024-8842",
    network: {
      macAddress: "00:1A:2B:6F:43:89",
      asnOrg: "Realtek Semiconductor OUI",
      ipAddress: "192.168.1.104 (LAN Leased)",
      protocol: "802.11ax / WPA3-Personal",
    },
    telephony: {
      imei: "356938035643809",
      carrier: "OnePlus 11 5G (OxygenOS 14)",
      callDuration: "38 Connected Sessions",
    },
    legal: {
      penalCode: "Sec 66 (Hacking computer systems)",
      custodySeal: "Hardware Seizure Seal #HZ-8812",
      firNumber: "FIR-2024-8842",
    },
  },
  {
    id: "node-burner-sim",
    type: "PhoneNumber",
    title: "+1-843-555-0194",
    subtitle: "IMSI: 404450123456789",
    identifier: "PHONE // +1-843-555-0194 [VOIP/BURNER]",
    threatLevel: "HIGH",
    cvssScore: 8.2,
    status: "ACTIVE",
    lastActive: "2024-10-24 01:12:00 UTC",
    caseRef: "FIR-2024-8842",
    telephony: {
      imei: "356938035643809",
      imsi: "404450123456789",
      callDuration: "14 CDR sessions logged",
      carrier: "Telco International Roaming",
      cellLacCid: "LAC:4120 / CID:8934",
    },
    geo: {
      coordinates: "12.9698° N, 77.5912° E",
      locationName: "Tower Sector 3, MG Road",
      confidenceRadius: "± 200m",
    },
    legal: {
      penalCode: "IT Act Sec 66D (Cheating by Impersonation)",
      firNumber: "FIR-2024-8842",
    },
  },
  {
    id: "node-suspect",
    type: "Person",
    title: "A. RAHMAN",
    subtitle: "SUBJ_9042 // AADHAAR_REF",
    identifier: "PERSON // A. RAHMAN [TARGET_ALPHA]",
    threatLevel: "CRITICAL",
    cvssScore: 9.4,
    status: "FLAGGED",
    lastActive: "2024-10-24 02:45:10 UTC",
    caseRef: "FIR-2024-8842",
    hashes: {
      md5: "4c6d3f28991b37c09e861d9a2b7194f2",
      sha256: "b10a6d83961dd3c1ac88b59b2dc327aa48f434346648f6b96df89dda901c5176",
    },
    telephony: {
      imei: "356938035643809",
      imsi: "404450123456789",
      callDuration: "38 Calls / 4hr 12m Aggregated",
      carrier: "Dual SIM (Telco A + Telco B)",
    },
    geo: {
      coordinates: "12.9716° N, 77.5946° E (IN)",
      locationName: "Indiranagar, Bengaluru, KA",
      confidenceRadius: "± 80m BTS Azimuth Cone",
    },
    legal: {
      penalCode: "IT Act Sec 66, 66C, 66D, IPC 419, 420",
      custodySeal: "Custody Form Form-V Verified",
      firNumber: "FIR-2024-8842",
      policeStation: "Bangalore Cyber Division",
    },
  },
  {
    id: "node-fir-doc",
    type: "FIR",
    title: "FIR-2024-8842",
    subtitle: "IT Act 66C / IPC 420",
    identifier: "LEGAL_RECORD // FIR-2024-8842",
    threatLevel: "MEDIUM",
    cvssScore: 6.5,
    status: "ACTIVE",
    lastActive: "2024-10-23 18:20:00 UTC",
    caseRef: "FIR-2024-8842",
    legal: {
      firNumber: "FIR-2024-8842-CCPS",
      penalCode: "IT Act Sec 66C/66D, IPC 420, 120B",
      policeStation: "Cyber Crime Police Station, Central Range",
      custodySeal: "Judicial Magistrate Stamp Ver. 2.1",
      caseRef: "STATE vs RAHMAN & ORS.",
    },
  },
];

export const MOCK_FORENSIC_EDGES: ForensicEdge[] = [
  {
    id: "edge-1",
    source: "node-tor-ip",
    target: "node-device-mac",
    fromId: "node-tor-ip",
    toId: "node-device-mac",
    label: "ROUTED_TRAFFIC",
    style: "solid",
    colorType: "threat",
    confidence: "98.7%",
  },
  {
    id: "edge-2",
    source: "node-device-mac",
    target: "node-burner-sim",
    fromId: "node-device-mac",
    toId: "node-burner-sim",
    label: "ASSOCIATED_DEVICE",
    style: "solid",
    colorType: "telecom",
    confidence: "96.4%",
  },
  {
    id: "edge-3",
    source: "node-burner-sim",
    target: "node-suspect",
    fromId: "node-burner-sim",
    toId: "node-suspect",
    label: "REGISTERED_TO",
    style: "solid",
    colorType: "accused",
    confidence: "99.2%",
  },
  {
    id: "edge-4",
    source: "node-suspect",
    target: "node-fir-doc",
    fromId: "node-suspect",
    toId: "node-fir-doc",
    label: "NAMED_ACCUSED",
    style: "solid",
    colorType: "record",
    confidence: "OFFICIAL_FIR",
  },
];

export const INITIAL_GRAPH_DATA: GraphData = {
  nodes: MOCK_FORENSIC_NODES,
  links: MOCK_FORENSIC_EDGES,
};

export const MOCK_NODES = MOCK_FORENSIC_NODES;
export const MOCK_EDGES = MOCK_FORENSIC_EDGES;

export const ENTITY_COUNTS: Record<string, number> = {
  Criminal_IP: 42,
  Device_MAC: 18,
  PhoneNumber: 65,
  Person: 12,
  FIR: 4,
};

export const ACTIVE_CASES = [
  { id: "ALL", label: "ALL 3 SYNDICATES", tag: "ALL HUBS", active: true },
  { id: "FIR-0104/2026", label: "FIR-0104/2026 [BKC MUMBAI]", tag: "JAMTARA", active: false },
  { id: "FIR-2024-8842", label: "FIR-2024-8842 [BLR CYBER]", tag: "HAWALA", active: false },
  { id: "FIR-7719/2026", label: "FIR-7719/2026 [CBI DELHI]", tag: "EXTORTION", active: false },
];

