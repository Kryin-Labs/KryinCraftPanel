'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles, Server, Check, Copy, Flame, Users, Megaphone } from 'lucide-react';

export const AdSidebar: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyShowcaseIp = () => {
    navigator.clipboard.writeText('play.example.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-full xl:w-72 2xl:w-80 shrink-0 space-y-4 font-mono text-[#1a1522]">
      {/* Primary Server Promotion & Showcase Card */}
      <div className="rounded-2xl bg-white border border-[#1a1522]/10 p-5 shadow-xs overflow-hidden flex flex-col justify-between space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between text-[10px] text-[#1a1522]/50 pb-2 border-b border-[#1a1522]/10 uppercase tracking-wider font-bold">
          <span className="flex items-center gap-1.5 text-blue-700">
            <Megaphone className="w-3.5 h-3.5 text-blue-600" />
            Advertisement
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
            SHOWCASE
          </span>
        </div>

        {/* Content Body */}
        <div className="space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#1a1522] tracking-tight">
              Promote Your Server
            </h3>
            <p className="text-[11px] text-[#1a1522]/70 leading-relaxed font-sans mt-1">
              Want your Minecraft SMP, mini-games, or community server featured here? Showcase your server to hundreds of active Indian players.
            </p>
          </div>

          {/* Perks list */}
          <div className="space-y-1.5 pt-1 text-[11px] font-sans text-[#1a1522]/80">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              <span>Prime In-Panel Dashboard Visibility</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              <span>Java &amp; Bedrock Player Audience</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              <span>Direct Join IP &amp; Discord Links</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-[#1a1522]/10">
          <Link
            href="mailto:contact@kryinhost.com?subject=Minecraft%20Server%20Showcase%20Inquiry"
            className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <span>Promote Server</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Featured Community Server Spotlight (Sticky in view) */}
      <div className="xl:sticky xl:top-6 rounded-2xl bg-white border border-[#1a1522]/10 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-[10px] text-[#1a1522]/50 pb-2 border-b border-[#1a1522]/10 uppercase tracking-wider font-bold">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <Flame className="w-3.5 h-3.5 text-emerald-600" />
            Example Server
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            SAMPLE
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
              O
            </div>
            <span className="font-bold text-xs text-[#1a1522]">Oakwood Survival</span>
          </div>
          <p className="text-[11px] text-[#1a1522]/60 font-sans">
            Survival SMP · Paper · Java &amp; Bedrock Crossplay
          </p>
        </div>

        <div className="p-2 rounded-lg bg-[#f8f9fd] border border-[#1a1522]/10 flex items-center justify-between gap-2 text-xs">
          <span className="font-mono text-[11px] text-[#1a1522] truncate">
            play.example.com
          </span>
          <button
            onClick={handleCopyShowcaseIp}
            className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
            title="Copy IP"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
