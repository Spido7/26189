"use client";

import React, { useState } from "react";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import {
  Briefcase,
  FileText,
  Shield,
  Clock,
  User,
  Radio,
  PhoneCall,
  Link2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Layers,
  ChevronRight,
  ExternalLink,
  Plus,
  Scale,
  Calendar,
  Building,
  Gavel,
  History,
} from "lucide-react";
import { MOCK_CASES, MOCK_EVIDENCE_ITEMS, MOCK_AI_ASSESSMENTS, CURRENT_INVESTIGATOR } from "@/data/dfir-mock-database";
import { CaseInvestigation, FIRDossier } from "@/types/case";

type CaseTab = "overview" | "entities" | "firs" | "evidence" | "timeline" | "notes";

const LEGAL_TAXONOMY_STEPS = [
  { id: "COMPLAINT_FIR", label: "COMPLAINT / FIR", desc: "Registered at Police Station" },
  { id: "UNDER_INVESTIGATION", label: "INVESTIGATION", desc: "Forensics, Seizures & Intercepts" },
  { id: "CHARGE_SHEET_FILED", label: "CHARGE SHEET", desc: "Submitted to Magistrate" },
  { id: "COURT_PROCEEDINGS", label: "COURT PROCEEDINGS", desc: "Trial & Evidentiary Arguments" },
  { id: "CONVICTION_ACQUITTAL", label: "JUDICIAL VERDICT", desc: "Conviction / Acquittal" },
];

export default function CasesWorkspacePage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(MOCK_CASES[0].id);
  const [activeTab, setActiveTab] = useState<CaseTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [newNoteText, setNewNoteText] = useState("");

  const activeCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  const caseEvidence = MOCK_EVIDENCE_ITEMS.filter((ev) => ev.caseId === activeCase.id);
  const caseAssessments = MOCK_AI_ASSESSMENTS.filter((ai) => ai.caseRef === activeCase.id);

  const getLegalStepStatus = (stepId: string, caseStatus: string) => {
    if (caseStatus === "UNDER_INVESTIGATION") {
      if (stepId === "COMPLAINT_FIR") return "COMPLETED";
      if (stepId === "UNDER_INVESTIGATION") return "ACTIVE";
      return "PENDING";
    }
    if (caseStatus === "CHARGE_SHEET_FILED") {
      if (stepId === "COMPLAINT_FIR" || stepId === "UNDER_INVESTIGATION") return "COMPLETED";
      if (stepId === "CHARGE_SHEET_FILED") return "ACTIVE";
      return "PENDING";
    }
    return "PENDING";
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    activeCase.notes.unshift({
      id: `NOTE-${Date.now()}`,
      author: CURRENT_INVESTIGATOR.name,
      role: CURRENT_INVESTIGATOR.rank,
      timestamp: new Date().toISOString(),
      content: newNoteText.trim(),
    });
    setNewNoteText("");
  };

  return (
    <WorkstationShell activeCaseId={activeCase.id} onCaseChange={setSelectedCaseId}>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base font-sans select-none">
        {/* ================= 1. HEADER & SEARCH ================= */}
        <div className="p-3.5 border-b border-border-subtle bg-surface-card flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-telecom-cyan/30 bg-telecom-cyan/10 text-telecom-cyan flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-text-primary tracking-wide">
                  Case Dossiers &amp; Judicial Intelligence
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                  Criminal Procedure Compliant
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Statutory tracking across FIR, Section 65B forensics, and trial prosecution stages.
              </p>
            </div>
          </div>

          {/* Quick Case Switcher */}
          <div className="flex items-center gap-1.5">
            {MOCK_CASES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCaseId(c.id)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md border transition-all cursor-pointer ${
                  activeCase.id === c.id
                    ? "border-telecom-cyan text-telecom-cyan bg-telecom-cyan/10 shadow-sm"
                    : "border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-overlay"
                }`}
              >
                {c.id}
              </button>
            ))}
          </div>
        </div>

        {/* ================= 2. WORKSPACE MAIN SPLIT ================= */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Case Summary Card & Legal Stage Timeline */}
          <div className="w-full md:w-84 border-r border-border-subtle bg-bg-base flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-3.5 space-y-3">
            <div className="p-3.5 bg-surface-card rounded-lg border border-border-subtle space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-telecom-cyan font-mono">{activeCase.caseNumber}</span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded border border-threat-crimson/40 bg-threat-crimson/10 text-threat-crimson">
                  {activeCase.priority} Priority
                </span>
              </div>

              <h2 className="text-xs font-semibold text-text-primary leading-snug">
                {activeCase.title}
              </h2>

              <div className="text-[11px] text-text-muted space-y-1.5 pt-2 border-t border-border-subtle">
                <div className="flex justify-between">
                  <span className="text-text-muted">Investigating Officer:</span>
                  <span className="text-text-primary font-medium">{activeCase.leadInvestigator.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Division:</span>
                  <span className="text-text-secondary">{activeCase.leadInvestigator.division}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Registered:</span>
                  <span className="text-text-primary font-mono">{activeCase.firs[0]?.lodgedDate}</span>
                </div>
              </div>
            </div>

            {/* Statutory Legal Taxonomy Timeline */}
            <div className="p-3.5 bg-surface-card rounded-lg border border-border-subtle space-y-2.5">
              <div className="text-xs font-semibold text-text-primary flex items-center gap-2 pb-1.5 border-b border-border-subtle">
                <Scale className="w-3.5 h-3.5 text-telecom-cyan" />
                <span>Judicial Proceeding Taxonomy</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {LEGAL_TAXONOMY_STEPS.map((step, idx) => {
                  const status = getLegalStepStatus(step.id, activeCase.status);
                  return (
                    <div key={step.id} className="flex items-start gap-2.5 text-xs">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border ${
                          status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                            : status === "ACTIVE"
                            ? "bg-telecom-cyan/20 text-telecom-cyan border-telecom-cyan animate-pulse"
                            : "bg-surface-card text-text-muted border-border-subtle"
                        }`}
                      >
                        {status === "COMPLETED" ? "✓" : idx + 1}
                      </div>
                      <div>
                        <div
                          className={`font-semibold ${
                            status === "ACTIVE"
                              ? "text-telecom-cyan"
                              : status === "COMPLETED"
                              ? "text-emerald-400"
                              : "text-text-muted"
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className="text-[11px] text-text-muted leading-tight">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 bg-blue-950/25 border border-blue-500/30 rounded-md text-blue-200/90 text-[11px] leading-relaxed mt-2">
                <strong>Legal Presumption:</strong> Named persons in FIR are presumed innocent until judicial verdict.
              </div>
            </div>

            {/* Evidence & Entity Breakdown Counts */}
            <div className="p-3.5 bg-surface-card rounded-lg border border-border-subtle space-y-2 text-xs">
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                Associated Artifacts
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">FIR Records:</span>
                <span className="text-text-primary font-mono font-medium">{activeCase.firs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Vault Evidence:</span>
                <span className="text-telecom-cyan font-mono font-medium">{caseEvidence.length} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">AI Risk Evaluations:</span>
                <span className="text-purple-400 font-mono font-medium">{caseAssessments.length} files</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Linked Network Entities:</span>
                <span className="text-emerald-400 font-mono font-medium">{activeCase.associatedEntityIds.length} nodes</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Detailed Workspace Tabs */}
          <div className="flex-1 flex flex-col overflow-hidden bg-bg-base">
            {/* Tabs Header */}
            <div className="px-4 border-b border-border-subtle bg-surface-card flex items-center gap-2 shrink-0 overflow-x-auto">
              {[
                { id: "overview", label: "Overview" },
                { id: "firs", label: "FIR Dossier & Accused" },
                { id: "entities", label: "Linked Entities" },
                { id: "evidence", label: "Case Evidence" },
                { id: "timeline", label: "Timeline" },
                { id: "notes", label: "Case Diary Notes" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as CaseTab)}
                  className={`px-3.5 py-2.5 text-xs font-medium transition-all cursor-pointer border-b-2 ${
                    activeTab === tab.id
                      ? "border-telecom-cyan text-telecom-cyan font-semibold bg-surface-card"
                      : "border-transparent text-text-muted hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
              {/* 1. OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-3">
                  <div className="p-3 bg-surface-card border border-border-subtle space-y-2">
                    <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-telecom-cyan" />
                      <span>EXECUTIVE CASE SYNOPSIS</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {activeCase.summary}
                    </p>
                  </div>

                  {/* Primary FIR Quick Card */}
                  {activeCase.firs.map((fir) => (
                    <div key={fir.firNumber} className="p-3 bg-surface-card border border-border-subtle space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-telecom-cyan">FIR NO. {fir.firNumber}</span>
                        <span className="text-[10px] text-text-muted">{fir.lodgedDate}</span>
                      </div>
                      <div className="text-xs text-text-muted">
                        POLICE STATION: <strong className="text-text-primary">{fir.policeStation}</strong>
                      </div>
                      <div className="text-xs text-text-muted">
                        COMPLAINANT: <strong className="text-text-primary">{fir.complainantName}</strong>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] text-text-muted block mb-1">APPLICABLE BNS & IT ACT SECTIONS:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {fir.sectionsApplicable.map((sec, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-[10px] font-bold border border-amber-500/40 bg-amber-500/10 text-amber-300"
                            >
                              {sec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. FIR DOSSIER & ACCUSED DETAILS */}
              {activeTab === "firs" && (
                <div className="space-y-3">
                  {activeCase.firs.map((fir) => (
                    <div key={fir.firNumber} className="space-y-3">
                      <div className="p-3 bg-surface-card border border-border-subtle space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            OFFICIAL FIR DOSSIER: {fir.firNumber}
                          </div>
                          <span className="px-2 py-0.5 text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                            {fir.certifiedSealStamp}
                          </span>
                        </div>
                        <div className="text-[10px] text-text-muted font-mono break-all">
                          DOCUMENT HASH: {fir.documentHash}
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed pt-1">
                          {fir.synopsisSummary}
                        </p>
                      </div>

                      {/* Accused Roster with Presumption of Innocence and Legal Roles */}
                      <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
                        <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center justify-between pb-1.5 border-b border-border-subtle">
                          <span>ROSTER OF ACCUSED / RESPONDENTS IN FIR</span>
                          <span className="text-[10px] text-text-muted">
                            Presumption of Innocence strictly maintained
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {fir.accusedPersons.map((person, idx) => (
                            <div key={idx} className="p-2.5 bg-bg-base border border-border-subtle space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-text-primary">{person.name}</span>
                                <span
                                  className={`px-1.5 py-0.5 text-[9px] font-bold border ${
                                    person.arrestStatus === "ARRESTED_CUSTODY"
                                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                      : person.arrestStatus === "ABSCONDING"
                                      ? "border-threat-crimson/40 bg-threat-crimson/10 text-threat-crimson"
                                      : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                                  }`}
                                >
                                  {person.arrestStatus.replace(/_/g, " ")}
                                </span>
                              </div>
                              <div className="text-[10px] text-text-muted">
                                ALIAS: <strong className="text-telecom-cyan">{person.alias || "N/A"}</strong>
                              </div>
                              <div className="text-[10px] text-text-muted">
                                LEGAL ROLE: <strong className="text-text-secondary">{person.legalRole}</strong>
                              </div>
                              <div className="text-[9px] text-text-muted font-mono">
                                BIOMETRIC REF: {person.aadhaarRedactedRef}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. LINKED ENTITIES */}
              {activeTab === "entities" && (
                <div className="p-3 bg-surface-card border border-border-subtle space-y-2">
                  <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center justify-between pb-1 border-b border-border-subtle">
                    <span>CORRELATED ENTITY INDEX</span>
                    <span className="text-[10px] text-telecom-cyan">
                      {activeCase.associatedEntityIds.length} NODES IN NEO4J
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
                    {activeCase.associatedEntityIds.map((id) => (
                      <div key={id} className="p-2 bg-bg-base border border-border-subtle flex items-center justify-between">
                        <span className="text-xs font-mono text-text-primary">{id}</span>
                        <span className="text-[9px] text-telecom-cyan border border-telecom-cyan/30 px-1 py-0.2">
                          VERIFIED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. CASE EVIDENCE */}
              {activeTab === "evidence" && (
                <div className="space-y-2">
                  {caseEvidence.map((ev) => (
                    <div key={ev.id} className="p-3 bg-surface-card border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-telecom-cyan">{ev.id}</span>
                          <span className="text-xs font-bold text-text-primary">{ev.title}</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                            {ev.integrityState}
                          </span>
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5">
                          SOURCE: {ev.sourceDevice} | ACQUIRED: {ev.acquiredAt} | SIZE: {ev.sizeFormatted}
                        </div>
                        <div className="text-[9px] text-text-muted font-mono mt-0.5 break-all">
                          SHA-256: {ev.sha256Hash}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-1 text-[10px] font-bold bg-bg-base border border-border-subtle text-text-secondary">
                          BLOCK #{ev.blockchainAnchor?.blockNumber}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. TIMELINE */}
              {activeTab === "timeline" && (
                <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
                  <div className="text-xs font-bold text-text-primary uppercase tracking-wider pb-1.5 border-b border-border-subtle">
                    INCIDENT & INVESTIGATION TIMELINE
                  </div>

                  <div className="space-y-3 pt-1">
                    {activeCase.timeline.map((item, idx) => (
                      <div key={item.id} className="flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-telecom-cyan mt-1 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text-primary">{item.title}</span>
                            <span className="text-[10px] text-text-muted">{item.timestamp}</span>
                            <span className="px-1.5 py-0.5 text-[9px] border border-border-subtle text-text-muted">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. INVESTIGATOR NOTES */}
              {activeTab === "notes" && (
                <div className="space-y-3">
                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="p-3 bg-surface-card border border-border-subtle space-y-2">
                    <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-telecom-cyan" />
                      <span>APPEND OFFICIAL CASE DIARY NOTE</span>
                    </div>
                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Enter verified intelligence finding or Panchnama reference..."
                      rows={2}
                      className="w-full p-2 bg-bg-base border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-telecom-cyan"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-telecom-cyan/10 hover:bg-telecom-cyan/20 border border-telecom-cyan/40 text-telecom-cyan text-xs font-bold cursor-pointer transition-colors"
                      >
                        LOG NOTE TO CASE DIARY
                      </button>
                    </div>
                  </form>

                  {/* Existing Notes */}
                  <div className="space-y-2">
                    {activeCase.notes.map((note) => (
                      <div key={note.id} className="p-3 bg-surface-card border border-border-subtle space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-text-primary">
                            {note.author} ({note.role})
                          </span>
                          <span className="text-text-muted text-[10px]">{note.timestamp}</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WorkstationShell>
  );
}
