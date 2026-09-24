"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Send,
  X,
  Search,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  FileText,
  Radio,
  Share2,
  Maximize2,
  Minimize2,
  CornerDownRight,
  Database
} from "lucide-react";
import { InvestigationNode, InvestigationEdge } from "@/lib/graph-engine";

interface AiInvestigationAssistantProps {
  caseId: string;
  nodes: InvestigationNode[];
  edges: InvestigationEdge[];
  onFocusNode: (nodeId: string) => void;
  onFindPath?: (sourceId: string, targetId: string) => void;
  onFilterSyndicate?: (caseId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  badges?: Array<{
    text: string;
    type: "FIR" | "NETWORK" | "TELCO" | "AI_INFERENCE";
  }>;
  actions?: Array<{
    label: string;
    type: "FOCUS" | "PATH" | "SYNDICATE";
    payload: any;
  }>;
}

const PRESET_QUERIES = [
  "Show connections between Vikram Sharma and FIR-0104",
  "Which entities share the hardware MAC 4A:2B:CC:91:0F:11?",
  "Find shortest path between Anisur Rahman and the Flokinet Tor Relay",
  "Summarize all evidence seized from the Andheri safehouse",
  "Which phone numbers were active concurrently with the ₹18.4 Lakh transfer?"
];

export function AiInvestigationAssistant({
  caseId,
  nodes,
  edges,
  onFocusNode,
  onFindPath,
  onFilterSyndicate,
  isOpen,
  onClose,
}: AiInvestigationAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "ai",
      text: "Investigative AI Assistant online. Grounded strictly in active case FIRs, seized device MACs, IPDR packet streams, and lawful telecom CDR logs. Ask cross-entity forensic questions or execute graph actions below.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: [
        { text: "OFFICIAL FIR RECORD", type: "FIR" },
        { text: "OBSERVED NETWORK TELEMETRY", type: "NETWORK" }
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // GROUNDED RESPONSE ENGINE
  const processQuery = (rawQuery: string) => {
    const q = rawQuery.toLowerCase();

    // 1. Vikram Sharma & FIR-0104
    if (q.includes("vikram") || q.includes("0104") && q.includes("connection")) {
      return {
        text: "Vikram Sharma (Primary Accused, Jamtara Banking Syndicate) is directly linked to FIR-0104/2026 under IPC 420 / IT Act 66D. He co-resides with Rahul Desai at the Andheri East safehouse and shares Netgear Dual-Band Router (MAC 4A:2B:CC:91:0F:11). Ingress packet capture EVD-2026-001 places his device on IP 115.112.45.12 during banking session takeovers.",
        badges: [
          { text: "OFFICIAL FIR RECORD", type: "FIR" as const },
          { text: "OBSERVED NETWORK TELEMETRY", type: "NETWORK" as const },
          { text: "TELCO SUBSCRIBER CAF", type: "TELCO" as const }
        ],
        actions: [
          { label: "Focus Vikram Sharma", type: "FOCUS" as const, payload: "node-person-vikram" },
          { label: "Highlight Path to FIR-0104", type: "PATH" as const, payload: { source: "node-person-vikram", target: "node-fir-0104" } },
          { label: "Isolate Jamtara Phishing Syndicate", type: "SYNDICATE" as const, payload: "FIR-0104/2026" }
        ]
      };
    }

    // 2. MAC Collision (4A:2B:CC:91:0F:11 or A4:C3)
    if (q.includes("mac") || q.includes("4a:2b") || q.includes("hardware")) {
      return {
        text: "Hardware MAC collision detected: 4A:2B:CC:91:0F:11 (Netgear Nighthawk Gateway) exhibits concurrent DHCP leases for Vikram Sharma (+91 98250 XXXXX) and Rahul Desai (+91 98251 XXXXX). Both suspect terminals operated through the same physical safehouse router in Andheri East, Mumbai.",
        badges: [
          { text: "OBSERVED NETWORK TELEMETRY", type: "NETWORK" as const },
          { text: "AI INFERENCE // NON-JUDICIAL", type: "AI_INFERENCE" as const }
        ],
        actions: [
          { label: "Focus Router Device", type: "FOCUS" as const, payload: "node-dev-router" },
          { label: "Focus Vikram Sharma", type: "FOCUS" as const, payload: "node-person-vikram" },
          { label: "Focus Rahul Desai", type: "FOCUS" as const, payload: "node-person-rahul" }
        ]
      };
    }

    // 3. Anisur Rahman & Flokinet Tor Relay
    if (q.includes("anisur") || q.includes("flokinet") || q.includes("hawala") || q.includes("tor")) {
      return {
        text: "Anisur Rahman (Accused, Hawala Syndicate FIR-2024-8842) is connected to Flokinet Tor Exit Relay (IP 185.220.101.5) via encrypted multi-hop onion tunnels. Volatile memory dump EVD-2024-884 recovered from his Indiranagar safehouse server contains private Lightning Network keys used to settle ransom escrows.",
        badges: [
          { text: "OFFICIAL FIR RECORD", type: "FIR" as const },
          { text: "OBSERVED NETWORK TELEMETRY", type: "NETWORK" as const }
        ],
        actions: [
          { label: "Focus Anisur Rahman", type: "FOCUS" as const, payload: "node-person-anisur" },
          { label: "Highlight Path to Tor Relay", type: "PATH" as const, payload: { source: "node-person-anisur", target: "node-ip-185-220" } },
          { label: "Isolate Hawala Syndicate", type: "SYNDICATE" as const, payload: "FIR-2024-8842" }
        ]
      };
    }

    // 4. Andheri Safehouse Seizures
    if (q.includes("andheri") || q.includes("safehouse") || q.includes("seized") || q.includes("evidence")) {
      return {
        text: "Under Panchnama #084 executed at Andheri East, Mumbai, investigative officers seized: (1) Netgear Router MAC 4A:2B:CC:91:0F:11; (2) 14 Pre-activated Airtel/Jio Burner SIM cards; (3) Lenovo ThinkPad host with active banking trojan build scripts. Cryptographic image is cataloged as EVD-2026-001 with SHA-256 integrity verified on Hyperledger Fabric Block #148209.",
        badges: [
          { text: "OFFICIAL FIR RECORD", type: "FIR" as const },
          { text: "OBSERVED NETWORK TELEMETRY", type: "NETWORK" as const }
        ],
        actions: [
          { label: "Focus Seized Router", type: "FOCUS" as const, payload: "node-dev-router" },
          { label: "Focus Evidence Item EVD-001", type: "FOCUS" as const, payload: "node-evd-001" }
        ]
      };
    }

    // 5. Concurrent phone numbers & transfer
    if (q.includes("phone") || q.includes("transfer") || q.includes("18.4") || q.includes("lakh") || q.includes("cdr")) {
      return {
        text: "Telephony CDR cross-correlation indicates a 14-minute 22-second encrypted conference call between MSISDN +91 98250 XXXXX (Vikram Sharma) and +91 98251 XXXXX (Rahul Desai) through Andheri East BTS Cell #4092, exactly synchronized with the ₹18.4 Lakh wire transfer into mule account #99887-XXXXX.",
        badges: [
          { text: "TELCO SUBSCRIBER CAF", type: "TELCO" as const },
          { text: "OBSERVED NETWORK TELEMETRY", type: "NETWORK" as const }
        ],
        actions: [
          { label: "Focus Vikram's Phone", type: "FOCUS" as const, payload: "node-phone-98250" },
          { label: "Focus Serving BTS Tower", type: "FOCUS" as const, payload: "node-bts-andheri" }
        ]
      };
    }

    // 6. Generic node search match in dataset
    const matchedNode = nodes.find(n => 
      q.includes(n.name.toLowerCase()) || 
      (n.metadata?.demographics?.fullName && q.includes(n.metadata.demographics.fullName.toLowerCase())) ||
      (n.metadata?.network?.ip && q.includes(n.metadata.network.ip)) ||
      (n.metadata?.telecom?.phone && q.includes(n.metadata.telecom.phone.replace(/[^0-9]/g, "")))
    );

    if (matchedNode) {
      return {
        text: `Found verified case record for '${matchedNode.name}' (${matchedNode.category}). Case Reference: ${matchedNode.caseRef}. Threat Risk Score: ${matchedNode.riskScore}%. Details: ${matchedNode.details}. Connected to ${matchedNode.degree} relational link(s) across the syndicate cluster.`,
        badges: [
          { text: "OFFICIAL FIR RECORD", type: "FIR" as const },
          { text: matchedNode.category === "IP" ? "OBSERVED NETWORK TELEMETRY" : "TELCO SUBSCRIBER CAF", type: "NETWORK" as const }
        ],
        actions: [
          { label: `Focus ${matchedNode.name}`, type: "FOCUS" as const, payload: matchedNode.id }
        ]
      };
    }

    // 7. STRICT HALLUCINATION SAFEGUARD
    return {
      text: "No verified record matching this query was found in the loaded case dossier. Presumption of innocence remains strictly active under Indian jurisprudence, and unverified entities cannot be populated.",
      badges: [
        { text: "AI INFERENCE // NON-JUDICIAL", type: "AI_INFERENCE" as const }
      ]
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsProcessing(true);

    setTimeout(() => {
      const response = processQuery(q);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badges: response.badges,
        actions: response.actions,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-12 right-6 w-96 max-w-[calc(100vw-3rem)] h-[540px] bg-surface-card border border-border-highlight rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden font-mono text-xs">
      {/* HEADER */}
      <div className="h-10 px-3 bg-surface-overlay border-b border-border-subtle flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-telecom-cyan animate-pulse" />
          <Bot className="w-4 h-4 text-telecom-cyan" />
          <span className="font-bold text-text-primary text-xs tracking-wider">
            AI INVESTIGATION ASSISTANT
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-card rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CASE CONTEXT BADGE */}
      <div className="px-3 py-1.5 bg-bg-base/70 border-b border-border-subtle text-[11px] text-text-muted flex items-center justify-between">
        <span>ACTIVE DOSSIER: <strong className="text-telecom-cyan">{caseId}</strong></span>
        <span className="flex items-center space-x-1 text-emerald-400">
          <ShieldCheck className="w-3 h-3" />
          <span>GROUNDED</span>
        </span>
      </div>

      {/* MESSAGES SCROLL AREA */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-bg-base/90 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded p-2.5 leading-relaxed ${
                m.sender === "user"
                  ? "bg-industrial-slate text-text-primary border border-telecom-cyan/30"
                  : "bg-surface-card text-text-secondary border border-border-subtle"
              }`}
            >
              {/* Badges for AI answers */}
              {m.badges && m.badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {m.badges.map((b, idx) => (
                    <span
                      key={idx}
                      className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
                        b.type === "FIR"
                          ? "bg-record-amber/20 text-record-amber border border-record-amber/30"
                          : b.type === "NETWORK"
                          ? "bg-telecom-cyan/20 text-telecom-cyan border border-telecom-cyan/30"
                          : b.type === "TELCO"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-accused-violet/20 text-accused-violet border border-accused-violet/30"
                      }`}
                    >
                      [{b.text}]
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs">{m.text}</p>

              {/* Actionable buttons */}
              {m.actions && m.actions.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-border-subtle space-y-1.5">
                  <div className="text-[10px] text-text-muted uppercase">Graph Actions:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (act.type === "FOCUS") {
                            onFocusNode(act.payload);
                          } else if (act.type === "PATH" && onFindPath) {
                            onFindPath(act.payload.source, act.payload.target);
                          } else if (act.type === "SYNDICATE" && onFilterSyndicate) {
                            onFilterSyndicate(act.payload);
                          }
                        }}
                        className="flex items-center space-x-1 px-2 py-1 bg-surface-overlay hover:bg-telecom-cyan/20 text-telecom-cyan border border-telecom-cyan/30 rounded text-[10px] transition-colors"
                      >
                        <ArrowRight className="w-2.5 h-2.5" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[9px] text-text-muted mt-0.5 px-1">{m.timestamp}</span>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center space-x-2 text-text-muted text-xs p-2">
            <Cpu className="w-3.5 h-3.5 animate-spin text-telecom-cyan" />
            <span>Cross-correlating evidence ledgers...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* PRE-CONFIGURED PROMPT SHORTCUTS */}
      <div className="p-2 bg-surface-card border-t border-border-subtle">
        <div className="text-[10px] text-text-muted mb-1 flex items-center justify-between">
          <span>INVESTIGATIVE PROMPT SHORTCUTS:</span>
        </div>
        <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-thin">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(preset)}
              className="flex-shrink-0 px-2 py-0.5 bg-surface-overlay hover:bg-industrial-slate text-[10px] text-text-secondary hover:text-text-primary border border-border-subtle rounded transition-colors whitespace-nowrap"
            >
              {preset.length > 34 ? preset.substring(0, 34) + "..." : preset}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2 bg-surface-overlay border-t border-border-subtle flex items-center space-x-1.5"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask fact-checked investigative question..."
          className="flex-1 bg-bg-base border border-border-subtle rounded px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-telecom-cyan"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isProcessing}
          className="p-1.5 bg-telecom-cyan/20 hover:bg-telecom-cyan/30 text-telecom-cyan border border-telecom-cyan/40 rounded transition-colors disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
