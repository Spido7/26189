"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Crosshair,
  FileCode,
  Terminal,
  Database,
  User,
  FileText,
  PhoneCall,
  Lock,
} from "lucide-react";
import { RadarNode, PersonalInfo, FIRDetails, CDRDetails } from "@/types/radar";
import { StreamNode } from "@/types/stream";

interface DetailDrawerProps {
  selectedNode: (RadarNode | StreamNode) | null;
  isOpen: boolean;
  onClose: () => void;
  onFocusNode?: (nodeId: string) => void;
  flaggedNodes?: RadarNode[];
  onSelectNode?: (node: RadarNode) => void;
}

type TabType = "personal" | "fir" | "cdr";

// Fallback resolver ensuring all 3 forensic tabs have rich Indian context dummy values
function resolveNodeForensics(node: RadarNode | StreamNode) {
  const isThreat =
    node.state === "FLAGGED" ||
    node.stage === "FLAGGED" ||
    node.flagged;

  const personalInfo: PersonalInfo = node.personalInfo || {
    aadharVoterId: "[Aadhaar Redacted]",
    fullName: node.name || node.accusedName || "Vikram Sharma",
    demography: {
      text: "34, Male, Andheri East, Mumbai, Maharashtra",
      age: 34,
      sex: "Male",
      location: "Andheri East, Mumbai, Maharashtra",
    },
    contactDetails: {
      phone: "+91 98250 XXXXX",
      email: "vikram.s@proton.me",
      altPhone: "+91 98111 XXXXX",
    },
    occupation: "Hawala Operator / Mule Account Manager",
    syndicateAffiliation: "Jamtara Phishing Syndicate",
    nexusAffiliation: "Jamtara Phishing Syndicate",
    knownAssociates: "Rahul Desai, Amit Singh",
  };

  const firDetails: FIRDetails = node.firDetails || {
    firId: "0104/2026",
    firDate: "2026-08-14 18:30 IST",
    policeStation: "Cyber Crime Police Station, BKC, Mumbai",
    crpcSection: "BNS 318(4) [Cheating], IT Act Sec 66D",
    crpcBnsSection: "BNS 318(4) [Cheating], IT Act Sec 66D",
    statusOfCharges: "Non-Bailable Warrant Issued",
    accusedList: "Vikram Sharma, Rahul Desai, Amit Singh",
    firCopy: {
      documentNumber: "E-FIR-MH-BKC-0104/2026",
      filingOfficer: "PI S. R. Kulkarni (BKC Cyber Cell)",
      ledgerHash: "SHA256:8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      summaryText: "Syndicate operated unauthorized mule bank networks executing multi-crore phishing scams through fake electricity bill APKs and SIM swap redirection.",
      certifiedSeal: "MAHARASHTRA POLICE // STATE CYBER CRIME LEDGER",
    },
  };

  const cdrDetails: CDRDetails = node.cdrDetails || {
    targetId: "+91 98250 XXXXX",
    callerIdNumber: "+91 98250 XXXXX",
    receiverIdNumber: "+91 99887 XXXXX",
    callTypeAndDuration: "VoLTE Voice / 14m 22s",
    towerLocation: "Mumbai-Bandra-Sector-4 (19.0596° N, 72.8295° E)",
    records: [
      {
        direction: "OUTGOING",
        caller: "+91 98250 XXXXX",
        receiver: "+91 99887 XXXXX",
        callType: "OUTGOING",
        duration: "14m 22s",
        tower: "Cell: 404-20-1192",
        timestamp: "2026-08-14 17:45:10 IST",
      },
      {
        direction: "INCOMING",
        caller: "+91 98250 XXXXX",
        receiver: "+91 91223 XXXXX",
        callType: "INCOMING",
        duration: "02m 05s",
        tower: "Cell: 404-20-1192",
        timestamp: "2026-08-14 16:12:00 IST",
      },
      {
        direction: "OUTGOING",
        caller: "+91 98250 XXXXX",
        receiver: "+91 98111 XXXXX",
        callType: "OUTGOING",
        duration: "45m 10s",
        tower: "Cell: 404-20-1194",
        timestamp: "2026-08-14 14:20:44 IST",
      },
    ],
  };

  return { personalInfo, firDetails, cdrDetails, isThreat };
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  selectedNode,
  isOpen,
  onClose,
  onFocusNode,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [copiedCypher, setCopiedCypher] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCopyJson = () => {
    if (!selectedNode) return;
    navigator.clipboard.writeText(JSON.stringify(selectedNode, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1500);
  };

  const handleCopyCypher = () => {
    if (!selectedNode) return;
    const threat = selectedNode.threatType || selectedNode.crimeType || "SYNDICATE_OPERATIVE";
    const accused = selectedNode.accusedName || selectedNode.name
      ? `name: "${(selectedNode.name || selectedNode.accusedName || "").replace(/"/g, '\\"')}", `
      : "";
    const cypher = `MERGE (n:ThreatEntity {id: "${selectedNode.id}"})\nSET n += {\n  ip: "${selectedNode.ip}",\n  mac: "${selectedNode.mac}",\n  subnet: "${selectedNode.subnet}",\n  threatType: "${threat}",\n  confidence: ${selectedNode.confidence || 98.6},\n  ${accused}timestamp: "${selectedNode.timestamp}"\n}\nRETURN n;`;
    navigator.clipboard.writeText(cypher);
    setCopiedCypher(true);
    setTimeout(() => setCopiedCypher(false), 1500);
  };

  if (!isOpen || !selectedNode) return null;

  const { personalInfo, firDetails, cdrDetails, isThreat } = resolveNodeForensics(selectedNode);

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "personal", label: "PERSONAL", icon: User },
    { id: "fir", label: "FIR", icon: FileText },
    { id: "cdr", label: "CDR", icon: PhoneCall },
  ];

  return (
    <aside
      id="sleek-node-inspector-drawer"
      className="fixed top-10 right-0 bottom-0 w-full sm:w-96 md:w-[400px] bg-zinc-950/98 backdrop-blur-xl border-l border-border-subtle z-40 flex flex-col font-mono text-zinc-300 select-none shadow-2xl transition-all duration-300 transform translate-x-0"
    >
      {/* ================= HEADER BAR ================= */}
      <div className="p-3 border-b border-border-subtle bg-surface-card flex items-center justify-between shrink-0">
        {/* Left: Title & Threat Indicator */}
        <div className="flex items-center gap-2 overflow-hidden">
          <Terminal className="w-4 h-4 text-telecom-cyan shrink-0" />
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-text-primary tracking-wider uppercase truncate">
                {selectedNode.name || selectedNode.accusedName || selectedNode.id}
              </span>
              <span
                className={`text-[9px] px-1 py-0.2 font-bold uppercase tracking-wider border shrink-0 ${
                  isThreat
                    ? "bg-red-950/80 border-red-500/60 text-red-400"
                    : "bg-cyan-950/80 border-cyan-500/60 text-cyan-400"
                }`}
              >
                {isThreat ? "SYNDICATE" : "NODE"}
              </span>
            </div>
            <div className="text-[10px] text-text-muted truncate">
              {selectedNode.ip} · {selectedNode.location || (typeof personalInfo.demography === "object" ? personalInfo.demography.location : personalInfo.demography)}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions & Close */}
        <div className="flex items-center gap-1 shrink-0">
          {onFocusNode && (
            <button
              type="button"
              onClick={() => onFocusNode(selectedNode.id)}
              className="p-1 hover:bg-surface-overlay text-text-muted hover:text-telecom-cyan border border-border-subtle cursor-pointer transition-colors"
              title="Focus node on canvas"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyCypher}
            className="p-1 hover:bg-surface-overlay text-text-muted hover:text-purple-400 border border-border-subtle cursor-pointer transition-colors"
            title="Copy Cypher Query"
          >
            {copiedCypher ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Database className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="p-1 hover:bg-surface-overlay text-text-muted hover:text-amber-400 border border-border-subtle cursor-pointer transition-colors"
            title="Copy JSON"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-surface-overlay text-text-muted hover:text-text-primary border border-border-subtle cursor-pointer transition-colors ml-0.5"
            title="Close Drawer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ================= TABBED NAVIGATION BAR ================= */}
      <div className="flex items-center border-b border-border-subtle bg-bg-base/80 px-2 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-1 text-center text-[10px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? "border-b-2 border-zinc-100 text-zinc-100 bg-surface-overlay/40"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? "text-zinc-100" : "text-zinc-500"}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB CONTENT (CLEAN VERTICAL TYPOGRAPHY, ZERO BOX CLUTTER) ================= */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* ========================================================================= */}
        {/* TAB 1: PERSONAL INFO */}
        {/* ========================================================================= */}
        {activeTab === "personal" && (
          <div id="tab-content-personal" className="space-y-0">
            {/* AADHAR ID (Strict Instruction: [Aadhaar Redacted] generic placeholder, never generate fake numeric digits) */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider">
                  AADHAR ID
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(personalInfo.aadharVoterId || "[Aadhaar Redacted]", "aadhar")}
                  className="hover:text-zinc-200 text-[9px] flex items-center gap-0.5 cursor-pointer text-zinc-500"
                >
                  {copiedKey === "aadhar" ? (
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                  <span>{copiedKey === "aadhar" ? "COPIED" : "COPY"}</span>
                </button>
              </div>
              <div className="text-sm text-zinc-100 font-mono font-medium flex items-center gap-2">
                <span className="text-amber-400">{personalInfo.aadharVoterId || "[Aadhaar Redacted]"}</span>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                FULL NAME
              </div>
              <div className="text-sm text-zinc-100 font-mono font-bold">
                {personalInfo.fullName}
              </div>
            </div>

            {/* DEMOGRAPHY (age, sex, location) */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                DEMOGRAPHY
              </div>
              <div className="text-sm text-zinc-100 font-mono leading-relaxed">
                {personalInfo.demography?.text ||
                  `${personalInfo.demography?.age || 34}, ${personalInfo.demography?.sex || "Male"}, ${personalInfo.demography?.location || "Andheri East, Mumbai, Maharashtra"}`}
              </div>
            </div>

            {/* CONTACT DETAILS */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                CONTACT DETAILS
              </div>
              <div className="text-sm text-zinc-100 font-mono">
                {personalInfo.contactDetails?.phone}, {personalInfo.contactDetails?.email}
              </div>
            </div>

            {/* OCCUPATION */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                OCCUPATION
              </div>
              <div className="text-sm text-zinc-100 font-mono leading-relaxed">
                {personalInfo.occupation}
              </div>
            </div>

            {/* SYNDICATE AFFILIATION */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                SYNDICATE AFFILIATION
              </div>
              <div className="text-sm font-mono font-bold text-threat-crimson">
                {personalInfo.syndicateAffiliation || personalInfo.nexusAffiliation || "Jamtara Phishing Syndicate"}
              </div>
            </div>

            {/* KNOWN ASSOCIATES */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                KNOWN ASSOCIATES
              </div>
              <div className="text-sm text-zinc-100 font-mono">
                {personalInfo.knownAssociates || "Rahul Desai, Amit Singh"}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FIR DOSSIER */}
        {/* ========================================================================= */}
        {activeTab === "fir" && (
          <div id="tab-content-fir" className="space-y-0">
            {/* FIR ID */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider">
                  FIR ID
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(firDetails.firId, "firId")}
                  className="hover:text-zinc-200 text-[9px] flex items-center gap-0.5 cursor-pointer text-zinc-500"
                >
                  {copiedKey === "firId" ? (
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                  <span>{copiedKey === "firId" ? "COPIED" : "COPY"}</span>
                </button>
              </div>
              <div className="text-sm text-record-amber font-mono font-bold">
                {firDetails.firId}
              </div>
            </div>

            {/* FIR DATE */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                FIR DATE
              </div>
              <div className="text-sm text-zinc-100 font-mono">
                {firDetails.firDate}
              </div>
            </div>

            {/* POLICE STATION */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                POLICE STATION
              </div>
              <div className="text-sm text-zinc-100 font-mono leading-relaxed">
                {firDetails.policeStation}
              </div>
            </div>

            {/* CRPC/BNS SECTION */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                CRPC/BNS SECTION
              </div>
              <div className="text-sm text-zinc-100 font-mono font-medium leading-relaxed">
                {firDetails.crpcBnsSection || firDetails.crpcSection}
              </div>
            </div>

            {/* STATUS OF CHARGES */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                STATUS OF CHARGES
              </div>
              <div className="text-sm font-mono font-bold text-red-400">
                {firDetails.statusOfCharges}
              </div>
            </div>

            {/* ACCUSED LIST */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                ACCUSED LIST
              </div>
              <div className="text-sm text-zinc-100 font-mono font-semibold">
                {firDetails.accusedList || "Vikram Sharma, Rahul Desai, Amit Singh"}
              </div>
            </div>

            {/* FIR COPY */}
            <div className="mb-4 pt-2 border-t border-border-subtle/50">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                FIR COPY
              </div>
              <div className="text-xs text-zinc-300 font-mono space-y-1">
                <div>
                  <span className="text-zinc-500">Doc: </span>
                  <strong className="text-zinc-100">{firDetails.firCopy.documentNumber}</strong>
                </div>
                <div className="text-[11px] text-zinc-400 italic leading-relaxed pt-0.5">
                  "{firDetails.firCopy.summaryText}"
                </div>
                <div className="text-[10px] text-record-amber font-bold pt-0.5">
                  {firDetails.firCopy.certifiedSeal}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TELEPHONY (CDR) */}
        {/* ========================================================================= */}
        {activeTab === "cdr" && (
          <div id="tab-content-cdr" className="space-y-0">
            {/* TARGET ID */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider">
                  TARGET ID
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(cdrDetails.targetId || "+91 98250 XXXXX", "targetId")}
                  className="hover:text-zinc-200 text-[9px] flex items-center gap-0.5 cursor-pointer text-zinc-500"
                >
                  {copiedKey === "targetId" ? (
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                  <span>{copiedKey === "targetId" ? "COPIED" : "COPY"}</span>
                </button>
              </div>
              <div className="text-sm text-emerald-400 font-mono font-bold">
                {cdrDetails.targetId || "+91 98250 XXXXX"}
              </div>
            </div>

            {/* TOWER LOCATION */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-1">
                TOWER LOCATION
              </div>
              <div className="text-sm text-zinc-100 font-mono leading-relaxed">
                {cdrDetails.towerLocation}
              </div>
            </div>

            {/* CALL HISTORY (Render as a mini-table) */}
            <div className="mb-4">
              <div className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider mb-2">
                CALL HISTORY
              </div>
              <div className="space-y-1.5 font-mono text-xs border border-border-subtle/60 bg-surface-card/40 p-2">
                {cdrDetails.records && cdrDetails.records.length > 0 ? (
                  cdrDetails.records.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`py-1 ${
                        idx < (cdrDetails.records?.length ?? 0) - 1
                          ? "border-b border-border-subtle/40"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-100 font-medium">
                          {rec.caller} {rec.direction === "INCOMING" ? "←" : "→"} {rec.receiver}
                        </span>
                        <span
                          className={`font-bold ${
                            rec.direction === "INCOMING"
                              ? "text-telecom-cyan"
                              : "text-emerald-400"
                          }`}
                        >
                          {rec.direction} · {rec.duration}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 flex justify-between">
                        <span>{rec.tower || "Cell Sector"}</span>
                        <span>{rec.timestamp || ""}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-zinc-300 py-1">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-100 font-medium">{cdrDetails.targetId}</span>
                      <span className="text-emerald-400 font-bold">
                        {cdrDetails.callTypeAndDuration || "VoLTE Voice"}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">{cdrDetails.towerLocation}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="p-2.5 border-t border-border-subtle bg-surface-card flex items-center justify-between text-[10px] text-zinc-500 shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="truncate">
            CUSTODY SEAL: {firDetails.firCopy.ledgerHash.slice(0, 18)}...
          </span>
        </div>
        <div className="shrink-0 text-zinc-400 font-bold">
          {firDetails.policeStation.includes("BKC")
            ? "BKC // 2026"
            : firDetails.policeStation.includes("Bengaluru")
            ? "BLR // 2024"
            : "CBI // 2026"}
        </div>
      </div>
    </aside>
  );
};
