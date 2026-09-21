import { NextRequest, NextResponse } from "next/server";
import { executeCypher, syncNodeToNeo4j, syncLinkToNeo4j } from "@/lib/neo4j";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, statement, parameters, node, link } = body;

    if (action === "query" && statement) {
      const result = await executeCypher(statement, parameters || {});
      return NextResponse.json(result);
    }

    if (action === "sync_node" && node) {
      const success = await syncNodeToNeo4j(node);
      return NextResponse.json({ success });
    }

    if (action === "sync_link" && link) {
      const success = await syncLinkToNeo4j(link);
      return NextResponse.json({ success });
    }

    // Default: Run ping/status query
    const result = await executeCypher("MATCH (n:ThreatEntity) RETURN count(n) AS nodeCount");
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
    const res = await executeCypher(
      "MATCH (n:ThreatEntity) OPTIONAL MATCH (n)-[r]->(m) RETURN count(DISTINCT n) AS nodeCount, count(r) AS linkCount"
    );
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "Neo4j endpoint offline",
      fallback: true,
    });
  }
}
