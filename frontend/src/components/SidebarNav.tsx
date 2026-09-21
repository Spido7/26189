"use client";

import React from "react";
import {
  Fingerprint,
  Upload,
  PhoneCall,
  Network,
  Gavel,
  Binary,
  Receipt,
  Settings,
  Power,
  FolderOpen,
} from "lucide-react";
import { ACTIVE_CASES } from "@/data/forensics-mock";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onIngestClick: () => void;
  selectedCaseId?: string;
  onCaseSelect?: (caseId: string) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  onIngestClick,
  selectedCaseId = "ALL",
  onCaseSelect,
}) => {
  const tabs = [
    { id: "graph", label: "Graph Canvas", icon: Network },
    { id: "cdr", label: "CDR Records", icon: PhoneCall },
    { id: "threat-matrix", label: "IP/MAC Threat Matrix", icon: Network },
    { id: "penal-code", label: "Penal Code Index", icon: Gavel },
    { id: "hex-dump", label: "Hex/Hash Dump", icon: Binary },
    { id: "audit-stream", label: "Audit Stream", icon: Receipt },
  ];

  return (
    <nav className="w-56 border-r border-border-subtle bg-bg-base flex flex-col justify-between shrink-0 z-40 text-xs font-mono select-none">
      {/* ================= TOP SECTION ================= */}
      <div className="flex flex-col">
        {/* Cluster Header */}
        <div className="p-2.5 border-b border-border-subtle flex items-center gap-2 bg-surface-card/40">
          <div className="w-7 h-7 bg-surface-overlay border border-border-highlight flex items-center justify-center text-telecom-cyan">
            <Fingerprint className="w-4 h-4 text-telecom-cyan" />
          </div>
          <div className="overflow-hidden leading-tight">
            <div className="font-mono text-[10px] font-bold text-text-primary tracking-wider uppercase">
              NODE CLUSTERS
            </div>
            <div className="text-[9px] text-emerald-400 truncate font-semibold">
              Neo4j: CONNECTED (42.8k)
            </div>
          </div>
        </div>

        {/* Ingest CTA */}
        <div className="p-2">
          <button
            type="button"
            onClick={onIngestClick}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-surface-overlay hover:bg-border-subtle border border-border-subtle text-text-primary text-[11px] font-medium transition-colors cursor-pointer active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-telecom-cyan" />
            <span>Ingest Evidence File</span>
          </button>
        </div>

        {/* Nav Tabs List */}
        <div className="flex flex-col gap-0.5 px-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 flex items-center gap-2 text-xs font-mono transition-colors text-left cursor-pointer ${
                  isActive
                    ? "bg-surface-card text-telecom-cyan border-l-2 border-telecom-cyan font-bold"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface-card/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-telecom-cyan" : "text-text-muted"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Cases List */}
        <div className="mt-4 px-3">
          <div className="text-[9px] uppercase tracking-wider text-text-muted mb-1.5 font-bold flex items-center gap-1">
            <FolderOpen className="w-3 h-3" />
            <span>Active Syndicate Cases</span>
          </div>
          <div className="space-y-1 text-[10px]">
            {ACTIVE_CASES.map((c) => {
              const isSelected = selectedCaseId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCaseSelect?.(c.id)}
                  className={`w-full text-left p-1.5 border flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-surface-card border-telecom-cyan text-telecom-cyan font-bold"
                      : "bg-surface-overlay border-transparent text-text-muted hover:text-text-secondary hover:border-border-subtle"
                  }`}
                >
                  <span className="truncate">{c.label}</span>
                  <span className={`text-[8px] px-1 ${isSelected ? "bg-telecom-cyan/20 text-telecom-cyan" : "bg-record-amber/20 text-record-amber"}`}>
                    {c.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* ================= FOOTER LINKS ================= */}
      <div className="border-t border-border-subtle p-2 space-y-1">
        <button
          type="button"
          className="w-full text-text-muted hover:text-text-primary flex items-center gap-2 px-2 py-1.5 text-[11px] transition-colors cursor-pointer hover:bg-surface-card"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Engine Config</span>
        </button>
        <button
          type="button"
          className="w-full text-text-muted hover:text-threat-crimson flex items-center gap-2 px-2 py-1.5 text-[11px] transition-colors cursor-pointer hover:bg-surface-card"
        >
          <Power className="w-3.5 h-3.5" />
          <span>Disconnect Session</span>
        </button>
      </div>
    </nav>
  );
};
