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
    'A flexible, developer-centric productivity tool for tracking any structured dataset.',
  icons: {
    icon: [
      { url: '/icons/light/favicon-32x32.png', media: '(prefers-color-scheme: dark)', sizes: '32x32', type: 'image/png' },
      { url: '/icons/dark/favicon-32x32.png', media: '(prefers-color-scheme: light)', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/light/apple-touch-icon.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icons/dark/apple-touch-icon.png', media: '(prefers-color-scheme: light)' },
    ],
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
