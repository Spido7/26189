"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Ban,
  Share2,
  Gavel,
  BookmarkPlus,
  Crosshair,
  FileCode,
  Terminal,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
} from "lucide-react";
import { ForensicNode } from "@/types/forensics";
import { getThreatBadge } from "@/lib/tokens";

interface ForensicMetadataDrawerProps {
  selectedNode: ForensicNode | null;
  isOpen?: boolean;
  onClose?: () => void;
  onFocusNode?: (nodeId: string) => void;
  onQuarantine?: (nodeId: string) => void;
  onPivot?: (nodeId: string) => void;
  onGenerateSubpoena?: (nodeId: string) => void;
  onAddToCase?: (nodeId: string) => void;
}

interface FlattenedProp {
  section: string;
  key: string;
  value: string;
  path: string;
}

export const ForensicMetadataDrawer: React.FC<ForensicMetadataDrawerProps> = ({
  selectedNode,
  isOpen = true,
  onClose,
  onFocusNode,
  onQuarantine,
  onPivot,
  onGenerateSubpoena,
  onAddToCase,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hexOpen, setHexOpen] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === keyId ? null : prev));
    }, 1500);
  };

  const handleCopyJson = () => {
    if (!selectedNode) return;
    const jsonStr = JSON.stringify(selectedNode, null, 2);
    handleCopy(jsonStr, "node-json");
    setActionNotice("NODE JSON COPIED");
    setTimeout(() => setActionNotice(null), 2000);
  };

  const triggerAction = (actionName: string, callback?: () => void) => {
    if (callback) callback();
    setActionNotice(actionName);
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Helper to dynamically iterate through all nested properties and group by category
  const extractNestedProperties = (node: ForensicNode): Record<string, FlattenedProp[]> => {
    const sections: Record<string, FlattenedProp[]> = {
      "Core Identifiers": [],
      "Hashes & Signatures": [],
      "Network & ISP ASN": [],
      "Telephony & Hardware ID": [],
      "Geo-Telemetry": [],
      "Statutory & Penal Linking": [],
      "Extended Metadata": [],
    };

    // 1. Core Identifiers
    sections["Core Identifiers"].push(
      { section: "Core Identifiers", key: "Node ID", value: node.id, path: "id" },
      { section: "Core Identifiers", key: "Classification", value: node.type, path: "type" },
      { section: "Core Identifiers", key: "Title", value: node.title, path: "title" },
      { section: "Core Identifiers", key: "Subtitle", value: node.subtitle, path: "subtitle" },
      { section: "Core Identifiers", key: "Status", value: node.status, path: "status" },
      { section: "Core Identifiers", key: "Threat Level", value: node.threatLevel, path: "threatLevel" },
      { section: "Core Identifiers", key: "CVSS Score", value: node.cvssScore ? String(node.cvssScore) : "N/A", path: "cvssScore" },
      { section: "Core Identifiers", key: "Last Active", value: node.lastActive, path: "lastActive" }
    );

    // 2. Hashes
    if (node.hashes) {
      Object.entries(node.hashes).forEach(([k, v]) => {
        if (v) sections["Hashes & Signatures"].push({ section: "Hashes", key: k.toUpperCase(), value: String(v), path: `hashes.${k}` });
      });
    }

    // 3. Network
    if (node.network) {
      Object.entries(node.network).forEach(([k, v]) => {
        if (v) sections["Network & ISP ASN"].push({ section: "Network", key: k, value: String(v), path: `network.${k}` });
      });
    }

    // 4. Telephony
    if (node.telephony) {
      Object.entries(node.telephony).forEach(([k, v]) => {
        if (v) sections["Telephony & Hardware ID"].push({ section: "Telephony", key: k, value: String(v), path: `telephony.${k}` });
      });
    }

    // 5. Geo
    if (node.geo) {
      Object.entries(node.geo).forEach(([k, v]) => {
        if (v) sections["Geo-Telemetry"].push({ section: "Geo", key: k, value: String(v), path: `geo.${k}` });
      });
    }

    // 6. Legal
    if (node.legal) {
      Object.entries(node.legal).forEach(([k, v]) => {
        if (v) sections["Statutory & Penal Linking"].push({ section: "Legal", key: k, value: String(v), path: `legal.${k}` });
      });
    }

    // 7. Extra / Unknown dynamic nested keys
    const standardKeys = new Set([
      "id",
      "type",
      "title",
      "subtitle",
      "identifier",
      "threatLevel",
      "cvssScore",
      "status",
      "lastActive",
      "xPercent",
      "yPercent",
      "degreeCount",
      "caseRef",
      "hashes",
      "network",
      "telephony",
      "geo",
      "legal",
      "hexDump",
      "extraMeta",
      "x",
      "y",
      "vx",
      "vy",
      "fx",
      "fy",
      "index",
    ]);

    if (node.extraMeta) {
      Object.entries(node.extraMeta).forEach(([k, v]) => {
        sections["Extended Metadata"].push({ section: "Extra", key: k, value: String(v), path: `extraMeta.${k}` });
      });
    }

    Object.entries(node).forEach(([k, v]) => {
      if (!standardKeys.has(k) && v !== undefined && v !== null) {
        if (typeof v === "object") {
          Object.entries(v).forEach(([nestedK, nestedV]) => {
            sections["Extended Metadata"].push({
              section: "Extra",
              key: `${k}.${nestedK}`,
              value: typeof nestedV === "object" ? JSON.stringify(nestedV) : String(nestedV),
              path: `${k}.${nestedK}`,
            });
          });
        } else {
          sections["Extended Metadata"].push({ section: "Extra", key: k, value: String(v), path: k });
        }
      }
    });

    // Remove empty sections
    return Object.fromEntries(Object.entries(sections).filter(([_, list]) => list.length > 0));
  };

  if (!isOpen) return null;

  if (!selectedNode) {
    return (
      <aside className="w-96 border-l border-border-subtle bg-surface-card flex flex-col justify-center items-center shrink-0 z-40 p-6 text-center text-text-muted font-mono text-xs select-none">
        <Terminal className="w-8 h-8 text-text-muted mb-2 opacity-50" />
        <div className="font-bold text-text-secondary uppercase">No Entity Selected</div>
        <p className="text-[10px] text-text-muted mt-1">
          Click any node on the force graph or query bar to slide open detailed forensic inspection telemetry.
        </p>
      </aside>
    );
  }

  const threat = getThreatBadge(selectedNode.threatLevel, selectedNode.cvssScore);
  const groupedProps = extractNestedProperties(selectedNode);

  return (
    <aside className="w-96 border-l border-border-subtle bg-surface-card flex flex-col justify-between shrink-0 z-40 overflow-hidden font-mono select-none transition-all duration-200">
      {/* ================= DRAWER HEADER ================= */}
      <div className="p-3 border-b border-border-subtle bg-surface-overlay shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-threat-crimson status-pulse" />
            <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
              NODE INSPECTOR
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[9px] px-1.5 py-0.5 border font-bold ${threat.badgeClass}`}>
              {threat.text}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-text-muted hover:text-text-primary text-xs cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Node Title & Primary Copy */}
        <div className="text-sm font-bold text-threat-crimson tracking-tight break-all flex items-center justify-between gap-2">
          <span className="truncate">{selectedNode.identifier || selectedNode.title}</span>
          <button
            type="button"
            onClick={() => handleCopy(selectedNode.title, "node-title")}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Copy Identifier"
          >
            {copiedKey === "node-title" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Status & Last Active */}
        <div className="text-[10px] text-text-muted mt-1 flex items-center justify-between">
          <span>Last Active: {selectedNode.lastActive}</span>
          <span
            className={
              selectedNode.status === "ACTIVE"
                ? "text-emerald-400 font-bold"
                : selectedNode.status === "QUARANTINED"
                ? "text-threat-crimson font-bold"
                : "text-record-amber font-bold"
            }
          >
            STATUS: {selectedNode.status}
          </span>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="mt-2 px-2 py-1 bg-telecom-cyan-dim/80 border border-telecom-cyan text-telecom-cyan text-[10px] font-bold">
            ✓ {actionNotice}
          </div>
        )}

        {/* ================= QUICK ACTIONS TOOLBAR ================= */}
        {/* Row 1: Focus Node & Copy Node JSON (Directly requested in Phase 2) */}
        <div className="grid grid-cols-2 gap-1.5 mt-2.5">
          <button
            type="button"
            onClick={() => {
              triggerAction("CAMERA FOCUSED ON NODE", () => onFocusNode?.(selectedNode.id));
            }}
            className="px-2 py-1 bg-border-subtle hover:bg-border-highlight text-telecom-cyan border border-telecom-cyan/50 font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            title="Center and zoom graph camera on this node"
          >
            <Crosshair className="w-3 h-3 text-telecom-cyan" />
            <span>Focus Node</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="px-2 py-1 bg-surface-card hover:bg-border-subtle border border-border-subtle text-text-primary font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            title="Copy complete node JSON payload"
          >
            {copiedKey === "node-json" ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <FileCode className="w-3 h-3 text-record-amber" />
            )}
            <span>Copy Node JSON</span>
          </button>
        </div>

        {/* Row 2: Forensic Actions */}
        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
          <button
            type="button"
            onClick={() =>
              triggerAction(`QUARANTINE_${selectedNode.id}`, () =>
                onQuarantine?.(selectedNode.id)
              )
            }
            className="px-2 py-1 bg-threat-crimson hover:bg-red-600 text-bg-base font-bold text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
          >
            <Ban className="w-3 h-3" />
            <span>Quarantine IP</span>
          </button>

          <button
            type="button"
            onClick={() =>
              triggerAction(`PIVOT_${selectedNode.id}`, () => onPivot?.(selectedNode.id))
            }
            className="px-2 py-1 bg-surface-card hover:bg-border-subtle border border-border-subtle text-text-primary text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
          >
            <Share2 className="w-3 h-3 text-telecom-cyan" />
            <span>Pivot Node</span>
          </button>

          <button
            type="button"
            onClick={() =>
              triggerAction(`SUBPOENA_${selectedNode.id}`, () =>
                onGenerateSubpoena?.(selectedNode.id)
              )
            }
            className="px-2 py-1 bg-surface-card hover:bg-border-subtle border border-border-subtle text-text-primary text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
          >
            <Gavel className="w-3 h-3 text-record-amber" />
            <span>Generate Subpoena</span>
          </button>

          <button
            type="button"
            onClick={() =>
              triggerAction(`CASE_LINKED_${selectedNode.id}`, () =>
                onAddToCase?.(selectedNode.id)
              )
            }
            className="px-2 py-1 bg-surface-card hover:bg-border-subtle border border-border-subtle text-text-primary text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
          >
            <BookmarkPlus className="w-3 h-3 text-accused-violet" />
            <span>Add to Case</span>
          </button>
        </div>
      </div>

      {/* ================= DYNAMIC NESTED 2-COLUMN MONOSPACE TABLES ================= */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0 divide-y divide-border-subtle text-xs">
        {Object.entries(groupedProps).map(([sectionTitle, propsList]) => (
          <div key={sectionTitle}>
            <div className="bg-surface-overlay/80 px-3 py-1.5 text-[10px] uppercase font-bold text-text-secondary flex justify-between items-center tracking-wider">
              <span>{sectionTitle}</span>
              <Layers className="w-3 h-3 text-text-muted" />
            </div>
            <table className="w-full text-[10px] font-mono border-collapse">
              <tbody>
                {propsList.map((item) => (
                  <tr
                    key={item.path}
                    className="border-b border-border-subtle hover:bg-surface-overlay/40 group transition-colors"
                  >
                    <td className="p-2 text-text-muted w-28 border-r border-border-subtle bg-bg-base/40 truncate">
                      {item.key}
                    </td>
                    <td className="p-2 text-text-primary flex items-center justify-between font-mono break-all">
                      <span className="truncate max-w-[200px]" title={item.value}>
                        {item.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.value, item.path)}
                        className="text-text-muted group-hover:text-text-primary ml-1 opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                        title={`Copy Value: ${item.key}`}
                      >
                        {copiedKey === item.path ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* ================= COLLAPSIBLE RAW PACKET HEX DUMP ================= */}
      {selectedNode.hexDump && (
        <div className="border-t border-border-subtle bg-bg-base shrink-0">
          <div
            onClick={() => setHexOpen(!hexOpen)}
            className="px-3 py-1.5 bg-surface-overlay flex items-center justify-between border-b border-border-subtle cursor-pointer text-[10px] font-bold text-text-muted hover:text-text-primary transition-colors"
          >
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Terminal className="w-3.5 h-3.5 text-telecom-cyan" />
              <span>RAW PACKET HEX DUMP</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const hexText = selectedNode.hexDump!
                    .map((r) => `${r.offset}: ${r.bytesHex1} ${r.bytesHex2} ${r.ascii}`)
                    .join("\n");
                  handleCopy(hexText, "raw-hex");
                }}
                className="text-text-muted hover:text-text-primary cursor-pointer"
                title="Copy Raw Bytes"
              >
                {copiedKey === "raw-hex" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              {hexOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </div>
          </div>

          {hexOpen && (
            <div className="p-2 font-mono text-[9px] text-text-secondary leading-tight bg-bg-base overflow-x-auto select-text max-h-24 custom-scrollbar">
              {selectedNode.hexDump.map((row, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-text-muted select-none">{row.offset}:</span>
                  <span className={row.threatOffset ? "text-threat-crimson" : "text-telecom-cyan"}>
                    {row.bytesHex1}
                  </span>
                  <span className={row.threatOffset ? "text-record-amber" : "text-text-secondary"}>
                    {row.bytesHex2}
                  </span>
                  <span className="text-text-muted">{row.ascii}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
