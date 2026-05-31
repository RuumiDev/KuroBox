'use client';

import { useTheme } from '@/lib/context/ThemeContext';

const LIGHT_THEMES = new Set(['sakura', 'matcha', 'shinto', 'panel-x']);

interface KuroBoxLogoProps {
  size?: number;
  className?: string;
}

export default function KuroBoxLogo({ size = 28, className = '' }: KuroBoxLogoProps) {
  const { theme } = useTheme();
  // Dark icon (Black folder) = for light bg themes; White icon = for dark bg themes
  const src = LIGHT_THEMES.has(theme)
    ? '/icons/dark/favicon-32x32.png'
    : '/icons/light/favicon-32x32.png';

  return (
    <img
      src={src}
      alt="KuroBox 力B"
      width={size}
      height={size}
      className={`rounded-sm object-contain ${className}`}
    />
  );
}
