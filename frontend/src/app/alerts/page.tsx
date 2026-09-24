"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  Radio,
  ExternalLink,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  Clock,
  MapPin,
  FileText,
  User,
  Search,
  Hash,
} from "lucide-react";

interface AlertRecord {
  id: string;
  severity: "CRITICAL" | "HIGH" | "ELEVATED" | "INFO";
  title: string;
  target: string;
  syndicate: string;
  caseRef: string;
  timestamp: string;
  riskScore: number;
  description: string;
  category: "EXFILTRATION" | "C2_BEACON" | "SIM_SWAP" | "CRYPTO_ESCROW" | "BRUTE_FORCE";
  status: "ACTIVE" | "INVESTIGATING" | "RESOLVED";
}

const MOCK_ALERTS: AlertRecord[] = [
  {
    id: "ALT-2026-091",
    severity: "CRITICAL",
    title: "Mule API Exfiltration Ingress Burst",
    target: "115.112.45.12 (Reliance Jio)",
    syndicate: "Jamtara Cyber Phishing Ring",
    caseRef: "FIR-0104",
    timestamp: "11:14 IST · Today",
    riskScore: 98.6,
    description: "Rapid OTP API polling bursts originating from Karmatar BTS coinciding with victim banking deductions.",
    category: "EXFILTRATION",
    status: "ACTIVE",
  },
  {
    id: "ALT-2026-092",
    severity: "CRITICAL",
    title: "Tor Onion C2 Proxy Beaconing",
    target: "185.220.101.5 (Flokinet Relay)",
    syndicate: "Delhi Crypto-Hawala Ring",
    caseRef: "FIR-8842",
    timestamp: "10:52 IST · Today",
    riskScore: 98.4,
    description: "Encrypted WebSocket heartbeat detected correlating with USDT OTC escrow wallet addresses in Chandni Chowk.",
    category: "C2_BEACON",
    status: "ACTIVE",
  },
  {
    id: "ALT-2026-093",
    severity: "CRITICAL",
    title: "Cobalt Strike Hypervisor Exploit Relay",
    target: "45.33.32.156 (Linode DC)",
    syndicate: "Bengaluru Ransomware Cartel",
    caseRef: "FIR-7719",
    timestamp: "09:48 IST · Today",
    riskScore: 99.1,
    description: "Memory injector payload targeting Hospital EHR server database via shared Cloud VPS MAC 00:50:56:A1:B2:C3.",
    category: "C2_BEACON",
    status: "ACTIVE",
  },
  {
    id: "ALT-2026-094",
    severity: "HIGH",
    title: "Unauthorized Dealer SIM-Swap Broadcast",
    target: "+91 99001 XXXXX (Delhi Circle)",
    syndicate: "Bengaluru Ransomware Cartel",
    caseRef: "FIR-7719",
    timestamp: "09:30 IST · Today",
    riskScore: 89.2,
    description: "Multi-IMSI re-issuance flagged on burner device without physical biometric KYC verification.",
    category: "SIM_SWAP",
    status: "INVESTIGATING",
  },
  {
    id: "ALT-2026-095",
    severity: "HIGH",
    title: "TRC-20 USDT Layering Smurf Transaction",
    target: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    syndicate: "Delhi Crypto-Hawala Ring",
    caseRef: "FIR-8842",
    timestamp: "08:15 IST · Today",
    riskScore: 91.5,
    description: "Micro-transactions of $9,800 USDT split across 14 mule wallets in under 90 seconds.",
    category: "CRYPTO_ESCROW",
    status: "INVESTIGATING",
  },
  {
    id: "ALT-2026-096",
    severity: "ELEVATED",
    title: "Mass SMS Gateway Header Spoofing",
    target: "103.212.43.18 (Jamtara Exchange)",
    syndicate: "Jamtara Cyber Phishing Ring",
    caseRef: "FIR-0104",
    timestamp: "07:22 IST · Today",
    riskScore: 84.0,
    description: "Sender ID spoofing mimicking SBI NetBanking KYC renewal APK download URLs.",
    category: "EXFILTRATION",
    status: "RESOLVED",
  },
  {
    id: "ALT-2026-097",
    severity: "ELEVATED",
    title: "Angadia Courier Physical Cash Handover",
    target: "Mohd. Danish Qureshi (Daryaganj)",
    syndicate: "Delhi Crypto-Hawala Ring",
    caseRef: "FIR-8842",
    timestamp: "06:40 IST · Today",
    riskScore: 82.5,
    description: "Physical cash collection session of ₹45 Lakhs mapped against tokenized QR settlement log.",
    category: "CRYPTO_ESCROW",
    status: "RESOLVED",
  },
];

export default function AlertsCenterPage() {
  const [activeCaseId, setActiveCaseId] = useState<string>("FIR-2024-8842");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAlerts = MOCK_ALERTS.filter((a) => {
    if (filterSeverity !== "ALL" && a.severity !== filterSeverity) return false;
    if (
      searchQuery &&
      !a.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.target.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.syndicate.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <WorkstationShell activeCaseId={activeCaseId} onCaseChange={setActiveCaseId}>
      <div className="flex-1 w-full h-full relative overflow-y-auto bg-[#0c0e12] font-mono select-none p-4 space-y-4 custom-scrollbar text-xs text-slate-200 bg-industrial-grid">
        {/* ================= HEADER ================= */}
        <div className="p-4 border border-slate-700/60 bg-[#13171e] rounded flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-red-500/30 bg-red-500/10 text-red-400 rounded">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-bold text-slate-100 tracking-wider uppercase">
                  THREAT ALERTS &amp; INCIDENT TRIAGE CENTER
                </h1>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 rounded">
                  [7 ACTIVE INCIDENTS]
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#1a202a] text-slate-300 border border-slate-700/60 rounded">
                  DEFCON-02
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Automated network anomaly triggers correlated against active criminal syndicates with statutory evidence hashing.
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0c0e12] p-1 rounded border border-slate-700/60">
              {["ALL", "CRITICAL", "HIGH", "ELEVATED"].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded transition-colors cursor-pointer ${
                    filterSeverity === sev
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <Link
              href="/radar"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Launch Threat Radar</span>
            </Link>
          </div>
        </div>

        {/* ================= SEARCH & METRICS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#13171e] rounded border border-slate-700/60 space-y-1 shadow-sm">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">CRITICAL THREATS</span>
            <div className="text-base font-bold text-red-400 font-mono">3 Incidents Flagged</div>
            <span className="text-[9px] text-red-400 font-semibold">Immediate Triage Protocol</span>
          </div>

          <div className="p-3.5 bg-[#13171e] rounded border border-slate-700/60 space-y-1 shadow-sm">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AVG RESOLUTION TIME</span>
            <div className="text-base font-bold text-slate-100 font-mono">4.2 Minutes</div>
            <span className="text-[9px] text-emerald-400 font-semibold">Automated Isolation Active</span>
          </div>

          <div className="p-3.5 bg-[#13171e] rounded border border-slate-700/60 space-y-1 shadow-sm">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">CARTELS INVOLVED</span>
            <div className="text-base font-bold text-amber-400 font-mono">3 Active Rings</div>
            <span className="text-[9px] text-slate-400">Jamtara, Delhi, BLR</span>
          </div>

          <div className="p-3.5 bg-[#13171e] rounded border border-slate-700/60 space-y-1 shadow-sm">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">LEGAL EVIDENCE CHAIN</span>
            <div className="text-base font-bold text-sky-400 font-mono">100% Traceable</div>
            <span className="text-[9px] text-emerald-400 font-semibold">Sec 65B Court Admissible</span>
          </div>
        </div>

        {/* ================= ALERTS LIST ================= */}
        <div className="bg-[#13171e] rounded border border-slate-700/60 p-4 space-y-3 shadow-md">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-700/60 text-[11px] text-slate-400 font-mono">
            <span>SHOWING {filteredAlerts.length} THREAT INCIDENTS</span>
            <span>SORTED BY RISK SCORE (DESCENDING)</span>
          </div>

          <div className="space-y-2.5">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 bg-[#0c0e12] hover:bg-[#1a202a]/60 rounded border border-slate-700/50 space-y-2.5 transition-colors shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-500/15 text-red-400 border border-red-500/40"
                          : alert.severity === "HIGH"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                          : "bg-sky-500/15 text-sky-300 border border-sky-500/40"
                      }`}
                    >
                      [{alert.severity}]
                    </span>
                    <span className="text-xs font-bold text-slate-100">{alert.title}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-slate-400 font-mono">{alert.timestamp}</span>
                    <span className="text-red-400 font-bold font-mono px-2 py-0.5 bg-red-500/10 rounded border border-red-500/20">
                      RISK {alert.riskScore}%
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#1a202a] text-slate-300 border border-slate-700/60">
                      {alert.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] text-slate-300 pt-1.5 border-t border-slate-700/40 font-mono">
                  <div>
                    <span className="text-slate-500 font-bold">TARGET / IP:</span>{" "}
                    <span className="text-slate-100">{alert.target}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">CARTEL:</span>{" "}
                    <span className="text-amber-400">{alert.syndicate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">CASE DOSSIER:</span>{" "}
                    <Link
                      href={`/cases?id=${alert.caseRef}`}
                      className="text-sky-400 hover:text-sky-300 font-bold underline"
                    >
                      {alert.caseRef}
                    </Link>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {alert.description}
                </p>

                <div className="flex justify-end gap-2 pt-1">
                  <Link
                    href={`/ip-intelligence?ip=${encodeURIComponent(alert.target.split(" ")[0])}`}
                    className="px-3 py-1 bg-[#1a202a] hover:bg-[#222a36] text-slate-200 rounded text-[10px] font-semibold transition-colors border border-slate-700/60"
                  >
                    Investigate IP
                  </Link>
                  <Link
                    href="/radar"
                    className="px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold transition-colors"
                  >
                    View in Threat Radar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkstationShell>
  );
}
