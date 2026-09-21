"use client";

import React, { useState, useMemo, useRef } from "react";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import { DetailDrawer } from "@/components/inspector/DetailDrawer";
import { EdgeInspectorDrawer } from "@/components/inspector/EdgeInspectorDrawer";
import { RadarNode } from "@/types/radar";
import { DFIRRelationship } from "@/types/relationship";
import {
  Network,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  RotateCcw,
  Download,
  Filter,
  Layers,
  Search,
  Sliders,
  Share2,
  Code,
  Terminal,
  Shield,
  Eye,
  EyeOff,
  GitFork,
  Radio,
  User,
  Smartphone,
  Laptop,
  FileText,
  MapPin,
  Building,
  Lock,
} from "lucide-react";
import { ALL_THREE_SYNDICATES_DATA } from "@/data/cyber-packet-pool";

type LayoutType = "FORCE" | "RADIAL" | "TIMELINE" | "HIERARCHY";
type EntityTypeFilter = "ALL" | "PERSON" | "IP" | "PHONE" | "DEVICE" | "FIR" | "LOCATION" | "EVIDENCE";
type RelTypeFilter = "ALL" | "ROUTED_TRAFFIC" | "ASSOCIATED_WITH" | "REGISTERED_TO" | "COMMUNICATED_WITH" | "APPEARS_IN" | "LOCATED_AT";

interface GraphCanvasNode {
  id: string;
  name: string;
  type: "PERSON" | "IP" | "PHONE" | "DEVICE" | "FIR" | "LOCATION" | "EVIDENCE";
  riskScore: number;
  isFlagged: boolean;
  syndicate: string;
  caseRef: string;
  details: string;
  x: number;
  y: number;
  radarPayload?: any;
}

interface GraphCanvasEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
  confidence: number;
  sourceType: string;
  evidenceRef: string;
  legalContext: string;
}

export default function GraphWorkspacePage() {
  const [activeCaseId, setActiveCaseId] = useState<string>("FIR-0104/2026");
  const [layout, setLayout] = useState<LayoutType>("FORCE");
  const [depth, setDepth] = useState<number>(3);
  const [selectedEntityType, setSelectedEntityType] = useState<EntityTypeFilter>("ALL");
  const [selectedRelType, setSelectedRelType] = useState<RelTypeFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Inspector states
  const [selectedNode, setSelectedNode] = useState<RadarNode | null>(null);
  const [isNodeDrawerOpen, setIsNodeDrawerOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<(DFIRRelationship & { sourceNodeName?: string; targetNodeName?: string }) | null>(null);
  const [isEdgeDrawerOpen, setIsEdgeDrawerOpen] = useState(false);
  const [showCypherModal, setShowCypherModal] = useState(false);

  // Derive graph dataset from ALL_THREE_SYNDICATES_DATA
  const { nodes, edges } = useMemo(() => {
    const rawNodes: GraphCanvasNode[] = [];
    const rawEdges: GraphCanvasEdge[] = [];
    const addedNodeIds = new Set<string>();

    const syndicateFilter = activeCaseId === "ALL" ? null : activeCaseId;

    ALL_THREE_SYNDICATES_DATA.forEach((packet, idx) => {
      if (syndicateFilter && !packet.caseRef?.includes(syndicateFilter.split("/")[0])) {
        return;
      }

      // 1. Person Node
      const personId = `node-person-${idx}`;
      if (!addedNodeIds.has(personId)) {
        addedNodeIds.add(personId);
        rawNodes.push({
          id: personId,
          name: packet.personalInfo.fullName,
          type: "PERSON",
          riskScore: packet.anomalyScore * 100,
          isFlagged: packet.isThreat,
          syndicate: packet.personalInfo.syndicateAffiliation || "Jamtara Phishing Syndicate",
          caseRef: packet.caseRef || "FIR-0104/2026",
          details: packet.personalInfo.occupation,
          x: 200 + (idx % 4) * 220 + Math.sin(idx) * 40,
          y: 180 + Math.floor(idx / 4) * 190 + Math.cos(idx) * 30,
          radarPayload: {
            id: personId,
            name: packet.personalInfo.fullName,
            accusedName: packet.personalInfo.fullName,
            ip: packet.ip,
            mac: packet.mac,
            anomalyScore: packet.anomalyScore,
            stage: packet.isThreat ? "FLAGGED" : "CLEARED",
            flagged: packet.isThreat,
            personalInfo: packet.personalInfo,
            firDetails: packet.firDetails,
            cdrDetails: packet.cdrDetails,
          },
        });
      }

      // 2. IP Node
      const ipId = `node-ip-${idx}`;
      if (!addedNodeIds.has(ipId)) {
        addedNodeIds.add(ipId);
        rawNodes.push({
          id: ipId,
          name: packet.ip,
          type: "IP",
          riskScore: packet.anomalyScore * 100,
          isFlagged: packet.isThreat,
          syndicate: packet.ispDhcp,
          caseRef: packet.caseRef || "FIR-0104/2026",
          details: `${packet.asnOrg} (${packet.protocol})`,
          x: 120 + (idx % 4) * 220 + Math.cos(idx) * 60,
          y: 340 + Math.floor(idx / 4) * 190 + Math.sin(idx) * 40,
          radarPayload: {
            id: ipId,
            name: packet.ip,
            ip: packet.ip,
            mac: packet.mac,
            anomalyScore: packet.anomalyScore,
            stage: packet.isThreat ? "FLAGGED" : "CLEARED",
            flagged: packet.isThreat,
            personalInfo: packet.personalInfo,
            firDetails: packet.firDetails,
            cdrDetails: packet.cdrDetails,
          },
        });
      }

      // 3. Phone Node
      const phoneId = `node-phone-${idx}`;
      if (!addedNodeIds.has(phoneId)) {
        addedNodeIds.add(phoneId);
        rawNodes.push({
          id: phoneId,
          name: packet.personalInfo.contactDetails.phone,
          type: "PHONE",
          riskScore: 78,
          isFlagged: packet.isThreat,
          syndicate: packet.personalInfo.syndicateAffiliation || "Jamtara Phishing Syndicate",
          caseRef: packet.caseRef || "FIR-0104/2026",
          details: `MSISDN: ${packet.cdrDetails.callerIdNumber || packet.personalInfo.contactDetails.phone}`,
          x: 280 + (idx % 4) * 220,
          y: 310 + Math.floor(idx / 4) * 190,
          radarPayload: {
            id: phoneId,
            name: packet.personalInfo.contactDetails.phone,
            ip: packet.ip,
            mac: packet.mac,
            anomalyScore: packet.anomalyScore,
            stage: packet.isThreat ? "FLAGGED" : "CLEARED",
            flagged: packet.isThreat,
            personalInfo: packet.personalInfo,
            firDetails: packet.firDetails,
            cdrDetails: packet.cdrDetails,
          },
        });
      }

      // 4. FIR Node
      const firId = `node-fir-${packet.firDetails.firId}`;
      if (!addedNodeIds.has(firId)) {
        addedNodeIds.add(firId);
        rawNodes.push({
          id: firId,
          name: `FIR ${packet.firDetails.firId}`,
          type: "FIR",
          riskScore: 90,
          isFlagged: false,
          syndicate: packet.firDetails.policeStation || "BKC Cyber Crime Police Station",
          caseRef: packet.caseRef || "FIR-0104/2026",
          details: packet.firDetails.policeStation,
          x: 480,
          y: 80,
          radarPayload: {
            id: firId,
            name: `FIR ${packet.firDetails.firId}`,
            ip: packet.ip,
            mac: packet.mac,
            anomalyScore: 0.9,
            stage: "FLAGGED",
            flagged: true,
            personalInfo: packet.personalInfo,
            firDetails: packet.firDetails,
            cdrDetails: packet.cdrDetails,
          },
        });
      }

      // Edges
      rawEdges.push({
        id: `rel-person-ip-${idx}`,
        source: personId,
        target: ipId,
        type: "ROUTED_TRAFFIC",
        label: "ROUTED_TRAFFIC",
        confidence: 96,
        sourceType: "OBSERVED_NETWORK_DATA",
        evidenceRef: "EVD-2026-001 (Packet Mirror)",
        legalContext: "Sec 91 CrPC ISP Lease Log",
      });

      rawEdges.push({
        id: `rel-person-phone-${idx}`,
        source: personId,
        target: phoneId,
        type: "REGISTERED_TO",
        label: "REGISTERED_TO",
        confidence: 99,
        sourceType: "PROVIDER_DERIVED",
        evidenceRef: "DOC-CAF-SUB-9021",
        legalContext: "Telco Subscriber Application Form",
      });

      rawEdges.push({
        id: `rel-person-fir-${idx}`,
        source: personId,
        target: firId,
        type: "APPEARS_IN",
        label: "NAMED_IN_FIR",
        confidence: 100,
        sourceType: "HUMAN_INVESTIGATOR_CONCLUSION",
        evidenceRef: `FIR-${packet.firDetails.firId} Record`,
        legalContext: "Certified Copy State Crime Register",
      });
    });

    return { nodes: rawNodes, edges: rawEdges };
  }, [activeCaseId]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (selectedEntityType !== "ALL" && n.type !== selectedEntityType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.name.toLowerCase().includes(q) ||
          n.details.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [nodes, selectedEntityType, searchQuery]);

  const visibleNodeIdSet = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  // Filtered edges
  const filteredEdges = useMemo(() => {
    return edges.filter((e) => {
      if (!visibleNodeIdSet.has(e.source) || !visibleNodeIdSet.has(e.target)) return false;
      if (selectedRelType !== "ALL" && e.type !== selectedRelType) return false;
      return true;
    });
  }, [edges, visibleNodeIdSet, selectedRelType]);

  const handleNodeClick = (node: GraphCanvasNode) => {
    if (node.radarPayload) {
      setSelectedNode(node.radarPayload);
      setIsNodeDrawerOpen(true);
      setIsEdgeDrawerOpen(false);
    }
  };

  const handleEdgeClick = (edge: GraphCanvasEdge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    const relData: DFIRRelationship & { sourceNodeName?: string; targetNodeName?: string } = {
      id: edge.id,
      sourceEntityId: edge.source,
      targetEntityId: edge.target,
      sourceNodeName: sourceNode?.name || edge.source,
      targetNodeName: targetNode?.name || edge.target,
      category: "ROUTED_TRAFFIC",
      label: edge.label,
      confidence: edge.confidence,
      provenance: "OBSERVED_NETWORK_DATA",
      sourceDescription: edge.legalContext,
      evidenceRefId: edge.evidenceRef,
      authorizationContext: edge.legalContext,
      firstObserved: "2026-08-14 17:45:10 IST",
      lastObserved: "2026-08-20 11:00:24 IST",
    };

    setSelectedEdge(relData);
    setIsEdgeDrawerOpen(true);
    setIsNodeDrawerOpen(false);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.15, 2.2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.15, 0.4));
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Export JSON Graph
  const handleExportGraph = () => {
    const graphData = {
      timestamp: new Date().toISOString(),
      caseId: activeCaseId,
      nodesCount: filteredNodes.length,
      edgesCount: filteredEdges.length,
      nodes: filteredNodes.map((n) => ({ id: n.id, name: n.name, type: n.type, riskScore: n.riskScore })),
      edges: filteredEdges,
    };
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neo4j-graph-export-${activeCaseId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getNodeColor = (type: GraphCanvasNode["type"], isFlagged: boolean) => {
    switch (type) {
      case "PERSON":
        return isFlagged ? "#ef4444" : "#a855f7";
      case "IP":
        return isFlagged ? "#f97316" : "#06b6d4";
      case "PHONE":
        return "#10b981";
      case "DEVICE":
        return "#3b82f6";
      case "FIR":
        return "#eab308";
      case "LOCATION":
        return "#ec4899";
      default:
        return "#94a3b8";
    }
  };

  return (
    <WorkstationShell activeCaseId={activeCaseId} onCaseChange={setActiveCaseId}>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base font-sans select-none relative">
        {/* ================= 1. TOP GRAPH CONTROLS BAR ================= */}
        <div className="p-3 border-b border-border-subtle bg-surface-card flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {/* Left: Title & Layout Selection */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-telecom-cyan/15 border border-telecom-cyan/30 flex items-center justify-center text-telecom-cyan">
                <Network className="w-4 h-4" />
              </div>
              <span className="font-semibold text-text-primary tracking-wide">
                Knowledge Graph
              </span>
            </div>

            <div className="h-4 w-px bg-border-subtle" />

            {/* Layout Mode */}
            <div className="flex items-center gap-1 bg-bg-base rounded-md border border-border-subtle p-0.5">
              {(["FORCE", "RADIAL", "TIMELINE", "HIERARCHY"] as LayoutType[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setLayout(mode)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    layout === mode
                      ? "bg-telecom-cyan/15 text-telecom-cyan font-semibold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {mode.charAt(0) + mode.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Search & Depth Slider */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find node in graph..."
                className="pl-8 pr-3 py-1 bg-bg-base border border-border-subtle rounded-md text-xs text-text-primary w-44 focus:outline-none focus:border-telecom-cyan placeholder:text-text-muted font-sans"
              />
            </div>

            {/* Depth Slider */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-text-muted">Depth:</span>
              <div className="flex items-center gap-1 bg-bg-base rounded-md border border-border-subtle p-0.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDepth(lvl)}
                    className={`w-6 h-5 flex items-center justify-center text-xs font-mono font-medium rounded transition-colors cursor-pointer ${
                      depth === lvl
                        ? "bg-telecom-cyan/15 text-telecom-cyan font-bold"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Actions Toolbar */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-md border border-border-subtle hover:border-telecom-cyan text-text-muted hover:text-text-primary cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-md border border-border-subtle hover:border-telecom-cyan text-text-muted hover:text-text-primary cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-md border border-border-subtle hover:border-telecom-cyan text-text-muted hover:text-text-primary cursor-pointer transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowCypherModal(true)}
              className="px-2.5 py-1.5 bg-surface-card hover:bg-surface-overlay border border-border-subtle rounded-md text-telecom-cyan text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
              title="Show Cypher Query"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Cypher</span>
            </button>
            <button
              type="button"
              onClick={handleExportGraph}
              className="px-2.5 py-1.5 bg-telecom-cyan/10 hover:bg-telecom-cyan/20 border border-telecom-cyan/40 rounded-md text-telecom-cyan text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
              title="Export Graph"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* ================= 2. FILTER PILLS STRIP ================= */}
        <div className="px-4 py-2 border-b border-border-subtle/60 bg-bg-base flex flex-wrap items-center justify-between text-xs gap-2 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] text-text-muted font-medium">Node Types:</span>
            {(["ALL", "PERSON", "IP", "PHONE", "DEVICE", "FIR"] as EntityTypeFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedEntityType(filter)}
                className={`px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer ${
                  selectedEntityType === filter
                    ? "border-telecom-cyan text-telecom-cyan bg-telecom-cyan/10 font-semibold"
                    : "border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-card"
                }`}
              >
                {filter === "ALL" ? "All" : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted font-medium">Relations:</span>
            {(["ALL", "ROUTED_TRAFFIC", "REGISTERED_TO", "APPEARS_IN"] as RelTypeFilter[]).map((rf) => (
              <button
                key={rf}
                type="button"
                onClick={() => setSelectedRelType(rf)}
                className={`px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer ${
                  selectedRelType === rf
                    ? "border-amber-400 text-amber-400 bg-amber-500/10 font-semibold"
                    : "border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-card"
                }`}
              >
                {rf.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* ================= 3. GRAPH CANVAS AREA ================= */}
        <div
          className="flex-1 relative overflow-hidden bg-bg-base bg-tech-grid cursor-grab active:cursor-grabbing select-none"
          onMouseDown={(e) => {
            setIsDragging(true);
            setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {/* Status HUD Overlay */}
          <div className="absolute top-3 left-3 z-30 pointer-events-none flex flex-col gap-1 text-[10px]">
            <div className="p-2 bg-surface-card/90 backdrop-blur-sm border border-border-subtle flex items-center gap-3">
              <div>
                <span className="text-text-muted">RENDERED NODES: </span>
                <span className="text-text-primary font-bold">{filteredNodes.length}</span>
              </div>
              <span className="text-border-subtle">|</span>
              <div>
                <span className="text-text-muted">ACTIVE EDGES: </span>
                <span className="text-telecom-cyan font-bold">{filteredEdges.length}</span>
              </div>
              <span className="text-border-subtle">|</span>
              <div>
                <span className="text-text-muted">SUBGRAPH: </span>
                <span className="text-emerald-400 font-bold">{activeCaseId}</span>
              </div>
            </div>
            <div className="text-[9px] text-text-muted px-1">
              CLICK NODE → 3-TAB DOSSIER | CLICK EDGE → CORRELATION PROVENANCE
            </div>
          </div>

          {/* SVG Graph Viewport */}
          <svg
            className="w-full h-full"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: "center center",
            }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="18"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#06b6d4" />
              </marker>
              <marker
                id="arrowhead-red"
                markerWidth="8"
                markerHeight="6"
                refX="18"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
              </marker>
            </defs>

            {/* Edges */}
            {filteredEdges.map((edge) => {
              const src = filteredNodes.find((n) => n.id === edge.source);
              const tgt = filteredNodes.find((n) => n.id === edge.target);
              if (!src || !tgt) return null;

              const isThreatEdge = edge.type === "ROUTED_TRAFFIC";
              const isSelectedEdge = selectedEdge?.id === edge.id;

              return (
                <g key={edge.id} className="cursor-pointer group" onClick={() => handleEdgeClick(edge)}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isSelectedEdge ? "#10b981" : isThreatEdge ? "#ef444488" : "#06b6d466"}
                    strokeWidth={isSelectedEdge ? 3 : 1.5}
                    strokeDasharray={edge.type === "APPEARS_IN" ? "4,4" : undefined}
                    markerEnd={isThreatEdge ? "url(#arrowhead-red)" : "url(#arrowhead)"}
                    className="transition-all hover:stroke-white hover:stroke-width-3"
                  />
                  {/* Edge Label text in middle */}
                  <text
                    x={(src.x + tgt.x) / 2}
                    y={(src.y + tgt.y) / 2 - 4}
                    fill={isSelectedEdge ? "#10b981" : "#94a3b8"}
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="pointer-events-none select-none font-bold"
                  >
                    {edge.label} ({edge.confidence}%)
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.type, node.isFlagged);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => handleNodeClick(node)}
                >
                  {/* Halo for flagged nodes */}
                  {node.isFlagged && (
                    <circle
                      r="22"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="3,3"
                      className="animate-spin-slow opacity-80"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    r="15"
                    fill="#18181b"
                    stroke={isSelected ? "#38bdf8" : color}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-transform group-hover:scale-110"
                  />

                  {/* Inner Node Icon Indicator */}
                  <text
                    y="3"
                    textAnchor="middle"
                    fill={color}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {node.type.substring(0, 3)}
                  </text>

                  {/* Node Label */}
                  <text
                    y="27"
                    textAnchor="middle"
                    fill="#f4f4f5"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {node.name.length > 20 ? node.name.substring(0, 18) + "..." : node.name}
                  </text>

                  {/* Subtitle / Details */}
                  <text
                    y="38"
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="8"
                    fontFamily="monospace"
                    className="pointer-events-none select-none"
                  >
                    {node.details.length > 22 ? node.details.substring(0, 20) + ".." : node.details}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* ================= 4. NEO4J CYPHER MODAL ================= */}
        {showCypherModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
            <div className="w-full max-w-xl bg-surface-card border border-border-highlight p-4 shadow-2xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-telecom-cyan" />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    ACTIVE NEO4J CYPHER SYNTHESIS
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCypherModal(false)}
                  className="text-text-muted hover:text-text-primary text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-bg-base border border-border-subtle text-xs text-text-secondary overflow-x-auto">
                <pre className="text-telecom-cyan">
{`// Match All Entities in Investigation Dossier: ${activeCaseId}
MATCH (c:Case {caseId: "${activeCaseId}"})
MATCH (p:Person)-[r1:APPEARS_IN]->(fir:FIR)-[:ASSOCIATED_WITH]->(c)
OPTIONAL MATCH (p)-[r2:REGISTERED_TO]->(sim:PhoneNumber)
OPTIONAL MATCH (p)-[r3:ROUTED_TRAFFIC]->(ip:NetworkHost)
WHERE r1.confidence > 0.85
RETURN p, fir, sim, ip, r1, r2, r3
LIMIT 100;`}
                </pre>
              </div>

              <div className="flex justify-between items-center text-[10px] text-text-muted">
                <span>GRAPH DATABASE: Neo4j 5.22 Enterprise (Bolt :7687)</span>
                <button
                  type="button"
                  onClick={() => setShowCypherModal(false)}
                  className="px-3 py-1 bg-telecom-cyan/10 hover:bg-telecom-cyan/20 border border-telecom-cyan/40 text-telecom-cyan font-bold cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Drawers */}
        <DetailDrawer
          selectedNode={selectedNode}
          isOpen={isNodeDrawerOpen}
          onClose={() => setIsNodeDrawerOpen(false)}
        />

        <EdgeInspectorDrawer
          relationship={selectedEdge}
          isOpen={isEdgeDrawerOpen}
          onClose={() => setIsEdgeDrawerOpen(false)}
        />
      </div>
    </WorkstationShell>
  );
}
