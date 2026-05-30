import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy named colors (kept for backward compat)
        'cyber-yellow': '#FFDE4D',
        'hot-orange': '#FF5F00',
        // Semantic theme tokens — driven by CSS custom properties
        'kb-bg':           'var(--kb-bg)',
        'kb-surface':      'var(--kb-surface)',
        'kb-surface-alt':  'var(--kb-surface-alt)',
        'kb-border':       'var(--kb-border)',
        'kb-accent':       'var(--kb-accent)',
        'kb-accent-hover': 'var(--kb-accent-hover)',
        'kb-accent-fg':    'var(--kb-accent-fg)',
        'kb-text':         'var(--kb-text)',
        'kb-text-muted':   'var(--kb-text-muted)',
        'kb-text-dim':     'var(--kb-text-dim)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'theme-drop': 'themeDropIn 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        themeDropIn: {
          '0%':   { opacity: '0', transform: 'translateY(-6px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0)   scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
