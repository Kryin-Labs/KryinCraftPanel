'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedConsolePreview from '@/components/AnimatedConsolePreview';
import {
  Server,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  HardDrive,
  Cpu,
  Terminal,
  Users,
  Check,
  Radio,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  Copy,
  CheckCheck,
  FileCode,
  Folder,
  FolderOpen,
  File,
  Menu,
  X,
  Play,
  Activity,
  Layers,
  BarChart3,
  Flame,
  Code2,
  RefreshCw,
  Gauge,
  Sliders,
  Settings,
  FileText,
  Gamepad2,
  Key,
  Wrench,
  ShieldCheck,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* File Structure Data for "Your software factory, defined in code"    */
/* Sleek Minimal Monochrome Isometric Logo Component                   */
/* ------------------------------------------------------------------ */

function KryinLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3L4 9.8V22.2L16 29L28 22.2V9.8L16 3Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M16 3V16M16 16L4 9.8M16 16L28 9.8M16 16V29" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Software Engine / Partner Logos Data for Moving Carousel           */
/* ------------------------------------------------------------------ */

const ENGINE_LOGOS = [
  { name: 'PAPER 26.3', icon: FileText },
  { name: 'PURPUR ENGINE', icon: Sparkles },
  { name: 'VELOCITY PROXY', icon: Zap },
  { name: 'GEYSER-MC', icon: Gamepad2 },
  { name: 'FLOODGATE', icon: Key },
  { name: 'VIAVERSION', icon: RefreshCw },
  { name: 'SPIGOT ENGINE', icon: Wrench },
  { name: 'TATA / JIO FIBER DIRECT', icon: Globe },
];

/* ------------------------------------------------------------------ */
/* File Structure Data for "Your game server, configured in code"      */
/* ------------------------------------------------------------------ */

interface CodeFileItem {
  id: string;
  name: string;
  path: string;
  folder: string;
  language: string;
  lines: string[];
  annotations?: { [lineIndex: number]: string };
}

const TREE_DATA: {
  folder: string;
  files: CodeFileItem[];
}[] = [
  {
    folder: 'configs',
    files: [
      {
        id: 'server-properties',
        name: 'server.properties',
        path: 'configs/server.properties',
        folder: 'configs',
        language: 'properties',
        lines: [
          '# KryinHost Production Server Config (Mumbai Node 01)',
          'server-port=25565',
          'query.port=25565',
          'enable-rcon=true',
          'rcon.port=25575',
          'motd=\\u00a7bKryinCraft \\u00a78[\\u00a7aIndian Node 01\\u00a78] \\u00a77Fast · No Lag',
          'gamemode=survival',
          'difficulty=hard',
          'max-players=40',
          'online-mode=true',
          'view-distance=10',
          'simulation-distance=8',
          'network-compression-threshold=256',
          'prevent-proxy-connections=false',
          'auto-sleep.enabled=true',
          'auto-sleep.idle-timeout-minutes=5',
        ],
        annotations: {
          5: 'motd: High-contrast Indian node identifier and status message shown in Minecraft server list.',
          14: 'auto-sleep.enabled: Puts the server into low-power hibernation 5 minutes after the last player disconnects.',
        },
      },
      {
        id: 'paper-global-yml',
        name: 'paper-global.yml',
        path: 'configs/paper-global.yml',
        folder: 'configs',
        language: 'yaml',
        lines: [
          '# Paper 26.3 Global Optimization Engine',
          '_version: 29',
          'timings:',
          '  enabled: true',
          '  verbose: false',
          'chunk-loading:',
          '  min-load-radius: 2',
          '  max-concurrent-loads: 8',
          '  player-max-concurrent-loads: 4',
          'tick-rates:',
          '  sensor:',
          '    villager:',
          '      secondarypoisensor: 40',
          'collisions:',
          '  enable-player-collisions: true',
          'async-chunks:',
          '  threads: -1',
          'logging:',
          '  use-colored-console: true',
        ],
        annotations: {
          6: 'chunk-loading: Asynchronous multi-threaded chunk pipeline prevents lag spikes during elytra flight.',
          15: 'async-chunks.threads: Auto-allocates optimal thread pool matching host CPU core topology.',
        },
      },
      {
        id: 'spigot-yml',
        name: 'spigot.yml',
        path: 'configs/spigot.yml',
        folder: 'configs',
        language: 'yaml',
        lines: [
          '# Spigot Engine Entity Tuning',
          'config-version: 12',
          'settings:',
          '  save-user-cache-on-stop-only: true',
          '  bungeecord: false',
          '  sample-count: 12',
          'world-settings:',
          '  default:',
          '    entity-activation-range:',
          '      animals: 16',
          '      monsters: 24',
          '      raiders: 32',
          '      misc: 8',
          '    merge-radius:',
          '      item: 4.0',
          '      exp: 6.0',
        ],
        annotations: {
          9: 'entity-activation-range: Restricts background mob calculations to preserve 20.0 TPS.',
        },
      },
    ],
  },
  {
    folder: 'plugins',
    files: [
      {
        id: 'geyser-yml',
        name: 'geyser.yml',
        path: 'plugins/geyser.yml',
        folder: 'plugins',
        language: 'yaml',
        lines: [
          '# GeyserBridge Crossplay Gateway (Bedrock & Mobile)',
          'bedrock:',
          '  address: 0.0.0.0',
          '  port: 19132',
          '  clone-remote-port: false',
          '  motd1: "KryinHost Bedrock Crossplay"',
          '  motd2: "PlayStation / Xbox / Switch / Android / iOS"',
          'remote:',
          '  address: 127.0.0.1',
          '  port: 25565',
          '  auth-type: floodgate',
          'floodgate:',
          '  key-file: key.pem',
          'metrics:',
          '  enabled: true',
        ],
        annotations: {
          3: 'bedrock.port: Port 19132 allows console and mobile players to join Java servers seamlessly.',
          10: 'floodgate.key-file: Passwordless authentication with official Xbox Live gamertags.',
        },
      },
      {
        id: 'floodgate-yml',
        name: 'floodgate.yml',
        path: 'plugins/floodgate.yml',
        folder: 'plugins',
        language: 'yaml',
        lines: [
          '# Floodgate Identity & Skin Sync Engine',
          'key: key.pem',
          'username-prefix: "."',
          'replace-spaces: true',
          'skin-upload:',
          '  enabled: true',
          'send-floodgate-data: true',
        ],
        annotations: {
          2: 'username-prefix: Prefixes Bedrock gamertags with "." to avoid colliding with Java username namespaces.',
        },
      },
      {
        id: 'luckperms-yml',
        name: 'luckperms.yml',
        path: 'plugins/luckperms.yml',
        folder: 'plugins',
        language: 'yaml',
        lines: [
          '# LuckPerms RBAC & Group Permissions',
          'server: "kryin-node-01"',
          'storage-method: "h2"',
          'split-storage:',
          '  enabled: false',
          'vault:',
          '  modify-group-hierarchy: true',
          'log-notify: true',
          'auto-op: false',
        ],
      },
      {
        id: 'viaversion-yml',
        name: 'viaversion.yml',
        path: 'plugins/viaversion.yml',
        folder: 'plugins',
        language: 'yaml',
        lines: [
          '# ViaVersion Multi-Protocol Gateway',
          'checkversion: false',
          'suppress-1_20-features: false',
          'block-versions: []',
          'velocity-ping-passthrough: true',
          'max-pps: 300',
        ],
      },
    ],
  },
  {
    folder: 'automations',
    files: [
      {
        id: 'auto-sleep-yaml',
        name: 'auto-sleep.yaml',
        path: 'automations/auto-sleep.yaml',
        folder: 'automations',
        language: 'yaml',
        lines: [
          '# Smart Hibernation & Auto-Wake Controller',
          'automationId: auto-sleep-hibernate',
          'trigger:',
          '  type: player-count-zero',
          '  debounceSeconds: 300',
          'actions:',
          '  - type: save-world',
          '    flushAllChunks: true',
          '  - type: enter-low-power-hibernate',
          '    preserveRamSnapshots: true',
          '  - type: listen-wake-gateway',
          '    ports: [25565, 19132]',
          '    targetWakeTimeSeconds: 85',
          'wakeTrigger:',
          '  onTcpSyn: true',
          '  onUdpRaknet: true',
        ],
        annotations: {
          9: 'enter-low-power-hibernate: Puts CPU cores to idle while preserving world RAM snapshots.',
          11: 'targetWakeTimeSeconds: Wakes the server back to active state in under 90 seconds on join.',
        },
      },
      {
        id: 'backup-cron-yaml',
        name: 'backup-cron.yaml',
        path: 'automations/backup-cron.yaml',
        folder: 'automations',
        language: 'yaml',
        lines: [
          '# Automated NVMe Snapshot System',
          'automationId: hourly-nvme-backup',
          'schedule: "0 * * * *"',
          'retention:',
          '  hourly: 24',
          '  daily: 7',
          'destination: "s3://kryin-backups-mumbai/worlds/"',
          'compression: zstd-ultra',
          'pauseTickTimeMs: 15',
        ],
      },
      {
        id: 'auto-restart-yaml',
        name: 'auto-restart.yaml',
        path: 'automations/auto-restart.yaml',
        folder: 'automations',
        language: 'yaml',
        lines: [
          '# Maintenance & Memory Cleanup Schedule',
          'automationId: scheduled-restart',
          'schedule: "0 4 * * *"',
          'timezone: "Asia/Kolkata"',
          'preWarningsMinutes: [15, 10, 5, 1]',
          'broadcastMessage: "Server restarting for memory optimization in {time}."',
        ],
      },
    ],
  },
  {
    folder: 'runners',
    files: [
      {
        id: 'indian-baremetal-yaml',
        name: 'indian-baremetal.yaml',
        path: 'runners/indian-baremetal.yaml',
        folder: 'runners',
        language: 'yaml',
        lines: [
          '# Indian Dedicated Compute Node',
          'datacenter:',
          '  city: "Mumbai"',
          '  country: "IN"',
          '  tier: "Tier-IV Datacenter"',
          'hardware:',
          '  cpu: "AMD EPYC / Intel Xeon 4.8GHz Boost"',
          '  storage: "PCIe 4.0 NVMe Enterprise SSD"',
          '  network: "10 Gbps Symmetric Uplink"',
          '  peering: "Direct Mumbai NIXI Peering"',
          'latencyAverages:',
          '  mumbai: "2-5 ms"',
          '  delhi: "18-22 ms"',
          '  bangalore: "14-17 ms"',
        ],
        annotations: {
          6: 'cpu: Single-core boost speeds ensure tick loop runs under 15ms even during TNT explosions.',
          9: 'peering: Direct low-latency routes ensure smooth multiplayer across India.',
        },
      },
      {
        id: 'network-routing-yaml',
        name: 'network-routing.yaml',
        path: 'runners/network-routing.yaml',
        folder: 'runners',
        language: 'yaml',
        lines: [
          '# L3/L4/L7 Low-Latency Game Packet Routing',
          'routingConfig:',
          '  filterMode: "stateful-minecraft-deep-packet"',
          '  bufferOptimization: true',
          '  bpfRules: "prioritize-raknet-and-handshakes"',
          '  uplinkCapacity: "10 Gbps Peering"',
        ],
      },
    ],
  },
  {
    folder: 'scorers',
    files: [
      {
        id: 'tps-eval-yaml',
        name: 'tps-eval.yaml',
        path: 'scorers/tps-eval.yaml',
        folder: 'scorers',
        language: 'yaml',
        lines: [
          '# Real-time TPS & MSPT Benchmarking Scorer',
          'scorer:',
          '  metric: "tps"',
          '  target: 20.0',
          '  toleranceMspt: 25.0',
          'alerts:',
          '  onDegradation: "auto-scale-gc-thread"',
          '  onCrash: "instant-safe-reboot"',
        ],
      },
      {
        id: 'ping-route-yaml',
        name: 'ping-route.yaml',
        path: 'scorers/ping-route.yaml',
        folder: 'scorers',
        language: 'yaml',
        lines: [
          '# Indian ISP Real-Time Latency Telemetry',
          'probes:',
          '  - isp: "Reliance Jio Fiber"',
          '    pingMs: 12',
          '    packetLoss: "0.00%"',
          '  - isp: "Airtel Xstream"',
          '    pingMs: 15',
          '    packetLoss: "0.00%"',
          '  - isp: "Tata Communications"',
          '    pingMs: 9',
          '    packetLoss: "0.00%"',
        ],
      },
    ],
  },
];

/* Root master file */
const ROOT_FILE: CodeFileItem = {
  id: 'factory-yaml',
  name: 'server-cluster.yaml',
  path: 'server-cluster.yaml',
  folder: '',
  language: 'yaml',
  lines: [
    'schemaVersion: v1alpha1',
    'name: kryin-minecraft-node',
    'description: High-frequency bare-metal Minecraft server instance (Mumbai Region).',
    'region: ap-south-mumbai',
    'runtime:',
    '  engine: paper-26.3',
    '  java: temurin-21-jdk',
    '  maxMemory: 12G',
    '  minMemory: 4G',
    'flags:',
    '  - -XX:+UseG1GC',
    '  - -XX:+ParallelRefProcEnabled',
    '  - -XX:MaxGCPauseMillis=200',
    '  - -XX:+UnlockExperimentalVMOptions',
    'network:',
    '  port: 25565',
    '  bedrockPort: 19132',
    '  uplink: 10Gbps-symmetric',
    '  firewall: stateful-packet-filter',
    'hibernation:',
    '  enabled: true',
    '  idleTimeoutSeconds: 300',
    '  wakeOnPing: true',
  ],
  annotations: {
    3: 'region: Direct hosting out of Mumbai Tier-IV datacenter for lowest Indian ping.',
    14: 'firewall: Dedicated stateful packet inspection prevents protocol drops and optimizes ping.',
  },
};

/* The 8 numbered navigation items at bottom of the code preview */
const MEDIA_NAV_ITEMS = [
  {
    ordinal: '01',
    label: 'Server definition',
    desc: 'The master definition connects datacenter nodes, memory limits, GC tuning, and network routing in one declarative file.',
    fileId: 'factory-yaml',
  },
  {
    ordinal: '02',
    label: 'Bedrock & Crossplay',
    desc: 'GeyserBridge translates Bedrock packets in real-time, allowing mobile, Xbox, PlayStation, and Switch players to join your Java world.',
    fileId: 'geyser-yml',
  },
  {
    ordinal: '03',
    label: 'Smart Hibernation',
    desc: 'Servers automatically enter a low-power hibernation state when all players disconnect, and wake automatically in under 2 minutes.',
    fileId: 'auto-sleep-yaml',
  },
  {
    ordinal: '04',
    label: 'Indian Dedicated Nodes',
    desc: 'Direct bare-metal compute in Mumbai with 10Gbps symmetric fiber and low latency across Jio, Airtel, and all Indian ISPs.',
    fileId: 'indian-baremetal-yaml',
  },
  {
    ordinal: '05',
    label: 'Paper 26.3 Optimization',
    desc: 'Pre-configured Paper global parameters for asynchronous chunk loading, villager tick limits, and smooth 20.0 TPS gameplay.',
    fileId: 'paper-global-yml',
  },
  {
    ordinal: '06',
    label: 'Entity & Spigot Tuning',
    desc: 'Fine-tuned entity activation ranges and item merge radiuses to keep heavy redstone contraptions and mob farms running lag-free.',
    fileId: 'spigot-yml',
  },
  {
    ordinal: '07',
    label: 'TPS & Latency Scorers',
    desc: 'Real-time telemetry continuously grades server health, tick time spikes, and network jitter across all active players.',
    fileId: 'tps-eval-yaml',
  },
  {
    ordinal: '08',
    label: 'Low-Latency Network Gateway',
    desc: 'Stateful packet filter gateway drops protocol anomalies and guarantees clean socket handshakes for all players.',
    fileId: 'network-routing-yaml',
  },
];

/* ------------------------------------------------------------------ */
/* RAM Plans Data (Exact 4 Plans, No Free Plan, Zero DDoS references)  */
/* ------------------------------------------------------------------ */

const RAM_PLANS = [
  {
    ram: '4 GB',
    price: 600,
    vCpu: '2 vCPU Cores',
    storage: '40 GB NVMe',
    slots: '20+ Players',
    idealFor: 'Small SMPs, vanilla survival with friends, zero lag.',
    badge: 'Starter Node',
    highlight: false,
    features: [
      'Indian Hosted Node (Mumbai)',
      'Fast · No Lag (20.0 TPS Guarantee)',
      'Low-power Smart Sleep (when empty)',
      'Auto-wake in <2 minutes on player join',
      'Java & Bedrock Crossplay Ready',
      'Console Web Access & File Manager',
      '10 Gbps Symmetric Peering Uplink',
      'High-Frequency Dedicated Slice',
    ],
  },
  {
    ram: '6 GB',
    price: 800,
    vCpu: '3 vCPU Cores',
    storage: '60 GB NVMe',
    slots: '45+ Players',
    idealFor: 'Popular SMPs, lightweight modpacks, and plugin-heavy communities.',
    badge: 'Most Popular',
    highlight: true,
    features: [
      'Indian Hosted Node (Mumbai)',
      'Fast · No Lag (High Single-Core Turbo)',
      'Low-power Smart Sleep (when empty)',
      'Auto-wake in <2 minutes on player join',
      'Geyser Crossplay (Mobile + Console)',
      '1-Click Plugin Installer (200+ Plugins)',
      'Automated Hourly NVMe Backups',
      'Low-Latency Mumbai Peering Gateway',
      'Crash Guard & Recovery Automation',
    ],
  },
  {
    ram: '10 GB',
    price: 1000,
    vCpu: '4 vCPU Cores',
    storage: '100 GB NVMe',
    slots: '100+ Players',
    idealFor: 'Heavy modpacks (ATM, Better MC), public servers, and large factions.',
    badge: 'Performance Tier',
    highlight: false,
    features: [
      'Indian Dedicated Compute Slice',
      'Fast · No Lag (Enterprise NVMe IOPS)',
      'Low-power Smart Sleep (when empty)',
      'Auto-wake in <2 minutes on player join',
      'Multi-World & Velocity Proxy Support',
      'Dedicated Reverse Proxy & Port 25565',
      'Automated Hourly NVMe Backups',
      'Priority 24/7 Discord Support',
    ],
  },
  {
    ram: '12 GB',
    price: 1500,
    vCpu: '6 vCPU Cores',
    storage: '150 GB NVMe',
    slots: 'Unlimited Slots',
    idealFor: 'Massive networks, competitive mini-games, and hardcore tech packs.',
    badge: 'Enterprise Flagship',
    highlight: false,
    features: [
      'Top-Tier Bare-Metal Hardware',
      'Fast · No Lag (Max Clock Speeds)',
      'Low-power Smart Sleep (when empty)',
      'Auto-wake in <2 minutes on player join',
      'Full Custom Java Runtime & GC Flags',
      'Dedicated IPv4 + IPv6 Subnet',
      'Unmetered 10 Gbps Symmetric Port',
      'Custom Domain & SSL Reverse Proxy',
      'VIP Dedicated Account Engineer',
    ],
  },
];

/* ------------------------------------------------------------------ */
/* FAQ Accordion Data (Zero DDoS references)                          */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS = [
  {
    q: 'Where are the server nodes hosted?',
    a: 'All our servers are deployed directly in Indian Tier-IV datacenters (Mumbai). This guarantees ultra-low ping across all Indian internet providers including Jio Fiber, Airtel Xstream, Tata, and ACT Broadband.',
  },
  {
    q: 'How does the low-power sleep and auto-wake work?',
    a: 'When all players leave the server, it automatically saves world chunks and enters a low-power hibernation state after 5 minutes of idle time. As soon as any player attempts to connect (via Java or Bedrock), our gateway detects the handshake and wakes the server in under 2 minutes.',
  },
  {
    q: 'Can console and mobile players join Java servers?',
    a: 'Yes! Every server comes with Geyser and Floodgate pre-configured. Players on PlayStation, Xbox, Nintendo Switch, Android, and iOS can connect directly using port 19132 and join Java players seamlessly in the exact same world.',
  },
  {
    q: 'Is there a free plan available?',
    a: 'No. To ensure dedicated compute performance, unthrottled CPU clocks, and zero lag, we do not operate overcrowded free tiers. Our plans start at an affordable ₹600/month for 4 GB RAM on high-frequency enterprise hardware.',
  },
  {
    q: 'Can I install custom plugins, mods, or datapacks?',
    a: 'Absolutely. You have full SFTP and web file manager access. You can upload custom server jars (Paper, Purpur, Fabric, Forge, NeoForge), install mods, configure datapacks, and tweak all configuration files directly.',
  },
  {
    q: 'What kind of support is included?',
    a: 'Every server includes instant panel access, automated backups, crash guards, and 24/7 Discord community support from our Indian engineering team.',
  },
];

/* ------------------------------------------------------------------ */
/* Cluster Matrix Cell generator (Fig. 1)                             */
/* Cluster Matrix Dimension (Fig. 1)                                  */
/* ------------------------------------------------------------------ */

const CLUSTER_COLUMNS = 28;
const CLUSTER_ROWS = 8;
const TOTAL_CELLS = CLUSTER_COLUMNS * CLUSTER_ROWS;

export default function HomePage() {
  /* Navigation dropdown state */
  /* Navigation dropdown / mobile state */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);

  /* Dynamic Animated Cluster Matrix Cell Tones */
  const [cellTones, setCellTones] = useState<string[]>(() =>
    Array.from({ length: TOTAL_CELLS }, (_, i) =>
      i % 7 === 0 || i % 11 === 0 ? 'running' : i % 5 === 0 ? 'active' : 'queued'
    )
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCellTones((prev) => {
        const next = [...prev];
        // Randomly pulse 6 to 12 cells every interval
        const changeCount = 6 + Math.floor(Math.random() * 8);
        for (let k = 0; k < changeCount; k++) {
          const idx = Math.floor(Math.random() * next.length);
          const rand = Math.random();
          next[idx] = rand > 0.65 ? 'running' : rand > 0.35 ? 'active' : 'queued';
        }
        return next;
      });
    }, 280);

    return () => clearInterval(interval);
  }, []);

  /* File Tree State */
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({
    configs: true,
    plugins: false,
    automations: false,
    runners: false,
    scorers: false,
  });
  const [activeFile, setActiveFile] = useState<CodeFileItem>(
    TREE_DATA[0].files[0] // Default to server.properties
  );
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(5);
  const [copied, setCopied] = useState(false);
  const [activeNavIndex, setActiveNavIndex] = useState(0);

  /* FAQ Accordion state */
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* Billing Toggle (Monthly / Quarterly) */
  /* Billing Cycle Selector */
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');

  /* Handle folder expand/collapse */
  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  /* Select a file */
  const selectFile = (file: CodeFileItem) => {
    setActiveFile(file);
    // Select first annotation if exists
    if (file.annotations) {
      const keys = Object.keys(file.annotations).map(Number);
      setActiveAnnotation(keys.length > 0 ? keys[0] : null);
    } else {
      setActiveAnnotation(null);
    }
  };

  /* Copy file contents */
  const handleCopyCode = () => {
    const text = activeFile.lines.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Handle media navigation ordinal click */
  const handleMediaNavClick = (fileId: string, index: number) => {
    setActiveNavIndex(index);
    if (fileId === 'factory-yaml') {
      setActiveFile(ROOT_FILE);
      if (ROOT_FILE.annotations) {
        setActiveAnnotation(3);
      }
      return;
    }
    // Search file across folders
    for (const group of TREE_DATA) {
      const found = group.files.find((f) => f.id === fileId);
      if (found) {
        // Expand that folder
        setExpandedFolders((prev) => ({ ...prev, [group.folder]: true }));
        selectFile(found);
        return;
      }
    }
  };

  return (
    <div data-ds="warp-next" className="w-page w-homepage" data-motion-reveal-root="off">
      {/* ============================================================ */}
      {/* VISUAL GRID BACKGROUND WITH LEFT & RIGHT GUIDE LINES          */}
      {/* ============================================================ */}
      <div className="w-visual-grid" data-fade="true">
        <div className="w-visual-grid-art" aria-hidden="true">
          <div className="w-visual-grid-texture">
            <div className="w-visual-grid-dots"></div>
            <div className="w-visual-grid-columns">
              <div className="w-wrap">
                {/* 7 Vertical Tracks: Span 1 is Left Line, Span 7 is Right Line */}
                <div className="w-visual-grid-tracks">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="w-visual-grid-content">
          {/* ======================================================== */}
          {/* TOP NAVBAR (EXACT WARP STRUCTURE FROM INDEX.HTML)        */}
          {/* TOP NAVBAR                                               */}
          {/* ======================================================== */}
          <nav className="w-topnav" aria-label="Primary">
            <div className="w-topnav-bar">
              <div className="w-wrap w-topnav-wrap flex items-center justify-between">
                {/* Left: Minimal Isometric Logo + KryinHost */}
                <Link
                  className="w-topnav-logo flex items-center gap-2 group select-none"
                  aria-label="KryinHost home"
                  href="/"
                >
                  <KryinLogo className="w-5 h-5 text-[#1a1522]" />
                  <span className="font-mono font-bold tracking-tight text-[17px] text-[#1a1522]">
                    KryinHost
                  </span>
                </Link>

                {/* Primary Nav Links */}
                <div className="w-topnav-links hidden md:flex items-center gap-6 font-mono text-[13px]">
                  <Link href="#configuration" className="text-[#1a1522]/80 hover:text-[#1a1522] transition-colors">
                    Features
                  </Link>
                  <Link href="#plans" className="text-[#1a1522]/80 hover:text-[#1a1522] transition-colors">
                    Plans
                  </Link>
                  <Link href="#faq" className="text-[#1a1522]/80 hover:text-[#1a1522] transition-colors">
                    FAQ
                  </Link>
                  <Link href="/dashboard" className="text-[#1a1522]/80 hover:text-[#1a1522] transition-colors">
                    ConsolePanel
                  </Link>
                </div>

                {/* Right: Console Panel & Sign In */}
                <div className="w-topnav-actions flex items-center gap-2">
                  <Link href="/login" className="w-btn w-btn-solid text-[12px] sm:text-[13px] px-3 sm:px-4 py-1.5">
                    Sign In
                  </Link>

                  {/* Mobile Burger Toggle */}
                  <button
                    type="button"
                    className="w-topnav-burger p-1.5 md:hidden"
                    aria-label="Open menu"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? (
                      <X className="w-5 h-5 text-[#1a1522]" />
                    ) : (
                      <Menu className="w-5 h-5 text-[#1a1522]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Dropdown Panel */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-white border-b border-[#1a1522]/15 px-6 py-4 space-y-3 font-mono text-[14px] shadow-lg relative z-50">
                <Link
                  href="#configuration"
                  className="block py-2 text-[#1a1522] border-b border-[#1a1522]/10"
                  onClick={() => setTimeout(() => setMobileMenuOpen(false), 80)}
                >
                  Features
                </Link>
                <Link
                  href="#plans"
                  className="block py-2 text-[#1a1522] border-b border-[#1a1522]/10"
                  onClick={() => setTimeout(() => setMobileMenuOpen(false), 80)}
                >
                  Plans
                </Link>
                <Link
                  href="#faq"
                  className="block py-2 text-[#1a1522] border-b border-[#1a1522]/10"
                  onClick={() => setTimeout(() => setMobileMenuOpen(false), 80)}
                >
                  FAQ
                </Link>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    className="w-btn w-btn-outline text-center py-2.5 w-full flex items-center justify-center font-bold"
                  >
                    ConsolePanel
                  </Link>
                  <Link
                    href="/login"
                    className="w-btn w-btn-solid text-center py-2.5 w-full flex items-center justify-center font-bold"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </nav>

          <main className="isolate overflow-clip">
            {/* ====================================================== */}
            {/* HERO SECTION                                           */}
            {/* ====================================================== */}
            <section
              className="w-hero"
              data-layout="left"
              data-scale="display"
              data-ground="fade"
              style={{ '--w-head-size': 'var(--w-display)' } as React.CSSProperties}
            >
              <div className="w-wrap">
                <div className="w-hero-body">
                  <div className="w-hero-head">
                    <h1 className="w-headline">High-performance Indian Minecraft server hosting</h1>
                    <p className="w-lead">
                      Deploy in seconds on dedicated bare-metal Mumbai nodes with automated smart hibernation, zero lag, and instant Java &amp; Bedrock cross-play.
                    </p>
                    <div className="w-hero-actions">
                      <a href="#plans" className="w-btn w-btn-solid">
                        deploy server
                      </a>
                      <Link href="/panel" className="w-btn w-btn-outline">
                        view console panel
                      </Link>
                    </div>
                  </div>
                </div>

                                {/* Hero Media: Fig. 1 Live Animated Cluster Matrix */}
                <div className="w-hero-media w-full max-w-full overflow-hidden">
                  <figure className="w-fig w-full max-w-full overflow-hidden">
                    <figcaption className="w-fig-bar">
                      <span className="w-fig-control-slot"></span>
                      <span className="w-fig-caption">[ fig. 1 — live server core cluster ]</span>
                      <span className="w-fig-control-slot" data-end="true">
                        <button
                          type="button"
                          className="w-fig-control"
                          aria-label="Cluster status pulse"
                        >
                          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        </button>
                      </span>
                    </figcaption>

                    <div className="w-fig-well w-full max-w-full overflow-hidden">
                      <div className="w-fig-figure w-full max-w-full overflow-hidden">
                        <div className="w-fig-body w-full max-w-full overflow-hidden">
                          <div className="w-fig-meta font-mono">
                            <span>[ fig. t4 · mumbai node 01 ]</span>
                            <span className="text-emerald-700 font-bold">8 × 28 · 20.0 TPS live</span>
                          </div>

                          {/* 28-Column Live Animated Cluster Matrix */}
                          <div
                            className="w-fig-plane overflow-hidden"
                            style={{ gridTemplateColumns: `repeat(${CLUSTER_COLUMNS}, minmax(0, 1fr))` }}
                          >
                            {cellTones.map((tone, i) => (
                              <button
                                key={i}
                                type="button"
                                className="w-fig-cell hover:scale-125 cursor-pointer"
                                data-tone={tone}
                                title={`Node Core #${i + 1} - 20.0 TPS (State: ${tone})`}
                              >
                                ▩
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Fig Key / Legend */}
                        <div className="w-fig-foot">
                          <div className="w-fig-key">
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#1a1522]/70">
                              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
                              Active Core Thread
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#1a1522]/70">
                              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block"></span>
                              Async Chunk I/O
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#1a1522]/70">
                              <span className="w-2.5 h-2.5 rounded-sm bg-[#1a1522]/20 inline-block"></span>
                              Standby Buffer
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </figure>
                </div>
              </div>
            </section>

                  {/* ====================================================== */}
                  {/* CONTINUOUS MOVING LOGO CAROUSEL WITH ICONS             */}
                  {/* ====================================================== */}
                  <section className="w-logos border-y border-[#1a1522]/10 py-5 bg-white overflow-hidden select-none">
                        <div className="kryin-marquee-track flex items-center">
                          {/* First Loop */}
                          {ENGINE_LOGOS.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <div
                                key={`engine-1-${idx}`}
                                className="flex items-center gap-2.5 px-8 font-mono text-[13px] font-bold text-[#1a1522] tracking-wider shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                              >
                                <Icon className="w-4 h-4 text-[#1a1522] shrink-0" />
                                <span>{item.name}</span>
                              </div>
                            );
                          })}

                          {/* Duplicated Loop for Seamless Continuous Scroll */}
                          {ENGINE_LOGOS.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <div
                                key={`engine-2-${idx}`}
                                className="flex items-center gap-2.5 px-8 font-mono text-[13px] font-bold text-[#1a1522] tracking-wider shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                              >
                                <Icon className="w-4 h-4 text-[#1a1522] shrink-0" />
                                <span>{item.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      {/* ====================================================== */}
                      {/* SECTION: YOUR SOFTWARE FACTORY, DEFINED IN CODE        */}
                      {/* SECTION: YOUR GAME SERVER, CONFIGURED IN CODE          */}
                      {/* (ID: configuration - INTERACTIVE EXPANDABLE TREE)     */}
                      {/* ====================================================== */}
                      <section className="w-section" id="configuration">
                        <div className="w-wrap">
                          <div
                            className="w-section-heading"
                            style={{ '--w-head-size': 'var(--w-headline)' } as React.CSSProperties}
                          >
                            <h2 className="w-headline">Your software factory, defined in code.</h2>
                            <h2 className="w-headline">Your game server, configured in code.</h2>
                            <p className="w-lead">
                              Factories-as-code allows for a versioned and measured approach to optimizing costs and performance of your factories.
                              Declarative configuration and browser-based file management allows for versioned, reliable control of your Minecraft server environment.
                            </p>
                            <div className="w-head-action">
                              <a className="w-btn w-btn-text" href="#plans">
                                view server plans
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="13"
                                  height="13"
                                  fill="currentColor"
                                  viewBox="0 0 256 256"
                                  aria-hidden="true"
                                >
                                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                                </svg>
                                <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                              </a>
                            </div>
                          </div>

                          {/* The Main Code & Interactive Tree Box */}
                          <div className="w-section-content">
                            <div className="w-code" data-tree="true" style={{ '--w-code-ratio': '16 / 9' } as React.CSSProperties}>
                              {/* Left Pane: Interactive Expandable File Tree */}
                              <nav className="w-code-tree" aria-label="Files">
                                <ul>
                                  {/* 1. Root factory.yaml */}
                                  {/* 1. Root Master Config File */}
                                  <li>
                                    <button
                                      type="button"
                                      className="w-code-entry"
                                      style={{ '--w-code-indent': '12px' } as React.CSSProperties}
                                      aria-current={activeFile.id === ROOT_FILE.id}
                                      onClick={() => selectFile(ROOT_FILE)}
                                    >
                                      <FileCode className="w-3.5 h-3.5" />
                                      <span>factory.yaml</span>
                                      <span>server-cluster.yaml</span>
                                    </button>
                                  </li>

                                  {/* 2. Folders with Expand / Collapse */}
                                  {TREE_DATA.map((group) => {
                                    const isOpen = expandedFolders[group.folder] ?? false;
                                    return (
                                      <li key={group.folder}>
                                        {/* Folder Header */}
                                        <button
                                          type="button"
                                          className="w-code-entry font-semibold text-[#1a1522]"
                                          style={{ '--w-code-indent': '12px' } as React.CSSProperties}
                                          aria-expanded={isOpen}
                                          onClick={() => toggleFolder(group.folder)}
                                        >
                                          {isOpen ? (
                                            <FolderOpen className="w-3.5 h-3.5 text-amber-500 flex-none" />
                                          ) : (
                                            <Folder className="w-3.5 h-3.5 text-amber-600 flex-none" />
                                          )}
                                          <span className="flex-1 text-left">{group.folder}</span>
                                          <span className="text-[10px] text-[#1a1522]/40 font-mono">
                                            {isOpen ? '▾' : '▸'}
                                          </span>
                                        </button>

                                        {/* Child Files if Expanded */}
                                        {isOpen && (
                                          <ul>
                                            {group.files.map((file) => {
                                              const isSelected = activeFile.id === file.id;
                                              return (
                                                <li key={file.id}>
                                                  <button
                                                    type="button"
                                                    className="w-code-entry hover:bg-[#1a1522]/5 transition-colors"
                                                    style={{ '--w-code-indent': '24px' } as React.CSSProperties}
                                                    aria-current={isSelected}
                                                    onClick={() => selectFile(file)}
                                                  >
                                                    <File className="w-3 h-3 text-[#1a1522]/50 flex-none" />
                                                    <span className="truncate">{file.name}</span>
                                                  </button>
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </nav>

                              {/* Right Pane: Code Preview & Annotations */}
                              <div className="w-code-pane">
                                {/* Code Bar Header */}
                                <div className="w-code-bar">
                                  <span className="w-code-path flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    {activeFile.path}
                                  </span>
                                  <div className="w-code-bar-right">
                                    <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-[#1a1522]/5 font-mono text-[#1a1522]/70">
                                      {activeFile.language}
                                    </span>
                                    <button
                                      type="button"
                                      className="w-code-copy hover:text-[#1a1522] transition-colors p-1"
                                      aria-label="Copy file contents"
                                      onClick={handleCopyCode}
                                      title="Copy code to clipboard"
                                    >
                                      {copied ? (
                                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5 text-[#1a1522]/60" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Code Body with Line Numbers & Syntax Tokens */}
                                <div className="w-code-body" role="region" aria-label={`Code for ${activeFile.name}`}>
                                  <div className="w-code-group">
                                    <span className="w-code-lines">
                                      {activeFile.lines.map((line, idx) => {
                                        const lineNum = idx + 1;
                                        const isComment = line.trim().startsWith('#');
                                        const isAnnotated = Boolean(activeFile.annotations?.[lineNum]);
                                        const isAnnotationActive = activeAnnotation === lineNum;

                                        // Parse key: value or property=value
                                        let keyPart = '';
                                        let valPart = line;
                                        if (!isComment) {
                                          if (line.includes(':')) {
                                            const cIdx = line.indexOf(':');
                                            keyPart = line.substring(0, cIdx);
                                            valPart = line.substring(cIdx);
                                          } else if (line.includes('=')) {
                                            const eqIdx = line.indexOf('=');
                                            keyPart = line.substring(0, eqIdx);
                                            valPart = line.substring(eqIdx);
                                          }
                                        }

                                        const lineMarkup = (
                                          <span
                                            className={`w-code-line ${isAnnotated ? 'cursor-pointer hover:bg-blue-50/60' : ''
                                              } ${isAnnotationActive ? 'bg-blue-50/80 font-medium' : ''}`}
                                            onClick={() => isAnnotated && setActiveAnnotation(lineNum)}
                                          >
                                            <span className="w-code-n" aria-hidden="true">
                                              {lineNum}
                                            </span>
                                            <span>
                                              {isComment ? (
                                                <span className="text-[#1a1522]/50 italic">{line}</span>
                                              ) : keyPart ? (
                                                <>
                                                  <span className="w-code-key font-semibold text-indigo-700">
                                                    {keyPart}
                                                  </span>
                                                  <span className="text-[#1a1522]">{valPart}</span>
                                                </>
                                              ) : (
                                                <span className="text-[#1a1522]">{line}</span>
                                              )}
                                            </span>
                                          </span>
                                        );

                                        if (isAnnotated) {
                                          return (
                                            <div key={idx} className="relative">
                                              <div
                                                className="w-code-annotation"
                                                data-active={isAnnotationActive}
                                              >
                                                {lineMarkup}
                                              </div>
                                              {isAnnotationActive && (
                                                <div className="ml-11 mr-4 my-1.5 p-2.5 rounded bg-blue-50 border-l-2 border-indigo-600 text-[12px] font-sans text-indigo-950 leading-relaxed shadow-sm">
                                                  <span className="font-semibold block mb-0.5 text-indigo-800">
                                                    [ Parameter Explanation ]
                                                  </span>
                                                  {activeFile.annotations![lineNum]}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }

                                        return <React.Fragment key={idx}>{lineMarkup}</React.Fragment>;
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 8 Numbered Media Navigation Cards at the Bottom */}
                            <nav className="w-media-navigation mt-8" data-presentation="code" aria-label="Configuration index">
                              <ul className="w-nav" data-numbered="true">
                                  {MEDIA_NAV_ITEMS.map((item, idx) => {
                                    const isCurrent = activeNavIndex === idx;
                                    return (
                                      <li key={item.ordinal} className="w-nav-item">
                                        <button
                                          type="button"
                                          className="w-nav-button"
                                          aria-current={isCurrent}
                                          onClick={() => handleMediaNavClick(item.fileId, idx)}
                                        >
                                          <span className="w-nav-marker" aria-hidden="true">
                                            <span className="w-nav-ordinal">{item.ordinal}</span>
                                          </span>
                                          <span className="w-nav-label font-bold text-[#1a1522]">
                                            {item.label}
                                          </span>
                                          <span className="w-nav-desc text-[12px] text-[#1a1522]/70 leading-normal">
                                            {item.desc}
                                          </span>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </nav>
                          </div>
                        </div>
                      </section>

                      {/* ====================================================== */}
                      {/* SECTION: BAKED-IN MEASUREMENT AND SELF-IMPROVEMENT     */}
                      {/* SECTION: REAL-TIME TELEMETRY AND ENGINE HEALTH         */}
                      {/* (ID: quality)                                          */}
                      {/* ====================================================== */}
                      <section className="w-section" id="quality">
                        <div className="w-wrap">
                          <div
                            className="w-section-heading"
                            style={{ '--w-head-size': 'var(--w-headline)' } as React.CSSProperties}
                          >
                            <h2 className="w-headline">Baked-in measurement and self-improvement</h2>
                            <h2 className="w-headline">Real-time telemetry and engine health</h2>
                            <p className="w-lead">
                              evals, benchmarks, and self-improvement loops drive measurable gains across your game server fleet.
                              Continuous 20.0 TPS health verification, tick-budget optimization, and low-latency Indian network routes.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            {/* Card 1: 20.0 TPS Guarantee */}
                            {/* Card 1: Stable TPS */}
                            <div className="p-6 bg-white border border-[#1a1522]/15 rounded-md flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between text-[11px] font-mono text-[#1a1522]/60 uppercase tracking-widest mb-3">
                                  <span>[ Metric · Engine Health ]</span>
                                  <span className="text-emerald-700 font-bold">Stable</span>
                                  <span className="text-emerald-700 font-bold">[ Stable TPS ]</span>
                                </div>
                                <div className="text-4xl font-mono font-bold text-[#1a1522] mb-1">
                                  20.0 <span className="text-xl font-normal text-[#1a1522]/50">TPS</span>
                                </div>
                                <p className="text-[13px] text-[#1a1522]/70 leading-relaxed">
                                  Zero tick drops. Paper’s asynchronous event dispatcher guarantees consistent 50ms tick budgets.
                                </p>
                              </div>
                              <div className="mt-6 pt-4 border-t border-[#1a1522]/10 font-mono text-[11px] text-[#1a1522]/60 flex items-center justify-between">
                                <span>MSPT Average</span>
                                <span className="text-[#1a1522] font-semibold">11.4 ms</span>
                              </div>
                            </div>

                            {/* Card 2: Low-Latency Peering */}
                            {/* Card 2: India Network · Low Ping */}
                            <div className="p-6 bg-white border border-[#1a1522]/15 rounded-md flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between text-[11px] font-mono text-[#1a1522]/60 uppercase tracking-widest mb-3">
                                  <span>[ Network · Indian Ping ]</span>
                                  <span>[ India Network · Low Ping ]</span>
                                  <span className="text-emerald-700 font-bold">Direct Fiber</span>
                                </div>
                                <div className="text-4xl font-mono font-bold text-[#1a1522] mb-1">
                                  &lt;18 <span className="text-xl font-normal text-[#1a1522]/50">ms</span>
                                </div>
                                <p className="text-[13px] text-[#1a1522]/70 leading-relaxed">
                                  Indian Hosted Server in Mumbai with direct interconnects to Jio Fiber, Airtel Xstream, and ACT.
                                  Direct fiber routes in Mumbai with ultra-low latency peering across Jio Fiber, Airtel Xstream, and ACT.
                                </p>
                              </div>
                              <div className="mt-6 pt-4 border-t border-[#1a1522]/10 font-mono text-[11px] text-[#1a1522]/60 flex items-center justify-between">
                                <span>Packet Loss Rate</span>
                                <span className="text-emerald-700 font-semibold">0.00%</span>
                              </div>
                            </div>

                            {/* Card 3: Auto-Sleep & Wake */}
                            {/* Card 3: Smart Power Hibernation */}
                            <div className="p-6 bg-white border border-[#1a1522]/15 rounded-md flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between text-[11px] font-mono text-[#1a1522]/60 uppercase tracking-widest mb-3">
                                  <span>[ Smart Power · Hibernation ]</span>
                                  <span className="text-indigo-700 font-bold">Auto-Wake</span>
                                </div>
                                <div className="text-4xl font-mono font-bold text-[#1a1522] mb-1">
                                  &lt;90 <span className="text-xl font-normal text-[#1a1522]/50">sec</span>
                                </div>
                                <p className="text-[13px] text-[#1a1522]/70 leading-relaxed">
                                  Sleeps when empty. As soon as any player connects, the server wakes automatically in under 2 minutes.
                                </p>
                              </div>
                              <div className="mt-6 pt-4 border-t border-[#1a1522]/10 font-mono text-[11px] text-[#1a1522]/60 flex items-center justify-between">
                                <span>Sleep Timeout</span>
                                <span className="text-[#1a1522] font-semibold">5 mins idle</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* ====================================================== */}
                      {/* SECTION: CONTROL YOUR CODING AGENT CHAOS               */}
                      {/* SECTION: UNIFIED CONSOLE & LIVE SERVER CONTROL         */}
                      {/* (ID: governance)                                       */}
                      {/* ====================================================== */}
                      <section className="w-section" id="governance">
                        <div className="w-wrap">
                          <div
                            className="w-section-heading"
                            style={{ '--w-head-size': 'var(--w-headline)' } as React.CSSProperties}
                          >
                            <h2 className="w-headline">Control your coding agent chaos</h2>
                            <h2 className="w-headline">Unified console &amp; live server control</h2>
                            <p className="w-lead">
                              Unified web terminal, live player stream, automated crash recovery, and full OP command control.
                              Real-time terminal stream, live player session tracking, automated crash recovery, and instant command execution.
                            </p>
                          </div>

                          {/* Animated Real-Time Minecraft Console Preview */}
                          {/* Animated Real-Time Minecraft Console Preview (Compact Size) */}
                          <div className="mt-8">
                            <AnimatedConsolePreview />
                          </div>
                        </div>
                      </section>

                      {/* ====================================================== */}
                      {/* SECTION: USE WARP EVERYWHERE (PLANS INSTEAD OF THIS)   */}
                      {/* (ID: plans - EXACT 4 RAM PLANS, NO FREE PLAN)          */}
                      {/* SECTION: DEDICATED INDIAN SERVER PLANS                 */}
                      {/* (ID: plans - EXACT 4 RAM PLANS, ZERO DDOS MENTIONS)    */}
                      {/* ====================================================== */}
                      <section className="w-section" id="plans">
                        <div className="w-wrap">
                          <div
                            className="w-section-heading"
                            style={{ '--w-head-size': 'var(--w-headline)' } as React.CSSProperties}
                          >
                            <h2 className="w-headline">Use Warp everywhere (plans instead of this)</h2>
                            <h2 className="w-headline">Dedicated Indian Server Plans</h2>
                            <p className="w-lead">
                              Fast · No Lag · Indian hosted servers on dedicated high-frequency compute. Hibernates safely when idle, auto-wakes on join.
                            </p>
                          </div>

                          {/* Billing Cycle Selector */}
                          <div className="flex items-center justify-center gap-2 my-8 font-mono text-[13px]">
                            <button
                              type="button"
                              onClick={() => setBillingCycle('monthly')}
                              className={`px-4 py-1.5 rounded transition-all cursor-pointer ${billingCycle === 'monthly'
                                ? 'bg-[#1a1522] text-white font-bold'
                                : 'bg-[#1a1522]/5 text-[#1a1522] hover:bg-[#1a1522]/10'
                                }`}
                            >
                              Monthly Billing
                            </button>
                            <button
                              type="button"
                              onClick={() => setBillingCycle('quarterly')}
                              className={`px-4 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer ${billingCycle === 'quarterly'
                                ? 'bg-[#1a1522] text-white font-bold'
                                : 'bg-[#1a1522]/5 text-[#1a1522] hover:bg-[#1a1522]/10'
                                }`}
                            >
                              Quarterly (Save 15%)
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                SAVE
                              </span>
                            </button>
                          </div>

                          {/* 4 RAM Plans Grid (No Free Plan) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {RAM_PLANS.map((plan) => {
                              const price =
                                billingCycle === 'quarterly'
                                  ? Math.round(plan.price * 0.85)
                                  : plan.price;

                              return (
                                <div
                                  key={plan.ram}
                                  className={`flex flex-col justify-between p-6 bg-white border rounded-md transition-all ${plan.highlight
                                    ? 'border-indigo-600 shadow-lg ring-1 ring-indigo-600/30'
                                    : 'border-[#1a1522]/15 hover:border-[#1a1522]/40'
                                    }`}
                                >
                                  <div>
                                    {/* Plan Badge */}
                                    <div className="flex items-center justify-between font-mono text-[11px] mb-3">
                                      <span
                                        className={`px-2 py-0.5 rounded font-bold uppercase ${plan.highlight
                                          ? 'bg-indigo-100 text-indigo-800'
                                          : 'bg-[#1a1522]/5 text-[#1a1522]/70'
                                          }`}
                                      >
                                        {plan.badge}
                                      </span>
                                      <span className="text-[#1a1522]/50">{plan.vCpu}</span>
                                    </div>

                                    {/* RAM Title */}
                                    <h3 className="font-mono text-2xl font-bold text-[#1a1522] mb-1">
                                      {plan.ram}
                                    </h3>
                                    <p className="text-[12px] text-[#1a1522]/70 mb-4 min-h-[36px]">
                                      {plan.idealFor}
                                    </p>

                                    {/* Price */}
                                    <div className="py-3 border-y border-[#1a1522]/10 mb-4 font-mono">
                                      <span className="text-3xl font-bold text-[#1a1522]">
                                        ₹{price.toLocaleString()}
                                      </span>
                                      <span className="text-[12px] text-[#1a1522]/60 font-sans ml-1">
                                        / month
                                      </span>
                                    </div>

                                    {/* Features List */}
                                    <ul className="space-y-2.5 text-[12px] text-[#1a1522]/80 mb-6 font-sans">
                                      {plan.features.map((feat, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-2">
                                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-none mt-0.5" />
                                          <span>{feat}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* CTA Button */}
                                  <div className="pt-2">
                                    <Link
                                      href="/login"
                                      className={`w-full py-2.5 text-center font-mono text-[13px] font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${plan.highlight
                                        ? 'bg-[#eef17c] text-[#1a1522] hover:bg-[#e4e86a]'
                                        : 'bg-[#1a1522] text-white hover:bg-[#2b2438]'
                                        }`}
                                    >
                                      Deploy {plan.ram} Node
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Low-Power Hibernation Disclaimer */}
                          <div className="mt-8 p-4 bg-[#fbf9fe] border border-[#1a1522]/10 rounded-md font-mono text-[12px] text-[#1a1522]/70 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-indigo-600 flex-none" />
                            <span>
                              <strong>Smart Energy Architecture:</strong> Servers enter a low-power hibernation state when all players disconnect. As soon as someone attempts to join, it wakes automatically in under 2 minutes.
                            </span>
                          </div>
                        </div>
                      </section>

                      {/* ====================================================== */}
                      {/* SECTION: FREQUENTLY ASKED QUESTIONS                    */}
                      {/* (ID: faq)                                              */}
                      {/* ====================================================== */}
                      <section className="w-section" id="faq">
                        <div className="w-wrap">
                          <div
                            className="w-section-heading"
                            style={{ '--w-head-size': 'var(--w-headline)' } as React.CSSProperties}
                          >
                            <h2 className="w-headline">Frequently asked questions</h2>
                            <p className="w-lead">
                              Clear answers about Indian server locations, crossplay, hibernation, and hardware specs.
                            </p>
                          </div>

                          <div className="mt-8 divide-y divide-[#1a1522]/10 border-y border-[#1a1522]/10">
                            {FAQ_ITEMS.map((item, idx) => {
                              const isOpen = openFaq === idx;
                              return (
                                <div key={idx} className="py-4">
                                  <button
                                    type="button"
                                    className="w-full text-left flex items-center justify-between font-mono text-[15px] font-bold text-[#1a1522] hover:text-indigo-600 transition-colors cursor-pointer"
                                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                                  >
                                    <span>{item.q}</span>
                                    <span className="font-mono text-lg ml-4">
                                      {isOpen ? '[-]' : '[+]'}
                                    </span>
                                  </button>
                                  {isOpen && (
                                    <div className="mt-3 font-sans text-[14px] text-[#1a1522]/70 leading-relaxed pr-8">
                                      {item.a}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    </main>

                    {/* ======================================================== */}
                    {/* FOOTER (WARP FOOTER STRUCTURE)                           */}
                    {/* FOOTER                                                   */}
                    {/* ======================================================== */}
                    <footer className="w-footer border-t border-[#1a1522]/10 py-12 bg-white">
                      <div className="w-wrap">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 font-mono text-[12px]">
                          {/* Brand */}
                          {/* Brand with Minimal Logo */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-3">
                              <KryinLogo className="w-5 h-5 text-[#1a1522]" />
                              <span className="font-bold text-[16px] text-[#1a1522]">KryinHost</span>
                            </div>
                            <p className="font-sans text-[13px] text-[#1a1522]/60 max-w-sm leading-relaxed mb-4">
                              High-frequency game server infrastructure. Indian bare-metal compute, instant Java &amp; Bedrock cross-play, enterprise uptime and low latency.
                            </p>
                            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              All Indian Nodes Operational
                            </div>
                          </div>

                          {/* Products */}
                          <div>
                            <h4 className="font-bold text-[#1a1522] uppercase tracking-wider text-[11px] mb-3">
                              Products
                            </h4>
                            <ul className="space-y-2 text-[#1a1522]/70 font-sans">
                              <li>
                                <a href="#plans" className="hover:text-[#1a1522]">
                                  4 GB Starter Node
                                </a>
                              </li>
                              <li>
                                <a href="#plans" className="hover:text-[#1a1522]">
                                  6 GB Popular Node
                                </a>
                              </li>
                              <li>
                                <a href="#plans" className="hover:text-[#1a1522]">
                                  10 GB Performance
                                </a>
                              </li>
                              <li>
                                <a href="#plans" className="hover:text-[#1a1522]">
                                  12 GB Flagship
                                </a>
                              </li>
                            </ul>
                          </div>

                          {/* Features */}
                          <div>
                            <h4 className="font-bold text-[#1a1522] uppercase tracking-wider text-[11px] mb-3">
                              Features
                            </h4>
                            <ul className="space-y-2 text-[#1a1522]/70 font-sans">
                              <li>
                                <a href="#configuration" className="hover:text-[#1a1522]">
                                  Geyser Crossplay
                                </a>
                              </li>
                              <li>
                                <a href="#configuration" className="hover:text-[#1a1522]">
                                  Paper 26.3
                                </a>
                              </li>
                              <li>
                                <a href="#quality" className="hover:text-[#1a1522]">
                                  Smart Sleep Mode
                                </a>
                              </li>
                              <li>
                                <a href="#quality" className="hover:text-[#1a1522]">
                                  Auto-Restart Recovery
                                </a>
                              </li>
                            </ul>
                          </div>

                          {/* Management */}
                          {/* Console */}
                          <div>
                            <h4 className="font-bold text-[#1a1522] uppercase tracking-wider text-[11px] mb-3">
                              Console
                            </h4>
                            <ul className="space-y-2 text-[#1a1522]/70 font-sans">
                              <li>
                                <Link href="/login" className="hover:text-[#1a1522]">
                                  Sign In
                                </Link>
                              </li>
                              <li>
                                <Link href="/panel" className="hover:text-[#1a1522]">
                                  Live Web Terminal
                                </Link>
                              </li>
                              <li>
                                <a href="#faq" className="hover:text-[#1a1522]">
                                  Server FAQ
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Bottom Copyright */}
                        <div className="mt-12 pt-6 border-t border-[#1a1522]/10 flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-[#1a1522]/50 gap-4">
                          <span>© {new Date().getFullYear()} KryinHost Inc. All rights reserved.</span>
                          <span>Tier-IV Mumbai Datacenter · 10Gbps Uplink</span>
                        </div>
                      </div>
                    </footer>
                  </div>
              </div>
            </div>
            );
}
