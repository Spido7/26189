// Law Enforcement Case & FIR Legal Taxonomy Data Model

export type LegalCaseStatus =
  | "COMPLAINT_REGISTERED"
  | "FIR_LODGED"
  | "UNDER_INVESTIGATION"
  | "CHARGE_SHEET_FILED"
  | "COURT_PROCEEDINGS"
  | "CONVICTION_ORDERED"
  | "ACQUITTAL"
  | "CASE_CLOSED";

export type CasePriority = "CRITICAL" | "HIGH" | "MEDIUM" | "ROUTINE";

export interface FIRDossier {
  firNumber: string;
  year: number;
  policeStation: string;
  state: string;
  lodgedDate: string;
  sectionsApplicable: string[]; // e.g. ["BNS 318(4)", "IT Act Sec 66C", "IT Act Sec 66D"]
  bnsSections?: string[];
  ipcSectionsEquivalent?: string[];
  complainantName: string;
  accusedPersons: Array<{
    name: string;
    alias?: string;
    legalRole: "PRIMARY_ACCUSED" | "CO_CONSPIRATOR" | "SUSPECT" | "ACQUITTED" | "PERSON_OF_INTEREST";
    arrestStatus: "ABSCONDING" | "ARRESTED_CUSTODY" | "BAIL_GRANTED" | "NOTICE_ISSUED";
    aadhaarRedactedRef: string;
  }>;
  documentHash: string;
  certifiedSealStamp: string;
  synopsisSummary: string;
  investigatingOfficer: string;
}

export interface CaseInvestigation {
  id: string;
  caseNumber: string;
  title: string;
  category: "FINANCIAL_FRAUD_JAMTARA" | "CRYPTO_HAWALA" | "TRANSNATIONAL_EXTORTION" | "MALWARE_RANSOMWARE" | string;
  status: LegalCaseStatus;
  priority: CasePriority;
  syndicateTag: string;
  leadInvestigator: {
    name: string;
    badge: string;
    division: string;
  };
  assignedAnalysts: string[];
  firs: FIRDossier[];
  associatedEntityIds: string[];
  associatedEvidenceIds: string[];
  createdAt: string;
  updatedAt: string;
  summary: string;
  notes: Array<{
    id: string;
    author: string;
    role: string;
    timestamp: string;
    content: string;
  }>;
  timeline: Array<{
    id: string;
    timestamp: string;
    title: string;
    description: string;
    category: "INGRESS" | "LEGAL" | "SEIZURE" | "INTERCEPT" | "AI_ASSESSMENT";
  }>;
}
