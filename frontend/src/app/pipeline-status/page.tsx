"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import {
  Cpu,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  Terminal,
  Radio,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Layers,
  ShieldCheck,
  Hash,
  Sparkles,
} from "lucide-react";

export default function PipelineStatusPage() {
  const [activeCaseId, setActiveCaseId] = useState<string>("FIR-2024-8842");
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});
  const [isLogsCollapsed, setIsLogsCollapsed] = useState<boolean>(false);

  const toggleStage = (stageKey: string) => {
    setCollapsedStages((prev) => ({
      ...prev,
      [stageKey]: !prev[stageKey],
    }));
  };

  const handleToggleAllStages = () => {
    const areAnyCollapsed = Object.values(collapsedStages).some((v) => v) || isLogsCollapsed;
    if (areAnyCollapsed) {
      setCollapsedStages({});
      setIsLogsCollapsed(false);
    } else {
      setCollapsedStages({ stage1: true, stage2: true, stage3: true });
      setIsLogsCollapsed(true);
    }
  };

  return (
    <WorkstationShell activeCaseId={activeCaseId} onCaseChange={setActiveCaseId}>
      <div className="flex-1 w-full h-full relative overflow-y-auto bg-[#0c0e12] font-mono select-none p-4 space-y-4 custom-scrollbar text-xs text-slate-200 bg-industrial-grid">
        {/* ================= HEADER ================= */}
        <div className="p-4 border border-slate-700/60 bg-[#13171e] rounded flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-amber-500/30 bg-amber-500/10 text-amber-400 rounded">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-bold text-slate-100 tracking-wider uppercase">
                  3-STAGE AI PIPELINE ORCHESTRATOR
                </h1>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded">
                  [ONLINE // CUDA-12]
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 rounded">
                  TENSORRT-X
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Deep Learning execution telemetry for Autoencoder (Stage 1), GNN Correlation (Stage 2), and Bayesian Risk Fusion (Stage 3).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAllStages}
              className="px-3 py-1.5 bg-[#1a202a] hover:bg-[#222a36] text-slate-300 hover:text-slate-100 border border-slate-700/60 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ChevronsUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Toggle All Stages</span>
            </button>
            <Link
              href="/ai-engine"
              className="px-3 py-1.5 bg-[#1a202a] hover:bg-[#222a36] text-slate-300 hover:text-slate-100 border border-slate-700/60 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Inspect Weights</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
            </Link>
            <Link
              href="/radar"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Launch Threat Radar</span>
            </Link>
          </div>
        </div>

        {/* ================= METRICS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#13171e] rounded border border-slate-700/60 flex flex-col justify-between space-y-1 shadow-sm">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">THROUGHPUT ENGINE</span>
            <span className="text-base font-bold text-sky-400 font-mono">14,280 pkts/s</span>
            <span className="text-[9px] text-emerald-400 font-semibold">Zero Packet Drop Rate</span>
          </div>

          <div className="p-3.5 bg-[#13171e] rounded border border-slate-700/60 flex flex-col justify-between space-y-1 shadow-sm">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">PIPELINE LATENCY</span>
            <span className="text-base font-bold text-emerald-400 font-mono">41.1 ms</span>
            <span className="text-[9px] text-slate-400 font-mono">P99 SLA: 58.4ms</span>
          </div>

          <div className="p-3.5 bg-[#13171e] rounded border border-slate-700/60 flex flex-col justify-between space-y-1 shadow-sm">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">CORRELATED THREATS</span>
            <span className="text-base font-bold text-red-400 font-mono">38 Flagged</span>
            <span className="text-[9px] text-red-400 font-semibold">Confidence &gt; 92.4%</span>
          </div>

          <div className="p-3.5 bg-[#13171e] rounded border border-slate-700/60 flex flex-col justify-between space-y-1 shadow-sm">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">EVIDENCE AUDIT HASH</span>
            <span className="text-base font-bold text-amber-400 font-mono">100% SHA-256</span>
            <span className="text-[9px] text-emerald-400 font-semibold">Sec 65B Certified</span>
          </div>
        </div>

        {/* ================= 3-STAGE CARDS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* STAGE 1 */}
          <div className="bg-[#13171e] rounded border border-slate-700/60 flex flex-col justify-between space-y-3 p-4 transition-all shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleStage("stage1")}
                  className="flex items-center gap-1.5 text-[9px] font-bold text-amber-400 hover:text-amber-300 tracking-wider uppercase cursor-pointer"
                >
                  {collapsedStages.stage1 ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  <span>PHASE 01 · INGRESS INFERENCE</span>
                </button>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold font-mono">
                  8.4ms
                </span>
              </div>
              <h2 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                STAGE 1: CYBER TELEMETRY VAE
              </h2>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Variational Autoencoder reconstructing packet header vectors and detecting entropy deviations across streaming telecom taps.
              </p>
            </div>

            {!collapsedStages.stage1 && (
              <>
                <div className="space-y-1.5 pt-2.5 border-t border-slate-700/60 text-[10px] text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">NEURAL ARCH:</span>
                    <span className="text-slate-100 font-semibold">AutoEncoder-v3.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">INGESTED VOLUME:</span>
                    <span className="text-emerald-400 font-semibold">14,280 Packets</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RECONSTRUCTION LOSS:</span>
                    <span className="text-amber-400 font-semibold">0.0034 MSE</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0c0e12] border border-slate-700/60 text-[9px] text-slate-400">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Feature Extraction Layer Active &amp; Calibrated</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* STAGE 2 */}
          <div className="bg-[#13171e] rounded border border-slate-700/60 flex flex-col justify-between space-y-3 p-4 transition-all shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleStage("stage2")}
                  className="flex items-center gap-1.5 text-[9px] font-bold text-amber-400 hover:text-amber-300 tracking-wider uppercase cursor-pointer"
                >
                  {collapsedStages.stage2 ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  <span>PHASE 02 · GNN CORRELATION</span>
                </button>
                <span className="text-[9px] px-1.5 py-0.2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded font-bold font-mono">
                  14.1ms
                </span>
              </div>
              <h2 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                STAGE 2: BEHAVIOR &amp; GNN LINKING
              </h2>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Graph Neural Network message passing across shared MAC hardware, crypto escrows, and proxy routers.
              </p>
            </div>

            {!collapsedStages.stage2 && (
              <>
                <div className="space-y-1.5 pt-2.5 border-t border-slate-700/60 text-[10px] text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">NEURAL ARCH:</span>
                    <span className="text-slate-100 font-semibold">GraphSAGE 3-Hop</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ACTIVE CARTELS:</span>
                    <span className="text-sky-400 font-semibold">3 Triangulated Clusters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CORRELATED VECTORS:</span>
                    <span className="text-amber-400 font-semibold">16 Dynamic Links</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0c0e12] border border-slate-700/60 text-[9px] text-slate-400">
                  <div className="text-sky-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cross-Table Graph Correlated</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* STAGE 3 */}
          <div className="bg-[#13171e] rounded border border-slate-700/60 flex flex-col justify-between space-y-3 p-4 transition-all shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleStage("stage3")}
                  className="flex items-center gap-1.5 text-[9px] font-bold text-amber-400 hover:text-amber-300 tracking-wider uppercase cursor-pointer"
                >
                  {collapsedStages.stage3 ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  <span>PHASE 03 · BAYESIAN FUSION</span>
                </button>
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-bold font-mono">
                  18.6ms
                </span>
              </div>
              <h2 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                STAGE 3: MULTI-MODAL RISK FUSION
              </h2>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Bayesian risk fusion combining FIR police charges, telecom CDR towers, and XAI explainability metrics.
              </p>
            </div>

            {!collapsedStages.stage3 && (
              <>
                <div className="space-y-1.5 pt-2.5 border-t border-slate-700/60 text-[10px] text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">FUSION ENGINE:</span>
                    <span className="text-slate-100 font-semibold">BayesFusion + SHAP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CRITICAL TARGETS:</span>
                    <span className="text-red-400 font-semibold">12 Suspects Flagged</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PENDING REVIEW:</span>
                    <span className="text-amber-400 font-semibold">5 Case Dossiers</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0c0e12] border border-slate-700/60 text-[9px] text-slate-400">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Human-in-the-Loop Review Sign-off Active</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= LOGS ================= */}
        <div className="bg-[#13171e] rounded border border-slate-700/60 p-4 space-y-2.5 transition-all shadow-md">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsLogsCollapsed((prev) => !prev)}
              className="flex items-center gap-2 text-slate-200 hover:text-amber-400 cursor-pointer"
            >
              {isLogsCollapsed ? (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-400" />
              )}
              <Terminal className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-100 text-xs tracking-wider uppercase">
                PIPELINE EXECUTION TELEMETRY STREAM
              </span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">[CONSOLE // STDOUT]</span>
          </div>

          {!isLogsCollapsed && (
            <div className="space-y-1.5 font-mono text-[10px] bg-[#0c0e12] p-3 rounded border border-slate-700/60 max-h-48 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">[10:38:12]</span>
                <span className="text-emerald-400 font-bold">[STAGE-1]</span>
                <span>103.212.43.18 processed (Loss: 0.0012). Normal entropy profile.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">[10:38:13]</span>
                <span className="text-sky-400 font-bold">[STAGE-2]</span>
                <span>Shared MAC A4:C3:F0:89:12:DE links Sunil Kumar Mondal &lt;-&gt; Rahul Dev Mandal.</span>
              </div>
              <div className="flex items-center gap-2 text-red-300">
                <span className="text-slate-500">[10:38:14]</span>
                <span className="text-red-400 font-bold">[STAGE-3]</span>
                <span>Jamtara Phishing Ring Flagged (Conf: 98.4%). Linked to FIR-0104.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">[10:38:18]</span>
                <span className="text-purple-400 font-bold">[STAGE-2]</span>
                <span>182.73.192.44 correlated to USDT Escrow OTC Desk with Harish Chand Aggarwal.</span>
              </div>
              <div className="flex items-center gap-2 text-red-300">
                <span className="text-slate-500">[10:38:20]</span>
                <span className="text-red-400 font-bold">[STAGE-3]</span>
                <span>Delhi Hawala Ring Flagged (Conf: 99.1%). Linked to FIR-8842.</span>
              </div>
              <div className="flex items-center gap-2 text-red-300">
                <span className="text-slate-500">[10:38:26]</span>
                <span className="text-red-400 font-bold">[STAGE-3]</span>
                <span>Bengaluru Ransomware Cartel Flagged (Conf: 99.0%). Linked to FIR-7719.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkstationShell>
  );
}
