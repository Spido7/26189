"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  DLStage,
  StreamNode,
  StreamLink,
  StreamMetrics,
  ThreatClassification,
} from "@/types/stream";
import { CYBER_PACKET_POOL, CyberPacketTemplate } from "@/data/cyber-packet-pool";

export function useCyberStream() {
  const [nodes, setNodes] = useState<StreamNode[]>([]);
  const [links, setLinks] = useState<StreamLink[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<1 | 2 | 5>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<DLStage | "ALL">("ALL");

  const packetIndexRef = useRef<number>(0);
  const nodeCounterRef = useRef<number>(0);

  // Ingest a single packet into the stream
  const ingestPacket = useCallback((template: CyberPacketTemplate) => {
    nodeCounterRef.current += 1;
    const nodeId = `node-stream-${nodeCounterRef.current}`;
    const timestamp = new Date().toISOString();

    const newNode: StreamNode = {
      id: nodeId,
      ip: template.ip,
      mac: template.mac,
      subnet: template.subnet,
      stage: "INGESTED",
      crimeType: undefined,
      confidence: undefined,
      flagged: false,
      asnOrg: template.asnOrg,
      country: template.country,
      countryCode: template.countryCode,
      portMatrix: template.portMatrix,
      protocol: template.protocol,
      bytesTransferred: template.bytesTransferred,
      timestamp: timestamp,
      ja3Fingerprint: template.ja3Fingerprint,
      md5Hash: template.md5Hash,
      sha256Hash: template.sha256Hash,
      geoCoords: template.geoCoords,
      isThreatTarget: template.isThreat,
      expectedCrimeTarget: template.expectedCrime,
      expectedConfidenceTarget: template.expectedConfidence,
      anomalyScoreTarget: template.anomalyScore,
      stageLogs: [
        {
          stage: "INGESTED",
          message: `Packet ingress captured from ${template.ip} (${template.asnOrg}). Initializing DL tensor queues.`,
          timestamp,
        },
      ],
    };

    setNodes((prevNodes) => {
      // Dynamic Relationship Linking:
      // Form links ONLY if incoming IP shares subnet CIDR or MAC address with previously ingested nodes
      const newLinks: StreamLink[] = [];

      prevNodes.forEach((existing) => {
        // Condition 1: Same MAC Address
        if (existing.mac === newNode.mac && existing.id !== newNode.id) {
          newLinks.push({
            id: `link-${existing.id}-${newNode.id}-mac`,
            source: existing.id,
            target: newNode.id,
            relationship: "SHARED_MAC_INTERFACE",
            color: "#a855f7",
            confidence: "Hardware Physical NIC Collision",
          });
        }
        // Condition 2: Same Subnet CIDR
        else if (existing.subnet === newNode.subnet && existing.id !== newNode.id) {
          newLinks.push({
            id: `link-${existing.id}-${newNode.id}-subnet`,
            source: existing.id,
            target: newNode.id,
            relationship: "SHARED_SUBNET",
            color: "#06b6d4",
            confidence: `CIDR Routing Subnet ${newNode.subnet}`,
          });
        }
      });

      if (newLinks.length > 0) {
        setLinks((prevLinks) => [...prevLinks, ...newLinks]);
      }

      // If no node selected yet, select the first ingested node
      if (prevNodes.length === 0) {
        setSelectedNodeId(nodeId);
      }

      return [...prevNodes, newNode];
    });
  }, []);

  // Timer 1: Ingestion Stream Scheduler (arrives one IP at a time)
  useEffect(() => {
    if (!isPlaying) return;

    // Ingest first packet immediately if empty
    if (nodes.length === 0 && packetIndexRef.current === 0) {
      ingestPacket(CYBER_PACKET_POOL[0]);
      packetIndexRef.current = 1;
    }

    const intervalMs = Math.max(800, 2400 / speed);

    const intervalId = setInterval(() => {
      if (packetIndexRef.current < CYBER_PACKET_POOL.length) {
        const nextTemplate = CYBER_PACKET_POOL[packetIndexRef.current];
        ingestPacket(nextTemplate);
        packetIndexRef.current += 1;
      }
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [isPlaying, speed, ingestPacket, nodes.length]);

  // Timer 2: 3-Stage Deep Learning Pipeline Progression Engine
  useEffect(() => {
    if (!isPlaying) return;

    const pipelineTickMs = Math.max(500, 1400 / speed);

    const pipelineInterval = setInterval(() => {
      setNodes((currentNodes) => {
        let hasChanges = false;

        const updatedNodes = currentNodes.map((node) => {
          const now = new Date().toISOString();

          // Stage 0 -> Stage 1: MODEL_1_ANOMALY
          if (node.stage === "INGESTED") {
            hasChanges = true;
            const anomalyScore = node.anomalyScoreTarget ?? 0.85;
            const isAnomalous = anomalyScore > 0.4;

            return {
              ...node,
              stage: "MODEL_1_ANOMALY" as DLStage,
              modelTelemetry: {
                ...node.modelTelemetry,
                stage1Anomaly: {
                  anomalyScore,
                  reconstructionLoss: +(anomalyScore * 0.042).toFixed(4),
                  latencyMs: Math.floor(8 + Math.random() * 6),
                  isAnomalous,
                  evaluatedAt: now,
                },
              },
              stageLogs: [
                ...(node.stageLogs || []),
                {
                  stage: "MODEL_1_ANOMALY" as DLStage,
                  message: `Stage 1 Anomaly Autoencoder: score=${(anomalyScore * 100).toFixed(1)}% | loss=${(anomalyScore * 0.042).toFixed(4)} -> ${isAnomalous ? "ANOMALOUS_PATTERN" : "NOMINAL"}`,
                  timestamp: now,
                },
              ],
            };
          }

          // Stage 1 -> Stage 2: MODEL_2_CRIME
          if (node.stage === "MODEL_1_ANOMALY") {
            hasChanges = true;
            const crime = (node.expectedCrimeTarget as ThreatClassification) || "C2_TUNNEL_BEACON";
            const prob = (node.expectedConfidenceTarget ?? 95) / 100;

            return {
              ...node,
              stage: "MODEL_2_CRIME" as DLStage,
              crimeType: crime,
              modelTelemetry: {
                ...node.modelTelemetry,
                stage2Crime: {
                  predictedCrime: crime,
                  softmaxProbability: prob,
                  featureWeights: {
                    packetFrequency: 0.38,
                    entropyVariance: 0.29,
                    payloadSignature: 0.33,
                  },
                  evaluatedAt: now,
                },
              },
              stageLogs: [
                ...(node.stageLogs || []),
                {
                  stage: "MODEL_2_CRIME" as DLStage,
                  message: `Stage 2 Crime Classifier: Softmax predicted signature [${crime}] with prob ${(prob * 100).toFixed(1)}%.`,
                  timestamp: now,
                },
              ],
            };
          }

          // Stage 2 -> Stage 3: MODEL_3_VERIFY
          if (node.stage === "MODEL_2_CRIME") {
            hasChanges = true;
            const isThreat = node.isThreatTarget !== false;
            const confidence = node.expectedConfidenceTarget ?? 98.4;

            return {
              ...node,
              stage: "MODEL_3_VERIFY" as DLStage,
              modelTelemetry: {
                ...node.modelTelemetry,
                stage3Ensemble: {
                  ensembleRiskScore: isThreat ? Math.floor(confidence) : Math.floor(confidence * 0.2),
                  bayesianConfidence: confidence,
                  threatIntelMatch: isThreat,
                  finalVerdict: isThreat ? "CONFIRMED_THREAT" : "CLEARED_BENIGN",
                  evaluatedAt: now,
                },
              },
              stageLogs: [
                ...(node.stageLogs || []),
                {
                  stage: "MODEL_3_VERIFY" as DLStage,
                  message: `Stage 3 Ensemble Risk Scoring: Bayesian fusion confirmed risk score ${confidence}% -> Finalizing Verdict.`,
                  timestamp: now,
                },
              ],
            };
          }

          // Stage 3 -> Final Resolution: FLAGGED (Crimson #ef4444) or CLEARED (Neutral slate #64748b)
          if (node.stage === "MODEL_3_VERIFY") {
            hasChanges = true;
            const isThreat = node.isThreatTarget !== false;
            const finalStage: DLStage = isThreat ? "FLAGGED" : "CLEARED";
            const confidence = node.expectedConfidenceTarget ?? (isThreat ? 98.6 : 8.4);

            return {
              ...node,
              stage: finalStage,
              flagged: isThreat,
              confidence: confidence,
              stageLogs: [
                ...(node.stageLogs || []),
                {
                  stage: finalStage,
                  message: isThreat
                    ? `[FINAL VERDICT: THREAT FLAGGED] Locked into persistent Crimson alert (${confidence}% confidence). Node quarantined.`
                    : `[FINAL VERDICT: CLEARED BENIGN] Background noise cleared (${confidence}% risk score). Node set to neutral slate.`,
                  timestamp: now,
                },
              ],
            };
          }

          return node;
        });

        return hasChanges ? updatedNodes : currentNodes;
      });
    }, pipelineTickMs);

    return () => clearInterval(pipelineInterval);
  }, [isPlaying, speed]);

  // Manual Trigger: Inject custom attack IP into stream
  const injectManualPacket = useCallback(() => {
    const randomSubnets = ["185.220.101.0/24", "192.168.1.0/24", "10.0.4.0/24", "45.33.32.0/24"];
    const randomSubnet = randomSubnets[Math.floor(Math.random() * randomSubnets.length)];
    const ipLastOctet = Math.floor(10 + Math.random() * 240);
    const ipPrefix = randomSubnet.replace(".0/24", "");

    const manualPacket: CyberPacketTemplate = {
      ip: `${ipPrefix}.${ipLastOctet}`,
      mac: Math.random() > 0.5 ? "00:1A:2B:6F:43:89" : "E2:49:11:80:BC:99",
      subnet: randomSubnet,
      asnOrg: "AS40092 Sovereign Threat Cloud",
      country: "Russian Federation",
      countryCode: "RU",
      portMatrix: "4444/TCP, 9001/TCP",
      protocol: "Cobalt Strike Beacon",
      bytesTransferred: `${(Math.random() * 800).toFixed(1)} MB`,
      ja3Fingerprint: "771,4865-4866,0-10-11",
      md5Hash: "f9e8d7c6b5a41234567890abcdef1234",
      sha256Hash: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      geoCoords: "55.7558° N, 37.6173° E",
      isThreat: true,
      expectedCrime: "C2_TUNNEL_BEACON",
      expectedConfidence: 99.4,
      anomalyScore: 0.98,
    };

    ingestPacket(manualPacket);
  }, [ingestPacket]);

  // Reset Stream
  const resetStream = useCallback(() => {
    setNodes([]);
    setLinks([]);
    setSelectedNodeId(null);
    packetIndexRef.current = 0;
    nodeCounterRef.current = 0;
  }, []);

  // Quarantine node action
  const quarantineNode = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              stage: "FLAGGED",
              flagged: true,
              stageLogs: [
                ...(n.stageLogs || []),
                {
                  stage: "FLAGGED",
                  message: "Manual Analyst Intervention: Node placed in strict cryptographic quarantine.",
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : n
      )
    );
  }, []);

  // Live Metrics Calculations
  const metrics: StreamMetrics = {
    totalIngested: nodes.length,
    activeInPipeline: nodes.filter(
      (n) => n.stage !== "FLAGGED" && n.stage !== "CLEARED"
    ).length,
    confirmedThreats: nodes.filter((n) => n.stage === "FLAGGED").length,
    clearedBenign: nodes.filter((n) => n.stage === "CLEARED").length,
    activeClusters: new Set(nodes.map((n) => n.subnet)).size,
    currentTps: isPlaying ? +(1.2 * speed).toFixed(1) : 0,
  };

  // Filtered nodes by search & stage
  const filteredNodes = nodes.filter((node) => {
    const matchesFilter = activeFilter === "ALL" || node.stage === activeFilter;
    if (!matchesFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      node.ip.toLowerCase().includes(q) ||
      node.mac.toLowerCase().includes(q) ||
      node.subnet.toLowerCase().includes(q) ||
      (node.crimeType && node.crimeType.toLowerCase().includes(q)) ||
      (node.asnOrg && node.asnOrg.toLowerCase().includes(q))
    );
  });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;

  return {
    nodes,
    filteredNodes,
    links,
    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    isPlaying,
    togglePlay: () => setIsPlaying((p) => !p),
    speed,
    setSpeed,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    metrics,
    injectManualPacket,
    resetStream,
    quarantineNode,
  };
}
