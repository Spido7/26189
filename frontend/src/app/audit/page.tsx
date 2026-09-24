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
} from "lucide-react";
import { MOCK_AUDIT_LOGS, CURRENT_INVESTIGATOR } from "@/data/dfir-mock-database";
import { AuditLogEntry, AuditActionType } from "@/types/audit";

const ACTION_FILTERS: { label: string; value: AuditActionType | "ALL" }[] = [
  { label: "ALL EVENTS", value: "ALL" },
  { label: "LOGINS", value: "LOGIN" },
  { label: "CASE OPENED", value: "CASE_OPENED" },
  { label: "EVIDENCE VIEWED", value: "EVIDENCE_VIEWED" },
  { label: "GRAPH QUERIES", value: "GRAPH_QUERIED" },
  { label: "AI ASSESSMENTS", value: "AI_ANALYSIS_EXECUTED" },
  { label: "INTEGRITY CHECKS", value: "EVIDENCE_INTEGRITY_VERIFIED" },
  { label: "EXPORTS", value: "EVIDENCE_EXPORTED" },
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
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base font-mono select-none">
        {/* ================= 1. HEADER ================= */}
        <div className="p-3 border-b border-border-subtle bg-surface-card flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-telecom-cyan/30 bg-telecom-cyan/10 text-telecom-cyan">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-text-primary tracking-wider uppercase">
                  CRYPTOGRAPHIC IMMUTABLE AUDIT STREAM
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                  APPEND-ONLY MERKLE CHAIN
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold border border-telecom-cyan/40 bg-telecom-cyan/10 text-telecom-cyan">
                  LEO SURVEILLANCE COMPLIANCE
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                Zero-trust audit recording: Every query, case view, model inference, and Section 65B export is cryptographically signed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH AUDIT ID / OFFICER / RESOURCE..."
                className="pl-8 pr-3 py-1.5 bg-bg-base border border-border-subtle text-xs text-text-primary w-64 md:w-80 focus:outline-none focus:border-telecom-cyan placeholder:text-text-muted"
              />
            </div>
            <button
              type="button"
              onClick={() => alert("Audit log export generated.")}
              className="px-3 py-1.5 bg-telecom-cyan/10 hover:bg-telecom-cyan/20 border border-telecom-cyan/40 text-telecom-cyan text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT DUMP</span>
            </button>
          </div>
        </div>

        {/* ================= 2. MERKLE INTEGRITY STRIP ================= */}
        <div className="px-3 py-1.5 bg-surface-card border-b border-border-subtle flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-text-primary font-bold">CHAIN INTEGRITY:</span>
              <span className="text-emerald-400 font-bold">VALIDATED (0 HASH BREAKS)</span>
            </div>
            <span className="text-border-subtle">|</span>
            <div className="text-text-muted text-[11px]">
              CURRENT BLOCK HEIGHT: <strong className="text-text-primary font-mono">{logs.length} ENTRIES</strong>
            </div>
          </div>

          {/* Action Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {ACTION_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setSelectedAction(f.value)}
                className={`px-2 py-0.5 border text-[10px] transition-colors cursor-pointer ${selectedAction === f.value
                    ? "border-telecom-cyan text-telecom-cyan bg-telecom-cyan/10 font-bold"
                    : "border-border-subtle text-text-muted hover:text-text-primary"
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
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2 bg-bg-base">
            <div className="space-y-1.5">
              {filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`p-2.5 border transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-2 ${isSelected
                        ? "bg-surface-card border-telecom-cyan text-text-primary"
                        : "bg-surface-card/60 border-border-subtle text-text-muted hover:border-border-highlight"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono font-bold text-telecom-cyan shrink-0 mt-0.5">
                        {log.id}
                      </span>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-bold border ${log.action === "LOGIN"
                                ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                                : log.action === "EVIDENCE_EXPORTED"
                                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                                  : log.action === "EVIDENCE_INTEGRITY_VERIFIED"
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                    : "border-purple-500/40 bg-purple-500/10 text-purple-300"
                              }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-xs font-bold text-text-primary">
                            {log.analystName} ({log.role})
                          </span>
                          <span className="text-[10px] text-text-muted font-mono">[{log.sourceIp}]</span>
                        </div>

                        <div className="text-[11px] text-text-secondary mt-1">
                          RESOURCE: <strong className="text-text-primary">{log.resourceId}</strong> ({log.resourceType}) | CASE: <strong className="text-telecom-cyan">{log.caseId}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end justify-between text-[10px] text-text-muted shrink-0">
                      <span>{log.timestamp}</span>
                      <span className="text-emerald-400 font-bold uppercase">{log.result}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Cryptographic Chain Detail Drawer */}
          {selectedLog && (
            <div className="w-full md:w-96 border-l border-border-subtle bg-surface-card p-3 flex flex-col shrink-0 overflow-y-auto custom-scrollbar space-y-3">
              <div className="text-xs font-bold text-text-primary uppercase tracking-wider pb-1.5 border-b border-border-subtle flex items-center justify-between">
                <span>EVENT PROVENANCE INSPECTION</span>
                <span className="text-telecom-cyan font-mono">{selectedLog.id}</span>
              </div>

              {/* Hashes: Current & Previous Block */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-bg-base border border-border-subtle space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-text-muted">
                    <span className="uppercase font-bold">CURRENT EVENT SHA-256 HASH:</span>
                    <Hash className="w-3 h-3 text-telecom-cyan" />
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 break-all leading-tight">
                    {selectedLog.eventHash}
                  </div>
                </div>

                <div className="p-2.5 bg-bg-base border border-border-subtle space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-text-muted">
                    <span className="uppercase font-bold">PREVIOUS BLOCK ANCHOR HASH:</span>
                    <Link2 className="w-3 h-3 text-text-muted" />
                  </div>
                  <div className="text-[11px] font-mono text-text-muted break-all leading-tight">
                    {selectedLog.previousHash}
                  </div>
                </div>
              </div>

              {/* Metadata details */}
              <div className="space-y-2 text-xs pt-1 border-t border-border-subtle">
                <div>
                  <span className="text-[10px] text-text-muted block">INVESTIGATOR IDENTITY:</span>
                  <span className="text-text-primary font-bold">{selectedLog.analystName}</span>
                  <span className="text-[10px] text-text-muted block">USER ID: {selectedLog.userId}</span>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted block">SOURCE IP ADDRESS:</span>
                  <span className="text-text-primary font-mono">{selectedLog.sourceIp}</span>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted block">USER AGENT CLIENT:</span>
                  <span className="text-text-secondary text-[11px] break-all">{selectedLog.userAgent}</span>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted block">TARGET RESOURCE:</span>
                  <span className="text-telecom-cyan font-bold">{selectedLog.resourceId}</span>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted block">ASSOCIATED CASE:</span>
                  <span className="text-text-primary">{selectedLog.caseId}</span>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted block">VERIFICATION RESULT:</span>
                  <span className="text-emerald-400 font-bold">{selectedLog.result}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkstationShell>
  );
}
