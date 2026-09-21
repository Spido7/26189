"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import {
  Radio,
  Search,
  ShieldAlert,
  GitMerge,
  ArrowRight,
  Server,
  Globe,
  Clock,
  Layers,
  Database,
  FileCheck,
  UserCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  Cpu,
  Fingerprint,
  Lock,
} from "lucide-react";
import { MOCK_CASES, MOCK_AI_ASSESSMENTS } from "@/data/dfir-mock-database";

interface IPProfile {
  ip: string;
  cidr: string;
  domain: string;
  hostname: string;
  asn: string;
  isp: string;
  country: string;
  countryCode: string;
  networkType: string;
  protocol: string;
  observedPorts: string;
  firstSeen: string;
  lastSeen: string;
  trafficVolume: string;
  caseAssociation: string;
  riskAssessment: {
    score: number;
    confidence: number;
    level: "HIGH" | "ELEVATED" | "MODERATE" | "LOW";
    status: "INVESTIGATIVE_LEAD_CONFIRMED" | "UNDER_ASSESSMENT" | "INCONCLUSIVE";
    classification: string;
    anomalyIndicators: string[];
    ethicalDisclaimer: string;
  };
  entityResolutionChain: {
    step: string;
    stageTitle: string;
    category: "OBSERVED_NETWORK_DATA" | "PROVIDER_DERIVED" | "DATABASE_CORRELATION" | "AI_INFERENCE" | "HUMAN_LEGAL_CONCLUSION";
    entityName: string;
    details: string;
    source: string;
    timestamp: string;
    confidence: string;
    evidenceRef: string;
    authorizationContext: string;
  }[];
}

const KNOWN_IP_PROFILES: Record<string, IPProfile> = {
  "115.112.45.12": {
    ip: "115.112.45.12",
    cidr: "115.112.45.0/24",
    domain: "bkc-gateway-01.jio-corp.net",
    hostname: "gw4-andheri-pool4.mumbai.reliance.in",
    asn: "AS55836 - Reliance Jio Infocomm Ltd",
    isp: "Reliance Jio Infocomm (5G Carrier-Grade NAT)",
    country: "India",
    countryCode: "IN",
    networkType: "Cellular Dynamic Mobile Broadband (CGNAT)",
    protocol: "TLSv1.3 / TCP / HTTPS",
    observedPorts: "443/TCP, 8080/TCP, 9050/TCP [Tor SOCKS]",
    firstSeen: "2026-08-14 02:10:14 IST",
    lastSeen: "2026-08-16 04:15:30 IST",
    trafficVolume: "1.36 GB (Ingress + Egress)",
    caseAssociation: "FIR-0104/2026 [BKC MUMBAI]",
    riskAssessment: {
      score: 98.6,
      confidence: 98.6,
      level: "HIGH",
      status: "INVESTIGATIVE_LEAD_CONFIRMED",
      classification: "Observed Relay / Banking Phishing Redirection Point",
      anomalyIndicators: [
        "Unusual off-hours connection frequency (+340% above baseline)",
        "Repeated NAT collision with hardware MAC 4A:2B:CC:91:0F:11",
        "Encrypted tunneling matching automated credential harvester bot",
      ],
      ethicalDisclaimer:
        "LAW ENFORCEMENT NOTICE: This telemetry represents an observed network routing identifier. An IP address does NOT constitute a legal person nor conclusive proof of guilt. All conclusions must be verified through Section 91 CrPC ISP subscriber records and human investigator corroboration.",
    },
    entityResolutionChain: [
      {
        step: "1",
        stageTitle: "Observed Network Egress",
        category: "OBSERVED_NETWORK_DATA",
        entityName: "IP 115.112.45.12 (Port 443)",
        details: "Live packet capture logged on Cisco Nexus Core Switch during phishing surge.",
        source: "SFSL Packet Sniffer Node #04 (PCAP)",
        timestamp: "2026-08-14 17:45:10 IST",
        confidence: "100% (Hardware Capture)",
        evidenceRef: "EVD-2026-001 (SHA-256 Verified)",
        authorizationContext: "Section 91 CrPC Order // LEO-IO-BKC-4190",
      },
      {
        step: "2",
        stageTitle: "Timestamp & Port Allocation Record",
        category: "PROVIDER_DERIVED",
        entityName: "CGNAT Binding Session 0x7B9A",
        details: "Reliance Jio NOC provided IPDR binding IP 115.112.45.12:44322 to IMSI 404450991823412.",
        source: "Reliance Jio Infocomm Lawful Intercept Portal",
        timestamp: "2026-08-15 08:30:00 IST",
        confidence: "99.4%",
        evidenceRef: "JIO-IPDR-REQ-2026-0881",
        authorizationContext: "Section 91 CrPC Requisition Stamp #BKC-CY-2026",
      },
      {
        step: "3",
        stageTitle: "Subscriber CAF Record",
        category: "PROVIDER_DERIVED",
        entityName: "SIM Registration: MSISDN +91 98250 XXXXX",
        details: "CAF registered using Aadhaar copy at Andheri retail kiosk.",
        source: "Telco Customer Application Form (CAF) Archive",
        timestamp: "2026-08-15 11:20:00 IST",
        confidence: "95.0% (Forged / Mule Risk)",
        evidenceRef: "DOC-CAF-MUM-8921",
        authorizationContext: "Formal Police Subpoena // Court Warrant Issued",
      },
      {
        step: "4",
        stageTitle: "Local Subnet & Router Correlation",
        category: "DATABASE_CORRELATION",
        entityName: "Router MAC 4A:2B:CC:91:0F:11",
        details: "Physical router seized during raid at Andheri safehouse matched internal DHCP table.",
        source: "Physical Panchnama #084 & Memory Dump",
        timestamp: "2026-08-16 04:15:00 IST",
        confidence: "99.8%",
        evidenceRef: "PANCHNAMA-MH-BKC-084",
        authorizationContext: "Judicial Search Warrant #SW-991/2026",
      },
      {
        step: "5",
        stageTitle: "Multi-Source Entity Resolution",
        category: "AI_INFERENCE",
        entityName: "Suspect Subject: Vikram Sharma [Alias: Vicky]",
        details: "GNN behavioral clustering correlated device usage, concurrent CDR contacts, and mule bank withdrawals.",
        source: "CyberGraph-DL Stage 3 Risk Fusion Engine",
        timestamp: "2026-08-20 11:00:24 IST",
        confidence: "98.6% Model Confidence",
        evidenceRef: "AI-ASSESS-001 (TensorRT Model v3.4)",
        authorizationContext: "Investigative Lead Only - Non-Judicial",
      },
      {
        step: "6",
        stageTitle: "Investigator Legal Finding",
        category: "HUMAN_LEGAL_CONCLUSION",
        entityName: "Accused Person: Vikram Sharma (Named in FIR)",
        details: "Lead IO confirmed identity via biometric verification and confession under custody of co-accused Amit Singh.",
        source: "Case Diary Entry #14, Investigating Officer PI S. R. Kulkarni",
        timestamp: "2026-08-21 16:00:00 IST",
        confidence: "OFFICIAL POLICE FINDING",
        evidenceRef: "FIR-0104/2026 Chargesheet Annexure D",
        authorizationContext: "BKC Police Station Crime Register",
      },
    ],
  },
  "185.220.101.5": {
    ip: "185.220.101.5",
    cidr: "185.220.101.0/24",
    domain: "exit-relay-4.tor-node.is",
    hostname: "tor-exit-nordic-04.flokinet.is",
    asn: "AS200052 - Flokinet Ltd (Iceland)",
    isp: "Flokinet Offshore Hosting & Anonymity Services",
    country: "Iceland",
    countryCode: "IS",
    networkType: "Tor Exit Relay / Data Center Proxy",
    protocol: "TCP / TLSv1.3 / Onion V3 Protocol",
    observedPorts: "80/TCP, 443/TCP, 9001/TCP [Tor ORPort]",
    firstSeen: "2024-10-23 12:10:00 UTC",
    lastSeen: "2024-10-24 03:14:22 UTC",
    trafficVolume: "8.00 GB (Memory Dump Correlated)",
    caseAssociation: "FIR-2024-8842 [BLR CYBER]",
    riskAssessment: {
      score: 98.4,
      confidence: 98.4,
      level: "HIGH",
      status: "INVESTIGATIVE_LEAD_CONFIRMED",
      classification: "Suspicious Darknet Relay / Cryptocurrency Escrow Anonymizer",
      anomalyIndicators: [
        "100% encrypted high-entropy payload distribution",
        "Synchronized timing with Bangalore safehouse Signal VoIP calls",
        "Frequent multi-hop connection attempts to Mumbai mule endpoints",
      ],
      ethicalDisclaimer:
        "LAW ENFORCEMENT NOTICE: Tor exit nodes carry traffic for numerous unassociated global parties. Operating or routing traffic through a public relay does not per se imply criminal culpability without proving specific packet-level cryptographic association.",
    },
    entityResolutionChain: [
      {
        step: "1",
        stageTitle: "Observed Network Egress",
        category: "OBSERVED_NETWORK_DATA",
        entityName: "IP 185.220.101.5 (Port 9001)",
        details: "Observed ingress traffic matching encrypted ransomware extortion escrow portal.",
        source: "Karnataka State Cyber Telemetry Ingest",
        timestamp: "2024-10-23 14:00:00 IST",
        confidence: "100%",
        evidenceRef: "EVD-2024-884",
        authorizationContext: "Section 91 CrPC Order // CID-9042",
      },
      {
        step: "2",
        stageTitle: "International ISP & MLAT Subpoena",
        category: "PROVIDER_DERIVED",
        entityName: "Flokinet Server Rental Lease",
        details: "Interpol MLAT inquiry verified server leased using cryptocurrency payments.",
        source: "Interpol NCB New Delhi & Icelandic Judicial Liaison",
        timestamp: "2024-10-24 02:00:00 UTC",
        confidence: "91.2%",
        evidenceRef: "MLAT-IS-2024-884",
        authorizationContext: "Treaty on Mutual Legal Assistance in Criminal Matters",
      },
      {
        step: "3",
        stageTitle: "Safehouse Local Hardware Correlation",
        category: "DATABASE_CORRELATION",
        entityName: "Supermicro Server HZ-8812 // MAC 00:1A:2B:6F:43:89",
        details: "Hardware seized at Indiranagar safehouse showed active SSH session to 185.220.101.5.",
        source: "Physical Seizure Panchnama Form-V",
        timestamp: "2024-10-24 04:20:00 IST",
        confidence: "99.9%",
        evidenceRef: "PANCHNAMA-BLR-8812",
        authorizationContext: "Bangalore Magistrate Warrant #MW-8842",
      },
      {
        step: "4",
        stageTitle: "Identity Correlation",
        category: "HUMAN_LEGAL_CONCLUSION",
        entityName: "Anisur Rahman Chowdhury (Named Accused)",
        details: "Charge Sheet filed before 1st ACMM Court naming subject as mastermind operator.",
        source: "CID Cyber Crime Police Station Charge Sheet #8842/2024",
        timestamp: "2024-11-10 10:00:00 IST",
        confidence: "OFFICIAL CHARGE SHEET",
        evidenceRef: "FIR-2024-8842 Charge Sheet Record",
        authorizationContext: "Judicial Remand Warrant // Bangalore Special Court",
      },
    ],
  },
  "45.33.32.156": {
    ip: "45.33.32.156",
    cidr: "45.33.32.0/24",
    domain: "c2-relay.cloud-services.eu",
    hostname: "li1024-156.members.linode.com",
    asn: "AS63949 - Linode, LLC (Akamai Connected Cloud)",
    isp: "Linode Cloud Infrastructure (Frankfurt VPS)",
    country: "Germany",
    countryCode: "DE",
    networkType: "Cloud Virtual Private Server (VPS)",
    protocol: "TCP / TLSv1.3 / Custom Encrypted C2",
    observedPorts: "443/TCP, 8443/TCP, 22/TCP",
    firstSeen: "2026-07-18 11:30:00 IST",
    lastSeen: "2026-07-20 18:45:00 IST",
    trafficVolume: "400 MB (Suricata EVE IDS Logs)",
    caseAssociation: "FIR-7719/2026 [CBI DELHI]",
    riskAssessment: {
      score: 96.2,
      confidence: 96.2,
      level: "HIGH",
      status: "INVESTIGATIVE_LEAD_CONFIRMED",
      classification: "Suspected Command-and-Control (C2) Staging Proxy",
      anomalyIndicators: [
        "High-frequency beaconing matching LockBit 3.0 ransomware affiliate agent",
        "Coordinated timing with unauthorized eSIM provisioning requests in Delhi NCR",
        "Direct connection to compromised healthcare PACS archive server",
      ],
      ethicalDisclaimer:
        "LAW ENFORCEMENT NOTICE: Cloud VPS IPs are frequently recycled or compromised without the knowledge of the hosting provider. Forensic attribution requires inspecting server volatile memory and authorized subpoena records.",
    },
    entityResolutionChain: [
      {
        step: "1",
        stageTitle: "Observed Ingress Sensor Detection",
        category: "OBSERVED_NETWORK_DATA",
        entityName: "IP 45.33.32.156 (Port 8443)",
        details: "Suricata EVE.json IDS alert flagged beaconing pattern to healthcare network switch.",
        source: "NCIIPC Sensor Grid Gateway Node 02",
        timestamp: "2026-07-18 13:40:00 IST",
        confidence: "99.8%",
        evidenceRef: "EVD-2026-771",
        authorizationContext: "NCIIPC Mandate // Section 70A IT Act",
      },
      {
        step: "2",
        stageTitle: "Cloud Provider Subpoena Response",
        category: "PROVIDER_DERIVED",
        entityName: "Linode Account UID #991024-DE",
        details: "Virtual server provisioned with prepaid virtual debit card under false persona.",
        source: "Linode Legal Compliance Division Response",
        timestamp: "2026-07-19 16:00:00 UTC",
        confidence: "94.2%",
        evidenceRef: "SUBPOENA-LINODE-2026-01",
        authorizationContext: "CBI Special Crime Unit Investigation Notice",
      },
      {
        step: "3",
        stageTitle: "Accused Identification",
        category: "HUMAN_LEGAL_CONCLUSION",
        entityName: "Rajesh Malhotra & Dmitry Sokolov",
        details: "CBI SCU identified domestic SIM swap facilitator and foreign affiliate handle.",
        source: "CBI First Information Report FIR/7719/2026",
        timestamp: "2026-07-20 18:00:00 IST",
        confidence: "CRIMINAL INVESTIGATION LEAD",
        evidenceRef: "CBI Case File #7719/2026",
        authorizationContext: "Special Judge CBI Courts Rouse Avenue Delhi",
      },
    ],
  },
};

import { Suspense } from "react";

function IpIntelligenceContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "resolution" ? "resolution" : "dossier";

  const [activeTab, setActiveTab] = useState<"dossier" | "resolution">(initialTab);
  const [searchQuery, setSearchQuery] = useState("115.112.45.12");
  const [selectedIP, setSelectedIP] = useState<IPProfile>(KNOWN_IP_PROFILES["115.112.45.12"]);
  const [searchedNotFound, setSearchedNotFound] = useState(false);

  useEffect(() => {
    if (searchParams.get("tab") === "resolution") {
      setActiveTab("resolution");
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim();
    if (KNOWN_IP_PROFILES[clean]) {
      setSelectedIP(KNOWN_IP_PROFILES[clean]);
      setSearchedNotFound(false);
    } else {
      setSearchedNotFound(true);
    }
  };

  const getCategoryBadge = (cat: IPProfile["entityResolutionChain"][0]["category"]) => {
    switch (cat) {
      case "OBSERVED_NETWORK_DATA":
        return { label: "OBSERVED NETWORK DATA", color: "text-telecom-cyan border-telecom-cyan/40 bg-telecom-cyan/10" };
      case "PROVIDER_DERIVED":
        return { label: "PROVIDER-DERIVED DATA", color: "text-amber-400 border-amber-500/40 bg-amber-500/10" };
      case "DATABASE_CORRELATION":
        return { label: "DATABASE CORRELATION", color: "text-blue-400 border-blue-500/40 bg-blue-500/10" };
      case "AI_INFERENCE":
        return { label: "AI INFERENCE [MODEL]", color: "text-purple-400 border-purple-500/40 bg-purple-500/10" };
      case "HUMAN_LEGAL_CONCLUSION":
        return { label: "HUMAN LEGAL CONCLUSION", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" };
      default:
        return { label: "TELEMETRY", color: "text-zinc-400 border-zinc-700 bg-zinc-800/40" };
    }
  };

  return (
    <WorkstationShell activeCaseId={selectedIP.caseAssociation.split(" ")[0]}>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base font-sans select-none">
        {/* ================= 1. WORKSPACE HEADER & SEARCH ================= */}
        <div className="p-3.5 border-b border-border-subtle bg-surface-card flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-telecom-cyan/30 bg-telecom-cyan/10 text-telecom-cyan flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-text-primary tracking-wide">
                  IP Intelligence &amp; Entity Resolution
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded border border-telecom-cyan/40 bg-telecom-cyan/10 text-telecom-cyan">
                  Surveillance &amp; Attribution
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Observed network telemetries, ISP subscriber mapping, and multi-tier evidentiary correlation.
              </p>
            </div>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search IP, CIDR, or Hostname..."
                className="pl-9 pr-3 py-1.5 bg-bg-base rounded-md border border-border-subtle text-xs text-text-primary w-64 md:w-80 focus:outline-none focus:border-telecom-cyan placeholder:text-text-muted font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-telecom-cyan/10 hover:bg-telecom-cyan/20 border border-telecom-cyan/40 text-telecom-cyan rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* Quick Selector Pills */}
        <div className="px-4 py-2 border-b border-border-subtle/60 bg-bg-base flex items-center justify-between text-xs shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 text-text-muted">
            <span className="text-[11px] font-medium text-text-muted">Quick Targets:</span>
            {Object.keys(KNOWN_IP_PROFILES).map((ip) => (
              <button
                key={ip}
                type="button"
                onClick={() => {
                  setSearchQuery(ip);
                  setSelectedIP(KNOWN_IP_PROFILES[ip]);
                  setSearchedNotFound(false);
                }}
                className={`px-2.5 py-1 rounded-md border text-xs font-mono transition-colors cursor-pointer ${
                  selectedIP.ip === ip
                    ? "border-telecom-cyan text-telecom-cyan bg-telecom-cyan/10 font-semibold"
                    : "border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-card"
                }`}
              >
                {ip}
              </button>
            ))}
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-surface-card rounded-md border border-border-subtle p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("dossier")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "dossier"
                  ? "bg-telecom-cyan/15 text-telecom-cyan font-semibold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Network Dossier
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("resolution")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === "resolution"
                  ? "bg-telecom-cyan/15 text-telecom-cyan font-semibold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>Entity Resolution Flow</span>
            </button>
          </div>
        </div>

        {/* ================= NOT FOUND WARNING ================= */}
        {searchedNotFound && (
          <div className="m-3 p-3 bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                NO LIVE LOCAL RECORD FOR <strong className="text-white">{searchQuery}</strong>. Showing baseline carrier demonstration record.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("115.112.45.12");
                setSelectedIP(KNOWN_IP_PROFILES["115.112.45.12"]);
                setSearchedNotFound(false);
              }}
              className="underline text-amber-200 hover:text-white cursor-pointer"
            >
              RESET TO 115.112.45.12
            </button>
          </div>
        )}

        {/* ================= 2. WORKSPACE BODY ================= */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
          {/* Top Card: IP Summary & Mandatory Ethical Safeguard Banner */}
          <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted uppercase">TARGET IDENTIFIER:</span>
                  <span className="text-lg font-bold text-text-primary tracking-wider">{selectedIP.ip}</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold border border-threat-crimson/40 bg-threat-crimson/10 text-threat-crimson">
                    {selectedIP.riskAssessment.level} SUSPICIOUS ACTIVITY
                  </span>
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  ASSOCIATED CASE: <strong className="text-telecom-cyan">{selectedIP.caseAssociation}</strong>
                </div>
              </div>

              {/* Assessment Metrics */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-bg-base border border-border-subtle">
                  <div className="text-[9px] text-text-muted">RISK SCORE</div>
                  <div className="text-base font-bold text-threat-crimson">{selectedIP.riskAssessment.score} / 100</div>
                  <div className="text-[9px] text-text-muted">DL Multi-Model</div>
                </div>

                <div className="p-2 bg-bg-base border border-border-subtle">
                  <div className="text-[9px] text-text-muted">CONFIDENCE</div>
                  <div className="text-base font-bold text-emerald-400">{selectedIP.riskAssessment.confidence}%</div>
                  <div className="text-[9px] text-text-muted">Bayesian Fusion</div>
                </div>

                <div className="p-2 bg-bg-base border border-border-subtle">
                  <div className="text-[9px] text-text-muted">STATUS</div>
                  <div className="text-[11px] font-bold text-telecom-cyan uppercase tracking-tight mt-1">
                    {selectedIP.riskAssessment.status.replace(/_/g, " ")}
                  </div>
                  <div className="text-[9px] text-text-muted">LEO Verified</div>
                </div>
              </div>
            </div>

            {/* Strict Law Enforcement Ethical Disclaimer */}
            <div className="p-2.5 bg-blue-950/20 border border-blue-500/30 text-blue-200/90 text-[10px] leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-telecom-cyan shrink-0 mt-0.5" />
              <div>
                <strong className="text-telecom-cyan uppercase font-bold tracking-wider">
                  STATUTORY EVIDENTIARY DISCLAIMER:
                </strong>{" "}
                {selectedIP.riskAssessment.ethicalDisclaimer}
              </div>
            </div>
          </div>

          {/* TAB 1: IP NETWORK DOSSIER */}
          {activeTab === "dossier" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Network Telemetry Card */}
              <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-border-subtle">
                  <Server className="w-3.5 h-3.5 text-telecom-cyan" />
                  <span>CARRIER & NETWORK METADATA</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted block">AUTONOMOUS SYSTEM (ASN):</span>
                    <span className="text-text-primary font-bold">{selectedIP.asn}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">INTERNET SERVICE PROVIDER (ISP):</span>
                    <span className="text-text-primary">{selectedIP.isp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">ROUTING PREFIX (CIDR):</span>
                    <span className="text-telecom-cyan">{selectedIP.cidr}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">REVERSE DNS (rDNS) / HOSTNAME:</span>
                    <span className="text-text-primary break-all">{selectedIP.hostname}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">NETWORK CLASSIFICATION:</span>
                    <span className="text-amber-300">{selectedIP.networkType}</span>
                  </div>
                </div>
              </div>

              {/* Observed Protocol & Port Matrix */}
              <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-border-subtle">
                  <Globe className="w-3.5 h-3.5 text-telecom-cyan" />
                  <span>TELEMETRY & TRANSPORT TIMELINE</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted block">TRANSPORT PROTOCOL:</span>
                    <span className="text-text-primary font-bold">{selectedIP.protocol}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">OBSERVED OPEN / ACTIVE PORTS:</span>
                    <span className="text-threat-crimson font-bold">{selectedIP.observedPorts}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">FIRST OBSERVED INGRESS:</span>
                    <span className="text-text-primary">{selectedIP.firstSeen}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">LAST OBSERVED ACTIVITY:</span>
                    <span className="text-text-primary">{selectedIP.lastSeen}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">INGESTED TRAFFIC VOLUME:</span>
                    <span className="text-emerald-400 font-bold">{selectedIP.trafficVolume}</span>
                  </div>
                </div>
              </div>

              {/* Anomaly & Risk Indicators */}
              <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-border-subtle">
                  <Cpu className="w-3.5 h-3.5 text-threat-crimson" />
                  <span>MODEL ANOMALY FINDINGS</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted block">DETECTED BEHAVIOR:</span>
                    <span className="text-threat-crimson font-bold">
                      {selectedIP.riskAssessment.classification}
                    </span>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] text-text-muted block mb-1">KEY FLAGGED FEATURES:</span>
                    <ul className="space-y-1.5">
                      {selectedIP.riskAssessment.anomalyIndicators.map((ind, i) => (
                        <li key={i} className="p-1.5 bg-bg-base border border-border-subtle text-[11px] text-text-secondary flex items-start gap-1.5">
                          <span className="text-threat-crimson font-bold mt-0.5">•</span>
                          <span>{ind}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("resolution")}
                      className="w-full py-1.5 bg-telecom-cyan/10 hover:bg-telecom-cyan/20 border border-telecom-cyan/40 text-telecom-cyan text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      <span>VIEW FULL ENTITY RESOLUTION CHAIN</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEDICATED ENTITY RESOLUTION FLOW */}
          {activeTab === "resolution" && (
            <div className="space-y-3">
              {/* Explanatory Header */}
              <div className="p-3 bg-surface-card border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <GitMerge className="w-4 h-4 text-telecom-cyan" />
                    <span>IP-TO-SUBSCRIBER ENTITY RESOLUTION ARCHITECTURE</span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Rigorous evidentiary traceability from raw network socket capture to legal subject identification.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 border border-telecom-cyan/40 bg-telecom-cyan/10 text-telecom-cyan">
                    {selectedIP.entityResolutionChain.length} PROVENANCE STAGES
                  </span>
                </div>
              </div>

              {/* Visual Multi-Tier Flow */}
              <div className="space-y-2">
                {selectedIP.entityResolutionChain.map((step, idx) => {
                  const badge = getCategoryBadge(step.category);
                  const isLast = idx === selectedIP.entityResolutionChain.length - 1;

                  return (
                    <div
                      key={step.step}
                      className="p-3 bg-surface-card border border-border-subtle hover:border-border-highlight transition-colors relative"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                        {/* Step Sequence & Stage Title */}
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full border border-telecom-cyan/50 bg-telecom-cyan/10 text-telecom-cyan flex items-center justify-center text-xs font-bold shrink-0">
                            {step.step}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                                {step.stageTitle}
                              </span>
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${badge.color}`}>
                                {badge.label}
                              </span>
                            </div>

                            <div className="text-xs text-telecom-cyan font-semibold mt-1">
                              {step.entityName}
                            </div>

                            <p className="text-[11px] text-text-secondary mt-1 max-w-3xl leading-relaxed">
                              {step.details}
                            </p>
                          </div>
                        </div>

                        {/* Evidentiary Meta Right Column */}
                        <div className="flex flex-col md:items-end gap-1 text-[10px] shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-border-subtle">
                          <div className="flex items-center gap-1 text-text-muted">
                            <Clock className="w-3 h-3 text-text-muted" />
                            <span>{step.timestamp}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-text-muted">CONFIDENCE:</span>
                            <span className="text-emerald-400 font-bold">{step.confidence}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-text-muted">EVIDENCE:</span>
                            <span className="text-text-primary font-mono bg-bg-base px-1 border border-border-subtle">
                              {step.evidenceRef}
                            </span>
                          </div>

                          <div className="text-[9px] text-amber-400/90 italic">
                            {step.authorizationContext}
                          </div>
                        </div>
                      </div>

                      {/* Connecting Down Arrow */}
                      {!isLast && (
                        <div className="flex justify-center -mb-4 mt-2">
                          <span className="text-text-muted text-xs">↓</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkstationShell>
  );
}

export default function IpIntelligencePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-bg-base text-text-muted font-mono text-xs">
          LOADING IP INTELLIGENCE WORKSPACE...
        </div>
      }
    >
      <IpIntelligenceContent />
    </Suspense>
  );
}

