import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KryinHost — High Performance Minecraft Server Hosting',
  description: 'Enterprise-grade, low-latency Minecraft server hosting. Java 26 and Bedrock cross-play, 1-click modpacks, anti-DDoS protection, and custom management control panel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0e1117] text-zinc-100 min-h-screen antialiased selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
