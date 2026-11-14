import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KryinHost — High-Performance Minecraft Server Hosting',
  description: 'Enterprise game server infrastructure. Instant Java and Bedrock cross-play, 2.5+ Tbps Anti-DDoS, and modern web management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-[#17191c] min-h-screen antialiased selection:bg-[#fbe1d1] selection:text-[#5d2a1a]">
        {children}
      </body>
    </html>
  );
}
