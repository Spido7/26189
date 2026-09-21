"use client";

import React, { useState } from "react";
import {
  X,
  Link2,
  FileCheck,
  Shield,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Database,
} from "lucide-react";
import { DFIRRelationship } from "@/types/relationship";

interface EdgeInspectorDrawerProps {
  relationship: (DFIRRelationship & { sourceNodeName?: string; targetNodeName?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EdgeInspectorDrawer: React.FC<EdgeInspectorDrawerProps> = ({
  relationship,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !relationship) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <aside className="fixed top-10 right-0 bottom-6 w-full sm:w-96 md:w-[420px] bg-zinc-950/98 backdrop-blur-xl border-l border-border-subtle z-40 flex flex-col font-mono text-zinc-300 select-none shadow-2xl transition-transform duration-300">
      {/* Header */}
      <div className="p-3 border-b border-border-subtle bg-surface-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <Link2 className="w-4 h-4 text-telecom-cyan shrink-0" />
          <div>
            <div className="text-xs font-bold text-text-primary tracking-wider uppercase truncate">
              RELATIONSHIP INSPECTION
            </div>
            <div className="text-[10px] text-text-muted">
              CORRELATION ID: {relationship.id}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-surface-overlay text-text-muted hover:text-text-primary border border-border-subtle cursor-pointer transition-colors"
          title="Close Edge Inspector"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {/* Node A -> Node B Diagram */}
        <div className="p-3 bg-surface-card/60 border border-border-subtle text-center">
          <div className="text-[10px] text-text-muted uppercase mb-1">SOURCE ENTITY</div>
          <div className="text-xs font-bold text-text-primary bg-bg-base p-1.5 border border-border-highlight">
            {relationship.sourceNodeName || relationship.sourceEntityId}
          </div>

          <div className="my-2 flex flex-col items-center">
            <span className="text-[9px] px-2 py-0.5 bg-telecom-cyan-dim text-telecom-cyan border border-telecom-cyan/40 font-bold uppercase">
              {relationship.label || relationship.category}
            </span>
            <div className="w-[1px] h-4 bg-telecom-cyan/50 my-0.5" />
            <span className="text-[9px] text-text-muted">CONFIDENCE: {relationship.confidence}%</span>
          </div>

          <div className="text-[10px] text-text-muted uppercase mb-1">TARGET ENTITY</div>
          <div className="text-xs font-bold text-text-primary bg-bg-base p-1.5 border border-border-highlight">
            {relationship.targetNodeName || relationship.targetEntityId}
          </div>
        </div>

        {/* Provenance & Origin */}
        <div className="space-y-3 text-xs">
          <div>
            <div className="text-[10px] uppercase text-text-muted mb-1">DATA ORIGIN / PROVENANCE</div>
            <div className="p-2 bg-surface-overlay border border-border-subtle flex items-center justify-between">
              <span className="font-bold text-emerald-400">
                {relationship.provenance.replace(/_/g, " ")}
              </span>
              <span className="text-[9px] bg-emerald-950/80 text-emerald-400 px-1 py-0.2 border border-emerald-500/40">
                VERIFIED
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase text-text-muted mb-1">EVIDENCE REFERENCE</div>
            <div className="p-2 bg-surface-overlay border border-border-subtle font-mono text-[11px] leading-relaxed">
              <div className="text-text-primary font-medium">{relationship.sourceDescription}</div>
              {relationship.evidenceRefId && (
                <div className="text-[10px] text-telecom-cyan mt-1 flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  <span>REF: {relationship.evidenceRefId}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase text-text-muted mb-1">LEGAL AUTHORIZATION CONTEXT</div>
            <div className="p-2 bg-surface-overlay border border-border-subtle text-[11px] text-record-amber font-mono">
              {relationship.authorizationContext || "CrPC Section 91 Lawful Production Order Dispatched"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] uppercase text-text-muted mb-1">FIRST OBSERVED</div>
              <div className="p-2 bg-surface-overlay border border-border-subtle text-[10px] text-text-secondary">
                {relationship.firstObserved || "2026-08-14 14:20 IST"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-text-muted mb-1">LAST OBSERVED</div>
              <div className="p-2 bg-surface-overlay border border-border-subtle text-[10px] text-text-secondary">
                {relationship.lastObserved || "2026-08-14 17:45 IST"}
              </div>
            </div>
          </div>

          {/* Quick Copy Cypher Query */}
          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  `MATCH (a {id: "${relationship.sourceEntityId}"}), (b {id: "${relationship.targetEntityId}"})\nMATCH (a)-[r:${relationship.category}]->(b)\nRETURN a, r, b;`
                )
              }
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-surface-overlay hover:bg-border-subtle border border-border-subtle text-purple-300 hover:text-purple-100 text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Database className="w-3.5 h-3.5 text-purple-400" />}
              <span>{copied ? "Cypher Copied to Clipboard" : "Copy Cypher Edge Match"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border-subtle bg-surface-card flex items-center justify-between text-[9px] text-text-muted shrink-0">
        <span>RELATIONSHIP INTEGRITY: CRYPTO LINKED</span>
        <span className="text-emerald-400 font-bold">ACTIVE IN GRAPH</span>
      </div>
    </aside>
  );
};
