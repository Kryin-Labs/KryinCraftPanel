'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* File Structure Data for "Your software factory, defined in code"    */
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
          9: 'entity-activation-range: Keeps AI processing restricted to near players, preserving 20.0 TPS in heavy mob farms.',
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
          3: 'bedrock.port: Default UDP port 19132 allows Bedrock edition console and mobile players to join seamlessly.',
          10: 'floodgate.key-file: Enables passwordless Bedrock login with official Microsoft Xbox Live gamertags.',
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
          '# ViaVersion Multi-Protocol Protocol Gateway',
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
          9: 'enter-low-power-hibernate: Keeps RAM state hot while putting compute cores into idle sleep.',
          11: 'targetWakeTimeSeconds: Automatically boots the server back to active state in under 90 seconds upon join attempt.',
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
          '  ddosMitigation: "2.5+ Tbps Indian Core Edge"',
          'latencyAverages:',
          '  mumbai: "2-5 ms"',
          '  delhi: "18-22 ms"',
          '  bangalore: "14-17 ms"',
        ],
        annotations: {
          6: 'cpu: Single-core boost speeds ensure tick loop runs under 15ms even during TNT explosions.',
          9: 'ddosMitigation: High-capacity scrubber network absorbs volumetric UDP floods without packet loss.',
        },
      },
      {
        id: 'ddos-shield-yaml',
        name: 'ddos-shield.yaml',
        path: 'runners/ddos-shield.yaml',
        folder: 'runners',
        language: 'yaml',
        lines: [
          '# L3/L4/L7 Game-Specific Anti-DDoS Mitigation',
          'shieldConfig:',
          '  filterMode: "stateful-minecraft-deep-packet"',
          '  mitigateSynFloods: true',
          '  mitigateUdpAmp: true',
          '  bpfRules: "drop-non-raknet-and-handshakes"',
          '  protectionCapacity: "2.5 Tbps"',
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
          '# Real-Time 20.0 TPS Stability Guard',
          'metrics:',
          '  sampleIntervalSeconds: 1',
          '  minAcceptableTps: 19.8',
          '  targetTps: 20.0',
          'alerts:',
          '  tickSpikeMs: 50',
          '  actionOnDegrade: "throttle-mob-spawning"',
        ],
      },
      {
        id: 'ping-route-yaml',
        name: 'ping-route.yaml',
        path: 'scorers/ping-route.yaml',
        folder: 'scorers',
        language: 'yaml',
        lines: [
          '# Indian ISP Direct Peering Quality Scorer',
          'routes:',
          '  - isp: "Jio Fiber"',
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
  name: 'factory.yaml',
  path: 'factory.yaml',
  folder: '',
  language: 'yaml',
  lines: [
    'schemaVersion: v1alpha1',
    'name: kryin-minecraft-factory',
    'description: High-frequency bare-metal Minecraft server factory (Indian Region).',
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
    '  antiDDoS: 2.5Tbps-inline-shield',
    'hibernation:',
    '  enabled: true',
    '  idleTimeoutSeconds: 300',
    '  wakeOnPing: true',
  ],
  annotations: {
    3: 'region: Direct hosting out of Mumbai Tier-IV datacenter for lowest Indian ping.',
    14: 'antiDDoS: Dedicated game packet inspection mitigates DDoS attacks without disconnecting players.',
  },
};

/* The 8 numbered navigation items at bottom of the code preview */
const MEDIA_NAV_ITEMS = [
  {
    ordinal: '01',
    label: 'Factory definition',
    desc: 'The Factory definition connects datacenter nodes, memory ceilings, GC tuning, and network routing into a single repeatable file.',
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
    label: 'DDoS Shield Capacity',
    desc: 'Inline stateful packet filters instantly drop non-Minecraft protocol anomalies and UDP amplification floods up to 2.5 Tbps.',
    fileId: 'ddos-shield-yaml',
  },
];

/* ------------------------------------------------------------------ */
/* RAM Plans Data (Exact 4 Plans, No Free Plan)                        */
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
      '2.5+ Tbps Anti-DDoS Protection',
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
      '2.5+ Tbps Anti-DDoS Protection',
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
/* FAQ Accordion Data                                                 */
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
    q: 'What kind of DDoS protection is included?',
    a: 'Every node is backed by 2.5+ Tbps automated edge mitigation. Our filter specifically validates Minecraft protocol handshakes, dropping volumetric UDP amplification and SYN attacks without kicking legitimate players.',
  },
];

/* ------------------------------------------------------------------ */
/* Cluster Matrix Cell generator (Fig. 1)                             */
/* ------------------------------------------------------------------ */

const CLUSTER_COLUMNS = 28;
const CLUSTER_ROWS = 8;

export default function HomePage() {
  /* Navigation dropdown state */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);

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
          {/* ======================================================== */}
          <nav className="w-topnav" aria-label="Primary">
            <div className="w-topnav-bar">
              <div className="w-wrap w-topnav-wrap">
                {/* Warp SVG Geometric Mark + Brand Logo */}
                <Link className="w-topnav-logo" aria-label="KryinHost home" href="/">
                  <svg viewBox="0 0 509 179" fill="currentColor" className="h-7 w-auto mr-2.5" aria-label="KryinHost">
                    <path d="M75.5914 42.9736C75.8366 41.9547 76.7457 41.2368 77.7906 41.2368H132.069C141.143 41.2368 148.5 48.8619 148.5 58.2679L148.303 125.423C148.303 134.829 140.946 142.454 131.872 142.454H54.5231C53.0589 142.454 51.9804 141.081 52.324 139.652L75.5914 42.9736Z"></path>
                    <path d="M60.7975 60.372C61.1308 58.9478 60.0535 57.584 58.595 57.584H16.2911C7.29375 57.584 0 65.2091 0 74.615V141.968C0 151.373 7.33141 159.566 16.3287 159.566H70.1259C71.1721 159.566 72.0818 158.846 72.3258 157.826L73.4693 153.044C73.8105 151.617 72.7323 150.246 71.2694 150.246H42.6144C41.1559 150.246 40.0786 148.881 40.412 147.457L60.7975 60.372Z"></path>
                  </svg>
                  <span className="font-mono font-bold tracking-tight text-[17px] text-[#1a1522]">
                    KryinHost
                  </span>
                </Link>

                {/* Primary Nav Links */}
                <div className="w-topnav-links">
                  {/* Products Dropdown */}
                  <div className="relative group">
                    <button
                      type="button"
                      className="w-topnav-top"
                      onClick={() =>
                        setActiveNavDropdown(activeNavDropdown === 'products' ? null : 'products')
                      }
                    >
                      Products
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"></path>
                      </svg>
                    </button>
                    {activeNavDropdown === 'products' && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-[#1a1522]/15 shadow-xl rounded-md p-3 z-50 text-[13px] font-mono">
                        <Link
                          href="#plans"
                          className="block p-2 hover:bg-[#1a1522]/5 rounded text-[#1a1522]"
                          onClick={() => setActiveNavDropdown(null)}
                        >
                          <div className="font-bold">Minecraft Game Servers</div>
                          <div className="text-[11px] text-[#1a1522]/60">Paper, Purpur, Fabric, Forge</div>
                        </Link>
                        <Link
                          href="#configuration"
                          className="block p-2 hover:bg-[#1a1522]/5 rounded text-[#1a1522]"
                          onClick={() => setActiveNavDropdown(null)}
                        >
                          <div className="font-bold">Bedrock & Console Crossplay</div>
                          <div className="text-[11px] text-[#1a1522]/60">GeyserBridge & Floodgate sync</div>
                        </Link>
                        <Link
                          href="#quality"
                          className="block p-2 hover:bg-[#1a1522]/5 rounded text-[#1a1522]"
                          onClick={() => setActiveNavDropdown(null)}
                        >
                          <div className="font-bold">2.5 Tbps DDoS Shield</div>
                          <div className="text-[11px] text-[#1a1522]/60">Automatic L3/L4/L7 scrubber</div>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Infrastructure Dropdown */}
                  <div className="relative group">
                    <button
                      type="button"
                      className="w-topnav-top"
                      onClick={() =>
                        setActiveNavDropdown(activeNavDropdown === 'infra' ? null : 'infra')
                      }
                    >
                      Infrastructure
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"></path>
                      </svg>
                    </button>
                    {activeNavDropdown === 'infra' && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-[#1a1522]/15 shadow-xl rounded-md p-3 z-50 text-[13px] font-mono">
                        <div className="p-2 border-b border-[#1a1522]/10 mb-1">
                          <div className="font-bold text-[#1a1522]">Mumbai Tier-IV Datacenter</div>
                          <div className="text-[11px] text-[#1a1522]/60">Direct fiber peering with Jio & Airtel</div>
                        </div>
                        <div className="p-2 border-b border-[#1a1522]/10 mb-1">
                          <div className="font-bold text-[#1a1522]">High-Frequency Bare-Metal</div>
                          <div className="text-[11px] text-[#1a1522]/60">Up to 4.8 GHz single-core burst</div>
                        </div>
                        <div className="p-2">
                          <div className="font-bold text-[#1a1522]">Automated Sleep Architecture</div>
                          <div className="text-[11px] text-[#1a1522]/60">Auto-wakes in &lt;2 minutes</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <a className="w-topnav-top" href="#plans">
                    Pricing
                  </a>

                  {/* Docs / Console */}
                  <a className="w-topnav-top" href="#configuration">
                    Docs
                  </a>
                </div>

                {/* Right Topnav Actions */}
                <div className="w-topnav-actions">
                  <div className="w-topnav-item w-topnav-signin">
                    <Link className="w-topnav-top" href="/login">
                      Sign in
                    </Link>
                  </div>

                  <Link className="w-btn w-btn-demo w-topnav-demo" href="/panel">
                    Console Panel
                  </Link>

                  <div className="w-topnav-item">
                    <a href="#plans" className="w-btn w-btn-solid">
                      Deploy Server
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
                        <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"></path>
                      </svg>
                    </a>
                  </div>

                  {/* Mobile Burger Toggle */}
                  <button
                    type="button"
                    className="w-topnav-burger"
                    aria-label="Open menu"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? (
                      <X className="w-5 h-5 text-[#1a1522]" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
                        <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Dropdown Panel */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-white border-b border-[#1a1522]/15 px-6 py-4 space-y-3 font-mono text-[14px]">
                <Link
                  href="#plans"
                  className="block py-2 text-[#1a1522] border-b border-[#1a1522]/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  RAM Plans (from ₹600/mo)
                </Link>
                <Link
                  href="#configuration"
                  className="block py-2 text-[#1a1522] border-b border-[#1a1522]/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Configuration &amp; Code
                </Link>
                <Link
                  href="#quality"
                  className="block py-2 text-[#1a1522] border-b border-[#1a1522]/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  20.0 TPS Telemetry
                </Link>
                <Link
                  href="#faq"
                  className="block py-2 text-[#1a1522] border-b border-[#1a1522]/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Frequently Asked Questions
                </Link>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="w-btn w-btn-outline text-center py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <a
                    href="#plans"
                    className="w-btn w-btn-solid text-center py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Deploy Server
                  </a>
                </div>
              </div>
            )}
          </nav>

          <main className="isolate overflow-clip">
            {/* ====================================================== */}
            {/* HERO SECTION (EXACT WARP HERO WITH FIG. 1 MATRIX)       */}
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
                    <h1 className="w-headline">The software factory infrastructure platform</h1>
                    <p className="w-lead">
                      build on Kryin: factories as code, bare-metal high-frequency compute, with evals, automated hibernation, and instant cross-play built in.
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

                <div className="w-hero-media">
                  <figure className="w-fig">
                    <figcaption className="w-fig-bar">
                      <span className="w-fig-control-slot"></span>
                      <span className="w-fig-caption">[ fig. 1 — the factory / cluster ]</span>
                      <span className="w-fig-control-slot" data-end="true">
                        <button
                          type="button"
                          className="w-fig-control"
                          aria-label="Refresh node cluster"
                        >
                          <Activity className="w-3.5 h-3.5 text-[#1a1522]/60" />
                        </button>
                      </span>
                    </figcaption>

                    <div className="w-fig-well">
                      <div className="w-fig-figure">
                        <div className="w-fig-body">
                          <div className="w-fig-meta font-mono">
                            <span>[ fig. t4 · mumbai node 01 ]</span>
                            <span className="text-emerald-700 font-bold">8 × 28 · 20.0 TPS live</span>
                          </div>

                          {/* 28 Column Interactive Cluster Matrix */}
                          <div
                            className="w-fig-plane"
                            style={{ gridTemplateColumns: `repeat(${CLUSTER_COLUMNS}, minmax(0, 1fr))` }}
                          >
                            {Array.from({ length: CLUSTER_ROWS * CLUSTER_COLUMNS }).map((_, i) => {
                              const isGreen = i % 7 === 0 || i % 11 === 0 || i % 19 === 0;
                              const isBlue = i % 5 === 0;
                              const tone = isGreen ? 'running' : isBlue ? 'active' : 'queued';
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  className="w-fig-cell hover:scale-125 transition-transform"
                                  data-tone={tone}
                                  title={`Core Thread #${i + 1} - 20.0 TPS - 0% loss`}
                                >
                                  ▩
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Fig Key / Legend */}
                        <div className="w-fig-foot">
                          <div className="w-fig-key">
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#1a1522]/70">
                              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
                              Active World Thread
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#1a1522]/70">
                              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block"></span>
                              Async Chunk I/O
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#1a1522]/70">
                              <span className="w-2.5 h-2.5 rounded-sm bg-[#1a1522]/20 inline-block"></span>
                              Idle / Standby
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
            {/* LOGOS MARQUEE                                          */}
            {/* ====================================================== */}
            <section className="w-logos border-y border-[#1a1522]/10 py-6 bg-white">
              <div className="w-wrap">
                <div className="flex flex-wrap items-center justify-between gap-6 opacity-70 grayscale hover:grayscale-0 transition-all font-mono text-[13px] font-semibold text-[#1a1522]">
                  <span>PAPER 26.3</span>
                  <span>PURPUR ENGINE</span>
                  <span>VELOCITY PROXY</span>
                  <span>GEYSER-MC</span>
                  <span>FLOODGATE</span>
                  <span>VIAVERSION</span>
                  <span>LUCKPERMS</span>
                  <span>TATA / JIO FIBER DIRECT</span>
                </div>
              </div>
            </section>

            {/* ====================================================== */}
            {/* SECTION: YOUR SOFTWARE FACTORY, DEFINED IN CODE        */}
            {/* (ID: configuration - INTERACTIVE EXPANDABLE TREE)     */}
            {/* ====================================================== */}
            <section className="w-section" id="configuration">
              <div className="w-wrap">
                <div
                  className="w-section-heading"
                  style={{ '--w-head-size': 'var(--w-headline)' } as React.CSSProperties}
                >
                  <h2 className="w-headline">Your software factory, defined in code.</h2>
                  <p className="w-lead">
                    Factories-as-code allows for a versioned and measured approach to optimizing costs and performance of your factories.
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
                                  className={`w-code-line ${
                                    isAnnotated ? 'cursor-pointer hover:bg-blue-50/60' : ''
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
                  <nav className="w-media-navigation mt-8" data-presentation="code" aria-label="Factory configuration">
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
            {/* (ID: quality)                                          */}
            {/* ====================================================== */}
            <section className="w-section" id="quality">
              <div className="w-wrap">
                <div
                  className="w-section-heading"
                  style={{ '--w-head-size': 'var(--w-headline)' } as React.CSSProperties}
                >
                  <h2 className="w-headline">Baked-in measurement and self-improvement</h2>
                  <p className="w-lead">
                    evals, benchmarks, and self-improvement loops drive measurable gains across your game server fleet.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {/* Card 1: 20.0 TPS Guarantee */}
                  <div className="p-6 bg-white border border-[#1a1522]/15 rounded-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#1a1522]/60 uppercase tracking-widest mb-3">
                        <span>[ Metric · Engine Health ]</span>
                        <span className="text-emerald-700 font-bold">Stable</span>
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
                  <div className="p-6 bg-white border border-[#1a1522]/15 rounded-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#1a1522]/60 uppercase tracking-widest mb-3">
                        <span>[ Network · Indian Ping ]</span>
                        <span className="text-emerald-700 font-bold">Direct Fiber</span>
                      </div>
                      <div className="text-4xl font-mono font-bold text-[#1a1522] mb-1">
                        &lt;18 <span className="text-xl font-normal text-[#1a1522]/50">ms</span>
                      </div>
                      <p className="text-[13px] text-[#1a1522]/70 leading-relaxed">
                        Indian Hosted Server in Mumbai with direct interconnects to Jio Fiber, Airtel Xstream, and ACT.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#1a1522]/10 font-mono text-[11px] text-[#1a1522]/60 flex items-center justify-between">
                      <span>Packet Loss Rate</span>
                      <span className="text-emerald-700 font-semibold">0.00%</span>
                    </div>
                  </div>

                  {/* Card 3: Auto-Sleep & Wake */}
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
            {/* (ID: governance)                                       */}
            {/* ====================================================== */}
            <section className="w-section" id="governance">
              <div className="w-wrap">
                <div
                  className="w-section-heading"
                  style={{ '--w-head-size': 'var(--w-headline)' } as React.CSSProperties}
                >
                  <h2 className="w-headline">Control your coding agent chaos</h2>
                  <p className="w-lead">
                    Unified web terminal, live player stream, automated crash recovery, and full OP command control.
                  </p>
                </div>

                {/* Animated Real-Time Minecraft Console Preview */}
                <div className="mt-8">
                  <AnimatedConsolePreview />
                </div>
              </div>
            </section>

            {/* ====================================================== */}
            {/* SECTION: USE WARP EVERYWHERE (PLANS INSTEAD OF THIS)   */}
            {/* (ID: plans - EXACT 4 RAM PLANS, NO FREE PLAN)          */}
            {/* ====================================================== */}
            <section className="w-section" id="plans">
              <div className="w-wrap">
                <div
                  className="w-section-heading"
                  style={{ '--w-head-size': 'var(--w-headline)' } as React.CSSProperties}
                >
                  <h2 className="w-headline">Use Warp everywhere (plans instead of this)</h2>
                  <p className="w-lead">
                    Fast · No Lag · Indian hosted servers on dedicated high-frequency compute. Hibernates safely when idle, auto-wakes on join.
                  </p>
                </div>

                {/* Billing Cycle Selector */}
                <div className="flex items-center justify-center gap-2 my-8 font-mono text-[13px]">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-1.5 rounded transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-[#1a1522] text-white font-bold'
                        : 'bg-[#1a1522]/5 text-[#1a1522] hover:bg-[#1a1522]/10'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('quarterly')}
                    className={`px-4 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                      billingCycle === 'quarterly'
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
                        className={`flex flex-col justify-between p-6 bg-white border rounded-md transition-all ${
                          plan.highlight
                            ? 'border-indigo-600 shadow-lg ring-1 ring-indigo-600/30'
                            : 'border-[#1a1522]/15 hover:border-[#1a1522]/40'
                        }`}
                      >
                        <div>
                          {/* Plan Badge */}
                          <div className="flex items-center justify-between font-mono text-[11px] mb-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold uppercase ${
                                plan.highlight
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
                            className={`w-full py-2.5 text-center font-mono text-[13px] font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${
                              plan.highlight
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
                          className="w-full text-left flex items-center justify-between font-mono text-[15px] font-bold text-[#1a1522] hover:text-indigo-600 transition-colors"
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
          {/* ======================================================== */}
          <footer className="w-footer border-t border-[#1a1522]/10 py-12 bg-white">
            <div className="w-wrap">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8 font-mono text-[12px]">
                {/* Brand */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-[16px] text-[#1a1522]">KryinHost</span>
                  </div>
                  <p className="font-sans text-[13px] text-[#1a1522]/60 max-w-sm leading-relaxed mb-4">
                    High-frequency game server infrastructure. Indian bare-metal compute, instant Java &amp; Bedrock cross-play, and 2.5+ Tbps DDoS mitigation.
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
                        Anti-DDoS Scrubbing
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Management */}
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
