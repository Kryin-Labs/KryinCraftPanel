'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles, Zap } from 'lucide-react';

interface AdBannerProps {
  slotId?: string;
  format?: 'rectangle' | 'vertical' | 'responsive';
  client?: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId,
  format = 'rectangle',
  client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
  className = '',
}) => {
  useEffect(() => {
    // If Google AdSense is also configured
    try {
      if (typeof window !== 'undefined' && client && slotId) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  }, [client, slotId]);

  return (
    <div
      className={`rounded-2xl bg-white border border-[#1a1522]/10 p-3.5 shadow-xs overflow-hidden flex flex-col font-mono text-[#1a1522] ${className}`}
    >
      {/* Ad Header Label */}
      <div className="flex items-center justify-between text-[10px] text-[#1a1522]/40 pb-2 mb-2 border-b border-[#1a1522]/5 uppercase tracking-wider font-bold">
        <span>Advertisement</span>
        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 font-semibold">
          Sponsored
        </span>
      </div>

      {/* Ad Content Area */}
      {client && slotId ? (
        <div className="w-full flex justify-center items-center overflow-hidden min-h-[250px]">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={client}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        /* Native Sponsor & Ad Zone Container */
        <div className="flex flex-col justify-between p-4 rounded-xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border border-blue-100/80 min-h-[220px]">
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Partner Showcase
              </span>
              <h4 className="text-sm font-bold text-[#1a1522] mt-0.5 leading-snug">
                Featured Partner &amp; In-Page Sponsor
              </h4>
            </div>
            <p className="text-[11px] text-[#1a1522]/70 leading-relaxed font-sans">
              Discover verified Minecraft community mods, Indian hosting nodes, and custom plugins.
            </p>
          </div>

          <div className="pt-3 border-t border-blue-100/60 mt-2">
            <Link
              href="mailto:contact@kryinhost.com?subject=Advertise%20on%20KryinCraftPanel"
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Promote Server</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdSidebar: React.FC = () => {
  return (
    <aside className="w-full xl:w-72 2xl:w-80 shrink-0 space-y-4">
      {/* Top Sidebar Ad (300x250 / Responsive) */}
      <AdBanner
        slotId={process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR_TOP}
        className="w-full"
      />

      {/* Pro / Ad-Free Upgrade Card */}
      <div className="rounded-2xl bg-white border border-[#1a1522]/10 p-4 shadow-xs font-mono space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1a1522] block">Ad-Free Experience</span>
            <span className="text-[10px] text-[#1a1522]/50 block">KryinPro Operator</span>
          </div>
        </div>
        <p className="text-[11px] text-[#1a1522]/70 font-sans leading-relaxed">
          Upgrade to KryinPro to permanently remove ads, unlock instant low-latency Indian tunnels, and get 24/7 dedicated node uptime.
        </p>
        <Link
          href="/#plans"
          className="w-full py-2 rounded-lg bg-[#f8f9fd] hover:bg-blue-50 text-[#1a1522] hover:text-blue-700 border border-[#1a1522]/10 hover:border-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all block text-center"
        >
          View Pro Plans
        </Link>
      </div>

      {/* Bottom Sticky Ad Slot */}
      <div className="xl:sticky xl:top-6 space-y-4">
        <AdBanner
          slotId={process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR_BOTTOM}
          className="w-full"
        />
      </div>
    </aside>
  );
};
