"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import {
  UploadCloud,
  FileCheck,
  Cpu,
  Database,
  Radio,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  Server,
  Layers,
  Terminal,
  Shield,
  FileCode2,
  Activity,
  CheckCircle,
  Hash,
} from "lucide-react";
import { MOCK_CASES } from "@/data/dfir-mock-database";

type IngestionSourceType = "FILE" | "NETWORK_SENSOR" | "SIEM" | "SYSLOG" | "REST_API" | "DATABASE";

const PIPELINE_STEPS = [
  { id: "INGEST", label: "Ingest", description: "Ingress buffer capture" },
  { id: "VALIDATE", label: "Validate", description: "Header checksum check" },
  { id: "PARSE", label: "Parse", description: "Protocol dissection" },
  { id: "NORMALIZE", label: "Normalize", description: "DFIR standard schema" },
  { id: "ENTITY_EXTRACTION", label: "Entity Extraction", description: "IP/MAC/IMSI unmasking" },
  { id: "FEATURE_EXTRACTION", label: "Feature Extraction", description: "Tensor vector construction" },
  { id: "AI_STAGE_1", label: "AI Stage 1", description: "Anomaly autoencoder" },
  { id: "AI_STAGE_2", label: "AI Stage 2", description: "Behavioral GNN analysis" },
  { id: "AI_STAGE_3", label: "AI Stage 3", description: "Bayesian risk fusion" },
  { id: "GRAPH_CORRELATION", label: "Graph Correlation", description: "Neo4j edge synthesis" },
  { id: "INVESTIGATOR_REVIEW", label: "Analyst Review", description: "Human-in-the-loop audit" },
];

function EvidenceIngestionContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [selectedSource, setSelectedSource] = useState<IngestionSourceType>("FILE");
  const [selectedFormat, setSelectedFormat] = useState("PCAP");
  const [selectedCase, setSelectedCase] = useState("FIR-0104/2026");
  const [activeTab, setActiveTab] = useState<"pipeline" | "jobs" | "sources">(
    queryTab === "jobs" ? "jobs" : queryTab === "sources" ? "sources" : "pipeline"
  );

  useEffect(() => {
    if (queryTab === "jobs") setActiveTab("jobs");
    if (queryTab === "sources") setActiveTab("sources");
  }, [queryTab]);

  const [pipelineState, setPipelineState] = useState<"IDLE" | "PROCESSING" | "COMPLETED">("IDLE");
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  const [stagedArtifact, setStagedArtifact] = useState({
    fileName: "BKC_Jio5G_PacketDump_20260814.pcap",
    fileSize: "1.36 GB (1,468,006,400 bytes)",
    hashSha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    format: "PCAP / Wireshark TCP Dump",
    source: "Cisco Nexus Core Switch // Mumbai Intercept Sector 4",
    caseAssociation: "FIR-0104/2026 [BKC MUMBAI]",
    acquisitionTime: "2026-08-14 17:45:10 IST",
  });

  const handleStartPipeline = () => {
    setPipelineState("PROCESSING");
    setActiveStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < PIPELINE_STEPS.length) {
        setActiveStepIndex(step);
      } else {
        clearInterval(interval);
        setPipelineState("COMPLETED");
      }
    }, 600);
  };

  return (
    <WorkstationShell activeCaseId={selectedCase} onCaseChange={setSelectedCase}>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 bg-bg-base select-none font-sans">
        {/* Workspace Top Title & Tabs Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-telecom-cyan-dim/40 border border-telecom-cyan/30 text-telecom-cyan">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary tracking-tight">
                Evidence Ingestion & Automated Pipeline
              </h1>
              <p className="text-xs text-text-muted">
                Multi-channel sensory ingress, schema normalization, and automated neural graph enrichment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-surface-card border border-border-subtle p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("pipeline")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-all ${
                activeTab === "pipeline"
                  ? "bg-telecom-cyan-dim/60 text-telecom-cyan border border-telecom-cyan/30 shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Live Pipeline
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("jobs")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-all ${
                activeTab === "jobs"
                  ? "bg-telecom-cyan-dim/60 text-telecom-cyan border border-telecom-cyan/30 shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Processing Jobs (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sources")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-all ${
                activeTab === "sources"
                  ? "bg-telecom-cyan-dim/60 text-telecom-cyan border border-telecom-cyan/30 shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Data Sources (6)
            </button>
          </div>
        </div>

        {activeTab === "pipeline" && (
          <div className="space-y-4">
            {/* Upper: Data Source Selector & File Drop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Source Options (4 cols) */}
              <div className="lg:col-span-4 bg-surface-card border border-border-subtle rounded-xl p-4 space-y-4 shadow-xs">
                <div className="font-semibold text-text-primary text-xs pb-2 border-b border-border-subtle">
                  1. Select Evidence Source
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "FILE", label: "File Upload", icon: UploadCloud },
                      { id: "NETWORK_SENSOR", label: "Network Sensor", icon: Radio },
                      { id: "SIEM", label: "SIEM Egress", icon: Server },
                      { id: "SYSLOG", label: "Syslog Stream", icon: Terminal },
                      { id: "REST_API", label: "REST Ingress", icon: Cpu },
                      { id: "DATABASE", label: "SQL / Neo4j Dump", icon: Database },
                    ] as const
                  ).map((src) => {
                    const Icon = src.icon;
                    const isSelected = selectedSource === src.id;
                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => setSelectedSource(src.id)}
                        className={`p-2.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-telecom-cyan-dim/50 border-telecom-cyan/60 text-telecom-cyan font-medium shadow-xs"
                            : "bg-surface-overlay/50 border-border-subtle text-text-secondary hover:border-border-highlight hover:bg-surface-card"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs truncate">{src.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3 pt-3 border-t border-border-subtle">
                  <div>
                    <label className="text-xs font-medium text-text-muted block mb-1.5">Target Case Dossier</label>
                    <select
                      value={selectedCase}
                      onChange={(e) => setSelectedCase(e.target.value)}
                      className="w-full bg-bg-base border border-border-subtle rounded-lg text-text-primary px-3 py-2 text-xs focus:border-telecom-cyan/60 outline-hidden"
                    >
                      {MOCK_CASES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} - {c.title.slice(0, 32)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-muted block mb-1.5">Ingress Protocol / Format</label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full bg-bg-base border border-border-subtle rounded-lg text-text-primary px-3 py-2 text-xs focus:border-telecom-cyan/60 outline-hidden"
                    >
                      <option value="PCAP">PCAP / Wireshark Packet Dump</option>
                      <option value="ZEEK">Zeek Conn.log / DNS.log / HTTP.log</option>
                      <option value="SURICATA">Suricata EVE.json Security IDS</option>
                      <option value="SYSLOG">RFC 5424 Structured Syslog</option>
                      <option value="JSON">DFIR Structured JSON Matrix</option>
                      <option value="CSV">Telecom CDR Excel / CSV Ledger</option>
                      <option value="NETFLOW">IPFIX / Cisco NetFlow v9</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Dropzone & Pre-processing Inspection (8 cols) */}
              <div className="lg:col-span-8 bg-surface-card border border-border-subtle rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-xs">
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-border-subtle text-xs font-semibold">
                    <span>2. Staged Evidence Inspection</span>
                    <span className="text-emerald-400 font-normal flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Ready for Dispatch
                    </span>
                  </div>

                  {/* Drop zone placeholder */}
                  <div className="mt-3 border-2 border-dashed border-border-subtle hover:border-telecom-cyan/60 rounded-xl p-6 bg-bg-base/50 text-center cursor-pointer transition-all hover:bg-bg-base/80">
                    <UploadCloud className="w-8 h-8 text-telecom-cyan mx-auto mb-2 opacity-80" />
                    <div className="text-xs font-semibold text-text-primary">
                      Drop evidence file here, or browse local system
                    </div>
                    <div className="text-[11px] text-text-muted mt-1">
                      Supports PCAP, Zeek, Suricata JSON, RFC 5424 Syslog, CSV (Up to 10 GB)
                    </div>
                  </div>

                  {/* Pre-processing Display Metadata */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface-overlay/60 rounded-lg p-3 border border-border-subtle text-xs">
                    <div>
                      <span className="text-[11px] text-text-muted block">File Name:</span>
                      <span className="font-semibold text-text-primary truncate block mt-0.5">{stagedArtifact.fileName}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Acquisition Time:</span>
                      <span className="text-text-secondary block font-mono text-[11px] mt-0.5">{stagedArtifact.acquisitionTime}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Size:</span>
                      <span className="font-semibold text-telecom-cyan font-mono block mt-0.5">{stagedArtifact.fileSize}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Format:</span>
                      <span className="text-text-primary block mt-0.5">{stagedArtifact.format}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Source Location:</span>
                      <span className="text-text-secondary truncate block mt-0.5">{stagedArtifact.source}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-text-muted block">Assigned Case:</span>
                      <span className="text-amber-300 font-mono font-medium block mt-0.5">{stagedArtifact.caseAssociation}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-3 pt-2 border-t border-border-subtle">
                      <span className="text-[11px] text-text-muted flex items-center gap-1">
                        <Hash className="w-3 h-3 text-emerald-400" />
                        SHA-256 Hash (Pre-computed):
                      </span>
                      <span className="font-mono text-[11px] text-emerald-400 select-all block truncate mt-1 bg-emerald-950/20 p-1.5 rounded border border-emerald-500/20">
                        {stagedArtifact.hashSha256}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dispatch Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-border-subtle">
                  <span className="text-xs text-text-muted">
                    Automated pipeline dispatches into TensorRT DL models and writes edges directly to Neo4j.
                  </span>
                  <button
                    type="button"
                    onClick={handleStartPipeline}
                    disabled={pipelineState === "PROCESSING"}
                    className="px-4 py-2 bg-telecom-cyan hover:bg-telecom-cyan/90 text-black font-semibold text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Play className={`w-3.5 h-3.5 ${pipelineState === "PROCESSING" ? "animate-spin" : ""}`} />
                    <span>
                      {pipelineState === "PROCESSING"
                        ? "Executing Pipeline..."
                        : pipelineState === "COMPLETED"
                        ? "Re-Ingest Artifact"
                        : "Dispatch to Pipeline"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lower: 11-Step Live Technical Pipeline Visualizer */}
            <div className="bg-surface-card border border-border-subtle rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex justify-between items-center pb-3 border-b border-border-subtle text-xs font-semibold">
                <span className="flex items-center gap-2 text-text-primary">
                  <Layers className="w-4 h-4 text-telecom-cyan" />
                  <span>11-Stage Technical Ingestion Pipeline</span>
                </span>
                <span className="text-xs text-text-muted flex items-center gap-1.5">
                  Status:{" "}
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      pipelineState === "COMPLETED"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : pipelineState === "PROCESSING"
                        ? "bg-telecom-cyan-dim/60 text-telecom-cyan border border-telecom-cyan/30"
                        : "bg-surface-overlay text-text-muted border border-border-subtle"
                    }`}
                  >
                    {pipelineState}
                  </span>
                </span>
              </div>

              {/* Steps progression bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2">
                {PIPELINE_STEPS.map((step, idx) => {
                  const isCurrent = activeStepIndex === idx && pipelineState === "PROCESSING";
                  const isDone = activeStepIndex > idx || pipelineState === "COMPLETED";

                  return (
                    <div
                      key={step.id}
                      className={`p-2.5 rounded-lg border flex flex-col justify-between min-h-[76px] transition-all ${
                        isCurrent
                          ? "bg-cyan-950/40 border-telecom-cyan/80 ring-1 ring-telecom-cyan/50 shadow-xs"
                          : isDone
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                          : "bg-bg-base/60 border-border-subtle text-text-muted opacity-70"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-medium text-text-muted">#{idx + 1}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-telecom-cyan animate-ping" />
                        ) : (
                          <Clock className="w-3 h-3 text-text-muted shrink-0" />
                        )}
                      </div>

                      <div className="mt-2">
                        <div className={`text-[11px] font-semibold truncate ${isCurrent ? "text-telecom-cyan" : ""}`}>
                          {step.label}
                        </div>
                        <div className="text-[10px] text-text-muted leading-tight truncate mt-0.5">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Processing Jobs */}
        {activeTab === "jobs" && (
          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 space-y-4 shadow-xs">
            <div className="text-xs font-semibold text-text-primary pb-2 border-b border-border-subtle flex justify-between items-center">
              <span>Active &amp; Recent Ingestion Jobs</span>
              <span className="text-xs text-text-muted font-normal">Auto-scaling Workers: 4 Active</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 bg-bg-base/70 border border-border-subtle rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-text-primary flex items-center gap-2">
                    <span className="font-mono text-telecom-cyan">JOB-9821</span>
                    <span>PCAP-BKC-JIO-INGRESS</span>
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    Source: Cisco Nexus Mirror · Target: FIR-0104/2026 · 1.36 GB · 14,280 Packets
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                    Completed (14ms)
                  </span>
                  <div className="text-[11px] text-text-muted font-mono mt-1">2026-08-14 18:00 IST</div>
                </div>
              </div>

              <div className="p-3.5 bg-bg-base/70 border border-border-subtle rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-text-primary flex items-center gap-2">
                    <span className="font-mono text-telecom-cyan">JOB-9822</span>
                    <span>ZEEK-FLOKINET-TOR</span>
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    Source: Tor Exit Mirror · Target: FIR-2024-8842 · 842.4 MB · 8,940 Circuits
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                    Completed (18ms)
                  </span>
                  <div className="text-[11px] text-text-muted font-mono mt-1">2024-10-24 05:30 IST</div>
                </div>
              </div>

              <div className="p-3.5 bg-bg-base/70 border border-border-subtle rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-text-primary flex items-center gap-2">
                    <span className="font-mono text-telecom-cyan">JOB-9823</span>
                    <span>SURICATA-LINODE-RANSOM</span>
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    Source: Sensor Grid Delhi · Target: FIR-7719/2026 · 400.0 MB · 3,110 EVE alerts
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                    Completed (12ms)
                  </span>
                  <div className="text-[11px] text-text-muted font-mono mt-1">2026-07-18 14:10 IST</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Data Sources */}
        {activeTab === "sources" && (
          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 space-y-4 shadow-xs">
            <div className="text-xs font-semibold text-text-primary pb-2 border-b border-border-subtle flex justify-between items-center">
              <span>Connected Sensors &amp; Telemetry Ingress Channels</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                6 Sensors Online
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-bg-base/70 border border-border-subtle rounded-lg space-y-1.5">
                <div className="flex justify-between font-semibold text-text-primary">
                  <span className="font-mono text-telecom-cyan">SENSOR-BKC-01 // MUMBAI</span>
                  <span className="text-emerald-400 font-medium text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Online</span>
                </div>
                <div className="text-xs text-text-muted">
                  Optical Tap at Jio BKC Node · Monitoring 115.112.45.0/24 subnet traffic.
                </div>
              </div>

              <div className="p-3.5 bg-bg-base/70 border border-border-subtle rounded-lg space-y-1.5">
                <div className="flex justify-between font-semibold text-text-primary">
                  <span className="font-mono text-telecom-cyan">SENSOR-BLR-02 // BENGALURU</span>
                  <span className="text-emerald-400 font-medium text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Online</span>
                </div>
                <div className="text-xs text-text-muted">
                  CID Cyber Command Sensor · Monitoring Tor exit relay packets and crypto endpoints.
                </div>
              </div>

              <div className="p-3.5 bg-bg-base/70 border border-border-subtle rounded-lg space-y-1.5">
                <div className="flex justify-between font-semibold text-text-primary">
                  <span className="font-mono text-telecom-cyan">SENSOR-DEL-03 // DELHI CBI HQ</span>
                  <span className="text-emerald-400 font-medium text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Online</span>
                </div>
                <div className="text-xs text-text-muted">
                  NCIIPC Gateway Mirror · Real-time Suricata IDS log forwarder.
                </div>
              </div>

              <div className="p-3.5 bg-bg-base/70 border border-border-subtle rounded-lg space-y-1.5">
                <div className="flex justify-between font-semibold text-text-primary">
                  <span className="font-mono text-telecom-cyan">TELCO-CDR-CONNECTOR // CCTNS</span>
                  <span className="text-emerald-400 font-medium text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Online</span>
                </div>
                <div className="text-xs text-text-muted">
                  Automated Section 91 CDR subscriber ledger ingestion pipeline.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkstationShell>
  );
}

export default function EvidenceIngestionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-bg-base text-text-muted font-sans text-xs">
          Loading evidence ingestion workspace...
        </div>
      }
    >
      <EvidenceIngestionContent />
    </Suspense>
  );
}
