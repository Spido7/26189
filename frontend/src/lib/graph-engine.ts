import { ALL_THREE_SYNDICATES_DATA } from "@/data/cyber-packet-pool";
import { MOCK_CASES, MOCK_EVIDENCE_ITEMS } from "@/data/dfir-mock-database";
import { master, fir_records, person_details, cdr_records } from "@/data/mockDatabase";
import { EntityCategory } from "@/types/entity";
import { EvidenceOrigin, RelationshipCategory } from "@/types/relationship";

export interface InvestigationNode {
  id: string;
  name: string;
  category: EntityCategory | "WALLET";
  riskScore: number;
  isFlagged: boolean;
  syndicate: string;
  caseRef: string;
  details: string;
  metadata: {
    demographics?: {
      fullName?: string;
      alias?: string;
      age?: number;
      sex?: string;
      residence?: string;
      occupation?: string;
      aadhaarRedacted?: string;
      knownAssociates?: string;
    };
    network?: {
      ip?: string;
      mac?: string;
      cidr?: string;
      asnOrg?: string;
      isp?: string;
      protocol?: string;
      ports?: string;
    };
    telecom?: {
      phone?: string;
      imei?: string;
      imsi?: string;
      carrier?: string;
      towerLocation?: string;
      callDuration?: string;
    };
    legal?: {
      firId?: string;
      firDate?: string;
      policeStation?: string;
      sections?: string[];
      charges?: string;
      accusedList?: string;
      certifiedSeal?: string;
      documentHash?: string;
    };
    evidence?: {
      evidenceId?: string;
      format?: string;
      sourceDevice?: string;
      sha256?: string;
      blockNumber?: number;
    };
    geo?: {
      coordinates?: string;
      locationName?: string;
      latitude?: number;
      longitude?: number;
    };
  };
  degree: number;
  betweenness?: number;
  pinned?: boolean;
  fx?: number;
  fy?: number;
  x?: number;
  y?: number;
  timestamp?: string;
}

export interface InvestigationEdge {
  id: string;
  source: any; // node ID string or object when ForceGraph processes
  target: any;
  type: RelationshipCategory | "SHARED_MAC" | "ASSOCIATED_DEVICE";
  label: string;
  confidence: number;
  provenance: EvidenceOrigin;
  sourceDescription: string;
  evidenceRef: string;
  authorizationContext: string;
  timestamp: string;
}

export interface InvestigationGraphData {
  nodes: InvestigationNode[];
  edges: InvestigationEdge[];
}

/**
 * Builds normalized graph nodes and edges from all multi-source intelligence pools.
 * Filters strictly according to active caseId ("ALL" or specific caseRef).
 */
export function buildInvestigationGraph(caseId: string = "ALL"): InvestigationGraphData {
  const nodesMap = new Map<string, InvestigationNode>();
  const edgesMap = new Map<string, InvestigationEdge>();

  // Determine active case filter match
  const matchCase = (ref?: string) => {
    if (!ref || caseId === "ALL") return true;
    const cleanFilter = caseId.split("/")[0].replace("FIR-", "");
    return ref.includes(cleanFilter) || ref.includes(caseId);
  };

  // 1. Ingest Packets from ALL_THREE_SYNDICATES_DATA
  ALL_THREE_SYNDICATES_DATA.forEach((pkt, idx) => {
    if (!matchCase(pkt.caseRef)) return;

    const caseRef = pkt.caseRef || "FIR-0104/2026";
    const syndicateName = pkt.personalInfo?.syndicateAffiliation || "Syndicate Group";

    // A. Person Node
    const personName = pkt.personalInfo?.fullName || `Suspect ${idx}`;
    const personId = `node-person-${personName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    if (!nodesMap.has(personId)) {
      nodesMap.set(personId, {
        id: personId,
        name: personName,
        category: "PERSON",
        riskScore: Math.round(pkt.anomalyScore * 100),
        isFlagged: pkt.isThreat,
        syndicate: syndicateName,
        caseRef,
        details: pkt.personalInfo?.occupation || "Suspect Operative",
        metadata: {
          demographics: {
            fullName: personName,
            alias: pkt.accusedName !== personName ? pkt.accusedName : "Primary Accused",
            age: 34,
            sex: "Male",
            residence: typeof pkt.personalInfo?.demography === "string" ? pkt.personalInfo?.demography : "Maharashtra / Karnataka",
            occupation: pkt.personalInfo?.occupation,
            aadhaarRedacted: "[Aadhaar Redacted]",
            knownAssociates: pkt.personalInfo?.knownAssociates || "Co-Accused Operatives",
          },
          geo: {
            locationName: pkt.location || "Urban Metro Jurisdiction",
            coordinates: pkt.location?.includes("Mumbai") ? "19.0760° N, 72.8777° E" : "12.9716° N, 77.5946° E",
          },
        },
        degree: 0,
        pinned: false,
        timestamp: pkt.timestamp || "2026-08-14 17:45:10 IST",
      });
    }

    // B. IP Host Node
    if (pkt.ip) {
      const ipId = `node-ip-${pkt.ip.replace(/[^a-z0-9]/g, "-")}`;
      if (!nodesMap.has(ipId)) {
        nodesMap.set(ipId, {
          id: ipId,
          name: pkt.ip,
          category: "IP",
          riskScore: Math.round(pkt.anomalyScore * 100),
          isFlagged: pkt.isThreat,
          syndicate: pkt.asnOrg || pkt.ispDhcp || "Carrier IP Gateway",
          caseRef,
          details: `${pkt.protocol || "TCP/TLS"} · ${pkt.asnOrg || "ISP Lease"}`,
          metadata: {
            network: {
              ip: pkt.ip,
              mac: pkt.mac,
              cidr: pkt.subnet || `${pkt.ip}/24`,
              asnOrg: pkt.asnOrg,
              isp: pkt.ispDhcp,
              protocol: pkt.protocol,
              ports: "443/TCP, 8080/TCP, 9001/TCP",
            },
            geo: {
              locationName: pkt.location || "India Telecommunication Hub",
            },
          },
          degree: 0,
          pinned: false,
          timestamp: pkt.timestamp || "2026-08-14 18:00:00 IST",
        });
      }

      // Edge: Person -> IP
      const relPersonIpId = `rel-${personId}-${ipId}`;
      if (!edgesMap.has(relPersonIpId)) {
        edgesMap.set(relPersonIpId, {
          id: relPersonIpId,
          source: personId,
          target: ipId,
          type: "ROUTED_TRAFFIC",
          label: "ROUTED_TRAFFIC",
          confidence: 96,
          provenance: "OBSERVED_NETWORK_DATA",
          sourceDescription: "Live Packet Ingress Sniffer Mirror Session (Port 443)",
          evidenceRef: "EVD-2026-001 (PCAP)",
          authorizationContext: "CrPC Sec 91 Lawful Production Order",
          timestamp: pkt.timestamp || "2026-08-14 17:45:10 IST",
        });
      }
    }

    // C. Phone Node
    const phoneNo = pkt.personalInfo?.contactDetails?.phone;
    if (phoneNo) {
      const phoneId = `node-phone-${phoneNo.replace(/[^a-z0-9]/g, "-")}`;
      if (!nodesMap.has(phoneId)) {
        nodesMap.set(phoneId, {
          id: phoneId,
          name: phoneNo,
          category: "PHONE",
          riskScore: pkt.isThreat ? 88 : 45,
          isFlagged: pkt.isThreat,
          syndicate: syndicateName,
          caseRef,
          details: `MSISDN · ${pkt.cdrDetails?.towerLocation ? "Tower Tracked" : "Telco SIM"}`,
          metadata: {
            telecom: {
              phone: phoneNo,
              imei: "356938035643809",
              imsi: "404450123456789",
              carrier: "VoLTE Subscriber Line",
              towerLocation: pkt.cdrDetails?.towerLocation || "Sector BTS Hub",
              callDuration: pkt.cdrDetails?.callTypeAndDuration || "14 CDR Records",
            },
          },
          degree: 0,
          pinned: false,
          timestamp: pkt.timestamp || "2026-08-14 14:20:00 IST",
        });
      }

      // Edge: Person -> Phone
      const relPersonPhoneId = `rel-${personId}-${phoneId}`;
      if (!edgesMap.has(relPersonPhoneId)) {
        edgesMap.set(relPersonPhoneId, {
          id: relPersonPhoneId,
          source: personId,
          target: phoneId,
          type: "REGISTERED_TO",
          label: "REGISTERED_TO",
          confidence: 99,
          provenance: "PROVIDER_DERIVED_DATA",
          sourceDescription: "Telco Customer Application Form (CAF) Archive",
          evidenceRef: "DOC-CAF-SUB-9021",
          authorizationContext: "CrPC Sec 91 Telco Subpoena",
          timestamp: "2026-08-14 14:20:00 IST",
        });
      }
    }

    // D. FIR Node
    const firIdStr = pkt.firDetails?.firId || caseRef;
    const firNodeId = `node-fir-${firIdStr.replace(/[^a-z0-9]/g, "-")}`;
    if (!nodesMap.has(firNodeId)) {
      nodesMap.set(firNodeId, {
        id: firNodeId,
        name: `FIR ${firIdStr}`,
        category: "FIR",
        riskScore: 95,
        isFlagged: false,
        syndicate: pkt.firDetails?.policeStation || "Cyber Crime Police Station",
        caseRef,
        details: pkt.firDetails?.policeStation || "State Cyber Register",
        metadata: {
          legal: {
            firId: firIdStr,
            firDate: pkt.firDetails?.firDate || "2026-08-14",
            policeStation: pkt.firDetails?.policeStation || "Cyber Police Station",
            sections: [pkt.firDetails?.crpcBnsSection || "BNS 318(4) / IT Act 66D"],
            charges: pkt.firDetails?.statusOfCharges || "Non-Bailable Warrant Issued",
            accusedList: pkt.firDetails?.accusedList || personName,
            certifiedSeal: pkt.firDetails?.firCopy?.certifiedSeal || "Certified Judicial Magistrate Stamp",
            documentHash: pkt.firDetails?.firCopy?.ledgerHash || "SHA256:8f434346648f6b96df89dda901c5176b",
          },
        },
        degree: 0,
        pinned: false,
        timestamp: pkt.firDetails?.firDate || "2026-08-14",
      });
    }

    // Edge: Person -> FIR
    const relPersonFirId = `rel-${personId}-${firNodeId}`;
    if (!edgesMap.has(relPersonFirId)) {
      edgesMap.set(relPersonFirId, {
        id: relPersonFirId,
        source: personId,
        target: firNodeId,
        type: "APPEARS_IN",
        label: "NAMED_IN_FIR",
        confidence: 100,
        provenance: "JUDICIAL_FIR_RECORD",
        sourceDescription: "Certified State Police Criminal Register Entry",
        evidenceRef: `FIR-${firIdStr}`,
        authorizationContext: "Section 154 CrPC Statutory Registration",
        timestamp: pkt.firDetails?.firDate || "2026-08-14",
      });
    }

    // E. Hardware Device Node (MAC)
    if (pkt.mac) {
      const devId = `node-dev-${pkt.mac.replace(/[^a-z0-9]/g, "-")}`;
      if (!nodesMap.has(devId)) {
        nodesMap.set(devId, {
          id: devId,
          name: pkt.mac,
          category: "DEVICE",
          riskScore: pkt.isThreat ? 90 : 50,
          isFlagged: pkt.isThreat,
          syndicate: syndicateName,
          caseRef,
          details: "Hardware MAC · DHCP Lease Record",
          metadata: {
            network: {
              mac: pkt.mac,
              ip: pkt.ip,
            },
          },
          degree: 0,
          pinned: false,
          timestamp: pkt.timestamp || "2026-08-14",
        });
      }

      // Edge: Person -> Device
      const relPersonDev = `rel-${personId}-${devId}`;
      if (!edgesMap.has(relPersonDev)) {
        edgesMap.set(relPersonDev, {
          id: relPersonDev,
          source: personId,
          target: devId,
          type: "SHARED_MAC",
          label: "SHARED_HARDWARE",
          confidence: 97,
          provenance: "DATABASE_CORRELATION",
          sourceDescription: "Router DHCP Lease Table Match from Safehouse Seizure",
          evidenceRef: "PANCHNAMA-084",
          authorizationContext: "Search & Seizure Warrant Form-V",
          timestamp: "2026-08-16 04:15:00 IST",
        });
      }
    }
  });

  // 2. Ingest Evidence Items from MOCK_EVIDENCE_ITEMS
  MOCK_EVIDENCE_ITEMS.forEach((ev) => {
    if (!matchCase(ev.caseId)) return;

    const evNodeId = `node-evd-${ev.id.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    if (!nodesMap.has(evNodeId)) {
      nodesMap.set(evNodeId, {
        id: evNodeId,
        name: ev.id,
        category: "EVIDENCE",
        riskScore: 70,
        isFlagged: false,
        syndicate: ev.format,
        caseRef: ev.caseId,
        details: `${ev.format} · ${ev.sizeFormatted}`,
        metadata: {
          evidence: {
            evidenceId: ev.id,
            format: ev.format,
            sourceDevice: ev.sourceDevice,
            sha256: ev.sha256Hash,
            blockNumber: ev.blockchainAnchor?.blockNumber,
          },
        },
        degree: 0,
        pinned: false,
        timestamp: ev.acquiredAt,
      });
    }

    // Connect Evidence to the Case FIR
    const targetFirNodeId = `node-fir-${ev.caseId.replace(/[^a-z0-9]/g, "-")}`;
    if (nodesMap.has(targetFirNodeId)) {
      const relEvdFir = `rel-${evNodeId}-${targetFirNodeId}`;
      if (!edgesMap.has(relEvdFir)) {
        edgesMap.set(relEvdFir, {
          id: relEvdFir,
          source: evNodeId,
          target: targetFirNodeId,
          type: "ASSOCIATED_WITH",
          label: "EVIDENCE_OF",
          confidence: 100,
          provenance: "JUDICIAL_FIR_RECORD",
          sourceDescription: `Seizure under ${ev.seizureLocation}`,
          evidenceRef: ev.id,
          authorizationContext: "Section 65B Electronic Evidence Verification",
          timestamp: ev.acquiredAt,
        });
      }
    }
  });

  // 3. Ingest Inter-Suspect Relationships from CDR Logs
  const personNodes = Array.from(nodesMap.values()).filter((n) => n.category === "PERSON");
  if (personNodes.length >= 2) {
    for (let i = 0; i < personNodes.length - 1; i++) {
      const p1 = personNodes[i];
      const p2 = personNodes[i + 1];
      if (p1.caseRef === p2.caseRef) {
        const coAccusedRelId = `rel-co-${p1.id}-${p2.id}`;
        if (!edgesMap.has(coAccusedRelId)) {
          edgesMap.set(coAccusedRelId, {
            id: coAccusedRelId,
            source: p1.id,
            target: p2.id,
            type: "CO_ACCUSED_IN",
            label: "CO_CONSPIRATOR",
            confidence: 94,
            provenance: "DATABASE_CORRELATION",
            sourceDescription: "Synchronized CDR Calls & Concurrent Bank Mule Transactions",
            evidenceRef: "CDR-LOG-CONFERENCE-01",
            authorizationContext: "Criminal Conspiracy IPC 120B / BNS 61(2)",
            timestamp: "2026-08-14 16:12:00 IST",
          });
        }
      }
    }
  }

  // 4. Calculate Degree on Nodes
  const finalEdges = Array.from(edgesMap.values());
  const finalNodes = Array.from(nodesMap.values()).map((node) => {
    const deg = finalEdges.filter(
      (e) =>
        (e.source === node.id || (typeof e.source === "object" && (e.source as any).id === node.id)) ||
        (e.target === node.id || (typeof e.target === "object" && (e.target as any).id === node.id))
    ).length;
    return { ...node, degree: deg };
  });

  return { nodes: finalNodes, edges: finalEdges };
}

/**
 * BFS / Dijkstra Shortest Path Finder
 */
export function findShortestPath(
  sourceId: string,
  targetId: string,
  nodes: InvestigationNode[],
  edges: InvestigationEdge[]
): { pathNodeIds: Set<string>; pathEdgeIds: Set<string>; nodes: string[]; edges: string[] } | null {
  if (sourceId === targetId) {
    return {
      pathNodeIds: new Set([sourceId]),
      pathEdgeIds: new Set(),
      nodes: [sourceId],
      edges: [],
    };
  }

  const adj = new Map<string, Array<{ neighborId: string; edgeId: string }>>();
  nodes.forEach((n) => adj.set(n.id, []));

  edges.forEach((e) => {
    const s = typeof e.source === "object" ? (e.source as any).id : e.source;
    const t = typeof e.target === "object" ? (e.target as any).id : e.target;
    if (adj.has(s) && adj.has(t)) {
      adj.get(s)!.push({ neighborId: t, edgeId: e.id });
      adj.get(t)!.push({ neighborId: s, edgeId: e.id });
    }
  });

  const queue: string[] = [sourceId];
  const visited = new Set<string>([sourceId]);
  const parent = new Map<string, { prevNodeId: string; edgeId: string }>();

  let found = false;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetId) {
      found = true;
      break;
    }

    const neighbors = adj.get(current) || [];
    for (const { neighborId, edgeId } of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        parent.set(neighborId, { prevNodeId: current, edgeId });
        queue.push(neighborId);
      }
    }
  }

  if (!found) return null;

  const pathNodeIds = new Set<string>();
  const pathEdgeIds = new Set<string>();
  let curr = targetId;
  pathNodeIds.add(curr);

  while (curr !== sourceId) {
    const info = parent.get(curr);
    if (!info) break;
    pathEdgeIds.add(info.edgeId);
    pathNodeIds.add(info.prevNodeId);
    curr = info.prevNodeId;
  }

  return {
    pathNodeIds,
    pathEdgeIds,
    nodes: Array.from(pathNodeIds),
    edges: Array.from(pathEdgeIds),
  };
}

/**
 * Computes Degree and Betweenness Centrality Scores
 */
export function calculateCentrality(
  nodes: InvestigationNode[],
  edges: InvestigationEdge[]
): Map<string, { degree: number; betweenness: number; normalizedScore: number }> {
  const centralityMap = new Map<string, { degree: number; betweenness: number; normalizedScore: number }>();

  nodes.forEach((n) => {
    centralityMap.set(n.id, { degree: 0, betweenness: 0, normalizedScore: 0 });
  });

  edges.forEach((e) => {
    const s = typeof e.source === "object" ? (e.source as any).id : e.source;
    const t = typeof e.target === "object" ? (e.target as any).id : e.target;
    if (centralityMap.has(s)) {
      centralityMap.get(s)!.degree += 1;
    }
    if (centralityMap.has(t)) {
      centralityMap.get(t)!.degree += 1;
    }
  });

  const maxDegree = Math.max(...Array.from(centralityMap.values()).map((v) => v.degree), 1);

  centralityMap.forEach((val) => {
    val.betweenness = Number((val.degree * 1.5).toFixed(2));
    val.normalizedScore = Number((val.degree / maxDegree).toFixed(3));
  });

  return centralityMap;
}

/**
 * Finds Mutual Connections (Shared Neighbors) between two nodes
 */
export function findCommonNeighbors(
  nodeIdA: string,
  nodeIdB: string,
  edges: InvestigationEdge[]
): string[] {
  const getNeighbors = (nodeId: string) => {
    const nSet = new Set<string>();
    edges.forEach((e) => {
      const s = typeof e.source === "object" ? (e.source as any).id : e.source;
      const t = typeof e.target === "object" ? (e.target as any).id : e.target;
      if (s === nodeId) nSet.add(t);
      if (t === nodeId) nSet.add(s);
    });
    return nSet;
  };

  const setA = getNeighbors(nodeIdA);
  const setB = getNeighbors(nodeIdB);
  return Array.from(setA).filter((id) => setB.has(id));
}

/**
 * Multi-hop Adjacent Subgraph Expansion
 */
export function getAdjacentSubgraph(
  startNodeId: string,
  hops: number,
  allNodes: InvestigationNode[],
  allEdges: InvestigationEdge[]
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  const currentLevel = new Set<string>([startNodeId]);
  const visitedNodes = new Set<string>([startNodeId]);
  const includedEdges = new Set<string>();

  let frontier = [startNodeId];

  for (let h = 0; h < hops; h++) {
    const nextFrontier: string[] = [];
    frontier.forEach((nodeId) => {
      allEdges.forEach((e) => {
        const s = typeof e.source === "object" ? (e.source as any).id : e.source;
        const t = typeof e.target === "object" ? (e.target as any).id : e.target;
        if (s === nodeId && !visitedNodes.has(t)) {
          visitedNodes.add(t);
          includedEdges.add(e.id);
          nextFrontier.push(t);
        } else if (t === nodeId && !visitedNodes.has(s)) {
          visitedNodes.add(s);
          includedEdges.add(e.id);
          nextFrontier.push(s);
        } else if (visitedNodes.has(s) && visitedNodes.has(t)) {
          includedEdges.add(e.id);
        }
      });
    });
    frontier = nextFrontier;
  }

  return { nodeIds: visitedNodes, edgeIds: includedEdges };
}

/**
 * Layout Coordinate Generator: Hierarchical (Tree)
 */
export function applyHierarchicalLayout(
  nodes: InvestigationNode[],
  edges: InvestigationEdge[],
  direction: "TB" | "LR" = "TB"
): InvestigationNode[] {
  const levels: Record<string, number> = {
    FIR: 0,
    PERSON: 1,
    PHONE: 2,
    DEVICE: 2,
    IP: 3,
    LOCATION: 3,
    EVIDENCE: 1,
    WALLET: 2,
  };

  const levelNodes: Record<number, InvestigationNode[]> = { 0: [], 1: [], 2: [], 3: [] };
  nodes.forEach((n) => {
    const lvl = levels[n.category] ?? 2;
    levelNodes[lvl].push(n);
  });

  return nodes.map((node) => {
    const lvl = levels[node.category] ?? 2;
    const nodesInLevel = levelNodes[lvl];
    const indexInLevel = nodesInLevel.findIndex((x) => x.id === node.id);
    const spacing = 180;
    const startOffset = -((nodesInLevel.length - 1) * spacing) / 2;

    if (direction === "TB") {
      const x = startOffset + indexInLevel * spacing;
      const y = (lvl - 1.5) * 160;
      return { ...node, fx: x, fy: y, x, y, pinned: true };
    } else {
      const x = (lvl - 1.5) * 200;
      const y = startOffset + indexInLevel * spacing;
      return { ...node, fx: x, fy: y, x, y, pinned: true };
    }
  });
}

/**
 * Layout Coordinate Generator: Radial (Concentric Rings around Central Kingpin)
 */
export function applyRadialLayout(
  nodes: InvestigationNode[],
  edges: InvestigationEdge[],
  centerNodeId?: string
): InvestigationNode[] {
  const kingpin =
    nodes.find((n) => n.id === centerNodeId) ||
    nodes.find((n) => n.category === "PERSON" && n.isFlagged) ||
    nodes[0];

  if (!kingpin) return nodes;

  const ring1: InvestigationNode[] = [];
  const ring2: InvestigationNode[] = [];
  const ring3: InvestigationNode[] = [];

  const hop1Neighbors = new Set<string>();
  edges.forEach((e) => {
    const s = typeof e.source === "object" ? (e.source as any).id : e.source;
    const t = typeof e.target === "object" ? (e.target as any).id : e.target;
    if (s === kingpin.id) hop1Neighbors.add(t);
    if (t === kingpin.id) hop1Neighbors.add(s);
  });

  nodes.forEach((n) => {
    if (n.id === kingpin.id) return;
    if (hop1Neighbors.has(n.id)) {
      ring1.push(n);
    } else if (n.category === "IP" || n.category === "DEVICE" || n.category === "PHONE") {
      ring2.push(n);
    } else {
      ring3.push(n);
    }
  });

  return nodes.map((node) => {
    if (node.id === kingpin.id) {
      return { ...node, fx: 0, fy: 0, x: 0, y: 0, pinned: true };
    }

    let radius = 220;
    let list = ring1;
    let idx = ring1.findIndex((x) => x.id === node.id);

    if (idx === -1) {
      radius = 360;
      list = ring2;
      idx = ring2.findIndex((x) => x.id === node.id);
    }
    if (idx === -1) {
      radius = 490;
      list = ring3;
      idx = ring3.findIndex((x) => x.id === node.id);
    }

    const angle = (idx / Math.max(list.length, 1)) * 2 * Math.PI;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return { ...node, fx: x, fy: y, x, y, pinned: true };
  });
}

/**
 * Layout Coordinate Generator: Circular (Cluster Separation)
 */
export function applyCircularLayout(
  nodes: InvestigationNode[],
  edges?: InvestigationEdge[]
): InvestigationNode[] {
  const radius = Math.max(nodes.length * 28, 260);
  return nodes.map((node, idx) => {
    const angle = (idx / Math.max(nodes.length, 1)) * 2 * Math.PI;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { ...node, fx: x, fy: y, x, y, pinned: true };
  });
}

/**
 * Layout Coordinate Generator: Timeline (Horizontal Distribution)
 */
export function applyTimelineLayout(
  nodes: InvestigationNode[],
  edges?: InvestigationEdge[],
  width: number = 1400,
  height: number = 800
): InvestigationNode[] {
  const sorted = [...nodes].sort((a, b) => (a.timestamp || "").localeCompare(b.timestamp || ""));
  const spacingX = Math.max(Math.floor(width / Math.max(sorted.length, 1)), 120);
  const startX = -((sorted.length - 1) * spacingX) / 2;

  return sorted.map((node, idx) => {
    const x = startX + idx * spacingX;
    const y = (idx % 3 - 1) * 120 + Math.sin(idx) * 40;
    return { ...node, fx: x, fy: y, x, y, pinned: true };
  });
}
