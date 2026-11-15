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
        {/* Monetag In-Page Push (Pretty) Zone 12266297 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='12266297',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />
        {/* Enforce In-Page Push anchor to Bottom-Right */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const repositionAds = () => {
                  document.querySelectorAll('body > div, body div').forEach(el => {
                    const style = el.getAttribute('style') || '';
                    if (style.includes('fixed') && (style.includes('top:') || style.includes('top :'))) {
                      if (el.offsetWidth > 160 && el.offsetHeight > 40 && el.offsetWidth < 550) {
                        el.style.setProperty('top', 'auto', 'important');
                        el.style.setProperty('bottom', '24px', 'important');
                        el.style.setProperty('right', '24px', 'important');
                      }
                    }
                  });
                };
                setInterval(repositionAds, 500);
                window.addEventListener('load', repositionAds);
              }
            `,
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
