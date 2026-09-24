"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Activity,
  Bell,
  ChevronDown,
  Shield,
  FolderOpen,
  UserCheck,
  AlertTriangle,
  Radio,
  Server,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { CURRENT_INVESTIGATOR, MOCK_CASES } from "@/data/dfir-mock-database";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TopCommandBarProps {
  activeCaseId?: string;
  onCaseChange?: (caseId: string) => void;
  onSearch?: (query: string) => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  activeCaseId = "FIR-2024-8842",
  onCaseChange,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const caseMenuRef = useRef<HTMLDivElement>(null);
  const diagMenuRef = useRef<HTMLDivElement>(null);
  const alertMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (caseMenuRef.current && !caseMenuRef.current.contains(e.target as Node)) {
        setShowCaseDropdown(false);
      }
      if (diagMenuRef.current && !diagMenuRef.current.contains(e.target as Node)) {
        setShowDiagnostics(false);
      }
      if (alertMenuRef.current && !alertMenuRef.current.contains(e.target as Node)) {
        setShowAlertsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/ip-intelligence?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const activeCase = MOCK_CASES.find((c) => c.id === activeCaseId) || MOCK_CASES[0];

  return (
    <header className="flex justify-between items-center w-full px-4 h-11 border-b border-slate-700/40 bg-[#0f1217]/95 backdrop-blur-md text-xs font-mono shrink-0 z-50 select-none">
      {/* LEFT: BRAND & HEALTH PILL */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 pr-3 border-r border-slate-700/40 hover:opacity-85 transition-opacity"
        >
          <div className="w-2 h-2 bg-amber-400 status-pulse shrink-0 rounded-none transform rotate-45" />
          <span className="font-bold text-slate-100 tracking-wider text-xs flex items-center gap-1.5 uppercase">
            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-[10px]">
              DFIR
            </span>
            <span className="text-slate-500">//</span>
            <span className="text-slate-300 font-semibold tracking-widest">COMMAND-04</span>
          </span>
        </Link>

        {/* Industrial Diagnostics Popover Trigger */}
        <div className="relative" ref={diagMenuRef}>
          <button
            type="button"
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#161b22] hover:bg-[#1c232d] rounded-sm border border-slate-700/60 text-[11px] text-slate-300 hover:text-slate-100 transition-colors cursor-pointer"
            title="Industrial System Telemetry"
          >
            <span className="w-1.5 h-1.5 bg-emerald-400" />
            <span className="text-emerald-300 font-bold tracking-wider">ONLINE</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400/90 font-mono">4.1ms</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showDiagnostics && (
            <div className="absolute top-8 left-0 w-72 bg-[#13171e] border border-amber-500/30 rounded-sm p-3 shadow-2xl z-50 space-y-2 text-[10px] machined-panel">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-700/40 font-bold text-slate-200">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Activity className="w-3.5 h-3.5" />
                  SYSTEM TELEMETRY [SPEC-810H]
                </span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[9px]">
                  CALIBRATED
                </span>
              </div>
              <div className="space-y-1.5 text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">FASTAPI CORE ENGINE:</span>
                  <span className="text-slate-200 font-bold">READY (PORT 8000)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NEO4J BOLT GRAPH:</span>
                  <span className="text-sky-300 font-bold">SYNCED (42.8k)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AI 3-STAGE PIPELINE:</span>
                  <span className="text-amber-300 font-bold">TENSORRT ACCELERATED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">EVIDENCE LEDGER:</span>
                  <span className="text-emerald-400 font-bold">SHA-256 VALID</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CENTER: INDUSTRIAL SEARCH BAR */}
      <div className="flex-1 max-w-md mx-4">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 bg-[#141820] px-3 py-1 rounded-sm border border-slate-700/50 hover:border-amber-500/40 focus-within:border-amber-400 transition-colors w-full"
        >
          <Search className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            placeholder="[QUERY: IP, Suspect, MAC, CrPC Section, FIR Hash...]"
            className="bg-transparent border-none outline-none text-slate-200 font-mono text-[11px] placeholder-slate-500 w-full p-0 focus:ring-0"
          />
          <div className="flex items-center text-[9px] text-amber-400/90 font-bold shrink-0 px-1.5 py-0.2 bg-[#1c222c] rounded-sm border border-slate-700/60">
            ⌘K
          </div>
        </form>
      </div>

      {/* RIGHT: ALERTS + CASE + USER */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Safety Hazard Alerts Pill */}
        <div className="relative" ref={alertMenuRef}>
          <button
            type="button"
            onClick={() => setShowAlertsDropdown((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-950/40 hover:bg-red-950/70 border border-red-600/50 rounded-sm text-red-300 text-[11px] font-bold tracking-wider transition-colors cursor-pointer"
            title="Active Threat Alerts"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>3 ALERTS</span>
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 top-8 w-80 bg-[#13171e] border border-red-600/40 rounded-sm p-3 shadow-2xl z-50 text-[10px] space-y-2 machined-panel">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-700/40 font-bold text-red-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-500 status-pulse" />
                  HAZARD ALERT QUEUE
                </span>
                <span className="px-1.5 py-0.2 bg-red-500/20 text-red-300 font-mono text-[9px] border border-red-500/30">
                  3 CRITICAL
                </span>
              </div>
              <div className="space-y-1.5">
                <Link
                  href="/ip-intelligence?ip=115.112.45.12"
                  onClick={() => setShowAlertsDropdown(false)}
                  className="block p-2 bg-[#171d26] hover:bg-[#1f2733] rounded-sm border border-slate-700/40 text-slate-300 transition-colors"
                >
                  <div className="flex justify-between font-bold text-red-300 font-mono">
                    <span>115.112.45.12</span>
                    <span className="text-red-400 font-black">98.6% CRITICAL</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Exfiltration Ingress // Jamtara FIR-0104</div>
                </Link>

                <Link
                  href="/ip-intelligence?ip=185.220.101.5"
                  onClick={() => setShowAlertsDropdown(false)}
                  className="block p-2 bg-[#171d26] hover:bg-[#1f2733] rounded-sm border border-slate-700/40 text-slate-300 transition-colors"
                >
                  <div className="flex justify-between font-bold text-red-300 font-mono">
                    <span>185.220.101.5 (Tor Relay)</span>
                    <span className="text-red-400 font-black">98.4% CRITICAL</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">C2 Beaconing // Hawala FIR-2024-8842</div>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Industrial Case Switcher */}
        <div className="relative" ref={caseMenuRef}>
          <button
            type="button"
            onClick={() => setShowCaseDropdown((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#161b22] hover:bg-[#1d242e] rounded-sm border border-slate-700/60 text-slate-200 transition-colors cursor-pointer text-[11px] font-bold"
            title="Switch Investigation Case Dossier"
          >
            <FolderOpen className="w-3 h-3 text-amber-400" />
            <span className="font-mono text-amber-300">{activeCase.id}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showCaseDropdown && (
            <div className="absolute right-0 top-8 w-72 bg-[#13171e] border border-amber-500/30 rounded-sm shadow-2xl py-1 z-50 text-[10px] machined-panel">
              <div className="px-3 py-1.5 text-amber-400/90 border-b border-slate-700/40 font-bold text-[9px] uppercase tracking-wider flex justify-between items-center">
                <span>ACTIVE CASE DOSSIERS</span>
                <span className="text-slate-500">3 LOADED</span>
              </div>
              {MOCK_CASES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onCaseChange?.(c.id);
                    setShowCaseDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-[#1a212b] flex flex-col cursor-pointer transition-colors border-b border-slate-800/50 last:border-none ${
                    activeCaseId === c.id ? "bg-[#1d2532] text-amber-300 font-bold" : "text-slate-300"
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span className="font-mono">{c.id}</span>
                    <span className="text-amber-400/80 text-[9px] px-1 py-0.2 bg-amber-500/10 border border-amber-500/20">
                      {c.syndicateTag}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">{c.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Analyst Identity */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 text-slate-300 text-[10px] bg-[#161b22] border border-slate-700/50 rounded-sm">
          <UserCheck className="w-3 h-3 text-emerald-400" />
          <span className="font-bold text-slate-200">{CURRENT_INVESTIGATOR.name.split(" ")[0]}</span>
          <span className="text-[8px] text-amber-400/80 font-mono">[IO]</span>
        </div>
      </div>
    </header>
  );
};
