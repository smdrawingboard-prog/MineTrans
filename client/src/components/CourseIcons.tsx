import React from 'react';

export type IconKey =
  | 'chain'
  | 'alert'
  | 'target'
  | 'flame'
  | 'chart'
  | 'clock'
  | 'trend-down'
  | 'coins'
  | 'link'
  | 'shield'
  | 'calendar'
  | 'sigma'
  | 'map-pin'
  | 'gear'
  | 'wrench'
  | 'mountain'
  | 'droplet'
  | 'bolt'
  | 'truck'
  | 'package'
  | 'shield-check'
  | 'users'
  | 'document'
  | 'umbrella'
  | 'refresh'
  | 'compass';

const paths: Record<IconKey, React.ReactNode> = {
  chain: (
    <>
      <path d="M9 12h6" />
      <rect x="3" y="8" width="6" height="8" rx="2" />
      <rect x="15" y="8" width="6" height="8" rx="2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 20h20L12 3z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </>
  ),
  flame: (
    <path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c0-1.5-1-2-1-3.5 2 1 3 3.5 3 5.5a5 5 0 0 1-10 0C7 8 10 6 12 2z" />
  ),
  chart: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  'trend-down': (
    <>
      <path d="M3 6l7 7 4-4 7 8" />
      <path d="M21 12v5h-5" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="8" cy="8" rx="6" ry="3.5" />
      <path d="M2 8v4c0 1.9 2.7 3.5 6 3.5s6-1.6 6-3.5V8" />
      <ellipse cx="16" cy="15" rx="6" ry="3.5" />
    </>
  ),
  link: (
    <>
      <path d="M9 15l6-6" />
      <path d="M13 5l1.5-1.5a3.5 3.5 0 0 1 5 5L18 10" />
      <path d="M11 19l-1.5 1.5a3.5 3.5 0 0 1-5-5L6 14" />
    </>
  ),
  shield: <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  sigma: <path d="M18 5H6l6 7-6 7h12" />,
  'map-pin': (
    <>
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.9-1.5-2-3.4-2.3.6a7.6 7.6 0 0 0-2.6-1.5L14 2h-4l-.4 2.7a7.6 7.6 0 0 0-2.6 1.5l-2.3-.6-2 3.4L4.6 10.5a7.6 7.6 0 0 0 0 3L2.7 15l2 3.4 2.3-.6a7.6 7.6 0 0 0 2.6 1.5L10 22h4l.4-2.7a7.6 7.6 0 0 0 2.6-1.5l2.3.6 2-3.4-1.9-1.5z" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-3-3-3 3z" />
  ),
  mountain: (
    <>
      <path d="M3 20l6-11 4 6 2-3 6 8H3z" />
      <path d="M15 9l-1.5 2" />
    </>
  ),
  droplet: <path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z" />,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
  truck: (
    <>
      <rect x="1" y="7" width="13" height="10" rx="1" />
      <path d="M14 10h4l3 3v4h-7z" />
      <circle cx="6" cy="18.5" r="1.6" />
      <circle cx="17.5" cy="18.5" r="1.6" />
    </>
  ),
  package: (
    <>
      <path d="M21 8 12 3 3 8l9 5 9-5z" />
      <path d="M3 8v9l9 5 9-5V8" />
      <path d="M12 13v9" />
    </>
  ),
  'shield-check': (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5S15.5 16.5 15.5 20" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.8 14.6c2.4.4 4.7 2.2 4.7 5.4" />
    </>
  ),
  document: (
    <>
      <path d="M6 2h9l5 5v15H6z" />
      <path d="M15 2v5h5" />
      <path d="M9 13h6M9 17h6" />
    </>
  ),
  umbrella: (
    <>
      <path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z" />
      <path d="M12 12v7a2 2 0 0 1-4 0" />
      <path d="M12 2v1" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-6 2 2-6 6-2z" />
    </>
  ),
};

export const CourseIcon: React.FC<{ icon: IconKey; size?: number; color?: string }> = ({
  icon,
  size = 22,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.4}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {paths[icon]}
  </svg>
);
