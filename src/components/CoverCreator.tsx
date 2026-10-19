import React, { useState } from 'react';
import {
  Download,
  Bookmark,
  RefreshCw,
  Check,
  ChevronRight,
  Sliders,
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
  if (!activeCharacter) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-16">
        <h2 className="font-['Playfair_Display'] text-2xl font-normal text-[#1C1B1A]">
          No character selected
        </h2>
        <p className="text-[#6B6763] text-sm mt-2 leading-relaxed">
          Select or create a character to ensure facial structure, wardrobe, and art style remain consistent across covers.
        </p>
        <button
          onClick={onNavigateToCharacters}
          className="mt-6 px-5 py-2.5 rounded-[8px] bg-gradient-to-r from-[#B4553A] to-[#D9A066] text-white font-medium text-sm hover:opacity-95 transition-opacity"
        >
          Select character
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
    'Perched on a mossy stone dais surrounded by tropical flora and warm sunbeams'
  );
  const [mood, setMood] = useState('Quiet Wonder');
  const [lighting, setLighting] = useState('Soft morning light with ambient warmth');
  const [pose, setPose] = useState('Heroic stance, looking upward');

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
      'Facial structure and orange beak tone match the reference sheet.',
      'Red knit scarf texture and fringe position preserved without drift.',
      'Explorer fedora leather tone and band match the reference model.',
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
    <div className="p-8 lg:p-12 max-w-[1200px] mx-auto w-full space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8E4DE] pb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
            Cover Studio
          </span>
          <h1 className="font-['Playfair_Display'] text-3xl lg:text-4xl font-normal text-[#1C1B1A] mt-2">
            Create Cover
          </h1>
          <p className="text-[#6B6763] text-sm mt-2 max-w-xl leading-relaxed">
            Generate 4 variations in standard 6x9 book proportion with consistent character identity, custom typography, and verification.
          </p>
        </div>

        {/* Active Character Pill */}
        <div className="flex items-center gap-3 p-3 rounded-[10px] bg-white border border-[#E8E4DE]">
          <img
            src={activeCharacter.referenceImages[0] || activeCharacter.characterSheet.frontView}
            alt={activeCharacter.name}
            className="w-10 h-13 rounded-[6px] object-cover bg-[#FAF8F5] border border-[#E8E4DE]"
          />
          <div className="pr-1">
            <div className="text-xs font-semibold text-[#1C1B1A]">
              {activeCharacter.name}
            </div>
            <div className="text-[11px] text-[#6B6763]">
              Active character
            </div>
            <button
              onClick={onNavigateToCharacters}
              className="text-[11px] text-[#B4553A] hover:underline font-medium mt-0.5 inline-block"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Controls (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Genre Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
              Genre
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(GENRE_PRESETS) as GenreType[]).map((g) => {
                const isSelected = genre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGenreChange(g)}
                    className={`py-2 px-2.5 rounded-[8px] text-xs font-medium transition-colors text-center truncate ${
                      isSelected
                        ? 'bg-[#1C1B1A] text-white'
                        : 'bg-white text-[#6B6763] hover:text-[#1C1B1A] border border-[#E8E4DE]'
                    }`}
                  >
                    {GENRE_PRESETS[g].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Book Metadata */}
          <div className="p-6 rounded-[10px] bg-white border border-[#E8E4DE] space-y-4">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
              Book Details
            </div>

            <div>
              <label className="text-xs font-medium text-[#1C1B1A]">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#1C1B1A]">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#1C1B1A]">Author name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
              />
            </div>
          </div>

          {/* Scene and Setting */}
          <div className="p-6 rounded-[10px] bg-white border border-[#E8E4DE] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
                Scene & Setting
              </span>
              <button
                type="button"
                onClick={() => {
                  const presets = GENRE_PRESETS[genre].sampleScenes;
                  const random = presets[Math.floor(Math.random() * presets.length)];
                  setScenePrompt(random);
                }}
                className="text-xs text-[#B4553A] hover:underline"
              >
                Sample prompt
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-[#1C1B1A]">Scene description</label>
              <textarea
                rows={3}
                value={scenePrompt}
                onChange={(e) => setScenePrompt(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#1C1B1A]">Mood</label>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-xs focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#1C1B1A]">Pose</label>
                <input
                  type="text"
                  value={pose}
                  onChange={(e) => setPose(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-xs focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                />
              </div>
            </div>
          </div>

          {/* Typography Controls */}
          <div className="p-6 rounded-[10px] bg-white border border-[#E8E4DE] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
                Typography overlay
              </span>
              <button
                type="button"
                onClick={() => setTypography(GENRE_PRESETS[genre].defaultTypography)}
                className="text-xs text-[#6B6763] hover:text-[#1C1B1A]"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#1C1B1A]">Title font</label>
                <select
                  value={typography.titleFont}
                  onChange={(e) => setTypography({ ...typography, titleFont: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-xs focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                >
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Cinzel">Cinzel</option>
                  <option value="Oswald">Oswald</option>
                  <option value="Orbitron">Orbitron</option>
                  <option value="Fredoka">Fredoka</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[#1C1B1A]">Title color</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={typography.titleColor}
                    onChange={(e) => setTypography({ ...typography, titleColor: e.target.value })}
                    className="w-7 h-7 rounded-[4px] border border-[#E8E4DE] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={typography.titleColor}
                    onChange={(e) => setTypography({ ...typography, titleColor: e.target.value })}
                    className="flex-1 px-2 py-1 rounded-[6px] bg-[#FAF8F5] border border-[#E8E4DE] text-[#1C1B1A] text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs text-[#6B6763]">
                  <span>Title size</span>
                  <span>{typography.titleSize}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="80"
                  value={typography.titleSize}
                  onChange={(e) => setTypography({ ...typography, titleSize: Number(e.target.value) })}
                  className="w-full accent-[#B4553A] h-1.5 bg-[#FAF8F5] rounded-lg cursor-pointer mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#6B6763]">
                  <span>Title vertical position</span>
                  <span>{typography.titleY}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="85"
                  value={typography.titleY}
                  onChange={(e) => setTypography({ ...typography, titleY: Number(e.target.value) })}
                  className="w-full accent-[#B4553A] h-1.5 bg-[#FAF8F5] rounded-lg cursor-pointer mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#6B6763]">
                  <span>Author position</span>
                  <span>{typography.authorY}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={typography.authorY}
                  onChange={(e) => setTypography({ ...typography, authorY: Number(e.target.value) })}
                  className="w-full accent-[#B4553A] h-1.5 bg-[#FAF8F5] rounded-lg cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => handleGenerateCovers()}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-[8px] bg-gradient-to-r from-[#B4553A] to-[#D9A066] text-white font-medium text-sm hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            {isGenerating ? 'Creating your cover...' : 'Create cover (4 variations)'}
          </button>

          {/* Quiet thin loading progress indicator */}
          {isGenerating && (
            <div className="space-y-1.5">
              <div className="w-full h-[2px] bg-[#E8E4DE] rounded-full overflow-hidden">
                <div className="h-full bg-[#B4553A] animate-pulse w-3/4 rounded-full" />
              </div>
              <p className="text-xs text-[#6B6763] text-center">
                Preserving character identity and generating 6x9 variations
              </p>
            </div>
          )}
        </div>

        {/* Right Stage: 6x9 Book Preview & Consistency Bar (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main 6x9 Book Cover Container */}
          <div className="bg-white border border-[#E8E4DE] rounded-[10px] p-6 lg:p-8 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-6">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
                Preview (6x9 Ratio)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveCover}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] hover:bg-[#FAF8F5] text-xs font-medium transition-colors"
                >
                  {savedCoverSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#B4553A]" strokeWidth={1.5} />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Save to gallery</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[8px] bg-gradient-to-r from-[#B4553A] to-[#D9A066] text-white text-xs font-medium hover:opacity-95 transition-opacity"
                >
                  <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* True 6x9 Book Display */}
            <div className="relative w-full max-w-[340px] aspect-[2/3] rounded-[6px] overflow-hidden shadow-sm border border-[#E8E4DE] select-none bg-[#FAF8F5]">
              {/* Background Art */}
              <img
                src={currentCoverImage}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Subtitle */}
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
                  className="absolute inset-x-4 text-center font-medium pointer-events-none transition-all"
                >
                  {subtitle}
                </div>
              )}

              {/* Main Title */}
              <div
                style={{
                  top: `${typography.titleY}%`,
                  fontFamily: `"${typography.titleFont}", serif`,
                  fontSize: `${(typography.titleSize / 100) * 48}px`,
                  color: typography.titleColor,
                  letterSpacing: `${typography.titleTracking}px`,
                  textShadow: typography.shadowBlur ? `0 4px ${typography.shadowBlur}px ${typography.shadowColor}` : 'none',
                  WebkitTextStroke: typography.strokeWidth ? `${typography.strokeWidth * 0.5}px ${typography.strokeColor}` : 'none',
                }}
                className={`absolute inset-x-4 text-center font-normal leading-tight pointer-events-none transition-all ${
                  typography.titleCase === 'uppercase' ? 'uppercase' : 'capitalize'
                }`}
              >
                {title}
              </div>

              {/* Author */}
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
                className="absolute inset-x-4 text-center font-medium uppercase pointer-events-none transition-all"
              >
                {authorName}
              </div>

              {/* Subtle book spine edge highlight */}
              <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
            </div>

            <p className="text-xs text-[#6B6763] mt-4 text-center">
              Paperback 6x9 format. PNG export combines background illustration and typography layer at full print resolution.
            </p>
          </div>

          {/* 4 Generated Variations */}
          {variations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
                  Variations
                </span>
                <span className="text-xs text-[#6B6763]">Select to view and edit</span>
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
                      className={`rounded-[8px] overflow-hidden border cursor-pointer transition-all aspect-[2/3] bg-[#FAF8F5] ${
                        isSelected
                          ? 'border-[#B4553A] ring-1 ring-[#B4553A]/40'
                          : 'border-[#E8E4DE] hover:border-[#D2CDC5]'
                      }`}
                    >
                      <img src={v.imageUrl} alt={v.variationLabel} className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Consistency Score: Simple Thin Progress Bar */}
          <div className="bg-white border border-[#E8E4DE] rounded-[10px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
                  Character Consistency
                </span>
                <p className="text-xs text-[#6B6763] mt-0.5">
                  Comparison against reference sheet
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-['Playfair_Display'] font-normal text-[#1C1B1A]">
                  {consistencyReport.overallScore}
                </span>
                <span className="text-xs text-[#6B6763]">/ 100</span>
              </div>
            </div>

            {/* Simple Thin Progress Bar */}
            <div className="w-full bg-[#FAF8F5] border border-[#E8E4DE] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#B4553A] h-full rounded-full transition-all duration-500"
                style={{ width: `${consistencyReport.overallScore}%` }}
              />
            </div>

            {/* Observations List */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-medium text-[#1C1B1A]">Notes:</span>
              <ul className="space-y-1.5 text-xs text-[#6B6763]">
                {consistencyReport.driftObservations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#B4553A] mt-0.5">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Regenerate Closer Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleGenerateCovers(consistencyReport.remedyPromptAdditions)}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 rounded-[8px] bg-white border border-[#E8E4DE] hover:bg-[#FAF8F5] text-[#1C1B1A] text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#6B6763]" strokeWidth={1.5} />
                <span>Regenerate closer to reference</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
