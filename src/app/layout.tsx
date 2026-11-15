import type { Metadata } from 'next';
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
        {/* Monetag Tag Zone 12266260 */}
        <script
          src="https://5gvci.com/act/files/tag.min.js?z=12266260"
          data-cfasync="false"
          async
        />
        {/* Monetag In-Page Push Zone 12266230 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='12266230',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />
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
