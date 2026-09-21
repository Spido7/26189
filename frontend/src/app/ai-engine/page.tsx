"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import { HumanReviewModal } from "@/components/inspector/HumanReviewModal";
import {
  Cpu,
  Layers,
  HelpCircle,
  Activity,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  FileCheck,
  TrendingUp,
  Terminal,
  Clock,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { MOCK_AI_ASSESSMENTS, CURRENT_INVESTIGATOR } from "@/data/dfir-mock-database";
import { AIAssessmentRecord, HumanReviewDecision } from "@/types/ai";

function AiEngineContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"pipeline" | "explainability" | "monitoring">(
    queryTab === "explainability" ? "explainability" : queryTab === "monitoring" ? "monitoring" : "pipeline"
  );

  const [assessments, setAssessments] = useState<AIAssessmentRecord[]>(MOCK_AI_ASSESSMENTS);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("AI-ASSESS-001");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const currentAssessment = assessments.find((a) => a.id === selectedAssessmentId) || assessments[0];

  const handleReviewDecision = (decision: HumanReviewDecision, notes: string) => {
    setAssessments((prev) =>
      prev.map((item) => {
        if (item.id === currentAssessment.id) {
          return {
            ...item,
            humanReview: {
              reviewedBy: `${CURRENT_INVESTIGATOR.name} (${CURRENT_INVESTIGATOR.rank})`,
              reviewTimestamp: new Date().toISOString(),
              decision,
              notes,
              evidenceLinkedIds: item.humanReview?.evidenceLinkedIds || ["EVD-2026-001"],
            },
          };
        }
        return item;
      })
    );
  };

  return (
    <WorkstationShell activeCaseId={currentAssessment.caseRef}>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base font-sans select-none">
        {/* ================= 1. HEADER ================= */}
        <div className="p-3.5 border-b border-border-subtle bg-surface-card flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-text-primary tracking-wide">
                  AI Investigation Engine &amp; Explainability (XAI)
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded border border-purple-500/40 bg-purple-500/10 text-purple-300">
                  TensorRT 3-Stage Pipeline
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Sequential cyber telemetry autoencoders, GNN behavioral correlation, and Bayesian risk fusion.
              </p>
            </div>
          </div>

          {/* Assessment Target Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted font-medium">Target:</span>
            {assessments.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedAssessmentId(a.id)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md border transition-all cursor-pointer ${
                  currentAssessment.id === a.id
                    ? "border-purple-500 text-purple-300 bg-purple-500/15 font-semibold"
                    : "border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-card"
                }`}
              >
                {a.targetIdentifier}
              </button>
            ))}
          </div>
        </div>

        {/* Ethical Safeguard Banner */}
        <div className="px-4 py-2 bg-blue-950/25 border-b border-blue-500/30 text-blue-200/90 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-telecom-cyan shrink-0" />
            <span>
              <strong>Ethical Law Enforcement Compliance:</strong> AI assessments produce investigative leads, not legal determinations of guilt. Every inference requires human investigator sign-off before court submission.
            </span>
          </div>
          <span className="text-purple-300 text-[10px] font-mono">Human-in-the-Loop Mandated</span>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 py-2 border-b border-border-subtle bg-surface-card flex items-center gap-2 text-xs shrink-0">
          <div className="flex items-center bg-bg-base rounded-md border border-border-subtle p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("pipeline")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "pipeline"
                  ? "bg-purple-500/15 text-purple-300 font-semibold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              3-Stage Architecture
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("explainability")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "explainability"
                  ? "bg-purple-500/15 text-purple-300 font-semibold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Why Was This Flagged? (SHAP)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("monitoring")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === "monitoring"
                  ? "bg-purple-500/15 text-purple-300 font-semibold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Model Latency &amp; Audit
            </button>
          </div>
        </div>

        {/* ================= 2. WORKSPACE BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
          {/* TAB 1: 3-STAGE PIPELINE ARCHITECTURE */}
          {activeTab === "pipeline" && (
            <div className="space-y-4">
              {/* Visual 3-Stage Workflow Diagram */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Stage 1 Card */}
                <div className="p-3 bg-surface-card border border-border-subtle space-y-3 relative">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
                    <span className="text-[10px] text-text-muted uppercase">STAGE 1 // TELEMETRY</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                      {currentAssessment.stage1Output.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      CYBER TELEMETRY ANALYSIS
                    </h3>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Unsupervised Autoencoder for Ingress Anomaly Detection
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs bg-bg-base p-2.5 border border-border-subtle">
                    <div className="text-[10px] text-text-muted uppercase font-bold">INPUTS:</div>
                    <div className="text-[11px] text-text-secondary">
                      Network logs, IP data, Ports (443, 8080), Protocols, Traffic patterns (14.2k packets)
                    </div>

                    <div className="text-[10px] text-text-muted uppercase font-bold pt-1.5">OUTPUTS:</div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Anomaly Score:</span>
                      <span className="text-threat-crimson font-bold">
                        {currentAssessment.stage1Output.anomalyScore}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Reconstruction Loss:</span>
                      <span className="text-emerald-400 font-bold">
                        {currentAssessment.stage1Output.reconstructionLoss}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Protocol Entropy:</span>
                      <span className="text-text-primary font-bold">
                        {currentAssessment.stage1Output.protocolEntropy} bits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage 2 Card */}
                <div className="p-3 bg-surface-card border border-border-subtle space-y-3 relative">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
                    <span className="text-[10px] text-text-muted uppercase">STAGE 2 // GRAPH CORRELATION</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                      {currentAssessment.stage2Output.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      BEHAVIOR + NETWORK ANALYSIS
                    </h3>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Relational Graph Neural Network (GNN) Classification
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs bg-bg-base p-2.5 border border-border-subtle">
                    <div className="text-[10px] text-text-muted uppercase font-bold">INPUTS:</div>
                    <div className="text-[11px] text-text-secondary">
                      Stage 1 vectors, Historical behavior, Subgraph centrality, Hardware MAC associations
                    </div>

                    <div className="text-[10px] text-text-muted uppercase font-bold pt-1.5">OUTPUTS:</div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Classification:</span>
                      <span className="text-threat-crimson font-bold text-[10px]">
                        {currentAssessment.stage2Output.predictedClassification}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Softmax Probability:</span>
                      <span className="text-emerald-400 font-bold">
                        {(currentAssessment.stage2Output.softmaxProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Subgraph Centrality:</span>
                      <span className="text-text-primary font-bold">
                        {currentAssessment.stage2Output.subgraphCentralityScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage 3 Card */}
                <div className="p-3 bg-surface-card border border-border-subtle space-y-3 relative">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
                    <span className="text-[10px] text-text-muted uppercase">STAGE 3 // RISK FUSION</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                      {currentAssessment.stage3Output.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      MULTI-SOURCE RISK FUSION
                    </h3>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Bayesian Belief Network + Telephony Co-timing Correlator
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs bg-bg-base p-2.5 border border-border-subtle">
                    <div className="text-[10px] text-text-muted uppercase font-bold">INPUTS:</div>
                    <div className="text-[11px] text-text-secondary">
                      Stage 1 + Stage 2, Case evidence references, CDR contact timings, External threat lists
                    </div>

                    <div className="text-[10px] text-text-muted uppercase font-bold pt-1.5">OUTPUTS:</div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Fused Risk Score:</span>
                      <span className="text-threat-crimson font-bold text-base">
                        {currentAssessment.stage3Output.fusedRiskScore} / 100
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Overall Confidence:</span>
                      <span className="text-emerald-400 font-bold">
                        {currentAssessment.stage3Output.confidencePercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage 4: Human-in-the-Loop Review Banner */}
              <div className="p-4 bg-surface-card border border-purple-500/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      HUMAN-IN-THE-LOOP INVESTIGATIVE REVIEW
                    </h4>
                    <span className="px-2 py-0.5 text-[9px] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                      {currentAssessment.humanReview ? currentAssessment.humanReview.decision : "PENDING AUDIT"}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1">
                    {currentAssessment.humanReview
                      ? `Approved by ${currentAssessment.humanReview.reviewedBy} on ${currentAssessment.humanReview.reviewTimestamp}. Notes: "${currentAssessment.humanReview.notes}"`
                      : "Action required: Review model feature attributions and log official investigative decision."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-200 text-xs font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>PERFORM LEO REVIEW</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXPLAINABILITY (WHY WAS THIS FLAGGED?) */}
          {activeTab === "explainability" && (
            <div className="space-y-3">
              <div className="p-3 bg-surface-card border border-border-subtle flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    WHY WAS TARGET {currentAssessment.targetIdentifier} FLAGGED?
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    SHAP feature contribution weights explaining model inference for Case {currentAssessment.caseRef}.
                  </p>
                </div>
                <span className="text-[10px] text-purple-300 font-mono">
                  MODEL: {currentAssessment.modelVersion}
                </span>
              </div>

              {/* Waterfall Breakdown Chart */}
              <div className="p-3 bg-surface-card border border-border-subtle space-y-3">
                <div className="space-y-2.5">
                  {currentAssessment.featureContributions.map((feat, idx) => (
                    <div key={idx} className="p-2.5 bg-bg-base border border-border-subtle space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-threat-crimson font-bold">+{feat.weight} pts</span>
                          <span className="font-bold text-text-primary">{feat.featureName}</span>
                          <span className="text-[9px] text-text-muted px-1.5 py-0.2 border border-border-subtle uppercase">
                            {feat.category}
                          </span>
                        </div>
                        <span className="text-text-muted text-[10px]">WEIGHT: {feat.weight}%</span>
                      </div>

                      {/* Bar Visualization */}
                      <div className="w-full h-1.5 bg-surface-card rounded-full overflow-hidden border border-border-subtle">
                        <div
                          className="bg-threat-crimson h-full rounded-full"
                          style={{ width: `${feat.weight * 2.5}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {feat.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MODEL LATENCY & AUDIT */}
          {activeTab === "monitoring" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-surface-card border border-border-subtle space-y-2">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider pb-1 border-b border-border-subtle">
                  HARDWARE ACCELERATION & BENCHMARKS
                </div>
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Inference Latency:</span>
                    <span className="text-emerald-400 font-bold">{currentAssessment.latencyMs} ms (P99)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Hardware Compute Node:</span>
                    <span className="text-text-primary font-mono">NVIDIA A100 Tensor Core (Gov Cloud)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Quantization Format:</span>
                    <span className="text-telecom-cyan font-bold">FP16 TensorRT Engine</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Total Model Parameters:</span>
                    <span className="text-text-primary">142.8 Million</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-surface-card border border-border-subtle space-y-2">
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider pb-1 border-b border-border-subtle">
                  PROVENANCE & AUDIT ANCHOR
                </div>
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Assessment ID:</span>
                    <span className="text-telecom-cyan font-mono">{currentAssessment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Inference Timestamp:</span>
                    <span className="text-text-primary">{currentAssessment.inferenceTimestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Supervising IO:</span>
                    <span className="text-text-primary">{CURRENT_INVESTIGATOR.name}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Human Review Modal */}
        <HumanReviewModal
          assessment={currentAssessment}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmitDecision={handleReviewDecision}
        />
      </div>
    </WorkstationShell>
  );
}

export default function AiEnginePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-bg-base text-text-muted font-mono text-xs">
          LOADING AI INVESTIGATION ENGINE...
        </div>
      }
    >
      <AiEngineContent />
    </Suspense>
  );
}

