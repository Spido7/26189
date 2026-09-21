import { RadarNode, RadarLink } from "@/types/radar";

export interface Neo4jConfig {
  uri: string;
  user: string;
  password?: string;
  database?: string;
}

export interface Neo4jConnectionStatus {
  connected: boolean;
  nodeCount: number;
  edgeCount: number;
  endpoint: string;
  database: string;
  latencyMs: number;
  lastSyncedAt?: string;
}

const DEFAULT_CONFIG: Neo4jConfig = {
  uri: process.env.NEXT_PUBLIC_NEO4J_URI || process.env.NEO4J_URI || "http://localhost:7474",
  user: process.env.NEXT_PUBLIC_NEO4J_USER || process.env.NEO4J_USER || "neo4j",
  password: process.env.NEXT_PUBLIC_NEO4J_PASSWORD || process.env.NEO4J_PASSWORD || "neo4j",
  database: process.env.NEXT_PUBLIC_NEO4J_DATABASE || process.env.NEO4J_DATABASE || "neo4j",
};

/**
 * Execute Cypher query over Neo4j HTTP Transactional API
 */
export async function executeCypher(
  statement: string,
  parameters: Record<string, any> = {},
  config: Partial<Neo4jConfig> = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const endpoint = `${finalConfig.uri.replace(/\/$/, "")}/db/${finalConfig.database || "neo4j"}/tx/commit`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json;charset=UTF-8",
  };

  if (finalConfig.user && finalConfig.password) {
    const auth = btoa(`${finalConfig.user}:${finalConfig.password}`);
    headers["Authorization"] = `Basic ${auth}`;
  }

  try {
    const startTime = performance.now();
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        statements: [
          {
            statement,
            parameters,
            resultDataContents: ["row", "graph"],
          },
        ],
      }),
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!response.ok) {
      return {
        success: false,
        error: `Neo4j HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const resJson = await response.json();

    if (resJson.errors && resJson.errors.length > 0) {
      return {
        success: false,
        error: resJson.errors[0].message || "Cypher execution error",
      };
    }

    return {
      success: true,
      data: {
        results: resJson.results,
        latencyMs: elapsed,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to reach Neo4j database endpoint",
    };
  }
}

/**
 * Sync a RadarNode into Neo4j graph using Cypher MERGE
 */
export async function syncNodeToNeo4j(node: RadarNode): Promise<boolean> {
  const cypher = `
    MERGE (n:ThreatEntity {id: $id})
    ON CREATE SET
      n.ip = $ip,
      n.mac = $mac,
      n.subnet = $subnet,
      n.state = $state,
      n.threatType = $threatType,
      n.crimeType = $crimeType,
      n.confidence = $confidence,
      n.accusedName = $accusedName,
      n.asnOrg = $asnOrg,
      n.country = $country,
      n.portMatrix = $portMatrix,
      n.protocol = $protocol,
      n.ja3Fingerprint = $ja3Fingerprint,
      n.sha256Hash = $sha256Hash,
      n.md5Hash = $md5Hash,
      n.geoCoords = $geoCoords,
      n.createdAt = datetime()
    ON MATCH SET
      n.state = $state,
      n.threatType = coalesce($threatType, n.threatType),
      n.confidence = coalesce($confidence, n.confidence),
      n.updatedAt = datetime()
    RETURN n.id AS id
  `;

  const res = await executeCypher(cypher, {
    id: node.id,
    ip: node.ip,
    mac: node.mac,
    subnet: node.subnet,
    state: node.state || "FLAGGED",
    threatType: node.threatType || node.crimeType || "UNKNOWN_THREAT",
    crimeType: node.crimeType || node.threatType || "UNKNOWN_THREAT",
    confidence: node.confidence || 95.0,
    accusedName: node.accusedName || "UNIDENTIFIED_ACTOR",
    asnOrg: node.asnOrg || "UNKNOWN_ASN",
    country: node.country || "UNKNOWN",
    portMatrix: node.portMatrix || "",
    protocol: node.protocol || "",
    ja3Fingerprint: node.ja3Fingerprint || "",
    sha256Hash: node.sha256Hash || "",
    md5Hash: node.md5Hash || "",
    geoCoords: node.geoCoords || "",
  });

  return res.success;
}

/**
 * Sync a RadarLink relationship into Neo4j graph using Cypher MERGE
 */
export async function syncLinkToNeo4j(link: RadarLink): Promise<boolean> {
  const sourceId = typeof link.source === "object" ? (link.source as any).id : link.source;
  const targetId = typeof link.target === "object" ? (link.target as any).id : link.target;

  if (!sourceId || !targetId) return false;

  const cypher = `
    MATCH (a:ThreatEntity {id: $sourceId})
    MATCH (b:ThreatEntity {id: $targetId})
    MERGE (a)-[r:SHARED_INFRASTRUCTURE {relationship: $relationship}]->(b)
    ON CREATE SET
      r.sharedAttribute = $sharedAttribute,
      r.confidence = $confidence,
      r.createdAt = datetime()
    RETURN type(r) AS relType
  `;

  const res = await executeCypher(cypher, {
    sourceId,
    targetId,
    relationship: link.relationship,
    sharedAttribute: link.sharedAttribute,
    confidence: link.confidence || "Attribute Collision",
  });

  return res.success;
}

/**
 * Generate complete offline Cypher .cql dump for Neo4j desktop / sandbox
 */
export function generateCypherDump(nodes: RadarNode[], links: RadarLink[]): string {
  const lines: string[] = [
    "// =================================================================",
    "// DFIR CYBER THREAT RADAR - NEO4J CYPHER INGESTION SCRIPT",
    `// Generated: ${new Date().toISOString()}`,
    "// =================================================================",
    "",
    "// 1. Create Schema Constraints",
    "CREATE CONSTRAINT threat_entity_id IF NOT EXISTS FOR (n:ThreatEntity) REQUIRE n.id IS UNIQUE;",
    "CREATE INDEX threat_ip_index IF NOT EXISTS FOR (n:ThreatEntity) ON (n.ip);",
    "CREATE INDEX threat_mac_index IF NOT EXISTS FOR (n:ThreatEntity) ON (n.mac);",
    "CREATE INDEX threat_subnet_index IF NOT EXISTS FOR (n:ThreatEntity) ON (n.subnet);",
    "",
    "// 2. Ingest Threat Entities",
  ];

  nodes.forEach((node) => {
    const threat = node.threatType || node.crimeType || "UNKNOWN";
    const accused = node.accusedName ? `accusedName: "${node.accusedName.replace(/"/g, '\\"')}", ` : "";
    lines.push(
      `MERGE (n_${node.id.replace(/[^a-zA-Z0-9]/g, "_")}:ThreatEntity {id: "${node.id}"}) ` +
        `SET n_${node.id.replace(/[^a-zA-Z0-9]/g, "_")} += {` +
        `ip: "${node.ip}", ` +
        `mac: "${node.mac}", ` +
        `subnet: "${node.subnet}", ` +
        `state: "${node.state}", ` +
        `threatType: "${threat}", ` +
        `confidence: ${node.confidence || 95.0}, ` +
        accused +
        `asnOrg: "${node.asnOrg || ""}", ` +
        `country: "${node.country || ""}", ` +
        `timestamp: "${node.timestamp}"` +
        `};`
    );
  });

  if (links.length > 0) {
    lines.push("", "// 3. Ingest Dynamic Correlation Links");
    links.forEach((link, idx) => {
      const srcId = typeof link.source === "object" ? (link.source as any).id : link.source;
      const tgtId = typeof link.target === "object" ? (link.target as any).id : link.target;
      const srcVar = `n_${srcId.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const tgtVar = `n_${tgtId.replace(/[^a-zA-Z0-9]/g, "_")}`;
      lines.push(
        `MATCH (${srcVar}:ThreatEntity {id: "${srcId}"}), (${tgtVar}:ThreatEntity {id: "${tgtId}"}) ` +
          `MERGE (${srcVar})-[r_${idx}:${link.relationship || "LINKED_TO"} {sharedAttribute: "${link.sharedAttribute || "ATTRIBUTE"}"}]->(${tgtVar});`
      );
    });
  }

  lines.push("", "// 4. Query All Formed Threat Clusters", "MATCH (n:ThreatEntity)-[r]->(m:ThreatEntity) RETURN n, r, m;");

  return lines.join("\n");
}
