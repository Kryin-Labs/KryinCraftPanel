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
    <html lang="en" data-color-mode="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Azeret+Mono:ital,wght@0,300..900;1,300..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-[#1a1522] antialiased">
        {children}
      </body>
    </html>
  );
}
