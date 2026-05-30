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
  title: 'KuroBox — Dynamic Kanban & Table Engine',
  description:
    'A flexible, developer-centric productivity tool for tracking any structured dataset.',
};

// Inline script that reads localStorage before first paint to prevent theme flash.
const INIT_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('kurobox-theme');var v=['stealth','radiation','overdrive','whiteout'];if(t&&v.indexOf(t)!==-1)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

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
