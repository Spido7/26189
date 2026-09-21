"use client";

import React, { useState, useMemo } from "react";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import {
  PhoneCall,
  Search,
  RadioTower,
  Smartphone,
  Calendar,
  Clock,
  Filter,
  User,
  GitMerge,
  BarChart3,
  MapPin,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  Download,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { ALL_THREE_SYNDICATES_DATA } from "@/data/cyber-packet-pool";

interface CDRRecord {
  id: string;
  sourceNumber: string;
  targetNumber: string;
  callType: "VOICE_CALL" | "SMS" | "ENCRYPTED_DATA_VOIP";
  durationSeconds: number;
  timestamp: string;
  cellLacCid: string;
  cellTowerLocation: string;
  imei: string;
  imsi: string;
  carrier: string;
  flaggedSuspicious: boolean;
}

const SAMPLE_CDR_RECORDS: CDRRecord[] = [
  {
    id: "CDR-MH-991201",
    sourceNumber: "+91 98250 XXXXX",
    targetNumber: "+91 98111 XXXXX",
    callType: "VOICE_CALL",
    durationSeconds: 862,
    timestamp: "2026-08-14 17:45:10 IST",
    cellLacCid: "LAC:4120 / CID:8934",
    cellTowerLocation: "Andheri East Sector 4, Mumbai, MH",
    imei: "356938035643809",
    imsi: "404450123456789",
    carrier: "Reliance Jio 5G VoLTE",
    flaggedSuspicious: true,
  },
  {
    id: "CDR-MH-991202",
    sourceNumber: "+91 98250 XXXXX",
    targetNumber: "+91 97410 XXXXX",
    callType: "SMS",
    durationSeconds: 0,
    timestamp: "2026-08-14 18:02:14 IST",
    cellLacCid: "LAC:4120 / CID:8934",
    cellTowerLocation: "Andheri East Sector 4, Mumbai, MH",
    imei: "356938035643809",
    imsi: "404450123456789",
    carrier: "Reliance Jio 5G VoLTE",
    flaggedSuspicious: true,
  },
  {
    id: "CDR-KA-881203",
    sourceNumber: "+91 97410 XXXXX",
    targetNumber: "+44 7911 123456",
    callType: "ENCRYPTED_DATA_VOIP",
    durationSeconds: 1420,
    timestamp: "2024-10-24 03:14:00 IST",
    cellLacCid: "LAC:2810 / CID:4412",
    cellTowerLocation: "Indiranagar BTS Sector 2, Bengaluru, KA",
    imei: "867492049102941",
    imsi: "404450998812411",
    carrier: "Airtel VoLTE / International Gateway",
    flaggedSuspicious: true,
  },
  {
    id: "CDR-DL-771204",
    sourceNumber: "+91 99102 XXXXX",
    targetNumber: "+91 98250 XXXXX",
    callType: "VOICE_CALL",
    durationSeconds: 412,
    timestamp: "2026-07-18 22:30:00 IST",
    cellLacCid: "LAC:1102 / CID:1829",
    cellTowerLocation: "Barakhamba Road Sector 1, New Delhi",
    imei: "359102481029481",
    imsi: "404450771829401",
    carrier: "Vodafone Idea 4G",
    flaggedSuspicious: false,
  },
  {
    id: "CDR-DL-771205",
    sourceNumber: "+91 99102 XXXXX",
    targetNumber: "+91 98111 XXXXX",
    callType: "SMS",
    durationSeconds: 0,
    timestamp: "2026-07-19 09:15:20 IST",
    cellLacCid: "LAC:1102 / CID:1829",
    cellTowerLocation: "Barakhamba Road Sector 1, New Delhi",
    imei: "359102481029481",
    imsi: "404450771829401",
    carrier: "Vodafone Idea 4G",
    flaggedSuspicious: true,
  },
  {
    id: "CDR-MH-991206",
    sourceNumber: "+91 98111 XXXXX",
    targetNumber: "+91 98250 XXXXX",
    callType: "VOICE_CALL",
    durationSeconds: 195,
    timestamp: "2026-08-15 11:10:00 IST",
    cellLacCid: "LAC:4120 / CID:8934",
    cellTowerLocation: "Andheri East Sector 4, Mumbai, MH",
    imei: "356938035643809",
    imsi: "404450123456789",
    carrier: "Reliance Jio 5G VoLTE",
    flaggedSuspicious: false,
  },
];

export default function CdrIntelligencePage() {
  const [searchTarget, setSearchTarget] = useState("+91 98250 XXXXX");
  const [selectedCallType, setSelectedCallType] = useState<"ALL" | "VOICE_CALL" | "SMS" | "ENCRYPTED_DATA_VOIP">("ALL");
  const [activeTab, setActiveTab] = useState<"records" | "call_graph" | "temporal">("call_graph");

  // Filtered records
  const filteredRecords = useMemo(() => {
    return SAMPLE_CDR_RECORDS.filter((rec) => {
      if (selectedCallType !== "ALL" && rec.callType !== selectedCallType) return false;
      if (searchTarget.trim()) {
        const q = searchTarget.toLowerCase();
        return (
          rec.sourceNumber.toLowerCase().includes(q) ||
          rec.targetNumber.toLowerCase().includes(q) ||
          rec.imei.toLowerCase().includes(q) ||
          rec.cellTowerLocation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCallType, searchTarget]);

  return (
    <WorkstationShell activeCaseId="FIR-0104/2026">
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base font-sans select-none">
        {/* ================= 1. HEADER & SEARCH ================= */}
        <div className="p-3.5 border-b border-border-subtle bg-surface-card flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-telecom-cyan/30 bg-telecom-cyan/10 text-telecom-cyan flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-text-primary tracking-wide">
                  Call Detail Record (CDR) Intelligence
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded border border-telecom-cyan/40 bg-telecom-cyan/10 text-telecom-cyan">
                  Requisition &amp; Forensics
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                MSISDN, IMEI, and IMSI telephony analysis, cell site triangulation, and communication graphs.
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value)}
                placeholder="Search MSISDN, IMEI, or IMSI..."
                className="pl-9 pr-3 py-1.5 bg-bg-base rounded-md border border-border-subtle text-xs text-text-primary w-64 md:w-72 focus:outline-none focus:border-telecom-cyan placeholder:text-text-muted font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => setSearchTarget("+91 98250 XXXXX")}
              className="px-3 py-1.5 bg-surface-card hover:bg-surface-overlay border border-border-subtle rounded-md text-xs text-text-muted hover:text-text-primary cursor-pointer transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ================= 2. METRICS STRIP ================= */}
        <div className="px-4 py-3 border-b border-border-subtle/60 bg-bg-base grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs shrink-0">
          <div className="p-3 bg-surface-card rounded-lg border border-border-subtle space-y-1">
            <span className="text-[11px] text-text-muted block font-medium">Total Sessions</span>
            <span className="text-lg font-bold text-text-primary font-mono">148</span>
            <span className="text-[10px] text-text-muted block">Over 45 Days</span>
          </div>

          <div className="p-3 bg-surface-card rounded-lg border border-border-subtle space-y-1">
            <span className="text-[11px] text-text-muted block font-medium">Unique Contacts</span>
            <span className="text-lg font-bold text-telecom-cyan font-mono">18 MSISDNs</span>
            <span className="text-[10px] text-text-muted block">3 Suspect Nodes</span>
          </div>

          <div className="p-3 bg-surface-card rounded-lg border border-border-subtle space-y-1">
            <span className="text-[11px] text-text-muted block font-medium">Active Days</span>
            <span className="text-lg font-bold text-text-primary font-mono">24 Days</span>
            <span className="text-[10px] text-text-muted block">Peak: Aug 14-16</span>
          </div>

          <div className="p-3 bg-surface-card rounded-lg border border-border-subtle space-y-1">
            <span className="text-[11px] text-text-muted block font-medium">Avg Duration</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">4m 18s</span>
            <span className="text-[10px] text-text-muted block">Max: 23m 40s</span>
          </div>

          <div className="p-3 bg-surface-card rounded-lg border border-border-subtle space-y-1">
            <span className="text-[11px] text-text-muted block font-medium">Flagged Calls</span>
            <span className="text-lg font-bold text-threat-crimson font-mono">14</span>
            <span className="text-[10px] text-threat-crimson block font-medium">Mule Co-timing</span>
          </div>

          <div className="p-3 bg-surface-card rounded-lg border border-border-subtle space-y-1">
            <span className="text-[11px] text-text-muted block font-medium">Cell Sectors</span>
            <span className="text-lg font-bold text-amber-300 font-mono">4 Towers</span>
            <span className="text-[10px] text-text-muted block">Mumbai / Andheri</span>
          </div>
        </div>

        {/* Ethical Safeguard Banner */}
        <div className="px-4 py-2 bg-blue-950/25 border-b border-blue-500/30 text-blue-200/90 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-telecom-cyan shrink-0" />
            <span>
              <strong>Statutory Evidentiary Principle:</strong> Telephony contact establishes technical communication, not shared criminal conspiracy. Nexus requires corroboration via statements or panchnama.
            </span>
          </div>
          <span className="text-text-muted text-[10px] font-mono">Section 65B Compliant</span>
        </div>

        {/* ================= 3. CONTROLS & TAB SWITCHER ================= */}
        <div className="px-4 py-2 border-b border-border-subtle bg-surface-card flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center bg-bg-base rounded-md border border-border-subtle p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("call_graph")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "call_graph"
                  ? "bg-telecom-cyan/15 text-telecom-cyan font-semibold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Call Relationship Graph
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("records")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "records"
                  ? "bg-telecom-cyan/15 text-telecom-cyan font-semibold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              CDR Records Log
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("temporal")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "temporal"
                  ? "bg-telecom-cyan/15 text-telecom-cyan font-semibold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Temporal &amp; Tower Analysis
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-text-muted">Type:</span>
            {(["ALL", "VOICE_CALL", "SMS", "ENCRYPTED_DATA_VOIP"] as const).map((ct) => (
              <button
                key={ct}
                type="button"
                onClick={() => setSelectedCallType(ct)}
                className={`px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer ${
                  selectedCallType === ct
                    ? "border-telecom-cyan text-telecom-cyan bg-telecom-cyan/10 font-semibold"
                    : "border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-overlay"
                }`}
              >
                {ct.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* ================= 4. TAB CONTENTS ================= */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
          {/* TAB 1: CALL RELATIONSHIP GRAPH (Person A -> Phone A -> Phone B -> Person B) */}
          {activeTab === "call_graph" && (
            <div className="space-y-3">
              {/* Visual 4-Hop Call Correlation Flow */}
              <div className="p-4 bg-surface-card border border-border-subtle space-y-4">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center justify-between pb-2 border-b border-border-subtle">
                  <span>TELEPHONY BRIDGE: PERSON A → PHONE A → PHONE B → PERSON B</span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    CORRELATED WITH FIR-0104/2026
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Entity 1: Person A */}
                  <div className="p-3 bg-bg-base border border-border-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted uppercase">CALLER SUBJECT</span>
                      <User className="w-3.5 h-3.5 text-telecom-cyan" />
                    </div>
                    <div className="text-xs font-bold text-text-primary">Vikram Sharma</div>
                    <div className="text-[10px] text-text-muted">Primary Accused [FIR 104]</div>
                    <div className="text-[9px] text-amber-400">Presumption: Innocent until trial</div>
                  </div>

                  {/* Hop 1 -> 2: Phone A */}
                  <div className="p-3 bg-bg-base border border-telecom-cyan/40 bg-telecom-cyan/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-telecom-cyan uppercase font-bold">SOURCE MSISDN</span>
                      <Smartphone className="w-3.5 h-3.5 text-telecom-cyan" />
                    </div>
                    <div className="text-xs font-bold text-telecom-cyan">+91 98250 XXXXX</div>
                    <div className="text-[10px] text-text-muted">IMEI: 356938035643809</div>
                    <div className="text-[9px] text-text-muted">Reliance Jio 5G Prepaid</div>
                  </div>

                  {/* Hop 2 -> 3: Phone B */}
                  <div className="p-3 bg-bg-base border border-threat-crimson/40 bg-threat-crimson/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-threat-crimson uppercase font-bold">CALLED MSISDN</span>
                      <Smartphone className="w-3.5 h-3.5 text-threat-crimson" />
                    </div>
                    <div className="text-xs font-bold text-threat-crimson">+91 98111 XXXXX</div>
                    <div className="text-[10px] text-text-muted">IMEI: 867492049102941</div>
                    <div className="text-[9px] text-text-muted">Bharti Airtel VoLTE</div>
                  </div>

                  {/* Entity 4: Person B */}
                  <div className="p-3 bg-bg-base border border-border-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted uppercase">CALLEE SUBJECT</span>
                      <User className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xs font-bold text-text-primary">Rahul Desai</div>
                    <div className="text-[10px] text-text-muted">Co-Accused [Absconding]</div>
                    <div className="text-[9px] text-emerald-400">14 Direct Conferences Logged</div>
                  </div>
                </div>

                {/* Call Detail Highlights */}
                <div className="p-3 bg-bg-base border border-border-subtle text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <RadioTower className="w-4 h-4 text-telecom-cyan" />
                    <div>
                      <span className="text-text-primary font-bold">COMMON TOWER COLLISION: </span>
                      <span className="text-text-secondary">Andheri East Sector 4 (Azimuth Cone 120°)</span>
                    </div>
                  </div>
                  <div className="text-text-muted text-[11px]">
                    CONCURRENT PHYSICAL PROXIMITY CONFIRMED DURING MONEY TRANSFER
                  </div>
                </div>
              </div>

              {/* Contact Frequency Matrix */}
              <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider pb-1 border-b border-border-subtle">
                  TOP COMMUNICATING IDENTIFIERS (CONTACT FREQUENCY)
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-bg-base border border-border-subtle">
                    <div>
                      <span className="font-bold text-text-primary">+91 98111 XXXXX (Rahul Desai)</span>
                      <span className="text-[10px] text-text-muted block">38 Calls | 4hr 12m Aggregated</span>
                    </div>
                    <div className="w-36 h-2 bg-surface-card rounded-full overflow-hidden border border-border-subtle">
                      <div className="bg-threat-crimson h-full" style={{ width: "85%" }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-bg-base border border-border-subtle">
                    <div>
                      <span className="font-bold text-text-primary">+91 97410 XXXXX (Anisur Rahman)</span>
                      <span className="text-[10px] text-text-muted block">14 Calls | 52m Aggregated</span>
                    </div>
                    <div className="w-36 h-2 bg-surface-card rounded-full overflow-hidden border border-border-subtle">
                      <div className="bg-telecom-cyan h-full" style={{ width: "45%" }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-bg-base border border-border-subtle">
                    <div>
                      <span className="font-bold text-text-primary">+91 99102 XXXXX (Rajesh Malhotra)</span>
                      <span className="text-[10px] text-text-muted block">8 Calls | 18m Aggregated</span>
                    </div>
                    <div className="w-36 h-2 bg-surface-card rounded-full overflow-hidden border border-border-subtle">
                      <div className="bg-amber-400 h-full" style={{ width: "25%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CDR RECORDS TABLE */}
          {activeTab === "records" && (
            <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  TELECOM LOG REPOSITORY ({filteredRecords.length} SESSIONS)
                </div>
                <button
                  type="button"
                  onClick={() => alert("Exporting Section 65B Certified CSV...")}
                  className="px-2 py-1 bg-telecom-cyan/10 hover:bg-telecom-cyan/20 border border-telecom-cyan/40 text-telecom-cyan text-[10px] font-bold cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>EXPORT CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase">
                      <th className="py-2 px-2">CALL ID</th>
                      <th className="py-2 px-2">TIMESTAMP</th>
                      <th className="py-2 px-2">SOURCE MSISDN</th>
                      <th className="py-2 px-2">TARGET MSISDN</th>
                      <th className="py-2 px-2">TYPE</th>
                      <th className="py-2 px-2">DURATION</th>
                      <th className="py-2 px-2">CELL TOWER SECTOR</th>
                      <th className="py-2 px-2">CARRIER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50 font-mono">
                    {filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-surface-overlay/50 transition-colors">
                        <td className="py-2 px-2 text-telecom-cyan font-bold">{rec.id}</td>
                        <td className="py-2 px-2 text-text-muted text-[11px]">{rec.timestamp}</td>
                        <td className="py-2 px-2 text-text-primary">{rec.sourceNumber}</td>
                        <td className="py-2 px-2 text-text-primary">{rec.targetNumber}</td>
                        <td className="py-2 px-2">
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold border ${
                              rec.callType === "ENCRYPTED_DATA_VOIP"
                                ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                                : rec.callType === "SMS"
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                                : "border-telecom-cyan/40 bg-telecom-cyan/10 text-telecom-cyan"
                            }`}
                          >
                            {rec.callType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-text-primary">{rec.durationSeconds}s</td>
                        <td className="py-2 px-2 text-text-secondary text-[11px]">{rec.cellTowerLocation}</td>
                        <td className="py-2 px-2 text-text-muted text-[11px]">{rec.carrier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TEMPORAL & BTS ANALYSIS */}
          {activeTab === "temporal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-surface-card border border-border-subtle space-y-2">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider pb-1 border-b border-border-subtle">
                  DIURNAL TEMPORAL DISTRIBUTION (HOURLY DENSITY)
                </div>
                <div className="space-y-1.5 pt-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">00:00 - 06:00 (NIGHT BURST):</span>
                    <span className="text-threat-crimson font-bold">42 Calls (38%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">06:00 - 12:00 (MORNING):</span>
                    <span className="text-text-primary font-bold">18 Calls (14%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">12:00 - 18:00 (BUSINESS HOURS):</span>
                    <span className="text-text-primary font-bold">28 Calls (21%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">18:00 - 24:00 (EVENING PEAK):</span>
                    <span className="text-telecom-cyan font-bold">36 Calls (27%)</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-surface-card border border-border-subtle space-y-2">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider pb-1 border-b border-border-subtle">
                  SEIZED HARDWARE (IMEI BINDINGS)
                </div>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-2 bg-bg-base border border-border-subtle">
                    <div className="text-text-primary font-bold">IMEI 356938035643809</div>
                    <div className="text-[10px] text-text-muted">Handset: OnePlus 11 5G (Dual SIM)</div>
                    <div className="text-[9px] text-emerald-400">Matched Seizure Panchnama #084</div>
                  </div>
                  <div className="p-2 bg-bg-base border border-border-subtle">
                    <div className="text-text-primary font-bold">IMEI 867492049102941</div>
                    <div className="text-[10px] text-text-muted">Handset: Vivo Y20 Burner Handset</div>
                    <div className="text-[9px] text-amber-400">Used for OTP Interception Only</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkstationShell>
  );
}
