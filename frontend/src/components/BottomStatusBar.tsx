"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Database,
  Cpu,
  Lock,
  RefreshCw,
  FolderOpen,
  Wifi,
  ShieldCheck,
} from "lucide-react";
import { CURRENT_INVESTIGATOR } from "@/data/dfir-mock-database";

interface BottomStatusBarProps {
  activeCaseId?: string;
  isLive?: boolean;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  activeCaseId = "FIR-2024-8842",
  isLive = false,
}) => {
  const [lastSyncSeconds, setLastSyncSeconds] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSeconds((prev) => (prev >= 60 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="w-full h-7 border-t border-border-subtle bg-surface-card px-4 flex items-center justify-between text-xs font-sans select-none text-text-muted shrink-0 z-40">
      {/* Left: Core Connections */}
      <div className="flex items-center gap-4 overflow-hidden text-[11px]">
        {/* System Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse" />
          <span className="font-medium text-text-primary">System Operational</span>
        </div>

        <span className="text-border-subtle">|</span>

        {/* Backend Connection */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Wifi className="w-3.5 h-3.5 text-telecom-cyan" />
          <span>FastAPI:</span>
          <span className="text-text-primary font-medium">
            {isLive ? "Connected (:8000)" : "Local Adapter"}
          </span>
        </div>

        <span className="text-border-subtle hidden sm:inline">|</span>

        {/* Graph Connection */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <Database className="w-3.5 h-3.5 text-purple-400" />
          <span>Neo4j:</span>
          <span className="text-purple-300 font-medium">Online (42.8k nodes)</span>
        </div>

        <span className="text-border-subtle hidden md:inline">|</span>

        {/* AI Engine Status */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>DL Model:</span>
          <span className="text-emerald-400 font-medium">Stage 1-3 (GPU-0)</span>
        </div>
      </div>

      {/* Right: Active Case, Security, Demo Mode Indicator */}
      <div className="flex items-center gap-3.5 shrink-0 text-[11px]">
        {/* Synchronization Timer */}
        <div className="hidden lg:flex items-center gap-1.5 text-text-muted">
          <RefreshCw className="w-3 h-3" />
          <span>Synced {lastSyncSeconds}s ago</span>
        </div>

        <span className="text-border-subtle hidden lg:inline">|</span>

        {/* Current Case */}
        <div className="flex items-center gap-1.5 text-text-secondary">
          <FolderOpen className="w-3.5 h-3.5 text-record-amber" />
          <span>Case:</span>
          <span className="font-mono font-medium text-record-amber">{activeCaseId}</span>
        </div>

        <span className="text-border-subtle">|</span>

        {/* Environment Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${
            isLive
              ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-400"
              : "bg-amber-950/60 border border-amber-500/40 text-amber-400"
          }`}
          title={isLive ? "Live Law Enforcement Connection Active" : "Simulated Offline Forensic Demo Mode Active"}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLive ? "bg-emerald-400 status-pulse" : "bg-amber-400"
            }`}
          />
          <span>{isLive ? "Live Mode" : "Demo Mode"}</span>
        </div>
      </div>
    </footer>
  );
};
