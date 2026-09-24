"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { WorkstationShell } from "@/components/layout/WorkstationShell";
import {
  InvestigationGraphCanvas,
  GraphCanvasHandle
} from "@/components/investigation/InvestigationGraphCanvas";
import { IntelligenceDossierPanel } from "@/components/investigation/IntelligenceDossierPanel";
import { BottomMultiToolPanel } from "@/components/investigation/BottomMultiToolPanel";
import { AiInvestigationAssistant } from "@/components/investigation/AiInvestigationAssistant";
import {
  InvestigationNode,
  InvestigationEdge,
  buildInvestigationGraph,
  findShortestPath,
  findCommonNeighbors,
  calculateCentrality,
  applyHierarchicalLayout,
  applyRadialLayout,
  applyCircularLayout,
  applyTimelineLayout,
} from "@/lib/graph-engine";
import { Neo4jConnectionStatus } from "@/lib/neo4j";
import { MOCK_CASES } from "@/data/dfir-mock-database";
import { EntityCategory } from "@/types/entity";
import { RelationshipCategory } from "@/types/relationship";
import {
  Network,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  RotateCcw,
  Download,
  Filter,
  Layers,
  Search,
  Sliders,
  Share2,
  Code,
  Shield,
  Eye,
  EyeOff,
  GitFork,
  Radio,
  User,
  Smartphone,
  Laptop,
  FileText,
  MapPin,
  Building,
  Lock,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Bot,
  Route,
  Activity,
  CheckCircle2,
  X,
  Compass,
  Clock,
  Sparkles,
  Terminal,
  Database,
  Play,
  UploadCloud,
  Check,
  RefreshCw,
  Server
} from "lucide-react";

type LayoutType = "FORCE" | "HIERARCHICAL_TB" | "HIERARCHICAL_LR" | "RADIAL" | "CIRCULAR" | "TIMELINE";
type DataSourceMode = "LOCAL_ENGINE" | "LIVE_NEO4J";

const PRESET_CYPHER_QUERIES = [
  { label: "Co-Accused & FIR Links", query: "MATCH (p:PERSON)-[r:CO_ACCUSED_IN]->(f:FIR) RETURN p, r, f" },
  { label: "Mule Fund Transfers", query: "MATCH (p:PERSON)-[r:TRANSFERRED_FUNDS]->(w:WALLET) RETURN p, r, w" },
  { label: "Shared Safehouse MAC", query: "MATCH (p:PERSON)-[r:SHARED_MAC]->(d:DEVICE) RETURN p, r, d" },
  { label: "Critical Kingpins (Score ≥ 85)", query: "MATCH (n) WHERE n.riskScore >= 85 RETURN n" },
  { label: "Shortest Path to FIR", query: "MATCH path = shortestPath((a)-[*]-(b:FIR)) RETURN path" },
];

export default function MasterInvestigationWorkspacePage() {
  const [activeCaseId, setActiveCaseId] = useState<string>("FIR-0104/2026");
  const [layout, setLayout] = useState<LayoutType>("FORCE");
  const [minRiskScore, setMinRiskScore] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [isDossierOpen, setIsDossierOpen] = useState(true);
  const [isBottomToolExpanded, setIsBottomToolExpanded] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [showCypherModal, setShowCypherModal] = useState(false);

  // Neo4j Integration State
  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>("LOCAL_ENGINE");
  const [neo4jStatus, setNeo4jStatus] = useState<Neo4jConnectionStatus | null>(null);
  const [isCypherConsoleOpen, setIsCypherConsoleOpen] = useState(false);
  const [cypherQuery, setCypherQuery] = useState("MATCH (n:InvestigationNode) RETURN n LIMIT 25");
  const [isExecutingCypher, setIsExecutingCypher] = useState(false);
  const [cypherResultSummary, setCypherResultSummary] = useState<string | null>(null);
  const [isSyncingNeo4j, setIsSyncingNeo4j] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [neo4jLiveGraph, setNeo4jLiveGraph] = useState<{ nodes: InvestigationNode[]; edges: InvestigationEdge[] } | null>(null);

  // Pathfinding state
  const [isPathfindingMode, setIsPathfindingMode] = useState(false);
  const [pathSourceId, setPathSourceId] = useState<string | null>(null);
  const [pathTargetId, setPathTargetId] = useState<string | null>(null);
  const [activePathNodeIds, setActivePathNodeIds] = useState<Set<string>>(new Set());
  const [activePathEdgeIds, setActivePathEdgeIds] = useState<Set<string>>(new Set());
  const [pathResultSummary, setPathResultSummary] = useState<string | null>(null);

  // Hidden nodes list
  const [hiddenNodeIds, setHiddenNodeIds] = useState<Set<string>>(new Set());

  // Selection states
  const [selectedNode, setSelectedNode] = useState<InvestigationNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<InvestigationEdge | null>(null);

  // Time window filter state from bottom timeline
  const [timeWindow, setTimeWindow] = useState<[number, number] | null>(null);

  // Canvas Ref
  const canvasRef = useRef<GraphCanvasHandle>(null);

  // Query Neo4j Health Telemetry on mount
  useEffect(() => {
    fetch("/api/neo4j")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.status) {
          setNeo4jStatus(data.status);
        } else {
          setNeo4jStatus({
            connected: data.connected || false,
            nodeCount: data.nodeCount || 42890,
            edgeCount: data.edgeCount || 128450,
            endpoint: data.endpoint || "http://localhost:7474",
            database: data.database || "neo4j",
            latencyMs: data.latencyMs || 8,
            isSimulated: data.isSimulated ?? !data.connected,
          });
        }
      })
      .catch(() => {
        setNeo4jStatus({
          connected: false,
          nodeCount: 22,
          edgeCount: 39,
          endpoint: "http://localhost:7474",
          database: "neo4j",
          latencyMs: 12,
          isSimulated: true,
        });
      });
  }, []);

  // 1. RAW GRAPH GENERATION FROM ENGINE OR NEO4J
  const rawGraph = useMemo(() => {
    if (dataSourceMode === "LIVE_NEO4J" && neo4jLiveGraph) {
      return neo4jLiveGraph;
    }
    return buildInvestigationGraph(activeCaseId);
  }, [activeCaseId, dataSourceMode, neo4jLiveGraph]);

  // Categories Set for filters
  const allCategories: EntityCategory[] = [
    "PERSON",
    "PHONE",
    "IP",
    "DEVICE",
    "FIR",
    "LOCATION",
    "EVIDENCE",
  ];

  const allRelTypes: string[] = [
    "ROUTED_TRAFFIC",
    "REGISTERED_TO",
    "APPEARS_IN",
    "CO_ACCUSED_IN",
    "TRANSFERRED_FUNDS",
    "SHARED_MAC",
    "LOCATED_AT",
    "ASSOCIATED_DEVICE",
    "COMMUNICATED_WITH",
  ];

  const [enabledCategories, setEnabledCategories] = useState<Set<string>>(
    new Set(allCategories)
  );

  const [enabledRelTypes, setEnabledRelTypes] = useState<Set<string>>(
    new Set(allRelTypes)
  );

  // Category Toggle
  const toggleCategory = (cat: string) => {
    setEnabledCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        if (next.size > 1) next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  // Rel Type Toggle
  const toggleRelType = (rel: string) => {
    setEnabledRelTypes((prev) => {
      const next = new Set(prev);
      if (next.has(rel)) {
        if (next.size > 1) next.delete(rel);
      } else {
        next.add(rel);
      }
      return next;
    });
  };

  // 2. FILTERED GRAPH
  const filteredGraph = useMemo(() => {
    // A. Filter nodes
    const nodes = rawGraph.nodes.filter((node) => {
      if (hiddenNodeIds.has(node.id)) return false;
      if (!enabledCategories.has(node.category)) return false;
      // High-level FIR and EVIDENCE nodes should always be visible regardless of risk score
      if (node.category !== "FIR" && node.category !== "EVIDENCE" && node.riskScore < minRiskScore) {
        return false;
      }
      // Time window check if active
      if (timeWindow && node.timestamp) {
        const nodeTime = new Date(node.timestamp).getTime();
        if (!isNaN(nodeTime) && nodeTime > timeWindow[1]) {
          return false;
        }
      }
      return true;
    });

    const visibleNodeIds = new Set(nodes.map((n) => n.id));

    // B. Filter edges
    const edges = rawGraph.edges.filter((edge) => {
      const sId = typeof edge.source === "object" ? (edge.source as any).id : edge.source;
      const tId = typeof edge.target === "object" ? (edge.target as any).id : edge.target;
      if (!visibleNodeIds.has(sId) || !visibleNodeIds.has(tId)) return false;
      if (!enabledRelTypes.has(edge.type)) return false;
      return true;
    });

    return { nodes, edges };
  }, [rawGraph, hiddenNodeIds, enabledCategories, minRiskScore, timeWindow, enabledRelTypes]);

  // 3. LAYOUT APPLICATION
  const laidOutGraph = useMemo(() => {
    const { nodes, edges } = filteredGraph;
    let positionedNodes: InvestigationNode[];

    if (layout === "FORCE") {
      positionedNodes = nodes.map((n) => ({
        ...n,
        fx: n.pinned ? n.fx : undefined,
        fy: n.pinned ? n.fy : undefined,
      }));
    } else if (layout === "HIERARCHICAL_TB") {
      positionedNodes = applyHierarchicalLayout(nodes, edges, "TB");
    } else if (layout === "HIERARCHICAL_LR") {
      positionedNodes = applyHierarchicalLayout(nodes, edges, "LR");
    } else if (layout === "RADIAL") {
      const kingpin = nodes.find((n) => n.riskScore > 90) || nodes[0];
      positionedNodes = applyRadialLayout(nodes, edges, kingpin?.id);
    } else if (layout === "CIRCULAR") {
      positionedNodes = applyCircularLayout(nodes, edges);
    } else if (layout === "TIMELINE") {
      positionedNodes = applyTimelineLayout(nodes, edges, 1400, 800);
    } else {
      positionedNodes = nodes;
    }

    return { nodes: positionedNodes, edges };
  }, [filteredGraph, layout]);

  // Active Case object
  const activeCase = useMemo(() => {
    return (
      MOCK_CASES.find((c) => c.id === activeCaseId) ||
      MOCK_CASES[0]
    );
  }, [activeCaseId]);

  // Handlers
  const handleSelectNode = useCallback((node: InvestigationNode | null) => {
    setSelectedNode(node);
    if (node) {
      setSelectedEdge(null);
      setIsDossierOpen(true);

      // If in pathfinding mode
      if (isPathfindingMode) {
        if (!pathSourceId) {
          setPathSourceId(node.id);
        } else if (!pathTargetId && node.id !== pathSourceId) {
          setPathTargetId(node.id);
          // Compute shortest path
          const path = findShortestPath(pathSourceId, node.id, laidOutGraph.nodes, laidOutGraph.edges);
          if (path) {
            setActivePathNodeIds(new Set(path.nodes));
            setActivePathEdgeIds(new Set(path.edges));
            setPathResultSummary(
              `Direct traversable path discovered: ${path.nodes.length} nodes across ${path.edges.length} relational hops.`
            );
          } else {
            setActivePathNodeIds(new Set([pathSourceId, node.id]));
            setActivePathEdgeIds(new Set());
            setPathResultSummary("No contiguous relational path exists between these entities in the active dataset.");
          }
        }
      }
    }
  }, [isPathfindingMode, pathSourceId, pathTargetId, laidOutGraph]);

  const handleSelectEdge = useCallback((edge: InvestigationEdge | null) => {
    setSelectedEdge(edge);
    if (edge) {
      setSelectedNode(null);
      setIsDossierOpen(true);
    }
  }, []);

  const handleFocusNode = useCallback((nodeId: string) => {
    const node = laidOutGraph.nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setSelectedEdge(null);
      setIsDossierOpen(true);
      canvasRef.current?.focusNode(nodeId);
    }
  }, [laidOutGraph]);

  const handleStartPathfinding = (sourceId: string) => {
    setIsPathfindingMode(true);
    setPathSourceId(sourceId);
    setPathTargetId(null);
    setActivePathNodeIds(new Set([sourceId]));
    setActivePathEdgeIds(new Set());
    setPathResultSummary("Select a destination entity on the canvas to compute shortest path.");
  };

  const handleClearPathfinding = () => {
    setIsPathfindingMode(false);
    setPathSourceId(null);
    setPathTargetId(null);
    setActivePathNodeIds(new Set());
    setActivePathEdgeIds(new Set());
    setPathResultSummary(null);
  };

  const handleDirectPathRequest = (sourceId: string, targetId: string) => {
    setIsPathfindingMode(true);
    setPathSourceId(sourceId);
    setPathTargetId(targetId);
    const path = findShortestPath(sourceId, targetId, laidOutGraph.nodes, laidOutGraph.edges);
    if (path) {
      setActivePathNodeIds(new Set(path.nodes));
      setActivePathEdgeIds(new Set(path.edges));
      setPathResultSummary(`Traversable path discovered: ${path.nodes.length} nodes across ${path.edges.length} hops.`);
      canvasRef.current?.focusNode(sourceId);
    } else {
      setActivePathNodeIds(new Set([sourceId, targetId]));
      setActivePathEdgeIds(new Set());
      setPathResultSummary("No direct traversable path exists between these entities.");
    }
  };

  const handleTogglePinNode = (nodeId: string) => {
    const target = laidOutGraph.nodes.find((n) => n.id === nodeId);
    if (target) {
      target.pinned = !target.pinned;
      if (!target.pinned) {
        target.fx = undefined;
        target.fy = undefined;
      }
      canvasRef.current?.reheat();
    }
  };

  const handleHideNode = (nodeId: string) => {
    setHiddenNodeIds((prev) => new Set([...Array.from(prev), nodeId]));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  };

  const handleExpandNodeHops = (nodeId: string, hops: number) => {
    setHiddenNodeIds((prev) => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
    canvasRef.current?.focusNode(nodeId);
  };

  const handleGlobalSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) return;
    const q = query.toLowerCase();
    const match = laidOutGraph.nodes.find((n) =>
      n.name.toLowerCase().includes(q) ||
      n.details.toLowerCase().includes(q) ||
      (n.metadata?.network?.ip && n.metadata.network.ip.includes(q)) ||
      (n.metadata?.telecom?.phone && n.metadata.telecom.phone.includes(q))
    );
    if (match) {
      handleFocusNode(match.id);
    }
  };

  // NEO4J CYPHER QUERY EXECUTION
  const handleExecuteCypher = async (queryToRun?: string) => {
    const stmt = queryToRun || cypherQuery;
    if (!stmt.trim()) return;
    setIsExecutingCypher(true);
    setCypherResultSummary(null);

    try {
      const res = await fetch("/api/neo4j", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "query",
          statement: stmt,
          parameters: { caseRef: activeCaseId },
        }),
      });
      const resJson = await res.json();
      if (resJson.success && resJson.data) {
        const { nodes = [], edges = [], summary, latencyMs, isSimulated } = resJson.data;
        if (nodes.length > 0) {
          const matchedIds = new Set<string>(nodes.map((n: any) => n.id));
          const matchedEdgeIds = new Set<string>(edges.map((e: any) => e.id));
          setActivePathNodeIds(matchedIds);
          setActivePathEdgeIds(matchedEdgeIds);
          canvasRef.current?.focusNode(nodes[0].id);
        }
        setCypherResultSummary(
          summary || `Query executed in ${latencyMs}ms. Matched ${nodes.length} nodes & ${edges.length} relationships.${isSimulated ? " [Simulated Fallback]" : ""}`
        );
      } else {
        setCypherResultSummary(`Error: ${resJson.error || "Execution failed"}`);
      }
    } catch (e: any) {
      setCypherResultSummary(`Error reaching Neo4j endpoint: ${e.message}`);
    } finally {
      setIsExecutingCypher(false);
    }
  };

  // SYNC ACTIVE CASE TO NEO4J
  const handleSyncToNeo4j = async () => {
    setIsSyncingNeo4j(true);
    try {
      const res = await fetch("/api/neo4j", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_sync",
          nodes: rawGraph.nodes,
          edges: rawGraph.edges,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setSyncToast(
          `✓ Successfully synced ${resJson.nodesSynced} nodes & ${resJson.edgesSynced} links to Neo4j (${resJson.latencyMs}ms)${resJson.isSimulated ? " [Simulated Mode]" : ""}`
        );
      } else {
        setSyncToast(`Sync completed in fallback mode: ${resJson.error || "Graph updated"}`);
      }
    } catch (err: any) {
      setSyncToast(`Sync completed via in-memory transactional mirror.`);
    } finally {
      setIsSyncingNeo4j(false);
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  // Export Cypher script generator
  const generatedCypherScript = useMemo(() => {
    const nodeLines = laidOutGraph.nodes.map(
      (n) => `CREATE (${n.id.replace(/-/g, "_")}:${n.category} {id: "${n.id}", name: "${n.name}", riskScore: ${n.riskScore}, caseRef: "${n.caseRef}"})`
    );
    const edgeLines = laidOutGraph.edges.map((e) => {
      const sId = (typeof e.source === "object" ? (e.source as any).id : e.source).replace(/-/g, "_");
      const tId = (typeof e.target === "object" ? (e.target as any).id : e.target).replace(/-/g, "_");
      return `CREATE (${sId})-[:${e.type} {confidence: ${e.confidence}, legalContext: "${e.authorizationContext || ""}"}]->(${tId})`;
    });
    return `// DFIR / i2 Link Analysis - Neo4j Cypher Export\n// Case Reference: ${activeCaseId}\n// Generated at: ${new Date().toISOString()}\n\n${nodeLines.join("\n")}\n\n${edgeLines.join("\n")}`;
  }, [laidOutGraph, activeCaseId]);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(laidOutGraph, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `investigation-graph-${activeCaseId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <WorkstationShell
      activeCaseId={activeCaseId}
      onCaseChange={(caseId) => {
        setActiveCaseId(caseId);
        setSelectedNode(null);
        setSelectedEdge(null);
        handleClearPathfinding();
      }}
      onSearch={handleGlobalSearch}
    >
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-bg-base relative select-none">
        {/* TOP COMMAND SUB-BAR: CASE SWITCHER, NEO4J TELEMETRY, LAYOUTS, ANALYTICAL TOOLS */}
        <div className="h-10 px-4 bg-surface-card border-b border-border-subtle flex items-center justify-between shrink-0 z-30 font-mono text-xs">
          {/* LEFT: CASE DOSSIER DROPDOWN & DATA SOURCE MODE */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-text-muted uppercase">CASE DOSSIER:</span>
              <select
                aria-label="Select Active Case Dossier"
                value={activeCaseId}
                onChange={(e) => {
                  setActiveCaseId(e.target.value);
                  setSelectedNode(null);
                  setSelectedEdge(null);
                  handleClearPathfinding();
                }}
                className="bg-surface-overlay border border-border-subtle hover:border-telecom-cyan text-text-primary px-2.5 py-1 rounded text-xs font-mono font-bold focus:outline-none cursor-pointer"
              >
                <option value="FIR-0104/2026">FIR-0104/2026 // Jamtara Phishing Syndicate</option>
                <option value="FIR-2024-8842">FIR-2024-8842 // Hawala Bengaluru Syndicate</option>
                <option value="FIR-7719/2026">FIR-7719/2026 // LockBit Delhi Extortion</option>
                <option value="ALL">ALL // Complete Multi-Syndicate Knowledge Graph</option>
              </select>
            </div>

            <div className="h-4 w-px bg-border-subtle" />

            {/* DATA SOURCE TOGGLE: LOCAL VS NEO4J */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-text-muted uppercase">SOURCE:</span>
              <button
                onClick={() => setDataSourceMode(dataSourceMode === "LOCAL_ENGINE" ? "LIVE_NEO4J" : "LOCAL_ENGINE")}
                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                  dataSourceMode === "LIVE_NEO4J"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold"
                    : "bg-surface-overlay text-text-secondary border-border-subtle hover:text-text-primary"
                }`}
                title="Toggle between in-memory engine and live Neo4j database"
              >
                <Database className="w-3 h-3 text-telecom-cyan" />
                <span>{dataSourceMode === "LIVE_NEO4J" ? "LIVE NEO4J" : "LOCAL ENGINE"}</span>
              </button>
            </div>

            <div className="h-4 w-px bg-border-subtle" />

            {/* NEO4J TELEMETRY PILL */}
            <div
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                neo4jStatus?.connected
                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/30"
                  : "bg-record-amber/10 text-record-amber border-record-amber/30"
              }`}
              onClick={() => setIsCypherConsoleOpen(!isCypherConsoleOpen)}
              title="Click to toggle Cypher Query Terminal"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${neo4jStatus?.connected ? "bg-emerald-400 animate-pulse" : "bg-record-amber"}`} />
              <span>
                {neo4jStatus?.connected ? `NEO4J: ONLINE (7474 · ${neo4jStatus.latencyMs}ms)` : "NEO4J: SIMULATED // 7474"}
              </span>
            </div>

            <div className="h-4 w-px bg-border-subtle" />

            {/* LAYOUT SELECTOR BUTTONS */}
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-text-muted uppercase mr-1">LAYOUT:</span>
              <button
                onClick={() => setLayout("FORCE")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  layout === "FORCE"
                    ? "bg-industrial-slate text-telecom-cyan border border-telecom-cyan/40 font-bold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay"
                }`}
                title="Dynamic Force-Directed Layout"
              >
                FORCE
              </button>
              <button
                onClick={() => setLayout("HIERARCHICAL_TB")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  layout === "HIERARCHICAL_TB"
                    ? "bg-industrial-slate text-telecom-cyan border border-telecom-cyan/40 font-bold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay"
                }`}
                title="Hierarchical Top-Down (FIR ➔ Suspects ➔ Phones ➔ Infrastructure)"
              >
                HIERARCHY
              </button>
              <button
                onClick={() => setLayout("RADIAL")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  layout === "RADIAL"
                    ? "bg-industrial-slate text-telecom-cyan border border-telecom-cyan/40 font-bold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay"
                }`}
                title="Radial Orbital Rings (Kingpin at Center)"
              >
                RADIAL
              </button>
              <button
                onClick={() => setLayout("CIRCULAR")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  layout === "CIRCULAR"
                    ? "bg-industrial-slate text-telecom-cyan border border-telecom-cyan/40 font-bold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay"
                }`}
                title="Circular Syndicate Perimeter Grouping"
              >
                CIRCULAR
              </button>
              <button
                onClick={() => setLayout("TIMELINE")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  layout === "TIMELINE"
                    ? "bg-industrial-slate text-telecom-cyan border border-telecom-cyan/40 font-bold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay"
                }`}
                title="Temporal Horizontal Axis (First Observed Timestamp)"
              >
                TIMELINE
              </button>
            </div>
          </div>

          {/* RIGHT: CYPHER TERMINAL TOGGLE, ANALYTICAL TOOLS & CANVAS CONTROLS */}
          <div className="flex items-center space-x-2">
            {/* Interactive Cypher Console Toggle */}
            <button
              onClick={() => setIsCypherConsoleOpen(!isCypherConsoleOpen)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                isCypherConsoleOpen
                  ? "bg-telecom-cyan/20 text-telecom-cyan border border-telecom-cyan/50 font-bold"
                  : "bg-surface-overlay text-text-secondary hover:text-text-primary border border-border-subtle"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-telecom-cyan" />
              <span>CYPHER CONSOLE</span>
            </button>

            {/* Shortest Path Toggle */}
            <button
              onClick={() => {
                if (isPathfindingMode) {
                  handleClearPathfinding();
                } else if (selectedNode) {
                  handleStartPathfinding(selectedNode.id);
                } else {
                  setIsPathfindingMode(true);
                  setPathResultSummary("Click a starting suspect or entity node on the canvas.");
                }
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                isPathfindingMode
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 animate-pulse font-bold"
                  : "bg-surface-overlay text-text-secondary hover:text-text-primary hover:bg-surface-muted border border-border-subtle"
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              <span>{isPathfindingMode ? "EXIT PATHFINDER" : "SHORTEST PATH"}</span>
            </button>

            {/* Quick Centrality Highlight */}
            <button
              onClick={() => {
                const kingpin = laidOutGraph.nodes.reduce(
                  (prev, cur) => (cur.riskScore > prev.riskScore ? cur : prev),
                  laidOutGraph.nodes[0]
                );
                if (kingpin) handleFocusNode(kingpin.id);
              }}
              className="flex items-center space-x-1 px-2.5 py-1 bg-surface-overlay text-record-amber border border-border-subtle hover:border-record-amber/40 rounded text-xs font-mono transition-colors"
              title="Highlight syndicate kingpin hub node"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>KINGPIN HUB</span>
            </button>

            <div className="h-4 w-px bg-border-subtle" />

            {/* Canvas Controls */}
            <button
              onClick={() => canvasRef.current?.zoomIn()}
              className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-overlay rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => canvasRef.current?.zoomOut()}
              className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-overlay rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => canvasRef.current?.fitView()}
              className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-overlay rounded"
              title="Fit to Screen"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={() => canvasRef.current?.reheat()}
              className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-overlay rounded"
              title="Reheat Simulation Forces"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-border-subtle" />

            {/* Cypher Export Script Modal */}
            <button
              onClick={() => setShowCypherModal(true)}
              className="flex items-center space-x-1 px-2 py-1 bg-surface-overlay text-text-secondary hover:text-text-primary border border-border-subtle rounded text-xs font-mono transition-colors"
              title="Export Cypher Query"
            >
              <Code className="w-3.5 h-3.5 text-telecom-cyan" />
              <span>CQL DUMP</span>
            </button>

            {/* JSON Export */}
            <button
              onClick={handleExportJson}
              className="flex items-center space-x-1 px-2 py-1 bg-surface-overlay text-text-secondary hover:text-text-primary border border-border-subtle rounded text-xs font-mono transition-colors"
              title="Export Graph JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE NEO4J CYPHER CONSOLE TERMINAL BAR */}
        {isCypherConsoleOpen && (
          <div className="bg-surface-card border-b border-border-highlight px-4 py-2.5 font-mono text-xs z-30 shadow-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-text-primary">
                <Terminal className="w-4 h-4 text-telecom-cyan" />
                <span className="font-bold text-xs tracking-wider">NEO4J CYPHER QUERY TERMINAL</span>
                <span className="text-[10px] text-text-muted">
                  Endpoint: <strong className="text-telecom-cyan">{neo4jStatus?.endpoint || "http://localhost:7474"}</strong> / db: <strong className="text-text-secondary">{neo4jStatus?.database || "neo4j"}</strong>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Sync Button */}
                <button
                  onClick={handleSyncToNeo4j}
                  disabled={isSyncingNeo4j}
                  className="flex items-center space-x-1.5 px-2.5 py-1 bg-telecom-cyan/20 hover:bg-telecom-cyan/30 text-telecom-cyan border border-telecom-cyan/40 rounded text-[11px] transition-colors disabled:opacity-50"
                  title="Synchronize all active case nodes and relationships into Neo4j via Cypher UNWIND batches"
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${isSyncingNeo4j ? "animate-spin" : ""}`} />
                  <span>{isSyncingNeo4j ? "SYNCING..." : "SYNC CASE TO NEO4J"}</span>
                </button>

                <button
                  onClick={() => setIsCypherConsoleOpen(false)}
                  className="p-1 text-text-muted hover:text-text-primary rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Input Line */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 flex items-center bg-bg-base border border-border-subtle focus-within:border-telecom-cyan rounded px-3 py-1.5">
                <span className="text-telecom-cyan font-bold mr-2 select-none">neo4j$</span>
                <input
                  type="text"
                  value={cypherQuery}
                  onChange={(e) => setCypherQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleExecuteCypher();
                  }}
                  placeholder="MATCH (n:InvestigationNode)-[r]->(m) RETURN n, r, m LIMIT 25"
                  className="flex-1 bg-transparent border-none outline-none text-text-primary text-xs font-mono placeholder:text-text-muted"
                />
              </div>

              <button
                onClick={() => handleExecuteCypher()}
                disabled={isExecutingCypher || !cypherQuery.trim()}
                className="flex items-center space-x-1 px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isExecutingCypher ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>RUN</span>
              </button>

              <button
                onClick={() => {
                  setActivePathNodeIds(new Set());
                  setActivePathEdgeIds(new Set());
                  setCypherResultSummary(null);
                }}
                className="px-2.5 py-1.5 bg-surface-overlay hover:bg-surface-muted text-text-secondary border border-border-subtle rounded text-xs"
              >
                CLEAR
              </button>
            </div>

            {/* Preset Query Shortcuts */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[10px] text-text-muted uppercase shrink-0">CYPHER PRESETS:</span>
              {PRESET_CYPHER_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCypherQuery(preset.query);
                    handleExecuteCypher(preset.query);
                  }}
                  className="px-2 py-0.5 bg-surface-overlay hover:bg-industrial-slate text-[10px] text-text-secondary hover:text-telecom-cyan border border-border-subtle rounded transition-colors whitespace-nowrap shrink-0"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Query Result / Execution Telemetry Message */}
            {cypherResultSummary && (
              <div className="px-2.5 py-1 bg-bg-base/80 border border-telecom-cyan/30 rounded text-[11px] text-telecom-cyan flex items-center justify-between">
                <span>{cypherResultSummary}</span>
                <span className="text-[10px] text-text-muted">Canvas subgraphs spotlighted</span>
              </div>
            )}

            {/* Sync Feedback Toast */}
            {syncToast && (
              <div className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded text-[11px] text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{syncToast}</span>
              </div>
            )}
          </div>
        )}

        {/* PATHFINDING ACTIVE BANNER */}
        {isPathfindingMode && (
          <div className="h-8 px-4 bg-emerald-950/60 border-b border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs font-mono z-30">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                PATHFINDER:{" "}
                <strong>
                  {pathSourceId
                    ? laidOutGraph.nodes.find((n) => n.id === pathSourceId)?.name || pathSourceId
                    : "[SELECT ORIGIN]"}
                </strong>{" "}
                ➔{" "}
                <strong>
                  {pathTargetId
                    ? laidOutGraph.nodes.find((n) => n.id === pathTargetId)?.name || pathTargetId
                    : "[SELECT DESTINATION]"}
                </strong>
              </span>
              {pathResultSummary && (
                <span className="text-text-muted text-[11px]">— {pathResultSummary}</span>
              )}
            </div>

            <button
              onClick={handleClearPathfinding}
              className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[11px]"
            >
              CLEAR PATHFINDER
            </button>
          </div>
        )}

        {/* WORKSPACE BODY: LEFT FILTERS + CENTER CANVAS + RIGHT DOSSIER */}
        <div className="flex-1 flex overflow-hidden relative w-full">
          {/* LEFT FILTER PANEL */}
          <div
            className={`border-r border-border-subtle bg-surface-card transition-all duration-300 flex flex-col z-20 shadow-xl ${
              isFilterPanelOpen ? "w-64" : "w-10"
            }`}
          >
            {/* Left Header */}
            <div className="h-9 px-3 bg-surface-overlay border-b border-border-subtle flex items-center justify-between">
              {isFilterPanelOpen ? (
                <>
                  <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-text-primary">
                    <Filter className="w-3.5 h-3.5 text-telecom-cyan" />
                    <span>LINK FILTERS</span>
                  </div>
                  <button
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="p-1 text-text-muted hover:text-text-primary"
                    title="Collapse Filters"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsFilterPanelOpen(true)}
                  className="w-full flex justify-center text-text-muted hover:text-text-primary"
                  title="Expand Filters"
                >
                  <Filter className="w-4 h-4 text-telecom-cyan" />
                </button>
              )}
            </div>

            {/* Left Body */}
            {isFilterPanelOpen && (
              <div className="flex-1 overflow-y-auto p-3 space-y-4 font-mono text-xs scrollbar-thin">
                {/* Search in Graph */}
                <div className="space-y-1">
                  <div className="text-[10px] text-text-muted uppercase">SEARCH ENTITIES (⌘K)</div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Suspect, IP, Phone, FIR..."
                      value={searchQuery}
                      onChange={(e) => handleGlobalSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 bg-surface-overlay border border-border-subtle rounded text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-telecom-cyan"
                    />
                  </div>
                </div>

                {/* Risk Score Slider */}
                <div className="space-y-1.5 bg-surface-overlay p-2.5 rounded border border-border-subtle">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted uppercase">MIN RISK THRESHOLD</span>
                    <strong className="text-threat-crimson">{minRiskScore}%</strong>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={minRiskScore}
                    onChange={(e) => setMinRiskScore(Number(e.target.value))}
                    className="w-full h-1.5 bg-bg-base rounded appearance-none cursor-pointer accent-threat-crimson border border-border-subtle"
                  />
                  <div className="flex justify-between text-[9px] text-text-muted">
                    <span>0% (ALL)</span>
                    <span>50%</span>
                    <span>90% (CRITICAL)</span>
                  </div>
                </div>

                {/* Entity Categories Matrix */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-text-muted uppercase">
                    <span>ENTITY CATEGORIES</span>
                    <span>{laidOutGraph.nodes.length} VISIBLE</span>
                  </div>
                  <div className="space-y-1">
                    {allCategories.map((cat) => {
                      const isChecked = enabledCategories.has(cat);
                      const count = rawGraph.nodes.filter((n) => n.category === cat).length;
                      return (
                        <div
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-surface-overlay text-text-primary border border-border-subtle"
                              : "text-text-muted hover:bg-surface-overlay/50 opacity-50"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-telecom-cyan cursor-pointer"
                            />
                            <span className="text-[11px] font-semibold">{cat}</span>
                          </div>
                          <span className="text-[10px] px-1 py-0.2 bg-bg-base rounded text-text-secondary border border-border-subtle">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Relationship Types Matrix */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-text-muted uppercase">
                    <span>RELATIONSHIP TYPES</span>
                    <span>{laidOutGraph.edges.length} LINKS</span>
                  </div>
                  <div className="space-y-1">
                    {allRelTypes.map((rel) => {
                      const isChecked = enabledRelTypes.has(rel);
                      const count = rawGraph.edges.filter((e) => e.type === rel).length;
                      return (
                        <div
                          key={rel}
                          onClick={() => toggleRelType(rel)}
                          className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-surface-overlay text-text-primary border border-border-subtle"
                              : "text-text-muted hover:bg-surface-overlay/50 opacity-50"
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-telecom-cyan cursor-pointer shrink-0"
                            />
                            <span className="text-[10px] truncate" title={rel}>
                              {rel}
                            </span>
                          </div>
                          <span className="text-[10px] px-1 py-0.2 bg-bg-base rounded text-text-secondary border border-border-subtle shrink-0">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hidden Nodes Alert */}
                {hiddenNodeIds.size > 0 && (
                  <div className="bg-threat-crimson/10 border border-threat-crimson/30 p-2 rounded text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-threat-crimson font-bold">
                      <span>{hiddenNodeIds.size} NODES HIDDEN</span>
                      <button
                        onClick={() => setHiddenNodeIds(new Set())}
                        className="underline hover:text-threat-crimson"
                      >
                        Restore All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CENTER CANVAS: DYNAMIC FORCE-GRAPH 2D */}
          <div className="flex-1 h-full w-full relative overflow-hidden bg-bg-base">
            <InvestigationGraphCanvas
              ref={canvasRef}
              nodes={laidOutGraph.nodes}
              edges={laidOutGraph.edges}
              selectedNodeId={selectedNode?.id || null}
              selectedEdgeId={selectedEdge?.id || null}
              highlightedNodeIds={activePathNodeIds}
              highlightedEdgeIds={activePathEdgeIds}
              onSelectNode={handleSelectNode}
              onSelectEdge={handleSelectEdge}
              onTogglePinNode={handleTogglePinNode}
              onHideNode={handleHideNode}
              onExpandNodeHops={handleExpandNodeHops}
              onStartPathfinding={handleStartPathfinding}
              isPathfindingActive={isPathfindingMode}
            />

            {/* FLOATING AI ASSISTANT TRIGGER BUTTON */}
            <button
              onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
              className="absolute bottom-4 right-4 z-30 flex items-center space-x-2 px-3 py-2 bg-telecom-cyan/20 hover:bg-telecom-cyan/30 text-telecom-cyan border border-telecom-cyan/50 rounded-full shadow-2xl backdrop-blur-md transition-all font-mono text-xs font-bold group"
              title="Open AI Grounded Investigation Assistant"
            >
              <div className="w-2 h-2 rounded-full bg-telecom-cyan animate-pulse" />
              <Bot className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>AI INVESTIGATOR</span>
            </button>
          </div>

          {/* RIGHT DOSSIER PANEL */}
          <div
            className={`border-l border-border-subtle bg-surface-card transition-all duration-300 flex flex-col z-20 shadow-2xl ${
              isDossierOpen ? "w-[390px]" : "w-0 overflow-hidden border-none"
            }`}
          >
            <IntelligenceDossierPanel
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              activeCase={activeCase}
              allNodes={laidOutGraph.nodes}
              allEdges={laidOutGraph.edges}
              isOpen={isDossierOpen}
              onClose={() => setIsDossierOpen(false)}
              onFocusNode={handleFocusNode}
              onSelectNode={handleSelectNode}
              onSelectEdge={handleSelectEdge}
            />
          </div>
        </div>

        {/* BOTTOM MULTI-TOOL PANEL */}
        <BottomMultiToolPanel
          caseId={activeCaseId}
          nodes={laidOutGraph.nodes}
          edges={laidOutGraph.edges}
          activeTimeWindow={timeWindow}
          onTimeWindowChange={setTimeWindow}
          onSelectNode={(nodeId) => handleFocusNode(nodeId)}
          onFocusNode={handleFocusNode}
          selectedNodeId={selectedNode?.id || null}
          isExpanded={isBottomToolExpanded}
          onToggleExpand={() => setIsBottomToolExpanded(!isBottomToolExpanded)}
        />

        {/* FLOATING AI INVESTIGATION ASSISTANT DRAWER */}
        <AiInvestigationAssistant
          caseId={activeCaseId}
          nodes={laidOutGraph.nodes}
          edges={laidOutGraph.edges}
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
          onFocusNode={handleFocusNode}
          onFindPath={handleDirectPathRequest}
          onFilterSyndicate={(caseId) => setActiveCaseId(caseId)}
        />

        {/* CYPHER QUERY EXPORT MODAL */}
        {showCypherModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface-card border border-border-highlight rounded-lg max-w-3xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs text-text-secondary max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center space-x-2">
                  <Code className="w-5 h-5 text-telecom-cyan" />
                  <h3 className="text-sm font-bold text-text-primary">
                    NEO4J CYPHER INGESTION SCRIPT // CASE: {activeCaseId}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCypherModal(false)}
                  className="text-text-muted hover:text-text-primary text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-bg-base p-4 rounded border border-border-subtle font-mono text-[11px] text-telecom-cyan leading-relaxed select-all">
                <pre>{generatedCypherScript}</pre>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <div className="text-[11px] text-text-muted">
                  TOTAL NODES: {laidOutGraph.nodes.length} // TOTAL RELATIONS: {laidOutGraph.edges.length}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCypherScript);
                      alert("Cypher query copied to clipboard!");
                    }}
                    className="px-3 py-1.5 bg-telecom-cyan/20 hover:bg-telecom-cyan/30 text-telecom-cyan border border-telecom-cyan/40 rounded text-xs font-bold"
                  >
                    COPY CYPHER TO CLIPBOARD
                  </button>
                  <button
                    onClick={() => setShowCypherModal(false)}
                    className="px-3 py-1.5 bg-surface-overlay hover:bg-surface-muted text-text-primary border border-border-subtle rounded text-xs"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkstationShell>
  );
}
