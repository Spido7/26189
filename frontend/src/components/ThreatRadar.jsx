"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  master,
  fir_records,
  person_details,
  queryByIp,
  queryCdrByPhone,
  SYNDICATE_STREAM_SEQUENCE,
} from "../data/mockDatabase.js";
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ShieldAlert,
  Server,
  PhoneCall,
  FileText,
  User,
  MapPin,
  Wifi,
  Lock,
  Cpu,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Copy,
  Check,
  ShieldCheck,
  Hash,
} from "lucide-react";

// Dynamically load ForceGraph2D on client side only
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0c0e12] text-slate-500 font-mono text-xs">
      <RefreshCw className="w-4 h-4 animate-spin text-amber-400 mr-2" />
      INITIALIZING INDUSTRIAL FORCE-GRAPH ENGINE...
    </div>
  ),
});

export default function ThreatRadar() {
  // --- Stream Engine State ---
  const [streamIndex, setStreamIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1500); // 1.5s per record ingestion
  const [activeClusterFilter, setActiveClusterFilter] = useState("ALL");

  // --- Graph Data State ---
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [scanningNodeId, setScanningNodeId] = useState(null);

  // --- Inspector Drawer State ---
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedTabs, setExpandedTabs] = useState({
    PERSONAL: true,
    FIR: true,
    CDR: true,
  });
  const [copiedField, setCopiedField] = useState(null);

  const toggleTabAccordion = (tabId) => {
    setExpandedTabs((prev) => ({
      ...prev,
      [tabId]: !prev[tabId],
    }));
  };

  const handleToggleAllDrawerTabs = () => {
    const areAnyCollapsed = Object.values(expandedTabs).some((v) => !v);
    if (areAnyCollapsed) {
      setExpandedTabs({ PERSONAL: true, FIR: true, CDR: true });
    } else {
      setExpandedTabs({ PERSONAL: false, FIR: false, CDR: false });
    }
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // --- Graph Ref & Animation Frame ---
  const graphRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 750 });
  const pulseAnimRef = useRef(0);

  // Animation pulse tick
  useEffect(() => {
    let animId;
    const loop = () => {
      pulseAnimRef.current = (pulseAnimRef.current + 0.04) % (Math.PI * 2);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Update canvas dimensions on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Center & zoom graph on initial load
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.zoom(1.15, 500);
      graphRef.current.centerAt(0, 0, 500);
    }
  }, []);

  // =========================================================================
  // CINEMATIC STREAM ENGINE (useInterval / setTimeout Chained Pacing)
  // =========================================================================
  useEffect(() => {
    if (!isPlaying) return;

    if (streamIndex >= SYNDICATE_STREAM_SEQUENCE.length) {
      setIsPlaying(false);
      return;
    }

    const currentRecord = SYNDICATE_STREAM_SEQUENCE[streamIndex];

    // STEP 1: SCANNING STATE (0.0s)
    setScanningNodeId(currentRecord.id);

    setNodes((prevNodes) => {
      const exists = prevNodes.some((n) => n.id === currentRecord.id);
      if (exists) return prevNodes;

      const posX = currentRecord.initialPos.x + (Math.random() - 0.5) * 15;
      const posY = currentRecord.initialPos.y + (Math.random() - 0.5) * 15;

      const newNode = {
        ...currentRecord,
        x: posX,
        y: posY,
        vx: 0,
        vy: 0,
        isScanning: true,
        isFlagged: false,
        flaggedAt: null,
      };

      return [...prevNodes, newNode];
    });

    // STEP 2: RESOLUTION STATE (After 1.0s)
    const resolutionTimer = setTimeout(() => {
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          if (n.id === currentRecord.id) {
            return {
              ...n,
              isScanning: false,
              isFlagged: true,
              flaggedAt: Date.now(),
            };
          }
          return n;
        })
      );
      setScanningNodeId(null);

      // Dynamically draw 1px edges to related nodes (ONLY AFTER NODE IS FLAGGED)
      if (currentRecord.linkedEdges && currentRecord.linkedEdges.length > 0) {
        setEdges((prevEdges) => {
          const newEdges = [...prevEdges];
          currentRecord.linkedEdges.forEach((link) => {
            const edgeId = `${currentRecord.id}->${link.targetId}`;
            const exists = newEdges.some(
              (e) =>
                (e.source === currentRecord.id && e.target === link.targetId) ||
                (e.source === link.targetId && e.target === currentRecord.id) ||
                (e.id === edgeId)
            );
            if (!exists) {
              newEdges.push({
                id: edgeId,
                source: currentRecord.id,
                target: link.targetId,
                label: link.label,
                type: link.type,
                weight: link.weight || 0.9,
                syndicateKey: currentRecord.syndicateKey,
              });
            }
          });
          return newEdges;
        });
      }
    }, 1000);

    // STEP 3: ADVANCE TO NEXT RECORD (Every 1.5s)
    const nextStepTimer = setTimeout(() => {
      setStreamIndex((prev) => prev + 1);
    }, speedMs);

    return () => {
      clearTimeout(resolutionTimer);
      clearTimeout(nextStepTimer);
    };
  }, [isPlaying, streamIndex, speedMs]);

  const handleTogglePlay = () => {
    if (streamIndex >= SYNDICATE_STREAM_SEQUENCE.length) {
      handleReset();
      setTimeout(() => setIsPlaying(true), 150);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStreamIndex(0);
    setNodes([]);
    setEdges([]);
    setScanningNodeId(null);
    setSelectedNode(null);
    setIsDrawerOpen(false);
  };

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  }, []);

  const filteredData = useMemo(() => {
    let visibleNodes = nodes;
    if (activeClusterFilter !== "ALL") {
      visibleNodes = nodes.filter((n) => n.syndicateKey === activeClusterFilter);
    }
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    const visibleEdges = edges.filter((e) => {
      const sourceId = typeof e.source === "object" ? e.source.id : e.source;
      const targetId = typeof e.target === "object" ? e.target.id : e.target;
      return visibleIds.has(sourceId) && visibleIds.has(targetId);
    });

    return { nodes: visibleNodes, links: visibleEdges };
  }, [nodes, edges, activeClusterFilter]);

  const forensicData = useMemo(() => {
    if (!selectedNode) return null;

    const dbLookup = queryByIp(selectedNode.ip);
    const cdrLogs = queryCdrByPhone(selectedNode.phone || dbLookup.master?.phone_no);

    return {
      node: selectedNode,
      master: dbLookup.master || {
        ip_address: selectedNode.ip,
        mac_address: selectedNode.mac,
        person_name: selectedNode.name,
        phone_no: selectedNode.phone,
        fir: selectedNode.firId,
        fir_id: selectedNode.firId,
        address: "Synchronized Address Record",
        isp_loaction: "Telecom Gateway Node",
      },
      fir_records: dbLookup.fir_records || {
        fir_id: selectedNode.firId,
        ip_address: selectedNode.ip,
        fir: selectedNode.firId,
        police_station: "Cyber Crime Police Station",
        name: selectedNode.name,
        address: "Jurisdictional Record",
        crpc_section: "Sec 420 IPC, 66D IT Act",
        phone_no: selectedNode.phone,
        crime_name: selectedNode.role || "Cyber Syndicate Operation",
      },
      person_details: dbLookup.person_details || {
        aadhar_no: "[Aadhaar Redacted]",
        ip_address: selectedNode.ip,
        name: selectedNode.name,
        address: "Verified Address Record",
        fir: selectedNode.firId,
        fir_id: selectedNode.firId,
      },
      aadhar_no: "[Aadhaar Redacted]",
      cdr: cdrLogs,
    };
  }, [selectedNode]);

  // =========================================================================
  // INDUSTRIAL CHIC CANVAS OBJECT RENDERING
  // =========================================================================
  const drawNode = useCallback((node, ctx, globalScale) => {
    const isScanning = node.isScanning;
    const isSelected = selectedNode?.id === node.id;
    const r = 7.5;
    const pulseFactor = Math.sin(pulseAnimRef.current * 2) * 0.5 + 0.5;

    // --- 1. SCANNING STATE: Blueprint Radar Pulse ---
    if (isScanning) {
      // Outer expanding warning ring
      const ringRadius = r + 5 + pulseFactor * 6;
      ctx.beginPath();
      ctx.arc(node.x, node.y, ringRadius, 0, 2 * Math.PI, false);
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.7 - pulseFactor * 0.5})`;
      ctx.lineWidth = 1.2 / globalScale;
      ctx.setLineDash([3 / globalScale, 3 / globalScale]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tactical Crosshairs
      ctx.beginPath();
      ctx.moveTo(node.x - (r + 8), node.y);
      ctx.lineTo(node.x + (r + 8), node.y);
      ctx.moveTo(node.x, node.y - (r + 8));
      ctx.lineTo(node.x, node.y + (r + 8));
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 0.8 / globalScale;
      ctx.stroke();

      // Core node
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
      ctx.fillStyle = "#0369a1";
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.8 / globalScale;
      ctx.stroke();

      // Label: [SCANNING // <IP>]
      const labelText = `[SCANNING // ${node.ip || node.name}]`;
      const fontSize = 10 / globalScale;
      ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
      const textWidth = ctx.measureText(labelText).width;
      const boxPadX = 6 / globalScale;
      const boxPadY = 3 / globalScale;
      const labelY = node.y + r + 9 / globalScale;

      ctx.fillStyle = "rgba(12, 14, 18, 0.95)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      ctx.lineWidth = 1 / globalScale;
      ctx.beginPath();
      ctx.roundRect(
        node.x - textWidth / 2 - boxPadX,
        labelY - fontSize / 2 - boxPadY,
        textWidth + boxPadX * 2,
        fontSize + boxPadY * 2,
        2 / globalScale
      );
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labelText, node.x, labelY);
      return;
    }

    // --- 2. RESOLUTION STATE: Machined Tactical Threat Node ---
    let strokeColor = "#ef4444"; // Threat crimson
    let accentBadgeColor = "#ef4444";
    if (node.syndicateKey === "JAMTARA") {
      strokeColor = "#f59e0b"; // Safety amber
      accentBadgeColor = "#f59e0b";
    }
    if (node.syndicateKey === "DELHI_HAWALA") {
      strokeColor = "#c084fc"; // Hawala violet
      accentBadgeColor = "#c084fc";
    }
    if (node.syndicateKey === "BLR_RANSOMWARE") {
      strokeColor = "#ef4444"; // Crimson
      accentBadgeColor = "#ef4444";
    }

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 5, 0, 2 * Math.PI, false);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Node body (brushed gunmetal steel)
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = isSelected ? "#1e293b" : "#13171e";
    ctx.fill();
    ctx.strokeStyle = isSelected ? "#f59e0b" : strokeColor;
    ctx.lineWidth = 1.8 / globalScale;
    ctx.stroke();

    // Inner machined core
    ctx.beginPath();
    ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = strokeColor;
    ctx.fill();

    // Node Label
    const labelTitle = `[FLAGGED] ${node.name}`;
    const labelSub = `${node.ip} · ${node.syndicateKey}`;
    const fontSize = 9.5 / globalScale;
    const subFontSize = 8 / globalScale;

    ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
    const titleWidth = ctx.measureText(labelTitle).width;
    ctx.font = `${subFontSize}px "JetBrains Mono", monospace`;
    const subWidth = ctx.measureText(labelSub).width;
    const maxTextWidth = Math.max(titleWidth, subWidth);

    const boxPadX = 6 / globalScale;
    const boxPadY = 3 / globalScale;
    const totalBoxHeight = fontSize + subFontSize + 7 / globalScale;
    const labelY = node.y + r + 10 / globalScale;

    // Machined pill background
    ctx.fillStyle = "rgba(19, 23, 30, 0.95)";
    ctx.strokeStyle = isSelected ? "rgba(245, 158, 11, 0.7)" : "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 0.8 / globalScale;
    ctx.beginPath();
    ctx.roundRect(
      node.x - maxTextWidth / 2 - boxPadX,
      labelY - boxPadY,
      maxTextWidth + boxPadX * 2,
      totalBoxHeight,
      2 / globalScale
    );
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(labelTitle, node.x, labelY);

    // Subtitle
    ctx.font = `${subFontSize}px "JetBrains Mono", monospace`;
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(labelSub, node.x, labelY + fontSize + 2.5 / globalScale);
  }, [selectedNode]);

  // =========================================================================
  // INDUSTRIAL CHIC EDGE RENDERING
  // =========================================================================
  const drawLink = useCallback((link, ctx, globalScale) => {
    const source = link.source;
    const target = link.target;
    if (!source || !target || typeof source.x !== "number" || typeof target.x !== "number") {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    if (link.syndicateKey === "JAMTARA") ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
    if (link.syndicateKey === "DELHI_HAWALA") ctx.strokeStyle = "rgba(192, 132, 252, 0.35)";
    if (link.syndicateKey === "BLR_RANSOMWARE") ctx.strokeStyle = "rgba(239, 68, 68, 0.35)";
    ctx.lineWidth = 1.2 / globalScale;
    ctx.stroke();

    if (link.label) {
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;

      const fontSize = 7.5 / globalScale;
      ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
      const textWidth = ctx.measureText(link.label).width;
      const padX = 4 / globalScale;
      const padY = 2 / globalScale;

      ctx.fillStyle = "rgba(19, 23, 30, 0.95)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
      ctx.lineWidth = 0.6 / globalScale;
      ctx.beginPath();
      ctx.roundRect(
        midX - textWidth / 2 - padX,
        midY - fontSize / 2 - padY,
        textWidth + padX * 2,
        fontSize + padY * 2,
        2 / globalScale
      );
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#cbd5e1";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(link.label, midX, midY);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[750px] flex flex-col bg-[#0c0e12] text-slate-100 font-mono select-none overflow-hidden bg-industrial-grid"
    >
      {/* INDUSTRIAL TOP HUD */}
      <header className="shrink-0 z-30 bg-[#13171e]/95 border-b border-slate-700/60 backdrop-blur-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: Brand & Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100 tracking-wider uppercase">
                  THREAT RADAR WORKSTATION
                </span>
                <span className="text-[9px] px-1.5 py-0.2 font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded">
                  [RADAR-04]
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                1.5s Stream Ingestion Engine · 3 Triangulated Cartels
              </div>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-700/60 hidden md:block" />

          {/* Cluster Filter Buttons */}
          <div className="hidden lg:flex items-center gap-1.5">
            {[
              { id: "ALL", label: "[00] ALL CARTELS" },
              { id: "JAMTARA", label: "[01] JAMTARA PHISHING" },
              { id: "DELHI_HAWALA", label: "[02] DELHI HAWALA" },
              { id: "BLR_RANSOMWARE", label: "[03] BLR RANSOMWARE" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveClusterFilter(tab.id)}
                className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider rounded transition-all cursor-pointer ${
                  activeClusterFilter === tab.id
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "bg-[#1a202a]/60 text-slate-400 hover:text-slate-200 hover:bg-[#222a36] border border-slate-700/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Industrial Telemetry Readouts */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1a202a] border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase">INGESTED:</span>
            <span className="text-amber-400 font-bold font-mono">
              {nodes.length} / {SYNDICATE_STREAM_SEQUENCE.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1a202a] border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase">FLAGGED:</span>
            <span className="text-red-400 font-bold font-mono">
              {nodes.filter((n) => n.isFlagged).length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1a202a] border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase">VECTORS:</span>
            <span className="text-sky-400 font-bold font-mono">{edges.length}</span>
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-3.5 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
              isPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30"
                : streamIndex >= SYNDICATE_STREAM_SEQUENCE.length
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 shadow-md font-extrabold"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                PAUSE STREAM
              </>
            ) : streamIndex >= SYNDICATE_STREAM_SEQUENCE.length ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                RE-RUN SIMULATION
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                START STREAM INGESTION
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="Reset Graph"
            className="p-1.5 bg-[#1a202a] hover:bg-[#222a36] text-slate-400 hover:text-slate-100 border border-slate-700/60 rounded transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setSpeedMs((prev) => (prev === 1500 ? 800 : 1500))}
            title="Toggle Stream Pace"
            className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 bg-[#1a202a] hover:bg-[#222a36] rounded border border-slate-700/60 transition-all cursor-pointer"
          >
            PACE: {speedMs === 1500 ? "1.5s" : "0.8s"}
          </button>
        </div>
      </header>

      {/* MAIN GRAPH CANVAS */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {/* Tactical Corner Watermark Annotations */}
        <div className="absolute top-3 left-4 pointer-events-none z-10 space-y-1 bg-[#13171e]/85 p-2 rounded border border-slate-700/40 backdrop-blur-sm">
          <div className="text-[10px] font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            CARTEL 01 · JAMTARA (SHARED HARDWARE)
          </div>
          <div className="text-[9px] text-slate-400 font-mono">
            Shared MAC A4:C3:F0:89:12:DE · Karmatar BTS
          </div>
        </div>

        <div className="absolute top-3 right-[420px] pointer-events-none z-10 space-y-1 text-right hidden xl:block bg-[#13171e]/85 p-2 rounded border border-slate-700/40 backdrop-blur-sm">
          <div className="text-[10px] font-bold text-purple-400 tracking-wider uppercase flex items-center justify-end gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            CARTEL 02 · DELHI HAWALA (CRYPTO/USDT)
          </div>
          <div className="text-[9px] text-slate-400 font-mono">
            USDT Escrow OTC Desk & Angadia Couriers
          </div>
        </div>

        <div className="absolute bottom-5 left-4 pointer-events-none z-10 space-y-1 bg-[#13171e]/85 p-2 rounded border border-slate-700/40 backdrop-blur-sm">
          <div className="text-[10px] font-bold text-red-400 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            CARTEL 03 · BENGALURU RANSOMWARE (VPS/C2)
          </div>
          <div className="text-[9px] text-slate-400 font-mono">
            Shared VPS MAC 00:50:56:A1:B2:C3 · Exfiltration Relay
          </div>
        </div>

        {/* Tactical Scanning Toast */}
        {scanningNodeId && (
          <div className="absolute bottom-4 right-[420px] z-20 bg-[#13171e]/95 border border-sky-500/50 px-3.5 py-1.5 rounded backdrop-blur flex items-center gap-2.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[10px] text-sky-200 font-semibold tracking-wider">
              ANALYZING PACKET: {nodes.find((n) => n.id === scanningNodeId)?.ip || "TELEMETRY"}
            </span>
          </div>
        )}

        {/* Empty Canvas Prompt */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center space-y-3">
            <div className="p-4 rounded bg-[#13171e] border border-slate-700/60 shadow-lg">
              <Radio className="w-8 h-8 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                RADAR MATRIX STANDBY // AWAITING STREAM INGESTION
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Click "[START STREAM INGESTION]" in the top command bar to initialize the live simulation.
              </p>
            </div>
          </div>
        )}

        {/* ForceGraph2D Canvas */}
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={filteredData}
          backgroundColor="#0c0e12"
          nodeRelSize={7.5}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          linkCanvasObject={drawLink}
          onNodeClick={handleNodeClick}
          cooldownTicks={60}
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.25}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />

        {/* Tactical Canvas Controls */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-[#13171e]/95 border border-slate-700/60 p-1.5 rounded backdrop-blur shadow-md">
          <button
            type="button"
            onClick={() => graphRef.current?.zoom(1.4, 400)}
            title="Zoom In"
            className="p-1 hover:bg-[#222a36] text-slate-400 hover:text-amber-400 rounded transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => graphRef.current?.zoom(0.75, 400)}
            title="Zoom Out"
            className="p-1 hover:bg-[#222a36] text-slate-400 hover:text-amber-400 rounded transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              graphRef.current?.centerAt(0, 0, 400);
              graphRef.current?.zoom(1.15, 400);
            }}
            title="Reset View"
            className="p-1 hover:bg-[#222a36] text-slate-400 hover:text-amber-400 rounded transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3-TAB EXPANDABLE ACCORDION INSPECTOR DRAWER (w-[400px]) */}
      {isDrawerOpen && forensicData && (
        <aside
          className="fixed top-0 right-0 h-full w-[400px] z-50 bg-[#0e1117] border-l border-slate-700/60 backdrop-blur-xl flex flex-col shadow-2xl transition-all duration-200 font-mono text-slate-200"
          style={{ height: "100vh" }}
        >
          {/* Top Hazard Stripe Accent */}
          <div className="h-1.5 w-full hazard-stripes" />

          {/* Header */}
          <div className="shrink-0 p-3.5 border-b border-slate-700/60 bg-[#13171e] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-amber-400 font-bold">
                <Hash className="w-3 h-3" />
                <span>SUSPECT DOSSIER // CR-2024</span>
              </div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {forensicData.master.person_name}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 rounded">
                RISK {forensicData.node.riskScore}%
              </span>
              <button
                type="button"
                onClick={handleToggleAllDrawerTabs}
                title="Expand/Collapse All Tabs"
                className="p-1 text-slate-400 hover:text-slate-100 hover:bg-[#222a36] rounded transition-colors text-[9px] flex items-center gap-1 border border-slate-700/60 px-1.5"
              >
                <ChevronsUpDown className="w-3 h-3" />
                <span>ALL</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 hover:bg-[#222a36] rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expandable Tabs Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs custom-scrollbar">
            {/* ========================================================================= */}
            {/* EXPANDABLE TAB 1: PERSONAL IDENTITY & PII */}
            {/* ========================================================================= */}
            <div className="rounded border border-slate-700/60 bg-[#13171e] overflow-hidden transition-all shadow-sm">
              <button
                type="button"
                onClick={() => toggleTabAccordion("PERSONAL")}
                className="w-full flex items-center justify-between p-2.5 bg-[#1a202a] hover:bg-[#222a36] transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2">
                  {expandedTabs.PERSONAL ? (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300 shrink-0" />
                  )}
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                    PERSONAL IDENTITY
                  </span>
                </div>
                <span className="text-[8px] px-1.5 py-0.2 rounded font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  REDACTED PII
                </span>
              </button>

              {expandedTabs.PERSONAL && (
                <div className="p-3 space-y-3 border-t border-slate-700/60">
                  <div className="p-2 rounded bg-[#0c0e12] border border-amber-500/30 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">PII MASKING STATUS:</span>
                    <span className="text-[10px] font-bold text-amber-400">
                      [STRICT REDACTION APPLIED]
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <div className="text-[9px] uppercase text-slate-400 font-semibold">FULL NAME</div>
                      <div className="text-xs text-slate-100 font-bold mt-0.5">
                        {forensicData.master.person_name}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase text-slate-400 font-semibold">AADHAAR NO</span>
                        <span className="text-[8px] text-amber-400/80 font-mono font-medium">STATUTORY PRIVACY</span>
                      </div>
                      <div className="text-xs text-amber-400 font-bold mt-0.5 bg-[#0c0e12] px-2 py-1 rounded border border-amber-500/20">
                        {forensicData.aadhar_no}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] uppercase text-slate-400 font-semibold">REGISTERED ADDRESS</div>
                      <div className="text-xs text-slate-300 mt-0.5 leading-relaxed bg-[#0c0e12] p-2 rounded border border-slate-700/40">
                        {forensicData.master.address}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] uppercase text-slate-400 font-semibold">ISP TELECOM LOCATION</div>
                      <div className="text-xs text-sky-400 font-medium mt-0.5">
                        {forensicData.master.isp_loaction}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/40">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase text-slate-400 font-semibold">IP ADDRESS</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(forensicData.master.ip_address, "ip")}
                            className="text-[8px] text-amber-400 hover:text-amber-300 cursor-pointer font-bold"
                          >
                            {copiedField === "ip" ? "COPIED" : "COPY"}
                          </button>
                        </div>
                        <div className="text-xs text-red-400 font-bold mt-0.5 font-mono">
                          {forensicData.master.ip_address}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase text-slate-400 font-semibold">MAC ADDRESS</div>
                        <div className="text-xs text-slate-300 mt-0.5 font-mono">
                          {forensicData.master.mac_address}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase text-slate-400 font-semibold">PHONE MSISDN</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(forensicData.master.phone_no, "phone")}
                          className="text-[8px] text-amber-400 hover:text-amber-300 cursor-pointer font-bold"
                        >
                          {copiedField === "phone" ? "COPIED" : "COPY"}
                        </button>
                      </div>
                      <div className="text-xs text-emerald-400 font-bold mt-0.5 font-mono">
                        {forensicData.master.phone_no}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#0c0e12] rounded border border-slate-700/60 space-y-0.5">
                    <div className="text-[9px] uppercase text-slate-400 font-semibold">CARTEL NEXUS</div>
                    <div className="text-xs text-slate-100 font-bold">
                      {forensicData.node.syndicate}
                    </div>
                    <div className="text-[10px] text-amber-400">
                      Operational Role: {forensicData.node.role}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* EXPANDABLE TAB 2: FIR DOSSIER & LEGAL */}
            {/* ========================================================================= */}
            <div className="rounded border border-slate-700/60 bg-[#13171e] overflow-hidden transition-all shadow-sm">
              <button
                type="button"
                onClick={() => toggleTabAccordion("FIR")}
                className="w-full flex items-center justify-between p-2.5 bg-[#1a202a] hover:bg-[#222a36] transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2">
                  {expandedTabs.FIR ? (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300 shrink-0" />
                  )}
                  <FileText className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                    FIR DOSSIER & CHARGES
                  </span>
                </div>
                <span className="text-[8px] px-1.5 py-0.2 rounded font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                  ARREST WARRANT
                </span>
              </button>

              {expandedTabs.FIR && (
                <div className="p-3 space-y-3 border-t border-slate-700/60">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[9px] uppercase text-slate-400 font-semibold">FIR REFERENCE</div>
                        <div className="text-xs text-red-400 font-bold mt-0.5">
                          {forensicData.fir_records.fir_id} ({forensicData.fir_records.fir})
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(forensicData.fir_records.fir_id, "fir")}
                        className="text-[8px] text-amber-400 hover:text-amber-300 cursor-pointer font-bold"
                      >
                        {copiedField === "fir" ? "COPIED" : "COPY"}
                      </button>
                    </div>

                    <div>
                      <div className="text-[9px] uppercase text-slate-400 font-semibold">POLICE JURISDICTION</div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        {forensicData.fir_records.police_station}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] uppercase text-slate-400 font-semibold">CRPC / LEGAL SECTIONS</div>
                      <div className="text-xs text-amber-300 mt-1 p-2.5 bg-[#0c0e12] rounded border border-amber-500/30 leading-relaxed font-mono">
                        {forensicData.fir_records.crpc_section}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] uppercase text-slate-400 font-semibold">OFFENSE & MODUS OPERANDI</div>
                      <div className="text-xs text-slate-200 mt-0.5 leading-relaxed bg-[#0c0e12] p-2 rounded border border-slate-700/40">
                        {forensicData.fir_records.crime_name}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#0c0e12] rounded border border-slate-700/60 text-[10px] text-slate-400">
                    <div className="flex justify-between items-center text-slate-300 font-semibold mb-1">
                      <span className="flex items-center gap-1 text-amber-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        EVIDENCE INTEGRITY
                      </span>
                      <span className="text-emerald-400 font-bold">SEC 65B VALID</span>
                    </div>
                    Digital chain-of-custody hash verified for judicial court submission.
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* EXPANDABLE TAB 3: TELEPHONY & CDR LOGS */}
            {/* ========================================================================= */}
            <div className="rounded border border-slate-700/60 bg-[#13171e] overflow-hidden transition-all shadow-sm">
              <button
                type="button"
                onClick={() => toggleTabAccordion("CDR")}
                className="w-full flex items-center justify-between p-2.5 bg-[#1a202a] hover:bg-[#222a36] transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2">
                  {expandedTabs.CDR ? (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300 shrink-0" />
                  )}
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                    TELEPHONY (CDR)
                  </span>
                </div>
                <span className="text-[8px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {forensicData.cdr.length} EVENTS
                </span>
              </button>

              {expandedTabs.CDR && (
                <div className="p-3 space-y-3 border-t border-slate-700/60">
                  <div className="p-2 rounded bg-[#0c0e12] border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase text-slate-400 font-semibold">TARGET MSISDN</div>
                      <div className="text-xs text-emerald-400 font-bold font-mono">
                        {forensicData.master.phone_no}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {forensicData.cdr.length} Tower Records
                    </span>
                  </div>

                  <div className="space-y-2">
                    {forensicData.cdr.map((call, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded bg-[#0c0e12] border border-slate-700/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span
                            className={`px-1.5 py-0.2 rounded font-semibold text-[9px] ${
                              call.type === "OUTGOING"
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                : "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                            }`}
                          >
                            {call.type}
                          </span>
                          <span className="text-slate-300 font-mono">{call.duration}</span>
                          <span className="text-slate-500 font-mono">{call.timestamp}</span>
                        </div>

                        <div className="pt-1 text-[11px] space-y-0.5 font-mono">
                          <div className="text-slate-200">
                            {call.dialed_no}
                            <span className="text-amber-400 text-[10px] ml-1.5 font-semibold">
                              ({call.counterparty})
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            BTS Tower: {call.bts_tower}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 p-3 border-t border-slate-700/60 bg-[#13171e]">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="w-full py-2 bg-[#1a202a] hover:bg-[#222a36] text-slate-300 hover:text-slate-100 rounded text-xs font-bold transition-colors cursor-pointer border border-slate-700/60 uppercase tracking-wider"
            >
              CLOSE DOSSIER INSPECTOR
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
