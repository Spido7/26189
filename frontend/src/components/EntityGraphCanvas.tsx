"use client";

import React, { useState } from "react";
import {
  Plus,
  Minus,
  Maximize2,
  Crosshair,
  Share2,
  GitFork,
  Radio,
  User,
  Smartphone,
  RadioTower,
  Laptop,
  FileText,
  Bitcoin,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  ForensicNode,
  ForensicEdge,
  GraphLayoutMode,
  EntityType,
} from "@/types/forensics";

interface EntityGraphCanvasProps {
  nodes: ForensicNode[];
  edges: ForensicEdge[];
  selectedNodeId: string | null;
  onSelectNode: (node: ForensicNode) => void;
  activeFilter: EntityType | "ALL";
}

export const EntityGraphCanvas: React.FC<EntityGraphCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  activeFilter,
}) => {
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>("forceAtlas2");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);
  const [timelineProgress, setTimelineProgress] = useState<number>(65);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.6));
  const handleFit = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const visibleNodes = nodes.filter((node) => {
    if (activeFilter === "ALL") return true;
    return node.type === activeFilter;
  });

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter(
    (e) => visibleNodeIds.has(e.fromId) && visibleNodeIds.has(e.toId)
  );

  const getNodeIcon = (type: EntityType) => {
    switch (type) {
      case "Person":
        return <User className="w-4 h-4 text-accused-violet" />;
      case "PhoneNumber":
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case "Cellular_BTS":
        return <RadioTower className="w-4 h-4 text-telecom-cyan" />;
      case "Device_MAC":
        return <Laptop className="w-4 h-4 text-telecom-cyan" />;
      case "Criminal_IP":
        return <AlertTriangle className="w-4 h-4 text-threat-crimson" />;
      case "FIR":
        return <FileText className="w-4 h-4 text-record-amber" />;
      case "BTC_Wallet":
        return <Bitcoin className="w-4 h-4 text-threat-crimson" />;
      default:
        return <Share2 className="w-4 h-4 text-text-primary" />;
    }
  };

  // Node position helper based on layout mode
  const getNodeCoords = (node: ForensicNode) => {
    if (layoutMode === "hierarchical") {
      switch (node.id) {
        case "node-fir-doc":
          return { x: 50, y: 15 };
        case "node-suspect":
          return { x: 50, y: 40 };
        case "node-burner-sim":
          return { x: 22, y: 65 };
        case "node-device-mac":
          return { x: 50, y: 65 };
        case "node-bts-tower":
          return { x: 22, y: 85 };
        case "node-tor-ip":
          return { x: 75, y: 65 };
        case "node-btc-wallet":
          return { x: 82, y: 85 };
        default:
          return { x: node.xPercent, y: node.yPercent };
      }
    }
    if (layoutMode === "radial") {
      switch (node.id) {
        case "node-suspect":
          return { x: 48, y: 48 };
        case "node-burner-sim":
          return { x: 22, y: 32 };
        case "node-bts-tower":
          return { x: 20, y: 68 };
        case "node-device-mac":
          return { x: 44, y: 80 };
        case "node-tor-ip":
          return { x: 72, y: 62 };
        case "node-btc-wallet":
          return { x: 80, y: 28 };
        case "node-fir-doc":
          return { x: 62, y: 20 };
        default:
          return { x: node.xPercent, y: node.yPercent };
      }
    }
    return { x: node.xPercent, y: node.yPercent };
  };

  return (
    <main className="flex-1 relative bg-bg-base bg-tech-grid flex flex-col overflow-hidden select-none font-mono">
      {/* ================= CANVAS TOP FLOATING CONTROLS ================= */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Layout Switcher */}
        <div className="flex items-center bg-surface-overlay/90 backdrop-blur-sm border border-border-subtle p-0.5 pointer-events-auto shadow-sm">
          <button
            type="button"
            onClick={() => setLayoutMode("forceAtlas2")}
            className={`px-2 py-1 text-[11px] border-r border-border-subtle flex items-center gap-1 font-bold cursor-pointer transition-colors ${
              layoutMode === "forceAtlas2"
                ? "bg-border-subtle text-telecom-cyan"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Force Atlas 2</span>
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode("hierarchical")}
            className={`px-2 py-1 text-[11px] border-r border-border-subtle flex items-center gap-1 cursor-pointer transition-colors ${
              layoutMode === "hierarchical"
                ? "bg-border-subtle text-telecom-cyan font-bold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Hierarchical</span>
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode("radial")}
            className={`px-2 py-1 text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
              layoutMode === "radial"
                ? "bg-border-subtle text-telecom-cyan font-bold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radial</span>
          </button>
        </div>

        {/* Telemetry & Zoom Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center bg-surface-overlay/90 backdrop-blur-sm border border-border-subtle text-[11px] px-2 py-1 text-text-muted">
            <span>
              NODES: <span className="text-text-primary font-bold">{visibleNodes.length}</span>
            </span>
            <span className="mx-1.5 text-border-subtle">|</span>
            <span>
              EDGES: <span className="text-text-primary font-bold">{visibleEdges.length}</span>
            </span>
            <span className="mx-1.5 text-border-subtle">|</span>
            <span>
              HOP DEPTH: <span className="text-telecom-cyan font-bold">3</span>
            </span>
          </div>

          <div className="flex items-center bg-surface-overlay/90 backdrop-blur-sm border border-border-subtle">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:bg-border-subtle text-text-muted hover:text-text-primary border-r border-border-subtle cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:bg-border-subtle text-text-muted hover:text-text-primary border-r border-border-subtle cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFit}
              className="p-1 hover:bg-border-subtle text-text-muted hover:text-text-primary border-r border-border-subtle cursor-pointer"
              title="Fit to View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFit}
              className="p-1 hover:bg-border-subtle text-text-muted hover:text-text-primary cursor-pointer"
              title="Center Pivot Target"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= GRAPH INTERACTION VIEWPORT ================= */}
      <div
        className="flex-1 w-full h-full relative overflow-hidden cursor-crosshair transition-transform duration-300"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: "center center",
        }}
      >
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker
              id="arrow-cyan"
              markerHeight="6"
              markerWidth="6"
              orient="auto-start-reverse"
              refX="18"
              refY="5"
              viewBox="0 0 10 10"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
            </marker>
            <marker
              id="arrow-crimson"
              markerHeight="6"
              markerWidth="6"
              orient="auto-start-reverse"
              refX="18"
              refY="5"
              viewBox="0 0 10 10"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
            </marker>
            <marker
              id="arrow-amber"
              markerHeight="6"
              markerWidth="6"
              orient="auto-start-reverse"
              refX="18"
              refY="5"
              viewBox="0 0 10 10"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
            <marker
              id="arrow-violet"
              markerHeight="6"
              markerWidth="6"
              orient="auto-start-reverse"
              refX="18"
              refY="5"
              viewBox="0 0 10 10"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
            </marker>
            <filter id="threat-glow-svg" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Render Graph Edges */}
          {visibleEdges.map((edge) => {
            const fromNode = nodes.find((n) => n.id === edge.fromId);
            const toNode = nodes.find((n) => n.id === edge.toId);
            if (!fromNode || !toNode) return null;

            const fromCoords = getNodeCoords(fromNode);
            const toCoords = getNodeCoords(toNode);

            const isGlowing = edge.style === "glowing" || edge.colorType === "threat";
            const strokeColor =
              edge.colorType === "threat"
                ? "#ef4444"
                : edge.colorType === "telecom"
                ? "#06b6d4"
                : edge.colorType === "record"
                ? "#f59e0b"
                : edge.colorType === "accused"
                ? "#a855f7"
                : "#71717a";

            const markerId =
              edge.colorType === "threat"
                ? "url(#arrow-crimson)"
                : edge.colorType === "telecom"
                ? "url(#arrow-cyan)"
                : edge.colorType === "record"
                ? "url(#arrow-amber)"
                : "url(#arrow-violet)";

            const midX = (fromCoords.x + toCoords.x) / 2;
            const midY = (fromCoords.y + toCoords.y) / 2;

            return (
              <g key={edge.id}>
                <line
                  x1={`${fromCoords.x}%`}
                  y1={`${fromCoords.y}%`}
                  x2={`${toCoords.x}%`}
                  y2={`${toCoords.y}%`}
                  stroke={strokeColor}
                  strokeWidth={isGlowing ? "2.5" : "1.5"}
                  strokeDasharray={edge.style === "dashed" ? "4,3" : undefined}
                  markerEnd={markerId}
                  filter={isGlowing ? "url(#threat-glow-svg)" : undefined}
                />
                <text
                  x={`${midX}%`}
                  y={`${midY}%`}
                  fill={strokeColor}
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                  dy="-4"
                  className="bg-bg-base/80 px-1"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* HTML Node Cards Layer */}
        <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
          {visibleNodes.map((node) => {
            const coords = getNodeCoords(node);
            const isSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                style={{
                  top: `${coords.y}%`,
                  left: `${coords.x}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group transition-all duration-200"
              >
                {/* Active Selection Ring */}
                {isSelected && (
                  <div className="absolute -inset-1.5 border-2 border-threat-crimson/80 animate-pulse pointer-events-none" />
                )}

                <div
                  className={`w-52 bg-surface-card p-2.5 shadow-2xl transition-transform group-hover:scale-105 border ${
                    isSelected
                      ? "border-2 border-threat-crimson bg-surface-card"
                      : node.type === "Criminal_IP" || node.type === "BTC_Wallet"
                      ? "border-threat-crimson/70 hover:border-threat-crimson"
                      : node.type === "Person"
                      ? "border-accused-violet/70 hover:border-accused-violet"
                      : node.type === "FIR"
                      ? "border-record-amber/70 hover:border-record-amber"
                      : node.type === "PhoneNumber"
                      ? "border-emerald-500/70 hover:border-emerald-400"
                      : "border-telecom-cyan/70 hover:border-telecom-cyan"
                  }`}
                >
                  {/* Card Header Pill */}
                  <div className="flex items-center justify-between pb-1 border-b border-border-subtle mb-1.5">
                    <span
                      className={`text-[9px] px-1 font-bold uppercase tracking-wider ${
                        node.type === "Criminal_IP"
                          ? "bg-threat-crimson text-bg-base"
                          : node.type === "Person"
                          ? "bg-accused-violet/20 text-accused-violet"
                          : node.type === "FIR"
                          ? "bg-record-amber/20 text-record-amber"
                          : node.type === "PhoneNumber"
                          ? "bg-emerald-950 text-emerald-400"
                          : "bg-telecom-cyan-dim text-telecom-cyan"
                      }`}
                    >
                      {node.type}
                    </span>

                    <span className="text-[9px] font-bold text-threat-crimson flex items-center gap-1">
                      {node.threatLevel === "CRITICAL" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-threat-crimson status-pulse" />
                      )}
                      {node.cvssScore ? `CVSS ${node.cvssScore}` : node.threatLevel}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 flex items-center justify-center shrink-0 border ${
                        node.type === "Criminal_IP" || node.type === "BTC_Wallet"
                          ? "bg-threat-crimson-dim border-threat-crimson/50"
                          : node.type === "Person"
                          ? "bg-accused-violet-dim border-accused-violet/50"
                          : node.type === "FIR"
                          ? "bg-record-amber-dim border-record-amber/50"
                          : node.type === "PhoneNumber"
                          ? "bg-emerald-950 border-emerald-500/50"
                          : "bg-telecom-cyan-dim border-telecom-cyan/50"
                      }`}
                    >
                      {getNodeIcon(node.type)}
                    </div>

                    <div className="overflow-hidden leading-tight">
                      <div className="text-[11px] font-bold text-text-primary truncate font-mono">
                        {node.title}
                      </div>
                      <div className="text-[9px] text-text-muted truncate">{node.subtitle}</div>
                    </div>
                  </div>

                  {/* Footer Degree & Status */}
                  <div className="mt-2 pt-1 border-t border-border-subtle flex justify-between text-[9px] text-text-secondary">
                    <span className="truncate">{node.caseRef || "EVIDENCE_LINK"}</span>
                    <span className={isSelected ? "text-threat-crimson font-bold" : "text-text-muted"}>
                      {isSelected ? "INSPECTING →" : `Deg: ${node.degreeCount}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= RADAR MINI-MAP IN BOTTOM-LEFT ================= */}
      <div className="absolute bottom-12 left-3 z-30 w-36 h-36 bg-surface-overlay/90 backdrop-blur-sm border border-border-subtle p-1.5 flex flex-col pointer-events-auto">
        <div className="flex justify-between items-center text-[9px] text-text-muted mb-1">
          <span className="font-bold tracking-wider">CLUSTER RADAR</span>
          <span className="text-telecom-cyan">1:25000</span>
        </div>
        <div className="flex-1 w-full bg-bg-base border border-border-subtle relative overflow-hidden flex items-center justify-center">
          <div className="absolute w-28 h-28 border border-border-subtle rounded-full" />
          <div className="absolute w-16 h-16 border border-border-subtle rounded-full" />
          <div className="absolute w-6 h-6 border border-border-subtle rounded-full" />
          <div className="absolute w-full h-[1px] bg-border-subtle" />
          <div className="absolute h-full w-[1px] bg-border-subtle" />

          {/* Sweeping radar arm */}
          <div className="absolute inset-0 radar-sweep">
            <div className="w-1/2 h-[1px] bg-gradient-to-r from-transparent to-telecom-cyan ml-auto" />
          </div>

          {/* Mini Radar Blips */}
          <div className="absolute top-[44%] left-[36%] w-1.5 h-1.5 bg-accused-violet rounded-full" />
          <div className="absolute top-[26%] left-[19%] w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <div className="absolute top-[67%] left-[15%] w-1.5 h-1.5 bg-telecom-cyan rounded-full" />
          <div className="absolute top-[77%] left-[37%] w-1.5 h-1.5 bg-telecom-cyan rounded-full" />
          <div className="absolute top-[51%] left-[64%] w-2 h-2 bg-threat-crimson rounded-full animate-ping" />
          <div className="absolute top-[51%] left-[64%] w-1.5 h-1.5 bg-threat-crimson rounded-full" />
          <div className="absolute top-[21%] left-[54%] w-1.5 h-1.5 bg-record-amber rounded-full" />
          <div className="absolute top-[27%] left-[78%] w-1.5 h-1.5 bg-threat-crimson rounded-full" />
        </div>
      </div>

      {/* ================= BOTTOM TIMELINE SCRUBBER ================= */}
      <footer className="h-10 bg-surface-card border-t border-border-subtle px-3 flex items-center justify-between text-xs z-30 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTimelinePlaying(!isTimelinePlaying)}
            className="p-1 bg-surface-overlay hover:bg-border-subtle border border-border-subtle text-text-muted hover:text-text-primary cursor-pointer"
            title={isTimelinePlaying ? "Pause Playback" : "Play Timeline Event Stream"}
          >
            <Play className={`w-3.5 h-3.5 ${isTimelinePlaying ? "text-emerald-400 fill-current" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setTimelineProgress(0)}
            className="p-1 bg-surface-overlay hover:bg-border-subtle border border-border-subtle text-text-muted hover:text-text-primary cursor-pointer"
            title="Reset Timeline to 00:00 UTC"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="text-[10px] text-text-muted">
            EVIDENCE TIMEFRAME:{" "}
            <span className="text-text-primary font-bold">2024-10-24 [00:00:00 — 23:59:59 UTC]</span>
          </div>
        </div>

        {/* Interactive Timeline Bar */}
        <div className="flex-1 max-w-xl mx-4 flex items-center gap-2">
          <span className="text-[10px] text-text-muted">00:00</span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              setTimelineProgress(Math.round((clickX / rect.width) * 100));
            }}
            className="flex-1 h-2.5 bg-bg-base border border-border-subtle relative flex items-center cursor-pointer"
          >
            <div
              className="h-full bg-telecom-cyan/40 transition-all duration-150"
              style={{ width: `${timelineProgress}%` }}
            />
            {/* Event Markers on Timeline */}
            <div className="absolute left-[15%] w-1 h-3.5 bg-emerald-400" title="SIM registration 03:40 UTC" />
            <div className="absolute left-[38%] w-1 h-3.5 bg-record-amber" title="FIR lodged 09:12 UTC" />
            <div
              className="absolute left-[65%] w-2 h-4 bg-threat-crimson shadow threat-glow"
              title="Tor relay active connection [03:14:22 UTC]"
            />
            <div className="absolute left-[82%] w-1 h-3.5 bg-accused-violet" title="ATM Withdrawal 19:45 UTC" />
          </div>
          <span className="text-[10px] text-text-muted">23:59</span>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-text-muted">
            SCALE: <span className="text-text-primary font-bold">1X SPEED</span>
          </span>
          <span className="px-1.5 py-0.5 bg-border-subtle text-text-secondary border border-border-highlight">
            TIME-LOCK ON
          </span>
        </div>
      </footer>
    </main>
  );
};
