# DFIR Threat Radar - Cyber Crime Investigation Platform

An enterprise Digital Forensics & Incident Response (DFIR) terminal and threat radar workstation featuring automated threat ingestion, 3-stage Deep Learning pipeline classification, dynamic relationship graphs, auto-centering, and localized Indian cybercrime dossiers.

---

## 📁 Project Structure

```
frontend/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── next-env.d.ts
├── .gitignore
└── src/
    ├── app/
    │   ├── api/neo4j/route.ts
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── graph/
    │   │   ├── GraphContainer.tsx
    │   │   ├── NetworkGraph.tsx
    │   │   └── ThreatRadarStream.tsx
    │   ├── inspector/
    │   │   └── DetailDrawer.tsx
    │   ├── EntityGraphCanvas.tsx
    │   ├── EntityStatusBadge.tsx
    │   ├── ForensicMetadataDrawer.tsx
    │   ├── InvestigationCommandBar.tsx
    │   ├── SidebarNav.tsx
    │   └── StreamInspectionDrawer.tsx
    ├── data/
    │   ├── cyber-packet-pool.ts
    │   └── forensics-mock.ts
    ├── hooks/
    │   └── useCyberStream.ts
    ├── lib/
    │   ├── neo4j.ts
    │   └── tokens.ts
    └── types/
        ├── forensics.ts
        ├── radar.ts
        └── stream.ts
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Core Features

1. **Live Ingestion Radar**:
   - Sequential, real-time packet feed simulating live ingress.
   - Nodes transition visually through scanning, evaluating, and confirmed threat stages with distinct animations.
   - Dynamic relationship edge formation based on shared hardware (MAC collisions) and subnet CIDRs.

2. **Isolated Tri-Syndicate Architecture**:
   - **Syndicate 1 (Jamtara Phishing & Mule Network)** - FIR-0104/2026 (BKC Cyber Cell, Mumbai).
   - **Syndicate 2 (Hawala & Crypto Laundering Ring)** - FIR-2024-8842 (CCPS Central Range, Bengaluru).
   - **Syndicate 3 (Transnational Extortion & SIM-Swap Cartel)** - FIR-7719/2026 (CBI Special Cyber Crime Unit, New Delhi).
   - Complete network isolation with 0 cross-linking between groups. Selecting a syndicate filters the canvas strictly to that group.

3. **Auto-Centering Physics Engine**:
   - Real-time bounding-box centering and viewport auto-fit upon selecting individual syndicates or resizing the window.
   - Floating on-canvas controls for immediate manual auto-center, zoom, and physics reheat.

4. **Sleek 3-Tab Forensic Inspector Drawer**:
   - **Personal Info**: Full name, demographics, redacted Aadhaar ID (`[Aadhaar Redacted]`), contact details, and known associates.
   - **FIR Dossier**: Official FIR ledger, BNS/IT Act legal sections, non-bailable warrants, and hash-verified custody stamps.
   - **Telephony (CDR)**: Detailed Call Detail Records, cell tower sectors, and call duration mini-tables.

5. **Graph Database & Python NetworkX Integration**:
   - Cypher query exporter for Neo4j transactional ingestion.
   - Microservice-ready data format compatible with Python NetworkX for graph algorithms (Louvain community detection, betweenness centrality, degree distribution).
