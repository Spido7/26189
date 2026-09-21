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
  FileCode,
  CheckCircle,
  Database,
  Hash,
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

  const filteredEvidence = evidenceList.filter(
    (ev) =>
      ev.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.format.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <WorkstationShell activeCaseId={selectedEvidence.caseId}>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base font-sans select-none">
        {/* ================= 1. HEADER ================= */}
        <div className="px-5 py-3.5 border-b border-border-subtle bg-surface-card/70 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-text-primary tracking-tight">
                  Evidence Vault & Integrity Ledger
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  Section 65B Certified
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
                  Simulated Ledger
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Immutable cryptographic hashing, custodial tracking, and judicial tamper-evident anchoring.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCertificateModal(true)}
            className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Sec 65B Certificate</span>
          </button>
        </div>

        {/* Legal Purpose Notice */}
        <div className="px-5 py-2 bg-blue-950/20 border-b border-blue-500/20 text-blue-200/90 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-300">Integrity Assurance:</span>
            <span className="text-text-muted text-[11px]">
              Distributed ledger anchoring guarantees binary evidence is tamper-evident since physical acquisition.
            </span>
          </div>
          <span className="text-emerald-400 text-[10px] font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Hyperledger Fabric GovNet
          </span>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="px-5 py-2 border-b border-border-subtle bg-surface-card/40 flex items-center gap-1.5 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("vault")}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === "vault"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-surface-card"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Evidence Inventory ({evidenceList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custody")}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === "custody"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-surface-card"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Chain of Custody Timeline</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("integrity")}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === "integrity"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-surface-card"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Blockchain Anchor Proofs</span>
          </button>
        </div>

        {/* ================= 2. WORKSPACE BODY ================= */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Evidence Item List */}
          <div className="w-full md:w-80 border-r border-border-subtle bg-surface-card/30 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-3 space-y-2">
            <div className="relative mb-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter artifacts..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-surface-card border border-border-subtle rounded-md text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-border-highlight"
              />
            </div>

            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-1">
              Stored Evidence Artifacts
            </div>

            <div className="space-y-1.5">
              {filteredEvidence.map((ev) => {
                const isSelected = selectedEvidence.id === ev.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvidenceId(ev.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-surface-card border-emerald-500/50 shadow-xs text-text-primary"
                        : "bg-surface-card/50 border-border-subtle text-text-muted hover:border-border-highlight hover:bg-surface-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-telecom-cyan">{ev.id}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-medium rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        {ev.integrityState}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-text-primary line-clamp-1">{ev.title}</div>
                    <div className="text-[11px] text-text-muted flex justify-between pt-0.5">
                      <span className="font-mono text-[10px] uppercase bg-bg-base/60 px-1 rounded">{ev.format}</span>
                      <span className="font-mono text-[10px]">{ev.sizeFormatted}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed View of Selected Artifact */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 bg-bg-base">
            {/* Top Overview Card */}
            <div className="p-4 bg-surface-card border border-border-subtle rounded-xl space-y-3.5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-text-muted">Evidence ID:</span>
                    <span className="text-sm font-mono font-bold text-text-primary">{selectedEvidence.id}</span>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{selectedEvidence.integrityState}</span>
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-text-primary mt-1">{selectedEvidence.title}</h2>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyIntegrity}
                  disabled={isVerifying}
                  className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 self-start md:self-auto"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                  <span>{isVerifying ? "Verifying Ledger..." : "Verify Hash Integrity"}</span>
                </button>
              </div>

              {/* Hashes */}
              <div className="p-3 bg-bg-base/80 border border-border-subtle rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-emerald-400" />
                    SHA-256 Integrity Hash
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedEvidence.sha256Hash)}
                    className="text-text-muted hover:text-text-primary text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="text-xs font-mono text-emerald-400 break-all bg-emerald-950/20 p-2 rounded border border-emerald-500/20">
                  {selectedEvidence.sha256Hash}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
                  <span className="text-text-muted">MD5 Checksum:</span>
                  <span className="text-text-primary font-mono text-[11px]">{selectedEvidence.md5Hash}</span>
                </div>
              </div>
            </div>

            {/* TAB 1: INVENTORY DETAILS */}
            {activeTab === "vault" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-surface-card border border-border-subtle rounded-xl space-y-3 text-xs shadow-xs">
                  <div className="text-xs font-semibold text-text-primary pb-2 border-b border-border-subtle">
                    Acquisition & Seizure Metadata
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs">Seizing Officer:</span>
                      <span className="text-text-primary font-medium">{selectedEvidence.seizingOfficer}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs">Location:</span>
                      <span className="text-text-primary">{selectedEvidence.seizureLocation}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs">Source Interface:</span>
                      <span className="text-text-primary font-mono text-[11px]">{selectedEvidence.sourceDevice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs">Acquired Timestamp:</span>
                      <span className="text-text-secondary font-mono text-[11px]">{selectedEvidence.acquiredAt}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface-card border border-border-subtle rounded-xl space-y-3 text-xs shadow-xs">
                  <div className="text-xs font-semibold text-text-primary pb-2 border-b border-border-subtle">
                    Storage & Format Specifications
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs">File Format:</span>
                      <span className="text-telecom-cyan font-mono font-medium">{selectedEvidence.format}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs">Exact Byte Count:</span>
                      <span className="text-text-primary font-mono text-[11px]">{selectedEvidence.sizeBytes.toLocaleString()} bytes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs">Vault Custody Status:</span>
                      <span className="text-emerald-400 font-medium">{selectedEvidence.custodyStatus}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs">Case Dossier:</span>
                      <span className="text-text-primary font-mono text-[11px] font-medium">{selectedEvidence.caseId}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CHAIN OF CUSTODY TIMELINE */}
            {activeTab === "custody" && (
              <div className="p-4 bg-surface-card border border-border-subtle rounded-xl space-y-4 shadow-xs">
                <div className="text-xs font-semibold text-text-primary pb-2 border-b border-border-subtle flex items-center justify-between">
                  <span>Chain of Custody Lifecycle Audit</span>
                  <span className="text-[11px] text-text-muted font-normal">
                    Acquired → Hashed → Recorded → Analyzed → Reviewed
                  </span>
                </div>

                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border-subtle">
                  {selectedEvidence.custodyChain.map((step) => (
                    <div key={step.step} className="flex items-start gap-3 p-3 bg-bg-base/70 border border-border-subtle rounded-lg text-xs relative z-10">
                      <div className="w-7 h-7 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 shadow-xs">
                        {step.step}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-text-primary">{step.action}</span>
                          <span className="text-[11px] text-text-muted font-mono">{step.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          Officer: <strong className="text-text-primary font-medium">{step.officerName}</strong> ({step.organization} · {step.badgeNumber})
                        </div>
                        <div className="text-[11px] text-text-muted italic bg-surface-card/60 p-2 rounded border border-border-subtle/50">
                          {step.notes}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: BLOCKCHAIN INTEGRITY PROOFS */}
            {activeTab === "integrity" && (
              <div className="p-4 bg-surface-card border border-border-subtle rounded-xl space-y-4 shadow-xs">
                <div className="text-xs font-semibold text-text-primary pb-2 border-b border-border-subtle flex items-center justify-between">
                  <span>On-Chain Tamper-Evident Ledger Record</span>
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
                    Simulated Demo Network
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-bg-base/70 border border-border-subtle rounded-lg">
                    <span className="text-text-muted">Ledger Network:</span>
                    <span className="text-text-primary font-medium">
                      {selectedEvidence.blockchainAnchor?.ledgerNetwork}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-bg-base/70 border border-border-subtle rounded-lg">
                    <span className="text-text-muted">Block Number:</span>
                    <span className="text-emerald-400 font-mono font-medium">
                      #{selectedEvidence.blockchainAnchor?.blockNumber}
                    </span>
                  </div>
                  <div className="p-2.5 bg-bg-base/70 border border-border-subtle rounded-lg space-y-1">
                    <span className="text-text-muted block text-[11px]">Transaction ID (TX Hash):</span>
                    <span className="text-telecom-cyan font-mono text-[11px] break-all">
                      {selectedEvidence.blockchainAnchor?.transactionHash}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-bg-base/70 border border-border-subtle rounded-lg">
                    <span className="text-text-muted">Block Timestamp:</span>
                    <span className="text-text-primary font-mono text-[11px]">
                      {selectedEvidence.blockchainAnchor?.blockTimestamp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-bg-base/70 border border-border-subtle rounded-lg">
                    <span className="text-text-muted">Consensus Verification:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified (100% Peer Match)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= 3. SECTION 65B CERTIFICATE MODAL ================= */}
        {showCertificateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans select-none">
            <div className="w-full max-w-2xl bg-surface-card border border-border-highlight rounded-xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                    Certificate Under Section 65B of Indian Evidence Act, 1872
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="text-text-muted hover:text-text-primary text-sm p-1 cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 bg-bg-base/80 border border-border-subtle rounded-lg text-xs text-text-secondary leading-relaxed space-y-3">
                <p>
                  I, <strong className="text-text-primary">{CURRENT_INVESTIGATOR.name}</strong>, {CURRENT_INVESTIGATOR.rank}, holding Badge #{CURRENT_INVESTIGATOR.badgeNumber}, do hereby certify that:
                </p>
                <p>
                  1. The electronic output comprising evidence item <strong className="text-text-primary font-mono">{selectedEvidence.id}</strong> (SHA-256: <code className="text-emerald-400 font-mono text-[11px] bg-emerald-950/30 px-1 py-0.5 rounded">{selectedEvidence.sha256Hash}</code>) was produced by the computer and network interface during the period over which the computer was used regularly to store or process information.
                </p>
                <p>
                  2. Throughout the material part of the said period, the device was operating properly and the electronic custody ledger registered under block #{selectedEvidence.blockchainAnchor?.blockNumber} confirms that no unauthorized intervention or modification took place.
                </p>
                <div className="p-3 border border-border-subtle rounded-md bg-surface-card space-y-1 font-mono text-[11px]">
                  <div className="text-text-muted">CASE DOSSIER: <span className="text-text-primary font-bold">{selectedEvidence.caseId}</span></div>
                  <div className="text-text-muted">CERTIFYING OFFICER: <span className="text-text-primary">{CURRENT_INVESTIGATOR.name}</span></div>
                  <div className="text-text-muted">LEGAL SEAL: <span className="text-emerald-400">DIGITAL AUTHENTICATION TOKEN #CID-KA-9042-65B</span></div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2 border border-border-subtle text-text-muted hover:text-text-primary text-xs font-medium rounded-lg cursor-pointer transition-colors"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("Downloaded Section 65B PDF Certificate.");
                    setShowCertificateModal(false);
                  }}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Certificate (PDF)</span>
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
        <div className="flex-1 flex items-center justify-center bg-bg-base text-text-muted font-sans text-xs">
          Loading evidence vault workspace...
        </div>
      }
    >
      <EvidenceVaultContent />
    </Suspense>
  );
}
