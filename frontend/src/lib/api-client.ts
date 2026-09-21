/**
 * DFIR // INTELLIGENCE COMMAND - FastAPI Backend Service Client
 * 
 * Provides typed interfaces and an adapter architecture connecting the Next.js frontend
 * to FastAPI backend services (when available) with graceful fallback to simulated demo mode.
 */

import { CaseInvestigation } from "@/types/case";
import { DFIREvidenceItem } from "@/types/evidence";
import { AIAssessmentRecord } from "@/types/ai";
import { AuditLogEntry } from "@/types/audit";
import { MOCK_CASES, MOCK_EVIDENCE_ITEMS, MOCK_AI_ASSESSMENTS, MOCK_AUDIT_LOGS } from "@/data/dfir-mock-database";

export interface BackendServiceStatus {
  isLive: boolean;
  endpoint: string;
  version: string;
  environment: "LIVE_FASTAPI" | "DEMO_SIMULATION";
  services: {
    telemetryIngest: "ONLINE" | "STANDBY" | "SIMULATED";
    neo4jGraph: "ONLINE" | "STANDBY" | "SIMULATED";
    aiInference: "ONLINE" | "STANDBY" | "SIMULATED";
    evidenceVault: "ONLINE" | "STANDBY" | "SIMULATED";
  };
}

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class DFIRApiClient {
  private isConnectedToLive = false;

  constructor() {
    // Check if live environment variable is explicitly set
    this.isConnectedToLive = Boolean(process.env.NEXT_PUBLIC_ENABLE_LIVE_API);
  }

  public getEnvironmentStatus(): BackendServiceStatus {
    return {
      isLive: this.isConnectedToLive,
      endpoint: FASTAPI_BASE_URL,
      version: "v2.4.0-LEO",
      environment: this.isConnectedToLive ? "LIVE_FASTAPI" : "DEMO_SIMULATION",
      services: {
        telemetryIngest: this.isConnectedToLive ? "ONLINE" : "SIMULATED",
        neo4jGraph: "ONLINE", // Via local bolt or http
        aiInference: this.isConnectedToLive ? "ONLINE" : "SIMULATED",
        evidenceVault: "SIMULATED",
      },
    };
  }

  // --- CASES SERVICE ---
  public async getCases(): Promise<{ data: CaseInvestigation[]; isSimulated: boolean }> {
    if (this.isConnectedToLive) {
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/api/v1/cases`);
        if (res.ok) {
          const data = await res.json();
          return { data, isSimulated: false };
        }
      } catch {
        // Fall back to mock
      }
    }
    return { data: MOCK_CASES, isSimulated: true };
  }

  public async getCaseById(caseId: string): Promise<{ data: CaseInvestigation | null; isSimulated: boolean }> {
    const { data } = await this.getCases();
    const found = data.find((c) => c.id === caseId || c.caseNumber === caseId) || data[0] || null;
    return { data: found, isSimulated: true };
  }

  // --- EVIDENCE SERVICE ---
  public async getEvidenceItems(): Promise<{ data: DFIREvidenceItem[]; isSimulated: boolean }> {
    if (this.isConnectedToLive) {
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/api/v1/evidence`);
        if (res.ok) {
          const data = await res.json();
          return { data, isSimulated: false };
        }
      } catch {
        // Fall back
      }
    }
    return { data: MOCK_EVIDENCE_ITEMS, isSimulated: true };
  }

  // --- AI ASSESSMENTS SERVICE ---
  public async getAIAssessments(): Promise<{ data: AIAssessmentRecord[]; isSimulated: boolean }> {
    if (this.isConnectedToLive) {
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/api/v1/ai/assessments`);
        if (res.ok) {
          const data = await res.json();
          return { data, isSimulated: false };
        }
      } catch {
        // Fall back
      }
    }
    return { data: MOCK_AI_ASSESSMENTS, isSimulated: true };
  }

  // --- AUDIT LOGS SERVICE ---
  public async getAuditLogs(): Promise<{ data: AuditLogEntry[]; isSimulated: boolean }> {
    if (this.isConnectedToLive) {
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/api/v1/audit/logs`);
        if (res.ok) {
          const data = await res.json();
          return { data, isSimulated: false };
        }
      } catch {
        // Fall back
      }
    }
    return { data: MOCK_AUDIT_LOGS, isSimulated: true };
  }
}

export const apiClient = new DFIRApiClient();
