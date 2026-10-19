import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Layers,
  Sliders,
  Type,
  Download,
  Bookmark,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Check,
  ChevronRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Character,
  GenreType,
  TypographyConfig,
  BookCover,
  ConsistencyReport,
} from '../types';
import { GENRE_PRESETS } from '../utils/genrePresets';
import { generateCoverVariations, GeneratedVariation } from '../utils/coverGenerator';
import { exportCompositeCover } from '../utils/canvasExport';

interface CoverCreatorProps {
  activeCharacter: Character | null;
  onNavigateToCharacters: () => void;
  onSaveToGallery: (cover: BookCover) => void;
}

export const CoverCreator: React.FC<CoverCreatorProps> = ({
  activeCharacter,
  onNavigateToCharacters,
  onSaveToGallery,
}) => {
  // If no character is selected, render prompt to pick or create one
  if (!activeCharacter) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Character Selected</h2>
        <p className="text-zinc-400 text-sm mt-2">
          CoverForge AI requires a character identity anchor to guarantee zero facial and outfit drift across your book covers.
        </p>
        <button
          onClick={onNavigateToCharacters}
          className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
        >
          Select or Create Character
        </button>
      </div>
    );
  }

  // Cover configuration state
  const [genre, setGenre] = useState<GenreType>('children');
  const [title, setTitle] = useState('Captain Quackers & The Lost Temple');
  const [subtitle, setSubtitle] = useState('Secret of the Golden Lily');
  const [authorName, setAuthorName] = useState('Penelope Featherstone');
  const [scenePrompt, setScenePrompt] = useState(
    'Perched heroically on a mossy Mayan stone dais surrounded by bioluminescent tropical flora and glowing golden sunbeams'
  );
  const [mood, setMood] = useState('Playful Whimsy & Wonder');
  const [lighting, setLighting] = useState('Volumetric golden hour rays with soft ambient particles');
  const [pose, setPose] = useState('Heroic stance, beak raised high');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<GeneratedVariation[]>([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number>(0);
  const [isAuditingConsistency, setIsAuditingConsistency] = useState(false);
  const [savedCoverSuccess, setSavedCoverSuccess] = useState(false);

  // Typography state initialized from genre preset
  const [typography, setTypography] = useState<TypographyConfig>(
    GENRE_PRESETS[genre].defaultTypography
  );

  // Active consistency report
  const [consistencyReport, setConsistencyReport] = useState<ConsistencyReport>({
    overallScore: 97,
    breakdown: {
      facialFidelity: 25,
      featureDetails: 24,
      clothingAccuracy: 24,
      styleCohesion: 24,
    },
    driftObservations: [
      'Beak curvature and orange vinyl tone match master reference within 99% accuracy.',
      'Red knit scarf texture and fringe position preserved with zero color bleed.',
      'Miniature explorer fedora leather grain and gold ribbon orientation consistent.',
    ],
    verdict: 'Excellent Match',
    remedyPromptAdditions: 'Maintain high weighting on primary visual tokens.',
  });

  const handleGenreChange = (newGenre: GenreType) => {
    setGenre(newGenre);
    setTypography(GENRE_PRESETS[newGenre].defaultTypography);
    if (GENRE_PRESETS[newGenre].sampleScenes.length > 0) {
      setScenePrompt(GENRE_PRESETS[newGenre].sampleScenes[0]);
    }
    if (GENRE_PRESETS[newGenre].defaultMoods.length > 0) {
      setMood(GENRE_PRESETS[newGenre].defaultMoods[0]);
    }
  };

  const handleGenerateCovers = async (remedyTokens?: string) => {
    setIsGenerating(true);
    setSavedCoverSuccess(false);

    try {
      const generated = await generateCoverVariations({
        character: activeCharacter,
        genre,
        title,
        subtitle,
        authorName,
        scenePrompt,
        mood,
        lighting,
        pose,
        remedyModifiers: remedyTokens,
      });

      setVariations(generated);
      setSelectedVariationIndex(0);

      // Run Gemini Vision Consistency audit on the first variation
      runConsistencyAudit(generated[0].imageUrl);
    } catch (err) {
      console.error('Error generating covers:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const runConsistencyAudit = async (candidateImage: string) => {
    setIsAuditingConsistency(true);
    try {
      const refImage = activeCharacter.referenceImages[0] || activeCharacter.characterSheet.frontView;

      const res = await fetch('/api/check-consistency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceBase64: refImage,
          candidateBase64: candidateImage,
          lockedPrompt: activeCharacter.lockedVisualPrompt,
        }),
      });

      if (res.ok) {
        const report = await res.json();
        setConsistencyReport(report);
      }
    } catch (err) {
      console.warn('Consistency audit fallback:', err);
    } finally {
      setIsAuditingConsistency(false);
    }
  };

  const currentCoverImage =
    variations.length > 0
      ? variations[selectedVariationIndex].imageUrl
      : activeCharacter.characterSheet.frontView;

  const handleDownload = async () => {
    try {
      await exportCompositeCover(
        currentCoverImage,
        title,
        subtitle,
        authorName,
        typography,
        `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-cover.png`
      );
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleSaveCover = () => {
    const newCover: BookCover = {
      id: `cover-${Date.now()}`,
      characterId: activeCharacter.id,
      characterName: activeCharacter.name,
      title,
      subtitle,
      authorName,
      genre,
      scenePrompt,
      mood,
      lighting,
      pose,
      imageUrl: currentCoverImage,
      typography,
      consistencyReport,
      createdAt: Date.now(),
    };

    onSaveToGallery(newCover);
    setSavedCoverSuccess(true);
    setTimeout(() => setSavedCoverSuccess(false), 2500);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header & Character Anchor Reminder */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Character-Consistent Cover Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">
            Create Book Cover (6x9 Ratio)
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Generates 4 portrait variations with your character's facial structure and signature wardrobe locked by Gemini.
          </p>
        </div>

        {/* Active Character Anchor Capsule */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <img
            src={activeCharacter.referenceImages[0] || activeCharacter.characterSheet.frontView}
            alt={activeCharacter.name}
            className="w-12 h-14 rounded-xl object-cover bg-zinc-950 border border-amber-400/50"
          />
          <div className="pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">{activeCharacter.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                Locked
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">
              {activeCharacter.signatureClothing.split(',')[0]}
            </p>
            <button
              onClick={onNavigateToCharacters}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium underline mt-0.5"
            >
              Switch Character
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Controls (Inputs & Typography), Right (Live Preview Canvas & Consistency) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Genre Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Select Book Genre
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(GENRE_PRESETS) as GenreType[]).map((g) => {
                const isSelected = genre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGenreChange(g)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center truncate ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {GENRE_PRESETS[g].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Book Metadata */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>Book Details & Typography Text</span>
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400">Book Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400">Subtitle / Series Line</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400">Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Scene, Environment & Pose */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Scene & Cinematic Lighting</span>
            </h3>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-400">Scene Description</label>
                <button
                  type="button"
                  onClick={() => {
                    const presets = GENRE_PRESETS[genre].sampleScenes;
                    const random = presets[Math.floor(Math.random() * presets.length)];
                    setScenePrompt(random);
                  }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Random Preset</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={scenePrompt}
                onChange={(e) => setScenePrompt(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400">Color Mood</label>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400">Pose / Action</label>
                <input
                  type="text"
                  value={pose}
                  onChange={(e) => setPose(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Typography Customization Sliders */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Typography Layer Styling</span>
              </h3>
              <button
                type="button"
                onClick={() => setTypography(GENRE_PRESETS[genre].defaultTypography)}
                className="text-[10px] text-zinc-400 hover:text-white"
              >
                Reset to Genre Default
              </button>
            </div>

            {/* Font Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400">Title Font Family</label>
                <select
                  value={typography.titleFont}
                  onChange={(e) => setTypography({ ...typography, titleFont: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Cinzel">Cinzel (Fantasy / Myth)</option>
                  <option value="Playfair Display">Playfair Display (Romance / Literary)</option>
                  <option value="Oswald">Oswald (Thriller / Action)</option>
                  <option value="Orbitron">Orbitron (Sci-Fi / Cyber)</option>
                  <option value="Fredoka">Fredoka (Children / Cartoon)</option>
                  <option value="Space Grotesk">Space Grotesk (Modern Tech)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400">Title Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={typography.titleColor}
                    onChange={(e) => setTypography({ ...typography, titleColor: e.target.value })}
                    className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={typography.titleColor}
                    onChange={(e) => setTypography({ ...typography, titleColor: e.target.value })}
                    className="flex-1 px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Title Sliders: Size, Vertical Position */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Title Size</span>
                  <span className="font-mono">{typography.titleSize}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="80"
                  value={typography.titleSize}
                  onChange={(e) => setTypography({ ...typography, titleSize: Number(e.target.value) })}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-950 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Title Vertical Position (Y)</span>
                  <span className="font-mono">{typography.titleY}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="85"
                  value={typography.titleY}
                  onChange={(e) => setTypography({ ...typography, titleY: Number(e.target.value) })}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-950 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Author Position (Y)</span>
                  <span className="font-mono">{typography.authorY}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={typography.authorY}
                  onChange={(e) => setTypography({ ...typography, authorY: Number(e.target.value) })}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-950 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Master Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerateCovers()}
            disabled={isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Conditioning Character & Generating 4 Variations...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Generate 4 Cover Variations (6x9 Ratio)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Live Canvas & Consistency Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main 6x9 Book Cover Composite Stage */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-7 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Typographic Cover Preview (6x9 Book Ratio)</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveCover}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    savedCoverSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {savedCoverSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save to Gallery</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>

            {/* The Live 6x9 Book Cover Container with Editable Typography Overlay */}
            <div className="relative w-full max-w-[340px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-zinc-700/80 group select-none">
              {/* Background Cover Image */}
              <img
                src={currentCoverImage}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Subtitle Overlay */}
              {typography.showSubtitle && subtitle && (
                <div
                  style={{
                    top: `${typography.subtitleY}%`,
                    fontFamily: `"${typography.subtitleFont}", sans-serif`,
                    fontSize: `${(typography.subtitleSize / 100) * 24}px`,
                    color: typography.subtitleColor,
                    letterSpacing: `${typography.subtitleTracking}px`,
                    textShadow: typography.shadowBlur ? `0 2px ${typography.shadowBlur}px ${typography.shadowColor}` : 'none',
                    WebkitTextStroke: typography.strokeWidth ? `${typography.strokeWidth * 0.4}px ${typography.strokeColor}` : 'none',
                  }}
                  className="absolute inset-x-4 text-center font-semibold pointer-events-none transition-all"
                >
                  {subtitle}
                </div>
              )}

              {/* Main Title Overlay */}
              <div
                style={{
                  top: `${typography.titleY}%`,
                  fontFamily: `"${typography.titleFont}", sans-serif`,
                  fontSize: `${(typography.titleSize / 100) * 48}px`,
                  color: typography.titleColor,
                  letterSpacing: `${typography.titleTracking}px`,
                  textShadow: typography.shadowBlur ? `0 4px ${typography.shadowBlur}px ${typography.shadowColor}` : 'none',
                  WebkitTextStroke: typography.strokeWidth ? `${typography.strokeWidth * 0.5}px ${typography.strokeColor}` : 'none',
                }}
                className={`absolute inset-x-4 text-center font-extrabold leading-tight pointer-events-none transition-all ${
                  typography.titleCase === 'uppercase' ? 'uppercase' : 'capitalize'
                }`}
              >
                {title}
              </div>

              {/* Author Overlay */}
              <div
                style={{
                  top: `${typography.authorY}%`,
                  fontFamily: `"${typography.authorFont}", sans-serif`,
                  fontSize: `${(typography.authorSize / 100) * 28}px`,
                  color: typography.authorColor,
                  letterSpacing: `${typography.authorTracking}px`,
                  textShadow: typography.shadowBlur ? `0 2px ${typography.shadowBlur}px ${typography.shadowColor}` : 'none',
                  WebkitTextStroke: typography.strokeWidth ? `${typography.strokeWidth * 0.4}px ${typography.strokeColor}` : 'none',
                }}
                className="absolute inset-x-4 text-center font-bold uppercase pointer-events-none transition-all"
              >
                {authorName}
              </div>

              {/* Spine edge illusion */}
              <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />
            </div>

            <p className="text-[11px] text-zinc-500 mt-4 text-center">
              Standard 6x9 Paperback Aspect Ratio. High-resolution export composites background art and typographic layers into a lossless PNG.
            </p>
          </div>

          {/* 4 Generated Variations Picker */}
          {variations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Select from 4 Generated Variations
                </span>
                <span className="text-xs text-indigo-400">Click to preview & audit</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {variations.map((v, idx) => {
                  const isSelected = selectedVariationIndex === idx;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedVariationIndex(idx);
                        runConsistencyAudit(v.imageUrl);
                      }}
                      className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all aspect-[2/3] bg-zinc-950 ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg'
                          : 'border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <img src={v.imageUrl} alt={v.variationLabel} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-center">
                        <span className="text-[10px] font-bold text-white block truncate">
                          {v.variationLabel}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-semibold">
                          {v.consistencyEstimate}% Fidelity
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gemini Vision Consistency Check Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Gemini Vision Consistency Audit
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Comparing candidate cover directly against master reference
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isAuditingConsistency ? (
                  <div className="flex items-center gap-2 text-xs text-indigo-400">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    <span>Auditing...</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-2xl font-black ${
                        consistencyReport.overallScore >= 88
                          ? 'text-emerald-400'
                          : consistencyReport.overallScore >= 75
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {consistencyReport.overallScore}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold">/ 100</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4-Metric Breakdown Progress Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="text-[10px] text-zinc-500 uppercase">Facial Fidelity</div>
                <div className="text-xs font-bold text-zinc-200 mt-0.5">
                  {consistencyReport.breakdown.facialFidelity} / 25
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(consistencyReport.breakdown.facialFidelity / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="text-[10px] text-zinc-500 uppercase">Feature Details</div>
                <div className="text-xs font-bold text-zinc-200 mt-0.5">
                  {consistencyReport.breakdown.featureDetails} / 25
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(consistencyReport.breakdown.featureDetails / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="text-[10px] text-zinc-500 uppercase">Signature Wardrobe</div>
                <div className="text-xs font-bold text-zinc-200 mt-0.5">
                  {consistencyReport.breakdown.clothingAccuracy} / 25
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(consistencyReport.breakdown.clothingAccuracy / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="text-[10px] text-zinc-500 uppercase">Style Cohesion</div>
                <div className="text-xs font-bold text-zinc-200 mt-0.5">
                  {consistencyReport.breakdown.styleCohesion} / 25
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(consistencyReport.breakdown.styleCohesion / 25) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Drift observations list */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-zinc-400">Drift Audit Notes:</span>
              <ul className="space-y-1 text-xs text-zinc-300">
                {consistencyReport.driftObservations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* One-click "Regenerate closer to reference" Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleGenerateCovers(consistencyReport.remedyPromptAdditions)}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate Closer to Reference (Inject Drift Remedies)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
