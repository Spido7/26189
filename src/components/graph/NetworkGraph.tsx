"use client";

import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import * as d3 from "d3-force";
import { StreamNode, StreamLink, DLStage } from "@/types/stream";

export interface NetworkGraphHandle {
  focusNode: (nodeId: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  resetSimulation: () => void;
}

interface NetworkGraphProps {
  nodes: StreamNode[];
  links: StreamLink[];
  selectedNodeId: string | null;
  onNodeClick: (node: StreamNode) => void;
  activeFilter?: DLStage | "ALL";
  width?: number;
  height?: number;
}

export const NetworkGraph = forwardRef<NetworkGraphHandle, NetworkGraphProps>(
  (
    {
      nodes,
      links,
      selectedNodeId,
      onNodeClick,
      width,
      height,
    },
    ref
  ) => {
    const fgRef = useRef<ForceGraphMethods<any, any> | undefined>(undefined);
    const animFrameRef = useRef<number>(0);

    // Animation ticker for active radar pulse waves
    useEffect(() => {
      let frameId: number;
      const animate = () => {
        animFrameRef.current = (animFrameRef.current + 0.05) % (Math.PI * 2);
        frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    }, []);

    // Expose focus and zoom methods
    useImperativeHandle(ref, () => ({
      focusNode: (nodeId: string) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (node && fgRef.current && typeof node.x === "number" && typeof node.y === "number") {
          fgRef.current.centerAt(node.x, node.y, 800);
          fgRef.current.zoom(2.2, 800);
        }
      },
      zoomIn: () => {
        if (fgRef.current) {
          const currentZoom = fgRef.current.zoom();
          fgRef.current.zoom(currentZoom * 1.3, 400);
        }
      },
      zoomOut: () => {
        if (fgRef.current) {
          const currentZoom = fgRef.current.zoom();
          fgRef.current.zoom(currentZoom / 1.3, 400);
        }
      },
      fitView: () => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(600, 50);
        }
      },
      resetSimulation: () => {
        if (fgRef.current) {
          fgRef.current.d3ReheatSimulation();
        }
      },
    }));

    // Configure d3 collision and link distance forces without overlapping
    useEffect(() => {
      if (fgRef.current) {
        const linkForce = fgRef.current.d3Force("link");
        if (linkForce) {
          linkForce.distance(() => 160);
          linkForce.strength(0.7);
        }

        fgRef.current.d3Force("collide", d3.forceCollide(65));

        const chargeForce = fgRef.current.d3Force("charge");
        if (chargeForce) {
          chargeForce.strength(-380);
        }

        fgRef.current.d3ReheatSimulation();
      }
    }, [nodes, links]);

    // Custom Canvas Node Rendering with persistent multi-line details in dark backing box
    const drawNode = useCallback(
      (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const isSelected = selectedNodeId === node.id;
        const x = node.x ?? 0;
        const y = node.y ?? 0;

        const isThreat = node.stage === "FLAGGED" || node.flagged;
        const isCleared = node.stage === "CLEARED";
        const isInPipeline = !isThreat && !isCleared;

        // Node Color
        let nodeColor = "#06b6d4"; // Cyan for ingesting
        if (isThreat) {
          nodeColor = "#ef4444"; // Crimson for threat
        } else if (isCleared) {
          nodeColor = "#475569";
        }

        const baseRadius = isSelected ? 8 : 6.5;

        // 1. Radar Pulse Ring for active pipeline nodes
        if (isInPipeline) {
          const pulsePhase = Math.sin(animFrameRef.current * 2) * 0.5 + 0.5;
          const pulseRadius = baseRadius + (pulsePhase * 8) / globalScale;
          const alpha = 0.8 * (1 - pulsePhase);

          ctx.beginPath();
          ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI, false);
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.lineWidth = 1.2 / globalScale;
          ctx.stroke();
        }

        // 2. Selection Indicator Ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(x, y, baseRadius + 3.5 / globalScale, 0, 2 * Math.PI, false);
          ctx.strokeStyle = isThreat ? "#ef4444" : "#38bdf8";
          ctx.lineWidth = 1.8 / globalScale;
          ctx.stroke();
        }

        // 3. Draw Standard Circular Node
        ctx.beginPath();
        ctx.arc(x, y, baseRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = nodeColor;
        ctx.fill();

        // 1px Crisp Border
        ctx.strokeStyle = isSelected ? "#ffffff" : isThreat ? "#7f1d1d" : "#09090b";
        ctx.lineWidth = 1.2 / globalScale;
        ctx.stroke();

        // 4. ALWAYS-VISIBLE MULTI-LINE NODE DETAILS
        // Multi-line text block explicitly displaying:
        // - NAME
        // - IP
        // - ISP/DHCP
        // - LOCATION
        const fontSize = Math.max(8.0 / globalScale, 2.0);
        const lineHeight = fontSize * 1.32;
        ctx.font = `600 ${fontSize}px 'JetBrains Mono', 'Geist Mono', monospace`;

        const nodeName = node.name || node.accusedName || (isThreat ? "SUSPECT // TARGET" : "SYSTEM HOST");
        const nodeIp = node.ip || node.id || "0.0.0.0";
        const nodeIsp = node.ispDhcp || node.asnOrg || "DHCP / Dynamic Lease";
        const nodeLoc = node.location || node.country || node.geoCoords || "Bengaluru, India";

        const lines = [
          { prefix: "NAME: ", val: nodeName, valColor: isThreat ? "#fca5a5" : "#ffffff" },
          { prefix: "IP:   ", val: nodeIp, valColor: "#38bdf8" },
          { prefix: "ISP:  ", val: nodeIsp, valColor: "#a1a1aa" },
          { prefix: "LOC:  ", val: nodeLoc, valColor: "#fbbf24" },
        ];

        let maxTextWidth = 0;
        lines.forEach((l) => {
          const w = ctx.measureText(`${l.prefix}${l.val}`).width;
          if (w > maxTextWidth) maxTextWidth = w;
        });

        const padX = 5 / globalScale;
        const padY = 4 / globalScale;
        const boxWidth = maxTextWidth + padX * 2;
        const boxHeight = lineHeight * 4 + padY * 2;
        const boxX = x - boxWidth / 2;
        const boxY = y + baseRadius + 4 / globalScale;

        // Semi-transparent dark backing box
        ctx.fillStyle = "rgba(9, 9, 11, 0.92)";
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Backing box border
        ctx.strokeStyle = isSelected
          ? isThreat
            ? "rgba(239, 68, 68, 0.95)"
            : "rgba(6, 182, 212, 0.95)"
          : isThreat
          ? "rgba(127, 29, 29, 0.85)"
          : "rgba(39, 39, 42, 0.9)";
        ctx.lineWidth = 1 / globalScale;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Render each multi-line metric
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        lines.forEach((l, idx) => {
          const currentY = boxY + padY + idx * lineHeight;
          const startX = boxX + padX;

          ctx.fillStyle = "#71717a";
          ctx.fillText(l.prefix, startX, currentY);

          const prefixWidth = ctx.measureText(l.prefix).width;
          ctx.fillStyle = l.valColor;
          ctx.fillText(l.val, startX + prefixWidth, currentY);
        });
      },
      [selectedNodeId]
    );

    // Custom Canvas Link Rendering: Clean 1px line + Named Relationship Label
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

        const x1 = source.x;
        const y1 = source.y;
        const x2 = target.x;
        const y2 = target.y;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) return;

        // 1. Line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "rgba(71, 85, 105, 0.55)";
        ctx.lineWidth = 1.2 / globalScale;
        ctx.stroke();

        // 2. Named Relationship Label
        const rawLabel = link.relationship || link.label || "CONNECTED";
        const labelText =
          rawLabel === "SHARED_MAC_HARDWARE"
            ? "SHARED_MAC"
            : rawLabel === "SHARED_SUBNET_CIDR"
            ? "CO_SUBNET"
            : rawLabel;

        const labelFontSize = Math.max(7.5 / globalScale, 2.0);
        ctx.font = `700 ${labelFontSize}px 'JetBrains Mono', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const textWidth = ctx.measureText(labelText).width;
        const pillPadX = 4 / globalScale;
        const pillPadY = 2 / globalScale;
        const pillWidth = textWidth + pillPadX * 2;
        const pillHeight = labelFontSize + pillPadY * 2;

        ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
        ctx.fillRect(midX - pillWidth / 2, midY - pillHeight / 2, pillWidth, pillHeight);

        ctx.strokeStyle = "rgba(100, 116, 139, 0.75)";
        ctx.lineWidth = 0.8 / globalScale;
        ctx.strokeRect(midX - pillWidth / 2, midY - pillHeight / 2, pillWidth, pillHeight);

        ctx.fillStyle = "#93c5fd";
        ctx.fillText(labelText, midX, midY);
      },
      []
    );

    return (
      <div className="w-full h-full relative overflow-hidden bg-bg-base bg-tech-grid select-none">
        <ForceGraph2D
          ref={fgRef}
          width={width}
          height={height}
          graphData={{ nodes, links }}
          nodeId="id"
          nodeCanvasObject={drawNode}
          nodeCanvasObjectMode={() => "replace"}
          linkCanvasObject={drawLink}
          linkCanvasObjectMode={() => "replace"}
          onNodeClick={(node) => onNodeClick(node as StreamNode)}
          backgroundColor="#09090b"
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          cooldownTicks={120}
          d3VelocityDecay={0.65}
          warmupTicks={60}
          nodePointerAreaPaint={(node: any, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 22, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
        />
      </div>
    );
  }
);

NetworkGraph.displayName = "NetworkGraph";
