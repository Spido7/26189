"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Download,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Filter,
  Check,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { DLStage, StreamMetrics } from "@/types/stream";

interface InvestigationCommandBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cypherQuery: string;
  onCypherQueryChange: (query: string) => void;
  onExecuteCypher: () => void;
  activeFilter: DLStage | "ALL";
  onFilterChange: (filter: DLStage | "ALL") => void;
  onExportEvidence: () => void;
  
  // Stream Controls
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: 1 | 2 | 5;
  onSpeedChange: (speed: 1 | 2 | 5) => void;
  onInjectManualPacket: () => void;
  onResetStream: () => void;
  metrics: StreamMetrics;
}

export const InvestigationCommandBar: React.FC<InvestigationCommandBarProps> = ({
  searchQuery,
  onSearchChange,
  cypherQuery,
  onCypherQueryChange,
  onExecuteCypher,
  activeFilter,
  onFilterChange,
  onExportEvidence,
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
  onInjectManualPacket,
  onResetStream,
  metrics,
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onExecuteCypher();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExecuteCypher]);

  const handleExport = () => {
    onExportEvidence();
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="w-full flex flex-col shrink-0 z-50 select-none font-mono">
      {/* ================= PRIMARY TOP BAR ================= */}
      <header className="flex justify-between items-center w-full px-3 py-1.5 h-10 border-b border-border-subtle bg-surface-overlay text-xs uppercase tracking-wider shrink-0">
        {/* Left: Brand Identifier & Quick Search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-border-subtle">
            <span className="inline-block w-2 h-2 bg-telecom-cyan rounded-full status-pulse" />
            <span className="font-mono text-xs font-bold text-text-primary tracking-widest uppercase">
              DFIR // DL-RADAR
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-telecom-cyan-dim text-telecom-cyan border border-telecom-cyan/30 font-mono">
              STREAM INGEST
            </span>
          </div>

          {/* Monospace Search Bar */}
          <div className="flex items-center gap-1.5 bg-bg-base px-2 py-0.5 border border-border-subtle hover:border-border-highlight transition-colors w-64">
            <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <input
              ref={searchInputRef}
              className="bg-transparent border-none outline-none text-text-primary font-mono text-[11px] placeholder-text-muted w-full p-0 focus:ring-0 focus:outline-none"
              placeholder="QUERY IP / MAC / SUBNET..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <span className="text-[9px] text-text-muted border border-border-subtle px-1 leading-tight">
              ⌘K
            </span>
          </div>
        </div>

        {/* Center: Live Stream Metrics Readout */}
        <div className="hidden lg:flex items-center gap-4 text-[10px] text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-telecom-cyan" />
            <span className="text-text-muted">INGESTED:</span>
            <span className="text-text-primary font-bold">{metrics.totalIngested}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-telecom-cyan" />
            <span className="text-text-muted">IN PIPELINE:</span>
            <span className="text-telecom-cyan font-bold animate-pulse">
              {metrics.activeInPipeline}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-threat-crimson" />
            <span className="text-text-muted">THREATS:</span>
            <span className="text-threat-crimson font-bold">{metrics.confirmedThreats}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-text-muted">CLEARED:</span>
            <span className="text-slate-300 font-bold">{metrics.clearedBenign}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">CLUSTERS:</span>
            <span className="text-record-amber font-bold">{metrics.activeClusters}</span>
          </div>
        </div>

        {/* Right: Stream Playback Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
              isPlaying
                ? "bg-telecom-cyan-dim border-telecom-cyan text-telecom-cyan"
                : "bg-surface-card border-border-highlight text-text-muted hover:text-text-primary"
            }`}
            title={isPlaying ? "Pause Stream" : "Resume Live Stream"}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isPlaying ? "STREAMING" : "PAUSED"}</span>
          </button>

          {/* Speed Toggle */}
          <div className="flex items-center border border-border-subtle bg-surface-card text-[10px]">
            {([1, 2, 5] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSpeedChange(s)}
                className={`px-1.5 py-0.5 border-r last:border-r-0 border-border-subtle cursor-pointer transition-colors ${
                  speed === s
                    ? "bg-border-subtle text-telecom-cyan font-bold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Inject Attack IP */}
          <button
            type="button"
            onClick={onInjectManualPacket}
            className="flex items-center gap-1 px-2.5 py-1 bg-threat-crimson-dim hover:bg-threat-crimson/30 text-threat-crimson border border-threat-crimson/60 text-[11px] font-bold transition-colors cursor-pointer active:scale-95"
            title="Inject anomalous attack packet to trigger 3-Stage DL pipeline"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>Inject Threat</span>
          </button>

          {/* Reset Stream */}
          <button
            type="button"
            onClick={onResetStream}
            className="p-1 text-text-muted hover:text-text-primary border border-border-subtle bg-surface-card cursor-pointer"
            title="Reset Stream"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-border-subtle mx-1" />

          {/* Export Evidence */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1 px-2.5 py-1 bg-border-subtle hover:bg-border-highlight text-text-secondary hover:text-text-primary text-[11px] border border-border-highlight transition-colors cursor-pointer"
            title="Export Evidence Chain of Custody JSON"
          >
            {copiedNotification ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{copiedNotification ? "Exported" : "Export"}</span>
          </button>
        </div>
      </header>

      {/* ================= SUB-COMMAND CYPHER QUERY & STAGE FILTER PILLS ================= */}
      <section className="h-11 bg-surface-card border-b border-border-subtle px-3 flex items-center justify-between gap-3 text-xs shrink-0">
        {/* Cypher Query Prompt */}
        <div className="flex-1 flex items-center gap-2 bg-bg-base border border-border-subtle px-2 py-1 focus-within:border-telecom-cyan/80 transition-colors">
          <span className="text-telecom-cyan font-bold tracking-tight text-[11px]">
            neo4j$
          </span>
          <input
            className="flex-1 bg-transparent border-none outline-none text-text-primary font-mono text-[11px] p-0 focus:ring-0 focus:outline-none"
            type="text"
            value={cypherQuery}
            onChange={(e) => onCypherQueryChange(e.target.value)}
            placeholder="Cypher stream query..."
          />
          <span className="text-[10px] text-text-muted bg-surface-overlay border border-border-subtle px-1.5 py-0.5 tracking-tight">
            [Ctrl + Enter]
          </span>
        </div>

        {/* DL Stage Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0 text-[11px]">
          {/* FLAGGED Threats */}
          <button
            type="button"
            onClick={() => onFilterChange(activeFilter === "FLAGGED" ? "ALL" : "FLAGGED")}
            className={`flex items-center gap-1.5 px-2 py-0.5 border cursor-pointer transition-colors ${
              activeFilter === "FLAGGED"
                ? "bg-threat-crimson text-bg-base border-threat-crimson font-bold"
                : "bg-threat-crimson-dim/60 text-threat-crimson border-threat-crimson/50 hover:border-threat-crimson"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-threat-crimson" />
            <span>FLAGGED</span>
            <span className="bg-threat-crimson/20 px-1 text-[10px] font-bold">
              {metrics.confirmedThreats}
            </span>
          </button>

          {/* In-Pipeline Stages */}
          <button
            type="button"
            onClick={() =>
              onFilterChange(activeFilter === "MODEL_1_ANOMALY" ? "ALL" : "MODEL_1_ANOMALY")
            }
            className={`flex items-center gap-1.5 px-2 py-0.5 border cursor-pointer transition-colors ${
              activeFilter === "MODEL_1_ANOMALY"
                ? "bg-telecom-cyan text-bg-base border-telecom-cyan font-bold"
                : "bg-telecom-cyan-dim/60 text-telecom-cyan border-telecom-cyan/50 hover:border-telecom-cyan"
            }`}
          >
            <span>M1_ANOMALY</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onFilterChange(activeFilter === "MODEL_2_CRIME" ? "ALL" : "MODEL_2_CRIME")
            }
            className={`flex items-center gap-1.5 px-2 py-0.5 border cursor-pointer transition-colors ${
              activeFilter === "MODEL_2_CRIME"
                ? "bg-record-amber text-bg-base border-record-amber font-bold"
                : "bg-record-amber-dim/60 text-record-amber border-record-amber/50 hover:border-record-amber"
            }`}
          >
            <span>M2_CRIME</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onFilterChange(activeFilter === "MODEL_3_VERIFY" ? "ALL" : "MODEL_3_VERIFY")
            }
            className={`flex items-center gap-1.5 px-2 py-0.5 border cursor-pointer transition-colors ${
              activeFilter === "MODEL_3_VERIFY"
                ? "bg-accused-violet text-bg-base border-accused-violet font-bold"
                : "bg-accused-violet-dim/60 text-accused-violet border-accused-violet/50 hover:border-accused-violet"
            }`}
          >
            <span>M3_VERIFY</span>
          </button>

          {/* CLEARED Benign */}
          <button
            type="button"
            onClick={() => onFilterChange(activeFilter === "CLEARED" ? "ALL" : "CLEARED")}
            className={`flex items-center gap-1.5 px-2 py-0.5 border cursor-pointer transition-colors ${
              activeFilter === "CLEARED"
                ? "bg-slate-300 text-bg-base border-slate-300 font-bold"
                : "bg-surface-overlay text-slate-400 border-border-subtle hover:text-slate-200"
            }`}
          >
            <span>CLEARED</span>
            <span className="bg-surface-card px-1 text-[10px] font-bold">
              {metrics.clearedBenign}
            </span>
          </button>

          {/* Show All */}
          <button
            type="button"
            onClick={() => onFilterChange("ALL")}
            className={`p-1 border border-border-subtle bg-surface-overlay text-[11px] font-mono transition-colors ml-1 cursor-pointer flex items-center gap-1 ${
              activeFilter === "ALL"
                ? "text-telecom-cyan border-telecom-cyan/50"
                : "text-text-muted hover:text-text-primary"
            }`}
            title="Show All Stages"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>ALL</span>
          </button>
        </div>
      </section>
    </div>
  );
};
