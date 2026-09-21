"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import dynamic from "next/dynamic";
import * as d3 from "d3-force";
import {
  RadarNode,
  RadarLink,
  RadarStreamHandle,
  StreamStateInfo,
} from "@/types/radar";
import { INDIAN_CYBER_SYNDICATE_NODES } from "@/data/cyber-packet-pool";
import { syncNodeToNeo4j, syncLinkToNeo4j } from "@/lib/neo4j";
import { Maximize2, ZoomIn, ZoomOut, Zap } from "lucide-react";

// Dynamically import ForceGraph2D with SSR disabled
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-bg-base bg-tech-grid text-text-muted font-mono text-xs gap-3">
      <div className="w-5 h-5 border-2 border-telecom-cyan border-t-transparent rounded-full animate-spin" />
      <span className="text-text-secondary tracking-wider text-[11px] uppercase">
        INITIALIZING GRAPH WORKSTATION...
      </span>
    </div>
  ),
});

interface ThreatRadarStreamProps {
  onNodeSelect: (node: RadarNode) => void;
  selectedNodeId: string | null;
  selectedCaseId?: string;
  onStreamStateChange?: (state: StreamStateInfo) => void;
}

// Complete multi-person syndicate edge relationships definitions
// NOTE: Cross-syndicate links are strictly omitted so the 3 groups are completely independent.
interface PotentialEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  label: string;
  syndicateGroup: "JAMTARA_MUMBAI" | "HAWALA_BENGALURU" | "EXTORTION_DELHI";
}

const ALL_SYNDICATE_EDGES: PotentialEdge[] = [
  // =========================================================================
  // SYNDICATE 1: JAMTARA PHISHING & MULE NETWORK (Mumbai Hub / BKC Cyber Cell)
  // Case: FIR-0104/2026
  // =========================================================================
  { id: "link-ip-jio-mac", source: "node-ip-jio", target: "node-mac-router", relationship: "USED_IP_AT", label: "USED_IP_AT", syndicateGroup: "JAMTARA_MUMBAI" },
  { id: "link-ip-airtel-mac", source: "node-ip-airtel", target: "node-mac-router", relationship: "USED_IP_AT", label: "USED_IP_AT", syndicateGroup: "JAMTARA_MUMBAI" },
  { id: "link-vikram-mac", source: "node-person-vikram", target: "node-mac-router", relationship: "SHARED_DEVICE", label: "SHARED_DEVICE", syndicateGroup: "JAMTARA_MUMBAI" },
  { id: "link-rahul-mac", source: "node-person-rahul", target: "node-mac-router", relationship: "SHARED_DEVICE", label: "SHARED_DEVICE", syndicateGroup: "JAMTARA_MUMBAI" },
  { id: "link-amit-mac", source: "node-person-amit", target: "node-mac-router", relationship: "SHARED_DEVICE", label: "SHARED_DEVICE", syndicateGroup: "JAMTARA_MUMBAI" },
  { id: "link-vikram-phone", source: "node-person-vikram", target: "node-phone-burner", relationship: "REGISTERED_TO", label: "REGISTERED_TO", syndicateGroup: "JAMTARA_MUMBAI" },
  { id: "link-rahul-phone", source: "node-person-rahul", target: "node-phone-burner", relationship: "REGISTERED_TO", label: "REGISTERED_TO", syndicateGroup: "JAMTARA_MUMBAI" },
  { id: "link-vikram-fir", source: "node-person-vikram", target: "node-fir-104", relationship: "CO_ACCUSED_IN", label: "CO_ACCUSED_IN", syndicateGroup: "JAMTARA_MUMBAI" },
  { id: "link-rahul-fir", source: "node-person-rahul", target: "node-fir-104", relationship: "CO_ACCUSED_IN", label: "CO_ACCUSED_IN", syndicateGroup: "JAMTARA_MUMBAI" },
  { id: "link-amit-fir", source: "node-person-amit", target: "node-fir-104", relationship: "CO_ACCUSED_IN", label: "CO_ACCUSED_IN", syndicateGroup: "JAMTARA_MUMBAI" },

  // =========================================================================
  // SYNDICATE 2: HAWALA & CRYPTO LAUNDERING RING (Bengaluru Hub / CCPS Central)
  // Case: FIR-2024-8842
  // =========================================================================
  { id: "link-ip-tor-mac", source: "node-ip-tor", target: "node-mac-flokinet", relationship: "ROUTED_TRAFFIC", label: "ROUTED_TRAFFIC", syndicateGroup: "HAWALA_BENGALURU" },
  { id: "link-rahman-mac", source: "node-person-rahman", target: "node-mac-flokinet", relationship: "SHARED_DEVICE", label: "SHARED_DEVICE", syndicateGroup: "HAWALA_BENGALURU" },
  { id: "link-tariq-mac", source: "node-person-tariq", target: "node-mac-flokinet", relationship: "SHARED_DEVICE", label: "SHARED_DEVICE", syndicateGroup: "HAWALA_BENGALURU" },
  { id: "link-deepa-mac", source: "node-person-deepa", target: "node-mac-flokinet", relationship: "SHARED_DEVICE", label: "SHARED_DEVICE", syndicateGroup: "HAWALA_BENGALURU" },
  { id: "link-rahman-phone", source: "node-person-rahman", target: "node-phone-blr", relationship: "REGISTERED_TO", label: "REGISTERED_TO", syndicateGroup: "HAWALA_BENGALURU" },
  { id: "link-tariq-phone", source: "node-person-tariq", target: "node-phone-blr", relationship: "REGISTERED_TO", label: "REGISTERED_TO", syndicateGroup: "HAWALA_BENGALURU" },
  { id: "link-rahman-fir", source: "node-person-rahman", target: "node-fir-8842", relationship: "CO_ACCUSED_IN", label: "CO_ACCUSED_IN", syndicateGroup: "HAWALA_BENGALURU" },
  { id: "link-tariq-fir", source: "node-person-tariq", target: "node-fir-8842", relationship: "CO_ACCUSED_IN", label: "CO_ACCUSED_IN", syndicateGroup: "HAWALA_BENGALURU" },
  { id: "link-deepa-fir", source: "node-person-deepa", target: "node-fir-8842", relationship: "CO_ACCUSED_IN", label: "CO_ACCUSED_IN", syndicateGroup: "HAWALA_BENGALURU" },

  // =========================================================================
  // SYNDICATE 3: TRANSNATIONAL EXTORTION & SIM-SWAP CARTEL (Delhi CBI Hub)
  // Case: FIR-7719/2026
  // =========================================================================
  { id: "link-ip-linode-mac", source: "node-ip-linode", target: "node-mac-extortion", relationship: "HOSTED_ON", label: "HOSTED_ON", syndicateGroup: "EXTORTION_DELHI" },
  { id: "link-sokolov-mac", source: "node-person-sokolov", target: "node-mac-extortion", relationship: "SHARED_DEVICE", label: "SHARED_DEVICE", syndicateGroup: "EXTORTION_DELHI" },
  { id: "link-rajesh-mac", source: "node-person-rajesh", target: "node-mac-extortion", relationship: "SHARED_DEVICE", label: "SHARED_DEVICE", syndicateGroup: "EXTORTION_DELHI" },
  { id: "link-priya-mac", source: "node-person-priya", target: "node-mac-extortion", relationship: "SHARED_DEVICE", label: "SHARED_DEVICE", syndicateGroup: "EXTORTION_DELHI" },
  { id: "link-sokolov-phone", source: "node-person-sokolov", target: "node-phone-delhi", relationship: "REGISTERED_TO", label: "REGISTERED_TO", syndicateGroup: "EXTORTION_DELHI" },
  { id: "link-rajesh-phone", source: "node-person-rajesh", target: "node-phone-delhi", relationship: "REGISTERED_TO", label: "REGISTERED_TO", syndicateGroup: "EXTORTION_DELHI" },
  { id: "link-sokolov-fir", source: "node-person-sokolov", target: "node-fir-7719", relationship: "CO_ACCUSED_IN", label: "CO_ACCUSED_IN", syndicateGroup: "EXTORTION_DELHI" },
  { id: "link-rajesh-fir", source: "node-person-rajesh", target: "node-fir-7719", relationship: "CO_ACCUSED_IN", label: "CO_ACCUSED_IN", syndicateGroup: "EXTORTION_DELHI" },
  { id: "link-priya-fir", source: "node-person-priya", target: "node-fir-7719", relationship: "CO_ACCUSED_IN", label: "CO_ACCUSED_IN", syndicateGroup: "EXTORTION_DELHI" },
];

export const ThreatRadarStream = forwardRef<RadarStreamHandle, ThreatRadarStreamProps>(
  ({ onNodeSelect, selectedNodeId, selectedCaseId = "ALL", onStreamStateChange }, ref) => {
    // Master State for all streamed nodes
    const [nodes, setNodes] = useState<RadarNode[]>([]);
    const [links, setLinks] = useState<RadarLink[]>([]);
    const [queueIndex, setQueueIndex] = useState<number>(0);
    const [isAutoStreaming, setIsAutoStreaming] = useState<boolean>(true);
    const [streamSpeed, setStreamSpeed] = useState<1 | 2 | 5>(1);
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
      width: 1000,
      height: 700,
    });

    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animTickerRef = useRef<number>(0);
    const nodesRef = useRef<RadarNode[]>([]);
    nodesRef.current = nodes;
    const linksRef = useRef<RadarLink[]>([]);
    linksRef.current = links;

    const onStreamStateChangeRef = useRef(onStreamStateChange);
    onStreamStateChangeRef.current = onStreamStateChange;

    const onNodeSelectRef = useRef(onNodeSelect);
    onNodeSelectRef.current = onNodeSelect;

    // Track responsive container dimensions with ResizeObserver & auto-recenter
    useEffect(() => {
      const updateSize = () => {
        if (containerRef.current) {
          const w = containerRef.current.clientWidth || window.innerWidth;
          const h = containerRef.current.clientHeight || window.innerHeight;
          setDimensions({ width: w, height: h });
        }
      };
      updateSize();
      window.addEventListener("resize", updateSize);

      let resizeTimer: NodeJS.Timeout;
      const ro = new ResizeObserver(() => {
        updateSize();
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (fgRef.current) {
            fgRef.current.zoomToFit(450, 80);
          }
        }, 120);
      });

      if (containerRef.current) {
        ro.observe(containerRef.current);
      }

      return () => {
        window.removeEventListener("resize", updateSize);
        ro.disconnect();
        clearTimeout(resizeTimer);
      };
    }, []);

    // Master Animation Loop for Canvas Pulse & Dynamic Wave Connections
    useEffect(() => {
      let animId: number;
      const loop = () => {
        animTickerRef.current += 0.04;
        if (animTickerRef.current > 10000) {
          animTickerRef.current = 0;
        }
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animId);
    }, []);

    // Broadcast stream state changes to parent (for top header controls)
    useEffect(() => {
      if (onStreamStateChangeRef.current) {
        onStreamStateChangeRef.current({
          isPlaying: isAutoStreaming,
          speed: streamSpeed,
          queueIndex,
          maxQueue: INDIAN_CYBER_SYNDICATE_NODES.length,
          metrics: {
            totalIngested: queueIndex,
            activeIngesting: nodes.filter((n) => n.state === "INGESTING").length,
            confirmedThreats: nodes.filter((n) => n.state === "FLAGGED").length,
            clearedBenign: 0,
            activeLinks: links.length,
            currentTps: isAutoStreaming ? +(1.2 * streamSpeed).toFixed(1) : 0,
          },
          flaggedNodes: nodes.filter((n) => n.state === "FLAGGED"),
        });
      }
    }, [isAutoStreaming, streamSpeed, queueIndex, nodes.length, links.length]);

    // Positions map: relative coordinates centered for each syndicate
    const baseNodePositions: Record<string, { x: number; y: number }> = {
      // -----------------------------------------------------------------------
      // SYNDICATE 1: JAMTARA MUMBAI (Radial Layout around MAC Router)
      // -----------------------------------------------------------------------
      "node-mac-router": { x: 0, y: 0 },
      "node-person-vikram": { x: 0, y: -100 },
      "node-person-rahul": { x: 130, y: -20 },
      "node-person-amit": { x: 80, y: 100 },
      "node-fir-104": { x: -80, y: 100 },
      "node-phone-burner": { x: 130, y: -100 },
      "node-ip-jio": { x: -140, y: -60 },
      "node-ip-airtel": { x: -140, y: 40 },

      // -----------------------------------------------------------------------
      // SYNDICATE 2: HAWALA BENGALURU (Radial Layout around FlokiNET MAC)
      // -----------------------------------------------------------------------
      "node-mac-flokinet": { x: 0, y: 0 },
      "node-person-rahman": { x: 0, y: -100 },
      "node-person-tariq": { x: 130, y: -20 },
      "node-person-deepa": { x: 80, y: 100 },
      "node-fir-8842": { x: -80, y: 100 },
      "node-phone-blr": { x: 130, y: -100 },
      "node-ip-tor": { x: -140, y: -30 },

      // -----------------------------------------------------------------------
      // SYNDICATE 3: EXTORTION DELHI (Radial Layout around Extortion C2 MAC)
      // -----------------------------------------------------------------------
      "node-mac-extortion": { x: 0, y: 0 },
      "node-person-sokolov": { x: 0, y: -100 },
      "node-person-rajesh": { x: 130, y: -20 },
      "node-person-priya": { x: 80, y: 100 },
      "node-fir-7719": { x: -80, y: 100 },
      "node-phone-delhi": { x: 130, y: -100 },
      "node-ip-linode": { x: -140, y: -30 },
    };

    // Dynamically adjust node positions when switching between ALL mode and singular syndicate modes
    useEffect(() => {
      setNodes((currentNodes) => {
        if (currentNodes.length === 0) return currentNodes;
        return currentNodes.map((n) => {
          const basePos = baseNodePositions[n.id] || { x: 0, y: 0 };
          let targetX = basePos.x;
          let targetY = basePos.y;

          if (selectedCaseId === "ALL") {
            if (n.syndicateGroup === "JAMTARA_MUMBAI") {
              targetY -= 60;
            } else if (n.syndicateGroup === "HAWALA_BENGALURU") {
              targetX -= 350;
              targetY += 60;
            } else if (n.syndicateGroup === "EXTORTION_DELHI") {
              targetX += 350;
              targetY += 60;
            }
          }

          return {
            ...n,
            x: targetX,
            y: targetY,
            vx: 0,
            vy: 0,
          };
        });
      });
    }, [selectedCaseId]);

    // =========================================================================
    // VISIBLE FILTERING: ONLY SHOW SELECTED SYNDICATE GROUP ON CANVAS
    // When a singular syndicate group is selected, only that group is rendered.
    // =========================================================================
    const visibleNodes = useMemo(() => {
      if (!selectedCaseId || selectedCaseId === "ALL") {
        return nodes;
      }
      if (selectedCaseId === "FIR-0104/2026" || selectedCaseId === "JAMTARA") {
        return nodes.filter((n) => n.syndicateGroup === "JAMTARA_MUMBAI");
      }
      if (selectedCaseId === "FIR-2024-8842" || selectedCaseId === "HAWALA") {
        return nodes.filter((n) => n.syndicateGroup === "HAWALA_BENGALURU");
      }
      if (selectedCaseId === "FIR-7719/2026" || selectedCaseId === "EXTORTION") {
        return nodes.filter((n) => n.syndicateGroup === "EXTORTION_DELHI");
      }
      return nodes;
    }, [nodes, selectedCaseId]);

    const visibleLinks = useMemo(() => {
      const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
      return links.filter((l) => {
        const sId = typeof l.source === "object" ? (l.source as any).id : l.source;
        const tId = typeof l.target === "object" ? (l.target as any).id : l.target;
        return visibleNodeIds.has(sId) && visibleNodeIds.has(tId);
      });
    }, [links, visibleNodes]);

    // AUTOMATIC NETWORK CENTERING
    // Automatically center and fit the active visible graph in the viewport
    const handleAutoCenter = useCallback(() => {
      if (!fgRef.current) return;
      if (visibleNodes.length === 0) {
        fgRef.current.centerAt(0, 0, 400);
        fgRef.current.zoom(1.0, 400);
      } else if (visibleNodes.length === 1) {
        const singleNode = visibleNodes[0];
        const x = typeof singleNode?.x === "number" ? singleNode.x : 0;
        const y = typeof singleNode?.y === "number" ? singleNode.y : 0;
        fgRef.current.centerAt(x, y, 400);
        fgRef.current.zoom(1.35, 400);
      } else {
        fgRef.current.zoomToFit(400, 60);
      }
      fgRef.current.d3ReheatSimulation();
    }, [visibleNodes]);

    // Automatically center the canvas whenever the selected syndicate changes or on initial nodes
    useEffect(() => {
      if (!fgRef.current) return;
      const timer1 = setTimeout(() => {
        handleAutoCenter();
        // Automatically select the primary node for the active group
        if (selectedCaseId === "FIR-0104/2026" || selectedCaseId === "JAMTARA") {
          const v = nodesRef.current.find((n) => n.id === "node-person-vikram");
          if (v) onNodeSelectRef.current(v);
        } else if (selectedCaseId === "FIR-2024-8842" || selectedCaseId === "HAWALA") {
          const r = nodesRef.current.find((n) => n.id === "node-person-rahman");
          if (r) onNodeSelectRef.current(r);
        } else if (selectedCaseId === "FIR-7719/2026" || selectedCaseId === "EXTORTION") {
          const s = nodesRef.current.find((n) => n.id === "node-person-sokolov");
          if (s) onNodeSelectRef.current(s);
        }
      }, 50);

      const timer2 = setTimeout(() => {
        handleAutoCenter();
      }, 250);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }, [selectedCaseId, handleAutoCenter]);

    // =========================================================================
    // SEQUENTIAL INGESTION & PIPELINE STAGES
    // Stage 1: INGESTING -> [DL SCANNING: <IP/NAME>] (Cyan Pulse)
    // Stage 2: EVALUATING -> [DL CLASSIFYING...] (Amber Pulse)
    // Stage 3: RESOLVED -> [FLAGGED THREAT] (Crimson)
    // Stage 4: SEQUENTIAL EDGE FORMATION (Only after resolution)
    // =========================================================================
    const ingestNextPacket = useCallback(() => {
      if (queueIndex >= INDIAN_CYBER_SYNDICATE_NODES.length) return;

      const template = INDIAN_CYBER_SYNDICATE_NODES[queueIndex];
      const nodeId = template.id || `node-stream-${queueIndex + 1}`;
      const now = new Date().toISOString();

      const basePos = baseNodePositions[nodeId] || {
        x: (Math.random() - 0.5) * 160,
        y: (Math.random() - 0.5) * 160,
      };

      // In "ALL" mode, separate the 3 clusters across the canvas
      let posX = basePos.x;
      let posY = basePos.y;
      if (selectedCaseId === "ALL") {
        if (template.syndicateGroup === "JAMTARA_MUMBAI") {
          posY -= 60;
        } else if (template.syndicateGroup === "HAWALA_BENGALURU") {
          posX -= 350;
          posY += 60;
        } else if (template.syndicateGroup === "EXTORTION_DELHI") {
          posX += 350;
          posY += 60;
        }
      }

      // 1. Enter canvas as isolated node in scanning phase (NO links yet)
      const newNode: RadarNode = {
        id: nodeId,
        syndicateGroup: template.syndicateGroup,
        caseRef: template.caseRef,
        ip: template.ip,
        mac: template.mac,
        subnet: template.subnet,
        name: template.name,
        accusedName: template.accusedName,
        ispDhcp: template.ispDhcp,
        location: template.location,
        state: "INGESTING",
        flagged: false,
        backgroundStage: "INITIAL_INGEST",
        stage: "SCANNING",
        threatType: template.expectedCrime,
        crimeType: template.expectedCrime,
        confidence: template.expectedConfidence,
        isFadingOut: false,
        fadeOpacity: 1.0,
        ingressTimestamp: Date.now(),
        asnOrg: template.asnOrg,
        country: template.country,
        countryCode: template.countryCode,
        portMatrix: template.portMatrix,
        protocol: template.protocol,
        bytesTransferred: template.bytesTransferred,
        timestamp: now,
        ja3Fingerprint: template.ja3Fingerprint,
        md5Hash: template.md5Hash,
        sha256Hash: template.sha256Hash,
        geoCoords: template.geoCoords,
        personalInfo: template.personalInfo,
        firDetails: template.firDetails,
        cdrDetails: template.cdrDetails,
        isThreatTarget: template.isThreat,
        expectedCrimeTarget: template.expectedCrime,
        expectedConfidenceTarget: template.expectedConfidence,
        anomalyScoreTarget: template.anomalyScore,
        x: posX,
        y: posY,
        stageLogs: [
          {
            stage: "DL_SCANNING",
            message: `Ingress captured: ${template.ip} (${template.name}). Commencing 3-Stage Deep Learning analysis.`,
            timestamp: now,
          },
        ],
      };

      setNodes((prev) => [...prev, newNode]);
      setQueueIndex((prev) => prev + 1);

      if (queueIndex === 0 || nodeId === "node-person-vikram") {
        onNodeSelectRef.current(newNode);
      }

      // Phase 2 Transition: [DL CLASSIFYING...] after 600ms
      const speedFactor = streamSpeed;
      setTimeout(() => {
        setNodes((currNodes) =>
          currNodes.map((n) => {
            if (n.id === nodeId) {
              return {
                ...n,
                stage: "EVALUATING",
                backgroundStage: "MODEL_2_CRIME",
                stageLogs: [
                  ...(n.stageLogs || []),
                  {
                    stage: "DL_CLASSIFYING",
                    message: `DL Model inference: Softmax evaluating traffic vectors (${template.expectedCrime}).`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              };
            }
            return n;
          })
        );
      }, Math.max(300, 600 / speedFactor));

      // Phase 3 Transition: [FLAGGED THREAT] + Sequential Edge Formation after 1200ms
      setTimeout(() => {
        setNodes((currNodes) =>
          currNodes.map((n) => {
            if (n.id === nodeId) {
              const flaggedNode: RadarNode = {
                ...n,
                state: "FLAGGED",
                flagged: true,
                stage: "FLAGGED",
                backgroundStage: "FLAGGED_THREAT",
                stageLogs: [
                  ...(n.stageLogs || []),
                  {
                    stage: "FLAGGED_THREAT",
                    message: `[VERDICT: CONFIRMED] Threat locked into Crimson alert. Syndicate target: ${template.name}.`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              };
              syncNodeToNeo4j(flaggedNode).catch(() => {});
              return flaggedNode;
            }
            return n;
          })
        );

        // SEQUENTIAL EDGE FORMATION:
        // Only after the node reaches its final FLAGGED state, dynamically draw its relationship links
        setLinks((prevLinks) => {
          const newLinks: RadarLink[] = [];
          const currentNodes = nodesRef.current;

          ALL_SYNDICATE_EDGES.forEach((edgeDef) => {
            // Check if this edge connects the newly resolved node
            if (edgeDef.source === nodeId || edgeDef.target === nodeId) {
              const otherNodeId = edgeDef.source === nodeId ? edgeDef.target : edgeDef.source;
              // Verify the other endpoint node is already resolved/flagged on canvas
              const otherNode = currentNodes.find(
                (n) => n.id === otherNodeId && (n.state === "FLAGGED" || n.stage === "FLAGGED")
              );

              if (otherNode) {
                const linkExists =
                  prevLinks.some((l) => l.id === edgeDef.id) ||
                  newLinks.some((l) => l.id === edgeDef.id);
                if (!linkExists) {
                  const createdLink: RadarLink = {
                    id: edgeDef.id,
                    source: edgeDef.source,
                    target: edgeDef.target,
                    relationship: edgeDef.relationship,
                    label: edgeDef.label,
                    syndicateGroup: edgeDef.syndicateGroup,
                    color: "#64748b",
                    confidence: "Confirmed Syndicate Link",
                    waveOffset: Math.random() * Math.PI * 2,
                  };
                  newLinks.push(createdLink);
                  syncLinkToNeo4j(createdLink).catch(() => {});
                }
              }
            }
          });

          return newLinks.length > 0 ? [...prevLinks, ...newLinks] : prevLinks;
        });
      }, Math.max(600, 1200 / speedFactor));
    }, [queueIndex, streamSpeed, selectedCaseId]);

    // Scheduler for automated live streaming
    useEffect(() => {
      if (!isAutoStreaming) return;

      if (nodes.length === 0 && queueIndex === 0) {
        ingestNextPacket();
      }

      const streamInterval = Math.max(1000, 2200 / streamSpeed);
      const timer = setInterval(() => {
        if (queueIndex < INDIAN_CYBER_SYNDICATE_NODES.length) {
          ingestNextPacket();
        }
      }, streamInterval);

      return () => clearInterval(timer);
    }, [isAutoStreaming, streamSpeed, queueIndex, nodes.length, ingestNextPacket]);

    // Reset Stream
    const handleReset = useCallback(() => {
      setNodes([]);
      setLinks([]);
      setQueueIndex(0);
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focusNode: (nodeId: string) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (node && fgRef.current && typeof node.x === "number" && typeof node.y === "number") {
          fgRef.current.centerAt(node.x, node.y, 600);
          fgRef.current.zoom(2.0, 600);
        }
      },
      focusSyndicate: (syndicateKey: string) => {
        if (!fgRef.current) return;
        setTimeout(() => {
          handleAutoCenter();
        }, 120);

        if (syndicateKey === "FIR-0104/2026" || syndicateKey === "JAMTARA_MUMBAI" || syndicateKey === "JAMTARA") {
          const vikram = nodesRef.current.find((n) => n.id === "node-person-vikram");
          if (vikram) onNodeSelectRef.current(vikram);
        } else if (syndicateKey === "FIR-2024-8842" || syndicateKey === "HAWALA_BENGALURU" || syndicateKey === "HAWALA") {
          const rahman = nodesRef.current.find((n) => n.id === "node-person-rahman");
          if (rahman) onNodeSelectRef.current(rahman);
        } else if (syndicateKey === "FIR-7719/2026" || syndicateKey === "EXTORTION_DELHI" || syndicateKey === "EXTORTION") {
          const sokolov = nodesRef.current.find((n) => n.id === "node-person-sokolov");
          if (sokolov) onNodeSelectRef.current(sokolov);
        }
      },
      zoomIn: () => {
        if (fgRef.current) {
          const currentZoom = fgRef.current.zoom();
          fgRef.current.zoom(currentZoom * 1.35, 300);
        }
      },
      zoomOut: () => {
        if (fgRef.current) {
          const currentZoom = fgRef.current.zoom();
          fgRef.current.zoom(currentZoom / 1.35, 300);
        }
      },
      fitView: () => {
        handleAutoCenter();
      },
      resetSimulation: () => {
        if (fgRef.current) {
          fgRef.current.d3ReheatSimulation();
        }
      },
      getSnapshot: () => ({
        nodes: nodesRef.current,
        links: linksRef.current,
      }),
      streamNext: () => ingestNextPacket(),
      togglePlay: () => setIsAutoStreaming((prev) => !prev),
      setSpeed: (s: 1 | 2 | 5) => setStreamSpeed(s),
      resetStream: () => handleReset(),
    }));

    // D3 Physics Engine Tuning: stable centering & spacing
    useEffect(() => {
      if (fgRef.current) {
        const linkForce = fgRef.current.d3Force("link");
        if (linkForce) {
          linkForce.distance(() => 90);
          linkForce.strength(0.5);
        }

        fgRef.current.d3Force("collide", d3.forceCollide(45));

        const chargeForce = fgRef.current.d3Force("charge");
        if (chargeForce) {
          chargeForce.strength(-100);
        }

        fgRef.current.d3Force("center", d3.forceCenter(0, 0));
        fgRef.current.d3Force("x", d3.forceX(0).strength(0.04));
        fgRef.current.d3Force("y", d3.forceY(0).strength(0.04));

        fgRef.current.d3ReheatSimulation();
      }
    }, [visibleNodes.length, visibleLinks.length]);

    // =========================================================================
    // NAMED EDGES (linkCanvasObject)
    // Named canvas edges: USED_IP_AT, SHARED_DEVICE, REGISTERED_TO, CO_ACCUSED_IN
    // =========================================================================
    const drawWaveLink = useCallback(
      (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const source = link.source;
        const target = link.target;
        if (!source || !target || typeof source.x !== "number" || typeof target.x !== "number") {
          return;
        }

        const x1 = source.x;
        const y1 = source.y;
        const x2 = target.x;
        const y2 = target.y;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) return;

        // 1. Connector Line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "rgba(71, 85, 105, 0.55)";
        ctx.lineWidth = 1.2 / globalScale;
        ctx.stroke();

        // 2. Directional Pulse Wave
        const tick = animTickerRef.current;
        const waveOffset = link.waveOffset || 0;
        const phase = ((tick * 0.35 + waveOffset) % 1 + 1) % 1;
        const px = x1 + phase * dx;
        const py = y1 + phase * dy;

        ctx.beginPath();
        ctx.arc(px, py, 2.0 / globalScale, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
        ctx.fill();

        // 3. Named Relationship Label
        const labelText = link.relationship || link.label || "CONNECTED";
        const labelFontSize = Math.max(7.5 / globalScale, 2.0);
        ctx.font = `700 ${labelFontSize}px 'JetBrains Mono', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const textWidth = ctx.measureText(labelText).width;
        const pillPadX = 4 / globalScale;
        const pillPadY = 2 / globalScale;
        const pillWidth = textWidth + pillPadX * 2;
        const pillHeight = labelFontSize + pillPadY * 2;

        // Semi-transparent pill backing box
        ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
        ctx.fillRect(midX - pillWidth / 2, midY - pillHeight / 2, pillWidth, pillHeight);

        ctx.strokeStyle = "rgba(100, 116, 139, 0.75)";
        ctx.lineWidth = 0.8 / globalScale;
        ctx.strokeRect(midX - pillWidth / 2, midY - pillHeight / 2, pillWidth, pillHeight);

        ctx.fillStyle = "#93c5fd";
        ctx.fillText(labelText, midX, midY);
      },
      []
    );

    // =========================================================================
    // CANVAS RENDERING (Live Pipeline Stages & Multi-line Details)
    // Stage 1: [DL SCANNING...] -> Cyan pulse & halo
    // Stage 2: [DL CLASSIFYING...] -> Amber pulse
    // Stage 3: [FLAGGED THREAT] -> Crimson dot & halo
    // =========================================================================
    const drawNode = useCallback(
      (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const isSelected = selectedNodeId === node.id;
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const tick = animTickerRef.current;

        const isScanning = node.stage === "SCANNING" || node.backgroundStage === "INITIAL_INGEST";
        const isEvaluating = node.stage === "EVALUATING" || node.backgroundStage === "MODEL_2_CRIME";
        const isFlagged = node.state === "FLAGGED" || node.stage === "FLAGGED" || node.flagged;

        const radius = isSelected ? 8 : 6.5;

        // 1. Dynamic Pulse Ring & Halos for Live Pipeline States
        if (isScanning) {
          const pulse = (tick * 1.5) % 1;
          const rPulse = radius + (pulse * 12) / globalScale;
          ctx.beginPath();
          ctx.arc(x, y, rPulse, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.7 * (1 - pulse)})`;
          ctx.lineWidth = 1.4 / globalScale;
          ctx.stroke();
        } else if (isEvaluating) {
          const pulse = (tick * 2.0) % 1;
          const rPulse = radius + (pulse * 10) / globalScale;
          ctx.beginPath();
          ctx.arc(x, y, rPulse, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.75 * (1 - pulse)})`;
          ctx.lineWidth = 1.4 / globalScale;
          ctx.stroke();
        } else if (isFlagged) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 4 / globalScale, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
          ctx.fill();
        }

        // 2. Selection Ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 3.5 / globalScale, 0, 2 * Math.PI);
          ctx.strokeStyle = isFlagged ? "#ef4444" : "#38bdf8";
          ctx.lineWidth = 1.8 / globalScale;
          ctx.stroke();
        }

        // 3. Circular Node Body
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isFlagged ? "#ef4444" : isEvaluating ? "#f59e0b" : "#06b6d4";
        ctx.fill();

        ctx.strokeStyle = isSelected ? "#ffffff" : isFlagged ? "#7f1d1d" : isEvaluating ? "#78350f" : "#083344";
        ctx.lineWidth = (isSelected ? 1.8 : 1.2) / globalScale;
        ctx.stroke();

        // 4. ALWAYS-VISIBLE MULTI-LINE NODE DETAILS
        const fontSize = Math.max(8.0 / globalScale, 2.0);
        const lineHeight = fontSize * 1.32;
        ctx.font = `600 ${fontSize}px 'JetBrains Mono', 'Geist Mono', monospace`;

        const nodeIp = node.ip || "0.0.0.0";
        const nodeIsp = node.ispDhcp || node.asnOrg || "DHCP / Dynamic";
        const nodeLoc = node.location || node.country || "Mumbai, Maharashtra";

        // Dynamic multi-line metrics according to pipeline state
        let lines: { prefix: string; val: string; valColor: string }[];
        if (isScanning) {
          lines = [
            { prefix: "STATUS: ", val: `[DL SCANNING: ${node.ip}]`, valColor: "#38bdf8" },
            { prefix: "IP:     ", val: nodeIp, valColor: "#ffffff" },
            { prefix: "ISP:    ", val: nodeIsp, valColor: "#a1a1aa" },
            { prefix: "LOC:    ", val: nodeLoc, valColor: "#fbbf24" },
          ];
        } else if (isEvaluating) {
          lines = [
            { prefix: "STATUS: ", val: "[DL CLASSIFYING...]", valColor: "#fbbf24" },
            { prefix: "IP:     ", val: nodeIp, valColor: "#ffffff" },
            { prefix: "ISP:    ", val: nodeIsp, valColor: "#a1a1aa" },
            { prefix: "LOC:    ", val: nodeLoc, valColor: "#fbbf24" },
          ];
        } else {
          lines = [
            { prefix: "NAME:   ", val: node.name || node.accusedName || "TARGET", valColor: "#fca5a5" },
            { prefix: "IP:     ", val: nodeIp, valColor: "#38bdf8" },
            { prefix: "ISP:    ", val: nodeIsp, valColor: "#a1a1aa" },
            { prefix: "LOC:    ", val: nodeLoc, valColor: "#fbbf24" },
          ];
        }

        // Measure widest line to size backing box accurately
        let maxTextWidth = 0;
        lines.forEach((l) => {
          const w = ctx.measureText(`${l.prefix}${l.val}`).width;
          if (w > maxTextWidth) maxTextWidth = w;
        });

        const padX = 5 / globalScale;
        const padY = 4 / globalScale;
        const boxWidth = maxTextWidth + padX * 2;
        const boxHeight = lineHeight * 4 + padY * 2;
        const boxX = x - boxWidth / 2;
        const boxY = y + radius + 4 / globalScale;

        // Semi-transparent dark backing box
        ctx.fillStyle = "rgba(9, 9, 11, 0.92)";
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Backing box border
        ctx.strokeStyle = isSelected
          ? isFlagged
            ? "rgba(239, 68, 68, 0.95)"
            : "rgba(6, 182, 212, 0.95)"
          : isFlagged
          ? "rgba(127, 29, 29, 0.85)"
          : isEvaluating
          ? "rgba(245, 158, 11, 0.85)"
          : "rgba(39, 39, 42, 0.9)";
        ctx.lineWidth = 1 / globalScale;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Render each multi-line metric
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        lines.forEach((l, idx) => {
          const currentY = boxY + padY + idx * lineHeight;
          const startX = boxX + padX;

          ctx.fillStyle = "#71717a";
          ctx.fillText(l.prefix, startX, currentY);

          const prefixWidth = ctx.measureText(l.prefix).width;
          ctx.fillStyle = l.valColor;
          ctx.fillText(l.val, startX + prefixWidth, currentY);
        });
      },
      [selectedNodeId]
    );

    return (
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden bg-bg-base bg-tech-grid select-none font-mono"
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={{ nodes: visibleNodes, links: visibleLinks }}
          nodeId="id"
          nodeCanvasObject={drawNode}
          nodeCanvasObjectMode={() => "replace"}
          linkCanvasObject={drawWaveLink}
          linkCanvasObjectMode={() => "replace"}
          onNodeClick={(node) => onNodeSelectRef.current(node as RadarNode)}
          backgroundColor="#09090b"
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          cooldownTicks={100}
          d3VelocityDecay={0.65}
          warmupTicks={60}
          nodePointerAreaPaint={(node: any, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 22, 0, 2 * Math.PI);
            ctx.fill();
          }}
        />

        {/* ================= FLOATING ON-CANVAS AUTO-CENTER & VIEW CONTROLS ================= */}
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 bg-zinc-950/90 border border-border-subtle p-1 shadow-2xl backdrop-blur-md text-xs font-mono">
          <button
            type="button"
            onClick={handleAutoCenter}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-overlay hover:bg-border-subtle text-telecom-cyan hover:text-text-primary border border-border-subtle transition-colors cursor-pointer text-[10px] font-bold"
            title="Auto-Center Active Syndicate Network"
          >
            <Maximize2 className="w-3.5 h-3.5 text-telecom-cyan" />
            <span>AUTO-CENTER</span>
          </button>

          <div className="h-4 w-[1px] bg-border-subtle mx-0.5" />

          <button
            type="button"
            onClick={() => {
              if (fgRef.current) {
                fgRef.current.zoom(fgRef.current.zoom() * 1.35, 300);
              }
            }}
            className="p-1 hover:bg-surface-overlay text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (fgRef.current) {
                fgRef.current.zoom(fgRef.current.zoom() / 1.35, 300);
              }
            }}
            className="p-1 hover:bg-surface-overlay text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (fgRef.current) {
                fgRef.current.d3ReheatSimulation();
              }
            }}
            className="p-1 hover:bg-surface-overlay text-text-muted hover:text-amber-400 transition-colors cursor-pointer"
            title="Reheat Physics Engine"
          >
            <Zap className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }
);

ThreatRadarStream.displayName = "ThreatRadarStream";
