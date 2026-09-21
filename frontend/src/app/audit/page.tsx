"use client";

import React, { useState, useMemo } from "react";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import {
  Terminal,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Download,
  Clock,
  Layers,
  Link2,
  FileCheck,
  User,
  Hash,
  AlertCircle,
  CheckCircle,
  FileText,
  Activity,
} from "lucide-react";
import { MOCK_AUDIT_LOGS, CURRENT_INVESTIGATOR } from "@/data/dfir-mock-database";
import { AuditLogEntry, AuditActionType } from "@/types/audit";

const ACTION_FILTERS: { label: string; value: AuditActionType | "ALL" }[] = [
  { label: "All Events", value: "ALL" },
  { label: "Logins", value: "LOGIN" },
  { label: "Cases Opened", value: "CASE_OPENED" },
  { label: "Evidence Viewed", value: "EVIDENCE_VIEWED" },
  { label: "Graph Queries", value: "GRAPH_QUERIED" },
  { label: "AI Assessments", value: "AI_ANALYSIS_EXECUTED" },
  { label: "Integrity Checks", value: "EVIDENCE_INTEGRITY_VERIFIED" },
  { label: "Exports", value: "EVIDENCE_EXPORTED" },
];

export default function AuditStreamPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [selectedAction, setSelectedAction] = useState<AuditActionType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLogId, setSelectedLogId] = useState<string>(logs[0]?.id || "");
  const [isChainValid, setIsChainValid] = useState(true);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedAction !== "ALL" && log.action !== selectedAction) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.id.toLowerCase().includes(q) ||
          log.analystName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.resourceId.toLowerCase().includes(q) ||
          log.caseId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, selectedAction, searchQuery]);

  const selectedLog = logs.find((l) => l.id === selectedLogId) || logs[0];

  return (
    <WorkstationShell activeCaseId="GLOBAL_SYSTEM">
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base font-sans select-none">
        {/* ================= 1. HEADER ================= */}
        <div className="px-5 py-3.5 border-b border-border-subtle bg-surface-card/70 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg border border-telecom-cyan/30 bg-telecom-cyan-dim/40 text-telecom-cyan">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-text-primary tracking-tight">
                  Cryptographic Audit Stream
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  Append-Only Merkle Chain
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-telecom-cyan/30 bg-telecom-cyan-dim/30 text-telecom-cyan">
                  LEO Compliance
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Zero-trust audit recording: Every query, case view, model inference, and export is signed in tamper-evident ledger.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit ID, officer, resource..."
                className="pl-9 pr-3 py-1.5 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary w-60 md:w-72 focus:outline-hidden focus:border-telecom-cyan/60 placeholder:text-text-muted"
              />
            </div>
            <button
              type="button"
              onClick={() => alert("Audit log export generated.")}
              className="px-3.5 py-1.5 bg-telecom-cyan-dim/50 hover:bg-telecom-cyan/20 border border-telecom-cyan/30 text-telecom-cyan text-xs font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        {/* ================= 2. MERKLE INTEGRITY STRIP ================= */}
        <div className="px-5 py-2 bg-surface-card/40 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium text-xs">Chain Validated (0 Breaks)</span>
            </div>
            <span className="text-text-muted text-xs">
              Block Height: <strong className="text-text-primary font-mono">{logs.length} entries</strong>
            </span>
          </div>

          {/* Action Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {ACTION_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setSelectedAction(f.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  selectedAction === f.value
                    ? "bg-telecom-cyan-dim/60 text-telecom-cyan border border-telecom-cyan/30 shadow-xs"
                    : "text-text-muted hover:text-text-primary hover:bg-surface-card"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= 3. WORKSPACE SPLIT ================= */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Append-only Event Ledger */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2 bg-bg-base">
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-surface-card border-telecom-cyan/60 shadow-xs text-text-primary"
                        : "bg-surface-card/50 border-border-subtle text-text-muted hover:border-border-highlight hover:bg-surface-card"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono font-semibold text-telecom-cyan shrink-0 mt-0.5 bg-telecom-cyan-dim/30 px-1.5 py-0.5 rounded border border-telecom-cyan/20">
                        {log.id}
                      </span>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                              log.action === "LOGIN"
                                ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                                : log.action === "EVIDENCE_EXPORTED"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                : log.action === "EVIDENCE_INTEGRITY_VERIFIED"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-purple-500/30 bg-purple-500/10 text-purple-300"
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-xs font-semibold text-text-primary">
                            {log.analystName} ({log.role})
                          </span>
                          <span className="text-[11px] text-text-muted font-mono bg-bg-base/80 px-1.5 py-0.2 rounded">
                            {log.sourceIp}
                          </span>
                        </div>

                        <div className="text-xs text-text-secondary">
                          Resource: <strong className="text-text-primary font-mono">{log.resourceId}</strong> ({log.resourceType}) · Case: <strong className="text-telecom-cyan font-mono">{log.caseId}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end justify-between text-xs text-text-muted shrink-0 gap-1">
                      <span className="font-mono text-[11px]">{log.timestamp}</span>
                      <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {log.result}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Cryptographic Chain Detail Drawer */}
          {selectedLog && (
            <div className="w-full md:w-96 border-l border-border-subtle bg-surface-card p-4 flex flex-col shrink-0 overflow-y-auto custom-scrollbar space-y-4">
              <div className="text-xs font-semibold text-text-primary pb-2 border-b border-border-subtle flex items-center justify-between">
                <span>Event Provenance Inspection</span>
                <span className="text-telecom-cyan font-mono font-medium">{selectedLog.id}</span>
              </div>

              {/* Hashes: Current & Previous Block */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-bg-base/80 border border-border-subtle rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-text-muted font-medium">
                    <span>Current Event SHA-256 Hash</span>
                    <Hash className="w-3 h-3 text-telecom-cyan" />
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 break-all leading-relaxed bg-emerald-950/20 p-2 rounded border border-emerald-500/20">
                    {selectedLog.eventHash}
                  </div>
                </div>

                <div className="p-3 bg-bg-base/80 border border-border-subtle rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-text-muted font-medium">
                    <span>Previous Block Anchor Hash</span>
                    <Link2 className="w-3 h-3 text-text-muted" />
                  </div>
                  <div className="text-[11px] font-mono text-text-muted break-all leading-relaxed bg-surface-overlay/50 p-2 rounded border border-border-subtle/60">
                    {selectedLog.previousHash}
                  </div>
                </div>
              </div>

              {/* Metadata details */}
              <div className="space-y-3 text-xs pt-2 border-t border-border-subtle">
                <div>
                  <span className="text-[11px] text-text-muted block">Investigator Identity</span>
                  <span className="text-text-primary font-semibold text-xs mt-0.5 block">{selectedLog.analystName}</span>
                  <span className="text-[11px] text-text-muted font-mono block">User ID: {selectedLog.userId}</span>
                </div>

                <div>
                  <span className="text-[11px] text-text-muted block">Source IP Address</span>
                  <span className="text-text-primary font-mono text-xs mt-0.5 block">{selectedLog.sourceIp}</span>
                </div>

                <div>
                  <span className="text-[11px] text-text-muted block">User Agent Client</span>
                  <span className="text-text-secondary text-[11px] break-all font-mono mt-0.5 block bg-bg-base/60 p-1.5 rounded">{selectedLog.userAgent}</span>
                </div>

                <div>
                  <span className="text-[11px] text-text-muted block">Target Resource</span>
                  <span className="text-telecom-cyan font-mono font-medium text-xs mt-0.5 block">{selectedLog.resourceId}</span>
                </div>

                <div>
                  <span className="text-[11px] text-text-muted block">Associated Case</span>
                  <span className="text-text-primary font-mono text-xs mt-0.5 block">{selectedLog.caseId}</span>
                </div>

                <div>
                  <span className="text-[11px] text-text-muted block">Verification Status</span>
                  <span className="text-emerald-400 font-semibold text-xs mt-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {selectedLog.result}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkstationShell>
  );
}
