"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Ban,
  Crosshair,
  FileCode,
  Terminal,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Layers,
  Clock,
  X,
} from "lucide-react";
import { StreamNode, DLStage } from "@/types/stream";

interface StreamInspectionDrawerProps {
  selectedNode: StreamNode | null;
  isOpen?: boolean;
  onClose?: () => void;
  onFocusNode?: (nodeId: string) => void;
  onQuarantine?: (nodeId: string) => void;
}

export const StreamInspectionDrawer: React.FC<StreamInspectionDrawerProps> = ({
  selectedNode,
  isOpen = true,
  onClose,
  onFocusNode,
  onQuarantine,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pipeline" | "telemetry" | "logs">("pipeline");

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

  if (!isOpen) return null;

  if (!selectedNode) {
    return (
      <aside className="w-96 border-l border-border-subtle bg-surface-card flex flex-col justify-center items-center shrink-0 z-40 p-6 text-center text-text-muted font-mono text-xs select-none">
        <Terminal className="w-8 h-8 text-text-muted mb-2 opacity-50" />
        <div className="font-bold text-text-secondary uppercase">No Entity Selected</div>
        <p className="text-[10px] text-text-muted mt-1">
          Click any stream node on the radar to inspect real-time 3-stage Deep Learning pipeline progress and extracted telemetry.
        </p>
      </aside>
    );
  }

  // Determine stage status
  const stageOrder: DLStage[] = [
    "INGESTED",
    "MODEL_1_ANOMALY",
    "MODEL_2_CRIME",
    "MODEL_3_VERIFY",
  ];
  const currentStageIndex = stageOrder.indexOf(selectedNode.stage);
  const isFinalized = selectedNode.stage === "FLAGGED" || selectedNode.stage === "CLEARED";

  return (
    <aside className="w-96 border-l border-border-subtle bg-surface-card flex flex-col justify-between shrink-0 z-40 overflow-hidden font-mono select-none transition-all duration-200">
      {/* ================= HEADER ================= */}
      <div className="p-3 border-b border-border-subtle bg-surface-overlay shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                selectedNode.stage === "FLAGGED"
                  ? "bg-threat-crimson status-pulse"
                  : selectedNode.stage === "CLEARED"
                  ? "bg-slate-400"
                  : "bg-telecom-cyan animate-ping"
              }`}
            />
            <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
              DL PIPELINE RADAR
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Stage Pill */}
            <span
              className={`text-[9px] px-1.5 py-0.5 border font-bold ${
                selectedNode.stage === "FLAGGED"
                  ? "bg-threat-crimson-dim text-threat-crimson border-threat-crimson/50"
                  : selectedNode.stage === "CLEARED"
                  ? "bg-surface-overlay text-slate-400 border-border-subtle"
                  : "bg-telecom-cyan-dim text-telecom-cyan border-telecom-cyan/50 animate-pulse"
              }`}
            >
              {selectedNode.stage}
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

        {/* IP Address Title */}
        <div className="text-sm font-bold text-text-primary tracking-tight break-all flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={
                selectedNode.stage === "FLAGGED"
                  ? "text-threat-crimson font-bold"
                  : selectedNode.stage === "CLEARED"
                  ? "text-slate-300"
                  : "text-telecom-cyan font-bold"
              }
            >
              {selectedNode.ip}
            </span>
            <span className="text-[10px] text-text-muted">({selectedNode.countryCode || "NET"})</span>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(selectedNode.ip, "node-ip")}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Copy IP"
          >
            {copiedKey === "node-ip" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Dynamic Subnet & MAC Readout */}
        <div className="text-[10px] text-text-muted mt-1 flex items-center justify-between font-mono">
          <span className="truncate">Subnet: {selectedNode.subnet}</span>
          <span className="truncate">MAC: {selectedNode.mac}</span>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="mt-2 px-2 py-1 bg-telecom-cyan-dim/80 border border-telecom-cyan text-telecom-cyan text-[10px] font-bold">
            ✓ {actionNotice}
          </div>
        )}

        {/* ================= QUICK ACTIONS ================= */}
        <div className="grid grid-cols-3 gap-1 mt-2.5">
          <button
            type="button"
            onClick={() => {
              triggerAction("FOCUSED", () => onFocusNode?.(selectedNode.id));
            }}
            className="px-2 py-1 bg-border-subtle hover:bg-border-highlight text-telecom-cyan border border-telecom-cyan/40 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
            title="Focus camera on node"
          >
            <Crosshair className="w-3 h-3 text-telecom-cyan" />
            <span>Focus</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="px-2 py-1 bg-surface-card hover:bg-border-subtle border border-border-subtle text-text-primary font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
            title="Copy JSON Payload"
          >
            {copiedKey === "node-json" ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <FileCode className="w-3 h-3 text-record-amber" />
            )}
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={() =>
              triggerAction("QUARANTINED", () => onQuarantine?.(selectedNode.id))
            }
            className="px-2 py-1 bg-threat-crimson hover:bg-red-600 text-bg-base font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
            title="Quarantine IP"
          >
            <Ban className="w-3 h-3" />
            <span>Quarantine</span>
          </button>
        </div>

        {/* Nav Tabs */}
        <div className="flex border-b border-border-subtle mt-3 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("pipeline")}
            className={`flex-1 py-1 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === "pipeline"
                ? "border-telecom-cyan text-telecom-cyan"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            3-Stage DL Pipeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("telemetry")}
            className={`flex-1 py-1 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === "telemetry"
                ? "border-telecom-cyan text-telecom-cyan"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            Forensic Telemetry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`flex-1 py-1 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === "logs"
                ? "border-telecom-cyan text-telecom-cyan"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            Audit Stream
          </button>
        </div>
      </div>

      {/* ================= TAB CONTENT ================= */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 text-xs">
        {activeTab === "pipeline" && (
          <div className="space-y-3">
            {/* STAGE 1: ANOMALY DETECTION */}
            <div
              className={`p-2.5 border text-[11px] font-mono transition-all ${
                selectedNode.modelTelemetry?.stage1Anomaly
                  ? selectedNode.modelTelemetry.stage1Anomaly.isAnomalous
                    ? "bg-threat-crimson-dim/30 border-threat-crimson/50"
                    : "bg-surface-overlay/80 border-border-subtle"
                  : selectedNode.stage === "INGESTED"
                  ? "bg-telecom-cyan-dim/20 border-telecom-cyan/50 animate-pulse"
                  : "bg-bg-base/40 border-border-subtle opacity-50"
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-border-subtle mb-2">
                <div className="flex items-center gap-1.5 font-bold text-text-primary">
                  <Activity className="w-3.5 h-3.5 text-telecom-cyan" />
                  <span>Stage 1: Anomaly Detection</span>
                </div>
                <span
                  className={`text-[9px] px-1 font-bold ${
                    selectedNode.modelTelemetry?.stage1Anomaly
                      ? selectedNode.modelTelemetry.stage1Anomaly.isAnomalous
                        ? "bg-threat-crimson text-bg-base"
                        : "bg-slate-700 text-slate-300"
                      : "bg-border-subtle text-text-muted"
                  }`}
                >
                  {selectedNode.modelTelemetry?.stage1Anomaly
                    ? selectedNode.modelTelemetry.stage1Anomaly.isAnomalous
                      ? "ANOMALOUS"
                      : "BENIGN"
                    : selectedNode.stage === "INGESTED"
                    ? "EVALUATING..."
                    : "QUEUED"}
                </span>
              </div>

              {selectedNode.modelTelemetry?.stage1Anomaly ? (
                <div className="space-y-1 text-[10px] text-text-secondary">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Anomaly Score:</span>
                    <span
                      className={
                        selectedNode.modelTelemetry.stage1Anomaly.isAnomalous
                          ? "text-threat-crimson font-bold"
                          : "text-emerald-400"
                      }
                    >
                      {(selectedNode.modelTelemetry.stage1Anomaly.anomalyScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Reconstruction Loss:</span>
                    <span className="text-text-primary font-mono">
                      {selectedNode.modelTelemetry.stage1Anomaly.reconstructionLoss}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Model Latency:</span>
                    <span className="text-emerald-400">
                      {selectedNode.modelTelemetry.stage1Anomaly.latencyMs}ms
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-text-muted">
                  Autoencoder isolating anomalous vs. benign background noise...
                </div>
              )}
            </div>

            {/* STAGE 2: CRIME CLASSIFICATION */}
            <div
              className={`p-2.5 border text-[11px] font-mono transition-all ${
                selectedNode.modelTelemetry?.stage2Crime
                  ? "bg-surface-overlay border-record-amber/50"
                  : selectedNode.stage === "MODEL_1_ANOMALY"
                  ? "bg-telecom-cyan-dim/20 border-telecom-cyan/50 animate-pulse"
                  : "bg-bg-base/40 border-border-subtle opacity-50"
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-border-subtle mb-2">
                <div className="flex items-center gap-1.5 font-bold text-text-primary">
                  <Cpu className="w-3.5 h-3.5 text-record-amber" />
                  <span>Stage 2: Crime Classification</span>
                </div>
                <span
                  className={`text-[9px] px-1 font-bold ${
                    selectedNode.modelTelemetry?.stage2Crime
                      ? "bg-record-amber/20 text-record-amber border border-record-amber/50"
                      : "bg-border-subtle text-text-muted"
                  }`}
                >
                  {selectedNode.modelTelemetry?.stage2Crime
                    ? "CLASSIFIED"
                    : selectedNode.stage === "MODEL_1_ANOMALY"
                    ? "INFERENCE..."
                    : "QUEUED"}
                </span>
              </div>

              {selectedNode.modelTelemetry?.stage2Crime ? (
                <div className="space-y-1 text-[10px] text-text-secondary">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Attack Pattern:</span>
                    <span className="text-record-amber font-bold truncate max-w-[180px]">
                      {selectedNode.modelTelemetry.stage2Crime.predictedCrime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Softmax Probability:</span>
                    <span className="text-text-primary font-bold">
                      {(selectedNode.modelTelemetry.stage2Crime.softmaxProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-text-muted">
                  Multi-class GNN classifying threat vector signatures...
                </div>
              )}
            </div>

            {/* STAGE 3: ENSEMBLE RISK SCORING */}
            <div
              className={`p-2.5 border text-[11px] font-mono transition-all ${
                selectedNode.modelTelemetry?.stage3Ensemble
                  ? selectedNode.stage === "FLAGGED"
                    ? "bg-threat-crimson-dim/40 border-threat-crimson"
                    : "bg-surface-overlay border-border-subtle"
                  : selectedNode.stage === "MODEL_2_CRIME"
                  ? "bg-telecom-cyan-dim/20 border-telecom-cyan/50 animate-pulse"
                  : "bg-bg-base/40 border-border-subtle opacity-50"
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-border-subtle mb-2">
                <div className="flex items-center gap-1.5 font-bold text-text-primary">
                  {selectedNode.stage === "FLAGGED" ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-threat-crimson" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>Stage 3: Ensemble Risk Scoring</span>
                </div>
                <span
                  className={`text-[9px] px-1 font-bold ${
                    selectedNode.stage === "FLAGGED"
                      ? "bg-threat-crimson text-bg-base"
                      : selectedNode.stage === "CLEARED"
                      ? "bg-slate-700 text-slate-300"
                      : "bg-border-subtle text-text-muted"
                  }`}
                >
                  {isFinalized
                    ? selectedNode.stage
                    : selectedNode.stage === "MODEL_3_VERIFY"
                    ? "ARBITRATING..."
                    : "QUEUED"}
                </span>
              </div>

              {selectedNode.modelTelemetry?.stage3Ensemble ? (
                <div className="space-y-1 text-[10px] text-text-secondary">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Ensemble Risk Score:</span>
                    <span
                      className={
                        selectedNode.stage === "FLAGGED"
                          ? "text-threat-crimson font-bold text-xs"
                          : "text-slate-300 font-bold"
                      }
                    >
                      {selectedNode.modelTelemetry.stage3Ensemble.ensembleRiskScore} / 100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Bayesian Confidence:</span>
                    <span className="text-text-primary font-bold">
                      {selectedNode.modelTelemetry.stage3Ensemble.bayesianConfidence}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Final Verdict:</span>
                    <span
                      className={
                        selectedNode.stage === "FLAGGED"
                          ? "text-threat-crimson font-bold"
                          : "text-emerald-400 font-bold"
                      }
                    >
                      {selectedNode.modelTelemetry.stage3Ensemble.finalVerdict}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-text-muted">
                  Bayesian fusion model executing final risk arbitration...
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "telemetry" && (
          <div className="space-y-3">
            <div>
              <div className="bg-surface-overlay/80 px-2 py-1 text-[10px] uppercase font-bold text-text-secondary flex justify-between items-center mb-1">
                <span>Routing &amp; Network</span>
                <Layers className="w-3 h-3 text-text-muted" />
              </div>
              <table className="w-full text-[10px] font-mono border-collapse">
                <tbody>
                  <tr className="border-b border-border-subtle">
                    <td className="p-1.5 text-text-muted w-24 bg-bg-base/40">Subnet CIDR</td>
                    <td className="p-1.5 text-telecom-cyan flex justify-between items-center">
                      <span>{selectedNode.subnet}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedNode.subnet, "sub")}
                        className="text-text-muted hover:text-text-primary cursor-pointer"
                      >
                        {copiedKey === "sub" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="p-1.5 text-text-muted w-24 bg-bg-base/40">MAC Hardware</td>
                    <td className="p-1.5 text-accused-violet flex justify-between items-center">
                      <span>{selectedNode.mac}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedNode.mac, "mac")}
                        className="text-text-muted hover:text-text-primary cursor-pointer"
                      >
                        {copiedKey === "mac" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="p-1.5 text-text-muted w-24 bg-bg-base/40">ASN Org</td>
                    <td className="p-1.5 text-text-primary truncate">{selectedNode.asnOrg || "N/A"}</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="p-1.5 text-text-muted w-24 bg-bg-base/40">Port Matrix</td>
                    <td className="p-1.5 text-threat-crimson">{selectedNode.portMatrix || "80/443"}</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="p-1.5 text-text-muted w-24 bg-bg-base/40">Protocol</td>
                    <td className="p-1.5 text-text-secondary">{selectedNode.protocol || "TCP/IP"}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 text-text-muted w-24 bg-bg-base/40">Payload Volume</td>
                    <td className="p-1.5 text-text-primary">{selectedNode.bytesTransferred || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div className="bg-surface-overlay/80 px-2 py-1 text-[10px] uppercase font-bold text-text-secondary flex justify-between items-center mb-1">
                <span>Cryptographic Hashes</span>
              </div>
              <table className="w-full text-[10px] font-mono border-collapse">
                <tbody>
                  {selectedNode.md5Hash && (
                    <tr className="border-b border-border-subtle">
                      <td className="p-1.5 text-text-muted w-24 bg-bg-base/40">MD5</td>
                      <td className="p-1.5 text-text-primary flex justify-between items-center truncate font-mono">
                        <span className="truncate max-w-[170px]">{selectedNode.md5Hash}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedNode.md5Hash!, "md5")}
                          className="text-text-muted hover:text-text-primary cursor-pointer"
                        >
                          {copiedKey === "md5" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>
                  )}
                  {selectedNode.sha256Hash && (
                    <tr className="border-b border-border-subtle">
                      <td className="p-1.5 text-text-muted w-24 bg-bg-base/40">SHA256</td>
                      <td className="p-1.5 text-text-primary flex justify-between items-center truncate font-mono">
                        <span className="truncate max-w-[170px]">{selectedNode.sha256Hash}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedNode.sha256Hash!, "sha256")}
                          className="text-text-muted hover:text-text-primary cursor-pointer"
                        >
                          {copiedKey === "sha256" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>
                  )}
                  {selectedNode.ja3Fingerprint && (
                    <tr>
                      <td className="p-1.5 text-text-muted w-24 bg-bg-base/40">JA3 TLS</td>
                      <td className="p-1.5 text-text-primary flex justify-between items-center truncate font-mono">
                        <span className="truncate max-w-[170px]">{selectedNode.ja3Fingerprint}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedNode.ja3Fingerprint!, "ja3")}
                          className="text-text-muted hover:text-text-primary cursor-pointer"
                        >
                          {copiedKey === "ja3" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-[10px] text-text-muted mb-1">
              <Clock className="w-3 h-3" />
              <span>Model Execution Audit Trail</span>
            </div>
            <div className="space-y-1.5">
              {(selectedNode.stageLogs || []).map((log, index) => (
                <div
                  key={index}
                  className="p-2 bg-bg-base border border-border-subtle text-[10px] font-mono leading-tight"
                >
                  <div className="flex justify-between text-text-muted text-[9px] mb-1">
                    <span className="text-telecom-cyan font-bold">{log.stage}</span>
                    <span>{log.timestamp.slice(11, 19)} UTC</span>
                  </div>
                  <div className="text-text-secondary">{log.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
