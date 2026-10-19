import { Character, GenreType } from '../types';
import { createQuackersSvg } from '../demoData';

export interface GenerationInput {
  character: Character;
  genre: GenreType;
  title: string;
  subtitle: string;
  authorName: string;
  scenePrompt: string;
  mood: string;
  lighting: string;
  pose: string;
  remedyModifiers?: string;
}

export interface GeneratedVariation {
  id: string;
  imageUrl: string;
  variationLabel: string;
  cameraAngle: string;
  lightingStyle: string;
  consistencyEstimate: number;
}

export async function generateCoverVariations(
  input: GenerationInput
): Promise<GeneratedVariation[]> {
  // Simulate rapid generative processing
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const isQuackers = input.character.id.includes('quackers') || input.character.name.toLowerCase().includes('duck');

  const themes: ('jungle' | 'ocean' | 'space' | 'mountain')[] = ['jungle', 'ocean', 'space', 'mountain'];

  // Determine theme from scene prompt or genre
  let detectedTheme: 'jungle' | 'ocean' | 'space' | 'mountain' = 'jungle';
  const text = (input.scenePrompt + ' ' + input.genre).toLowerCase();
  if (text.includes('ocean') || text.includes('water') || text.includes('sea') || text.includes('abyss') || text.includes('deep')) {
    detectedTheme = 'ocean';
  } else if (text.includes('space') || text.includes('star') || text.includes('galaxy') || text.includes('scifi') || text.includes('cyber')) {
    detectedTheme = 'space';
  } else if (text.includes('snow') || text.includes('mountain') || text.includes('ice') || text.includes('frost') || text.includes('peak')) {
    detectedTheme = 'mountain';
  }

  const variationsConfig = [
    {
      label: 'Heroic Center Focus',
      camera: 'Low-angle medium shot, heroic silhouette',
      lighting: 'Key rim lighting with atmospheric particles',
      expression: 'determined' as const,
      view: 'front' as const,
      estimate: 97,
    },
    {
      label: 'Dynamic 3/4 Action Angle',
      camera: '3/4 angle, dynamic diagonal motion',
      lighting: 'High-contrast volumetric environment spill',
      expression: 'determined' as const,
      view: 'threeQuarter' as const,
      estimate: 95,
    },
    {
      label: 'Intimate Storybook Closer',
      camera: 'Close-up focal depth with soft bokeh background',
      lighting: 'Warm golden ambient glow with sparkle highlights',
      expression: 'smiling' as const,
      view: 'front' as const,
      estimate: 96,
    },
    {
      label: 'Atmospheric Environmental Wide',
      camera: 'Wide vista framing with character anchored in golden ratio',
      lighting: 'Dusk color grading with dramatic edge glow',
      expression: 'neutral' as const,
      view: 'side' as const,
      estimate: 94,
    },
  ];

  return variationsConfig.map((v, index) => {
    let imgUrl = '';

    if (isQuackers) {
      // Use our high-fidelity procedural SVG generator customized to the theme and variation
      imgUrl = createQuackersSvg({
        theme: detectedTheme,
        expression: v.expression,
        view: v.view,
        width: 600,
        height: 900,
      });
    } else {
      // Generic human/fantasy character procedural generator
      imgUrl = createGenericCharacterSvg({
        character: input.character,
        genre: input.genre,
        scene: input.scenePrompt,
        index,
      });
    }

    return {
      id: `var-${Date.now()}-${index}`,
      imageUrl: imgUrl,
      variationLabel: v.label,
      cameraAngle: v.camera,
      lightingStyle: v.lighting,
      consistencyEstimate: v.estimate,
    };
  });
}

function createGenericCharacterSvg(options: {
  character: Character;
  genre: GenreType;
  scene: string;
  index: number;
}): string {
  const { character, genre, index } = options;
  const colors: Record<GenreType, [string, string, string]> = {
    fantasy: ['#1e1b4b', '#431407', '#f59e0b'],
    romance: ['#4c0519', '#881337', '#fb7185'],
    thriller: ['#09090b', '#18181b', '#ef4444'],
    scifi: ['#030712', '#0284c7', '#38bdf8'],
    children: ['#042f2e', '#0284c7', '#facc15'],
    mystery: ['#0f172a', '#1e293b', '#eab308'],
  };

  const [bgDark, bgMid, accent] = colors[genre] || colors.fantasy;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
      <defs>
        <linearGradient id="bg-${index}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${bgDark}" />
          <stop offset="50%" stop-color="${bgMid}" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
        <radialGradient id="glow-${index}" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.35" />
          <stop offset="100%" stop-color="${bgDark}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="100%" height="100%" fill="url(#bg-${index})" />
      <circle cx="300" cy="380" r="280" fill="url(#glow-${index})" />

      <!-- Environment Silhouette -->
      <polygon points="50,600 180,420 300,560 420,380 550,620 600,900 0,900" fill="#09090b" opacity="0.8" />

      <!-- Character Silhouette with Consistent Visual Markers -->
      <ellipse cx="300" cy="720" rx="90" ry="20" fill="#000000" opacity="0.5" />
      <!-- Torso -->
      <polygon points="260,520 340,520 360,700 240,700" fill="#18181b" stroke="${accent}" stroke-width="2" />
      <!-- Cloak / Signature Garment -->
      <path d="M 250,520 Q 200,620 220,740 L 380,740 Q 400,620 350,520 Z" fill="#27272a" opacity="0.9" />
      <!-- Head & Hair -->
      <circle cx="300" cy="440" r="50" fill="#3f3f46" stroke="${accent}" stroke-width="2" />
      <!-- Hair Silhouette -->
      <path d="M 250,420 Q 300,370 350,420 Q 360,460 340,480 Q 300,450 260,480 Z" fill="#18181b" />
      <!-- Rim light halo -->
      <circle cx="300" cy="440" r="52" fill="none" stroke="${accent}" stroke-width="3" opacity="0.8" filter="blur(2px)"/>

      <!-- Atmospheric Spores -->
      <circle cx="180" cy="320" r="4" fill="${accent}" opacity="0.8" />
      <circle cx="420" cy="280" r="5" fill="${accent}" opacity="0.7" />
      <circle cx="280" cy="220" r="3" fill="#ffffff" opacity="0.9" />
      <circle cx="360" cy="520" r="3" fill="${accent}" opacity="0.6" />

      <!-- Character Identity Stamp -->
      <rect x="30" y="840" width="540" height="34" rx="6" fill="#18181b" opacity="0.75" />
      <text x="50" y="862" fill="#a1a1aa" font-family="sans-serif" font-size="12" font-weight="600">
        LOCKED IDENTITY: ${character.name.toUpperCase()} • ${character.artStyle.toUpperCase()}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}
