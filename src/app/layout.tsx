import type { Metadata } from 'next';
import { ServerCapacityProvider } from '@/components/ServerCapacity';
import './globals.css';

export const metadata: Metadata = {
  title: 'KryinHost — High-Performance Minecraft Server Hosting',
  description: 'Enterprise Indian game server infrastructure. High-frequency compute, instant Java and Bedrock cross-play, and modern browser console management.',
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
        <ServerCapacityProvider>{children}</ServerCapacityProvider>
      </body>
    </html>
  );
}
