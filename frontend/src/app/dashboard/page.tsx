"use client";

import React, { useState } from "react";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import { ThreatRadarStream } from "@/components/graph/ThreatRadarStream";
import { DetailDrawer } from "@/components/inspector/DetailDrawer";
import { RadarNode } from "@/types/radar";
import {
  MOCK_CASES,
  MOCK_EVIDENCE_ITEMS,
  MOCK_AI_ASSESSMENTS,
} from "@/data/dfir-mock-database";
import {
  Activity,
  ShieldAlert,
  FolderOpen,
  Cpu,
  FileCheck2,
  Terminal,
  ExternalLink,
  ChevronRight,
  Database,
  Radio,
  Flame,
  Clock,
  ArrowUpRight,
  Layers,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [selectedNode, setSelectedNode] = useState<RadarNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState("FIR-2024-8842");

  const handleNodeSelect = (node: RadarNode) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  return (
    <WorkstationShell activeCaseId={activeCaseId} onCaseChange={setActiveCaseId}>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 bg-bg-base font-sans select-none">
        {/* ================= 1. PRIMARY KPI METRIC CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Active Cases */}
          <div className="p-3.5 bg-surface-card rounded-lg border border-border-subtle flex flex-col justify-between space-y-2 hover:border-border-highlight transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Active Investigations</span>
              <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-record-amber">
                <FolderOpen className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary tracking-tight font-mono">14</span>
              <span className="text-xs text-text-muted">Cases</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle/50">
              <span className="text-record-amber font-medium">3 Critical Priority</span>
              <span className="text-text-muted">11 In Progress</span>
            </div>
          </div>

          {/* 2. Flagged Threat Detections */}
          <div className="p-3.5 bg-surface-card rounded-lg border border-border-subtle flex flex-col justify-between space-y-2 hover:border-border-highlight transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">High-Risk Detections</span>
              <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center text-threat-crimson">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-threat-crimson tracking-tight font-mono">38</span>
              <span className="text-xs text-text-muted">Entities Flagged</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle/50">
              <span className="text-red-400 font-medium">7 Active Alerts</span>
              <span className="text-text-muted">Confidence &gt; 90%</span>
            </div>
          </div>

          {/* 3. Ingested Logs & Graph Entities */}
          <div className="p-3.5 bg-surface-card rounded-lg border border-border-subtle flex flex-col justify-between space-y-2 hover:border-border-highlight transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Network Telemetry</span>
              <div className="w-6 h-6 rounded-md bg-telecom-cyan/10 flex items-center justify-center text-telecom-cyan">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary tracking-tight font-mono">1.48M</span>
              <span className="text-xs text-text-muted">Logs Processed</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle/50">
              <span className="text-emerald-400 font-medium">↑ 1.2k/s Ingress</span>
              <span className="text-telecom-cyan font-mono">4,219 Graph Nodes</span>
            </div>
          </div>

          {/* 4. Evidence Vault Integrity */}
          <div className="p-3.5 bg-surface-card rounded-lg border border-border-subtle flex flex-col justify-between space-y-2 hover:border-border-highlight transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Evidence &amp; Custody</span>
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <FileCheck2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary tracking-tight font-mono">192</span>
              <span className="text-xs text-text-muted">Vault Artifacts</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle/50">
              <span className="text-emerald-400 font-medium">100% SHA-256 Valid</span>
              <span className="text-text-muted">Sec 65B Anchored</span>
            </div>
          </div>
        </div>

        {/* ================= 2. MAIN CENTER: GRAPH RADAR + AI PIPELINE STATUS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[440px]">
          {/* A. Network Activity Graph Preview (7 cols) */}
          <div className="lg:col-span-7 bg-surface-card rounded-lg border border-border-subtle flex flex-col h-[460px] overflow-hidden">
            <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-surface-overlay/60 text-xs">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-telecom-cyan" />
                <span className="font-semibold text-text-primary tracking-wide">
                  Live Threat Radar Stream
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-telecom-cyan/15 text-telecom-cyan border border-telecom-cyan/30 font-medium">
                  Live Ingestion
                </span>
              </div>
              <Link
                href="/graph"
                className="text-xs text-telecom-cyan hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Full Graph Workspace</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex-1 relative w-full h-full bg-bg-base overflow-hidden">
              <ThreatRadarStream
                onNodeSelect={handleNodeSelect}
                selectedNodeId={selectedNode?.id || null}
                selectedCaseId={activeCaseId}
              />
            </div>
          </div>

          {/* B. AI Pipeline Status Card (5 cols) */}
          <div className="lg:col-span-5 bg-surface-card rounded-lg border border-border-subtle flex flex-col h-[460px] overflow-hidden">
            <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-surface-overlay/60 text-xs">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-text-primary tracking-wide">
                  AI Pipeline Architecture
                </span>
              </div>
              <Link
                href="/ai-engine"
                className="text-xs text-telecom-cyan hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Inspect Engine</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5 text-xs overflow-y-auto custom-scrollbar">
              {/* Stage 1 */}
              <div className="p-2.5 bg-bg-base rounded-md border border-border-subtle space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium text-text-primary text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Stage 1: Cyber Telemetry Analysis</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-medium">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-text-muted">
                  Autoencoder reconstructing packet header vectors and detecting entropy deviations.
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] pt-1.5 border-t border-border-subtle/50 text-text-secondary">
                  <div>
                    <span className="text-text-muted block text-[9px]">Packets:</span>
                    <span className="font-medium text-text-primary font-mono">14.2k pkts</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[9px]">Latency:</span>
                    <span className="text-emerald-400 font-medium font-mono">8.4ms</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[9px]">Model:</span>
                    <span className="text-text-primary font-medium">AutoEnc-v3</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[9px]">Updated:</span>
                    <span className="text-text-muted">4s ago</span>
                  </div>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="p-2.5 bg-bg-base rounded-md border border-border-subtle space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium text-text-primary text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Stage 2: Behavior &amp; Network GNN</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-medium">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-text-muted">
                  Graph Neural Network scoring subgraphs, MAC collisions, and Tor proxy flows.
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] pt-1.5 border-t border-border-subtle/50 text-text-secondary">
                  <div>
                    <span className="text-text-muted block text-[9px]">Nodes:</span>
                    <span className="font-medium text-text-primary font-mono">1,120 nodes</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[9px]">Latency:</span>
                    <span className="text-emerald-400 font-medium font-mono">14.1ms</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[9px]">Model:</span>
                    <span className="text-text-primary font-medium">GraphSAGE</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[9px]">Updated:</span>
                    <span className="text-text-muted">8s ago</span>
                  </div>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="p-2.5 bg-bg-base rounded-md border border-border-subtle space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium text-text-primary text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Stage 3: Multi-Source Risk Fusion</span>
                  </div>
                  <span className="text-[10px] bg-amber-950/80 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 font-medium">
                    Review Pending
                  </span>
                </div>
                <div className="text-[11px] text-text-muted">
                  Bayesian risk fusion unifying telecom records, FIR accusations, and threat scores.
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] pt-1.5 border-t border-border-subtle/50 text-text-secondary">
                  <div>
                    <span className="text-text-muted block text-[9px]">Flagged:</span>
                    <span className="font-medium text-threat-crimson font-mono">38 leads</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[9px]">Latency:</span>
                    <span className="text-emerald-400 font-medium font-mono">18.6ms</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[9px]">Model:</span>
                    <span className="text-text-primary font-medium">BayesFusion</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[9px]">Decisions:</span>
                    <span className="text-amber-400 font-medium font-mono">5 pending</span>
                  </div>
                </div>
              </div>

              {/* Human-in-the-Loop CTA */}
              <div className="p-2.5 bg-surface-overlay/80 rounded-md border border-border-subtle flex items-center justify-between text-xs">
                <span className="text-text-secondary">Pending AI leads for review:</span>
                <Link
                  href="/ai-engine?tab=risk"
                  className="px-3 py-1 bg-telecom-cyan/15 border border-telecom-cyan/40 text-telecom-cyan rounded font-medium hover:bg-telecom-cyan/25 transition-colors cursor-pointer"
                >
                  Review 5 Leads
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 3. LOWER TRI-PANEL: ALERTS, CASES, EVIDENCE ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* C. ACTIVE ALERTS */}
          <div className="bg-surface-card rounded-lg border border-border-subtle p-3.5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle text-xs font-semibold">
              <span className="flex items-center gap-2 text-threat-crimson">
                <Flame className="w-4 h-4" />
                <span>Active Threat Alerts</span>
              </span>
              <span className="text-[10px] text-text-muted font-normal">Real-Time IDS</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-bg-base rounded-md border border-red-500/30 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-red-950/60 text-red-400 px-1.5 py-0.5 rounded font-medium border border-red-500/40">
                    Critical · Exfil
                  </span>
                  <span className="text-[10px] text-text-muted">11:14 IST</span>
                </div>
                <div className="font-mono font-medium text-text-primary">115.112.45.12 (Reliance Jio)</div>
                <div className="text-[11px] text-text-muted">
                  Mule API injection coinciding with FIR-0104 Jamtara victims.
                </div>
              </div>

              <div className="p-2.5 bg-bg-base rounded-md border border-red-500/30 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-red-950/60 text-red-400 px-1.5 py-0.5 rounded font-medium border border-red-500/40">
                    High · Tor C2
                  </span>
                  <span className="text-[10px] text-text-muted">10:52 IST</span>
                </div>
                <div className="font-mono font-medium text-text-primary">185.220.101.5 (Tor Exit Relay)</div>
                <div className="text-[11px] text-text-muted">
                  Flokinet proxy session correlating with Hawala case FIR-2024-8842.
                </div>
              </div>

              <div className="p-2.5 bg-bg-base rounded-md border border-amber-500/30 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-amber-950/60 text-amber-400 px-1.5 py-0.5 rounded font-medium border border-amber-500/40">
                    Elevated · SIM-Swap
                  </span>
                  <span className="text-[10px] text-text-muted">09:30 IST</span>
                </div>
                <div className="font-mono font-medium text-text-primary">+91 99001 XXXXX (Delhi Circle)</div>
                <div className="text-[11px] text-text-muted">
                  Unauthorized dealer re-issuance flagged in LockBit FIR-7719.
                </div>
              </div>
            </div>
          </div>

          {/* D. ACTIVE INVESTIGATIONS */}
          <div className="bg-surface-card rounded-lg border border-border-subtle p-3.5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle text-xs font-semibold">
              <span className="flex items-center gap-2 text-record-amber">
                <FolderOpen className="w-4 h-4" />
                <span>Active Investigations</span>
              </span>
              <Link href="/cases" className="text-[11px] text-telecom-cyan hover:underline font-medium">
                View All
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {MOCK_CASES.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases?id=${c.id}`}
                  className="block p-2.5 bg-bg-base hover:bg-surface-overlay rounded-md border border-border-subtle hover:border-border-highlight transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-medium text-text-primary">{c.id}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-record-amber font-medium">{c.priority}</span>
                  </div>
                  <div className="text-[11px] text-text-muted truncate mt-0.5">{c.title}</div>
                  <div className="text-[10px] text-text-secondary mt-1 flex justify-between">
                    <span>IO: {c.leadInvestigator.name}</span>
                    <span className="text-emerald-400 font-medium">{c.status.replace(/_/g, " ")}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* E. RECENT EVIDENCE */}
          <div className="bg-surface-card rounded-lg border border-border-subtle p-3.5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle text-xs font-semibold">
              <span className="flex items-center gap-2 text-telecom-cyan">
                <FileCheck2 className="w-4 h-4" />
                <span>Recent Evidence Vault</span>
              </span>
              <Link href="/evidence" className="text-[11px] text-telecom-cyan hover:underline font-medium">
                Open Vault
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {MOCK_EVIDENCE_ITEMS.map((evd) => (
                <Link
                  key={evd.id}
                  href={`/evidence?id=${evd.id}`}
                  className="block p-2.5 bg-bg-base hover:bg-surface-overlay rounded-md border border-border-subtle hover:border-border-highlight transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-medium text-telecom-cyan">{evd.id}</span>
                    <span className="text-[10px] bg-emerald-950/60 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/40 font-medium">
                      Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-text-primary truncate mt-0.5 font-medium">{evd.title}</div>
                  <div className="text-[10px] text-text-muted mt-1 font-mono truncate">
                    SHA-256: {evd.sha256Hash.slice(0, 28)}...
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out detail drawer */}
      <DetailDrawer
        selectedNode={selectedNode}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </WorkstationShell>
  );
}
