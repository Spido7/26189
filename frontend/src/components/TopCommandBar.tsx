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

  // Keyboard shortcut Cmd+K or Ctrl+K for search
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
    <header className="flex justify-between items-center w-full px-4 h-12 border-b border-border-subtle bg-surface-card text-xs font-sans shrink-0 z-50 select-none">
      {/* ================= LEFT: BRAND & SYSTEM STATUS ================= */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 pr-4 border-r border-border-subtle hover:opacity-90 transition-opacity"
        >
          <div className="w-6 h-6 rounded-md bg-telecom-cyan/15 border border-telecom-cyan/30 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-telecom-cyan" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary text-xs tracking-wide">
              DFIR <span className="text-telecom-cyan">Intelligence</span>
            </span>
            <span className="text-[10px] text-text-muted">Cyber Forensics SOC</span>
          </div>
        </Link>

        {/* System Health Status Popover */}
        <div className="relative" ref={diagMenuRef}>
          <button
            type="button"
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-bg-base/80 hover:bg-surface-overlay border border-border-subtle text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="View System Status Telemetry"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse" />
            <span className="font-medium text-text-primary">System Operational</span>
            <ChevronDown className="w-3 h-3 text-text-muted ml-0.5" />
          </button>

          {/* Diagnostics Popover */}
          {showDiagnostics && (
            <div className="absolute top-10 left-0 w-80 bg-surface-card border border-border-highlight rounded-lg p-3 shadow-2xl z-50 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle font-semibold text-text-primary">
                <span className="flex items-center gap-2 text-telecom-cyan">
                  <Activity className="w-4 h-4" />
                  <span>Telemetry &amp; Backend Nodes</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">Online</span>
              </div>
              <div className="space-y-2 text-text-secondary text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">FastAPI Engine:</span>
                  <span className="text-emerald-400 font-medium">Ready (Local Adapter)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Neo4j Bolt Graph:</span>
                  <span className="text-purple-400 font-medium">Synced (42.8k nodes)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">AI 3-Stage Pipeline:</span>
                  <span className="text-emerald-400 font-medium">TensorRT GPU-0 (Active)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Evidence Ledger:</span>
                  <span className="text-telecom-cyan font-medium">SHA-256 Verified</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= CENTER: GLOBAL SEARCH BAR ================= */}
      <div className="flex-1 max-w-lg mx-6">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 bg-bg-base px-3 py-1.5 rounded-lg border border-border-subtle hover:border-border-highlight focus-within:border-telecom-cyan focus-within:ring-1 focus-within:ring-telecom-cyan/30 transition-all w-full"
        >
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IP, phone number, person, case, or evidence..."
            className="bg-transparent border-none outline-none text-text-primary text-xs placeholder:text-text-muted w-full p-0 focus:ring-0"
          />
          <kbd className="flex items-center gap-0.5 text-[10px] text-text-muted shrink-0 bg-surface-overlay border border-border-subtle rounded px-1.5 py-0.5 font-mono">
            <span>⌘</span>K
          </kbd>
        </form>
      </div>

      {/* ================= RIGHT: ALERTS + CASE + PROFILE ================= */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Active Alerts Pill with Popover */}
        <div className="relative" ref={alertMenuRef}>
          <button
            type="button"
            onClick={() => setShowAlertsDropdown((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-xs font-medium transition-colors cursor-pointer"
            title="3 Active High Priority Alerts"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>3 Alerts</span>
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 top-10 w-84 bg-surface-card border border-border-highlight rounded-lg p-3 shadow-2xl z-50 text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle font-semibold">
                <span className="text-text-primary">Active Threat Alerts</span>
                <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 font-medium">3 Critical</span>
              </div>
              <div className="space-y-1.5">
                <Link
                  href="/ip-intelligence?ip=115.112.45.12"
                  onClick={() => setShowAlertsDropdown(false)}
                  className="block p-2 rounded-md bg-bg-base hover:bg-surface-overlay border border-border-subtle transition-colors"
                >
                  <div className="flex justify-between font-medium text-threat-crimson">
                    <span>115.112.45.12 (Jio Ingress)</span>
                    <span className="font-mono text-[11px]">98.6%</span>
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">Data Exfiltration · Jamtara Case FIR-0104</div>
                </Link>

                <Link
                  href="/ip-intelligence?ip=185.220.101.5"
                  onClick={() => setShowAlertsDropdown(false)}
                  className="block p-2 rounded-md bg-bg-base hover:bg-surface-overlay border border-border-subtle transition-colors"
                >
                  <div className="flex justify-between font-medium text-threat-crimson">
                    <span>185.220.101.5 (Flokinet Tor)</span>
                    <span className="font-mono text-[11px]">98.4%</span>
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">C2 Beaconing · Hawala FIR-2024-8842</div>
                </Link>

                <Link
                  href="/ip-intelligence?ip=45.33.32.156"
                  onClick={() => setShowAlertsDropdown(false)}
                  className="block p-2 rounded-md bg-bg-base hover:bg-surface-overlay border border-border-subtle transition-colors"
                >
                  <div className="flex justify-between font-medium text-threat-crimson">
                    <span>45.33.32.156 (Linode C2)</span>
                    <span className="font-mono text-[11px]">99.1%</span>
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">Ransomware Propagation · CBI FIR-7719</div>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Active Case Selector */}
        <div className="relative" ref={caseMenuRef}>
          <button
            type="button"
            onClick={() => setShowCaseDropdown((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-bg-base/80 hover:bg-surface-overlay border border-border-subtle text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-xs"
            title="Switch Active Investigation Case"
          >
            <FolderOpen className="w-3.5 h-3.5 text-record-amber" />
            <span className="font-mono font-medium text-text-primary">{activeCase.id}</span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {showCaseDropdown && (
            <div className="absolute right-0 top-10 w-80 bg-surface-card border border-border-highlight rounded-lg shadow-2xl py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted border-b border-border-subtle">
                Switch Active Case
              </div>
              {MOCK_CASES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onCaseChange?.(c.id);
                    setShowCaseDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-surface-overlay flex flex-col cursor-pointer transition-colors ${
                    activeCaseId === c.id ? "bg-surface-overlay text-telecom-cyan border-l-2 border-telecom-cyan" : "text-text-secondary"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-medium text-text-primary">{c.id}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-medium">{c.priority}</span>
                  </div>
                  <div className="text-[11px] text-text-muted truncate mt-0.5">{c.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Analyst Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
            {CURRENT_INVESTIGATOR.name.charAt(0)}
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="font-medium text-text-primary text-xs leading-tight">{CURRENT_INVESTIGATOR.name}</span>
            <span className="text-[10px] text-text-muted leading-tight">{CURRENT_INVESTIGATOR.rank}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
