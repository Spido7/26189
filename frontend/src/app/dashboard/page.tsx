"use client";

import React, { useState, useRef } from "react";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import { ThreatRadarStream } from "@/components/graph/ThreatRadarStream";
import { DetailDrawer } from "@/components/inspector/DetailDrawer";
import { RadarNode, RadarStreamHandle, StreamStateInfo } from "@/types/radar";
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Plus,
  Maximize2,
  Activity,
  Flame,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [selectedNode, setSelectedNode] = useState<RadarNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState<string>("ALL");
  const [streamState, setStreamState] = useState<StreamStateInfo | null>(null);

  const streamRef = useRef<RadarStreamHandle>(null);

  const handleNodeSelect = (node: RadarNode) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  const handleCaseChange = (caseId: string) => {
    setActiveCaseId(caseId);
    if (streamRef.current?.focusSyndicate) {
      streamRef.current.focusSyndicate(caseId);
    }
  };

  return (
    <WorkstationShell activeCaseId={activeCaseId} onCaseChange={handleCaseChange}>
      <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col bg-bg-base font-mono select-none">
        {/* ================= TOP GRAPH COMMAND BAR & TELEMETRY STRIP ================= */}
        <div className="p-2.5 border-b border-border-subtle bg-surface-card/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs z-20">
          {/* Left: Radar Title & Syndicate Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <Radio className="w-4 h-4 text-telecom-cyan animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-telecom-cyan absolute -top-0.5 -right-0.5 status-pulse" />
              </div>
              <span className="font-bold text-text-primary tracking-wider uppercase text-xs">
                THREAT RADAR INGESTION &amp; KNOWLEDGE GRAPH
              </span>
            </div>

            <div className="h-4 w-px bg-border-subtle hidden sm:block" />

            {/* Syndicate Quick Filter Tabs */}
            <div className="flex items-center gap-1">
              {[
                { id: "ALL", label: "TRI-SYNDICATE (ALL)", color: "telecom-cyan" },
                { id: "FIR-0104/2026", label: "JAMTARA PHISHING", color: "amber-400" },
                { id: "FIR-2024-8842", label: "HAWALA RING", color: "purple-400" },
                { id: "FIR-7719/2026", label: "EXTORTION CARTEL", color: "red-400" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCaseChange(tab.id)}
                  className={`px-2 py-0.5 text-[10px] font-bold border transition-all cursor-pointer ${
                    activeCaseId === tab.id
                      ? "border-telecom-cyan text-telecom-cyan bg-telecom-cyan/15 shadow-sm"
                      : "border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-overlay"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Real-time Telemetry Metrics */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-bg-base px-2.5 py-1 border border-border-subtle text-[11px]">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-telecom-cyan" />
                <span className="text-text-muted">INGESTED:</span>
                <span className="text-text-primary font-bold">
                  {streamState?.metrics.totalIngested ?? 0}
                </span>
              </div>
              <span className="text-border-subtle">|</span>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-threat-crimson" />
                <span className="text-text-muted">THREATS:</span>
                <span className="text-threat-crimson font-bold">
                  {streamState?.metrics.confirmedThreats ?? 0}
                </span>
              </div>
              <span className="text-border-subtle">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-text-muted">EDGES:</span>
                <span className="text-emerald-400 font-bold">
                  {streamState?.metrics.activeLinks ?? 0}
                </span>
              </div>
              <span className="text-border-subtle">|</span>
              <div className="flex items-center gap-1">
                <span className="text-text-muted">INGRESS:</span>
                <span className="text-telecom-cyan font-bold">
                  {streamState?.isPlaying ? `${streamState.metrics.currentTps} pkt/s` : "PAUSED"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Stream Controller Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={() => streamRef.current?.togglePlay()}
              className={`px-2.5 py-1 flex items-center gap-1 border text-[10px] font-bold cursor-pointer transition-colors ${
                streamState?.isPlaying
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60"
                  : "bg-amber-950/60 border-amber-500/40 text-amber-400 hover:bg-amber-900/60"
              }`}
              title={streamState?.isPlaying ? "Pause Ingestion Stream" : "Resume Ingestion Stream"}
            >
              {streamState?.isPlaying ? (
                <>
                  <Pause className="w-3 h-3" />
                  <span>STREAMING</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span>RESUME</span>
                </>
              )}
            </button>

            {/* Ingest Next Step */}
            <button
              type="button"
              onClick={() => streamRef.current?.streamNext()}
              className="p-1 px-2 bg-surface-card hover:bg-surface-overlay border border-border-subtle text-text-secondary hover:text-text-primary text-[10px] font-bold cursor-pointer flex items-center gap-1"
              title="Step Next Packet"
            >
              <Plus className="w-3 h-3" />
              <span>STEP</span>
            </button>

            {/* Speed Multipliers */}
            <div className="flex items-center border border-border-subtle bg-bg-base">
              {([1, 2, 5] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => streamRef.current?.setSpeed(spd)}
                  className={`px-1.5 py-0.5 text-[9px] font-bold transition-colors cursor-pointer ${
                    streamState?.speed === spd
                      ? "bg-telecom-cyan text-bg-base"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {spd}X
                </button>
              ))}
            </div>

            {/* Reset Stream */}
            <button
              type="button"
              onClick={() => streamRef.current?.resetStream()}
              className="p-1 border border-border-subtle hover:border-border-highlight text-text-muted hover:text-text-primary cursor-pointer"
              title="Reset Ingestion Stream"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ================= MAIN FULL-PAGE GRAPH CANVAS ================= */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-bg-base">
          <ThreatRadarStream
            ref={streamRef}
            onNodeSelect={handleNodeSelect}
            selectedNodeId={selectedNode?.id || null}
            selectedCaseId={activeCaseId}
            onStreamStateChange={setStreamState}
          />
        </div>

        {/* ================= SLIDE-OUT FORENSIC DOSSIER DRAWER ================= */}
        <DetailDrawer
          selectedNode={selectedNode}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      </div>
    </WorkstationShell>
  );
}
