"use client";

import React, { useState, useRef, useEffect } from "react";
import { SidebarNav } from "@/components/SidebarNav";
import { ThreatRadarStream } from "@/components/graph/ThreatRadarStream";
import { DetailDrawer } from "@/components/inspector/DetailDrawer";
import { RadarNode, RadarStreamHandle, StreamStateInfo } from "@/types/radar";
import {
  Search,
  Download,
  Check,
  Shield,
  Activity,
  ChevronDown,
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Zap,
  Maximize2,
  Database,
  Terminal,
  SlidersHorizontal,
  Flame,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function CyberStreamRadarPage() {
  const [selectedNode, setSelectedNode] = useState<RadarNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [activeNavTab, setActiveNavTab] = useState<string>("graph");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedExport, setCopiedExport] = useState<boolean>(false);
  const [copiedCypher, setCopiedCypher] = useState<boolean>(false);
  const [showIngestModal, setShowIngestModal] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [showActionsMenu, setShowActionsMenu] = useState<boolean>(false);
  const [streamState, setStreamState] = useState<StreamStateInfo | null>(null);

  const radarRef = useRef<RadarStreamHandle>(null);
  const diagnosticsRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        diagnosticsRef.current &&
        !diagnosticsRef.current.contains(e.target as Node)
      ) {
        setShowDiagnostics(false);
      }
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(e.target as Node)
      ) {
        setShowActionsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNodeSelect = (node: RadarNode) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  const handleFocusNode = (nodeId: string) => {
    radarRef.current?.focusNode(nodeId);
  };

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);
    radarRef.current?.focusSyndicate?.(caseId);
  };


  const handleExportEvidence = () => {
    const snapshot = radarRef.current?.getSnapshot?.() || { nodes: [], links: [] };
    const payload = {
      timestamp: new Date().toISOString(),
      caseReference: "STREAM-RADAR-DFIR-2024",
      investigator: "ANALYST_0x99A",
      radarSnapshot: {
        totalNodes: snapshot.nodes.length,
        totalLinks: snapshot.links.length,
        flaggedThreats: snapshot.nodes.filter((n) => n.state === "FLAGGED"),
      },
      selectedArtifact: selectedNode,
      cryptographicChainOfCustody:
        "SHA256:7f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CYBER_STREAM_EVIDENCE_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setCopiedExport(true);
    setShowActionsMenu(false);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleExportCypher = async () => {
    const snapshot = radarRef.current?.getSnapshot?.() || { nodes: [], links: [] };
    const { generateCypherDump } = await import("@/lib/neo4j");
    const cypherScript = generateCypherDump(snapshot.nodes, snapshot.links);

    const blob = new Blob([cypherScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NEO4J_THREAT_GRAPH_${Date.now()}.cql`;
    link.click();
    URL.revokeObjectURL(url);
    setCopiedCypher(true);
    setShowActionsMenu(false);
    setTimeout(() => setCopiedCypher(false), 2000);
  };

  // Search filter / auto-focus
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();
    const snapshot = radarRef.current?.getSnapshot?.();
    if (!snapshot) return;

    const matchedNode = snapshot.nodes.find(
      (n) =>
        n.ip.toLowerCase().includes(q) ||
        n.mac.toLowerCase().includes(q) ||
        n.subnet.toLowerCase().includes(q) ||
        (n.accusedName && n.accusedName.toLowerCase().includes(q))
    );

    if (matchedNode) {
      handleNodeSelect(matchedNode);
      handleFocusNode(matchedNode.id);
    }
  };

  const flaggedThreatCount = streamState?.metrics.confirmedThreats ?? 0;

  return (
    <div className="flex flex-col h-screen w-screen bg-bg-base text-text-primary overflow-hidden font-mono antialiased">
      {/* ================= CONSOLIDATED TOP COMMAND BAR ================= */}
      <header className="flex justify-between items-center w-full px-3 py-1 h-10 border-b border-border-subtle bg-surface-overlay text-xs uppercase tracking-wider shrink-0 z-50 select-none">
        {/* Left: Brand + Diagnostics Popover */}
        <div className="flex items-center gap-2.5">
          {/* Brand Badge */}
          <div className="flex items-center gap-2 pr-2.5 border-r border-border-subtle">
            <span className="inline-block w-2 h-2 bg-telecom-cyan rounded-full status-pulse" />
            <span className="font-mono text-xs font-bold text-text-primary tracking-widest uppercase">
              DFIR // THREAT-RADAR
            </span>
          </div>

          {/* Compact Status Indicator (SYSTEM OPTIMAL · 4ms) */}
          <div className="relative" ref={diagnosticsRef}>
            <button
              type="button"
              onClick={() => setShowDiagnostics((prev) => !prev)}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-bg-base hover:bg-surface-card border border-border-subtle hover:border-border-highlight text-[11px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse" />
              <span className="font-bold text-emerald-400">SYSTEM OPTIMAL</span>
              <span className="text-text-muted">·</span>
              <span className="text-text-muted">4ms</span>
              <ChevronDown className="w-3 h-3 text-text-muted ml-0.5" />
            </button>

            {/* Diagnostics Popover Dropdown */}
            {showDiagnostics && (
              <div className="absolute top-8 left-0 w-72 bg-surface-card border border-border-highlight p-3 shadow-2xl z-50 space-y-2 text-[10px]">
                <div className="flex justify-between items-center pb-1.5 border-b border-border-subtle font-bold text-text-primary">
                  <span className="flex items-center gap-1.5 text-telecom-cyan">
                    <Activity className="w-3.5 h-3.5" />
                    TELEMETRY DIAGNOSTICS
                  </span>
                  <span className="text-emerald-400">ONLINE</span>
                </div>
                <div className="space-y-1.5 text-text-secondary">
                  <div className="flex justify-between">
                    <span className="text-text-muted">DL PIPELINE:</span>
                    <span className="text-emerald-400 font-bold">3-STAGE ACTIVE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">NEO4J BOLT SYNC:</span>
                    <span className="text-purple-400 font-bold">LIVE SYNCED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">INGRESS QUEUE:</span>
                    <span className="text-text-primary font-bold">
                      {streamState?.queueIndex ?? 0} / {streamState?.maxQueue ?? 50}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">ACTIVE TPS:</span>
                    <span className="text-telecom-cyan font-bold">
                      {streamState?.metrics.currentTps ?? 1.2} pkt/s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">BENIGN FILTERED:</span>
                    <span className="text-text-muted font-bold">
                      {streamState?.metrics.clearedBenign ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">OPERATOR ID:</span>
                    <span className="text-record-amber font-bold">ANALYST_0x99A</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Box & Stream Toolbar */}
        <div className="flex items-center gap-3">
          {/* Stream Engine Controls in Top Bar */}
          <div className="flex items-center gap-1 bg-bg-base border border-border-subtle p-0.5">
            {/* Stream Next Single Packet */}
            <button
              type="button"
              onClick={() => radarRef.current?.streamNext()}
              className="flex items-center gap-1 px-2 py-0.5 bg-surface-overlay hover:bg-border-subtle text-telecom-cyan hover:text-text-primary text-[10px] font-bold transition-colors cursor-pointer"
              title="Stream Next Ingress IP"
            >
              <StepForward className="w-3 h-3" />
              <span className="hidden md:inline">NEXT IP</span>
            </button>

            {/* Play/Pause Auto Stream */}
            <button
              type="button"
              onClick={() => radarRef.current?.togglePlay()}
              className={`p-1 transition-colors cursor-pointer ${
                streamState?.isPlaying
                  ? "bg-amber-950/40 text-amber-400 hover:bg-amber-900/50"
                  : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50"
              }`}
              title={streamState?.isPlaying ? "Pause Ingestion" : "Resume Auto Ingestion"}
            >
              {streamState?.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>

            {/* Speed Pills */}
            <div className="flex items-center border-l border-border-subtle pl-1 ml-0.5">
              {([1, 2, 5] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => radarRef.current?.setSpeed(s)}
                  className={`px-1.5 py-0.5 text-[9px] font-bold transition-colors cursor-pointer ${
                    streamState?.speed === s
                      ? "bg-telecom-cyan-dim text-telecom-cyan border border-telecom-cyan/40"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Reset Stream */}
            <button
              type="button"
              onClick={() => radarRef.current?.resetStream()}
              className="p-1 text-text-muted hover:text-threat-crimson transition-colors cursor-pointer border-l border-border-subtle ml-0.5 pl-1.5"
              title="Reset Stream Buffer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 bg-bg-base px-2 py-0.5 border border-border-subtle hover:border-border-highlight transition-colors w-64 lg:w-72">
            <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <input
              className="bg-transparent border-none outline-none text-text-primary font-mono text-[11px] placeholder-text-muted w-full p-0 focus:ring-0 focus:outline-none"
              placeholder="QUERY NODE / IP / CIDR..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="text-[9px] text-text-muted border border-border-subtle px-1 leading-tight">
              ⌘K
            </span>
          </form>
        </div>

        {/* Right: Threat Counter & Consolidated Actions Menu */}
        <div className="flex items-center gap-2">
          {/* Confirmed Threats Counter Pill */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-red-950/60 hover:bg-red-900/60 border border-red-500/50 text-red-400 text-[11px] font-bold transition-colors cursor-pointer"
            title="Inspect Tracked Threats"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>{flaggedThreatCount} THREATS</span>
          </button>

          {/* Consolidated Actions Dropdown Menu */}
          <div className="relative" ref={actionsMenuRef}>
            <button
              type="button"
              onClick={() => setShowActionsMenu((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-overlay hover:bg-border-subtle text-text-primary text-[11px] border border-border-subtle hover:border-border-highlight transition-colors cursor-pointer font-medium"
            >
              <span>Actions</span>
              <ChevronDown className="w-3 h-3 text-text-muted" />
            </button>

            {showActionsMenu && (
              <div className="absolute right-0 top-8 w-52 bg-surface-card border border-border-highlight shadow-2xl py-1 z-50 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={handleExportCypher}
                  className="w-full text-left px-3 py-1.5 hover:bg-surface-overlay flex items-center justify-between text-purple-300 hover:text-purple-100 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    Export Cypher (.cql)
                  </span>
                  {copiedCypher && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={handleExportEvidence}
                  className="w-full text-left px-3 py-1.5 hover:bg-surface-overlay flex items-center justify-between text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-telecom-cyan" />
                    Export Evidence JSON
                  </span>
                  {copiedExport && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <div className="h-[1px] bg-border-subtle my-1" />

                <button
                  type="button"
                  onClick={() => {
                    radarRef.current?.fitView();
                    setShowActionsMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-surface-overlay flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-text-muted" />
                  Auto-Fit Radar View
                </button>

                <button
                  type="button"
                  onClick={() => {
                    radarRef.current?.resetSimulation();
                    setShowActionsMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-surface-overlay flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-text-muted" />
                  Reheat Physics Engine
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= MAIN WORKSPACE ================= */}
      <div className="flex-1 flex overflow-hidden relative w-full h-full">
        {/* Left Side Navigation */}
        <SidebarNav
          activeTab={activeNavTab}
          onTabChange={setActiveNavTab}
          onIngestClick={() => setShowIngestModal(true)}
          selectedCaseId={selectedCaseId}
          onCaseSelect={handleCaseSelect}
        />


        {/* Center Canvas: ThreatRadarStream (Clean, Zero Floating Clutter) */}
        <div
          className={`flex-1 relative w-full h-full overflow-hidden bg-bg-base transition-[margin] duration-300 ${
            isDrawerOpen && selectedNode ? "mr-0 sm:mr-96 md:mr-[400px]" : ""
          }`}
        >
          <ThreatRadarStream
            ref={radarRef}
            onNodeSelect={handleNodeSelect}
            selectedNodeId={selectedNode?.id || null}
            selectedCaseId={selectedCaseId}
            onStreamStateChange={setStreamState}
          />
        </div>


        {/* Right Forensic Detail Drawer */}
        <DetailDrawer
          selectedNode={selectedNode}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onFocusNode={handleFocusNode}
          flaggedNodes={streamState?.flaggedNodes || []}
          onSelectNode={handleNodeSelect}
        />
      </div>

      {/* ================= INGEST EVIDENCE MODAL ================= */}
      {showIngestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono">
          <div className="w-full max-w-md bg-surface-card border border-border-highlight p-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle mb-3">
              <span className="text-xs font-bold text-telecom-cyan uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                INGEST FORENSIC ARTIFACT
              </span>
              <button
                type="button"
                onClick={() => setShowIngestModal(false)}
                className="text-text-muted hover:text-text-primary text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-text-muted block mb-1">
                  ARTIFACT INGRESS FORMAT:
                </label>
                <select className="w-full bg-bg-base border border-border-subtle text-text-primary px-2 py-1 text-xs focus:outline-none focus:border-telecom-cyan font-mono">
                  <option>PCAP / Wireshark Packet Capture</option>
                  <option>Suricata EVE.json Security Log</option>
                  <option>Zeek Conn.log Stream</option>
                  <option>AWS VPC Flow Log Archive</option>
                </select>
              </div>
              <div className="border border-dashed border-border-subtle p-6 text-center bg-bg-base/50 cursor-pointer hover:border-telecom-cyan transition-colors">
                <span className="text-text-muted text-[11px] block">
                  Click to browse or drop packet dump files
                </span>
                <span className="text-[9px] text-text-secondary mt-1 block">
                  Dispatches directly into 3-Stage DL pipeline
                </span>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-border-subtle flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowIngestModal(false)}
                className="px-3 py-1 bg-surface-overlay hover:bg-border-subtle border border-border-subtle text-text-muted text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIngestModal(false);
                  radarRef.current?.streamNext();
                }}
                className="px-3 py-1 bg-telecom-cyan-dim border border-telecom-cyan text-telecom-cyan font-bold text-xs hover:bg-telecom-cyan/30 cursor-pointer"
              >
                Ingest &amp; Analyze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
