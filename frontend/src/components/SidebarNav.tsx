"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  Network,
  Radio,
  PhoneCall,
  Briefcase,
  Cpu,
  ShieldAlert,
  Activity,
  ShieldCheck,
  Terminal,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
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
      groupTitle: "COMMAND",
      items: [
        { id: "dashboard", label: "Executive Analytics", href: "/dashboard", icon: LayoutDashboard },
        { id: "threat-radar", label: "Threat Radar Stream", href: "/radar", icon: Radio, badge: "LIVE" },
        { id: "alerts", label: "Alerts & Triage", href: "/alerts", icon: ShieldAlert, badge: "7" },
      ],
    },
    {
      groupTitle: "DATA INTELLIGENCE",
      items: [
        { id: "ingestion", label: "Evidence Ingestion", href: "/ingestion", icon: UploadCloud },
      ],
    },
    {
      groupTitle: "INVESTIGATION",
      items: [
        { id: "ip-intelligence", label: "IP Intelligence", href: "/ip-intelligence", icon: Radio },
        { id: "graph", label: "Investigation Workspace", href: "/graph", icon: Network, badge: "i2 LINK" },
        { id: "cdr", label: "CDR Telephony", href: "/cdr", icon: PhoneCall },
        { id: "cases", label: "Cases / FIR Dossiers", href: "/cases", icon: Briefcase, badge: "3" },
      ],
    },
    {
      groupTitle: "AI & MODELS",
      items: [
        { id: "pipeline-status", label: "3-Stage Pipeline", href: "/pipeline-status", icon: Activity, badge: "LIVE" },
        { id: "ai-pipeline", label: "AI Investigation Engine", href: "/ai-engine", icon: Cpu },
      ],
    },
    {
      groupTitle: "SECURITY & EVIDENCE",
      items: [
        { id: "evidence-vault", label: "Evidence Vault", href: "/evidence", icon: ShieldCheck },
        { id: "audit-stream", label: "Audit Log Stream", href: "/audit", icon: Terminal },
      ],
    },
  ];

  // Expandable group states - default all open
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [isSyndicatesCollapsed, setIsSyndicatesCollapsed] = useState(false);

  const toggleGroup = (groupTitle: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const handleToggleAll = () => {
    const areAnyCollapsed = Object.values(collapsedGroups).some((v) => v) || isSyndicatesCollapsed;
    if (areAnyCollapsed) {
      // Expand all
      setCollapsedGroups({});
      setIsSyndicatesCollapsed(false);
    } else {
      // Collapse all
      const allCollapsed: Record<string, boolean> = {};
      navigationGroups.forEach((g) => {
        allCollapsed[g.groupTitle] = true;
      });
      setCollapsedGroups(allCollapsed);
      setIsSyndicatesCollapsed(true);
    }
  };

  return (
    <aside className="w-56 border-r border-slate-700/40 bg-[#0e1117] flex flex-col justify-between shrink-0 z-40 text-xs font-mono select-none overflow-y-auto custom-scrollbar">
      {/* NAV ITEMS LIST */}
      <div className="flex flex-col py-2 px-2 space-y-2">
        {/* EXPAND/COLLAPSE ALL HEADER CONTROL */}
        <div className="flex items-center justify-between px-2 pt-1.5 pb-1.5 border-b border-slate-700/40 bg-[#12161f]/50">
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-400" />
            NAVIGATION
          </span>
          <button
            type="button"
            onClick={handleToggleAll}
            title="Toggle Expand/Collapse All Tabs"
            className="flex items-center gap-1 text-[9px] text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 px-1.5 py-0.5 rounded-sm border border-amber-500/20 transition-colors cursor-pointer font-bold"
          >
            <ChevronsUpDown className="w-2.5 h-2.5" />
            <span>TOGGLE</span>
          </button>
        </div>

        {navigationGroups.map((group, groupIdx) => {
          const isCollapsed = !!collapsedGroups[group.groupTitle];
          // Check if any child item is currently active
          const hasActiveChild = group.items.some(
            (item) =>
              pathname === item.href ||
              (pathname === "/" && item.href === "/dashboard")
          );

          return (
            <div key={group.groupTitle} className="space-y-0.5">
              {/* ACCORDION GROUP HEADER */}
              <button
                type="button"
                onClick={() => toggleGroup(group.groupTitle)}
                className={`w-full flex items-center justify-between text-[9px] font-bold px-2 py-1 tracking-widest uppercase rounded-sm transition-colors cursor-pointer group ${
                  hasActiveChild && isCollapsed
                    ? "text-amber-300 bg-amber-500/15 border border-amber-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#151a24]"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-amber-300 shrink-0" />
                  )}
                  <span className="text-slate-500 font-mono text-[8px]">0{groupIdx + 1}</span>
                  <span className="truncate">{group.groupTitle}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {hasActiveChild && isCollapsed && (
                    <span className="w-1.5 h-1.5 rounded-none bg-amber-400 animate-pulse transform rotate-45" />
                  )}
                  <span className="text-[8px] text-slate-400 font-mono font-bold px-1 py-0.2 rounded-none bg-[#171d27] border border-slate-700/50">
                    {group.items.length}
                  </span>
                </div>
              </button>

              {/* EXPANDABLE ITEMS BODY */}
              {!isCollapsed && (
                <div className="space-y-0.5 pl-1 transition-all duration-150">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (pathname === "/" && item.href === "/dashboard");

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-sm text-[11px] transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#18202c] text-amber-200 font-bold border-l-2 border-amber-400 pl-2 shadow-inner"
                            : "text-slate-400 hover:text-slate-100 hover:bg-[#141923]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? "text-amber-400" : "text-slate-500"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[8px] px-1.5 py-0.2 rounded-none font-bold tracking-wider font-mono ${
                              item.badge === "LIVE"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : item.badge === "7"
                                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* EXPANDABLE SYNDICATE DOSSIERS SELECTOR */}
        <div className="pt-2 border-t border-slate-700/40 space-y-1">
          <button
            type="button"
            onClick={() => setIsSyndicatesCollapsed((prev) => !prev)}
            className="w-full text-[9px] uppercase tracking-widest text-slate-400 hover:text-slate-200 px-2 py-1 font-bold flex items-center justify-between rounded-sm hover:bg-[#151a24] cursor-pointer group"
          >
            <div className="flex items-center gap-1.5">
              {isSyndicatesCollapsed ? (
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-amber-300 shrink-0" />
              )}
              <FolderOpen className="w-3 h-3 text-amber-400" />
              <span>06 SYNDICATES</span>
            </div>
            <span className="text-[8px] text-slate-400 font-mono font-bold px-1 py-0.2 bg-[#171d27] border border-slate-700/50">
              {MOCK_CASES.length}
            </span>
          </button>

          {!isSyndicatesCollapsed && (
            <div className="space-y-1 pl-1 transition-all duration-150">
              {MOCK_CASES.map((c) => {
                const isSelected = selectedCaseId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onCaseSelect?.(c.id)}
                    className={`w-full text-left p-2 rounded-sm text-[10px] transition-colors cursor-pointer border ${
                      isSelected
                        ? "bg-[#1c2432] border-amber-500/40 text-amber-200 font-bold"
                        : "bg-[#12161f]/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#161c27]"
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-slate-200">{c.id}</span>
                      <span className="text-[8px] text-amber-400 font-bold">{c.priority}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">{c.syndicateTag}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* INDUSTRIAL FOOTER */}
      <div className="p-2.5 border-t border-slate-700/40 bg-[#0b0d11] text-[9px] text-slate-400 font-mono flex justify-between items-center">
        <span className="flex items-center gap-1 text-slate-400">
          <span className="w-1.5 h-1.5 bg-emerald-400" />
          SPEC-810H
        </span>
        <span className="text-amber-400/90 font-bold px-1 bg-amber-500/10 border border-amber-500/20">
          AES-256
        </span>
      </div>
    </aside>
  );
};
