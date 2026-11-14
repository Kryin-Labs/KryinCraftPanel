'use client';

import React, { useState } from 'react';
import {
  Network,
  Copy,
  Check,
  Wifi,
  Globe,
  Radio,
  Server,
  Layers,
  Info,
  HelpCircle,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

export default function ConnectionsPage() {
  const { tunnel, serverInfo } = useServerStore();
  const [copiedJavaPublic, setCopiedJavaPublic] = useState(false);
  const [copiedBedrockPublic, setCopiedBedrockPublic] = useState(false);
  const [copiedJavaLocal, setCopiedJavaLocal] = useState(false);
  const [copiedBedrockLocal, setCopiedBedrockLocal] = useState(false);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const javaPublicAddress = `${tunnel.java.publicHost}:${tunnel.java.publicPort}`;
  const bedrockPublicAddress = `${tunnel.bedrock.publicHost}:${tunnel.bedrock.publicPort}`;
  const javaLocalAddress = `${tunnel.java.localIp}:${tunnel.java.localPort}`;
  const bedrockLocalAddress = `${tunnel.bedrock.localIp}:${tunnel.bedrock.localPort}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-400" />
          Server Connections & Ports
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Dual-protocol network endpoints: Java Edition (TCP) and Geyser-Spigot Bedrock Edition (UDP).
        </p>
      </div>

      {/* Primary Cards: Java vs Bedrock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Java Edition Card */}
        <div className="p-6 rounded-2xl bg-[#111722] border border-blue-900/40 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                ☕
              </div>
              <div>
                <h2 className="font-bold text-base text-white">Java Edition</h2>
                <p className="text-xs text-slate-400">PC / Mac / Linux Clients</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              TCP PROTOCOL
            </span>
          </div>

          {/* Public Connection */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Public Internet Address (Via Tunnel)
            </span>
            <div className="p-3 bg-[#0a0d14] rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-sm text-white font-bold">{javaPublicAddress}</span>
                <span className="text-[10px] text-slate-500 block">Host + Port</span>
              </div>
              <button
                onClick={() => copyToClipboard(javaPublicAddress, setCopiedJavaPublic)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
              >
                {copiedJavaPublic ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJavaPublic ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Local LAN Connection */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              Local Wi-Fi Address (TP-Link AP)
            </span>
            <div className="p-3 bg-[#0a0d14] rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-sm text-slate-200">{javaLocalAddress}</span>
                <span className="text-[10px] text-emerald-400 block font-medium">Zero-latency direct LAN</span>
              </div>
              <button
                onClick={() => copyToClipboard(javaLocalAddress, setCopiedJavaLocal)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Copy local address"
              >
                {copiedJavaLocal ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bedrock Edition Card */}
        <div className="p-6 rounded-2xl bg-[#111722] border border-emerald-900/40 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                📱
              </div>
              <div>
                <h2 className="font-bold text-base text-white">Bedrock Edition</h2>
                <p className="text-xs text-slate-400">Mobile / Console / Windows 10/11</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              UDP PROTOCOL
            </span>
          </div>

          {/* Public Bedrock Connection */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Public Internet Address (Geyser Tunnel)
            </span>
            <div className="p-3 bg-[#0a0d14] rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-sm text-white font-bold">{bedrockPublicAddress}</span>
                <span className="text-[10px] text-slate-500 block">Server IP + Port 19132</span>
              </div>
              <button
                onClick={() => copyToClipboard(bedrockPublicAddress, setCopiedBedrockPublic)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
              >
                {copiedBedrockPublic ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBedrockPublic ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Local Bedrock Connection */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              Local Wi-Fi Address (Bedrock LAN)
            </span>
            <div className="p-3 bg-[#0a0d14] rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-sm text-slate-200">{bedrockLocalAddress}</span>
                <span className="text-[10px] text-emerald-400 block font-medium">Broadcasts to Friends LAN</span>
              </div>
              <button
                onClick={() => copyToClipboard(bedrockLocalAddress, setCopiedBedrockLocal)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Copy local address"
              >
                {copiedBedrockLocal ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Network Architecture Clarifications */}
      <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          Network Topology & Protocol Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              JioFiber CGNAT & Tunnels
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              JioFiber operates behind Carrier-Grade NAT (CGNAT), making inbound port-forwarding unavailable. Public players reach the server via an outbound tunnel (such as Playit.gg) without requiring router modifications.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Geyser-Spigot Translation
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Geyser listens on UDP port <code className="text-emerald-300 font-mono">19132</code> and translates Bedrock packets in-memory directly to Paper Java port <code className="text-blue-300 font-mono">127.0.0.1:25565</code> with zero packet duplication.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              Dynamic IP Resolution
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The phone Wi-Fi address (<code className="text-slate-200 font-mono">192.168.0.164</code>) is detected dynamically by the Termux agent on each heartbeat. No IP addresses are hardcoded into production code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
