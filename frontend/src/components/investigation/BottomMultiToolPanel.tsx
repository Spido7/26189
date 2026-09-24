"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Clock,
  MapPin,
  FileCheck2,
  PhoneCall,
  BookOpen,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Search,
  ExternalLink,
  Plus,
  Radio,
  FileText,
  Hash,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2
} from "lucide-react";
import { InvestigationNode, InvestigationEdge } from "@/lib/graph-engine";
import { MOCK_CASES, MOCK_EVIDENCE_ITEMS, MOCK_AUDIT_LOGS, CURRENT_INVESTIGATOR } from "@/data/dfir-mock-database";
import { cdr_records, fir_records } from "@/data/mockDatabase";
import { DFIREvidenceItem } from "@/types/evidence";

interface BottomMultiToolPanelProps {
  caseId: string;
  nodes: InvestigationNode[];
  edges: InvestigationEdge[];
  activeTimeWindow: [number, number] | null; // min and max timestamp (ms)
  onTimeWindowChange: (window: [number, number] | null) => void;
  onSelectNode: (nodeId: string) => void;
  onFocusNode?: (nodeId: string) => void;
  selectedNodeId: string | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

type TabType = "timeline" | "map" | "evidence" | "cdr" | "diary";

// Geospatial tactical points
interface GeoPoint {
  id: string;
  name: string;
  type: "BTS" | "SAFEHOUSE" | "ISP_GATEWAY" | "SERVER_FARM";
  coords: { x: number; y: number }; // normalized 0-100 on tactical grid
  latLng: string;
  city: string;
  sectorAzimuth?: number; // degrees for BTS
  associatedNodeIds: string[];
  description: string;
  caseRef: string;
}

const TACTICAL_GEO_POINTS: GeoPoint[] = [
  {
    id: "geo-bkc-gateway",
    name: "BKC Telco Intercept Node",
    type: "ISP_GATEWAY",
    coords: { x: 38, y: 55 },
    latLng: "19.0657° N, 72.8687° E",
    city: "Mumbai",
    associatedNodeIds: ["node-ip-115", "node-evd-001"],
    description: "Cisco Nexus Core Switch tap point for Jio 5G BKC Ingress Session",
    caseRef: "FIR-0104/2026"
  },
  {
    id: "geo-andheri-safehouse",
    name: "Andheri East Phishing Den",
    type: "SAFEHOUSE",
    coords: { x: 36, y: 50 },
    latLng: "19.1136° N, 72.8697° E",
    city: "Mumbai",
    associatedNodeIds: ["node-person-vikram", "node-person-rahul", "node-dev-router", "node-bts-andheri"],
    description: "Physical apartment raid site; recovered dual-band router MAC 4A:2B:CC:91:0F:11",
    caseRef: "FIR-0104/2026"
  },
  {
    id: "geo-bts-andheri-e",
    name: "Andheri East BTS Cell #4092",
    type: "BTS",
    coords: { x: 37, y: 49 },
    latLng: "19.1150° N, 72.8710° E",
    city: "Mumbai",
    sectorAzimuth: 120,
    associatedNodeIds: ["node-bts-andheri", "node-phone-98250", "node-phone-98251"],
    description: "Primary serving tower sector overlapping with Andheri safehouse",
    caseRef: "FIR-0104/2026"
  },
  {
    id: "geo-jamtara-karmatar",
    name: "Karmatar Syndicate Ground",
    type: "SAFEHOUSE",
    coords: { x: 68, y: 38 },
    latLng: "24.0921° N, 86.8521° E",
    city: "Jamtara, JH",
    associatedNodeIds: ["node-person-sunil", "node-person-deepak", "node-phone-98351"],
    description: "Rural command cluster for organized KYC banking OTP spoofing",
    caseRef: "FIR-0104/2026"
  },
  {
    id: "geo-bengaluru-indiranagar",
    name: "Indiranagar Hawala Den",
    type: "SAFEHOUSE",
    coords: { x: 44, y: 76 },
    latLng: "12.9716° N, 77.5946° E",
    city: "Bengaluru",
    associatedNodeIds: ["node-person-anisur", "node-evd-884"],
    description: "Seized Supermicro server hosting encrypted Flokinet Tor relay",
    caseRef: "FIR-2024-8842"
  },
  {
    id: "geo-bts-indiranagar",
    name: "Indiranagar 100ft BTS-03",
    type: "BTS",
    coords: { x: 45, y: 77 },
    latLng: "12.9784° N, 77.6408° E",
    city: "Bengaluru",
    sectorAzimuth: 240,
    associatedNodeIds: ["node-person-anisur", "node-phone-97410"],
    description: "Tower cell tracking Signal encrypted calls concurrently with Bitcoin transfers",
    caseRef: "FIR-2024-8842"
  },
  {
    id: "geo-delhi-chandni-chowk",
    name: "Kucha Ghasi Ram Escrow Vault",
    type: "SAFEHOUSE",
    coords: { x: 46, y: 25 },
    latLng: "28.6505° N, 77.2303° E",
    city: "Old Delhi",
    associatedNodeIds: ["node-person-harish", "node-phone-98110"],
    description: "Cash smurfing hub and parallel book ledger consolidation office",
    caseRef: "FIR-2024-8842"
  },
  {
    id: "geo-cbi-hq",
    name: "CBI HQ Digital Processing Facility",
    type: "ISP_GATEWAY",
    coords: { x: 47, y: 27 },
    latLng: "28.5889° N, 77.2272° E",
    city: "New Delhi",
    associatedNodeIds: ["node-evd-771", "node-fir-7719"],
    description: "Special Cyber Crime Unit forensic processing server grid",
    caseRef: "FIR-7719/2026"
  },
  {
    id: "geo-frankfurt-vps",
    name: "Linode Cloud Datacenter FRA-1",
    type: "SERVER_FARM",
    coords: { x: 15, y: 18 },
    latLng: "50.1109° N, 8.6821° E",
    city: "Frankfurt, DE",
    associatedNodeIds: ["node-ip-45-33"],
    description: "Command & Control server hosting LockBit 3.0 AES-GCM payment portal",
    caseRef: "FIR-7719/2026"
  }
];

export function BottomMultiToolPanel({
  caseId,
  nodes,
  edges,
  activeTimeWindow,
  onTimeWindowChange,
  onSelectNode,
  onFocusNode,
  selectedNodeId,
  isExpanded,
  onToggleExpand,
}: BottomMultiToolPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("timeline");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [cdrFilter, setCdrFilter] = useState("");
  const [selectedGeoPoint, setSelectedGeoPoint] = useState<GeoPoint | null>(null);
  const [show65BModal, setShow65BModal] = useState<DFIREvidenceItem | null>(null);

  // Case Diary User Form State
  const [diaryNoteText, setDiaryNoteText] = useState("");
  const [userCaseNotes, setUserCaseNotes] = useState<
    Array<{
      id: string;
      author: string;
      role: string;
      timestamp: string;
      content: string;
      caseRef: string;
      hash: string;
    }>
  >([]);

  // 1. TIMELINE COMPUTATION
  const timeEvents = useMemo(() => {
    const events: Array<{
      id: string;
      timeMs: number;
      dateFormatted: string;
      title: string;
      description: string;
      category: "LEGAL" | "SEIZURE" | "INTERCEPT" | "AI_ASSESSMENT" | "NETWORK" | "CALL";
      nodeId?: string;
      caseRef: string;
    }> = [];

    // Extract from MOCK_CASES timelines
    MOCK_CASES.forEach((c) => {
      c.timeline.forEach((tl) => {
        // parse rough date
        const d = new Date(tl.timestamp);
        const timeMs = isNaN(d.getTime()) ? Date.parse("2026-08-14T00:00:00Z") : d.getTime();
        events.push({
          id: tl.id,
          timeMs,
          dateFormatted: tl.timestamp,
          title: tl.title,
          description: tl.description,
          category: tl.category as any,
          caseRef: c.id,
        });
      });
      // Extract case notes
      c.notes.forEach((n) => {
        const d = new Date(n.timestamp);
        events.push({
          id: n.id,
          timeMs: d.getTime(),
          dateFormatted: n.timestamp,
          title: `Diary Entry (${n.author})`,
          description: n.content,
          category: "LEGAL",
          caseRef: c.id,
        });
      });
    });

    // Extract from evidence items
    MOCK_EVIDENCE_ITEMS.forEach((ev) => {
      const d = new Date(ev.acquiredAt);
      events.push({
        id: ev.id,
        timeMs: d.getTime(),
        dateFormatted: ev.acquiredAt,
        title: `Evidence Seized: ${ev.id}`,
        description: ev.title,
        category: "SEIZURE",
        nodeId: `node-evd-${ev.id.replace("EVD-", "").toLowerCase()}`,
        caseRef: ev.caseId,
      });
    });

    // Extract from CDR records
    Object.entries(cdr_records).forEach(([phone, calls]) => {
      calls.forEach((call, idx) => {
        const d = new Date(call.timestamp);
        events.push({
          id: `cdr-${phone}-${idx}`,
          timeMs: d.getTime(),
          dateFormatted: call.timestamp,
          title: `Call: ${call.type} (${call.duration})`,
          description: `${phone} ➔ ${call.dialed_no} via ${call.bts_tower}`,
          category: "CALL",
          caseRef: "ALL",
        });
      });
    });

    // Filter by active case if not ALL
    const filtered = caseId === "ALL" 
      ? events 
      : events.filter((e) => e.caseRef === caseId || e.caseRef === "ALL");

    // Sort ascending
    return filtered.sort((a, b) => a.timeMs - b.timeMs);
  }, [caseId]);

  const minTime = useMemo(() => {
    if (timeEvents.length === 0) return Date.parse("2024-10-01T00:00:00Z");
    return timeEvents[0].timeMs;
  }, [timeEvents]);

  const maxTime = useMemo(() => {
    if (timeEvents.length === 0) return Date.parse("2026-09-30T00:00:00Z");
    return timeEvents[timeEvents.length - 1].timeMs;
  }, [timeEvents]);

  // Current scrubber value
  const [currentScrubberTime, setCurrentScrubberTime] = useState<number>(maxTime);

  useEffect(() => {
    setCurrentScrubberTime(maxTime);
  }, [maxTime]);

  // Auto playback loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentScrubberTime((prev) => {
          const step = (maxTime - minTime) / 100 * playbackSpeed;
          const next = prev + step;
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return next;
        });
      }, 300);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, maxTime, minTime, playbackSpeed]);

  // Sync scrubber changes to parent filter
  const handleScrubberChange = (val: number) => {
    setCurrentScrubberTime(val);
    onTimeWindowChange([minTime, val]);
  };

  const handleResetTime = () => {
    setIsPlaying(false);
    setCurrentScrubberTime(maxTime);
    onTimeWindowChange(null);
  };

  // 2. GEOSPATIAL FILTER
  const visibleGeoPoints = useMemo(() => {
    if (caseId === "ALL") return TACTICAL_GEO_POINTS;
    return TACTICAL_GEO_POINTS.filter((p) => p.caseRef === caseId);
  }, [caseId]);

  // 3. EVIDENCE LIST
  const visibleEvidence = useMemo(() => {
    if (caseId === "ALL") return MOCK_EVIDENCE_ITEMS;
    return MOCK_EVIDENCE_ITEMS.filter((e) => e.caseId === caseId);
  }, [caseId]);

  // 4. CDR CALL MATRIX
  const flatCdrRecords = useMemo(() => {
    const list: Array<{
      caller: string;
      dialed: string;
      type: string;
      duration: string;
      timestamp: string;
      bts: string;
      imei: string;
      counterparty: string;
      status: string;
    }> = [];

    Object.entries(cdr_records).forEach(([phone, calls]) => {
      calls.forEach((c) => {
        list.push({
          caller: phone,
          dialed: c.dialed_no,
          type: c.type,
          duration: c.duration,
          timestamp: c.timestamp,
          bts: c.bts_tower,
          imei: c.imei,
          counterparty: c.counterparty,
          status: c.status,
        });
      });
    });

    if (!cdrFilter.trim()) return list;
    const q = cdrFilter.toLowerCase();
    return list.filter(
      (c) =>
        c.caller.toLowerCase().includes(q) ||
        c.dialed.toLowerCase().includes(q) ||
        c.bts.toLowerCase().includes(q) ||
        c.counterparty.toLowerCase().includes(q) ||
        c.imei.toLowerCase().includes(q)
    );
  }, [cdrFilter]);

  // 5. CASE DIARY ENTRIES
  const allDiaryNotes = useMemo(() => {
    const notes: Array<{
      id: string;
      author: string;
      role: string;
      timestamp: string;
      content: string;
      caseRef: string;
      hash?: string;
    }> = [];

    MOCK_CASES.forEach((c) => {
      c.notes.forEach((n) => {
        notes.push({
          ...n,
          caseRef: c.id,
          hash: `SHA256:0x${Math.abs(n.id.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)).toString(16).padStart(16, "0")}`
        });
      });
    });

    userCaseNotes.forEach((u) => {
      notes.push(u);
    });

    const filtered = caseId === "ALL" ? notes : notes.filter((n) => n.caseRef === caseId);
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [caseId, userCaseNotes]);

  const handleAddDiaryNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryNoteText.trim()) return;

    const newNote = {
      id: `NOTE-USER-${Date.now().toString(36)}`,
      author: CURRENT_INVESTIGATOR.name,
      role: `Investigator (${CURRENT_INVESTIGATOR.badgeNumber})`,
      timestamp: new Date().toISOString(),
      content: diaryNoteText.trim(),
      caseRef: caseId === "ALL" ? "FIR-0104/2026" : caseId,
      hash: `SHA256:0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    };

    setUserCaseNotes((prev) => [newNote, ...prev]);
    setDiaryNoteText("");
  };

  return (
    <aside 
      aria-label="Investigative Bottom Multi-Tool Panel"
      className={`border-t border-border-subtle bg-surface-card transition-all duration-300 flex flex-col z-20 shadow-2xl ${
        isExpanded ? "h-[290px]" : "h-9"
      }`}
    >
      {/* HEADER / TOOL TABS BAR */}
      <div className="h-9 px-3 bg-surface-overlay border-b border-border-subtle flex items-center justify-between select-none">
        <div className="flex items-center space-x-1">
          {/* TAB 1: TIMELINE */}
          <button
            onClick={() => {
              setActiveTab("timeline");
              if (!isExpanded) onToggleExpand();
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              activeTab === "timeline" && isExpanded
                ? "bg-industrial-slate text-telecom-cyan border border-telecom-cyan/30"
                : "text-text-muted hover:text-text-primary hover:bg-surface-card"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>TIMELINE SCRUBBER</span>
            {timeEvents.length > 0 && (
              <span className="px-1 text-[10px] bg-bg-base/70 text-telecom-cyan rounded">
                {timeEvents.length}
              </span>
            )}
          </button>

          {/* TAB 2: GEOSPATIAL */}
          <button
            onClick={() => {
              setActiveTab("map");
              if (!isExpanded) onToggleExpand();
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              activeTab === "map" && isExpanded
                ? "bg-industrial-slate text-record-amber border border-record-amber/30"
                : "text-text-muted hover:text-text-primary hover:bg-surface-card"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>GEO INTEL & BTS</span>
            <span className="px-1 text-[10px] bg-bg-base/70 text-record-amber rounded">
              {visibleGeoPoints.length}
            </span>
          </button>

          {/* TAB 3: EVIDENCE LEDGER */}
          <button
            onClick={() => {
              setActiveTab("evidence");
              if (!isExpanded) onToggleExpand();
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              activeTab === "evidence" && isExpanded
                ? "bg-industrial-slate text-emerald-400 border border-emerald-500/30"
                : "text-text-muted hover:text-text-primary hover:bg-surface-card"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>EVIDENCE // SEC 65B</span>
            <span className="px-1 text-[10px] bg-bg-base/70 text-emerald-400 rounded">
              {visibleEvidence.length}
            </span>
          </button>

          {/* TAB 4: CDR CALL MATRIX */}
          <button
            onClick={() => {
              setActiveTab("cdr");
              if (!isExpanded) onToggleExpand();
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              activeTab === "cdr" && isExpanded
                ? "bg-industrial-slate text-accused-violet border border-accused-violet/30"
                : "text-text-muted hover:text-text-primary hover:bg-surface-card"
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>CDR MATRIX</span>
            <span className="px-1 text-[10px] bg-bg-base/70 text-accused-violet rounded">
              {flatCdrRecords.length}
            </span>
          </button>

          {/* TAB 5: CASE DIARY */}
          <button
            onClick={() => {
              setActiveTab("diary");
              if (!isExpanded) onToggleExpand();
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              activeTab === "diary" && isExpanded
                ? "bg-industrial-slate text-text-primary border border-border-highlight"
                : "text-text-muted hover:text-text-primary hover:bg-surface-card"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>CASE DIARY & AUDIT</span>
            <span className="px-1 text-[10px] bg-bg-base/70 text-text-secondary rounded">
              {allDiaryNotes.length}
            </span>
          </button>
        </div>

        {/* RIGHT COLLAPSE & STATUS CONTROLS */}
        <div className="flex items-center space-x-3">
          {activeTimeWindow && (
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-record-amber bg-record-amber/10 px-2 py-0.5 rounded border border-record-amber/30">
              <span className="w-1.5 h-1.5 rounded-full bg-record-amber animate-pulse" />
              <span>TIME WINDOW FILTER ACTIVE</span>
              <button
                onClick={handleResetTime}
                className="ml-1 hover:text-threat-crimson underline text-[10px]"
              >
                Clear
              </button>
            </div>
          )}

          <div className="text-[11px] font-mono text-text-muted">
            IO: <span className="text-text-primary">{CURRENT_INVESTIGATOR.badgeNumber}</span>
          </div>

          <button
            onClick={onToggleExpand}
            className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-card rounded transition-colors"
            title={isExpanded ? "Collapse Panel" : "Expand Multi-Tool"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* EXPANDABLE BODY CONTENT */}
      {isExpanded && (
        <div className="flex-1 overflow-hidden bg-bg-base/90 p-3">
          {/* TAB 1: SYNCHRONIZED TIMELINE SCRUBBER */}
          {activeTab === "timeline" && (
            <div className="h-full flex flex-col justify-between">
              {/* Top Controls: Playback, Window, Milestone Summary */}
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-surface-card border border-border-subtle hover:border-telecom-cyan/50 text-xs font-mono text-text-primary rounded"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 text-record-amber" /> : <Play className="w-3.5 h-3.5 text-telecom-cyan" />}
                    <span>{isPlaying ? "PAUSE REPLAY" : "PLAY TIMELINE"}</span>
                  </button>

                  <button
                    onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
                    className="px-2 py-1 bg-surface-card border border-border-subtle text-xs font-mono text-text-secondary hover:text-text-primary rounded"
                  >
                    {playbackSpeed}x SPEED
                  </button>

                  <button
                    onClick={handleResetTime}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-surface-card border border-border-subtle text-xs font-mono text-text-secondary hover:text-text-primary rounded"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>RESET RANGE</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono text-text-secondary">
                  <span>START: <strong className="text-text-primary">{new Date(minTime).toLocaleDateString()}</strong></span>
                  <span>➔</span>
                  <span>CURRENT: <strong className="text-telecom-cyan">{new Date(currentScrubberTime).toLocaleString()}</strong></span>
                  <span>➔</span>
                  <span>END: <strong className="text-text-primary">{new Date(maxTime).toLocaleDateString()}</strong></span>
                </div>
              </div>

              {/* Interactive Range Scrubber */}
              <div className="my-2 px-2">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min={minTime}
                    max={maxTime}
                    value={currentScrubberTime}
                    onChange={(e) => handleScrubberChange(Number(e.target.value))}
                    className="w-full h-2 bg-surface-overlay rounded-lg appearance-none cursor-pointer accent-telecom-cyan border border-border-subtle"
                  />
                </div>
              </div>

              {/* Event Milestone Badges Carousel */}
              <div className="flex-1 overflow-x-auto overflow-y-hidden py-1 flex items-center space-x-3 scrollbar-thin">
                {timeEvents.map((ev) => {
                  const isPassed = ev.timeMs <= currentScrubberTime;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => {
                        handleScrubberChange(ev.timeMs);
                        if (ev.nodeId) onSelectNode(ev.nodeId);
                      }}
                      className={`flex-shrink-0 w-64 p-2 rounded border cursor-pointer transition-all ${
                        isPassed
                          ? "bg-surface-card border-telecom-cyan/40 hover:border-telecom-cyan shadow-sm"
                          : "bg-surface-card/40 border-border-subtle/50 opacity-40 hover:opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted mb-1">
                        <span className={`px-1 rounded uppercase font-semibold ${
                          ev.category === "LEGAL" ? "bg-record-amber/20 text-record-amber" :
                          ev.category === "SEIZURE" ? "bg-emerald-500/20 text-emerald-400" :
                          ev.category === "INTERCEPT" ? "bg-telecom-cyan/20 text-telecom-cyan" :
                          "bg-accused-violet/20 text-accused-violet"
                        }`}>
                          {ev.category}
                        </span>
                        <span>{ev.dateFormatted}</span>
                      </div>
                      <div className="text-xs font-semibold text-text-primary truncate">{ev.title}</div>
                      <div className="text-[11px] text-text-secondary truncate mt-0.5">{ev.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GEOSPATIAL INTELLIGENCE MAP */}
          {activeTab === "map" && (
            <div className="h-full grid grid-cols-12 gap-3">
              {/* Tactical Cartographic Grid Map (Vector SVG) */}
              <div className="col-span-8 bg-surface-card border border-border-subtle rounded relative overflow-hidden flex items-center justify-center">
                {/* Tactical Grid Background */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#64748b 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                    backgroundPosition: "0 0, 12px 12px"
                  }}
                />

                {/* Radar Sweep Arc */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[380px] h-[380px] rounded-full border border-telecom-cyan/20 relative animate-spin [animation-duration:16s]">
                    <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent to-telecom-cyan/40 origin-left" />
                  </div>
                </div>

                {/* Coordinates Overlay */}
                <div className="absolute top-2 left-2 text-[10px] font-mono text-text-muted bg-bg-base/80 px-2 py-0.5 rounded border border-border-subtle">
                  GEO-INTEL GRID // INDIA NATIONAL TELECOM RECON // EPSG:4326
                </div>

                {/* Tactical Points Render */}
                <div className="relative w-full h-full">
                  {visibleGeoPoints.map((pt) => {
                    const isSelected = selectedGeoPoint?.id === pt.id;
                    return (
                      <div
                        key={pt.id}
                        onClick={() => {
                          setSelectedGeoPoint(pt);
                          if (pt.associatedNodeIds.length > 0) {
                            onSelectNode(pt.associatedNodeIds[0]);
                            if (onFocusNode) onFocusNode(pt.associatedNodeIds[0]);
                          }
                        }}
                        style={{
                          left: `${pt.coords.x}%`,
                          top: `${pt.coords.y}%`,
                        }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      >
                        <div className="relative flex items-center justify-center">
                          {/* Sector Azimuth Cone for BTS */}
                          {pt.type === "BTS" && pt.sectorAzimuth !== undefined && (
                            <div
                              style={{
                                transform: `rotate(${pt.sectorAzimuth}deg)`,
                              }}
                              className="absolute w-12 h-12 bg-gradient-to-b from-telecom-cyan/25 to-transparent clip-path-polygon pointer-events-none"
                            />
                          )}

                          {/* Ping Ring */}
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-threat-crimson border-threat-crimson ring-4 ring-threat-crimson/30 animate-pulse"
                              : pt.type === "SAFEHOUSE"
                              ? "bg-record-amber border-record-amber group-hover:scale-125"
                              : pt.type === "BTS"
                              ? "bg-telecom-cyan border-telecom-cyan group-hover:scale-125"
                              : "bg-accused-violet border-accused-violet group-hover:scale-125"
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-bg-base" />
                          </div>
                        </div>

                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                          <div className="bg-surface-overlay border border-border-highlight px-2 py-1 rounded shadow-lg text-[10px] font-mono whitespace-nowrap text-text-primary">
                            <strong>{pt.name}</strong> ({pt.city})
                            <div className="text-text-muted">{pt.latLng}</div>
                          </div>
                          <div className="w-1.5 h-1.5 bg-border-highlight transform rotate-45 -mt-0.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Geo Intel Details Sidebar */}
              <div className="col-span-4 bg-surface-card border border-border-subtle rounded p-3 flex flex-col justify-between overflow-y-auto">
                {selectedGeoPoint ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-surface-overlay text-record-amber rounded border border-border-subtle uppercase">
                        {selectedGeoPoint.type}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted">{selectedGeoPoint.city}</span>
                    </div>

                    <h4 className="text-sm font-bold text-text-primary">{selectedGeoPoint.name}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{selectedGeoPoint.description}</p>

                    <div className="bg-surface-overlay p-2 rounded border border-border-subtle text-xs font-mono space-y-1">
                      <div className="text-text-muted">COORDINATES: <span className="text-text-primary">{selectedGeoPoint.latLng}</span></div>
                      <div className="text-text-muted">LINKED NODES: <span className="text-telecom-cyan">{selectedGeoPoint.associatedNodeIds.join(", ")}</span></div>
                    </div>

                    <div className="pt-2 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (selectedGeoPoint.associatedNodeIds[0]) {
                            onSelectNode(selectedGeoPoint.associatedNodeIds[0]);
                            if (onFocusNode) onFocusNode(selectedGeoPoint.associatedNodeIds[0]);
                          }
                        }}
                        className="w-full py-1.5 bg-telecom-cyan/20 hover:bg-telecom-cyan/30 text-telecom-cyan border border-telecom-cyan/40 rounded text-xs font-mono transition-colors"
                      >
                        FOCUS ASSOCIATED NODE IN GRAPH
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-text-muted">
                    <MapPin className="w-8 h-8 text-industrial-steel mb-2" />
                    <div className="text-xs font-mono">SELECT A LOCATION PIN ON THE GRID</div>
                    <div className="text-[11px] text-text-muted mt-1">Cross-correlate cell towers, safehouses & server hops with graph entities.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE & CHAIN OF CUSTODY LEDGER */}
          {activeTab === "evidence" && (
            <div className="h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-mono text-text-muted flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SECTION 65B (IEA) / SECTION 63 (BSA) COMPLIANT EVIDENCE LEDGER</span>
                </div>
                <div className="text-xs font-mono text-text-secondary">
                  HYPERLEDGER FABRIC ANCHORS: <strong className="text-emerald-400">VERIFIED ON-CHAIN</strong>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto border border-border-subtle rounded scrollbar-thin">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-overlay text-text-muted uppercase text-[10px] sticky top-0 border-b border-border-subtle">
                    <tr>
                      <th className="p-2">EVIDENCE ID</th>
                      <th className="p-2">TITLE & SOURCE</th>
                      <th className="p-2">FORMAT / SIZE</th>
                      <th className="p-2">CRYPTOGRAPHIC SHA-256 HASH</th>
                      <th className="p-2">SEIZING OFFICER</th>
                      <th className="p-2 text-right">CERTIFICATION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-text-secondary bg-surface-card">
                    {visibleEvidence.map((ev) => (
                      <tr key={ev.id} className="hover:bg-surface-overlay transition-colors">
                        <td className="p-2 font-bold text-text-primary whitespace-nowrap">{ev.id}</td>
                        <td className="p-2">
                          <div className="text-text-primary font-semibold truncate max-w-xs">{ev.title}</div>
                          <div className="text-[10px] text-text-muted truncate">{ev.sourceDevice}</div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 bg-bg-base border border-border-subtle rounded text-[10px] text-telecom-cyan">
                            {ev.format}
                          </span>{" "}
                          <span className="text-[10px] text-text-muted">{ev.sizeFormatted}</span>
                        </td>
                        <td className="p-2 font-mono text-[10px] text-text-muted truncate max-w-[200px]" title={ev.sha256Hash}>
                          {ev.sha256Hash.substring(0, 20)}...
                        </td>
                        <td className="p-2 text-[11px] whitespace-nowrap">{ev.seizingOfficer}</td>
                        <td className="p-2 text-right whitespace-nowrap">
                          <button
                            onClick={() => setShow65BModal(ev)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[11px] transition-colors"
                          >
                            EXPORT SEC 65B
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TELEPHONY (CDR) CALL MATRIX */}
          {activeTab === "cdr" && (
            <div className="h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Search MSISDN, Tower, IMEI, Counterparty..."
                      value={cdrFilter}
                      onChange={(e) => setCdrFilter(e.target.value)}
                      className="pl-8 pr-3 py-1 bg-surface-card border border-border-subtle rounded text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accused-violet w-72"
                    />
                  </div>
                </div>
                <div className="text-xs font-mono text-text-secondary">
                  TOTAL LOGGED SESSIONS: <strong className="text-accused-violet">{flatCdrRecords.length}</strong>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto border border-border-subtle rounded scrollbar-thin">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-overlay text-text-muted uppercase text-[10px] sticky top-0 border-b border-border-subtle">
                    <tr>
                      <th className="p-2">CALL TIMESTAMP</th>
                      <th className="p-2">CALLER MSISDN</th>
                      <th className="p-2">TYPE</th>
                      <th className="p-2">DURATION</th>
                      <th className="p-2">COUNTERPARTY / DIALED</th>
                      <th className="p-2">BTS CELL TOWER</th>
                      <th className="p-2">IMEI MATCH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-text-secondary bg-surface-card">
                    {flatCdrRecords.map((cdr, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => {
                          // Try finding matching node by phone
                          const matchingNode = nodes.find(n => n.name.includes(cdr.caller.replace("+91 ", "").trim()));
                          if (matchingNode) {
                            onSelectNode(matchingNode.id);
                            if (onFocusNode) onFocusNode(matchingNode.id);
                          }
                        }}
                        className="hover:bg-surface-overlay transition-colors cursor-pointer"
                      >
                        <td className="p-2 text-text-muted whitespace-nowrap">{cdr.timestamp}</td>
                        <td className="p-2 font-bold text-text-primary whitespace-nowrap">{cdr.caller}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            cdr.type === "OUTGOING" ? "bg-telecom-cyan/20 text-telecom-cyan" : "bg-emerald-500/20 text-emerald-400"
                          }`}>
                            {cdr.type}
                          </span>
                        </td>
                        <td className="p-2 whitespace-nowrap">{cdr.duration}</td>
                        <td className="p-2">
                          <div className="text-text-primary truncate">{cdr.dialed}</div>
                          <div className="text-[10px] text-text-muted truncate">{cdr.counterparty}</div>
                        </td>
                        <td className="p-2 text-text-secondary truncate max-w-xs">{cdr.bts}</td>
                        <td className="p-2 font-mono text-[10px] text-text-muted">{cdr.imei}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CASE DIARY & AUDIT HISTORY */}
          {activeTab === "diary" && (
            <div className="h-full grid grid-cols-12 gap-3 overflow-hidden">
              {/* Left Column: Append Note Form */}
              <div className="col-span-5 bg-surface-card border border-border-subtle rounded p-3 flex flex-col justify-between">
                <form onSubmit={handleAddDiaryNote} className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-1">
                    <span className="text-xs font-mono font-bold text-text-primary flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-telecom-cyan" />
                      <span>LOG NEW CASE DIARY ENTRY</span>
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">CrPC Sec 172</span>
                  </div>

                  <div className="text-[11px] font-mono text-text-secondary">
                    AUTHOR: <strong className="text-text-primary">{CURRENT_INVESTIGATOR.name}</strong> ({CURRENT_INVESTIGATOR.badgeNumber})
                  </div>

                  <textarea
                    rows={4}
                    value={diaryNoteText}
                    onChange={(e) => setDiaryNoteText(e.target.value)}
                    placeholder="Enter factual investigative observation, search warrant execution, or witness statement summary..."
                    className="w-full bg-surface-overlay border border-border-subtle rounded p-2 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-telecom-cyan resize-none"
                  />

                  <button
                    type="submit"
                    disabled={!diaryNoteText.trim()}
                    className="w-full py-1.5 bg-telecom-cyan/20 hover:bg-telecom-cyan/30 text-telecom-cyan border border-telecom-cyan/40 rounded text-xs font-mono font-semibold transition-colors disabled:opacity-50"
                  >
                    APPEND ENTRY TO TAMPER-PROOF CASE DIARY
                  </button>
                </form>

                <div className="text-[10px] text-text-muted font-mono bg-bg-base/60 p-2 rounded border border-border-subtle mt-2">
                  🔒 Entries are cryptographically hashed and linked to Hyperledger audit trail upon submission.
                </div>
              </div>

              {/* Right Column: Historical Entries Stream */}
              <div className="col-span-7 bg-surface-card border border-border-subtle rounded p-3 overflow-y-auto space-y-2.5 scrollbar-thin">
                <div className="flex items-center justify-between border-b border-border-subtle pb-1">
                  <span className="text-xs font-mono font-bold text-text-primary">CASE DIARY LEDGER & AUDIT TRAIL</span>
                  <span className="text-[10px] font-mono text-emerald-400">HASH CHAIN INTACT</span>
                </div>

                {allDiaryNotes.map((note) => (
                  <div key={note.id} className="p-2.5 bg-surface-overlay border border-border-subtle rounded space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-semibold text-text-primary">{note.author} <span className="text-text-muted font-normal">({note.role})</span></span>
                      <span className="text-text-muted">{new Date(note.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{note.content}</p>
                    {note.hash && (
                      <div className="text-[10px] font-mono text-text-muted flex items-center space-x-1 pt-1 border-t border-border-subtle/50">
                        <Hash className="w-3 h-3 text-telecom-cyan" />
                        <span className="truncate">{note.hash}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 65B CERTIFICATE MODAL */}
      {show65BModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-border-highlight rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs text-text-secondary max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-text-primary font-mono">
                  CERTIFICATE UNDER SECTION 65B INDIAN EVIDENCE ACT / SECTION 63 BSA
                </h3>
              </div>
              <button
                onClick={() => setShow65BModal(null)}
                className="text-text-muted hover:text-text-primary text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-bg-base/80 p-4 rounded border border-border-subtle space-y-3 leading-relaxed">
              <p>
                I, <strong>{show65BModal.seizingOfficer || CURRENT_INVESTIGATOR.name}</strong>, holding designation of Lead Cyber Forensic Examiner, do hereby solemnly declare and certify under Section 65B(4) of the Indian Evidence Act, 1872 (and Section 63 of Bharatiya Sakshya Adhiniyam, 2023):
              </p>

              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  That the electronic record titled <strong>&quot;{show65BModal.title}&quot;</strong> bearing Evidence ID <strong>{show65BModal.id}</strong> was lawfully collected from <strong>{show65BModal.sourceDevice}</strong> situated at <strong>{show65BModal.seizureLocation}</strong>.
                </li>
                <li>
                  That during the period of seizure on <strong>{show65BModal.acquiredAt}</strong>, the target device/network tap was operating in its ordinary course and without unauthorized disruption.
                </li>
                <li>
                  That the cryptographic digital fingerprint (SHA-256) of the preserved file bitstream is verified as:
                  <div className="p-2 bg-surface-overlay border border-border-highlight rounded text-emerald-400 font-mono break-all mt-1">
                    {show65BModal.sha256Hash}
                  </div>
                </li>
                <li>
                  That the integrity proof has been anchored to immutable government ledger:
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Network: {show65BModal.blockchainAnchor?.ledgerNetwork} // Block #{show65BModal.blockchainAnchor?.blockNumber}
                  </div>
                </li>
              </ol>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <div className="text-[11px] text-text-muted">
                CERTIFICATE ID: 65B-{show65BModal.id}-{Date.now().toString(36).toUpperCase()}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShow65BModal(null)}
                  className="px-3 py-1.5 bg-surface-overlay hover:bg-surface-muted text-text-primary border border-border-subtle rounded text-xs font-mono"
                >
                  CLOSE
                </button>
                <button
                  onClick={() => {
                    alert(`Section 65B Certificate generated and signed for ${show65BModal.id}`);
                    setShow65BModal(null);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded text-xs font-mono font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT SIGNED PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
