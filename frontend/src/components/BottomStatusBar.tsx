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
    <footer className="w-full h-7 border-t border-slate-700/40 bg-[#0b0d11] px-4 flex items-center justify-between text-[10px] font-mono select-none text-slate-400 shrink-0 z-40">
      {/* Left: System Status */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 bg-emerald-400 status-pulse" />
          <span className="text-emerald-300 font-bold tracking-wider">ONLINE // CALIBRATED</span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-slate-500">ENGINE:</span>
          <span className="text-slate-300 font-bold">FASTAPI:8000</span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-slate-500">NEO4J:</span>
          <span className="text-sky-300 font-bold">42,890 NODES</span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-slate-500">PIPELINE:</span>
          <span className="text-amber-400 font-bold">TENSORRT-v3.4</span>
        </div>
      </div>

      {/* Right: Last Sync, Active Case */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-1 text-slate-400">
          <span className="text-slate-500">CLOCK:</span>
          <span className="font-mono text-amber-300/90">{lastSyncSeconds}s LATENCY</span>
        </div>

        <span className="text-slate-700 hidden md:inline">|</span>

        <div className="flex items-center gap-1">
          <span className="text-slate-500">DOSSIER:</span>
          <span className="text-amber-300 font-bold px-1 bg-amber-500/10 border border-amber-500/20">{activeCaseId}</span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center gap-1 px-1.5 py-0.2 rounded-none text-[9px] bg-[#161b22] text-slate-300 border border-slate-700/60 font-bold">
          <span>MIL-STD-810H</span>
        </div>
      </div>
    </footer>
  );
};
