"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { MOCK_CASES } from "@/data/dfir-mock-database";

type IngestionSourceType = "FILE" | "NETWORK_SENSOR" | "SIEM" | "SYSLOG" | "REST_API" | "DATABASE";

const PIPELINE_STEPS = [
  { id: "INGEST", label: "INGEST", description: "Ingress buffer capture" },
  { id: "VALIDATE", label: "VALIDATE", description: "Header checksum check" },
  { id: "PARSE", label: "PARSE", description: "Protocol dissection" },
  { id: "NORMALIZE", label: "NORMALIZE", description: "DFIR standard schema" },
  { id: "ENTITY_EXTRACTION", label: "ENTITY EXTRACTION", description: "IP/MAC/IMSI unmasking" },
  { id: "FEATURE_EXTRACTION", label: "FEATURE EXTRACTION", description: "Tensor vector construction" },
  { id: "AI_STAGE_1", label: "AI STAGE 1", description: "Anomaly autoencoder" },
  { id: "AI_STAGE_2", label: "AI STAGE 2", description: "Behavioral GNN analysis" },
  { id: "AI_STAGE_3", label: "AI STAGE 3", description: "Bayesian risk fusion" },
  { id: "GRAPH_CORRELATION", label: "GRAPH CORRELATION", description: "Neo4j edge synthesis" },
  { id: "INVESTIGATOR_REVIEW", label: "INVESTIGATOR REVIEW", description: "Human-in-the-loop audit" },
];

import { Suspense } from "react";

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
    format: "PCAP / WireShark TCP Dump",
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
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3 bg-bg-base select-none font-mono">
        {/* Workspace Top Title & Tabs Header */}
        <div className="flex justify-between items-center pb-2 border-b border-border-subtle text-xs">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-telecom-cyan" />
            <span className="font-bold text-text-primary tracking-wider uppercase">
              EVIDENCE INGESTION &amp; AUTOMATED PIPELINE
            </span>
          </div>

          <div className="flex items-center gap-1 bg-surface-card border border-border-subtle p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("pipeline")}
              className={`px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors ${activeTab === "pipeline"
                  ? "bg-telecom-cyan-dim text-telecom-cyan border border-telecom-cyan/40"
                  : "text-text-muted hover:text-text-primary"
                }`}
            >
              LIVE PIPELINE
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("jobs")}
              className={`px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors ${activeTab === "jobs"
                  ? "bg-telecom-cyan-dim text-telecom-cyan border border-telecom-cyan/40"
                  : "text-text-muted hover:text-text-primary"
                }`}
            >
              PROCESSING JOBS (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sources")}
              className={`px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors ${activeTab === "sources"
                  ? "bg-telecom-cyan-dim text-telecom-cyan border border-telecom-cyan/40"
                  : "text-text-muted hover:text-text-primary"
                }`}
            >
              DATA SOURCES (6)
            </button>
          </div>
        </div>

        {activeTab === "pipeline" && (
          <div className="space-y-3">
            {/* Upper: Data Source Selector & File Drop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Left Source Options (4 cols) */}
              <div className="lg:col-span-4 bg-surface-card border border-border-subtle p-3 space-y-3 text-xs">
                <div className="font-bold text-text-primary text-[11px] pb-1 border-b border-border-subtle">
                  1. SELECT EVIDENCE SOURCE
                </div>

                <div className="grid grid-cols-2 gap-1.5">
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
                        className={`p-2 border text-left flex items-center gap-1.5 cursor-pointer transition-colors ${isSelected
                            ? "bg-telecom-cyan-dim/40 border-telecom-cyan text-telecom-cyan font-bold"
                            : "bg-surface-overlay border-border-subtle text-text-secondary hover:border-border-highlight"
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] truncate">{src.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-2 border-t border-border-subtle">
                  <div>
                    <label className="text-[10px] text-text-muted block mb-1">TARGET INVESTIGATION CASE:</label>
                    <select
                      value={selectedCase}
                      onChange={(e) => setSelectedCase(e.target.value)}
                      className="w-full bg-bg-base border border-border-subtle text-text-primary px-2 py-1 text-[11px] font-mono focus:border-telecom-cyan outline-none"
                    >
                      {MOCK_CASES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} - {c.title.slice(0, 32)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-text-muted block mb-1">INGRESS PROTOCOL / FORMAT:</label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full bg-bg-base border border-border-subtle text-text-primary px-2 py-1 text-[11px] font-mono focus:border-telecom-cyan outline-none"
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
              <div className="lg:col-span-8 bg-surface-card border border-border-subtle p-3 flex flex-col justify-between space-y-3 text-xs">
                <div>
                  <div className="flex justify-between items-center pb-1 border-b border-border-subtle text-[11px] font-bold">
                    <span>2. STAGED EVIDENCE INSPECTION</span>
                    <span className="text-emerald-400 font-normal">● READY FOR DISPATCH</span>
                  </div>

                  {/* Drop zone placeholder */}
                  <div className="mt-2 border border-dashed border-border-subtle hover:border-telecom-cyan p-4 bg-bg-base/60 text-center cursor-pointer transition-colors">
                    <UploadCloud className="w-6 h-6 text-telecom-cyan mx-auto mb-1" />
                    <div className="text-[11px] font-bold text-text-primary">
                      DROP EVIDENCE FILE (PCAP, ZEEK, SURICATA, SYSLOG, JSON, CSV)
                    </div>
                    <div className="text-[9px] text-text-muted mt-0.5">
                      Cryptographic integrity hash (SHA-256) will be computed locally before tensor injection.
                    </div>
                  </div>

                  {/* Pre-processing Display Metadata */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-surface-overlay p-2.5 border border-border-subtle text-[11px]">
                    <div>
                      <span className="text-[9px] text-text-muted block">FILE NAME:</span>
                      <span className="font-bold text-text-primary truncate block">{stagedArtifact.fileName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted block">ACQUISITION TIME:</span>
                      <span className="text-text-secondary block">{stagedArtifact.acquisitionTime}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted block">SIZE:</span>
                      <span className="font-bold text-telecom-cyan block">{stagedArtifact.fileSize}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted block">FORMAT:</span>
                      <span className="text-text-primary block">{stagedArtifact.format}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted block">SOURCE LOCATION:</span>
                      <span className="text-text-secondary truncate block">{stagedArtifact.source}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted block">ASSIGNED CASE:</span>
                      <span className="text-record-amber font-bold block">{stagedArtifact.caseAssociation}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-3 pt-1 border-t border-border-subtle/60">
                      <span className="text-[9px] text-text-muted block">SHA-256 HASH (PRE-COMPUTED):</span>
                      <span className="font-mono text-[10px] text-emerald-400 select-all block truncate">
                        {stagedArtifact.hashSha256}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dispatch Button */}
                <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                  <span className="text-[10px] text-text-muted">
                    Automated pipeline dispatches into TensorRT DL models and writes edges directly to Neo4j.
                  </span>
                  <button
                    type="button"
                    onClick={handleStartPipeline}
                    disabled={pipelineState === "PROCESSING"}
                    className="px-4 py-1.5 bg-telecom-cyan-dim border border-telecom-cyan text-telecom-cyan hover:bg-telecom-cyan/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>
                      {pipelineState === "PROCESSING"
                        ? "EXECUTING PIPELINE..."
                        : pipelineState === "COMPLETED"
                          ? "RE-INGEST ARTIFACT"
                          : "DISPATCH TO PIPELINE"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lower: 11-Step Live Technical Pipeline Visualizer */}
            <div className="bg-surface-card border border-border-subtle p-3 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle text-xs font-bold">
                <span className="flex items-center gap-2 text-text-primary">
                  <Layers className="w-4 h-4 text-telecom-cyan" />
                  <span>LIVE 11-STAGE TECHNICAL INGESTION PIPELINE</span>
                </span>
                <span className="text-[10px] text-text-muted">
                  STATUS:{" "}
                  <strong
                    className={
                      pipelineState === "COMPLETED"
                        ? "text-emerald-400"
                        : pipelineState === "PROCESSING"
                          ? "text-telecom-cyan"
                          : "text-text-muted"
                    }
                  >
                    {pipelineState}
                  </strong>
                </span>
              </div>

              {/* Steps progression bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-1.5">
                {PIPELINE_STEPS.map((step, idx) => {
                  const isCurrent = activeStepIndex === idx && pipelineState === "PROCESSING";
                  const isDone = activeStepIndex > idx || pipelineState === "COMPLETED";

                  return (
                    <div
                      key={step.id}
                      className={`p-2 border flex flex-col justify-between min-h-[72px] transition-all ${isCurrent
                          ? "bg-cyan-950/80 border-telecom-cyan ring-1 ring-telecom-cyan"
                          : isDone
                            ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                            : "bg-bg-base border-border-subtle text-text-muted opacity-60"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-mono text-text-muted">#{idx + 1}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-telecom-cyan status-pulse" />
                        ) : (
                          <Clock className="w-3 h-3 text-text-muted shrink-0" />
                        )}
                      </div>

                      <div className="mt-1">
                        <div className={`text-[9px] font-bold uppercase truncate ${isCurrent ? "text-telecom-cyan" : ""}`}>
                          {step.label}
                        </div>
                        <div className="text-[8px] text-text-muted leading-tight truncate">
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
          <div className="bg-surface-card border border-border-subtle p-3 space-y-3">
            <div className="text-xs font-bold text-text-primary pb-2 border-b border-border-subtle flex justify-between">
              <span>ACTIVE &amp; RECENT INGESTION JOBS</span>
              <span className="text-[10px] text-text-muted">AUTO-SCALING WORKERS: 4</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-bg-base border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="font-bold text-text-primary">JOB-9821 // PCAP-BKC-JIO-INGRESS</div>
                  <div className="text-[10px] text-text-muted">
                    Source: Cisco Nexus Mirror · Target: FIR-0104/2026 · 1.36 GB · 14,280 Packets
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 border border-emerald-500/50 font-bold">
                    COMPLETED (14ms)
                  </span>
                  <div className="text-[9px] text-text-muted mt-1">2026-08-14 18:00 IST</div>
                </div>
              </div>

              <div className="p-3 bg-bg-base border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="font-bold text-text-primary">JOB-9822 // ZEEK-FLOKINET-TOR</div>
                  <div className="text-[10px] text-text-muted">
                    Source: Tor Exit Mirror · Target: FIR-2024-8842 · 842.4 MB · 8,940 Circuits
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 border border-emerald-500/50 font-bold">
                    COMPLETED (18ms)
                  </span>
                  <div className="text-[9px] text-text-muted mt-1">2024-10-24 05:30 IST</div>
                </div>
              </div>

              <div className="p-3 bg-bg-base border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="font-bold text-text-primary">JOB-9823 // SURICATA-LINODE-RANSOM</div>
                  <div className="text-[10px] text-text-muted">
                    Source: Sensor Grid Delhi · Target: FIR-7719/2026 · 400.0 MB · 3,110 EVE alerts
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 border border-emerald-500/50 font-bold">
                    COMPLETED (12ms)
                  </span>
                  <div className="text-[9px] text-text-muted mt-1">2026-07-18 14:10 IST</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Data Sources */}
        {activeTab === "sources" && (
          <div className="bg-surface-card border border-border-subtle p-3 space-y-3">
            <div className="text-xs font-bold text-text-primary pb-2 border-b border-border-subtle flex justify-between">
              <span>CONNECTED SENSORS &amp; TELEMETRY INGRESS CHANNELS</span>
              <span className="text-emerald-400 font-normal">● 6 SENSORS ACTIVE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-bg-base border border-border-subtle space-y-1">
                <div className="flex justify-between font-bold text-text-primary">
                  <span>SENSOR-BKC-01 // MUMBAI</span>
                  <span className="text-emerald-400">ONLINE</span>
                </div>
                <div className="text-[10px] text-text-muted">
                  Optical Tap at Jio BKC Node · Monitoring 115.112.45.0/24 subnet traffic.
                </div>
              </div>

              <div className="p-3 bg-bg-base border border-border-subtle space-y-1">
                <div className="flex justify-between font-bold text-text-primary">
                  <span>SENSOR-BLR-02 // BENGALURU</span>
                  <span className="text-emerald-400">ONLINE</span>
                </div>
                <div className="text-[10px] text-text-muted">
                  CID Cyber Command Sensor · Monitoring Tor exit relay packets and crypto endpoints.
                </div>
              </div>

              <div className="p-3 bg-bg-base border border-border-subtle space-y-1">
                <div className="flex justify-between font-bold text-text-primary">
                  <span>SENSOR-DEL-03 // DELHI CBI HQ</span>
                  <span className="text-emerald-400">ONLINE</span>
                </div>
                <div className="text-[10px] text-text-muted">
                  NCIIPC Gateway Mirror · Real-time Suricata IDS log forwarder.
                </div>
              </div>

              <div className="p-3 bg-bg-base border border-border-subtle space-y-1">
                <div className="flex justify-between font-bold text-text-primary">
                  <span>TELCO-CDR-CONNECTOR // CCTNS</span>
                  <span className="text-emerald-400">ONLINE</span>
                </div>
                <div className="text-[10px] text-text-muted">
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
        <div className="flex-1 flex items-center justify-center bg-bg-base text-text-muted font-mono text-xs">
          LOADING EVIDENCE INGESTION WORKSPACE...
        </div>
      }
    >
      <EvidenceIngestionContent />
    </Suspense>
  );
}

