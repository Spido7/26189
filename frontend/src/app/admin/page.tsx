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
} from "lucide-react";
import { CURRENT_INVESTIGATOR } from "@/data/dfir-mock-database";
import { UserRole } from "@/types/audit";

interface RBACPermissionRow {
  workspace: string;
  INVESTIGATOR: boolean;
  CYBER_ANALYST: boolean;
  INTELLIGENCE_ANALYST: boolean;
  SUPERVISOR: boolean;
  AUDITOR: boolean;
  SYSTEM_ADMIN: boolean;
}

const RBAC_MATRIX: RBACPermissionRow[] = [
  {
    workspace: "COMMAND CENTER / DASHBOARD",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: true,
    SUPERVISOR: true,
    AUDITOR: true,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "EVIDENCE INGESTION (PCAP/EVE)",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: false,
    SUPERVISOR: true,
    AUDITOR: false,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "IP INTELLIGENCE & RESOLUTION",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: true,
    SUPERVISOR: true,
    AUDITOR: false,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "NETWORK KNOWLEDGE GRAPH",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: true,
    SUPERVISOR: true,
    AUDITOR: false,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "FIR DOSSIERS & LEGAL RECORDS",
    INVESTIGATOR: true,
    CYBER_ANALYST: false,
    INTELLIGENCE_ANALYST: false,
    SUPERVISOR: true,
    AUDITOR: true,
    SYSTEM_ADMIN: false,
  },
  {
    workspace: "TELECOM / CDR INTELLIGENCE",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: true,
    SUPERVISOR: true,
    AUDITOR: false,
    SYSTEM_ADMIN: false,
  },
  {
    workspace: "AI ENGINE & HUMAN-IN-THE-LOOP",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: false,
    SUPERVISOR: true,
    AUDITOR: false,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "EVIDENCE VAULT & SEC 65B CERT",
    INVESTIGATOR: true,
    CYBER_ANALYST: true,
    INTELLIGENCE_ANALYST: false,
    SUPERVISOR: true,
    AUDITOR: true,
    SYSTEM_ADMIN: false,
  },
  {
    workspace: "IMMUTABLE AUDIT STREAM",
    INVESTIGATOR: false,
    CYBER_ANALYST: false,
    INTELLIGENCE_ANALYST: false,
    SUPERVISOR: true,
    AUDITOR: true,
    SYSTEM_ADMIN: true,
  },
  {
    workspace: "SYSTEM ADMIN & ACCESS CONTROL",
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
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base font-mono select-none">
        {/* ================= 1. HEADER ================= */}
        <div className="p-3 border-b border-border-subtle bg-surface-card flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-text-primary tracking-wider uppercase">
                  LEO ACCESS CONTROL & RBAC SECURITY CLEARANCES
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-bold border border-threat-crimson/40 bg-threat-crimson/10 text-threat-crimson">
                  STRICT LAW-ENFORCEMENT ONLY
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                Statutory role boundaries, cryptographic bearer tokens, and least-privilege jurisdiction scope.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRenewToken}
              className="px-3 py-1.5 bg-telecom-cyan/10 hover:bg-telecom-cyan/20 border border-telecom-cyan/40 text-telecom-cyan text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{tokenRenewed ? "TOKEN RENEWED" : "REFRESH JWT BEARER"}</span>
            </button>
          </div>
        </div>

        {/* Security Scope Banner */}
        <div className="px-3 py-1.5 bg-blue-950/20 border-b border-blue-500/30 text-blue-200/90 text-[10px] flex items-center justify-between">
          <span>
            <strong>BACKEND ENFORCEMENT NOTICE:</strong> Authorization checks are verified server-side on every REST/GraphQL request via signed HSM tokens. Frontend access masks exist purely for user ergonomics.
          </span>
          <span className="text-telecom-cyan text-[9px] font-mono">HSM ED25519 SIGNATURE VERIFIED</span>
        </div>

        {/* ================= 2. WORKSPACE BODY ================= */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
          {/* Active Session Identity Card */}
          <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
            <div className="text-xs font-bold text-text-primary uppercase tracking-wider pb-1 border-b border-border-subtle flex items-center justify-between">
              <span>CURRENT AUTHENTICATED LEO SESSION</span>
              <span className="px-2 py-0.5 text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                ACTIVE & AUDITED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-bg-base border border-border-subtle space-y-1">
                <span className="text-[10px] text-text-muted uppercase block">ANALYST IDENTITY:</span>
                <span className="text-text-primary font-bold">{CURRENT_INVESTIGATOR.name}</span>
                <span className="text-[10px] text-text-muted block">{CURRENT_INVESTIGATOR.rank}</span>
              </div>

              <div className="p-2.5 bg-bg-base border border-border-subtle space-y-1">
                <span className="text-[10px] text-text-muted uppercase block">BADGE & USER ID:</span>
                <span className="text-telecom-cyan font-bold">{CURRENT_INVESTIGATOR.badgeNumber}</span>
                <span className="text-[10px] text-text-muted block">{CURRENT_INVESTIGATOR.id}</span>
              </div>

              <div className="p-2.5 bg-bg-base border border-border-subtle space-y-1">
                <span className="text-[10px] text-text-muted uppercase block">SECURITY CLEARANCE:</span>
                <span className="text-threat-crimson font-bold">{CURRENT_INVESTIGATOR.clearanceLevel}</span>
                <span className="text-[10px] text-text-muted block">{CURRENT_INVESTIGATOR.jurisdiction}</span>
              </div>

              <div className="p-2.5 bg-bg-base border border-border-subtle space-y-1">
                <span className="text-[10px] text-text-muted uppercase block">SESSION TOKEN TTL:</span>
                <span className="text-emerald-400 font-bold">{sessionExpiry}</span>
                <span className="text-[10px] text-text-muted block">IP: {CURRENT_INVESTIGATOR.ipAddress}</span>
              </div>
            </div>
          </div>

          {/* Role Preview Switcher */}
          <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Inspect permitted capabilities across distinct investigative roles.
                </p>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
                <span className="text-text-muted uppercase mr-1">PREVIEW ROLE:</span>
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
                    className={`px-2 py-1 font-bold border transition-colors cursor-pointer ${activeRole === role
                        ? "border-telecom-cyan text-telecom-cyan bg-telecom-cyan/10"
                        : "border-border-subtle text-text-muted hover:text-text-primary"
                      }`}
                  >
                    {role.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* RBAC Matrix Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase">
                    <th className="py-2 px-3">WORKSPACE MODULE</th>
                    <th className="py-2 px-3 text-center">INVESTIGATOR</th>
                    <th className="py-2 px-3 text-center">CYBER ANALYST</th>
                    <th className="py-2 px-3 text-center">INTEL ANALYST</th>
                    <th className="py-2 px-3 text-center">SUPERVISOR</th>
                    <th className="py-2 px-3 text-center">AUDITOR</th>
                    <th className="py-2 px-3 text-center">SYS ADMIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 font-mono">
                  {RBAC_MATRIX.map((row) => (
                    <tr key={row.workspace} className="hover:bg-surface-overlay/50 transition-colors">
                      <td className="py-2 px-3 text-text-primary font-bold">{row.workspace}</td>

                      <td className="py-2 px-3 text-center">
                        {row.INVESTIGATOR ? (
                          <span className="text-emerald-400 font-bold">ALLOWED</span>
                        ) : (
                          <span className="text-text-muted">DENIED</span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-center">
                        {row.CYBER_ANALYST ? (
                          <span className="text-emerald-400 font-bold">ALLOWED</span>
                        ) : (
                          <span className="text-text-muted">DENIED</span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-center">
                        {row.INTELLIGENCE_ANALYST ? (
                          <span className="text-emerald-400 font-bold">ALLOWED</span>
                        ) : (
                          <span className="text-text-muted">DENIED</span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-center">
                        {row.SUPERVISOR ? (
                          <span className="text-emerald-400 font-bold">ALLOWED</span>
                        ) : (
                          <span className="text-text-muted">DENIED</span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-center">
                        {row.AUDITOR ? (
                          <span className="text-emerald-400 font-bold">ALLOWED</span>
                        ) : (
                          <span className="text-text-muted">DENIED</span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-center">
                        {row.SYSTEM_ADMIN ? (
                          <span className="text-emerald-400 font-bold">ALLOWED</span>
                        ) : (
                          <span className="text-text-muted">DENIED</span>
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
