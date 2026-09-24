"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import {
  Activity,
  Radio,
  Cpu,
  ShieldAlert,
  Flame,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  PieChart,
  Layers,
  Network,
  PhoneCall,
  Lock,
  Database,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Terminal,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";

// Hourly telemetry dataset for Threat Ingress timeline chart
const TIMELINE_DATA_24H = [
  { hour: "00:00", ingress: 34, threats: 2 },
  { hour: "02:00", ingress: 42, threats: 5 },
  { hour: "04:00", ingress: 28, threats: 1 },
  { hour: "06:00", ingress: 55, threats: 4 },
  { hour: "08:00", ingress: 88, threats: 12 },
  { hour: "10:00", ingress: 142, threats: 28 }, // Morning phishing peak
  { hour: "12:00", ingress: 110, threats: 19 },
  { hour: "14:00", ingress: 165, threats: 34 }, // Hawala OTC peak
  { hour: "16:00", ingress: 130, threats: 22 },
  { hour: "18:00", ingress: 178, threats: 38 }, // Ransomware C2 burst
  { hour: "20:00", ingress: 124, threats: 20 },
  { hour: "22:00", ingress: 95, threats: 14 },
];

const TIMELINE_DATA_7D = [
  { hour: "Mon", ingress: 820, threats: 140 },
  { hour: "Tue", ingress: 940, threats: 168 },
  { hour: "Wed", ingress: 1150, threats: 210 },
  { hour: "Thu", ingress: 1040, threats: 185 },
  { hour: "Fri", ingress: 1320, threats: 245 },
  { hour: "Sat", ingress: 1480, threats: 290 },
  { hour: "Sun", ingress: 1210, threats: 215 },
];

// Kingpin centrality scores
const KINGPIN_DATA = [
  { name: "Harish Chand Aggarwal", syndicate: "Delhi Hawala", role: "OTC Desk Lead", risk: 99, centrality: 0.95, fir: "FIR-8842" },
  { name: "Kartik Venkatesh", syndicate: "BLR Ransomware", role: "C2 Operator", risk: 99, centrality: 0.93, fir: "FIR-7719" },
  { name: "Sunil Kumar Mondal", syndicate: "Jamtara Phishing", role: "Gateway Kingpin", risk: 98, centrality: 0.89, fir: "FIR-0104" },
  { name: "Rohit Sharma", syndicate: "BLR Ransomware", role: "Zero-Day Access", risk: 97, centrality: 0.84, fir: "FIR-7719" },
  { name: "Aditya Nair", syndicate: "BLR Ransomware", role: "Exfiltration Lead", risk: 96, centrality: 0.81, fir: "FIR-7719" },
  { name: "Vikas Singhal", syndicate: "Delhi Hawala", role: "P2P Escrow", risk: 95, centrality: 0.78, fir: "FIR-8842" },
  { name: "Rahul Dev Mandal", syndicate: "Jamtara Phishing", role: "VoIP Spoofing", risk: 94, centrality: 0.74, fir: "FIR-0104" },
];

// Crime category breakdown
const CRIME_VECTORS = [
  { label: "Banking & OTP Phishing", syndicate: "Jamtara", percentage: 38, count: "542 Events", color: "#fbbf24" },
  { label: "USDT Hawala Escrows", syndicate: "Delhi", percentage: 34, count: "488 Events", color: "#c084fc" },
  { label: "Ransomware & C2 Infrastructure", syndicate: "Bengaluru", percentage: 28, count: "410 Events", color: "#f87171" },
];

export default function DashboardPage() {
  const [activeCaseId, setActiveCaseId] = useState("FIR-2024-8842");
  const [timeRange, setTimeRange] = useState<"24H" | "7D">("24H");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Expandable card accordion state
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (cardKey: string) => {
    setCollapsedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  const handleToggleAllCards = () => {
    const areAnyCollapsed = Object.values(collapsedCards).some((v) => v);
    if (areAnyCollapsed) {
      setCollapsedCards({});
    } else {
      setCollapsedCards({
        ingress: true,
        crimeShare: true,
        centrality: true,
        telecom: true,
      });
    }
  };

  const timelineData = timeRange === "24H" ? TIMELINE_DATA_24H : TIMELINE_DATA_7D;

  // SVG Area path calculation for Ingress Timeline Chart
  const { areaPath, linePath, threatLinePath, points } = useMemo(() => {
    const width = 600;
    const height = 180;
    const padX = 20;
    const padY = 20;
    const maxVal = Math.max(...timelineData.map((d) => d.ingress)) * 1.15;
    const maxThreat = Math.max(...timelineData.map((d) => d.threats)) * 1.15;

    const computedPoints = timelineData.map((d, i) => {
      const x = padX + (i / (timelineData.length - 1)) * (width - padX * 2);
      const yIngress = height - padY - (d.ingress / maxVal) * (height - padY * 2);
      const yThreat = height - padY - (d.threats / maxThreat) * (height - padY * 2);
      return { x, yIngress, yThreat, ...d };
    });

    // Build Ingress Line & Area Paths
    const ingressPointsStr = computedPoints.map((p) => `${p.x},${p.yIngress}`).join(" L ");
    const line = `M ${ingressPointsStr}`;
    const area = `M ${computedPoints[0].x},${height - padY} L ${ingressPointsStr} L ${
      computedPoints[computedPoints.length - 1].x
    },${height - padY} Z`;

    // Build Threat Line Path
    const threatPointsStr = computedPoints.map((p) => `${p.x},${p.yThreat}`).join(" L ");
    const threatLine = `M ${threatPointsStr}`;

    return { areaPath: area, linePath: line, threatLinePath: threatLine, points: computedPoints };
  }, [timelineData]);

  return (
    <WorkstationShell activeCaseId={activeCaseId} onCaseChange={setActiveCaseId}>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 bg-[#0c0e12] bg-industrial-grid select-none font-mono text-slate-200">
        {/* ================= 1. INDUSTRIAL KPI METRICS STRIP ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-[11px]">
          <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-1 machined-panel hover:border-amber-500/40 transition-colors">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">TOTAL INGESTION</span>
            <div className="text-base font-black text-slate-100 font-mono">1,482,900 <span className="text-[9px] text-slate-400 font-normal">pkts</span></div>
            <span className="text-[9px] text-emerald-400 font-bold">↑ 1.2k/s LIVE RATE</span>
          </div>

          <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-1 machined-panel hover:border-red-500/40 transition-colors">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">HIGH-RISK ENTITIES</span>
            <div className="text-base font-black text-red-400 font-mono">38 <span className="text-[9px] text-slate-400 font-normal">Flagged</span></div>
            <span className="text-[9px] text-red-400/90 font-bold">AVG RISK: 94.2%</span>
          </div>

          <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-1 machined-panel hover:border-amber-500/40 transition-colors">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">ACTIVE SYNDICATES</span>
            <div className="text-base font-black text-amber-300 font-mono">3 <span className="text-[9px] text-slate-400 font-normal">Clusters</span></div>
            <span className="text-[9px] text-amber-400/90 font-bold">12 PRIMARY NODES</span>
          </div>

          <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-1 machined-panel hover:border-sky-500/40 transition-colors">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">LINKED POLICE FIRs</span>
            <div className="text-base font-black text-sky-300 font-mono">14 <span className="text-[9px] text-slate-400 font-normal">Jurisdictions</span></div>
            <span className="text-[9px] text-emerald-400 font-bold">100% SHA-256 VALID</span>
          </div>

          <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-1 machined-panel hover:border-slate-500/40 transition-colors">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">TELEPHONY SESSIONS</span>
            <div className="text-base font-black text-slate-100 font-mono">1,140 <span className="text-[9px] text-slate-400 font-normal">Logs</span></div>
            <span className="text-[9px] text-slate-400 font-bold">42 BTS SECTORS</span>
          </div>

          <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-1 machined-panel hover:border-emerald-500/40 transition-colors">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">PIPELINE LATENCY</span>
            <div className="text-base font-black text-emerald-400 font-mono">41.1 <span className="text-[9px] text-slate-400 font-normal">ms</span></div>
            <span className="text-[9px] text-sky-400 font-bold">TENSORRT v3.4</span>
          </div>
        </div>

        {/* ================= 2. PRIMARY CHARTS ROW: INGRESS TIMELINE & THREAT SHARE ================= */}
        <div className="flex items-center justify-between px-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>INDUSTRIAL CYBER FORENSIC WORKBENCH</span>
          </div>
          <button
            type="button"
            onClick={handleToggleAllCards}
            className="flex items-center gap-1 text-[9px] text-amber-400 hover:text-amber-300 bg-[#161b22] hover:bg-[#1f2632] border border-slate-700/60 px-2 py-1 rounded-sm transition-colors cursor-pointer font-bold"
          >
            <ChevronsUpDown className="w-3 h-3" />
            <span>TOGGLE ALL PANELS</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* A. Threat Ingress & Anomaly Velocity Area Chart (8 Cols) */}
          <div className="lg:col-span-8 p-4 bg-[#13171e] rounded-sm border border-slate-700/50 flex flex-col justify-between space-y-3 transition-all machined-panel">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCard("ingress")}
                  className="p-1 text-slate-400 hover:text-amber-300 hover:bg-[#1a202c] rounded-sm transition-colors cursor-pointer"
                >
                  {collapsedCards.ingress ? (
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <div>
                  <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase">
                    NETWORK INGRESS &amp; ANOMALY VELOCITY TIMELINE
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    Dual-axis telemetry of raw packet ingress [pkts/s] vs GNN anomaly spike thresholds.
                  </p>
                </div>
              </div>

              {/* Time Range Selector */}
              {!collapsedCards.ingress && (
                <div className="flex items-center gap-1 bg-[#181f2a] p-0.5 rounded-sm border border-slate-700/60">
                  {(["24H", "7D"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTimeRange(r)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-colors cursor-pointer font-mono ${
                        timeRange === r
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!collapsedCards.ingress && (
              <>
                {/* Chart Legend */}
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-sky-400 rounded-none" />
                    <span className="text-slate-300 font-bold">Raw Ingress Flow</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-red-400 rounded-none" />
                    <span className="text-red-300 font-bold">Anomaly Outliers</span>
                  </div>
                  {hoveredPoint !== null && (
                    <div className="ml-auto text-amber-300 font-bold px-2 py-0.5 bg-[#171d27] border border-amber-500/30">
                      {points[hoveredPoint].hour}: {points[hoveredPoint].ingress} pkts ·{" "}
                      <span className="text-red-400">{points[hoveredPoint].threats} Flags</span>
                    </div>
                  )}
                </div>

                {/* SVG Interactive Chart */}
                <div className="w-full h-44 relative bg-[#0e1117] border border-slate-800 p-1">
                  <svg
                    viewBox="0 0 600 180"
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      <linearGradient id="ingressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Gridlines */}
                    {[30, 75, 120, 160].map((y) => (
                      <line
                        key={y}
                        x1="20"
                        y1={y}
                        x2="580"
                        y2={y}
                        stroke="rgba(148, 163, 184, 0.08)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    ))}

                    {/* Ingress Area & Line */}
                    <path d={areaPath} fill="url(#ingressGradient)" />
                    <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="2" />

                    {/* Threat Line */}
                    <path d={threatLinePath} fill="none" stroke="#ef4444" strokeWidth="1.75" strokeDasharray="5 3" />

                    {/* Interactive Points */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.yIngress}
                          r={hoveredPoint === idx ? 5 : 3}
                          fill="#0c0e12"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredPoint(idx)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <circle
                          cx={p.x}
                          cy={p.yThreat}
                          r={hoveredPoint === idx ? 4.5 : 2.5}
                          fill="#ef4444"
                          className="pointer-events-none"
                        />
                      </g>
                    ))}
                  </svg>

                  {/* X-Axis Labels */}
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono pt-1 px-4">
                    {timelineData.map((d, i) => (
                      <span key={i} className={i % 2 === 0 ? "block font-bold text-slate-400" : "hidden sm:block font-bold text-slate-500"}>
                        {d.hour}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* B. Crime Vectors & Modus Operandi Breakdown (4 Cols) */}
          <div className="lg:col-span-4 p-4 bg-[#13171e] rounded-sm border border-slate-700/50 flex flex-col justify-between space-y-3 transition-all machined-panel">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCard("crimeShare")}
                  className="p-1 text-slate-400 hover:text-amber-300 hover:bg-[#1a202c] rounded-sm transition-colors cursor-pointer"
                >
                  {collapsedCards.crimeShare ? (
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>
                <PieChart className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase">
                  MODUS OPERANDI SHARE
                </h2>
              </div>
              <span className="text-[9px] text-amber-400 font-bold px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/20">
                1,440 EVENTS
              </span>
            </div>

            {!collapsedCards.crimeShare && (
              <>
                {/* Donut Chart SVG + Centered Metric */}
                <div className="flex items-center justify-center relative my-1">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="12" />
                    {/* Segment 1: Jamtara (38% = stroke-dasharray 109.9 289.0) */}
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="12"
                      strokeDasharray="109.9 289.0"
                      strokeDashoffset="0"
                    />
                    {/* Segment 2: Delhi Hawala (34% = stroke-dasharray 98.3 289.0) */}
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="12"
                      strokeDasharray="98.3 289.0"
                      strokeDashoffset="-109.9"
                    />
                    {/* Segment 3: Bengaluru (28% = stroke-dasharray 80.9 289.0) */}
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="12"
                      strokeDasharray="80.9 289.0"
                      strokeDashoffset="-208.2"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-black text-slate-100 font-mono">3 CLUSTERS</span>
                    <span className="text-[8px] text-amber-400 font-bold uppercase">RESOLVED</span>
                  </div>
                </div>

                {/* Legend Stack */}
                <div className="space-y-2 text-[10px]">
                  {CRIME_VECTORS.map((cv) => (
                    <div key={cv.label} className="flex justify-between items-center p-1.5 rounded-sm bg-[#161c26] border border-slate-700/40">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-none transform rotate-45" style={{ backgroundColor: cv.color }} />
                        <span className="text-slate-200 font-bold">{cv.label}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-400">{cv.count}</span>
                        <span className="font-bold text-amber-300">{cv.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= 3. SECONDARY CHARTS ROW: KINGPIN CENTRALITY & TELECOM DENSITY ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* C. Syndicate Centrality & High-Risk Kingpins Leaderboard (7 Cols) */}
          <div className="lg:col-span-7 p-4 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-3 transition-all machined-panel">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCard("centrality")}
                  className="p-1 text-slate-400 hover:text-amber-300 hover:bg-[#1a202c] rounded-sm transition-colors cursor-pointer"
                >
                  {collapsedCards.centrality ? (
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase">
                  GRAPH CENTRALITY &amp; SUSPECT RISK MATRIX
                </h2>
              </div>
              <span className="text-[9px] text-amber-400 font-mono font-bold">PAGERANK / BETWEENNESS</span>
            </div>

            {!collapsedCards.centrality && (
              <div className="space-y-2 text-[10px]">
                {KINGPIN_DATA.map((k, idx) => (
                  <div
                    key={k.name}
                    className="p-2 bg-[#161c26] hover:bg-[#1e2634] rounded-sm border border-slate-700/40 space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-mono text-[9px] font-bold">#{idx + 1}</span>
                        <span className="font-bold text-slate-100">{k.name}</span>
                        <span className="text-slate-400">({k.role})</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-400 text-[9px] px-1 bg-[#10141b] border border-slate-800">{k.fir}</span>
                        <span className="text-red-400 font-black">{k.risk}% RISK</span>
                      </div>
                    </div>

                    {/* Centrality Progress Bar */}
                    <div className="w-full bg-[#10141b] h-1.5 rounded-none overflow-hidden flex border border-slate-800">
                      <div
                        className="h-full rounded-none transition-all"
                        style={{
                          width: `${k.centrality * 100}%`,
                          backgroundColor:
                            k.syndicate === "Delhi Hawala"
                              ? "#c084fc"
                              : k.syndicate === "BLR Ransomware"
                              ? "#ef4444"
                              : "#f59e0b",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* D. BTS Telecom Tower Density & Pipeline Performance (5 Cols) */}
          <div className="lg:col-span-5 p-4 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-3 transition-all machined-panel">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCard("telecom")}
                  className="p-1 text-slate-400 hover:text-amber-300 hover:bg-[#1a202c] rounded-sm transition-colors cursor-pointer"
                >
                  {collapsedCards.telecom ? (
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase">
                  TELECOM BTS TOWER &amp; CDR CORRELATION
                </h2>
              </div>
              <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/20">
                SEC-65B LOGGED
              </span>
            </div>

            {!collapsedCards.telecom && (
              <>
                <div className="space-y-2 text-[10px]">
                  <div className="p-2.5 rounded-sm bg-[#161c26] border border-slate-700/40 space-y-1">
                    <div className="flex justify-between items-center text-slate-200">
                      <span className="font-bold">Karmatar BTS-04 (Jharkhand)</span>
                      <span className="text-amber-400 font-mono font-bold">412 Calls</span>
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Coincides with Sunil Kumar Mondal &amp; Rahul Dev Mandal SIM Box.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-sm bg-[#161c26] border border-slate-700/40 space-y-1">
                    <div className="flex justify-between items-center text-slate-200">
                      <span className="font-bold">Chandni Chowk OLT-09 (Delhi)</span>
                      <span className="text-purple-400 font-mono font-bold">388 Calls</span>
                    </div>
                    <div className="text-[9px] text-slate-400">
                      OTC Escrow desk transactions for Harish Chand Aggarwal.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-sm bg-[#161c26] border border-slate-700/40 space-y-1">
                    <div className="flex justify-between items-center text-slate-200">
                      <span className="font-bold">Koramangala DC-01 (Bengaluru)</span>
                      <span className="text-red-400 font-mono font-bold">340 Calls</span>
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Exfiltration staging for Kartik Venkatesh &amp; Aditya Nair.
                    </div>
                  </div>
                </div>

                {/* Pipeline SLA Gauge */}
                <div className="pt-2 border-t border-slate-700/40 space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 uppercase font-bold">DEEP LEARNING PIPELINE SLA:</span>
                    <span className="text-emerald-400 font-black font-mono">99.98% REAL-TIME</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[9px] text-center font-mono">
                    <div className="p-1.5 bg-[#10141b] rounded-sm border border-slate-700/40">
                      <span className="text-slate-400 block font-bold">STG 1 (AE)</span>
                      <span className="text-sky-300 font-black font-mono">8.4ms</span>
                    </div>
                    <div className="p-1.5 bg-[#10141b] rounded-sm border border-slate-700/40">
                      <span className="text-slate-400 block font-bold">STG 2 (GNN)</span>
                      <span className="text-amber-300 font-black font-mono">14.1ms</span>
                    </div>
                    <div className="p-1.5 bg-[#10141b] rounded-sm border border-slate-700/40">
                      <span className="text-slate-400 block font-bold">STG 3 (BAYES)</span>
                      <span className="text-emerald-300 font-black font-mono">18.6ms</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= 4. QUICK WORKSTATION LAUNCHER TILES ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/radar"
            className="p-3 bg-[#13171e] hover:bg-[#1c2432] rounded-sm border border-slate-700/50 hover:border-red-500/50 flex items-center justify-between group transition-all cursor-pointer machined-panel"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-sm bg-red-950/40 text-red-400 border border-red-500/30">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 group-hover:text-red-300 transition-colors uppercase">
                  Threat Radar Stream
                </div>
                <div className="text-[10px] text-slate-400">1.5s Live Ingestion Engine</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
          </Link>

          <Link
            href="/pipeline-status"
            className="p-3 bg-[#13171e] hover:bg-[#1c2432] rounded-sm border border-slate-700/50 hover:border-emerald-500/50 flex items-center justify-between group transition-all cursor-pointer machined-panel"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-sm bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors uppercase">
                  3-Stage DL Pipeline
                </div>
                <div className="text-[10px] text-slate-400">Autoencoder &amp; GNN Telemetry</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          <Link
            href="/alerts"
            className="p-3 bg-[#13171e] hover:bg-[#1c2432] rounded-sm border border-slate-700/50 hover:border-amber-500/50 flex items-center justify-between group transition-all cursor-pointer machined-panel"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-sm bg-amber-950/40 text-amber-400 border border-amber-500/30">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors uppercase">
                  Alerts &amp; Triage Center
                </div>
                <div className="text-[10px] text-slate-400">7 Active Threat Incidents</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </Link>

          <Link
            href="/graph"
            className="p-3 bg-[#13171e] hover:bg-[#1c2432] rounded-sm border border-slate-700/50 hover:border-sky-500/50 flex items-center justify-between group transition-all cursor-pointer machined-panel"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-sm bg-sky-950/40 text-sky-400 border border-sky-500/30">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors uppercase">
                  Network Graph Studio
                </div>
                <div className="text-[10px] text-slate-400">Multi-Hop Cypher Engine</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
          </Link>
        </div>
      </div>
    </WorkstationShell>
  );
}
