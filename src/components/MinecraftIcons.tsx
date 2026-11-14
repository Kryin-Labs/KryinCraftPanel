'use client';

import React from 'react';
import Image from 'next/image';
import { getItemIconUrl } from '@/lib/minecraftAssets';

// Authentic Minecraft Heart Icon (Full, Half, Empty)
export function MinecraftHeart({ state }: { state: 'full' | 'half' | 'empty' }) {
  if (state === 'full') {
    return (
      <svg
        className="w-4 h-4 shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
        viewBox="0 0 9 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        {/* Dark border */}
        <path
          d="M2 0h2v1H2V0zM5 0h2v1H5V0zM1 1h1v1H1V1zM4 1h1v1H4V1zM7 1h1v1H7V1zM0 2h1v3H0V2zM8 2h1v3H8V2zM1 5h1v1H1V5zM7 5h1v1H7V5zM2 6h1v1H2V6zM6 6h1v1H6V6zM3 7h1v1H3V7zM5 7h1v1H5V7zM4 8h1v1H4V8z"
          fill="#1b1212"
        />
        {/* Red Fill */}
        <path
          d="M2 1h2v3H2V1zM5 1h2v3H5V1zM1 2h7v3H1V2zM2 5h5v1H2V5zM3 6h3v1H3V6zM4 7h1v1H4V7z"
          fill="#e11d48"
        />
        {/* Dark Red Shadow */}
        <path
          d="M2 4h1v1H2V4zM6 4h1v1H6V4zM3 5h3v1H3V5zM4 6h1v1H4V6z"
          fill="#9f1239"
        />
        {/* White Highlight */}
        <path d="M2 2h1v1H2V2z" fill="#ffffff" />
      </svg>
    );
  }

  if (state === 'half') {
    return (
      <svg
        className="w-4 h-4 shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
        viewBox="0 0 9 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        {/* Border */}
        <path
          d="M2 0h2v1H2V0zM5 0h2v1H5V0zM1 1h1v1H1V1zM4 1h1v1H4V1zM7 1h1v1H7V1zM0 2h1v3H0V2zM8 2h1v3H8V2zM1 5h1v1H1V5zM7 5h1v1H7V5zM2 6h1v1H2V6zM6 6h1v1H6V6zM3 7h1v1H3V7zM5 7h1v1H5V7zM4 8h1v1H4V8z"
          fill="#1b1212"
        />
        {/* Background empty */}
        <path
          d="M5 1h2v3H5V1zM5 2h3v3H5V2zM5 5h2v1H5V5zM5 6h1v1H5V6z"
          fill="#374151"
        />
        {/* Left half Red Fill */}
        <path
          d="M2 1h2v3H2V1zM1 2h3v3H1V2zM2 5h2v1H2V5zM3 6h1v1H3V6zM4 7h1v1H4V7z"
          fill="#e11d48"
        />
        {/* Highlight */}
        <path d="M2 2h1v1H2V2z" fill="#ffffff" />
      </svg>
    );
  }

  // Empty heart
  return (
    <svg
      className="w-4 h-4 shrink-0 opacity-40"
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <path
        d="M2 0h2v1H2V0zM5 0h2v1H5V0zM1 1h1v1H1V1zM4 1h1v1H4V1zM7 1h1v1H7V1zM0 2h1v3H0V2zM8 2h1v3H8V2zM1 5h1v1H1V5zM7 5h1v1H7V5zM2 6h1v1H2V6zM6 6h1v1H6V6zM3 7h1v1H3V7zM5 7h1v1H5V7zM4 8h1v1H4V8z"
        fill="#1b1212"
      />
      <path
        d="M2 1h2v3H2V1zM5 1h2v3H5V1zM1 2h7v3H1V2zM2 5h5v1H2V5zM3 6h3v1H3V6zM4 7h1v1H4V7z"
        fill="#374151"
      />
    </svg>
  );
}

// Authentic Minecraft Drumstick / Hunger Icon (Full, Half, Empty)
export function MinecraftDrumstick({ state }: { state: 'full' | 'half' | 'empty' }) {
  if (state === 'full') {
    return (
      <svg
        className="w-4 h-4 shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
        viewBox="0 0 9 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        {/* Dark Outline */}
        <path
          d="M3 0h3v1H3V0zM2 1h1v1H2V1zM6 1h2v1H6V1zM1 2h1v2H1V2zM8 2h1v3H8V2zM1 4h1v2H1V4zM7 5h1v2H7V5zM2 6h2v1H2V6zM4 7h3v1H4V7zM3 8h2v1H3V8z"
          fill="#1b1212"
        />
        {/* Meat Fill */}
        <path
          d="M3 1h3v2H3V1zM2 2h6v2H2V2zM2 4h5v2H2V4zM4 6h2v1H4V6z"
          fill="#c2410c"
        />
        {/* Highlight */}
        <path d="M4 2h2v1H4V2zM3 3h1v1H3V3z" fill="#f97316" />
        {/* Bone */}
        <path d="M6 6h1v1H6V6zM7 7h1v1H7V7zM5 7h1v1H5V7z" fill="#e5e7eb" />
      </svg>
    );
  }

  if (state === 'half') {
    return (
      <svg
        className="w-4 h-4 shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
        viewBox="0 0 9 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        <path
          d="M3 0h3v1H3V0zM2 1h1v1H2V1zM6 1h2v1H6V1zM1 2h1v2H1V2zM8 2h1v3H8V2zM1 4h1v2H1V4zM7 5h1v2H7V5zM2 6h2v1H2V6zM4 7h3v1H4V7zM3 8h2v1H3V8z"
          fill="#1b1212"
        />
        {/* Half Meat */}
        <path d="M4 1h2v2H4V1zM4 2h3v2H4V2zM4 4h3v2H4V4z" fill="#c2410c" />
        {/* Empty left side */}
        <path d="M2 2h2v3H2V2z" fill="#374151" />
        {/* Bone */}
        <path d="M6 6h1v1H6V6zM7 7h1v1H7V7z" fill="#e5e7eb" />
      </svg>
    );
  }

  // Empty drumstick
  return (
    <svg
      className="w-4 h-4 shrink-0 opacity-40"
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <path
        d="M3 0h3v1H3V0zM2 1h1v1H2V1zM6 1h2v1H6V1zM1 2h1v2H1V2zM8 2h1v3H8V2zM1 4h1v2H1V4zM7 5h1v2H7V5zM2 6h2v1H2V6zM4 7h3v1H4V7zM3 8h2v1H3V8z"
        fill="#1b1212"
      />
      <path
        d="M3 1h3v2H3V1zM2 2h6v2H2V2zM2 4h5v2H2V4zM4 6h2v1H4V6z"
        fill="#374151"
      />
    </svg>
  );
}
