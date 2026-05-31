import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/context/ThemeContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KuroBox',
  description:
    'Universal Kanban & Spreadsheet Engine // 職人仕様の生産性向上システム',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kurobox.vercel.app',
  ),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      {
        url: '/Kuroboxfavicon/White/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/Kuroboxfavicon/Black/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/Kuroboxfavicon/White/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/Kuroboxfavicon/Black/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: [
      {
        url: '/Kuroboxfavicon/Icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      { rel: 'icon', url: '/Kuroboxfavicon/Black/favicon.ico' },
    ],
  },
  openGraph: {
    title: 'KuroBox — Universal Kanban & Spreadsheet Engine',
    description:
      'A refined, high-craftsmanship workspace built with Next.js 15 and Supabase. Tailor custom layouts with absolute geometric flexibility.',
    url: '/',
    siteName: 'KuroBox',
    images: [
      {
        url: '/Kuroboxfavicon/Icons/KuroBanner.png',
        width: 1200,
        height: 630,
        alt: 'KuroBox — Minimalist Workspace Interface Display Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KuroBox — Universal Kanban & Spreadsheet Engine',
    description: 'Modern Japanese Minimalist x Tactical Zen Workspace.',
    images: ['/Kuroboxfavicon/Icons/KuroBanner.png'],
  },
};

// Inline script that reads localStorage before first paint to prevent theme flash.
const INIT_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('kurobox-theme');var v=['stealth','radiation','overdrive','sakura','matcha','shinto','panel-x'];if(t&&v.indexOf(t)!==-1)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className="bg-black text-white font-sans antialiased">
        {/* Anti-flicker: sets data-theme synchronously before any content paints */}
        <script dangerouslySetInnerHTML={{ __html: INIT_THEME_SCRIPT }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
