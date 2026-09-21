import { EntityType, ThreatLevel } from "@/types/forensics";

export const DFIR_TOKENS = {
  colors: {
    bgBase: "#09090b",
    surfaceCard: "#121215",
    surfaceOverlay: "#18181b",
    borderSubtle: "#27272a",
    borderHighlight: "#3f3f46",
    threatCrimson: "#ef4444",
    threatCrimsonDim: "#450a0a",
    telecomCyan: "#06b6d4",
    telecomCyanDim: "#083344",
    recordAmber: "#f59e0b",
    recordAmberDim: "#451a03",
    accusedViolet: "#a855f7",
    accusedVioletDim: "#3b0764",
    textPrimary: "#f4f4f5",
    textSecondary: "#a1a1aa",
    textMuted: "#71717a",
    emerald: "#10b981",
    emeraldDim: "#064e3b",
  },
  fonts: {
    mono: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Geist Mono', monospace",
    sans: "var(--font-inter), 'Inter', sans-serif",
  },
};

export interface BadgeConfig {
  label: string;
  dotColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  dimBgColor: string;
  tagColor: string;
}

export const ENTITY_CONFIG: Record<EntityType, BadgeConfig> = {
  Criminal_IP: {
    label: "Criminal_IP",
    dotColor: "bg-threat-crimson",
    textColor: "text-threat-crimson",
    bgColor: "bg-threat-crimson-dim/60",
    borderColor: "border-threat-crimson/50 hover:border-threat-crimson",
    dimBgColor: "bg-threat-crimson/20",
    tagColor: "bg-threat-crimson text-bg-base",
  },
  Device_MAC: {
    label: "Device_MAC",
    dotColor: "bg-telecom-cyan",
    textColor: "text-telecom-cyan",
    bgColor: "bg-telecom-cyan-dim/60",
    borderColor: "border-telecom-cyan/50 hover:border-telecom-cyan",
    dimBgColor: "bg-telecom-cyan/20",
    tagColor: "bg-telecom-cyan-dim text-telecom-cyan",
  },
  PhoneNumber: {
    label: "PhoneNumber",
    dotColor: "bg-emerald-400",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-950/60",
    borderColor: "border-emerald-500/50 hover:border-emerald-400",
    dimBgColor: "bg-emerald-500/20",
    tagColor: "bg-emerald-950 text-emerald-400",
  },
  Person: {
    label: "Person",
    dotColor: "bg-accused-violet",
    textColor: "text-accused-violet",
    bgColor: "bg-accused-violet-dim/60",
    borderColor: "border-accused-violet/50 hover:border-accused-violet",
    dimBgColor: "bg-accused-violet/20",
    tagColor: "bg-accused-violet-dim text-accused-violet",
  },
  FIR: {
    label: "FIR / Penal",
    dotColor: "bg-record-amber",
    textColor: "text-record-amber",
    bgColor: "bg-record-amber-dim/60",
    borderColor: "border-record-amber/50 hover:border-record-amber",
    dimBgColor: "bg-record-amber/20",
    tagColor: "bg-record-amber-dim text-record-amber",
  },
  Cellular_BTS: {
    label: "Cellular_BTS",
    dotColor: "bg-telecom-cyan",
    textColor: "text-telecom-cyan",
    bgColor: "bg-telecom-cyan-dim/60",
    borderColor: "border-telecom-cyan/50 hover:border-telecom-cyan",
    dimBgColor: "bg-telecom-cyan/20",
    tagColor: "bg-telecom-cyan-dim text-telecom-cyan",
  },
  BTC_Wallet: {
    label: "BTC_Wallet",
    dotColor: "bg-threat-crimson",
    textColor: "text-threat-crimson",
    bgColor: "bg-threat-crimson-dim/40",
    borderColor: "border-threat-crimson/40 hover:border-threat-crimson",
    dimBgColor: "bg-threat-crimson/20",
    tagColor: "bg-threat-crimson/20 text-threat-crimson",
  },
};

export function getThreatBadge(level: ThreatLevel, cvss?: number) {
  switch (level) {
    case "CRITICAL":
      return {
        badgeClass: "bg-threat-crimson-dim text-threat-crimson border-threat-crimson/50",
        text: `THREAT LVL: CRITICAL ${cvss ? `(${cvss} CVSS)` : ""}`,
      };
    case "HIGH":
      return {
        badgeClass: "bg-threat-crimson-dim/80 text-rose-400 border-rose-500/50",
        text: `THREAT LVL: HIGH ${cvss ? `(${cvss} CVSS)` : ""}`,
      };
    case "ELEVATED":
    case "MEDIUM":
      return {
        badgeClass: "bg-record-amber-dim text-record-amber border-record-amber/50",
        text: `STATUS: ELEVATED ${cvss ? `(${cvss} CVSS)` : ""}`,
      };
    default:
      return {
        badgeClass: "bg-surface-overlay text-text-secondary border-border-subtle",
        text: "STATUS: NOMINAL",
      };
  }
}
