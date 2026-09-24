"use client";

import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import dynamic from "next/dynamic";
import { InvestigationNode, InvestigationEdge } from "@/lib/graph-engine";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  RefreshCw,
  Compass,
  Pin,
  EyeOff,
  GitFork,
  FileSearch,
  Radio,
  Share2,
} from "lucide-react";
import * as d3 from "d3-force";

// Dynamic import with SSR disabled
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export interface GraphCanvasHandle {
  focusNode: (nodeId: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  reheat: () => void;
}

interface InvestigationGraphCanvasProps {
  nodes: InvestigationNode[];
  edges: InvestigationEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  highlightedNodeIds?: Set<string>;
  highlightedEdgeIds?: Set<string>;
  onSelectNode: (node: InvestigationNode | null) => void;
  onSelectEdge: (edge: InvestigationEdge | null) => void;
  onExpandNodeHops?: (nodeId: string, hops: number) => void;
  onTogglePinNode?: (nodeId: string) => void;
  onHideNode?: (nodeId: string) => void;
  onStartPathfinding?: (nodeId: string) => void;
  isPathfindingActive?: boolean;
}

export const InvestigationGraphCanvas = forwardRef<GraphCanvasHandle, InvestigationGraphCanvasProps>(
  (
    {
      nodes,
      edges,
      selectedNodeId,
      selectedEdgeId,
      highlightedNodeIds = new Set(),
      highlightedEdgeIds = new Set(),
      onSelectNode,
      onSelectEdge,
      onExpandNodeHops,
      onTogglePinNode,
      onHideNode,
      onStartPathfinding,
      isPathfindingActive = false,
    },
    ref
  ) => {
    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [isMounted, setIsMounted] = useState(false);
    const [contextMenu, setContextMenu] = useState<{
      x: number;
      y: number;
      node: InvestigationNode;
    } | null>(null);

    // Animation ticker for threat pulse waves
    const animFrameRef = useRef<number>(0);
    useEffect(() => {
      let frameId: number;
      const animate = () => {
        animFrameRef.current = (animFrameRef.current + 0.05) % (Math.PI * 2);
        frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    }, []);

    // Resize listener
    useEffect(() => {
      setIsMounted(true);
      const updateDim = () => {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.clientWidth || window.innerWidth,
            height: containerRef.current.clientHeight || window.innerHeight,
          });
        }
      };
      updateDim();
      window.addEventListener("resize", updateDim);
      return () => window.removeEventListener("resize", updateDim);
    }, []);

    // Close context menu on global click
    useEffect(() => {
      const handleGlobalClick = () => setContextMenu(null);
      window.addEventListener("click", handleGlobalClick);
      return () => window.removeEventListener("click", handleGlobalClick);
    }, []);

    // Expose imperative handle methods
    useImperativeHandle(ref, () => ({
      focusNode: (nodeId: string) => {
        const target = nodes.find((n) => n.id === nodeId);
        if (target && fgRef.current && typeof target.x === "number" && typeof target.y === "number") {
          fgRef.current.centerAt(target.x, target.y, 800);
          fgRef.current.zoom(2.2, 800);
        }
      },
      zoomIn: () => {
        if (fgRef.current) {
          fgRef.current.zoom(fgRef.current.zoom() * 1.3, 400);
        }
      },
      zoomOut: () => {
        if (fgRef.current) {
          fgRef.current.zoom(fgRef.current.zoom() / 1.3, 400);
        }
      },
      fitView: () => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(600, 60);
        }
      },
      reheat: () => {
        if (fgRef.current) {
          fgRef.current.d3ReheatSimulation();
        }
      },
    }));

    // Configure simulation forces
    useEffect(() => {
      if (fgRef.current) {
        const linkForce = fgRef.current.d3Force("link");
        if (linkForce) {
          linkForce.distance(() => 150);
          linkForce.strength(0.65);
        }
        fgRef.current.d3Force("collide", d3.forceCollide(55));
        const chargeForce = fgRef.current.d3Force("charge");
        if (chargeForce) {
          chargeForce.strength(-420);
        }
      }
    }, [nodes, edges]);

    // Node Canvas Object Renderer
    const drawNode = useCallback(
      (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const isSelected = selectedNodeId === node.id;
        const isHighlighted = highlightedNodeIds.has(node.id);
        const hasActiveFocus = selectedNodeId !== null || highlightedNodeIds.size > 0;
        const isDimmed = hasActiveFocus && !isSelected && !isHighlighted;

        const baseRadius = isSelected ? 9 : 7;

        // Color coding by category & threat
        let borderCol = "#38bdf8"; // telecom cyan default
        let fillCol = "#13171e"; // dark card base

        switch (node.category) {
          case "PERSON":
            borderCol = node.isFlagged ? "#ef4444" : "#c084fc";
            fillCol = node.isFlagged ? "#2e1214" : "#241334";
            break;
          case "PHONE":
            borderCol = "#10b981";
            fillCol = "#0c281d";
            break;
          case "IP":
            borderCol = node.isFlagged ? "#ef4444" : "#38bdf8";
            fillCol = node.isFlagged ? "#2e1214" : "#0c2838";
            break;
          case "DEVICE":
            borderCol = "#64748b";
            fillCol = "#1c222c";
            break;
          case "FIR":
            borderCol = "#f59e0b";
            fillCol = "#382306";
            break;
          case "LOCATION":
            borderCol = "#ec4899";
            fillCol = "#2d1124";
            break;
          case "EVIDENCE":
            borderCol = "#eab308";
            fillCol = "#2b2308";
            break;
        }

        ctx.save();

        if (isDimmed) {
          ctx.globalAlpha = 0.18;
        }

        // 1. Pulsing Threat Halo for high-risk nodes
        if (node.isFlagged && !isDimmed) {
          const pulsePhase = Math.sin(animFrameRef.current * 2) * 0.5 + 0.5;
          const pulseRadius = baseRadius + (pulsePhase * 9) / globalScale;
          const alpha = 0.85 * (1 - pulsePhase);

          ctx.beginPath();
          ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
          ctx.lineWidth = 1.4 / globalScale;
          ctx.setLineDash([4 / globalScale, 3 / globalScale]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 2. Selection / Highlight Ring
        if (isSelected || isHighlighted) {
          ctx.beginPath();
          ctx.arc(x, y, baseRadius + 4.5 / globalScale, 0, 2 * Math.PI);
          ctx.strokeStyle = isHighlighted ? "#10b981" : borderCol;
          ctx.lineWidth = 2.2 / globalScale;
          ctx.stroke();
        }

        // 3. Node Main Body Circle
        ctx.beginPath();
        ctx.arc(x, y, baseRadius, 0, 2 * Math.PI);
        ctx.fillStyle = fillCol;
        ctx.fill();
        ctx.strokeStyle = isSelected ? "#ffffff" : borderCol;
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();

        // 4. Center Glyph / Tactical Symbol
        const iconChar =
          node.category === "PERSON"
            ? "P"
            : node.category === "PHONE"
            ? "T"
            : node.category === "IP"
            ? "IP"
            : node.category === "DEVICE"
            ? "M"
            : node.category === "FIR"
            ? "§"
            : node.category === "LOCATION"
            ? "L"
            : "E";

        const iconFontSize = Math.max(6.5 / globalScale, 1.8);
        ctx.font = `800 ${iconFontSize}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = isSelected ? "#ffffff" : borderCol;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(iconChar, x, y);

        // 5. Pin Indicator Glyph
        if (node.pinned && !isDimmed) {
          const pinX = x + baseRadius * 0.75;
          const pinY = y - baseRadius * 0.75;
          ctx.beginPath();
          ctx.arc(pinX, pinY, 2.5 / globalScale, 0, 2 * Math.PI);
          ctx.fillStyle = "#f59e0b";
          ctx.fill();
        }

        // 6. Multi-Line High-Density Information Box Below Node
        const fontSize = Math.max(7.2 / globalScale, 2.0);
        const lineHeight = fontSize * 1.3;
        ctx.font = `600 ${fontSize}px 'JetBrains Mono', monospace`;

        const nameLine = node.name.length > 20 ? `${node.name.slice(0, 18)}...` : node.name;
        const subLine = node.details.length > 22 ? `${node.details.slice(0, 20)}...` : node.details;
        const riskLine = `${node.riskScore}% RISK`;

        const w1 = ctx.measureText(nameLine).width;
        const w2 = ctx.measureText(subLine).width;
        const w3 = ctx.measureText(riskLine).width;
        const boxWidth = Math.max(w1, w2, w3) + 8 / globalScale;
        const boxHeight = lineHeight * 3 + 6 / globalScale;
        const boxX = x - boxWidth / 2;
        const boxY = y + baseRadius + 3.5 / globalScale;

        // Semi-transparent backing panel
        ctx.fillStyle = "rgba(12, 14, 18, 0.94)";
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeStyle = isSelected
          ? borderCol
          : isHighlighted
          ? "#10b981"
          : "rgba(100, 116, 139, 0.4)";
        ctx.lineWidth = 0.8 / globalScale;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Render each line
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Line 1: Primary Name
        ctx.fillStyle = isSelected ? "#ffffff" : "#f1f5f9";
        ctx.fillText(nameLine, x, boxY + 2.5 / globalScale);

        // Line 2: Details / Subtitle
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(subLine, x, boxY + 2.5 / globalScale + lineHeight);

        // Line 3: Risk Score
        ctx.fillStyle = node.riskScore > 85 ? "#fca5a5" : "#38bdf8";
        ctx.fillText(riskLine, x, boxY + 2.5 / globalScale + lineHeight * 2);

        ctx.restore();
      },
      [selectedNodeId, highlightedNodeIds]
    );

    // Link Canvas Object Renderer
    const drawLink = useCallback(
      (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const source = link.source;
        const target = link.target;

        if (
          !source ||
          !target ||
          typeof source.x !== "number" ||
          typeof source.y !== "number" ||
          typeof target.x !== "number" ||
          typeof target.y !== "number"
        ) {
          return;
        }

        const isSelected = selectedEdgeId === link.id;
        const isHighlighted = highlightedEdgeIds.has(link.id);
        const hasActiveFocus = selectedEdgeId !== null || highlightedEdgeIds.size > 0;
        const isDimmed = hasActiveFocus && !isSelected && !isHighlighted;

        const x1 = source.x;
        const y1 = source.y;
        const x2 = target.x;
        const y2 = target.y;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) return;

        ctx.save();

        if (isDimmed) {
          ctx.globalAlpha = 0.12;
        }

        // Draw Line with Direction
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        if (isHighlighted) {
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 3.2 / globalScale;
        } else if (isSelected) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2.5 / globalScale;
        } else {
          ctx.strokeStyle =
            link.type === "ROUTED_TRAFFIC"
              ? "rgba(239, 68, 68, 0.55)"
              : "rgba(100, 116, 139, 0.5)";
          ctx.lineWidth = 1.2 / globalScale;
        }

        if (link.provenance === "AI_INFERENCE" || link.type === "APPEARS_IN") {
          ctx.setLineDash([4 / globalScale, 3 / globalScale]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.stroke();

        // Directional Arrowhead
        const arrowDist = 20 / globalScale;
        const angle = Math.atan2(dy, dx);
        const arrowX = x2 - Math.cos(angle) * (14 / globalScale);
        const arrowY = y2 - Math.sin(angle) * (14 / globalScale);

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowDist * Math.cos(angle - Math.PI / 7),
          arrowY - arrowDist * Math.sin(angle - Math.PI / 7)
        );
        ctx.lineTo(
          arrowX - arrowDist * Math.cos(angle + Math.PI / 7),
          arrowY - arrowDist * Math.sin(angle + Math.PI / 7)
        );
        ctx.closePath();
        ctx.fillStyle = isHighlighted ? "#10b981" : isSelected ? "#38bdf8" : "#64748b";
        ctx.fill();

        // Centered Pill with Relationship Label & Confidence
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const labelText = `${link.label || link.type} (${link.confidence}%)`;
        const labelFontSize = Math.max(6.8 / globalScale, 1.8);
        ctx.font = `700 ${labelFontSize}px 'JetBrains Mono', monospace`;
        const textWidth = ctx.measureText(labelText).width;
        const pillWidth = textWidth + 6 / globalScale;
        const pillHeight = labelFontSize + 4 / globalScale;

        ctx.fillStyle = "rgba(19, 23, 30, 0.95)";
        ctx.fillRect(midX - pillWidth / 2, midY - pillHeight / 2, pillWidth, pillHeight);
        ctx.strokeStyle = isHighlighted
          ? "#10b981"
          : isSelected
          ? "#38bdf8"
          : "rgba(100, 116, 139, 0.5)";
        ctx.lineWidth = 0.8 / globalScale;
        ctx.strokeRect(midX - pillWidth / 2, midY - pillHeight / 2, pillWidth, pillHeight);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isHighlighted ? "#a7f3d0" : isSelected ? "#bae6fd" : "#94a3b8";
        ctx.fillText(labelText, midX, midY);

        ctx.restore();
      },
      [selectedEdgeId, highlightedEdgeIds]
    );

    // Double-click handler for 1-hop expansion
    const handleNodeDoubleClick = (node: any) => {
      if (onExpandNodeHops) {
        onExpandNodeHops(node.id, 1);
      }
    };

    // Right-click context menu
    const handleNodeRightClick = (node: any, event: MouseEvent) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        node,
      });
    };

    return (
      <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#0c0e12] select-none font-mono">
        {/* Floating Top-Right Canvas Toolbar */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-[#13171e]/90 backdrop-blur-md p-1 border border-slate-700/50 rounded-sm shadow-xl">
          <button
            type="button"
            onClick={() => ref && (ref as any).current?.zoomIn()}
            className="p-1 hover:bg-[#1a202a] text-slate-400 hover:text-slate-100 rounded-xs border border-slate-700/40 cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => ref && (ref as any).current?.zoomOut()}
            className="p-1 hover:bg-[#1a202a] text-slate-400 hover:text-slate-100 rounded-xs border border-slate-700/40 cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => ref && (ref as any).current?.fitView()}
            className="p-1 hover:bg-[#1a202a] text-slate-400 hover:text-slate-100 rounded-xs border border-slate-700/40 cursor-pointer"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedNodeId) {
                (ref as any).current?.focusNode(selectedNodeId);
              } else {
                (ref as any).current?.fitView();
              }
            }}
            className="p-1 hover:bg-[#1a202a] text-slate-400 hover:text-slate-100 rounded-xs border border-slate-700/40 cursor-pointer"
            title="Center Focused Entity"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => ref && (ref as any).current?.reheat()}
            className="p-1 hover:bg-[#1a202a] text-slate-400 hover:text-slate-100 rounded-xs border border-slate-700/40 cursor-pointer"
            title="Reheat Simulation Physics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Force Graph Canvas */}
        {isMounted && (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={{ nodes: nodes as any[], links: edges as any[] }}
            nodeId="id"
            nodeCanvasObject={drawNode}
            nodeCanvasObjectMode={() => "replace"}
            linkCanvasObject={drawLink}
            linkCanvasObjectMode={() => "replace"}
            onNodeClick={(node) => onSelectNode(node as InvestigationNode)}
            onLinkClick={(link) => onSelectEdge(link as InvestigationEdge)}
            onBackgroundClick={() => {
              onSelectNode(null);
              onSelectEdge(null);
              setContextMenu(null);
            }}
            onNodeRightClick={handleNodeRightClick}
            onNodeDragEnd={(node) => {
              node.fx = node.x;
              node.fy = node.y;
              node.pinned = true;
            }}
            backgroundColor="#0c0e12"
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            cooldownTicks={120}
            d3VelocityDecay={0.65}
            warmupTicks={50}
            nodePointerAreaPaint={(node: any, color, ctx) => {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, 22, 0, 2 * Math.PI);
              ctx.fill();
            }}
          />
        )}

        {/* Tactical Radar Mini-Map in Bottom-Left */}
        <div className="absolute bottom-3 left-3 z-30 w-36 h-36 bg-[#13171e]/90 backdrop-blur-md border border-slate-700/60 p-1.5 flex flex-col pointer-events-auto shadow-2xl">
          <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1">
            <span className="font-bold tracking-wider flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-amber-400" />
              RADAR MINI-MAP
            </span>
            <span className="text-telecom-cyan font-bold">{nodes.length} N</span>
          </div>
          <div className="flex-1 w-full bg-[#0c0e12] border border-slate-800 relative overflow-hidden flex items-center justify-center">
            <div className="absolute w-28 h-28 border border-slate-800/80 rounded-full" />
            <div className="absolute w-16 h-16 border border-slate-800/80 rounded-full" />
            <div className="absolute w-6 h-6 border border-slate-800/80 rounded-full" />
            <div className="absolute w-full h-[1px] bg-slate-800/80" />
            <div className="absolute h-full w-[1px] bg-slate-800/80" />

            {/* Sweeping Radar Arm */}
            <div className="absolute inset-0 radar-sweep">
              <div className="w-1/2 h-[1px] bg-gradient-to-r from-transparent to-amber-400 ml-auto" />
            </div>

            {/* Node Scatter Blips */}
            {nodes.slice(0, 16).map((n, i) => (
              <div
                key={n.id}
                style={{
                  top: `${45 + Math.sin(i * 1.3) * 35}%`,
                  left: `${50 + Math.cos(i * 1.3) * 38}%`,
                }}
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  n.isFlagged ? "bg-red-400 animate-ping" : "bg-sky-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right-Click Context Menu Overlay */}
        {contextMenu && (
          <div
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-50 w-56 bg-[#13171e] border border-amber-500/40 rounded-sm shadow-2xl p-1 text-[11px] font-mono space-y-0.5 text-slate-200"
          >
            <div className="px-2 py-1 text-[9px] text-amber-400 font-bold uppercase border-b border-slate-700/50 flex justify-between items-center">
              <span className="truncate">{contextMenu.node.name}</span>
              <span className="text-slate-400">[{contextMenu.node.category}]</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onTogglePinNode?.(contextMenu.node.id);
                setContextMenu(null);
              }}
              className="w-full text-left px-2 py-1 hover:bg-[#1c2432] hover:text-amber-300 flex items-center gap-2 cursor-pointer"
            >
              <Pin className="w-3 h-3 text-amber-400" />
              <span>{contextMenu.node.pinned ? "Unpin Node" : "Pin Node Position"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onStartPathfinding?.(contextMenu.node.id);
                setContextMenu(null);
              }}
              className="w-full text-left px-2 py-1 hover:bg-[#1c2432] hover:text-emerald-300 flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3 h-3 text-emerald-400" />
              <span>Find Shortest Path From Here</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onExpandNodeHops?.(contextMenu.node.id, 1);
                setContextMenu(null);
              }}
              className="w-full text-left px-2 py-1 hover:bg-[#1c2432] hover:text-sky-300 flex items-center gap-2 cursor-pointer"
            >
              <GitFork className="w-3 h-3 text-sky-400" />
              <span>Expand 1-Hop Neighbors</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onExpandNodeHops?.(contextMenu.node.id, 2);
                setContextMenu(null);
              }}
              className="w-full text-left px-2 py-1 hover:bg-[#1c2432] hover:text-sky-300 flex items-center gap-2 cursor-pointer"
            >
              <GitFork className="w-3 h-3 text-sky-400" />
              <span>Expand 2-Hop Subgraph</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onHideNode?.(contextMenu.node.id);
                setContextMenu(null);
              }}
              className="w-full text-left px-2 py-1 hover:bg-[#1c2432] hover:text-red-300 flex items-center gap-2 cursor-pointer text-red-400"
            >
              <EyeOff className="w-3 h-3" />
              <span>Hide Node from Canvas</span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

InvestigationGraphCanvas.displayName = "InvestigationGraphCanvas";
