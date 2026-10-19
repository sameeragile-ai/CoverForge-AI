import { Character, BookCover, SeriesPlan, TypographyConfig } from './types';

// Helper to create high-quality responsive SVG data URIs for character views and covers
export function createQuackersSvg(options: {
  view?: 'front' | 'side' | 'threeQuarter';
  expression?: 'neutral' | 'determined' | 'smiling' | 'fierce';
  background?: string;
  accessory?: string;
  lighting?: string;
  width?: number;
  height?: number;
  titleOverlay?: string;
  subtitleOverlay?: string;
  theme?: 'jungle' | 'ocean' | 'space' | 'mountain' | 'studio';
}): string {
  const {
    view = 'front',
    expression = 'neutral',
    theme = 'studio',
    width = 600,
    height = 900,
  } = options;

  let bgGradients = '';
  let scenery = '';

  if (theme === 'jungle') {
    bgGradients = `
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#064e3b" />
          <stop offset="50%" stop-color="#022c22" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <radialGradient id="sunbeam" cx="50%" cy="20%" r="50%">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#064e3b" stop-opacity="0" />
        </radialGradient>
      </defs>
    `;
    scenery = `
      <rect width="100%" height="100%" fill="url(#bg)" />
      <circle cx="300" cy="180" r="280" fill="url(#sunbeam)" />
      <!-- Ancient Temple silhouettes -->
      <polygon points="120,450 180,320 240,450" fill="#042f2e" opacity="0.8" />
      <polygon points="200,430 300,240 400,430" fill="#064e3b" opacity="0.7" />
      <polygon points="360,460 440,340 520,460" fill="#042f2e" opacity="0.8" />
      <!-- Mossy vines -->
      <path d="M 50,0 Q 150,150 100,350 Q 80,450 120,550" stroke="#15803d" stroke-width="8" fill="none" opacity="0.6"/>
      <path d="M 550,0 Q 450,180 480,400" stroke="#16a34a" stroke-width="10" fill="none" opacity="0.5"/>
      <!-- Bioluminescent floating spores -->
      <circle cx="150" cy="220" r="6" fill="#86efac" filter="drop-shadow(0 0 8px #4ade80)" />
      <circle cx="450" cy="290" r="8" fill="#fef08a" filter="drop-shadow(0 0 10px #facc15)" />
      <circle cx="380" cy="140" r="5" fill="#86efac" filter="drop-shadow(0 0 6px #4ade80)" />
      <!-- Stone Pedestal -->
      <polygon points="180,680 420,680 460,860 140,860" fill="#1e293b" />
      <polygon points="160,670 440,670 420,680 180,680" fill="#334155" />
    `;
  } else if (theme === 'ocean') {
    bgGradients = `
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7" />
          <stop offset="40%" stop-color="#0369a1" />
          <stop offset="100%" stop-color="#082f49" />
        </linearGradient>
        <radialGradient id="deepglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#0369a1" stop-opacity="0" />
        </radialGradient>
      </defs>
    `;
    scenery = `
      <rect width="100%" height="100%" fill="url(#bg)" />
      <circle cx="300" cy="450" r="300" fill="url(#deepglow)" />
      <!-- Ocean Cavern / Coral -->
      <path d="M 0,900 L 0,600 Q 150,650 200,900 Z" fill="#0f172a" opacity="0.9" />
      <path d="M 600,900 L 600,580 Q 420,620 380,900 Z" fill="#0f172a" opacity="0.9" />
      <!-- Bioluminescent Jellyfish -->
      <circle cx="120" cy="240" r="22" fill="#c084fc" opacity="0.6" filter="drop-shadow(0 0 12px #a855f7)"/>
      <path d="M 110,255 Q 105,300 115,330 M 120,255 Q 120,310 125,340 M 130,255 Q 135,300 130,335" stroke="#e9d5ff" stroke-width="2" fill="none" opacity="0.8"/>
      <!-- Bubbles -->
      <circle cx="220" cy="380" r="8" fill="none" stroke="#e0f2fe" stroke-width="2" opacity="0.7"/>
      <circle cx="250" cy="320" r="14" fill="none" stroke="#e0f2fe" stroke-width="2.5" opacity="0.8"/>
      <circle cx="390" cy="280" r="10" fill="none" stroke="#e0f2fe" stroke-width="2" opacity="0.6"/>
      <circle cx="430" cy="420" r="6" fill="none" stroke="#e0f2fe" stroke-width="1.5" opacity="0.7"/>
      <!-- Submarine rock ledge -->
      <ellipse cx="300" cy="740" rx="160" ry="40" fill="#1e293b" />
    `;
  } else if (theme === 'space') {
    bgGradients = `
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#09090b" />
          <stop offset="50%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#431407" />
        </linearGradient>
        <radialGradient id="nebula" cx="60%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.35" />
          <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#000" stop-opacity="0" />
        </radialGradient>
      </defs>
    `;
    scenery = `
      <rect width="100%" height="100%" fill="url(#bg)" />
      <circle cx="360" cy="270" r="280" fill="url(#nebula)" />
      <!-- Distant Earth & Moon -->
      <circle cx="500" cy="180" r="70" fill="#0284c7" />
      <path d="M 460,150 Q 520,130 540,190 Q 480,210 460,150" fill="#22c55e" opacity="0.9"/>
      <circle cx="420" cy="220" r="15" fill="#cbd5e1" />
      <!-- Stars -->
      <circle cx="80" cy="90" r="2.5" fill="#fff" />
      <circle cx="160" cy="180" r="1.5" fill="#fde047" />
      <circle cx="280" cy="80" r="3" fill="#fff" filter="drop-shadow(0 0 4px #fff)"/>
      <circle cx="110" cy="380" r="2" fill="#fff" />
      <circle cx="520" cy="420" r="3" fill="#38bdf8" />
      <!-- Asteroid platform -->
      <polygon points="160,700 240,660 380,670 450,710 420,780 190,770" fill="#27272a" stroke="#3f3f46" stroke-width="3"/>
    `;
  } else if (theme === 'mountain') {
    bgGradients = `
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="40%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </linearGradient>
        <linearGradient id="aurora" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.6"/>
          <stop offset="50%" stop-color="#06b6d4" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.5"/>
        </linearGradient>
      </defs>
    `;
    scenery = `
      <rect width="100%" height="100%" fill="url(#bg)" />
      <!-- Aurora Borealis ribbons -->
      <path d="M 0,160 Q 200,60 400,140 T 600,80 L 600,220 Q 350,140 0,260 Z" fill="url(#aurora)" filter="blur(8px)" opacity="0.65"/>
      <!-- Snowy Peaks -->
      <polygon points="300,320 480,680 120,680" fill="#334155" />
      <polygon points="300,320 360,440 330,420 300,450 270,410 240,440" fill="#f8fafc" />
      <polygon points="450,420 590,750 310,750" fill="#1e293b" />
      <polygon points="450,420 500,520 460,500 450,530 420,490 400,520" fill="#e2e8f0" />
      <!-- Snowdrift Base -->
      <ellipse cx="300" cy="720" rx="190" ry="45" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="4"/>
      <!-- Falling Snowflakes -->
      <circle cx="140" cy="180" r="4" fill="#fff" opacity="0.9"/>
      <circle cx="480" cy="220" r="5" fill="#fff" opacity="0.9"/>
      <circle cx="260" cy="390" r="3.5" fill="#fff" opacity="0.8"/>
      <circle cx="390" cy="510" r="4.5" fill="#fff" opacity="0.8"/>
    `;
  } else {
    // Studio gradient
    bgGradients = `
      <defs>
        <radialGradient id="studiobg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#3f3f46" />
          <stop offset="100%" stop-color="#18181b" />
        </radialGradient>
      </defs>
    `;
    scenery = `
      <rect width="100%" height="100%" fill="url(#studiobg)" />
      <!-- Grid floor reflection -->
      <ellipse cx="300" cy="730" rx="160" ry="30" fill="#09090b" opacity="0.6"/>
    `;
  }

  // Character geometry calculation based on view & expression
  const headCenterX = view === 'side' ? 270 : view === 'threeQuarter' ? 290 : 300;
  const headCenterY = 480;
  const eyeOffset = view === 'side' ? 40 : view === 'threeQuarter' ? 32 : 36;
  const beakOffset = view === 'side' ? -35 : view === 'threeQuarter' ? -15 : 0;

  // Eyebrow and eye styles by expression
  let eyeShape = '';
  if (expression === 'determined') {
    eyeShape = `
      <!-- Determined brows -->
      <path d="M ${headCenterX - eyeOffset - 15},${headCenterY - 26} L ${headCenterX - eyeOffset + 15},${headCenterY - 18}" stroke="#451a03" stroke-width="4.5" stroke-linecap="round"/>
      ${view !== 'side' ? `<path d="M ${headCenterX + eyeOffset + 15},${headCenterY - 26} L ${headCenterX + eyeOffset - 15},${headCenterY - 18}" stroke="#451a03" stroke-width="4.5" stroke-linecap="round"/>` : ''}
      <!-- Eyes with intense highlights -->
      <ellipse cx="${headCenterX - eyeOffset}" cy="${headCenterY - 12}" rx="12" ry="14" fill="#0f172a" />
      <circle cx="${headCenterX - eyeOffset - 3}" cy="${headCenterY - 15}" r="4" fill="#ffffff" />
      ${view !== 'side' ? `
        <ellipse cx="${headCenterX + eyeOffset}" cy="${headCenterY - 12}" rx="12" ry="14" fill="#0f172a" />
        <circle cx="${headCenterX + eyeOffset - 3}" cy="${headCenterY - 15}" r="4" fill="#ffffff" />
      ` : ''}
    `;
  } else if (expression === 'smiling') {
    eyeShape = `
      <!-- Joyful curved eyes -->
      <path d="M ${headCenterX - eyeOffset - 14},${headCenterY - 10} Q ${headCenterX - eyeOffset},${headCenterY - 24} ${headCenterX - eyeOffset + 14},${headCenterY - 10}" stroke="#0f172a" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${view !== 'side' ? `
        <path d="M ${headCenterX + eyeOffset - 14},${headCenterY - 10} Q ${headCenterX + eyeOffset},${headCenterY - 24} ${headCenterX + eyeOffset + 14},${headCenterY - 10}" stroke="#0f172a" stroke-width="5" fill="none" stroke-linecap="round"/>
      ` : ''}
      <!-- Blush -->
      <ellipse cx="${headCenterX - eyeOffset - 12}" cy="${headCenterY + 12}" rx="10" ry="6" fill="#f87171" opacity="0.4"/>
      ${view !== 'side' ? `<ellipse cx="${headCenterX + eyeOffset + 12}" cy="${headCenterY + 12}" rx="10" ry="6" fill="#f87171" opacity="0.4"/>` : ''}
    `;
  } else {
    // Neutral round cute button eyes
    eyeShape = `
      <ellipse cx="${headCenterX - eyeOffset}" cy="${headCenterY - 10}" rx="13" ry="15" fill="#09090b" />
      <circle cx="${headCenterX - eyeOffset - 4}" cy="${headCenterY - 15}" r="5" fill="#ffffff" />
      <circle cx="${headCenterX - eyeOffset + 3}" cy="${headCenterY - 6}" r="2" fill="#ffffff" />
      ${view !== 'side' ? `
        <ellipse cx="${headCenterX + eyeOffset}" cy="${headCenterY - 10}" rx="13" ry="15" fill="#09090b" />
        <circle cx="${headCenterX + eyeOffset - 4}" cy="${headCenterY - 15}" r="5" fill="#ffffff" />
        <circle cx="${headCenterX + eyeOffset + 3}" cy="${headCenterY - 6}" r="2" fill="#ffffff" />
      ` : ''}
    `;
  }

  const duckGraphic = `
    <!-- SHADOW -->
    <ellipse cx="300" cy="710" rx="110" ry="24" fill="#000000" opacity="0.35" />

    <!-- DUCK BODY (Plump collectible vinyl look) -->
    <!-- Tail Feather Kick -->
    <path d="M ${headCenterX + (view === 'side' ? 90 : 80)},630 Q ${headCenterX + (view === 'side' ? 140 : 120)},590 ${headCenterX + (view === 'side' ? 120 : 100)},660 Z" fill="#eab308" stroke="#ca8a04" stroke-width="3" />

    <!-- Main Torso -->
    <ellipse cx="${headCenterX + (view === 'side' ? 30 : 0)}" cy="635" rx="105" ry="85" fill="#facc15" stroke="#eab308" stroke-width="4" />
    <!-- Vinyl highlight sweep -->
    <path d="M ${headCenterX - 60},585 Q ${headCenterX - 20},565 ${headCenterX + 40},585" stroke="#fef08a" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.6"/>

    <!-- Wing -->
    <path d="M ${headCenterX - (view === 'side' ? 10 : 35)},610 Q ${headCenterX + (view === 'side' ? 60 : 30)},600 ${headCenterX + (view === 'side' ? 80 : 50)},660 Q ${headCenterX + (view === 'side' ? 10 : 0)},675 ${headCenterX - (view === 'side' ? 10 : 35)},610" fill="#eab308" stroke="#ca8a04" stroke-width="3" />

    <!-- DUCK HEAD -->
    <circle cx="${headCenterX}" cy="${headCenterY}" r="75" fill="#facc15" stroke="#eab308" stroke-width="4" />
    <!-- Glossy Head Sheen -->
    <ellipse cx="${headCenterX - 28}" cy="${headCenterY - 35}" rx="22" ry="12" fill="#fef9c3" opacity="0.5" transform="rotate(-20 ${headCenterX - 28} ${headCenterY - 35})"/>

    <!-- BILL (Orange beak) -->
    <path d="M ${headCenterX - 25 + beakOffset},${headCenterY + 10} Q ${headCenterX + beakOffset},${headCenterY + 4} ${headCenterX + 25 + beakOffset},${headCenterY + 10} Q ${headCenterX + beakOffset},${headCenterY + 36} ${headCenterX - 25 + beakOffset},${headCenterY + 10}" fill="#f97316" stroke="#ea580c" stroke-width="3" />
    <ellipse cx="${headCenterX + beakOffset}" cy="${headCenterY + 14}" rx="8" ry="3" fill="#fdba74" opacity="0.7"/>

    <!-- EYES & EXPRESSION -->
    ${eyeShape}

    <!-- SIGNATURE CLOTHING 1: RED KNITTED SCARF -->
    <!-- Scarf loop around neck -->
    <ellipse cx="${headCenterX}" cy="${headCenterY + 68}" rx="65" ry="24" fill="#dc2626" stroke="#991b1b" stroke-width="3.5" />
    <!-- Wool knit stitch texture -->
    <path d="M ${headCenterX - 45},${headCenterY + 65} L ${headCenterX - 35},${headCenterY + 74} M ${headCenterX - 20},${headCenterY + 65} L ${headCenterX - 10},${headCenterY + 74} M ${headCenterX + 10},${headCenterY + 65} L ${headCenterX + 20},${headCenterY + 74} M ${headCenterX + 35},${headCenterY + 65} L ${headCenterX + 45},${headCenterY + 74}" stroke="#ef4444" stroke-width="2.5" />
    <!-- Hanging Scarf Tail -->
    <path d="M ${headCenterX - 25},${headCenterY + 80} L ${headCenterX - 45},${headCenterY + 155} L ${headCenterX - 10},${headCenterY + 160} L ${headCenterX + 5},${headCenterY + 82} Z" fill="#b91c1c" stroke="#991b1b" stroke-width="3" />
    <!-- Scarf fringe -->
    <path d="M ${headCenterX - 45},${headCenterY + 155} L ${headCenterX - 45},${headCenterY + 165} M ${headCenterX - 36},${headCenterY + 156} L ${headCenterX - 36},${headCenterY + 166} M ${headCenterX - 27},${headCenterY + 158} L ${headCenterX - 27},${headCenterY + 168} M ${headCenterX - 18},${headCenterY + 159} L ${headCenterX - 18},${headCenterY + 169} M ${headCenterX - 10},${headCenterY + 160} L ${headCenterX - 10},${headCenterY + 170}" stroke="#fca5a5" stroke-width="2.5" />

    <!-- SIGNATURE CLOTHING 2: TINY LEATHER EXPLORER HAT -->
    <!-- Hat Brim -->
    <ellipse cx="${headCenterX}" cy="${headCenterY - 65}" rx="62" ry="16" fill="#78350f" stroke="#451a03" stroke-width="3" transform="rotate(-6 ${headCenterX} ${headCenterY - 65})" />
    <!-- Hat Crown -->
    <path d="M ${headCenterX - 36},${headCenterY - 68} L ${headCenterX - 30},${headCenterY - 110} Q ${headCenterX},${headCenterY - 118} ${headCenterX + 30},${headCenterY - 110} L ${headCenterX + 36},${headCenterY - 68} Z" fill="#92400e" stroke="#451a03" stroke-width="3" transform="rotate(-6 ${headCenterX} ${headCenterY - 65})"/>
    <!-- Hat Feather / Ribbon Band -->
    <path d="M ${headCenterX - 34},${headCenterY - 78} Q ${headCenterX},${headCenterY - 84} ${headCenterX + 34},${headCenterY - 78}" stroke="#f59e0b" stroke-width="5" fill="none" transform="rotate(-6 ${headCenterX} ${headCenterY - 65})" />
    <!-- Tiny Adventure Badge on Hat -->
    <circle cx="${headCenterX - 12}" cy="${headCenterY - 82}" r="5" fill="#facc15" stroke="#78350f" stroke-width="1.5" />
  `;

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      ${bgGradients}
      ${scenery}
      ${duckGraphic}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

// Generate the 6-view Character Sheet for Captain Quackers
export const captainQuackersSheet = {
  frontView: createQuackersSvg({ view: 'front', expression: 'neutral', theme: 'studio' }),
  sideView: createQuackersSvg({ view: 'side', expression: 'neutral', theme: 'studio' }),
  threeQuarterView: createQuackersSvg({ view: 'threeQuarter', expression: 'neutral', theme: 'studio' }),
  expressionNeutral: createQuackersSvg({ view: 'front', expression: 'neutral', theme: 'studio' }),
  expressionDetermined: createQuackersSvg({ view: 'front', expression: 'determined', theme: 'studio' }),
  expressionSmilingOrFierce: createQuackersSvg({ view: 'front', expression: 'smiling', theme: 'studio' }),
};

export const demoCharacter: Character = {
  id: 'char-captain-quackers',
  name: 'Captain Quackers',
  tagline: 'Fearless 4-inch Explorer & Adventurer Mascot',
  age: 'Ageless Collectible',
  genderOrArchetype: 'Bold Adventurer / Mascot',
  speciesOrEthnicity: 'Classic Yellow Rubber Duck Collectible',
  hair: 'Smooth bright yellow molded vinyl crest',
  eyes: 'Glossy round black button eyes with vivid white catchlights',
  build: 'Plump, rounded 4-inch rubber duck body with perky tail feather',
  signatureClothing: 'Hand-knitted crimson red wool scarf with tasseled fringe, weathered miniature brown leather explorer fedora with gold compass ribbon',
  distinguishingFeatures: 'Vivid orange molded bill, glossy vinyl collectible sheen, slight jaunty tilt to fedora, tiny brass compass pin',
  personalityMood: 'Brave, relentlessly curious, plucky, cheerful optimism in the face of peril',
  artStyle: 'whimsical-3d-digital',
  lockedVisualPrompt:
    'Captain Quackers, a 4-inch tall collectible yellow rubber duck mascot. Features smooth sunny yellow vinyl skin with subtle studio highlights, glossy obsidian button eyes with white catchlight reflections, and a plump bright orange bill. Wearing a weathered miniature brown leather explorer fedora tilted slightly to the right with a gold ribbon, and a cozy hand-knitted deep crimson red wool scarf tucked neatly under his bill with fringe hanging to his left flank. Rendered in whimsical 3D animated collectible aesthetic with volumetric studio lighting, rich textural detail on scarf knit and leather hat, keeping identical proportions, facial structure, and iconic outfit.',
  referenceImages: [
    captainQuackersSheet.frontView,
    captainQuackersSheet.threeQuarterView,
    captainQuackersSheet.expressionDetermined,
  ],
  characterSheet: captainQuackersSheet,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
};

export const defaultChildrenTypography: TypographyConfig = {
  titleFont: 'Fredoka',
  subtitleFont: 'Plus Jakarta Sans',
  authorFont: 'Fredoka',
  titleColor: '#fef08a',
  subtitleColor: '#ffffff',
  authorColor: '#fde047',
  titleSize: 52,
  subtitleSize: 20,
  authorSize: 26,
  titleTracking: 2,
  subtitleTracking: 4,
  authorTracking: 3,
  titleY: 12,
  subtitleY: 22,
  authorY: 90,
  titleCase: 'capitalize',
  shadowColor: '#0f172a',
  shadowBlur: 14,
  strokeColor: '#78350f',
  strokeWidth: 4,
  showSubtitle: true,
};

export const demoSeries: SeriesPlan = {
  id: 'series-quackers-adventures',
  characterId: demoCharacter.id,
  characterName: demoCharacter.name,
  seriesTitle: 'The Epic Voyages of Captain Quackers',
  genre: 'children',
  authorName: 'Penelope Featherstone',
  defaultTypography: defaultChildrenTypography,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  books: [
    {
      volume: 1,
      title: 'The Lost Temple',
      subtitle: 'Secret of the Golden Lily',
      scene: 'Perched heroically on a mossy Mayan stone dais surrounded by bioluminescent tropical flora and glowing golden sunbeams',
      setting: 'Ancient Jungle Canopy',
      colorPalette: 'Emerald, Sunburst Gold, Ancient Stone Grey',
      pose: 'Heroic Stance, beak raised toward sunlit temple ruins',
      coverId: 'cover-quackers-1',
      coverThumbnail: createQuackersSvg({ theme: 'jungle', expression: 'determined' }),
      consistencyScore: 98,
    },
    {
      volume: 2,
      title: 'The Abyssal Trench',
      subtitle: 'Mystery of the Bioluminescent Deep',
      scene: 'Drifting gracefully beside ethereal purple jellyfish, surrounded by sparkling ocean air bubbles and submerged coral spires',
      setting: 'Bioluminescent Ocean Abyss',
      colorPalette: 'Deep Cyan, Electric Indigo, Neon Lavender',
      pose: 'Floating observant pose with scarf fluttering gently underwater',
      coverId: 'cover-quackers-2',
      coverThumbnail: createQuackersSvg({ theme: 'ocean', expression: 'smiling' }),
      consistencyScore: 96,
    },
    {
      volume: 3,
      title: 'Space Odyssey',
      subtitle: 'Journey Beyond the Asteroid Belt',
      scene: 'Standing boldly on a tumbling metallic asteroid with planet Earth and violet nebulae glittering in the cosmic void behind',
      setting: 'Deep Space Orbit',
      colorPalette: 'Cosmic Violet, Starlight White, Solar Amber',
      pose: 'Dynamic forward lean gazing at the stars with determination',
      coverId: 'cover-quackers-3',
      coverThumbnail: createQuackersSvg({ theme: 'space', expression: 'determined' }),
      consistencyScore: 95,
    },
    {
      volume: 4,
      title: 'Blizzard Peak',
      subtitle: 'Curse of the Frost Yeti',
      scene: 'Braving freezing gale winds atop a snow-packed Himalayan peak beneath the dancing emerald ribbons of the Northern Lights',
      setting: 'Frozen Mountain Summit',
      colorPalette: 'Glacial White, Aurora Cyan, Frost Blue',
      pose: 'Stout determined posture bracing against swirling snowflakes',
      coverId: 'cover-quackers-4',
      coverThumbnail: createQuackersSvg({ theme: 'mountain', expression: 'determined' }),
      consistencyScore: 97,
    },
  ],
};

export const demoCovers: BookCover[] = demoSeries.books.map((b) => ({
  id: b.coverId || `cover-${b.volume}`,
  characterId: demoCharacter.id,
  characterName: demoCharacter.name,
  seriesId: demoSeries.id,
  volumeNumber: b.volume,
  title: `Captain Quackers & ${b.title}`,
  subtitle: b.subtitle,
  authorName: demoSeries.authorName,
  genre: 'children',
  scenePrompt: b.scene,
  mood: 'Playful, Wonder, High Adventure',
  lighting: 'Volumetric cinematic lighting with soft storybook textures',
  pose: b.pose,
  imageUrl: b.coverThumbnail || createQuackersSvg({ theme: 'jungle' }),
  typography: {
    ...defaultChildrenTypography,
    titleSize: 44,
  },
  consistencyReport: {
    overallScore: b.consistencyScore || 96,
    breakdown: {
      facialFidelity: 25,
      featureDetails: 24,
      clothingAccuracy: 24,
      styleCohesion: 24,
    },
    driftObservations: [
      'Beak curvature and orange hue match character reference sheet within 99% accuracy.',
      'Red scarf knit pattern and fringe position preserved perfectly.',
      'Miniature explorer fedora leather texture and gold band intact.',
    ],
    verdict: 'Excellent Match',
    remedyPromptAdditions: 'Maintain current seed and locked visual token weighting.',
  },
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * (5 - b.volume),
}));
