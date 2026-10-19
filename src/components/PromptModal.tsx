import React, { useState } from 'react';
import { X, Copy, Check, FileCode2, ExternalLink } from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MASTER_BUILD_PROMPT = `# BUILD PROMPT: CoverForge AI — Character-Consistent Book Cover Studio

Build a complete, production-ready web application called **"CoverForge AI"** using **React, TypeScript, Tailwind CSS, Lucide icons, and the Google Gen AI SDK (\`@google/genai\`)**. The app enables indie authors and publishers to create a visual character identity once, and generate a multi-book series of covers where that character maintains consistent facial structure, hair, body proportions, wardrobe elements, and rendering art style.

---

## 1. CORE PURPOSE
- Authors create one main character once, then generate a full series of book covers where that character keeps the same face, hairstyle, body type, outfit details, and art style across every cover.

---

## 2. CHARACTER CREATION & IDENTITY LOCK
- **Option A (Upload References)**: Upload 1-3 reference images of a character.
- **Option B (Describe in Text)**: Name, age, ethnicity/species, hair, eyes, build, signature clothing, distinguishing features, personality, and art style preset.
- **Generate a "Character Sheet"**: Front view, side view, 3/4 view, and 3 facial expressions (neutral, determined, smiling/intense), all strictly matching.
- **Character Library**: Save each character with a locked visual description (canonical prompt anchor) that is automatically reused in every future generation to prevent drift.

---

## 3. COVER GENERATION (PORTRAIT 6x9 RATIO)
- **Inputs**: Book title, subtitle, author name, genre (fantasy, romance, thriller, sci-fi, children's, mystery), scene description, mood, and selected character.
- **Gemini Image Conditioning**: Use the Gemini image model with the saved character reference images and locked visual prompt passed in every request to keep identity consistent.
- **4 Variations per Request**: Generate 4 distinct camera angles and lighting moods in portrait 6x9 paperback ratio.
- **Editable Typography Overlay Layer**: Add title, subtitle, and author typography as an editable text layer on top of the image with genre-matched font presets (Cinzel, Playfair Display, Oswald, Orbitron, Fredoka). Includes sliders for font size, tracking, vertical anchors, colors, strokes, and drop shadows.

---

## 4. SERIES MODE (MULTI-BOOK PLANNER)
- Let the user plan a 3-5 book series with one character, each book having its own scene, pose, setting, and color palette.
- Show all covers side by side in a "Series View" so consistency is visible at a glance.
- Step-by-step or batch cover generation carrying over typographic branding and character identity across volumes.

---

## 5. CONSISTENCY CHECK & DRIFT DETECTION
- After each generation, use Gemini vision to compare the new image against the character sheet/reference and show a "Consistency Score" (0-100) with a breakdown (facial fidelity, feature details, clothing accuracy, style cohesion) and a short note on any drift (hair, face, outfit).
- Offer a one-click "Regenerate closer to reference" button that dynamically injects drift remedies into the next generation.

---

## 6. PRELOADED DEMO CHARACTER
- Include a preloaded demo character so the app looks complete on first open:
  - Cute yellow rubber duck collectible mascot named "Captain Quackers" with a red scarf and tiny explorer hat.
  - Appearing across a 4-book children's adventure series:
    1. Jungle: "Captain Quackers and the Lost Temple"
    2. Ocean: "Captain Quackers and the Abyssal Trench"
    3. Space: "Captain Quackers: Space Odyssey"
    4. Snowy Mountain: "Captain Quackers: Blizzard Peak"
  - Complete with 6-angle character sheet and high-resolution cover artwork.

---

## 7. UI AND UX
- Clean, modern dark interface, sidebar navigation: Characters, Create Cover, Series, Gallery.
- Gallery with download (PNG, high resolution composite rendering background art + typography overlay to canvas) and delete.
- Loading states, error handling, mobile responsive.

---

## 8. TECH STACK
- React + TypeScript, Tailwind CSS, Lucide React icons.
- Server-side Gemini API (\`@google/genai\`) for text, image generation, and multimodal vision comparison.
- LocalStorage persistence for the character library, series plans, and gallery.
`;

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(MASTER_BUILD_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-8 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Google AI Studio Master Build Prompt
              </h3>
              <p className="text-xs text-zinc-400">
                Ready-to-use specification to build CoverForge AI in one turn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-zinc-300 leading-relaxed space-y-4 bg-zinc-950/70 select-text">
          <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-300 leading-relaxed">
            {MASTER_BUILD_PROMPT}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0 text-xs text-zinc-400">
          <span>Formatted with all 8 requirements specified.</span>
          <button
            onClick={handleCopy}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            {copied ? 'Copied!' : 'Click to copy text'}
          </button>
        </div>
      </div>
    </div>
  );
};
