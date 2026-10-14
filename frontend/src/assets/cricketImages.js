/**
 * frontend/src/assets/cricketImages.js
 * Crisp, high-contrast cricket illustrations and thumbnail SVGs
 * designed to match the iplt20.com sports visual aesthetic.
 * Fully embedded data-URIs / SVGs ensuring 100% offline reliability.
 */

// 1. Hero Cricket Action Visual
export const heroCricketBanner = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 680" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#0a193d"/>
      <stop offset="40%" stopColor="#122a63"/>
      <stop offset="100%" stopColor="#1e3a8a"/>
    </linearGradient>
    <radialGradient id="floodLight" cx="0.5" cy="0.1" r="0.8">
      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45"/>
      <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.15"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#fbbf24"/>
      <stop offset="100%" stopColor="#d97706"/>
    </linearGradient>
    <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#f43f5e"/>
      <stop offset="100%" stopColor="#be123c"/>
    </linearGradient>
    <linearGradient id="turfGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0f172a"/>
      <stop offset="100%" stopColor="#020617"/>
    </linearGradient>
  </defs>

  <!-- Stadium Background & Floodlights -->
  <rect width="1200" height="680" fill="url(#skyGrad)"/>
  <rect width="1200" height="680" fill="url(#floodLight)"/>

  <!-- Stadium Stand Arcs -->
  <path d="M 0 380 Q 600 240 1200 380 L 1200 680 L 0 680 Z" fill="url(#turfGrad)" opacity="0.95"/>
  <path d="M 0 440 Q 600 320 1200 440" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8 6" opacity="0.3"/>
  <path d="M 0 490 Q 600 380 1200 490" stroke="#f59e0b" stroke-width="1.5" opacity="0.25"/>

  <!-- Light Towers -->
  <g opacity="0.75">
    <circle cx="180" cy="120" r="45" fill="#ffffff" opacity="0.15"/>
    <circle cx="180" cy="120" r="15" fill="#ffffff" opacity="0.8"/>
    <line x1="180" y1="120" x2="180" y2="400" stroke="#38bdf8" stroke-width="4" opacity="0.4"/>
    
    <circle cx="1020" cy="120" r="45" fill="#ffffff" opacity="0.15"/>
    <circle cx="1020" cy="120" r="15" fill="#ffffff" opacity="0.8"/>
    <line x1="1020" y1="120" x2="1020" y2="400" stroke="#38bdf8" stroke-width="4" opacity="0.4"/>
  </g>

  <!-- Cricket Wickets / Stumps -->
  <g transform="translate(600, 390)">
    <rect x="-24" y="-70" width="8" height="70" rx="3" fill="#fde047" opacity="0.85"/>
    <rect x="-4" y="-70" width="8" height="70" rx="3" fill="#fde047" opacity="0.85"/>
    <rect x="16" y="-70" width="8" height="70" rx="3" fill="#fde047" opacity="0.85"/>
    <rect x="-28" y="-76" width="56" height="6" rx="2" fill="#fbbf24"/>
  </g>

  <!-- Dynamic Flying Cricket Ball with Seam & Glow Streak -->
  <g>
    <!-- Motion streaks -->
    <path d="M 220 540 Q 420 320 780 260" stroke="#38bdf8" stroke-width="6" fill="none" opacity="0.5" stroke-linecap="round"/>
    <path d="M 240 550 Q 440 330 790 265" stroke="#f43f5e" stroke-width="4" fill="none" opacity="0.4" stroke-linecap="round"/>
    <!-- The Red Leather Ball -->
    <circle cx="800" cy="260" r="34" fill="url(#redGrad)" filter="drop-shadow(0 0 20px #f43f5e)"/>
    <path d="M 772 245 Q 800 260 828 275" stroke="#ffffff" stroke-width="3" fill="none" stroke-dasharray="3 2" opacity="0.9"/>
    <circle cx="788" cy="248" r="6" fill="#ffffff" opacity="0.5"/>
  </g>

  <!-- Batsman Graphic Silhouette (Power Cover Drive) -->
  <g transform="translate(420, 240)">
    <!-- Bat -->
    <rect x="60" y="80" width="14" height="110" rx="5" fill="#e2e8f0" transform="rotate(-38 60 80)"/>
    <!-- Arms & Body Silhouette in dynamic gold/white -->
    <circle cx="95" cy="55" r="22" fill="#f8fafc" opacity="0.95"/>
    <!-- Helmet visor -->
    <path d="M 105 52 L 122 55 L 110 65 Z" fill="#38bdf8"/>
    <!-- Torso -->
    <path d="M 75 75 Q 100 80 120 120 L 95 180 L 65 130 Z" fill="#0284c7" opacity="0.9"/>
    <!-- Legs in batting stance -->
    <path d="M 95 180 L 140 270 L 170 270" stroke="#ffffff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 75 170 L 35 250 L 10 250" stroke="#cbd5e1" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Tournament Geometric Confetti & Sparks -->
  <polygon points="120,480 135,460 140,490" fill="#38bdf8" opacity="0.7"/>
  <polygon points="980,220 1000,205 990,235" fill="#fbbf24" opacity="0.8"/>
  <polygon points="1060,420 1075,400 1080,430" fill="#f43f5e" opacity="0.6"/>
  <polygon points="320,180 335,160 340,190" fill="#10b981" opacity="0.65"/>
</svg>
`)}`;

// 2. Right Column Thumbnail: Team Champions (MI / CSK)
export const thumbChampions = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
  <defs>
    <linearGradient id="bgMI" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#004BA0"/>
      <stop offset="100%" stopColor="#0b1b3d"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#FDB913"/>
      <stop offset="100%" stopColor="#d97706"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" fill="url(#bgMI)"/>
  <!-- Trophy Silhouette -->
  <g transform="translate(160, 90) scale(0.85)">
    <path d="M -30 -50 L 30 -50 L 25 0 Q 0 45 -25 0 Z" fill="url(#gold)"/>
    <path d="M -45 -40 Q -65 -20 -30 0" stroke="url(#gold)" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M 45 -40 Q 65 -20 30 0" stroke="url(#gold)" stroke-width="7" fill="none" stroke-linecap="round"/>
    <rect x="-10" y="25" width="20" height="30" fill="url(#gold)"/>
    <rect x="-35" y="55" width="70" height="14" rx="3" fill="#cbd5e1"/>
  </g>
  <!-- Sparkles -->
  <circle cx="80" cy="50" r="3" fill="#FDB913"/>
  <circle cx="240" cy="60" r="4" fill="#38bdf8"/>
  <circle cx="220" cy="130" r="3" fill="#ffffff"/>
</svg>
`)}`;

// 3. Right Column Thumbnail: Toss Coin
export const thumbToss = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
  <defs>
    <linearGradient id="bgToss" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#1e1b4b"/>
      <stop offset="100%" stopColor="#0f172a"/>
    </linearGradient>
    <linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#fef08a"/>
      <stop offset="50%" stopColor="#f59e0b"/>
      <stop offset="100%" stopColor="#b45309"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" fill="url(#bgToss)"/>
  <!-- Spinning Gold Coin in 3D perspective -->
  <g transform="translate(160, 90)">
    <ellipse cx="0" cy="0" rx="65" ry="60" fill="url(#coinGrad)"/>
    <ellipse cx="0" cy="0" rx="55" ry="50" fill="none" stroke="#78350f" stroke-width="3"/>
    <text x="0" y="8" font-size="28" font-weight="900" font-family="sans-serif" text-anchor="middle" fill="#78350f">IPL</text>
    <!-- Motion trails -->
    <path d="M -80 30 Q 0 -60 80 30" stroke="#fde047" stroke-width="3" fill="none" stroke-dasharray="4 4" opacity="0.7"/>
  </g>
</svg>
`)}`;

// 4. Right Column Thumbnail: Defend vs Chase
export const thumbChasing = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
  <defs>
    <linearGradient id="bgChase" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#0369a1"/>
      <stop offset="100%" stopColor="#0c192c"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" fill="url(#bgChase)"/>
  <!-- Target Board & Ball -->
  <g transform="translate(160, 90)">
    <circle cx="0" cy="0" r="50" fill="none" stroke="#38bdf8" stroke-width="4" opacity="0.4"/>
    <circle cx="0" cy="0" r="35" fill="none" stroke="#f59e0b" stroke-width="4" opacity="0.6"/>
    <circle cx="0" cy="0" r="20" fill="#f43f5e"/>
    <!-- Batsman running graphic -->
    <line x1="-70" y1="50" x2="70" y2="50" stroke="#64748b" stroke-width="3"/>
  </g>
</svg>
`)}`;

// 5. Right Column Thumbnail: Stadium Venues
export const thumbStadium = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%">
  <defs>
    <linearGradient id="bgStad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#1e293b"/>
      <stop offset="100%" stopColor="#090d16"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" fill="url(#bgStad)"/>
  <!-- Floodlight beams -->
  <polygon points="40,20 120,160 80,160" fill="#38bdf8" opacity="0.2"/>
  <polygon points="280,20 200,160 240,160" fill="#38bdf8" opacity="0.2"/>
  <circle cx="40" cy="20" r="10" fill="#ffffff"/>
  <circle cx="280" cy="20" r="10" fill="#ffffff"/>
  <ellipse cx="160" cy="140" rx="90" ry="25" fill="#10b981" opacity="0.8"/>
  <rect x="156" y="125" width="8" height="20" fill="#fde047"/>
</svg>
`)}`;
