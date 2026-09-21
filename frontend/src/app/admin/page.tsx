"use client";

import React, { useState } from "react";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import {
  Lock,
  Shield,
  KeyRound,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Terminal,
  Clock,
  Layers,
  RotateCcw,
  BadgeCheck,
  Eye,
  Server,
  User,
  ShieldAlert,
  Check,
  Minus,
} from "lucide-react";
import { CURRENT_INVESTIGATOR } from "@/data/dfir-mock-database";
import { UserRole } from "@/types/audit";

interface RBACPermissionRow {
  workspace: string;
  category: string;
  INVESTIGATOR: boolean;
  CYBER_ANALYST: boolean;
  INTELLIGENCE_ANALYST: boolean;
  SUPERVISOR: boolean;
  AUDITOR: boolean;
  SYSTEM_ADMIN: boolean;
}

const RBAC_MATRIX: RBACPermissionRow[] = [
  {
    workspace: "Command Center / Dashboard",
    category: "Core",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: true,
    SUPERVISOR: true,
    AUDITOR: true,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "Evidence Ingestion (PCAP/EVE)",
    category: "Ingestion",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: false,
    SUPERVISOR: true,
    AUDITOR: false,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "IP Intelligence & Resolution",
    category: "Analysis",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: true,
    SUPERVISOR: true,
    AUDITOR: false,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "Network Knowledge Graph",
    category: "Analysis",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: true,
    SUPERVISOR: true,
    AUDITOR: false,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "FIR Dossiers & Legal Records",
    category: "Legal",
    INVESTIGATOR: true,
    CYBER_ANALYST: false,
    INTELLIGENCE_ANALYST: false,
    SUPERVISOR: true,
    AUDITOR: true,
    SYSTEM_ADMIN: false,
  },
  {
    workspace: "Telecom / CDR Intelligence",
    category: "Analysis",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: true,
    SUPERVISOR: true,
    AUDITOR: false,
    SYSTEM_ADMIN: false,
  },
  {
    workspace: "AI Engine & Human-in-the-Loop",
    category: "Intelligence",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: false,
    SUPERVISOR: true,
    AUDITOR: false,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "Evidence Vault & Sec 65B Cert",
    category: "Evidence",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: false,
    SUPERVISOR: true,
    AUDITOR: true,
    SYSTEM_ADMIN: false,
  },
  {
    workspace: "Immutable Audit Stream",
    category: "Governance",
    INVESTIGATOR: false,
    CYBER_ANALYST: false,
    INTELLIGENCE_ANALYST: false,
    SUPERVISOR: true,
    AUDITOR: true,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "System Admin & Access Control",
    category: "Governance",
    INVESTIGATOR: false,
    CYBER_ANALYST: false,
    INTELLIGENCE_ANALYST: false,
    SUPERVISOR: false,
    AUDITOR: false,
    SYSTEM_ADMIN: true,
  },
];

export default function AccessControlPage() {
  const [activeRole, setActiveRole] = useState<UserRole>(CURRENT_INVESTIGATOR.role);
  const [sessionExpiry, setSessionExpiry] = useState("6 hr 45 min remaining");
  const [tokenRenewed, setTokenRenewed] = useState(false);

  const handleRenewToken = () => {
    setTokenRenewed(true);
    setSessionExpiry("8 hr 00 min remaining");
    setTimeout(() => setTokenRenewed(false), 2000);
  };

  return (
    <WorkstationShell activeCaseId={CURRENT_INVESTIGATOR.activeCaseId}>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base font-sans select-none">
        {/* ================= 1. HEADER ================= */}
        <div className="px-5 py-3.5 border-b border-border-subtle bg-surface-card/70 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-text-primary tracking-tight">
                  Access Control & RBAC Clearances
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-threat-crimson/30 bg-threat-crimson/10 text-threat-crimson">
                  Law Enforcement Restricted
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Statutory role boundaries, cryptographic bearer tokens, and least-privilege jurisdiction scope.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRenewToken}
              className="px-3.5 py-1.5 bg-telecom-cyan-dim/50 hover:bg-telecom-cyan/20 border border-telecom-cyan/30 text-telecom-cyan text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${tokenRenewed ? "animate-spin" : ""}`} />
              <span>{tokenRenewed ? "Token Renewed" : "Refresh JWT Bearer"}</span>
            </button>
          </div>
        </div>

        {/* Security Scope Banner */}
        <div className="px-5 py-2 bg-blue-950/20 border-b border-blue-500/20 text-blue-200/90 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-300">Backend Enforcement Notice:</span>
            <span className="text-text-muted text-[11px]">
              Authorization checks are verified server-side on every REST/GraphQL request via signed HSM tokens.
            </span>
          </div>
          <span className="text-telecom-cyan text-[10px] font-mono bg-telecom-cyan-dim/30 px-2 py-0.5 rounded border border-telecom-cyan/20">
            HSM Ed25519 Verified
          </span>
        </div>

        {/* ================= 2. WORKSPACE BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
          {/* Active Session Identity Card */}
          <div className="p-4 bg-surface-card border border-border-subtle rounded-xl space-y-3.5 shadow-xs">
            <div className="text-xs font-semibold text-text-primary pb-2 border-b border-border-subtle flex items-center justify-between">
              <span>Current Authenticated LEO Session</span>
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Active &amp; Audited
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-bg-base/70 border border-border-subtle rounded-lg space-y-1">
                <span className="text-[11px] text-text-muted font-medium block">Analyst Identity</span>
                <span className="text-text-primary font-semibold text-xs block">{CURRENT_INVESTIGATOR.name}</span>
                <span className="text-[11px] text-text-muted block">{CURRENT_INVESTIGATOR.rank}</span>
              </div>

              <div className="p-3 bg-bg-base/70 border border-border-subtle rounded-lg space-y-1">
                <span className="text-[11px] text-text-muted font-medium block">Badge &amp; User ID</span>
                <span className="text-telecom-cyan font-mono font-medium text-xs block">{CURRENT_INVESTIGATOR.badgeNumber}</span>
                <span className="text-[11px] text-text-muted font-mono block">{CURRENT_INVESTIGATOR.id}</span>
              </div>

              <div className="p-3 bg-bg-base/70 border border-border-subtle rounded-lg space-y-1">
                <span className="text-[11px] text-text-muted font-medium block">Security Clearance</span>
                <span className="text-threat-crimson font-mono font-semibold text-xs block">{CURRENT_INVESTIGATOR.clearanceLevel}</span>
                <span className="text-[11px] text-text-muted block">{CURRENT_INVESTIGATOR.jurisdiction}</span>
              </div>

              <div className="p-3 bg-bg-base/70 border border-border-subtle rounded-lg space-y-1">
                <span className="text-[11px] text-text-muted font-medium block">Session Token TTL</span>
                <span className="text-emerald-400 font-medium text-xs block">{sessionExpiry}</span>
                <span className="text-[11px] text-text-muted font-mono block">IP: {CURRENT_INVESTIGATOR.ipAddress}</span>
              </div>
            </div>
          </div>

          {/* Role Preview Switcher */}
          <div className="p-4 bg-surface-card border border-border-subtle rounded-xl space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-border-subtle">
              <div>
                <h2 className="text-xs font-semibold text-text-primary">
                  Role-Based Access Control (RBAC) Matrix
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Inspect permitted capabilities across distinct investigative and supervisory roles.
                </p>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
                <span className="text-text-muted text-[11px] mr-1">Highlight:</span>
                {(
                  [
                    "INVESTIGATOR",
                    "CYBER_ANALYST",
                    "INTELLIGENCE_ANALYST",
                    "SUPERVISOR",
                    "AUDITOR",
                    "SYSTEM_ADMIN",
                  ] as UserRole[]
                ).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setActiveRole(role)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      activeRole === role
                        ? "bg-telecom-cyan-dim/60 text-telecom-cyan border border-telecom-cyan/40 shadow-xs"
                        : "text-text-muted hover:text-text-primary hover:bg-surface-card"
                    }`}
                  >
                    {role.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* RBAC Matrix Table */}
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-overlay/50 border-b border-border-subtle text-[11px] text-text-muted font-medium">
                    <th className="py-2.5 px-3.5">Workspace Module</th>
                    <th className="py-2.5 px-3 text-center">Investigator</th>
                    <th className="py-2.5 px-3 text-center">Cyber Analyst</th>
                    <th className="py-2.5 px-3 text-center">Intel Analyst</th>
                    <th className="py-2.5 px-3 text-center">Supervisor</th>
                    <th className="py-2.5 px-3 text-center">Auditor</th>
                    <th className="py-2.5 px-3 text-center">Sys Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {RBAC_MATRIX.map((row) => (
                    <tr key={row.workspace} className="hover:bg-surface-overlay/40 transition-colors">
                      <td className="py-2.5 px-3.5 text-text-primary font-medium">
                        <span>{row.workspace}</span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {row.INVESTIGATOR ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            Allowed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-text-muted text-[11px]">
                            <Minus className="w-3 h-3" />
                            Denied
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {row.CYBER_ANALYST ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            Allowed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-text-muted text-[11px]">
                            <Minus className="w-3 h-3" />
                            Denied
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {row.INTELLIGENCE_ANALYST ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            Allowed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-text-muted text-[11px]">
                            <Minus className="w-3 h-3" />
                            Denied
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {row.SUPERVISOR ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            Allowed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-text-muted text-[11px]">
                            <Minus className="w-3 h-3" />
                            Denied
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {row.AUDITOR ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            Allowed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-text-muted text-[11px]">
                            <Minus className="w-3 h-3" />
                            Denied
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {row.SYSTEM_ADMIN ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            Allowed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-text-muted text-[11px]">
                            <Minus className="w-3 h-3" />
                            Denied
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </WorkstationShell>
  );
}
