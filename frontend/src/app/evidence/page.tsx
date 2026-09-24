"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import {
  ShieldCheck,
  FileCheck2,
  Lock,
  Link2,
  History,
  CheckCircle2,
  Download,
  Search,
  ExternalLink,
  Clock,
  Layers,
  FileText,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { MOCK_EVIDENCE_ITEMS, CURRENT_INVESTIGATOR } from "@/data/dfir-mock-database";
import { DFIREvidenceItem } from "@/types/evidence";

function EvidenceVaultContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"vault" | "custody" | "integrity">(
    queryTab === "custody" ? "custody" : queryTab === "integrity" ? "integrity" : "vault"
  );

  const [evidenceList, setEvidenceList] = useState<DFIREvidenceItem[]>(MOCK_EVIDENCE_ITEMS);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>("EVD-2026-001");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedHash, setCopiedHash] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(true);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    if (queryTab === "custody") setActiveTab("custody");
    if (queryTab === "integrity") setActiveTab("integrity");
  }, [queryTab]);

  const selectedEvidence = evidenceList.find((ev) => ev.id === selectedEvidenceId) || evidenceList[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 1500);
  };

  const handleVerifyIntegrity = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
    }, 600);
  };

  return (
    <WorkstationShell activeCaseId={selectedEvidence.caseId}>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base font-mono select-none">
        {/* ================= 1. HEADER ================= */}
        <div className="p-3 border-b border-border-subtle bg-surface-card flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-text-primary tracking-wider uppercase">
                  EVIDENCE VAULT & BLOCKCHAIN INTEGRITY
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                  SECTION 65B INDIAN EVIDENCE ACT
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold border border-amber-500/40 bg-amber-500/10 text-amber-400">
                  SIMULATED / DEMO LEDGER
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                Immutable cryptographic hashing, custodial tracking, and judicial tamper-evident anchoring.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCertificateModal(true)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>EXPORT SEC 65B CERTIFICATE</span>
          </button>
        </div>

        {/* Legal Purpose Notice */}
        <div className="px-3 py-1.5 bg-blue-950/20 border-b border-blue-500/30 text-blue-200/90 text-[10px] flex items-center justify-between">
          <span>
            <strong>INTEGRITY PURPOSE:</strong> Distributed ledger anchoring guarantees that binary evidence has not been tampered with or modified since physical seizure. Blockchain proofs verify chain-of-custody integrity, NOT criminal culpability.
          </span>
          <span className="text-emerald-400 text-[9px] font-mono">HYPERLEDGER FABRIC GOVNET</span>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="px-3 py-1.5 border-b border-border-subtle bg-surface-card flex items-center gap-2 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("vault")}
            className={`px-3 py-1 font-bold cursor-pointer transition-colors ${activeTab === "vault"
                ? "bg-bg-base text-emerald-400 border-b-2 border-emerald-500"
                : "text-text-muted hover:text-text-primary"
              }`}
          >
            EVIDENCE INVENTORY ({evidenceList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custody")}
            className={`px-3 py-1 font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${activeTab === "custody"
                ? "bg-bg-base text-emerald-400 border-b-2 border-emerald-500"
                : "text-text-muted hover:text-text-primary"
              }`}
          >
            <Link2 className="w-3 h-3" />
            <span>CHAIN OF CUSTODY TIMELINE</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("integrity")}
            className={`px-3 py-1 font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${activeTab === "integrity"
                ? "bg-bg-base text-emerald-400 border-b-2 border-emerald-500"
                : "text-text-muted hover:text-text-primary"
              }`}
          >
            <History className="w-3 h-3" />
            <span>BLOCKCHAIN ANCHOR PROOFS</span>
          </button>
        </div>

        {/* ================= 2. WORKSPACE BODY ================= */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Evidence Item List */}
          <div className="w-full md:w-80 border-r border-border-subtle bg-bg-base flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-3 space-y-2">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
              STORED EVIDENCE ARTIFACTS
            </div>

            {evidenceList.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvidenceId(ev.id)}
                className={`p-2.5 border transition-colors cursor-pointer space-y-1 ${selectedEvidence.id === ev.id
                    ? "bg-surface-card border-emerald-500 text-text-primary"
                    : "bg-surface-card/60 border-border-subtle text-text-muted hover:border-border-highlight"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-telecom-cyan">{ev.id}</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                    {ev.integrityState}
                  </span>
                </div>
                <div className="text-xs font-semibold text-text-primary line-clamp-1">{ev.title}</div>
                <div className="text-[10px] text-text-muted flex justify-between">
                  <span>{ev.format}</span>
                  <span>{ev.sizeFormatted}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Detailed View of Selected Artifact */}
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3 bg-bg-base">
            {/* Top Overview Card */}
            <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted uppercase">EVIDENCE IDENTIFIER:</span>
                    <span className="text-base font-bold text-text-primary">{selectedEvidence.id}</span>
                    <span className="px-2 py-0.5 text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{selectedEvidence.integrityState}</span>
                    </span>
                  </div>
                  <h2 className="text-xs font-bold text-telecom-cyan mt-0.5">{selectedEvidence.title}</h2>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyIntegrity}
                  disabled={isVerifying}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                  <span>{isVerifying ? "VERIFYING LEDGER..." : "VERIFY CRYPTOGRAPHIC HASH"}</span>
                </button>
              </div>

              {/* Hashes */}
              <div className="p-2.5 bg-bg-base border border-border-subtle space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-muted uppercase">SHA-256 INTEGRITY HASH:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedEvidence.sha256Hash)}
                    className="text-text-muted hover:text-text-primary text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? "COPIED" : "COPY"}</span>
                  </button>
                </div>
                <div className="text-xs font-mono text-emerald-400 break-all">{selectedEvidence.sha256Hash}</div>

                <div className="flex items-center justify-between pt-1 border-t border-border-subtle text-[11px]">
                  <span className="text-text-muted">MD5 CHECKSUM:</span>
                  <span className="text-text-primary font-mono">{selectedEvidence.md5Hash}</span>
                </div>
              </div>
            </div>

            {/* TAB 1: INVENTORY DETAILS */}
            {activeTab === "vault" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-surface-card border border-border-subtle space-y-2 text-xs">
                  <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider pb-1 border-b border-border-subtle">
                    ACQUISITION & SEIZURE METADATA
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">SEIZING OFFICER:</span>
                    <span className="text-text-primary font-bold">{selectedEvidence.seizingOfficer}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">SEIZURE LOCATION:</span>
                    <span className="text-text-primary">{selectedEvidence.seizureLocation}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">SOURCE HARDWARE / INTERFACE:</span>
                    <span className="text-text-primary">{selectedEvidence.sourceDevice}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">ACQUISITION TIMESTAMP:</span>
                    <span className="text-text-primary">{selectedEvidence.acquiredAt}</span>
                  </div>
                </div>

                <div className="p-3 bg-surface-card border border-border-subtle space-y-2 text-xs">
                  <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider pb-1 border-b border-border-subtle">
                    STORAGE & FORMAT SPECS
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">FILE FORMAT:</span>
                    <span className="text-telecom-cyan font-bold">{selectedEvidence.format}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">EXACT BYTE COUNT:</span>
                    <span className="text-text-primary font-mono">{selectedEvidence.sizeBytes.toLocaleString()} bytes</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">VAULT CUSTODY STATUS:</span>
                    <span className="text-emerald-400 font-bold">{selectedEvidence.custodyStatus}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">ASSOCIATED CASE DOSSIER:</span>
                    <span className="text-text-primary font-bold">{selectedEvidence.caseId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CHAIN OF CUSTODY TIMELINE */}
            {activeTab === "custody" && (
              <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider pb-1.5 border-b border-border-subtle flex items-center justify-between">
                  <span>CHAIN OF CUSTODY (LIFECYCLE AUDIT)</span>
                  <span className="text-[10px] text-text-muted">
                    ACQUIRED → HASHED → RECORDED → ANALYZED → REVIEWED
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedEvidence.custodyChain.map((step) => (
                    <div key={step.step} className="flex items-start gap-3 p-2.5 bg-bg-base border border-border-subtle text-xs">
                      <div className="w-5 h-5 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {step.step}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-text-primary uppercase">{step.action}</span>
                          <span className="text-[10px] text-text-muted">{step.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          BY: <strong className="text-text-primary">{step.officerName}</strong> ({step.organization} // {step.badgeNumber})
                        </div>
                        <div className="text-[11px] text-text-muted italic">{step.notes}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: BLOCKCHAIN INTEGRITY PROOFS */}
            {activeTab === "integrity" && (
              <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider pb-1.5 border-b border-border-subtle flex items-center justify-between">
                  <span>ON-CHAIN TAMPER-EVIDENT RECORD</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold border border-amber-500/40 bg-amber-500/10 text-amber-400">
                    SIMULATED DEMO NETWORK
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-bg-base border border-border-subtle">
                    <span className="text-text-muted">Ledger Network:</span>
                    <span className="text-text-primary font-bold">
                      {selectedEvidence.blockchainAnchor?.ledgerNetwork}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-bg-base border border-border-subtle">
                    <span className="text-text-muted">Block Number:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      #{selectedEvidence.blockchainAnchor?.blockNumber}
                    </span>
                  </div>
                  <div className="p-2 bg-bg-base border border-border-subtle space-y-1">
                    <span className="text-text-muted block text-[10px]">TRANSACTION ID (TX HASH):</span>
                    <span className="text-telecom-cyan font-mono text-xs break-all">
                      {selectedEvidence.blockchainAnchor?.transactionHash}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-bg-base border border-border-subtle">
                    <span className="text-text-muted">Block Timestamp:</span>
                    <span className="text-text-primary">
                      {selectedEvidence.blockchainAnchor?.blockTimestamp}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-bg-base border border-border-subtle">
                    <span className="text-text-muted">Consensus Verification:</span>
                    <span className="text-emerald-400 font-bold">VERIFIED (100% Peer Match)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= 3. SECTION 65B CERTIFICATE MODAL ================= */}
        {showCertificateModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
            <div className="w-full max-w-2xl bg-surface-card border border-border-highlight p-4 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    CERTIFICATE UNDER SECTION 65B OF INDIAN EVIDENCE ACT, 1872
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="text-text-muted hover:text-text-primary text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-bg-base border border-border-subtle text-[11px] text-text-secondary leading-relaxed space-y-2">
                <p>
                  I, <strong>{CURRENT_INVESTIGATOR.name}</strong>, {CURRENT_INVESTIGATOR.rank}, holding Badge #{CURRENT_INVESTIGATOR.badgeNumber}, do hereby certify that:
                </p>
                <p>
                  1. The electronic output comprising evidence item <strong>{selectedEvidence.id}</strong> (SHA-256: <code>{selectedEvidence.sha256Hash}</code>) was produced by the computer and network interface during the period over which the computer was used regularly to store or process information.
                </p>
                <p>
                  2. Throughout the material part of the said period, the device was operating properly and the electronic custody ledger registered under block #{selectedEvidence.blockchainAnchor?.blockNumber} confirms that no unauthorized intervention or modification took place.
                </p>
                <div className="p-2 border border-border-subtle bg-surface-card space-y-1 font-mono text-[10px]">
                  <div>CASE DOSSIER: {selectedEvidence.caseId}</div>
                  <div>CERTIFYING OFFICER: {CURRENT_INVESTIGATOR.name}</div>
                  <div>LEGAL SEAL: DIGITAL AUTHENTICATION TOKEN #CID-KA-9042-65B</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="px-3 py-1.5 border border-border-subtle text-text-muted hover:text-text-primary text-xs cursor-pointer"
                >
                  DISMISS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("Downloaded Section 65B PDF Certificate.");
                    setShowCertificateModal(false);
                  }}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold cursor-pointer"
                >
                  DOWNLOAD CERTIFICATE (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkstationShell>
  );
}

export default function EvidenceVaultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-bg-base text-text-muted font-mono text-xs">
          LOADING EVIDENCE VAULT WORKSPACE...
        </div>
      }
    >
      <EvidenceVaultContent />
    </Suspense>
  );
}

