"use client";

import React, { useState, useEffect, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ==========================================
// --- Mock Data & Type Definitions ---
// ==========================================

interface LogEntry {
  timestamp: string;
  category: "GNN_ML" | "NEO4J" | "INGRESS" | "ALERTER" | "USER";
  message: string;
  status: "INFO" | "SUCCESS" | "WARN" | "CRITICAL";
}

type TransactionData = {
  id: number;
  transaction_id: string;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  risk_score: number;
  risk_level: string;
  is_suspicious: number;
  created_at: string;
};

type AlertData = {
  id: number;
  transaction_id: string;
  title: string;
  risk_score: number;
  priority: string;
  status: string;
  created_at: string;
};

interface GraphNode {
  id: string;
  label: string;
  type: "ACCOUNT" | "DEVICE" | "IP" | "MERCHANT";
  riskScore: number;
  degreeCentrality: number;
  shortestPathToFraud: number;
  explanation: string;
  details: Record<string, string>;
  x: number;
  y: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "TRANSFERRED_TO" | "USED_DEVICE" | "CONNECTED_FROM" | "MERCHANT_PAYMENT";
  transaction_count?: number;
  total_amount?: number;
}

interface GraphApiNode{
  id: string;
  label: string;
  type: "ACCOUNT" | "DEVICE" | "IP" | "MERCHANT";
}

interface GraphApiEdge {
  source: string;
  target: string;
  relationship: string;
  transaction_count: number;
  total_amount: number;
}

interface GraphApiResponse{
  nodes: GraphApiNode[];
  edges: GraphApiEdge[];
}

interface GraphNodeDetails {
  node_id:string;
  label:string;
  type:"ACCOUNT" | "DEVICE" | "IP" | "MERCHANT";
  transaction_count:number;
  total_amount:number;
  suspicious_count:number;
  suspicious_percentage:number;
  average_risk_score:number;
  highest_risk_score:number;
  risk_level:string;
  connected_entities:number;
  explanation:string;
}

interface FraudCase {
  id: string;
  title: string;
  riskScore: number;
  status: "OPEN" | "INVESTIGATING" | "BLOCKED" | "DISMISSED";
  category: string;
  date: string;
  explanation: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// 3 Mock cases from the PDF requirements (Mule accounts, shared IPs, synthetic identity rings)
const mockCases: FraudCase[] = [
  {
    id: "CASE-104",
    title: "Mule Account Ring",
    riskScore: 94,
    status: "OPEN",
    category: "Louvain Community Cluster",
    date: "19-JUL-2026",
    explanation: "Multiple accounts connected via a single physical Device ID transferring high volume velocity transactions within a 4-hour window.",
    nodes: [
      { id: "A1", label: "Mule Account A", type: "ACCOUNT", riskScore: 94, degreeCentrality: 0.85, shortestPathToFraud: 1, explanation: "Primary node receiving fragmented transfers from source and forwarding to mule C.", details: { "Acc Num": "X-8821-09", "Balance": "₹4,20,500", "KYC Tier": "Tier 1 (Stolen Identity)" }, x: 150, y: 100 },
      { id: "A2", label: "Mule Account B", type: "ACCOUNT", riskScore: 89, degreeCentrality: 0.70, shortestPathToFraud: 1, explanation: "Secondary receiver node utilizing shared device ID.", details: { "Acc Num": "X-1209-77", "Balance": "₹1,85,000", "KYC Tier": "Tier 1 (Fake Selfie)" }, x: 150, y: 250 },
      { id: "D1", label: "Device: iPhone12", type: "DEVICE", riskScore: 95, degreeCentrality: 0.90, shortestPathToFraud: 0, explanation: "Shared mobile device ID associated with 5 separate account registrations.", details: { "IMEI Hash": "88fa21...c9", "OS Version": "iOS 17.4", "Root State": "Compromised" }, x: 300, y: 175 },
      { id: "A3", label: "Mule Account C", type: "ACCOUNT", riskScore: 92, degreeCentrality: 0.80, shortestPathToFraud: 1, explanation: "Consolidation account transferring funds outward via immediate RTGS.", details: { "Acc Num": "X-7761-00", "Balance": "₹9,50,000", "KYC Tier": "Tier 2 (Mule purchased)" }, x: 450, y: 175 },
      { id: "M1", label: "Offshore Merchant", type: "MERCHANT", riskScore: 98, degreeCentrality: 0.60, shortestPathToFraud: 1, explanation: "Shell company payment gateway registered in tax haven.", details: { "Merchant ID": "MERCH-VOID-88", "MCC Code": "7995 (Gaming)" }, x: 600, y: 175 }
    ],
    edges: [
      { id: "e1", source: "A1", target: "D1", type: "USED_DEVICE" },
      { id: "e2", source: "A2", target: "D1", type: "USED_DEVICE" },
      { id: "e3", source: "A1", target: "A3", type: "TRANSFERRED_TO" },
      { id: "e4", source: "A2", target: "A3", type: "TRANSFERRED_TO" },
      { id: "e5", source: "A3", target: "M1", type: "MERCHANT_PAYMENT" }
    ]
  },
  {
    id: "CASE-105",
    title: "IP Collision Attack",
    riskScore: 82,
    status: "OPEN",
    category: "Identity Collision Ring",
    date: "19-JUL-2026",
    explanation: "Rapid login collisions on separate accounts from a single hosting IP address known to proxy VPN endpoints.",
    nodes: [
      { id: "A4", label: "User Account D", type: "ACCOUNT", riskScore: 85, degreeCentrality: 0.60, shortestPathToFraud: 2, explanation: "Legitimate user account compromised via credential stuffing.", details: { "Acc Num": "X-9981-22", "Balance": "₹12,40,000", "KYC Tier": "Tier 3 (Verified)" }, x: 150, y: 120 },
      { id: "A5", label: "User Account E", type: "ACCOUNT", riskScore: 79, degreeCentrality: 0.55, shortestPathToFraud: 2, explanation: "Dormant account reactivated and logged in under proxy IP.", details: { "Acc Num": "X-1010-44", "Balance": "₹45,000", "KYC Tier": "Tier 2 (Verified)" }, x: 150, y: 230 },
      { id: "IP1", label: "IP: 198.51.100.82", type: "IP", riskScore: 88, degreeCentrality: 0.95, shortestPathToFraud: 1, explanation: "Hosting provider IP address registering 15 account accesses in 10 minutes.", details: { "ISP": "DigitalOcean VPN", "Location": "Frankfurt, DE", "Abuse Score": "92%" }, x: 350, y: 175 },
      { id: "A6", label: "Mule Shard Account", type: "ACCOUNT", riskScore: 81, degreeCentrality: 0.75, shortestPathToFraud: 1, explanation: "Intermediary mule account registered to receive compromised transfers.", details: { "Acc Num": "X-4432-89", "Balance": "₹3,20,000", "KYC Tier": "Tier 1" }, x: 550, y: 175 }
    ],
    edges: [
      { id: "e6", source: "A4", target: "IP1", type: "CONNECTED_FROM" },
      { id: "e7", source: "A5", target: "IP1", type: "CONNECTED_FROM" },
      { id: "e8", source: "A4", target: "A6", type: "TRANSFERRED_TO" },
      { id: "e9", source: "A5", target: "A6", type: "TRANSFERRED_TO" }
    ]
  },
  {
    id: "CASE-106",
    title: "Synthetic Identity Ring",
    riskScore: 76,
    status: "OPEN",
    category: "GNN Structural Anomaly",
    date: "18-JUL-2026",
    explanation: "High density subgraph representing accounts created using overlapping combinations of Aadhaar cards, device footprints, and email domains.",
    nodes: [
      { id: "A7", label: "Account F", type: "ACCOUNT", riskScore: 74, degreeCentrality: 0.70, shortestPathToFraud: 3, explanation: "Synthetic profile registered using shared phone suffix.", details: { "Acc Num": "X-9002-11", "Balance": "₹67,000", "KYC Tier": "Tier 1" }, x: 150, y: 100 },
      { id: "A8", label: "Account G", type: "ACCOUNT", riskScore: 78, degreeCentrality: 0.75, shortestPathToFraud: 2, explanation: "Synthetic profile sharing Aadhaar identity details.", details: { "Acc Num": "X-8802-33", "Balance": "₹12,000", "KYC Tier": "Tier 1" }, x: 150, y: 250 },
      { id: "D2", label: "Device: emulator_x86", type: "DEVICE", riskScore: 80, degreeCentrality: 0.85, shortestPathToFraud: 1, explanation: "Android emulator virtual fingerprint used for registrations.", details: { "Hardware": "QEMU Virtual", "Emulator State": "Detected" }, x: 350, y: 175 },
      { id: "IP2", label: "IP: 203.0.113.15", type: "IP", riskScore: 85, degreeCentrality: 0.80, shortestPathToFraud: 1, explanation: "Static IP matching emulator device location.", details: { "ISP": "Jio Mobile Proxy", "Abuse Score": "48%" }, x: 500, y: 280 },
      { id: "M2", label: "GiftCard Vendor", type: "MERCHANT", riskScore: 75, degreeCentrality: 0.50, shortestPathToFraud: 2, explanation: "Aggregator site used to purchase digital codes immediately.", details: { "Merchant ID": "GIFT-VEND-99", "Risk Rating": "Moderate" }, x: 550, y: 100 }
    ],
    edges: [
      { id: "e10", source: "A7", target: "D2", type: "USED_DEVICE" },
      { id: "e11", source: "A8", target: "D2", type: "USED_DEVICE" },
      { id: "e12", source: "A8", target: "IP2", type: "CONNECTED_FROM" },
      { id: "e13", source: "A7", target: "M2", type: "MERCHANT_PAYMENT" },
      { id: "e14", source: "A8", target: "M2", type: "MERCHANT_PAYMENT" }
    ]
  }
];



// ==========================================
// --- Main Entry Page Component ---
// ==========================================

export default function Home() {
  const [currentView, setCurrentView] = useState<"landing" | "login" | "handshake" | "portal">("landing");
  const [activePortalTab, setActivePortalTab] = useState<
  "dashboard" | "explorer" | "alerts" | "cases" | "analytics" | "sandbox"
  >("dashboard");

  // --- Login credentials ---
  const [userId, setUserId] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [currentUser, setCurrentUser] = useState<{
  id: number;
  full_name: string;
  email: string;
  role: string;
  organization_id: number;
} | null>(null);

  // --- Handshake sequence loader states ---
  const [handshakeLogs, setHandshakeLogs] = useState<string[]>([]);
  const [handshakeProgress, setHandshakeProgress] = useState(0);

  // --- Design Sandbox States ---
  const [blurIntensity, setBlurIntensity] = useState(20);
  const [glassOpacity, setGlassOpacity] = useState(0.03);
  const [sandboxBorderOpacity, setSandboxBorderOpacity] = useState(0.15);

  // --- Portal States ---
  const [currentTime, setCurrentTime] = useState("");
  const [hostLoad, setHostLoad] = useState(48.2);
  const [threatLevel, setThreatLevel] = useState("MINIMAL");
  const [activeAgents, setActiveAgents] = useState(6);
  const [ingestRate, setIngestRate] = useState(421.8);
  const [dashboardData, setDashboardData] = useState<{
  total_transactions: number;
  total_transaction_amount: number;
  low_risk_count: number;
  medium_risk_count: number;
  high_risk_count: number;
  suspicious_transaction_count: number;
  suspicious_transaction_amount: number;
} | null>(null);

const [transactions, setTransactions] = useState<TransactionData[]>([]);
const [transactionsError, setTransactionsError] = useState("");
const [alerts, setAlerts] = useState<AlertData[]>([]);
const [alertsError, setAlertsError] = useState("");

  const [recentTransactions, setRecentTransactions] = useState<{ id: string; from: string; to: string; amount: string; risk: number; time: string }[]>([
    { id: "TX-4209", from: "Ravi Kumar", to: "Priya Sharma", amount: "₹4,500", risk: 12, time: "20:30:12" },
    { id: "TX-4210", from: "Priya Sharma", to: "Vikram Patel", amount: "₹85,000", risk: 94, time: "20:30:45" },
    { id: "TX-4211", from: "Dormant Acc 9", to: "Mule Shard C", amount: "₹2,50,000", risk: 89, time: "20:31:02" },
    { id: "TX-4212", from: "Anjali Gupta", to: "Amazon India", amount: "₹1,200", risk: 4, time: "20:31:18" },
    { id: "TX-4213", from: "Vikram Patel", to: "CrypPay Panama", amount: "₹4,20,000", risk: 96, time: "20:31:55" }
  ]);

  // Telemetry logs
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: "20:32:00", category: "NEO4J", message: "Successfully connected to Neo4j cluster instance.", status: "SUCCESS" },
    { timestamp: "20:32:01", category: "GNN_ML", message: "Loaded PyTorch Geometric node embeddings (GraphSAGE v2).", status: "SUCCESS" },
    { timestamp: "20:32:02", category: "INGRESS", message: "Real-time Kafka transaction queue listener established.", status: "INFO" },
    { timestamp: "20:32:03", category: "ALERTER", message: "Louvain community detection algorithm triggered: found 3 anomalous subgraphs.", status: "WARN" },
    { timestamp: "20:32:04", category: "ALERTER", message: "Created high-priority alert CASE-104: Mule Account Ring (94% Risk).", status: "CRITICAL" }
  ]);

  // Selected items inside views
// Selected items inside views
const [selectedCaseId, setSelectedCaseId] = useState("CASE-104");
const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
const [selectedNodeDetails, setSelectedNodeDetails] = useState<GraphNodeDetails | null>(null);

const [nodeDetailsLoading, setNodeDetailsLoading] = useState(false);

const [nodeDetailsError, setNodeDetailsError] = useState("");

// Real Graph Explorer data
const [explorerNodes, setExplorerNodes] = useState<GraphNode[]>([]);
const [explorerEdges, setExplorerEdges] = useState<GraphEdge[]>([]);
const [graphLoading, setGraphLoading] = useState(false);
const [graphError, setGraphError] = useState("");

// Filtering states for Graph Explorer
const [explorerFilterType, setExplorerFilterType] = useState<string>("ALL");
const [explorerRiskThreshold, setExplorerRiskThreshold] = useState<number>(0);

  const selectedCase = mockCases.find((c) => c.id === selectedCaseId) || mockCases[0];

  const selectedNodeEdges = selectedNode
  ? explorerEdges.filter(
      (edge) =>
        edge.source === selectedNode.id ||
        edge.target === selectedNode.id
    )
  : [];

const selectedNodeConnections = selectedNode
  ? selectedNodeEdges.map((edge) => {
      const connectedNodeId =
        edge.source === selectedNode.id
          ? edge.target
          : edge.source;

      const connectedNode = explorerNodes.find(
        (node) => node.id === connectedNodeId
      );

      return {
        edge,
        connectedNode,
      };
    })
  : [];

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Global Clock / Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toTimeString().split(" ")[0] + " // " + now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
  if (!accessToken) return;

  const fetchDashboardSummary = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/dashboard/summary`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to fetch dashboard summary"
        );
        return;
      }

      const data = await response.json();

      setDashboardData(data);

    } catch (error) {
      console.error(
        "Dashboard fetch error:",
        error
      );
    }
  };

  fetchDashboardSummary();
}, [accessToken]);

useEffect(() => {
  const fetchTransactions = async () => {
    if (!accessToken) return;

    try {
      setTransactionsError("");

      const response = await fetch(
        `${API_URL}/api/v1/transactions?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setTransactionsError(
          data.detail || "Failed to load transactions."
        );
        return;
      }

      setTransactions(data);
    } catch (error) {
      console.error("Transaction fetch error:", error);
      setTransactionsError(
        "Unable to connect to transaction service."
      );
    }
  };

  fetchTransactions();
}, [accessToken]);

useEffect(() => {
  const fetchAlerts = async () => {
    if (!accessToken) return;

    try {
      setAlertsError("");

      const response = await fetch(
        `{API_URL}/api/v1/alerts`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAlertsError(
          data.detail || "Failed to load alerts."
        );
        return;
      }

      setAlerts(data);
    } catch (error) {
      console.error("Alerts fetch error:", error);

      setAlertsError(
        "Unable to connect to alert service."
      );
    }
  };

  fetchAlerts();
}, [accessToken]);

// Fetch real graph data from backend
useEffect(() => {
  const fetchGraph = async () => {
    if (!accessToken) return;

    try {
      setGraphLoading(true);
      setGraphError("");

      const response = await fetch(
        `${API_URL}/api/v1/graph`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      const data: GraphApiResponse = await response.json();

      if (!response.ok) {
        setGraphError(
          (data as any).detail || "Failed to load graph data."
        );
        return;
      }

      const nodes: GraphNode[] = data.nodes.map((node, index) => {
        const columns = 3;
        const column = index % columns;
        const row = Math.floor(index / columns);

        return {
          id: node.id,
          label: node.label,
          type: node.type,

          // Legacy field required by the shared GraphNode type.
          // Live Graph Explorer does not display these values.
          riskScore: 0,
          degreeCentrality: 0,
          shortestPathToFraud: 0,

          explanation: "Live entity loaded from Panopticon graph API.",

          details: {
            "Source": "Panopticon API",
            "Node Type": node.type,
          },

          x: 140 + column * 250,
          y: 100 + row * 120,
        };
      });

      console.log("Graph Edges:",data.edges);

      const edges: GraphEdge[] = data.edges.map((edge, index) => ({
        id: `API-EDGE-${index + 1}`,
        source: edge.source,
        target: edge.target,
        type: edge.relationship as GraphEdge["type"],
        transaction_count: edge.transaction_count,
        total_amount: edge.total_amount,
      }));

      setExplorerNodes(nodes);
      setExplorerEdges(edges);

    } catch (error) {
      console.error("Graph fetch error:", error);

      setGraphError(
        "Unable to connect to graph service."
      );
    } finally {
      setGraphLoading(false);
    }
  };

  fetchGraph();
}, [accessToken]);

// Fetch real analytics for the selected graph node
useEffect(() => {
  if (!accessToken || !selectedNode) {
    setSelectedNodeDetails(null);
    setNodeDetailsError("");
    return;
  }

  const fetchNodeDetails = async () => {
    try {
      setNodeDetailsLoading(true);
      setNodeDetailsError("");

      const response = await fetch(
        `${API_URL}/api/v1/graph/${encodeURIComponent(
          selectedNode.id
        )}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setNodeDetailsError(
          data.detail || "Failed to load node analytics."
        );
        setSelectedNodeDetails(null);
        return;
      }

      setSelectedNodeDetails(data);
    } catch (error) {
      console.error("Node details fetch error:", error);

      setNodeDetailsError(
        "Unable to connect to node analytics service."
      );

      setSelectedNodeDetails(null);
    } finally {
      setNodeDetailsLoading(false);
    }
  };

  fetchNodeDetails();
}, [accessToken, selectedNode]);


  // Live transaction simulation inside dashboard
  useEffect(() => {
    if (currentView !== "portal" || activePortalTab !== "dashboard") return;

    const interval = setInterval(() => {
      // 1. Update Load Metrics
      setHostLoad((prev) => Math.max(10, Math.min(95, +(prev + (Math.random() * 8 - 4)).toFixed(1))));
      setIngestRate((prev) => Math.max(100, Math.min(900, +(prev + (Math.random() * 40 - 20)).toFixed(1))));

      // 2. Append new streaming transactions
      const names = ["Aarav Mehta", "Siddharth Sen", "Rahul Dravid", "Neha Nair", "Aditya Roy", "Proxy VPN host 3", "Mule Wallet F"];
      const merchants = ["Flipkart Pay", "Shell India", "Casino Royal Malta", "CrypPay Panama", "Local Peer Cash"];
      const isFraud = Math.random() > 0.75;
      
      const from = names[Math.floor(Math.random() * names.length)] || "Unknown User";
      const to = isFraud 
        ? (merchants[Math.floor(Math.random() * merchants.length)] || "Unknown Merchant")
        : (names[Math.floor(Math.random() * names.length)] || "Unknown User");
      const amount = `₹${Math.floor(Math.random() * 480000 + 500).toLocaleString()}`;
      const risk = isFraud ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 15 + 1);
      const txTime = new Date().toTimeString().split(" ")[0];
      const txId = `TX-${Math.floor(Math.random() * 9000 + 1000)}`;

      setRecentTransactions((prev) => [
        { id: txId, from, to, amount, risk, time: txTime },
        ...prev.slice(0, 4)
      ]);

      // 3. Append dynamic system logs
      if (isFraud) {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: txTime,
            category: "GNN_ML",
            message: `GNN Inference flagged ${txId}: Risk ${risk}% matching structural anomalous path.`,
            status: risk > 85 ? "CRITICAL" : "WARN"
          }
        ]);
        if (risk > 85) {
          setThreatLevel("ELEVATED");
        }
      } else {
        if (Math.random() > 0.6) {
          setLogs((prev) => [
            ...prev,
            {
              timestamp: txTime,
              category: "INGRESS",
              message: `Ingested ${txId} (${amount}) successfully processed in 4.8ms.`,
              status: "INFO"
            }
          ]);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentView, activePortalTab]);

  // --- Handshake sequence simulator effect ---
  useEffect(() => {
    if (currentView !== "handshake") return;

    setHandshakeProgress(0);
    setHandshakeLogs([]);

    const steps = [
      { text: "[INIT] Starting Panopticon runtime engine...", delay: 200 },
      { text: "[NEO4J] Handshaking graph database on port 7687...", delay: 800 },
      { text: "[NEO4J] Connected. Found 1,420 nodes, 4,891 transactional relationships.", delay: 1400 },
      { text: "[PYTORCH] Initializing GNN Classification engine (GraphSAGE v2.1.0)...", delay: 2000 },
      { text: "[PYTORCH] Computing neural embeddings across multi-hop edges...", delay: 2800 },
      { text: "[ALGO] Deploying Louvain Community Detection cluster sweeps...", delay: 3500 },
      { text: "[ALGO] Louvain consensus reached. Modular ratio: 0.741.", delay: 4100 },
      { text: "[ALERTER] Ingress pipeline linked to Kafka transaction feed.", delay: 4800 },
      { text: "[SUCCESS] Platform fully synchronized. Access granted.", delay: 5500 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setHandshakeLogs((prev) => [...prev, step.text]);
      }, step.delay);
    });

    const progressTimer = setInterval(() => {
      setHandshakeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => {
            setCurrentView("portal");
            setActivePortalTab("dashboard");
          }, 600);
          return 100;
        }
        return prev + 2;
      });
    }, 110);

    return () => {
      clearInterval(progressTimer);
    };
  }, [currentView]);

  // --- Actions ---
 
  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  setAuthError("");

  try {
    const response = await fetch(
      `${API_URL}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userId,
          password: secretCode,
        }),
      }
    );

    const data = await response.json();
    console.log("LOGIN API RESPONSE:",data);

    if (!response.ok) {
      setAuthError(
        data.detail || "INVALID CREDENTIALS. Access denied."
      );
      return;
    }

    setAccessToken(data.access_token);
localStorage.setItem("access_token", data.access_token);

const profileResponse = await fetch(
  `${API_URL}/api/v1/auth/me`,
  {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      Accept: "application/json",
    },
  }
);

const profileData = await profileResponse.json();

if (!profileResponse.ok) {
  localStorage.removeItem("access_token");

  setAuthError(
    profileData.detail || "Unable to verify user profile."
  );

  return;
}

setCurrentUser(profileData);

setCurrentView("handshake");

  } catch (error) {
    console.error("Login error:", error);

    setAuthError(
      "Unable to connect to Panopticon backend."
    );
  }
};

  const handleLogout = () => {
    setAccessToken("");
    setCurrentUser(null);
    setSelectedNode(null);
    setSelectedNodeDetails(null);
    
    localStorage.removeItem("access_token");

    setCurrentView("landing");
    setUserId("");
    setSecretCode("");
    setAuthError("");
  };

  const triggerSimulationEvent = (type: "FRAUD" | "NORMAL" | "LOUVAIN") => {
    const txTime = new Date().toTimeString().split(" ")[0];
    
    if (type === "FRAUD") {
      setLogs((prev) => [
        ...prev,
        { timestamp: txTime, category: "ALERTER", message: "CRITICAL: Simulating massive fraud ring attack. Ingesting coordinated mule profiles.", status: "CRITICAL" }
      ]);
      setThreatLevel("CRITICAL");
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          { timestamp: txTime, category: "GNN_ML", message: "GNN Structural Analysis: Found abnormal multi-node density. 4 nodes flagged.", status: "CRITICAL" }
        ]);
        // Update case queue
        mockCases[0].status = "OPEN";
      }, 1000);
    } else if (type === "NORMAL") {
      setLogs((prev) => [
        ...prev,
        { timestamp: txTime, category: "INGRESS", message: "Flushing cache. Simulated normal background transactions initialized.", status: "SUCCESS" }
      ]);
      setThreatLevel("MINIMAL");
    } else {
      setLogs((prev) => [
        ...prev,
        { timestamp: txTime, category: "NEO4J", message: "Manually re-running Louvain Community detection across full transactional graph...", status: "INFO" }
      ]);
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          { timestamp: txTime, category: "NEO4J", message: "Louvain sweep finished: 5 distinct clusters analyzed. Modular ratio at 0.76.", status: "SUCCESS" }
        ]);
      }, 1500);
    }
  };

  const updateCaseStatus = (caseId: string, status: FraudCase["status"]) => {
    const target = mockCases.find((c) => c.id === caseId);
    if (target) {
      target.status = status;
      addLog("USER", `Updated status of case ${caseId} to ${status}`);
    }
  };

  const addLog = (category: LogEntry["category"], message: string) => {
    const timestamp = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [...prev, { timestamp, category, message, status: "INFO" }]);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen text-[#e5e1e4] font-geist select-none bg-[#09090b]">
      
      {/* =======================================================
          VIEW 1: PUBLIC LANDING PAGE
          ======================================================= */}
      {currentView === "landing" && (
        <div className="flex flex-col flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-6">
          {/* Header */}
          <nav className="flex justify-between items-center border-b border-white/10 pb-5 mb-16">
            <span className="text-xl tracking-widest font-extrabold text-white flex items-center gap-2">
              PANOPTICON
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            </span>
            <div className="hidden md:flex gap-8 text-xs font-mono text-[#A1A1AA]">
              <a href="#features" className="hover:text-white transition-colors">CAPABILITIES</a>
              <a href="#comparison" className="hover:text-white transition-colors">THE GRAPH DIFFERENCE</a>
              <a href="#stack" className="hover:text-white transition-colors">TECHNOLOGY STACK</a>
            </div>
            <button
              onClick={() => setCurrentView("login")}
              className="px-4 py-2 bg-white text-black text-xs font-mono font-bold uppercase rounded-[4px] hover:bg-zinc-200 transition-all shadow-sm"
            >
              Launch Console
            </button>
          </nav>

          {/* Hero Section */}
          <header className="flex flex-col items-center text-center max-w-4xl mx-auto mb-24 mt-10">
            <span className="px-2 py-0.5 border border-white/20 bg-white/5 rounded-full font-mono text-[10px] text-[#A1A1AA] tracking-wider mb-6">
              MONOCHROME GLASS PLATFORM v2.4
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-none font-geist mb-6 max-w-3xl">
              Uncover Coordinated Fraud Rings in Real-Time
            </h1>
            <p className="text-base md:text-lg text-[#A1A1AA] leading-relaxed max-w-2xl font-geist mb-10">
              Traditional row-by-row transaction analysis is blind to networks. Panopticon models users, devices, and financial transfers as a GNN-powered graph database to flag anomalies instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                onClick={() => setCurrentView("login")}
                className="px-8 py-3 bg-white text-black font-semibold text-sm rounded-[4px] hover:bg-zinc-200 transition-colors uppercase font-mono shadow-sm"
              >
                Access Gateway
              </button>
              <a
                href="#features"
                className="glass-button-secondary px-8 py-3 text-sm uppercase font-mono flex items-center justify-center"
              >
                Explore Capabilities
              </a>
            </div>
          </header>

          {/* Features Grid */}
          <section id="features" className="mb-32">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase">
                SYSTEM CAPABILITIES & SCHEMAS
              </h2>
              <div className="h-[1px] flex-1 bg-white/10 ml-6"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6">
                <span className="font-mono text-[11px] text-white/50 block mb-3">01 // STRUCTURAL DATA</span>
                <h3 className="text-lg font-bold text-white mb-2">Graph-Based Modeling</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed font-geist">
                  Represents users, devices, IPs, and transactions as node-link topologies to capture multi-hop relations instantly.
                </p>
              </div>

              <div className="glass-card p-6">
                <span className="font-mono text-[11px] text-white/50 block mb-3">02 // CLUSTER sweeps</span>
                <h3 className="text-lg font-bold text-white mb-2">Louvain Detection</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed font-geist">
                  Employs connected components heuristics to segment transaction groups, isolating closed loops of money laundering.
                </p>
              </div>

              <div className="glass-card p-6">
                <span className="font-mono text-[11px] text-white/50 block mb-3">03 // NEURAL AI</span>
                <h3 className="text-lg font-bold text-white mb-2">GNN Classification</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed font-geist">
                  Uses GraphSAGE algorithms to learn deep structural embeddings, classifying mule accounts with Relational contexts.
                </p>
              </div>

              <div className="glass-card p-6">
                <span className="font-mono text-[11px] text-white/50 block mb-3">04 // RELATIONAL TRACE</span>
                <h3 className="text-lg font-bold text-white mb-2">Explainable Lineage</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed font-geist">
                  Generates natural language explainability explaining why accounts are flagged (e.g. device reuse counts).
                </p>
              </div>
            </div>
          </section>

          {/* Comparison Table Section */}
          <section id="comparison" className="mb-32">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase">
                THE ARCHITECTURAL SHIFT
              </h2>
              <div className="h-[1px] flex-1 bg-white/10 ml-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tabular */}
              <div className="glass-card p-8 border-red-900/10">
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-[#A1A1AA]">Traditional Systems</h3>
                  <span className="px-2 py-0.5 bg-red-950/20 text-red-400 font-mono text-[9px] border border-red-900/40 rounded uppercase">Tabular ML</span>
                </div>
                <ul className="space-y-4 text-xs font-mono text-[#A1A1AA]">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✕</span> Treats transactions as isolated row events.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✕</span> Blind to device sharing and multi-hop routing paths.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✕</span> High false positives, forcing analysts to audit simple rules.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✕</span> Easy to bypass by keeping transactional amounts low.
                  </li>
                </ul>
              </div>

              {/* Graph */}
              <div className="glass-card p-8 border-white/20 bg-white/[0.04]">
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-white">Panopticon Intelligence</h3>
                  <span className="px-2 py-0.5 bg-white/10 text-white font-mono text-[9px] border border-white/20 rounded uppercase">Graph Neural Net</span>
                </div>
                <ul className="space-y-4 text-xs font-mono text-white">
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span> Maps relationships as first-class entity entities.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span> Recognizes shared device, IP, and merchant routing loops.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span> Provides full explainability layers explaining GNN classification reasoning.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white">✓</span> Incremental updates flag fraud networks as transactions occur.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section id="stack" className="mb-20 text-center">
            <h3 className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest mb-6">
              PROPOSED PLATFORM ARCHITECTURE
            </h3>
            <div className="flex flex-wrap justify-center gap-12 font-mono text-sm font-bold text-white/40">
              <span className="hover:text-white transition-colors cursor-default">NEO4J / ARANGODB</span>
              <span className="hover:text-white transition-colors cursor-default">PYTORCH GEOMETRIC</span>
              <span className="hover:text-white transition-colors cursor-default">FASTAPI</span>
              <span className="hover:text-white transition-colors cursor-default">NEXT.JS 16</span>
              <span className="hover:text-white transition-colors cursor-default">NETWORKX</span>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-white/10 pt-6 mt-auto flex flex-col md:flex-row justify-between text-xs font-mono text-[#A1A1AA] gap-4">
            <span>© 2026 PANOPTICON INC. ALL PROTOCOLS RESERVED.</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              ALL SYSTEM RELAYS OPERATING NOMINALLY [12ms API latency]
            </span>
          </footer>
        </div>
      )}

      {/* =======================================================
          VIEW 2: SECURITY LOGIN GATEWAY
          ======================================================= */}
      {currentView === "login" && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[400px] glass-card p-8 flex flex-col gap-6">
            <div className="text-center">
              <span className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase">
                PANOPTICON ACCESS PORTAL
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1 font-geist">
                Operator Gateway
              </h2>
            </div>

            {authError && (
              <div className="p-3 border border-red-500/30 bg-red-950/20 rounded-md text-xs font-mono text-red-400">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#A1A1AA] font-mono tracking-wider">EMAIL ADDRESS</label>
                <input
                  type="text"
                  required
                  placeholder="Enter email (e.g. admin@panopticon.com)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="glass-input py-2 px-1 text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#A1A1AA] font-mono tracking-wider">ACCESS KEY</label>
                <input
                  type="password"
                  required
                  placeholder="Enter passcode (e.g. panopticon)"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="glass-input py-2 px-1 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="mt-4 py-2.5 bg-white text-black font-semibold text-xs rounded-[4px] hover:bg-zinc-200 transition-colors uppercase font-mono shadow-sm"
              >
                Initialize Console
              </button>
            </form>

            <div className="border-t border-white/5 pt-4 text-center">
              <button
                onClick={() => setCurrentView("landing")}
                className="text-[10px] text-[#A1A1AA] hover:text-white font-mono uppercase"
              >
                &lt; Return to home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          VIEW 3: NEURAL HANDSHAKE SIMULATION LOADER
          ======================================================= */}
      {currentView === "handshake" && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[550px] glass-card p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-mono font-bold tracking-wider text-[#A1A1AA]">
                SECURE CONSOLE SYSTEM STARTUP
              </span>
              <span className="text-[11px] font-mono text-white font-bold">{handshakeProgress}%</span>
            </div>

            {/* Simulated log viewer */}
            <div className="h-40 bg-black/60 p-4 rounded border border-white/10 font-mono text-[10px] leading-relaxed overflow-y-auto no-scrollbar flex flex-col gap-1">
              {handshakeLogs.map((log, index) => (
                <div key={index} className="text-white/80">
                  {log}
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden border border-white/5">
              <div
                className="bg-white h-full transition-all duration-100"
                style={{ width: `${handshakeProgress}%` }}
              ></div>
            </div>

            <div className="text-center font-mono text-[9px] text-[#A1A1AA] tracking-wider uppercase mt-1">
              COMPUTING NODE EMBEDDINGS & LOUVAIN HEURISTICS
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          VIEW 4: ENTERPRISE ANALYST PORTAL WORKSTATION
          ======================================================= */}
      {currentView === "portal" && (
        <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden">
          
          {/* Left Sidebar Navigation */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#09090b] flex flex-col shrink-0">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <span className="text-md font-extrabold tracking-widest text-white font-geist">
                PANOPTICON
              </span>
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            </div>

            <nav className="flex-1 p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible no-scrollbar">
              <button
                onClick={() => setActivePortalTab("dashboard")}
                className={`w-full text-left px-4 py-2.5 rounded font-sans transition-all text-xs uppercase tracking-wider font-semibold shrink-0 md:shrink-1 ${
                  activePortalTab === "dashboard" ? "bg-white text-black" : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                }`}
              >
                Console Dashboard
              </button>
              <button
                onClick={() => setActivePortalTab("explorer")}
                className={`w-full text-left px-4 py-2.5 rounded font-sans transition-all text-xs uppercase tracking-wider font-semibold shrink-0 md:shrink-1 ${
                  activePortalTab === "explorer" ? "bg-white text-black" : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                }`}
              >
                Graph Explorer
              </button>

              <button
  onClick={() => setActivePortalTab("alerts")}
  className={`w-full text-left px-4 py-2.5 rounded font-sans transition-all text-xs uppercase tracking-wider font-semibold shrink-0 md:shrink-1 ${
    activePortalTab === "alerts"
      ? "bg-white text-black"
      : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
  }`}
>
  Fraud Alerts
</button>
              <button
                onClick={() => {
                  setActivePortalTab("cases");
                  setSelectedNode(null);
                  setSelectedNodeDetails(null);
                }}
                className={`w-full text-left px-4 py-2.5 rounded font-sans transition-all text-xs uppercase tracking-wider font-semibold shrink-0 md:shrink-1 ${
                  activePortalTab === "cases" ? "bg-white text-black" : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                }`}
              >
                Case Management
              </button>
              <button
                onClick={() => setActivePortalTab("analytics")}
                className={`w-full text-left px-4 py-2.5 rounded font-sans transition-all text-xs uppercase tracking-wider font-semibold shrink-0 md:shrink-1 ${
                  activePortalTab === "analytics" ? "bg-white text-black" : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                }`}
              >
                Analytics & Charts
              </button>
              <button
                onClick={() => setActivePortalTab("sandbox")}
                className={`w-full text-left px-4 py-2.5 rounded font-sans transition-all text-xs uppercase tracking-wider font-semibold shrink-0 md:shrink-1 ${
                  activePortalTab === "sandbox" ? "bg-white text-black" : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                }`}
              >
                Design Settings
              </button>
            </nav>

            <div className="p-4 border-t border-white/10 hidden md:block">
              <button
                onClick={handleLogout}
                className="w-full text-center py-2 border border-white/20 rounded font-mono text-[10px] text-[#A1A1AA] hover:text-white hover:border-white transition-all uppercase"
              >
                Lock Session
              </button>
            </div>
          </aside>

          {/* Right Workstation Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Workspace Header */}
            <header className="h-14 border-b border-white/10 px-6 flex justify-between items-center bg-[#0d0d0f] shrink-0 font-mono text-xs text-[#A1A1AA]">
              <div className="flex gap-6 items-center">
                <span>VIEWPORT: {activePortalTab.toUpperCase()}</span>
                <span className="hidden sm:inline">|</span>
                <span className="hidden sm:inline">THREAT INDEX: {threatLevel}</span>
              </div>
              <div className="flex gap-4 items-center">
                <span className="hidden md:inline">SESSION_TOKEN: P-99X82</span>
                <span>{currentTime.split(" ")[0]}</span>
              </div>
            </header>

            {/* Inner Dashboard Viewports */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#09090b]">
              
              {/* VIEW 4.1: CONSOLE DASHBOARD & LIVE MONITORING */}
              {activePortalTab === "dashboard" && (
                <div className="flex flex-col gap-6">
                  {/* Top 4 widgets */}
                  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

  <div className="glass-card p-5 h-28 flex flex-col justify-between">
    <span className="font-mono text-[10px] text-[#A1A1AA] tracking-wider uppercase">
      Total Transactions
    </span>

    <div className="flex justify-between items-baseline mt-2">
      <span className="text-3xl font-extrabold font-geist text-white">
        {dashboardData
          ? dashboardData.total_transactions
          : "--"}
      </span>

      <span className="font-mono text-[9px] text-[#A1A1AA]">
        PROCESSED
      </span>
    </div>
  </div>


  <div className="glass-card p-5 h-28 flex flex-col justify-between">
    <span className="font-mono text-[10px] text-[#A1A1AA] tracking-wider uppercase">
      Transaction Volume
    </span>

    <div className="flex justify-between items-baseline mt-2">
      <span className="text-2xl font-extrabold font-geist text-white">
        ₹{dashboardData
          ? dashboardData.total_transaction_amount.toLocaleString("en-IN")
          : "--"}
      </span>

      <span className="font-mono text-[9px] text-[#A1A1AA]">
        TOTAL
      </span>
    </div>
  </div>


  <div className="glass-card p-5 h-28 flex flex-col justify-between">
    <span className="font-mono text-[10px] text-[#A1A1AA] tracking-wider uppercase">
      Suspicious Transactions
    </span>

    <div className="flex justify-between items-baseline mt-2">
      <span className="text-3xl font-extrabold font-geist text-white">
        {dashboardData
          ? dashboardData.suspicious_transaction_count
          : "--"}
      </span>

      <span className="font-mono text-[9px] text-[#A1A1AA]">
        FLAGGED
      </span>
    </div>
  </div>


  <div className="glass-card p-5 h-28 flex flex-col justify-between">
    <span className="font-mono text-[10px] text-[#A1A1AA] tracking-wider uppercase">
      High Risk Transactions
    </span>

    <div className="flex justify-between items-baseline mt-2">
      <span className="text-3xl font-extrabold font-geist text-white">
        {dashboardData
          ? dashboardData.high_risk_count
          : "--"}
      </span>

      <span className="font-mono text-[9px] text-[#A1A1AA]">
        HIGH RISK
      </span>
    </div>
  </div>

</section>
                  {/* Streaming feeds split grid */}
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Live transactions feed */}
                    <div className="lg:col-span-7 flex flex-col gap-3">
                      <h3 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase">
                        LIVE TRANSACTION STREAMING INGRESS
                      </h3>
                      <div className="glass-card divide-y divide-white/5 overflow-hidden">
                        {transactionsError ? (
  <div className="p-4 text-xs font-mono text-red-400">
    {transactionsError}
  </div>
) : transactions.length === 0 ? (
  <div className="p-4 text-xs font-mono text-[#A1A1AA]">
    NO TRANSACTIONS FOUND
  </div>
) : (
  transactions.map((tx) => (
    <div
      key={tx.id}
      className="p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-mono font-bold text-white">
          {tx.transaction_type} → {tx.status}
        </span>

        <span className="text-[10px] text-[#A1A1AA] font-mono">
          HASH: {tx.transaction_id} // TIME:{" "}
          {new Date(tx.created_at).toLocaleTimeString()}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs font-mono font-bold text-white">
          {tx.currency === "INR" ? "₹" : tx.currency}{" "}
          {tx.amount.toLocaleString("en-IN")}
        </span>

        <span
          className={`px-2 py-0.5 font-mono text-[9px] font-bold rounded ${
            tx.risk_score > 80
              ? "bg-red-950/40 text-red-400 border border-red-500/20"
              : tx.risk_score > 50
              ? "bg-yellow-950/40 text-yellow-400 border border-yellow-500/20"
              : "bg-white/5 text-white/50"
          }`}
        >
          {tx.risk_level} // {tx.risk_score}
        </span>
      </div>
    </div>
  ))
)}
                      </div>
                    </div>

                    {/* Console log outputs */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                      <h3 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase">
                        REAL-TIME GRAPH PIPELINE HEURISTICS
                      </h3>
                      <div className="glass-card p-4 h-[352px] bg-black/40 overflow-y-auto no-scrollbar font-mono text-[10px] flex flex-col gap-2">
                        {logs.map((log, index) => (
                          <div key={index} className="flex flex-col sm:flex-row gap-1 border-b border-white/[0.02] pb-1">
                            <span className="text-[#A1A1AA]">[{log.timestamp}]</span>
                            <span className={`font-bold ${log.status === "CRITICAL" ? "text-red-400" : log.status === "WARN" ? "text-yellow-400" : "text-white"}`}>
                              {log.category}:
                            </span>
                            <span className="text-[#A1A1AA] break-all">{log.message}</span>
                          </div>
                        ))}
                        <div ref={terminalEndRef}></div>
                      </div>
                    </div>
                  </section>

                  {/* Actions control panel */}
                  <section className="glass-card p-6 mt-2">
                    <h4 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase mb-4">
                      SIMULATE TELEMETRY SCENARIOS
                    </h4>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => triggerSimulationEvent("FRAUD")}
                        className="px-4 py-2 bg-white text-black font-semibold text-xs rounded hover:bg-zinc-200 transition-colors uppercase font-mono shadow-sm"
                      >
                        Simulate Fraud Ring Attack
                      </button>
                      <button
                        onClick={() => triggerSimulationEvent("LOUVAIN")}
                        className="glass-button-secondary px-4 py-2 text-xs uppercase font-mono"
                      >
                        Trigger Louvain Sweep
                      </button>
                      <button
                        onClick={() => triggerSimulationEvent("NORMAL")}
                        className="glass-button-secondary px-4 py-2 text-xs uppercase font-mono"
                      >
                        Reset Pipeline State
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {/* VIEW 4.2: DYNAMIC GRAPH EXPLORER */}
              {activePortalTab === "explorer" && (
                <div className="flex flex-col gap-6">
                  {/* Filter controls */}
                  <section className="glass-card p-4 flex flex-wrap gap-6 items-center justify-between text-xs font-mono">
                    <div className="flex flex-wrap gap-4 items-center">
                      <span className="text-[#A1A1AA] uppercase font-bold">Node Filtering:</span>
                      <div className="flex p-0.5 bg-[#18181b] border border-white/10 rounded">
                        {["ALL", "ACCOUNT", "DEVICE", "IP", "MERCHANT"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setExplorerFilterType(type)}
                            className={`px-3 py-1 rounded-sm text-[10px] transition-all font-sans font-semibold ${explorerFilterType === type ? "bg-white text-black" : "text-[#A1A1AA] hover:text-white"}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
  <span className="text-[#A1A1AA] uppercase font-bold">
    LIVE ENTITIES:
  </span>

  <span className="text-white font-bold">
    {explorerNodes.length}
  </span>

  <span className="text-[#A1A1AA]">
    NODES
  </span>

  <span className="text-white font-bold">
    {explorerEdges.length}
  </span>

  <span className="text-[#A1A1AA]">
    LINKS
  </span>
</div>
                  </section>

                  {graphLoading && (
  <div className="glass-card p-4 text-xs font-mono text-[#A1A1AA]">
    LOADING LIVE GRAPH...
  </div>
)}

{graphError && (
  <div className="glass-card p-4 text-xs font-mono text-red-400">
    GRAPH ERROR: {graphError}
  </div>
)}

                  {/* Main Grid splitting Graph Canvas and Node details */}
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* SVG graph link canvas */}
                    <div className="lg:col-span-8 glass-card bg-black/30 h-[500px] relative overflow-hidden flex items-center justify-center p-4">
                      
                      {/* Interactive Canvas SVG */}
                      <svg className="w-full h-full" viewBox="0 0 800 450">
                        {/* Define arrows */}
                        <defs>
                          <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" fillOpacity="0.3" />
                          </marker>
                        </defs>

                        {/* RENDER EDGES */}
                        {explorerEdges
                          .filter((edge) => {
                            const sourceNode = explorerNodes.find((n) => n.id === edge.source);
                            const targetNode = explorerNodes.find((n) => n.id === edge.target);
                            if (!sourceNode || !targetNode) return false;
                            
                            // Apply filters
                            const matchesType = explorerFilterType === "ALL" || sourceNode.type === explorerFilterType || targetNode.type === explorerFilterType;
                            const matchesRisk = true;
                            return matchesType && matchesRisk;
                          })
                          .map((edge) => {
                            const sourceNode = explorerNodes.find((n) => n.id === edge.source);
                            const targetNode = explorerNodes.find((n) => n.id === edge.target);
                            if (!sourceNode || !targetNode) return null;

                            return (
                              <g key={edge.id} className="opacity-45 hover:opacity-100 transition-opacity">
                                <line
                                  x1={sourceNode.x}
                                  y1={sourceNode.y}
                                  x2={targetNode.x}
                                  y2={targetNode.y}
                                  stroke="#ffffff"
                                  strokeWidth="1"
                                  strokeDasharray={edge.type === "MERCHANT_PAYMENT" ? "4 4" : "0"}
                                  markerEnd="url(#arrow)"
                                />
                                <text
                                  x={(sourceNode.x + targetNode.x) / 2}
                                  y={(sourceNode.y + targetNode.y) / 2 - 5}
                                  fill="#A1A1AA"
                                  fontSize="8"
                                  fontFamily="Space Mono"
                                  textAnchor="middle"
                                >
                                  {edge.type}
                                </text>
                              </g>
                            );
                          })}

                        {/* RENDER NODES */}
                        {explorerNodes
                          .filter((node) => {
                            const matchesType = explorerFilterType === "ALL" || node.type === explorerFilterType;
                            const matchesRisk = true;
                            return matchesType && matchesRisk;
                          })
                          .map((node) => {
                            const isSelected = selectedNode?.id === node.id;
                            
                            return (
                              <g
                                key={node.id}
                                transform={`translate(${node.x}, ${node.y})`}
                                className="cursor-pointer"
                                onClick={() => setSelectedNode(node)}
                              >
                               

                                {/* Node shape */}
                                {node.type === "ACCOUNT" && (
                                  <circle r="10" fill={isSelected ? "#ffffff" : "#131315"} stroke="#ffffff" strokeWidth="1.5" />
                                )}
                                {node.type === "DEVICE" && (
                                  <polygon points="0,-10 10,8 -10,8" fill={isSelected ? "#ffffff" : "#131315"} stroke="#ffffff" strokeWidth="1.5" />
                                )}
                                {node.type === "IP" && (
                                  <rect x="-9" y="-9" width="18" height="18" fill={isSelected ? "#ffffff" : "#131315"} stroke="#ffffff" strokeWidth="1.5" />
                                )}
                                {node.type === "MERCHANT" && (
                                  <polygon points="0,-11 11,0 0,11 -11,0" fill={isSelected ? "#ffffff" : "#131315"} stroke="#ffffff" strokeWidth="1.5" />
                                )}

                                {/* Label text */}
                                <text
                                  y="24"
                                  fill="#ffffff"
                                  fontSize="9"
                                  fontFamily="Space Mono"
                                  fontWeight={isSelected ? "bold" : "normal"}
                                  textAnchor="middle"
                                >
                                  {node.label}
                                </text>
                              </g>
                            );
                          })}
                      </svg>

                      <div className="absolute bottom-4 left-4 text-[9px] font-mono text-[#A1A1AA] bg-black/60 px-3 py-1.5 rounded border border-white/5 flex gap-4">
                        <span>● Circle: Account</span>
                        <span>▲ Triangle: Device</span>
                        <span>■ Square: IP</span>
                        <span>◆ Diamond: Merchant</span>
                      </div>
                    </div>

                    {/* Node details */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                      <div className="glass-card p-6 h-[500px] flex flex-col justify-between overflow-y-auto no-scrollbar">
                        {selectedNode ? (
                          <div className="flex flex-col gap-6">
                            <div>
                              <span className="font-mono text-[9px] px-2 py-0.5 bg-[#18181B] border border-white/10 rounded text-white tracking-wider uppercase font-semibold">
                                {selectedNode.type}
                              </span>
                              <h4 className="text-xl font-extrabold text-white font-geist mt-3">{selectedNode.label}</h4>
                              <p className="text-xs font-mono text-[#A1A1AA] mt-1">NODE_ID: {selectedNode.id}</p>
                            </div>

                            {/* Live Graph Activity */}
<div>
  <div className="flex justify-between font-mono text-xs text-[#A1A1AA] mb-2">
    <span>GRAPH ACTIVITY</span>
    <span className="text-white font-bold">
      {selectedNodeEdges.length} LINKS
    </span>
  </div>

  <div className="w-full bg-[#18181b] h-2 rounded-full overflow-hidden border border-white/5">
    <div
      className="h-full bg-white"
      style={{
        width: `${Math.min(selectedNodeEdges.length * 25, 100)}%`,
      }}
    ></div>
  </div>
</div>

                            {/* Live Graph Metrics */}
<div className="grid grid-cols-2 gap-4 border-t border-b border-white/10 py-4 font-mono text-xs">

  <div>
    <span className="text-[#A1A1AA] block text-[9px]">
      NODE TYPE
    </span>

    <span className="text-white font-bold">
      {selectedNode.type}
    </span>
  </div>

  <div>
    <span className="text-[#A1A1AA] block text-[9px]">
      CONNECTED ENTITIES
    </span>

    <span className="text-white font-bold">
      {selectedNodeDetails?.connected_entities ?? selectedNodeConnections.length}
    </span>
  </div>

</div>

                            {/* Real Risk Analytics */}
                            {nodeDetailsLoading ? (
                              <div className="text-xs font-mono text-[#A1A1AA] py-2">
                                LOADING NEURAL AUDIT DATA...
                              </div>
                            ) : nodeDetailsError ? (
                              <div className="text-xs font-mono text-red-400 py-2">
                                {nodeDetailsError}
                              </div>
                            ) : selectedNodeDetails ? (
                              <div className="border-b border-white/10 pb-4">
                                <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block mb-3">
                                  Risk Analytics
                                </span>

                                <div className="grid grid-cols-2 gap-3 font-mono text-xs">

                                  <div className="bg-black/30 p-3 rounded border border-white/5">
                                    <span className="text-[9px] text-[#A1A1AA] block uppercase">
                                      Transactions
                                    </span>
                                    <span className="text-white font-bold">
                                      {selectedNodeDetails.transaction_count}
                                    </span>
                                  </div>

                                  <div className="bg-black/30 p-3 rounded border border-white/5">
                                    <span className="text-[9px] text-[#A1A1AA] block uppercase">
                                      Total Volume
                                    </span>
                                    <span className="text-white font-bold">
                                      ₹{selectedNodeDetails.total_amount.toLocaleString("en-IN")}
                                    </span>
                                  </div>

                                  <div className="bg-black/30 p-3 rounded border border-white/5">
                                    <span className="text-[9px] text-[#A1A1AA] block uppercase">
                                      Suspicious
                                    </span>
                                    <span className="text-white font-bold">
                                      {selectedNodeDetails.suspicious_count}
                                    </span>
                                  </div>

                                  <div className="bg-black/30 p-3 rounded border border-white/5">
                                    <span className="text-[9px] text-[#A1A1AA] block uppercase">
                                      Suspicious Transactions
                                    </span>
                                    <span className="text-white font-bold">
                                      ₹{selectedNodeDetails.suspicious_count.toLocaleString("en-IN")}
                                    </span>
                                  </div>

                                  <div className="bg-black/30 p-3 rounded border border-white/5">
                                    <span className="text-[9px] text-[#A1A1AA] block uppercase">
                                      Avg Risk Score
                                    </span>
                                    <span className="text-white font-bold">
                                      {selectedNodeDetails.average_risk_score}
                                    </span>
                                  </div>

                                  <div className="bg-black/30 p-3 rounded border border-white/5">
                                    <span className="text-[9px] text-[#A1A1AA] block uppercase">
                                      Highest Risk
                                    </span>
                                    <span className="text-white font-bold">
                                      {selectedNodeDetails.highest_risk_score}
                                    </span>
                                  </div>

                                </div>

                                <div className="mt-3 flex justify-between items-center bg-black/30 p-3 rounded border border-white/5">
                                  <span className="text-[9px] text-[#A1A1AA] font-mono uppercase">
                                    Risk Level
                                  </span>

                                  <span className="text-white font-bold font-mono text-xs">
                                    {selectedNodeDetails.risk_level}
                                  </span>
                                </div>
                              </div>
                            ) : null}

                            {/* Live Entity Metadata */}
<div>
  <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block mb-2">
    Entity Metadata
  </span>

  <div className="space-y-2 font-mono text-xs bg-black/30 p-3 rounded border border-white/5">

    <div className="flex justify-between">
      <span className="text-[#A1A1AA]">
        Source:
      </span>

      <span className="text-white font-semibold">
        Panopticon API
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-[#A1A1AA]">
        Node ID:
      </span>

      <span className="text-white font-semibold">
        {selectedNode.id}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-[#A1A1AA]">
        Type:
      </span>

      <span className="text-white font-semibold">
        {selectedNode.type}
      </span>
    </div>

  </div>

                              {/* Backend Explainability */}
                            {selectedNodeDetails && (
                              <div>
                                <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block mb-2">
                                  Lineage Explainability
                                </span>

                                <div className="bg-black/30 p-3 rounded border border-white/5">
                                  <p className="text-xs text-[#A1A1AA] leading-relaxed font-geist">
                                    {selectedNodeDetails.explanation}
                                  </p>
                                </div>
                              </div>
                            )}



</div>
                           {/* Graph Relationships */}
<div>

  <span className="text-[10px] text-[#A1A1AA] font-mono uppercase block mb-2">
    Graph Relationships
  </span>

  <div className="space-y-2">

    {selectedNodeConnections.length === 0 ? (

      <div className="text-xs text-[#A1A1AA] font-mono">
        NO CONNECTED RELATIONSHIPS
      </div>

    ) : (

      selectedNodeConnections.map(({ edge, connectedNode }) => (

        <div
          key={edge.id}
          className="bg-black/30 p-3 rounded border border-white/5"
        >

          <div className="flex justify-between items-start gap-3">

            <div>

              <div className="text-[10px] text-white font-mono font-bold uppercase">
                {edge.type.replaceAll("_", " ")}
              </div>

              <div className="text-[10px] text-[#A1A1AA] font-mono mt-1">
                → {connectedNode?.label ?? "Unknown Entity"}
              </div>

            </div>

            <div className="text-right">

              <div className="text-xs text-white font-mono font-bold">
                {edge.transaction_count ?? 0}
              </div>

              <div className="text-[8px] text-[#A1A1AA] font-mono uppercase">
                transactions
              </div>

            </div>

          </div>

          <div className="border-t border-white/5 mt-2 pt-2 flex justify-between">

            <span className="text-[9px] text-[#A1A1AA] font-mono uppercase">
              Relationship Volume
            </span>

            <span className="text-[10px] text-white font-mono font-bold">
              ₹{(edge.total_amount ?? 0).toLocaleString("en-IN")}
            </span>

          </div>

        </div>

      ))

    )}

  </div>

</div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center text-xs font-mono text-[#A1A1AA] py-20">
                            <span>&lt; SELECT NODE ON CANVAS TO ACCESS NEURAL AUDIT DETAILS &gt;</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* VIEW 4.3: REAL-TIME FRAUD ALERTS */}
{activePortalTab === "alerts" && (
  <div className="flex flex-col gap-6">

    <div className="flex justify-between items-center px-1">
      <div>
        <h3 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase">
          REAL-TIME FRAUD ALERT QUEUE
        </h3>

        <p className="text-[10px] text-[#A1A1AA] font-mono mt-1">
          LIVE ALERTS GENERATED BY PANOPTICON RISK ENGINE
        </p>
      </div>

      <span className="text-xs font-mono text-white">
        {alerts.length} ALERTS
      </span>
    </div>

    {alertsError && (
      <div className="glass-card p-4 text-xs font-mono text-red-400">
        ALERT ERROR: {alertsError}
      </div>
    )}

    {!alertsError && alerts.length === 0 && (
      <div className="glass-card p-6 text-xs font-mono text-[#A1A1AA]">
        NO ACTIVE FRAUD ALERTS
      </div>
    )}

    <div className="flex flex-col gap-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >

          <div className="flex flex-col gap-2">

            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-red-950/40 text-red-400 border border-red-500/20 rounded font-mono text-[9px] font-bold">
                {alert.priority}
              </span>

              <span className="text-xs font-mono text-[#A1A1AA]">
                ALERT #{alert.id}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white font-geist">
              {alert.title}
            </h4>

            <span className="text-[10px] text-[#A1A1AA] font-mono">
              TRANSACTION: {alert.transaction_id}
            </span>

          </div>

          <div className="flex items-center gap-6">

            <div className="text-right">
              <span className="block text-[9px] text-[#A1A1AA] font-mono uppercase">
                Risk Score
              </span>

              <span className="text-xl font-extrabold text-white font-geist">
                {alert.risk_score}
              </span>
            </div>

            <div className="text-right">
              <span className="block text-[9px] text-[#A1A1AA] font-mono uppercase">
                Status
              </span>

              <span className="text-xs text-white font-mono font-bold">
                {alert.status}
              </span>
            </div>

            <div className="text-right hidden sm:block">
              <span className="block text-[9px] text-[#A1A1AA] font-mono uppercase">
                Created
              </span>

              <span className="text-[10px] text-white font-mono">
                {new Date(alert.created_at).toLocaleString()}
              </span>
            </div>

          </div>

        </div>
      ))}
    </div>

  </div>
)}

              {/* VIEW 4.3: CASE ALERT MANAGEMENT */}
              {activePortalTab === "cases" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Case List Queue (Left 4 cols) */}
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    <h3 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase">
                      ACTIVE FRAUD CASES ({mockCases.length})
                    </h3>

                    <div className="flex flex-col gap-4">
                      {mockCases.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedCaseId(c.id);
                            setSelectedNode(null);
                          }}
                          className={`glass-card p-5 cursor-pointer hover:bg-white/[0.04] transition-all duration-300 flex flex-col gap-4 ${
                            selectedCaseId === c.id ? "bg-white/[0.03] border-white/40" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono text-[9px] text-[#A1A1AA] tracking-wider uppercase block">
                                {c.category}
                              </span>
                              <h4 className="text-md font-extrabold text-white font-geist mt-1">{c.title}</h4>
                            </div>
                            <span className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded ${
                              c.riskScore > 85 ? "bg-red-950/40 text-red-400 border border-red-500/20" : "bg-yellow-950/40 text-yellow-400 border border-yellow-500/20"
                            }`}>
                              {c.riskScore}% RISK
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono text-[#A1A1AA] border-t border-white/5 pt-3">
                            <span>CASE ID: {c.id}</span>
                            <span className={`font-semibold ${c.status === "OPEN" ? "text-yellow-400" : c.status === "BLOCKED" ? "text-red-400" : "text-zinc-500"}`}>
                              {c.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Case visual canvas & explainability (Right 8 cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase">
                        SUBGRAPH DETAIL: {selectedCase.title} ({selectedCase.id})
                      </h3>
                      <span className="font-mono text-[10px] text-[#A1A1AA]">AUDITED: {selectedCase.date}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Dynamic Subgraph SVG (md: 7 cols) */}
                      <div className="md:col-span-8 glass-card bg-black/30 h-[380px] flex items-center justify-center p-2 relative overflow-hidden">
                        
                        <svg className="w-full h-full" viewBox="0 0 700 350">
                          {/* Edges */}
                          {selectedCase.edges.map((edge) => {
                            const sourceNode = selectedCase.nodes.find((n) => n.id === edge.source);
                            const targetNode = selectedCase.nodes.find((n) => n.id === edge.target);
                            if (!sourceNode || !targetNode) return null;

                            return (
                              <g key={edge.id} className="opacity-50 hover:opacity-100 transition-opacity">
                                <line
                                  x1={sourceNode.x}
                                  y1={sourceNode.y}
                                  x2={targetNode.x}
                                  y2={targetNode.y}
                                  stroke="#ffffff"
                                  strokeWidth="1.2"
                                  strokeDasharray={edge.type === "MERCHANT_PAYMENT" ? "4 4" : "0"}
                                />
                                <text
                                  x={(sourceNode.x + targetNode.x) / 2}
                                  y={(sourceNode.y + targetNode.y) / 2 - 5}
                                  fill="#A1A1AA"
                                  fontSize="7"
                                  fontFamily="Space Mono"
                                  textAnchor="middle"
                                >
                                  {edge.type}
                                </text>
                              </g>
                            );
                          })}

                          {/* Nodes */}
                          {selectedCase.nodes.map((node) => {
                            const isSelected = selectedNode?.id === node.id;
                            return (
                              <g
                                key={node.id}
                                transform={`translate(${node.x}, ${node.y})`}
                                className="cursor-pointer"
                                onClick={() => setSelectedNode(node)}
                              >
                                {node.riskScore > 80 && (
                                  <circle r="16" fill="none" stroke="#ffffff" strokeWidth="1" className="animate-pulse opacity-40" />
                                )}

                                {node.type === "ACCOUNT" && (
                                  <circle r="9" fill={isSelected ? "#ffffff" : "#131315"} stroke="#ffffff" strokeWidth="1.2" />
                                )}
                                {node.type === "DEVICE" && (
                                  <polygon points="0,-9 9,7 -9,7" fill={isSelected ? "#ffffff" : "#131315"} stroke="#ffffff" strokeWidth="1.2" />
                                )}
                                {node.type === "IP" && (
                                  <rect x="-8" y="-8" width="16" height="16" fill={isSelected ? "#ffffff" : "#131315"} stroke="#ffffff" strokeWidth="1.2" />
                                )}
                                {node.type === "MERCHANT" && (
                                  <polygon points="0,-10 10,0 0,10 -10,0" fill={isSelected ? "#ffffff" : "#131315"} stroke="#ffffff" strokeWidth="1.2" />
                                )}

                                <text
                                  y="22"
                                  fill="#ffffff"
                                  fontSize="8"
                                  fontFamily="Space Mono"
                                  fontWeight={isSelected ? "bold" : "normal"}
                                  textAnchor="middle"
                                >
                                  {node.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>

                        <div className="absolute top-4 left-4 text-[9px] font-mono text-[#A1A1AA] bg-black/60 px-2 py-1 rounded border border-white/5">
                          &lt; CLICK NODE FOR REASSESSMENT &gt;
                        </div>
                      </div>

                      {/* Case details / Explainability (md: 4 cols) */}
                      <div className="md:col-span-4 flex flex-col gap-4">
                        <div className="glass-card p-5 h-[380px] flex flex-col justify-between overflow-y-auto no-scrollbar font-mono text-xs">
                          {selectedNode ? (
                            <div className="flex flex-col gap-4">
                              <div>
                                <span className="text-[9px] text-[#A1A1AA] tracking-wider uppercase">ENTITY TYPE: {selectedNode.type}</span>
                                <h5 className="text-sm font-bold text-white font-geist mt-1">{selectedNode.label}</h5>
                              </div>

                              <div className="border-t border-white/5 pt-3">
                                <span className="text-[9px] text-[#A1A1AA] block">GNN STRUCTURAL RISK</span>
                                <span className="text-sm font-extrabold text-white">{selectedNode.riskScore}%</span>
                              </div>

                              <div className="border-t border-white/5 pt-3 space-y-1">
                                {Object.entries(selectedNode.details).map(([k, v]) => (
                                  <div key={k} className="flex justify-between text-[11px]">
                                    <span className="text-[#A1A1AA]">{k}:</span>
                                    <span className="text-white font-semibold">{v}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="border-t border-white/5 pt-3">
                                <span className="text-[9px] text-[#A1A1AA] block mb-1">REASONING</span>
                                <p className="text-[11px] text-[#A1A1AA] leading-normal font-geist">
                                  {selectedNode.explanation}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4 text-xs font-geist">
                              <div>
                                <span className="text-[9px] font-mono text-[#A1A1AA] tracking-wider uppercase">Case Summary</span>
                                <p className="text-xs text-white leading-relaxed mt-1">{selectedCase.explanation}</p>
                              </div>

                              <div className="border-t border-white/5 pt-4">
                                <span className="text-[9px] font-mono text-[#A1A1AA] tracking-wider uppercase block mb-2">Network Diagnostics</span>
                                <div className="space-y-2 font-mono text-[10px] text-[#A1A1AA]">
                                  <div className="flex justify-between">
                                    <span>Total nodes:</span>
                                    <span className="text-white font-semibold">{selectedCase.nodes.length}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Total links:</span>
                                    <span className="text-white font-semibold">{selectedCase.edges.length}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>GNN Consensus:</span>
                                    <span className="text-white font-semibold">{selectedCase.riskScore}% Confidence</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-auto border-t border-white/5 pt-4 flex flex-col gap-2">
                                <span className="text-[9px] font-mono text-[#A1A1AA] tracking-wider uppercase block">Resolve Action</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateCaseStatus(selectedCase.id, "BLOCKED")}
                                    className="flex-1 py-1.5 bg-white text-black font-semibold text-[10px] rounded-[4px] hover:bg-zinc-200 transition-colors uppercase font-mono shadow-sm"
                                  >
                                    Block Node
                                  </button>
                                  <button
                                    onClick={() => updateCaseStatus(selectedCase.id, "DISMISSED")}
                                    className="flex-1 py-1.5 glass-button-secondary text-[10px] uppercase font-mono"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 4.4: ANALYTICS & CHARTS */}
              {activePortalTab === "analytics" && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase">
                      PLATFORM PERFORMANCE METRICS
                    </h3>
                  </div>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* GNN Accuracy Line Chart */}
                    <div className="glass-card p-6 flex flex-col gap-4">
                      <div className="flex justify-between items-start border-b border-white/10 pb-3 mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-white font-geist">GNN Classification Accuracy</h4>
                          <span className="text-[10px] text-[#A1A1AA] font-mono">GraphSAGE vs Baseline Tabular XGBoost</span>
                        </div>
                        <span className="text-xs text-white font-mono font-bold">96.4% ACC</span>
                      </div>

                      {/* SVG Line Chart */}
                      <div className="w-full h-48">
                        <svg className="w-full h-full" viewBox="0 0 300 150">
                          {/* Grid Lines */}
                          <line x1="20" y1="20" x2="280" y2="20" stroke="#444748" strokeWidth="0.5" strokeDasharray="3 3" />
                          <line x1="20" y1="60" x2="280" y2="60" stroke="#444748" strokeWidth="0.5" strokeDasharray="3 3" />
                          <line x1="20" y1="100" x2="280" y2="100" stroke="#444748" strokeWidth="0.5" strokeDasharray="3 3" />
                          <line x1="20" y1="130" x2="280" y2="130" stroke="#444748" strokeWidth="1" />

                          {/* Data Path: Tabular (Dashed Gray) */}
                          <path
                            d="M 20 120 L 70 100 L 120 105 L 170 90 L 220 85 L 280 80"
                            fill="none"
                            stroke="#8e9192"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          />
                          {/* Data Path: GraphSAGE GNN (Solid White) */}
                          <path
                            d="M 20 100 L 70 65 L 120 50 L 170 35 L 220 28 L 280 20"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />

                          {/* Labels */}
                          <text x="20" y="145" fill="#A1A1AA" fontSize="8" fontFamily="Space Mono">EPOCH 10</text>
                          <text x="150" y="145" fill="#A1A1AA" fontSize="8" fontFamily="Space Mono" textAnchor="middle">EPOCH 50</text>
                          <text x="280" y="145" fill="#A1A1AA" fontSize="8" fontFamily="Space Mono" textAnchor="end">EPOCH 100</text>
                        </svg>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-[#A1A1AA] mt-2">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-[2px] bg-white"></span>
                          GraphSAGE GNN
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-[2px] bg-white/40 border-dashed border-white"></span>
                          Tabular XGBoost
                        </span>
                      </div>
                    </div>

                    {/* Daily Anomaly Volume Bar Chart */}
                    <div className="glass-card p-6 flex flex-col gap-4">
                      <div className="flex justify-between items-start border-b border-white/10 pb-3 mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-white font-geist">Daily Anomaly Detections</h4>
                          <span className="text-[10px] text-[#A1A1AA] font-mono">Flagged mule nodes / structural deviations</span>
                        </div>
                        <span className="text-xs text-white font-mono font-bold">142 Flagged</span>
                      </div>

                      {/* SVG Bar Chart */}
                      <div className="w-full h-48">
                        <svg className="w-full h-full" viewBox="0 0 300 150">
                          <line x1="20" y1="20" x2="280" y2="20" stroke="#444748" strokeWidth="0.5" strokeDasharray="3 3" />
                          <line x1="20" y1="70" x2="280" y2="70" stroke="#444748" strokeWidth="0.5" strokeDasharray="3 3" />
                          <line x1="20" y1="130" x2="280" y2="130" stroke="#444748" strokeWidth="1" />

                          {/* Bars */}
                          {[
                            { x: 30, w: 20, h: 60, val: 32 },
                            { x: 70, w: 20, h: 40, val: 24 },
                            { x: 110, w: 20, h: 90, val: 56 },
                            { x: 150, w: 20, h: 105, val: 78 },
                            { x: 190, w: 20, h: 70, val: 42 },
                            { x: 230, w: 20, h: 80, val: 48 }
                          ].map((bar, idx) => (
                            <g key={idx}>
                              <rect
                                x={bar.x}
                                y={130 - bar.h}
                                width={bar.w}
                                height={bar.h}
                                fill="rgba(255, 255, 255, 0.1)"
                                stroke="#ffffff"
                                strokeWidth="1"
                              />
                              <text x={bar.x + 10} y={125 - bar.h} fill="#ffffff" fontSize="7" fontFamily="Space Mono" textAnchor="middle">{bar.val}</text>
                            </g>
                          ))}

                          <text x="40" y="145" fill="#A1A1AA" fontSize="8" fontFamily="Space Mono" textAnchor="middle">MON</text>
                          <text x="120" y="145" fill="#A1A1AA" fontSize="8" fontFamily="Space Mono" textAnchor="middle">WED</text>
                          <text x="200" y="145" fill="#A1A1AA" fontSize="8" fontFamily="Space Mono" textAnchor="middle">FRI</text>
                          <text x="240" y="145" fill="#A1A1AA" fontSize="8" fontFamily="Space Mono" textAnchor="middle">SAT</text>
                        </svg>
                      </div>

                      <div className="text-[9px] font-mono text-[#A1A1AA] text-center mt-2">
                        Consolidated alerts from Louvain algorithms & GNN threshold scoring
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* VIEW 4.5: DESIGN SETTINGS PLAYGROUND */}
              {activePortalTab === "sandbox" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Design documentation showcase (Left 7 cols) */}
                  <section className="lg:col-span-7 flex flex-col gap-8">
                    {/* Swatches */}
                    <div className="glass-card p-6">
                      <h4 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase border-b border-white/10 pb-2 mb-4">
                        Colors
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                        <div className="flex flex-col gap-1.5">
                          <div className="h-10 bg-[#09090b] border border-white/10 rounded"></div>
                          <span className="text-white font-bold">Obsidian Canvas</span>
                          <span className="text-[#A1A1AA] text-[10px]">#09090B</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="h-10 bg-[#131315] border border-white/10 rounded"></div>
                          <span className="text-white font-bold">Surface Card</span>
                          <span className="text-[#A1A1AA] text-[10px]">#131315</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="h-10 bg-white rounded"></div>
                          <span className="text-white font-bold">Primary White</span>
                          <span className="text-[#A1A1AA] text-[10px]">#FFFFFF</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="h-10 bg-[#A1A1AA] rounded"></div>
                          <span className="text-white font-bold">Secondary Gray</span>
                          <span className="text-[#A1A1AA] text-[10px]">#A1A1AA</span>
                        </div>
                      </div>
                    </div>

                    {/* Typography */}
                    <div className="glass-card p-6">
                      <h4 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase border-b border-white/10 pb-2 mb-4">
                        Typography
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-[9px] text-[#A1A1AA] font-mono block">DISPLAY / GEIST BOLD -0.02EM</span>
                          <h1 className="text-4xl font-extrabold text-white tracking-tighter leading-none font-geist">
                            Panopticon GNN
                          </h1>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#A1A1AA] font-mono block">MONOSPACE / SPACE MONO DATA LABELS</span>
                          <div className="flex gap-2 text-xs font-mono mt-1">
                            <span className="px-2 py-0.5 bg-[#18181B] rounded text-white">CASE_ID: 104</span>
                            <span className="px-2 py-0.5 bg-[#18181B] rounded text-white">NODES: 5</span>
                            <span className="px-2 py-0.5 bg-[#18181B] rounded text-white">ACC: 96.4%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Glass adjusters Sandbox (Right 5 cols) */}
                  <section className="lg:col-span-5 flex flex-col gap-6">
                    <div className="glass-card p-6 flex flex-col gap-5">
                      <h4 className="text-xs font-mono font-bold tracking-widest text-[#A1A1AA] uppercase mb-4">
                        Glassmorphism Sandbox
                      </h4>

                      <div className="space-y-4 font-mono text-xs">
                        <div>
                          <div className="flex justify-between text-white font-bold mb-1">
                            <span>BACKDROP BLUR</span>
                            <span>{blurIntensity}px</span>
                          </div>
                          <input
                            type="range"
                            min="4"
                            max="40"
                            value={blurIntensity}
                            onChange={(e) => setBlurIntensity(Number(e.target.value))}
                            className="w-full accent-white bg-white/10 rounded appearance-none cursor-pointer h-1.5"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-white font-bold mb-1">
                            <span>SURFACE OPACITY</span>
                            <span>{Math.round(glassOpacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.01"
                            max="0.2"
                            step="0.01"
                            value={glassOpacity}
                            onChange={(e) => setGlassOpacity(Number(e.target.value))}
                            className="w-full accent-white bg-white/10 rounded appearance-none cursor-pointer h-1.5"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-white font-bold mb-1">
                            <span>BORDER OPACITY</span>
                            <span>{Math.round(sandboxBorderOpacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.02"
                            max="0.4"
                            step="0.01"
                            value={sandboxBorderOpacity}
                            onChange={(e) => setSandboxBorderOpacity(Number(e.target.value))}
                            className="w-full accent-white bg-white/10 rounded appearance-none cursor-pointer h-1.5"
                          />
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-4 mt-2">
                        <span className="text-[9px] text-[#A1A1AA] font-mono uppercase block mb-3">Live sandbox preview</span>
                        
                        <div
                          className="p-5 flex flex-col justify-between h-[140px] transition-all duration-200"
                          style={{
                            backdropFilter: `blur(${blurIntensity}px)`,
                            WebkitBackdropFilter: `blur(${blurIntensity}px)`,
                            background: `linear-gradient(rgba(255, 255, 255, ${glassOpacity}), rgba(255, 255, 255, ${glassOpacity / 3})) padding-box,
                                        linear-gradient(to bottom, rgba(255, 255, 255, ${sandboxBorderOpacity}), rgba(255, 255, 255, 0.02)) border-box`,
                            border: "1px solid transparent",
                            borderRadius: "12px"
                          }}
                        >
                          <div className="flex justify-between items-start font-mono text-[9px] text-[#A1A1AA]">
                            <span>PREVIEW_GLASS</span>
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                          </div>
                          <div className="text-white mt-auto">
                            <h5 className="font-bold text-sm font-geist">Interactive Shard</h5>
                            <p className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">backdrop-filter: blur({blurIntensity}px);</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
