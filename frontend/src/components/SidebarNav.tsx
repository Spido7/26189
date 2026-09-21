"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  FileCode2,
  Database,
  Network,
  Radio,
  PhoneCall,
  GitMerge,
  Briefcase,
  Cpu,
  ShieldAlert,
  HelpCircle,
  Activity,
  ShieldCheck,
  Link2,
  History,
  Lock,
  Terminal,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import { MOCK_CASES } from "@/data/dfir-mock-database";

interface SidebarNavProps {
  selectedCaseId?: string;
  onCaseSelect?: (caseId: string) => void;
  onIngestClick?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  selectedCaseId = "FIR-2024-8842",
  onCaseSelect,
}) => {
  const pathname = usePathname();

  const navigationGroups: NavGroup[] = [
    {
      groupTitle: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      groupTitle: "Investigation",
      items: [
        { id: "cases", label: "Cases & FIRs", href: "/cases", icon: Briefcase, badge: "3" },
        { id: "ip-intelligence", label: "IP Intelligence", href: "/ip-intelligence", icon: Radio },
        { id: "graph", label: "Network Graph", href: "/graph", icon: Network, badge: "3D" },
        { id: "cdr", label: "Telecom CDR", href: "/cdr", icon: PhoneCall },
      ],
    },
    {
      groupTitle: "Data Pipeline",
      items: [
        { id: "ingestion", label: "Evidence Ingestion", href: "/ingestion", icon: UploadCloud, badge: "Live" },
      ],
    },
    {
      groupTitle: "AI & Forensics",
      items: [
        { id: "ai-pipeline", label: "AI Engine & XAI", href: "/ai-engine", icon: Cpu, badge: "DL" },
        { id: "evidence-vault", label: "Evidence Vault", href: "/evidence", icon: ShieldCheck },
      ],
    },
    {
      groupTitle: "Governance",
      items: [
        { id: "audit-stream", label: "Audit Stream", href: "/audit", icon: Terminal },
        { id: "access-control", label: "Access Control", href: "/admin", icon: Lock },
      ],
    },
  ];

  return (
    <aside className="w-60 border-r border-border-subtle bg-bg-base flex flex-col justify-between shrink-0 z-40 text-xs font-sans select-none overflow-y-auto custom-scrollbar">
      {/* ================= NAV ITEMS LIST ================= */}
      <div className="flex flex-col py-3 px-2 space-y-4">
        {navigationGroups.map((group) => (
          <div key={group.groupTitle} className="space-y-1">
            <div className="text-[11px] font-semibold text-text-muted px-2.5 py-1 tracking-wider uppercase">
              {group.groupTitle}
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
                  (pathname === "/" && item.href === "/dashboard");

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group cursor-pointer ${
                      isActive
                        ? "bg-telecom-cyan/15 text-telecom-cyan border border-telecom-cyan/30 font-semibold"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-card"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-telecom-cyan" : "text-text-muted group-hover:text-text-secondary"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium tracking-wide shrink-0 ${
                          isActive
                            ? "bg-telecom-cyan/20 text-telecom-cyan"
                            : "bg-surface-overlay text-text-muted border border-border-subtle"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* ================= ACTIVE INVESTIGATIONS LIST ================= */}
        <div className="pt-3 border-t border-border-subtle">
          <div className="text-[11px] uppercase tracking-wider text-text-muted px-2.5 mb-2 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-record-amber" />
              <span>Active Dossiers</span>
            </span>
            <span className="text-[10px] text-text-muted font-normal">FIR</span>
          </div>

          <div className="space-y-1">
            {MOCK_CASES.map((c) => {
              const isSelected = selectedCaseId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCaseSelect?.(c.id)}
                  className={`w-full text-left p-2 rounded-md border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-surface-card border-telecom-cyan/60 text-telecom-cyan font-medium"
                      : "bg-surface-card/40 border-border-subtle/60 text-text-muted hover:text-text-secondary hover:border-border-highlight"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-medium truncate text-text-primary">{c.id}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-record-amber/15 text-record-amber shrink-0 font-medium">
                      {c.priority}
                    </span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate mt-0.5">{c.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="p-3 border-t border-border-subtle bg-surface-card/40 text-[10px] text-text-muted space-y-1">
        <div className="flex justify-between items-center">
          <span>Station ID:</span>
          <span className="text-text-secondary font-mono">SOC-NODE-04</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Encryption:</span>
          <span className="text-emerald-400 font-mono">AES-256 GCM</span>
        </div>
      </div>
    </aside>
  );
};
