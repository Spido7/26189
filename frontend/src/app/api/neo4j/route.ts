import { NextRequest, NextResponse } from "next/server";
import {
  executeCypher,
  syncNodeToNeo4j,
  syncLinkToNeo4j,
  syncInvestigationGraphToNeo4j,
  fetchGraphFromNeo4j,
  checkNeo4jHealth,
} from "@/lib/neo4j";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, statement, parameters, node, link, nodes, edges, caseRef } = body;

    // 1. Direct Cypher execution
    if (action === "query" && statement) {
      const result = await executeCypher(statement, parameters || {});
      return NextResponse.json(result);
    }

    // 2. Batch Sync Investigation Graph
    if (action === "batch_sync" && Array.isArray(nodes) && Array.isArray(edges)) {
      const syncResult = await syncInvestigationGraphToNeo4j(nodes, edges);
      return NextResponse.json(syncResult);
    }

    // 3. Fetch Graph Topology from Neo4j
    if (action === "fetch_graph") {
      const graphData = await fetchGraphFromNeo4j(caseRef || "ALL");
      return NextResponse.json({ success: true, ...graphData });
    }

    // 4. Health Check & Connection Status
    if (action === "health") {
      const status = await checkNeo4jHealth();
      return NextResponse.json({ success: true, status });
    }

    // 5. Single Node Sync (Legacy/Radar support)
    if (action === "sync_node" && node) {
      const success = await syncNodeToNeo4j(node);
      return NextResponse.json({ success });
    }

    // 6. Single Link Sync (Legacy/Radar support)
    if (action === "sync_link" && link) {
      const success = await syncLinkToNeo4j(link);
      return NextResponse.json({ success });
    }

    // Default: Run ping/status query
    const result = await executeCypher("MATCH (n:InvestigationNode) RETURN count(n) AS nodeCount");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const health = await checkNeo4jHealth();
    return NextResponse.json({
      success: true,
      ...health,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "Neo4j endpoint offline",
      fallback: true,
      connected: false,
      isSimulated: true,
    });
  }
}
