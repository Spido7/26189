# CINDRA — AI-Powered Criminal Network Analysis System
> **SIH Problem Statement ID:** 26189  
> **Organization:** Ministry of Home Affairs | National Crime Records Bureau (NCRB)  
> **Category:** Software | **Theme:** Blockchain & Cybersecurity  

---

## 📌 Executive Summary
**CINDRA** is an Explainable AI (XAI) and Knowledge Graph platform powered by **Smart IP Tracking**. It transforms fragmented crime data (FIRs, Call Detail Records, financial transaction logs, and device metadata) into interactive, evidence-backed network graphs. By calculating relationship weights and centrality metrics, CINDRA enables NCRB and state police analysts to identify hidden criminal syndicates and key influencers with high precision.

---

## 🔥 Top Core Innovations

* 🛠️ **End-to-End Automation:** Automatically ingests and normalizes multi-source raw logs (FIRs, CDRs, bank records, IMEI/IP logs).
* 🌐 **Smart IP & Cyber Tracking:** Maps digital footprints (IP addresses, device metadata) directly onto physical locations and suspect logs.
* 🎯 **Automated Kingpin Detection:** Employs weighted graph centrality algorithms (PageRank, Betweenness) to isolate syndicate leaders.
* 🔍 **Explainable AI (XAI) & Auditability:** Traces every graph edge and anomaly back to its original source document (FIR line items, CDR timestamps) for court-ready reports.

---

## ⚙️ Core Architecture & Pipeline
[Raw Ingestion Engine] ──► [PII Encryption & Normalization] ──► [Smart IP Correlation]
│
[Interactive Dashboard] ◄── [Weighted Knowledge Graph Engine] ◄────────┘


1. **Ingestion & Security Layer:** Ingests unstructured police reports and structured CSV logs; encrypts PII at rest and in transit.
2. **Correlation & Extraction Engine:** Runs multilingual processing and Smart IP correlation to resolve digital footprints.
3. **Knowledge Graph & Analytics:** Constructs multi-node graphs with weighted edges representing relationship strength.
4. **Forensic Interface:** Renders interactive graphs with multi-hop node expansion, anomaly filters, and exportable dossiers.

---

## 🚀 Quick Start Guide

### Prerequisites
* Python 3.10+
* Node.js 18+

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
2. Frontend Setup
Bash
cd frontend
npm install
npm start
🛡️ Security & Compliance
Role-Based Access Control (RBAC): Restricts case access to authorized investigative personnel.

On-Premise Ready: Containerized via Docker for secure deployment on government infrastructure.


---

### 💡 Pro-Tips for SIH Judges Reviewing Your Code:
1. **Commit History:** Ensure team members push commits with clear messages (e.g., `feat: added smart IP correlation module`, `fix: graph edge weight calculation`).
2. **Sample Data:** Keep non-sensitive, synthetic sample files in `data/synthetic_samples/` so anyone reviewing the repo can run a quick demo without configuring external databases.
3. **Repository Settings:** Ensure the visibility is set appropriately (public or shared with evaluators) and that `requirements.txt` / `package.json` are fully up to date.