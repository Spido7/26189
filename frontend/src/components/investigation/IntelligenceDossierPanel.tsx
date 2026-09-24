"use client";

import React, { useState } from "react";
import { InvestigationNode, InvestigationEdge } from "@/lib/graph-engine";
import {
  X,
  Copy,
  Check,
  Crosshair,
  User,
  Radio,
  FileText,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Link2,
  ExternalLink,
  ChevronRight,
  Database,
  Terminal,
  Activity,
  FolderOpen,
  ArrowRight,
  ChevronDown,
  Layers,
  FileCheck,
} from "lucide-react";
import { CaseInvestigation } from "@/types/case";

interface IntelligenceDossierPanelProps {
  selectedNode: InvestigationNode | null;
  selectedEdge: InvestigationEdge | null;
  activeCase: CaseInvestigation;
  allNodes: InvestigationNode[];
  allEdges: InvestigationEdge[];
  onClose: () => void;
  onFocusNode: (nodeId: string) => void;
  onSelectNode: (node: InvestigationNode | null) => void;
  onSelectEdge: (edge: InvestigationEdge | null) => void;
  isOpen: boolean;
}

type NodeTab = "identity" | "relations" | "provenance" | "seizures";

export const IntelligenceDossierPanel: React.FC<IntelligenceDossierPanelProps> = ({
  selectedNode,
  selectedEdge,
  activeCase,
  allNodes,
  allEdges,
  onClose,
  onFocusNode,
  onSelectNode,
  onSelectEdge,
  isOpen,
}) => {
  const [activeTab, setActiveTab] = useState<NodeTab>("identity");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSourceModal, setShowSourceModal] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  if (!isOpen) return null;

  // Filter edges connected to the selected node
  const connectedEdges = selectedNode
    ? allEdges.filter((e) => {
        const s = typeof e.source === "object" ? e.source.id : e.source;
        const t = typeof e.target === "object" ? e.target.id : e.target;
        return s === selectedNode.id || t === selectedNode.id;
      })
    : [];

  return (
    <aside className="w-80 md:w-96 border-l border-slate-700/50 bg-[#0e1117] flex flex-col shrink-0 z-40 text-xs font-mono select-none overflow-hidden shadow-2xl">
      {/* 1. Header Bar */}
      <div className="p-3 border-b border-slate-700/50 bg-[#13171e] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-slate-100 uppercase tracking-wider truncate">
              {selectedNode
                ? selectedNode.name
                : selectedEdge
                ? "RELATIONSHIP PROVENANCE"
                : "INVESTIGATION DOSSIER"}
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              {selectedNode
                ? `${selectedNode.category} · ${selectedNode.caseRef}`
                : selectedEdge
                ? `ID: ${selectedEdge.id}`
                : activeCase.caseNumber}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedNode && (
            <button
              type="button"
              onClick={() => onFocusNode(selectedNode.id)}
              className="p-1 hover:bg-[#1c2432] text-slate-400 hover:text-amber-300 rounded-sm border border-slate-700/40 cursor-pointer"
              title="Focus in Canvas"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#1c2432] text-slate-400 hover:text-slate-200 rounded-sm border border-slate-700/40 cursor-pointer"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. CASE DOSSIER STATE (No Selection) */}
      {!selectedNode && !selectedEdge && (
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
          <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-2 machined-panel">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-amber-400 font-bold font-mono">{activeCase.id}</span>
              <span className="px-1.5 py-0.2 bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-[8px]">
                {activeCase.priority}
              </span>
            </div>
            <h2 className="text-xs font-bold text-slate-100 leading-snug">{activeCase.title}</h2>
            <div className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-700/40">
              {activeCase.summary}
            </div>
          </div>

          {/* Lead Investigator Credentials */}
          <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-1.5 text-[10px]">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
              LEAD INVESTIGATING OFFICER
            </span>
            <div className="text-slate-100 font-bold flex items-center justify-between">
              <span>{activeCase.leadInvestigator.name}</span>
              <span className="text-amber-400 font-mono">[{activeCase.leadInvestigator.badge}]</span>
            </div>
            <div className="text-slate-400 text-[9px]">{activeCase.leadInvestigator.division}</div>
          </div>

          {/* Connected Kingpins Leaderboard */}
          <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
              IDENTIFIED SYNDICATE OPERATIVES ({allNodes.filter((n) => n.category === "PERSON").length})
            </span>
            <div className="space-y-1.5">
              {allNodes
                .filter((n) => n.category === "PERSON")
                .map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => onSelectNode(person)}
                    className="w-full text-left p-2 rounded-sm bg-[#161c26] hover:bg-[#1e2634] border border-slate-800 text-[10px] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{person.name}</div>
                      <div className="text-[9px] text-slate-400">{person.details}</div>
                    </div>
                    <span className="text-red-400 font-bold font-mono">{person.riskScore}% RISK</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Tip to investigator */}
          <div className="p-2.5 bg-blue-950/20 border border-blue-500/30 rounded-sm text-blue-200/90 text-[10px] flex items-start gap-2">
            <Activity className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>Click any node on the graph canvas to inspect its biometrics, telemetry, and verified source documents.</span>
          </div>
        </div>
      )}

      {/* 3. RELATIONSHIP SELECTED STATE */}
      {selectedEdge && !selectedNode && (
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
          <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-3 machined-panel">
            <div className="text-[10px] uppercase font-bold text-slate-400">CORRELATION LINK</div>
            <div className="p-2 bg-[#161c26] border border-slate-800 rounded-sm space-y-2 text-center">
              <div className="text-xs font-bold text-slate-200">
                {typeof selectedEdge.source === "object" ? selectedEdge.source.name : selectedEdge.source}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  {selectedEdge.label} ({selectedEdge.confidence}%)
                </span>
                <div className="w-[1px] h-3 bg-amber-500/40 my-0.5" />
              </div>
              <div className="text-xs font-bold text-slate-200">
                {typeof selectedEdge.target === "object" ? selectedEdge.target.name : selectedEdge.target}
              </div>
            </div>
          </div>

          {/* Evidentiary Provenance */}
          <div className="space-y-3 text-[10px]">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                EVIDENTIARY ORIGIN
              </span>
              <div className="p-2.5 bg-[#13171e] rounded-sm border border-slate-700/50 flex justify-between items-center">
                <span className="font-bold text-emerald-400">{selectedEdge.provenance.replace(/_/g, " ")}</span>
                <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 border border-emerald-500/40 font-bold">
                  VERIFIED
                </span>
              </div>
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                SUPPORTING RECORD
              </span>
              <div className="p-2.5 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-1">
                <div className="text-slate-200 font-medium leading-relaxed">{selectedEdge.sourceDescription}</div>
                <div className="text-sky-400 text-[9px] pt-1 border-t border-slate-800 flex items-center gap-1 font-bold">
                  <FileCheck className="w-3 h-3" />
                  <span>REF: {selectedEdge.evidenceRef}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                STATUTORY LEGAL CONTEXT
              </span>
              <div className="p-2.5 bg-[#13171e] rounded-sm border border-amber-500/30 text-amber-300 leading-relaxed font-bold">
                {selectedEdge.authorizationContext}
              </div>
            </div>

            {/* Cypher Match Button */}
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  `MATCH (a {id: "${typeof selectedEdge.source === "object" ? selectedEdge.source.id : selectedEdge.source}"})-[r:${selectedEdge.type}]->(b {id: "${typeof selectedEdge.target === "object" ? selectedEdge.target.id : selectedEdge.target}"}) RETURN a, r, b;`,
                  "cypher"
                )
              }
              className="w-full py-2 bg-[#161c26] hover:bg-[#1f2734] border border-slate-700/60 text-slate-300 hover:text-amber-300 rounded-sm text-[10px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {copiedKey === "cypher" ? <Check className="w-3 h-3 text-emerald-400" /> : <Database className="w-3 h-3" />}
              <span>{copiedKey === "cypher" ? "CYPHER MATCH COPIED" : "COPY CYPHER RELATION QUERY"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. ENTITY SELECTED STATE (4 Tabs) */}
      {selectedNode && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs Navigation Header */}
          <div className="flex items-center border-b border-slate-700/50 bg-[#12161f] shrink-0 text-[10px]">
            {[
              { id: "identity", label: "IDENTITY", icon: User },
              { id: "relations", label: "LINKS", icon: Link2 },
              { id: "provenance", label: "PROVENANCE", icon: FileCheck },
              { id: "seizures", label: "SEIZURES", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as NodeTab)}
                  className={`flex-1 py-2 text-center font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer border-b-2 ${
                    isActive
                      ? "border-amber-400 text-amber-300 bg-[#161c26]"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Body */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
            {/* TAB A: IDENTITY & ATTRIBUTES */}
            {activeTab === "identity" && (
              <div className="space-y-3 text-[10px]">
                {/* Risk Gauge Bar */}
                <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-1.5 machined-panel">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-400 uppercase">AI THREAT SCORE</span>
                    <span className={selectedNode.riskScore > 85 ? "text-red-400" : "text-sky-400"}>
                      {selectedNode.riskScore}% CONFIRMED
                    </span>
                  </div>
                  <div className="w-full bg-[#0c0e12] h-1.5 rounded-none border border-slate-800">
                    <div
                      className={`h-full ${selectedNode.riskScore > 85 ? "bg-red-500" : "bg-sky-400"}`}
                      style={{ width: `${selectedNode.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Demographics */}
                <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="uppercase font-bold">AADHAAR ID REF</span>
                    <span className="text-amber-400 font-bold">[Aadhaar Redacted]</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">FULL LEGAL NAME</span>
                    <div className="text-slate-100 font-bold text-xs">{selectedNode.name}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">ALIAS / HANDLE</span>
                    <div className="text-sky-300 font-bold">
                      {selectedNode.metadata.demographics?.alias || "Suspect Persona"}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">OCCUPATION / ROLE</span>
                    <div className="text-slate-200">{selectedNode.details}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">KNOWN ASSOCIATES</span>
                    <div className="text-slate-300">
                      {selectedNode.metadata.demographics?.knownAssociates || "Rahul Desai, Amit Singh"}
                    </div>
                  </div>
                </div>

                {/* Network / Hardware attributes */}
                {selectedNode.metadata.network && (
                  <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      NETWORK INTERFACE
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IP ADDRESS:</span>
                      <span className="text-sky-300 font-bold font-mono">
                        {selectedNode.metadata.network.ip || selectedNode.name}
                      </span>
                    </div>
                    {selectedNode.metadata.network.mac && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">HARDWARE MAC:</span>
                        <span className="text-slate-200 font-mono">{selectedNode.metadata.network.mac}</span>
                      </div>
                    )}
                    {selectedNode.metadata.network.asnOrg && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">ASN / ISP:</span>
                        <span className="text-slate-200">{selectedNode.metadata.network.asnOrg}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Telecom attributes */}
                {selectedNode.metadata.telecom && (
                  <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      TELECOM MSISDN
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-400">PHONE NUMBER:</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {selectedNode.metadata.telecom.phone || selectedNode.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IMEI IDENTIFIER:</span>
                      <span className="text-slate-200 font-mono">{selectedNode.metadata.telecom.imei}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">BTS TOWER:</span>
                      <span className="text-slate-200">{selectedNode.metadata.telecom.towerLocation}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB B: RELATIONSHIPS & NEIGHBORS */}
            {activeTab === "relations" && (
              <div className="space-y-2 text-[10px]">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  CONNECTED EDGES ({connectedEdges.length})
                </div>

                {connectedEdges.map((edge) => {
                  const s = typeof edge.source === "object" ? edge.source.id : edge.source;
                  const t = typeof edge.target === "object" ? edge.target.id : edge.target;
                  const isSource = s === selectedNode.id;
                  const otherId = isSource ? t : s;
                  const otherNode = allNodes.find((n) => n.id === otherId);

                  return (
                    <div
                      key={edge.id}
                      className="p-2.5 rounded-sm bg-[#13171e] border border-slate-800 space-y-1.5 hover:border-slate-700"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-amber-400 font-bold font-mono text-[9px]">
                          {edge.label}
                        </span>
                        <span className="text-emerald-400 font-bold">{edge.confidence}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-200 font-bold truncate max-w-[180px]">
                          {otherNode?.name || otherId}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (otherNode) onSelectNode(otherNode);
                            onFocusNode(otherId);
                          }}
                          className="px-2 py-0.5 bg-[#1c2432] hover:bg-[#253042] text-amber-300 border border-slate-700/60 rounded-xs text-[9px] font-bold cursor-pointer"
                        >
                          FOCUS →
                        </button>
                      </div>

                      <div className="text-[9px] text-slate-400 truncate">{edge.sourceDescription}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB C: EVIDENTIARY PROVENANCE */}
            {activeTab === "provenance" && (
              <div className="space-y-3 text-[10px]">
                <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                    SOURCE DATA PROVENANCE
                  </span>
                  <div className="p-2 bg-[#161c26] rounded-sm border border-slate-800 space-y-1 font-mono">
                    <div className="text-slate-200 font-bold">CASE DOSSIER: {selectedNode.caseRef}</div>
                    <div className="text-sky-300">SYNDICATE: {selectedNode.syndicate}</div>
                    <div className="text-emerald-400">FIRST LOGGED: {selectedNode.timestamp}</div>
                  </div>
                </div>

                <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                    STATUTORY BACKING
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Data originated from official First Information Report register and Section 91 CrPC ISP lease
                    records. Biometric Aadhaar references are legally redacted under UIDAI regulations.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSourceModal(true)}
                    className="w-full py-1.5 bg-[#161c26] hover:bg-[#202836] border border-amber-500/40 text-amber-300 font-bold rounded-sm flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>VIEW VERIFIED SOURCE DOCUMENT</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB D: SEIZURES & CDRS */}
            {activeTab === "seizures" && (
              <div className="space-y-3 text-[10px]">
                <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                    PHYSICAL SEIZURE PANCHNAMA
                  </span>
                  <div className="p-2 bg-[#161c26] rounded-sm border border-slate-800 space-y-1">
                    <div className="text-slate-200 font-bold">Panchnama #084 // Seized Safehouse</div>
                    <div className="text-slate-400 text-[9px]">Wi-Fi Router &amp; 14 Burner SIM Cards</div>
                    <div className="text-emerald-400 text-[9px] font-mono">SEAL: SHA256 VALIDATED</div>
                  </div>
                </div>

                <div className="p-3 bg-[#13171e] rounded-sm border border-slate-700/50 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                    CDR CONFERENCE CORRELATION
                  </span>
                  <div className="p-2 bg-[#161c26] rounded-sm border border-slate-800 space-y-1">
                    <div className="text-slate-200 font-bold">14m 22s Conference Call</div>
                    <div className="text-slate-400 text-[9px]">Coincides with ₹18.4L mule transfer</div>
                    <div className="text-amber-400 text-[9px] font-mono">BTS: Andheri East Sector-4</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Verified Source Document Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
          <div className="w-full max-w-lg bg-[#13171e] border border-amber-500/40 rounded-sm p-4 shadow-2xl space-y-3 text-slate-200 machined-panel">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
              <span className="font-bold text-amber-400 uppercase text-xs">
                OFFICIAL SOURCE DOCUMENT // CERTIFIED COPY
              </span>
              <button
                type="button"
                onClick={() => setShowSourceModal(false)}
                className="text-slate-400 hover:text-slate-100 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#0c0e12] border border-slate-800 space-y-2 text-[11px] leading-relaxed">
              <div className="text-slate-100 font-bold">
                DOCUMENT: State Police Criminal Register // FIR-0104/2026
              </div>
              <div className="text-slate-400 text-[10px]">
                LEDGER HASH: SHA256:8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4
              </div>
              <p className="text-slate-300 italic">
                "Syndicate operated unauthorized mule bank networks executing multi-crore phishing scams through fake
                electricity bill APKs, rogue SMS gateways, and SIM swap redirection."
              </p>
              <div className="text-amber-300 text-[10px] font-bold">
                SEAL: CERTIFIED DIGITAL SEAL // CHIEF METROPOLITAN MAGISTRATE
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSourceModal(false)}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs cursor-pointer rounded-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
