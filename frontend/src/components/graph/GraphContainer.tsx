"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import dynamic from "next/dynamic";
import { StreamNode, StreamLink, DLStage } from "@/types/stream";
import { NetworkGraphHandle } from "./NetworkGraph";
import { Loader2, Plus, Minus, Maximize2, Crosshair, RefreshCw } from "lucide-react";

// Dynamic import with ssr: false
const DynamicNetworkGraph = dynamic(
  () => import("./NetworkGraph").then((mod) => mod.NetworkGraph),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-bg-base bg-tech-grid text-text-muted font-mono text-xs gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-telecom-cyan" />
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-telecom-cyan status-pulse" />
          <span className="text-text-primary tracking-wider uppercase">
            CONNECTING SEQUENTIAL LOG STREAM TO GRAPH ENGINE...
          </span>
        </div>
      </div>
    ),
  }
);

interface GraphContainerProps {
  nodes: StreamNode[];
  links: StreamLink[];
  selectedNodeId: string | null;
  onNodeClick: (node: StreamNode) => void;
  activeFilter?: DLStage | "ALL";
}

export const GraphContainer = forwardRef<NetworkGraphHandle, GraphContainerProps>(
  (
    {
      nodes,
      links,
      selectedNodeId,
      onNodeClick,
      activeFilter = "ALL",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphHandleRef = useRef<NetworkGraphHandle | null>(null);
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
      width: 800,
      height: 600,
    });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
      const updateDimensions = () => {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.clientWidth || window.innerWidth,
            height: containerRef.current.clientHeight || window.innerHeight,
          });
        }
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useImperativeHandle(ref, () => ({
      focusNode: (nodeId: string) => {
        graphHandleRef.current?.focusNode(nodeId);
      },
      zoomIn: () => {
        graphHandleRef.current?.zoomIn();
      },
      zoomOut: () => {
        graphHandleRef.current?.zoomOut();
      },
      fitView: () => {
        graphHandleRef.current?.fitView();
      },
      resetSimulation: () => {
        graphHandleRef.current?.resetSimulation();
      },
    }));

    return (
      <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-bg-base">
        {/* Floating Canvas Controls */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2 pointer-events-auto select-none font-mono">
          <div className="flex items-center bg-surface-overlay/90 backdrop-blur-sm border border-border-subtle text-[11px] px-2.5 py-1 text-text-muted">
            <span>
              INGESTED: <span className="text-text-primary font-bold">{nodes.length}</span>
            </span>
            <span className="mx-2 text-border-subtle">|</span>
            <span>
              RELATIONS: <span className="text-text-primary font-bold">{links.length}</span>
            </span>
            <span className="mx-2 text-border-subtle">|</span>
            <span>
              DL RADAR: <span className="text-telecom-cyan font-bold">ONLINE</span>
            </span>
          </div>

          <div className="flex items-center bg-surface-overlay/90 backdrop-blur-sm border border-border-subtle">
            <button
              type="button"
              onClick={() => graphHandleRef.current?.zoomIn()}
              className="p-1.5 hover:bg-border-subtle text-text-muted hover:text-text-primary border-r border-border-subtle cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => graphHandleRef.current?.zoomOut()}
              className="p-1.5 hover:bg-border-subtle text-text-muted hover:text-text-primary border-r border-border-subtle cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => graphHandleRef.current?.fitView()}
              className="p-1.5 hover:bg-border-subtle text-text-muted hover:text-text-primary border-r border-border-subtle cursor-pointer"
              title="Fit Graph to View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedNodeId) {
                  graphHandleRef.current?.focusNode(selectedNodeId);
                } else {
                  graphHandleRef.current?.fitView();
                }
              }}
              className="p-1.5 hover:bg-border-subtle text-text-muted hover:text-text-primary border-r border-border-subtle cursor-pointer"
              title="Focus Selected Node"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => graphHandleRef.current?.resetSimulation()}
              className="p-1.5 hover:bg-border-subtle text-text-muted hover:text-text-primary cursor-pointer"
              title="Reheat Force Simulation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Force Graph */}
        {isMounted && (
          <DynamicNetworkGraph
            ref={graphHandleRef}
            nodes={nodes}
            links={links}
            selectedNodeId={selectedNodeId}
            onNodeClick={onNodeClick}
            activeFilter={activeFilter}
            width={dimensions.width}
            height={dimensions.height}
          />
        )}
      </div>
    );
  }
);

GraphContainer.displayName = "GraphContainer";
