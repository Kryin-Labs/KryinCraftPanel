import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KryinCraftPanel — Minecraft Server Management',
  description: 'Lightweight, secure, mobile-first Minecraft server management panel for ROG Phone 5s Termux server.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0d14] text-slate-100 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
