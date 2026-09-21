"use client";

import React, { useState } from "react";
import {
  X,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  FileCheck,
} from "lucide-react";
import { AIAssessmentRecord, HumanReviewDecision } from "@/types/ai";
import { CURRENT_INVESTIGATOR } from "@/data/dfir-mock-database";

interface HumanReviewModalProps {
  assessment: AIAssessmentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitDecision: (decision: HumanReviewDecision, notes: string) => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onSubmitDecision,
}) => {
  const [selectedDecision, setSelectedDecision] = useState<HumanReviewDecision>("CONFIRM_INVESTIGATIVE_LEAD");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !assessment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitDecision(selectedDecision, reviewNotes);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
      <div className="w-full max-w-lg bg-surface-card border border-border-highlight p-4 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2.5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-telecom-cyan" />
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              HUMAN-IN-THE-LOOP INVESTIGATOR REVIEW
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Ethical Disclaimer */}
        <div className="p-2.5 bg-surface-overlay border border-border-subtle text-[10px] text-text-secondary leading-relaxed">
          <span className="text-record-amber font-bold">PROCEDURAL MANDATE: </span>
          AI model predictions provide investigative leads only and do NOT constitute proof of guilt or formal legal conviction. All actions are logged into the permanent audit ledger.
        </div>

        {/* Target Entity Summary */}
        <div className="p-2.5 bg-bg-base border border-border-subtle space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-text-muted text-[10px]">TARGET ENTITY:</span>
            <span className="font-bold text-text-primary">{assessment.targetIdentifier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted text-[10px]">PRELIMINARY RISK:</span>
            <span className="font-bold text-threat-crimson">{assessment.stage3Output.fusedRiskScore}% RISK</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted text-[10px]">MODEL VERSION:</span>
            <span className="text-text-secondary">{assessment.modelVersion}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] uppercase text-text-muted block mb-1">
              SELECT FORMAL INVESTIGATIVE DETERMINATION:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDecision("CONFIRM_INVESTIGATIVE_LEAD")}
                className={`p-2 border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                  selectedDecision === "CONFIRM_INVESTIGATIVE_LEAD"
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold"
                    : "bg-surface-overlay border-border-subtle text-text-secondary hover:border-border-highlight"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px]">CONFIRM LEAD</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDecision("MARK_INCORRECT")}
                className={`p-2 border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                  selectedDecision === "MARK_INCORRECT"
                    ? "bg-red-950/80 border-red-500 text-red-400 font-bold"
                    : "bg-surface-overlay border-border-subtle text-text-secondary hover:border-border-highlight"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px]">MARK INCORRECT</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDecision("NEEDS_MORE_EVIDENCE")}
                className={`p-2 border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                  selectedDecision === "NEEDS_MORE_EVIDENCE"
                    ? "bg-amber-950/80 border-amber-500 text-amber-400 font-bold"
                    : "bg-surface-overlay border-border-subtle text-text-secondary hover:border-border-highlight"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px]">MORE EVIDENCE</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDecision("ESCALATE_TO_SUPERVISOR")}
                className={`p-2 border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                  selectedDecision === "ESCALATE_TO_SUPERVISOR"
                    ? "bg-purple-950/80 border-purple-500 text-purple-400 font-bold"
                    : "bg-surface-overlay border-border-subtle text-text-secondary hover:border-border-highlight"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px]">ESCALATE TO SP</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase text-text-muted block mb-1">
              INVESTIGATOR RATIONALE &amp; EVIDENCE REFERENCES:
            </label>
            <textarea
              required
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Detail corroborating subscriber records, CDR timestamps, or legal justification for determination..."
              className="w-full bg-bg-base border border-border-subtle text-text-primary p-2 text-xs focus:outline-none focus:border-telecom-cyan resize-none font-mono"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
            <div className="text-[9px] text-text-muted">
              OFFICER: {CURRENT_INVESTIGATOR.badgeNumber} ({CURRENT_INVESTIGATOR.name})
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 bg-surface-overlay hover:bg-border-subtle border border-border-subtle text-text-muted text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1 bg-telecom-cyan-dim border border-telecom-cyan text-telecom-cyan hover:bg-telecom-cyan/30 font-bold text-xs cursor-pointer transition-colors"
              >
                {isSubmitting ? "Signing Record..." : "Submit Review"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
