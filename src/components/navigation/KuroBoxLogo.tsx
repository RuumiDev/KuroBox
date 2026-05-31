'use client';

import { useTheme } from '@/lib/context/ThemeContext';

const LIGHT_THEMES = new Set(['sakura', 'matcha', 'shinto', 'panel-x']);

interface KuroBoxLogoProps {
  /** Display size in px — maps to both w/h. Default 32. */
  size?: number;
  className?: string;
}

export default function KuroBoxLogo({ size = 32, className = '' }: KuroBoxLogoProps) {
  const { theme } = useTheme();
  // KuroBlack.png = dark ink icon → use on light backgrounds
  // KuroWhite.png = white icon → use on dark backgrounds
  const src = LIGHT_THEMES.has(theme)
    ? '/icons/KuroBlack.png'
    : '/icons/KuroWhite.png';

  return (
    <img
      src={src}
      alt="KuroBox 力B"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}
