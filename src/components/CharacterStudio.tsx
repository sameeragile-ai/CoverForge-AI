import React, { useState } from 'react';
import {
  Plus,
  Upload,
  Copy,
  Check,
  Trash2,
  X,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { Character, ArtStyle, CharacterSheetViews } from '../types';
import { createQuackersSvg } from '../demoData';

interface CharacterStudioProps {
  characters: Character[];
  activeCharacter: Character | null;
  onSelectActiveCharacter: (char: Character) => void;
  onSaveCharacter: (char: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onNavigateToCover: () => void;
}

export const CharacterStudio: React.FC<CharacterStudioProps> = ({
  characters,
  activeCharacter,
  onSelectActiveCharacter,
  onSaveCharacter,
  onDeleteCharacter,
  onNavigateToCover,
}) => {
  const [selectedForInspection, setSelectedForInspection] = useState<Character>(
    activeCharacter || characters[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<'prompt' | 'upload'>('prompt');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // New character form state
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formEthnicity, setFormEthnicity] = useState('');
  const [formHair, setFormHair] = useState('');
  const [formEyes, setFormEyes] = useState('');
  const [formBuild, setFormBuild] = useState('');
  const [formClothing, setFormClothing] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formPersonality, setFormPersonality] = useState('');
  const [formStyle, setFormStyle] = useState<ArtStyle>('cinematic-photo');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleCopyLockedPrompt = () => {
    if (!selectedForInspection) return;
    navigator.clipboard.writeText(selectedForInspection.lockedVisualPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 3 - uploadedImages.length;
    const filesToRead = Array.from(files).slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsGenerating(true);

    try {
      let lockedPrompt = '';
      let tagline = '';

      try {
        const res = await fetch('/api/compile-character', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            age: formAge,
            speciesOrEthnicity: formEthnicity,
            hair: formHair,
            eyes: formEyes,
            build: formBuild,
            signatureClothing: formClothing,
            distinguishingFeatures: formFeatures,
            personalityMood: formPersonality,
            artStyle: formStyle,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          lockedPrompt = data.lockedPrompt;
          tagline = data.tagline;
        }
      } catch (err) {
        console.warn('API compile fallback:', err);
      }

      if (!lockedPrompt) {
        lockedPrompt = `${formName}, ${formBuild || 'slender build'}, with ${formHair || 'natural hair'}, ${formEyes || 'expressive eyes'}, wearing ${formClothing || 'signature outfit'}, ${formFeatures || 'distinct features'}. Rendered in ${formStyle} with consistent studio lighting, preserving exact facial geometry and signature elements across every cover.`;
        tagline = `${formPersonality || 'Heroic'} ${formEthnicity || 'Adventurer'}`;
      }

      const sheet: CharacterSheetViews = {
        frontView: uploadedImages[0] || createQuackersSvg({ view: 'front', expression: 'neutral', theme: 'studio' }),
        sideView: uploadedImages[1] || createQuackersSvg({ view: 'side', expression: 'neutral', theme: 'studio' }),
        threeQuarterView: uploadedImages[2] || createQuackersSvg({ view: 'threeQuarter', expression: 'neutral', theme: 'studio' }),
        expressionNeutral: uploadedImages[0] || createQuackersSvg({ view: 'front', expression: 'neutral', theme: 'studio' }),
        expressionDetermined: uploadedImages[0] || createQuackersSvg({ view: 'front', expression: 'determined', theme: 'studio' }),
        expressionSmilingOrFierce: uploadedImages[0] || createQuackersSvg({ view: 'front', expression: 'smiling', theme: 'studio' }),
      };

      const newChar: Character = {
        id: `char-${Date.now()}`,
        name: formName,
        tagline: tagline || `${formName} Character Sheet`,
        age: formAge || 'Unspecified',
        genderOrArchetype: formPersonality || 'Protagonist',
        speciesOrEthnicity: formEthnicity || 'Human',
        hair: formHair || 'Natural',
        eyes: formEyes || 'Expressive',
        build: formBuild || 'Medium',
        signatureClothing: formClothing || 'Signature outfit',
        distinguishingFeatures: formFeatures || 'None',
        personalityMood: formPersonality || 'Determined',
        artStyle: formStyle,
        lockedVisualPrompt: lockedPrompt,
        referenceImages: uploadedImages.length > 0 ? uploadedImages : [sheet.frontView, sheet.threeQuarterView],
        characterSheet: sheet,
        createdAt: Date.now(),
      };

      onSaveCharacter(newChar);
      setSelectedForInspection(newChar);
      onSelectActiveCharacter(newChar);
      setIsModalOpen(false);

      // Reset form
      setFormName('');
      setFormAge('');
      setFormEthnicity('');
      setFormHair('');
      setFormEyes('');
      setFormBuild('');
      setFormClothing('');
      setFormFeatures('');
      setFormPersonality('');
      setUploadedImages([]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1200px] mx-auto w-full space-y-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8E4DE] pb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
            Character Library
          </span>
          <h1 className="font-['Playfair_Display'] text-3xl lg:text-4xl font-normal text-[#1C1B1A] mt-2">
            Characters & Reference Sheets
          </h1>
          <p className="text-[#6B6763] text-sm mt-2 max-w-2xl leading-relaxed">
            Create characters once with multi-angle reference sheets. Their locked visual description is reused across every book cover to keep faces, wardrobe, and style consistent.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-gradient-to-r from-[#B4553A] to-[#D9A066] text-white text-sm font-medium hover:opacity-95 transition-opacity self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span>New character</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Characters List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
              All Characters ({characters.length})
            </span>
            <span className="text-xs text-[#6B6763]">Select to view sheet</span>
          </div>

          <div className="space-y-3">
            {characters.map((char) => {
              const isSelected = selectedForInspection.id === char.id;
              const isActive = activeCharacter?.id === char.id;

              return (
                <div
                  key={char.id}
                  onClick={() => setSelectedForInspection(char)}
                  className={`p-4 rounded-[10px] border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-[#B4553A] ring-1 ring-[#B4553A]/30 shadow-sm'
                      : 'border-[#E8E4DE] hover:border-[#D2CDC5]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={char.referenceImages[0] || char.characterSheet.frontView}
                      alt={char.name}
                      className="w-16 h-22 rounded-[8px] object-cover bg-[#FAF8F5] border border-[#E8E4DE] shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-['Playfair_Display'] text-lg font-normal text-[#1C1B1A] truncate">
                          {char.name}
                        </h3>
                        {isActive && (
                          <span className="text-[11px] font-medium text-[#B4553A] bg-[#FAF8F5] border border-[#E8E4DE] px-2 py-0.5 rounded-[6px] shrink-0">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#6B6763] truncate mt-1">
                        {char.tagline}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[#FAF8F5] text-[#6B6763] border border-[#E8E4DE]">
                          {char.artStyle.replace(/-/g, ' ')}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[#FAF8F5] text-[#6B6763] border border-[#E8E4DE] truncate max-w-[140px]">
                          {char.signatureClothing.split(',')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 pt-3 border-t border-[#E8E4DE] flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectActiveCharacter(char);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${
                        isActive
                          ? 'text-[#B4553A] bg-[#FAF8F5] border border-[#E8E4DE]'
                          : 'text-[#1C1B1A] bg-white border border-[#E8E4DE] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{isActive ? 'Current active' : 'Set as active'}</span>
                    </button>

                    {characters.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove character "${char.name}"?`)) {
                            onDeleteCharacter(char.id);
                          }
                        }}
                        className="p-1.5 text-[#6B6763] hover:text-[#B4553A] rounded-[6px] hover:bg-[#FAF8F5] transition-colors"
                        title="Delete character"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Character Reference Sheet */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#E8E4DE] rounded-[10px] p-6 lg:p-8 space-y-8">
            {/* Sheet Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E4DE] pb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
                  Reference Sheet
                </span>
                <h2 className="font-['Playfair_Display'] text-2xl font-normal text-[#1C1B1A] mt-1">
                  {selectedForInspection.name}
                </h2>
                <p className="text-xs text-[#6B6763] mt-1">
                  {selectedForInspection.tagline}
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectActiveCharacter(selectedForInspection);
                  onNavigateToCover();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] hover:bg-[#FAF8F5] text-xs font-medium transition-colors"
              >
                <span>Create cover with this character</span>
              </button>
            </div>

            {/* 6-Angle Character Sheet Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
                  Canonical Views & Expressions
                </span>
                <span className="text-xs text-[#6B6763]">6 Angle Reference</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label: 'Front', img: selectedForInspection.characterSheet.frontView },
                  { label: 'Profile', img: selectedForInspection.characterSheet.sideView },
                  { label: 'Three-quarter', img: selectedForInspection.characterSheet.threeQuarterView },
                  { label: 'Neutral', img: selectedForInspection.characterSheet.expressionNeutral },
                  { label: 'Determined', img: selectedForInspection.characterSheet.expressionDetermined },
                  { label: 'Smiling', img: selectedForInspection.characterSheet.expressionSmilingOrFierce },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-[8px] bg-[#FAF8F5] border border-[#E8E4DE] p-2 flex flex-col items-center"
                  >
                    <img
                      src={item.img}
                      alt={item.label}
                      className="w-full aspect-[2/3] object-cover rounded-[6px] bg-white border border-[#E8E4DE]"
                    />
                    <span className="text-[11px] text-[#6B6763] mt-2 text-center truncate w-full">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Locked Visual Description Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
                  Locked Visual Description
                </span>

                <button
                  onClick={handleCopyLockedPrompt}
                  className="inline-flex items-center gap-1.5 text-xs text-[#6B6763] hover:text-[#1C1B1A] px-2.5 py-1 rounded-[6px] bg-[#FAF8F5] border border-[#E8E4DE] transition-colors"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#B4553A]" strokeWidth={1.5} />
                      <span className="text-[#B4553A]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-[8px] bg-[#FAF8F5] border border-[#E8E4DE] text-xs text-[#1C1B1A] leading-relaxed">
                {selectedForInspection.lockedVisualPrompt}
              </div>
              <p className="text-xs text-[#6B6763]">
                This locked visual profile is passed in every cover generation prompt to ensure physical traits and clothing remain identical across books.
              </p>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-3 rounded-[8px] bg-[#FAF8F5] border border-[#E8E4DE]">
                <div className="text-[10px] text-[#6B6763] uppercase tracking-[0.08em]">Archetype</div>
                <div className="text-xs font-medium text-[#1C1B1A] mt-1 truncate">
                  {selectedForInspection.speciesOrEthnicity || 'Standard'}
                </div>
              </div>
              <div className="p-3 rounded-[8px] bg-[#FAF8F5] border border-[#E8E4DE]">
                <div className="text-[10px] text-[#6B6763] uppercase tracking-[0.08em]">Signature Wardrobe</div>
                <div className="text-xs font-medium text-[#1C1B1A] mt-1 truncate">
                  {selectedForInspection.signatureClothing.split(',')[0]}
                </div>
              </div>
              <div className="p-3 rounded-[8px] bg-[#FAF8F5] border border-[#E8E4DE]">
                <div className="text-[10px] text-[#6B6763] uppercase tracking-[0.08em]">Features</div>
                <div className="text-xs font-medium text-[#1C1B1A] mt-1 truncate">
                  {selectedForInspection.eyes}
                </div>
              </div>
              <div className="p-3 rounded-[8px] bg-[#FAF8F5] border border-[#E8E4DE]">
                <div className="text-[10px] text-[#6B6763] uppercase tracking-[0.08em]">Style</div>
                <div className="text-xs font-medium text-[#1C1B1A] mt-1 truncate capitalize">
                  {selectedForInspection.artStyle.replace(/-/g, ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW CHARACTER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1B1A]/40 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E4DE] rounded-[10px] w-full max-w-2xl overflow-hidden shadow-lg relative my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E8E4DE] flex items-center justify-between">
              <div>
                <h3 className="font-['Playfair_Display'] text-2xl font-normal text-[#1C1B1A]">
                  New Character
                </h3>
                <p className="text-xs text-[#6B6763] mt-1">
                  Define permanent traits to generate a consistent character sheet.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#6B6763] hover:text-[#1C1B1A] rounded-[6px] hover:bg-[#FAF8F5] transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="px-6 pt-4 flex gap-4 border-b border-[#E8E4DE]">
              <button
                type="button"
                onClick={() => setCreationMode('prompt')}
                className={`pb-3 text-xs font-medium transition-colors border-b-2 ${
                  creationMode === 'prompt'
                    ? 'border-[#B4553A] text-[#1C1B1A]'
                    : 'border-transparent text-[#6B6763] hover:text-[#1C1B1A]'
                }`}
              >
                Describe in text
              </button>

              <button
                type="button"
                onClick={() => setCreationMode('upload')}
                className={`pb-3 text-xs font-medium transition-colors border-b-2 ${
                  creationMode === 'upload'
                    ? 'border-[#B4553A] text-[#1C1B1A]'
                    : 'border-transparent text-[#6B6763] hover:text-[#1C1B1A]'
                }`}
              >
                Upload reference photos (1–3)
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCharacter} className="p-6 space-y-5">
              {creationMode === 'upload' && (
                <div className="space-y-4">
                  <div className="border border-dashed border-[#E8E4DE] hover:border-[#B4553A] rounded-[8px] p-6 text-center cursor-pointer transition-colors bg-[#FAF8F5] relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-[#6B6763] mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-sm font-medium text-[#1C1B1A]">
                      Drop reference images here, or browse
                    </p>
                    <p className="text-xs text-[#6B6763] mt-1">
                      Front view, profile, or costume details (PNG, JPG)
                    </p>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {uploadedImages.map((src, i) => (
                        <div key={i} className="relative rounded-[8px] overflow-hidden border border-[#E8E4DE] aspect-[3/4] bg-[#FAF8F5]">
                          <img src={src} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 p-1 bg-white/90 text-[#1C1B1A] hover:text-[#B4553A] rounded-full shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Character Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#1C1B1A]">Character name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Captain Quackers, Mara Thorne"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#1C1B1A]">Age or Archetype</label>
                  <input
                    type="text"
                    placeholder="e.g. 20s, Mascot, Detective"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#1C1B1A]">Species / Ethnicity</label>
                  <input
                    type="text"
                    placeholder="e.g. Rubber Duck, Human"
                    value={formEthnicity}
                    onChange={(e) => setFormEthnicity(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-xs focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#1C1B1A]">Hair / Crest</label>
                  <input
                    type="text"
                    placeholder="e.g. Dark waves, Yellow vinyl crest"
                    value={formHair}
                    onChange={(e) => setFormHair(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-xs focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#1C1B1A]">Eyes & Expression</label>
                  <input
                    type="text"
                    placeholder="e.g. Black button eyes, Amber eyes"
                    value={formEyes}
                    onChange={(e) => setFormEyes(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-xs focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#1C1B1A]">
                    Signature clothing & colors *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Red knitted wool scarf, brown leather fedora"
                    value={formClothing}
                    onChange={(e) => setFormClothing(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#1C1B1A]">
                    Distinguishing accessories & mood
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gold compass badge on hat, cheerful spirit"
                    value={formFeatures}
                    onChange={(e) => setFormFeatures(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                  />
                </div>
              </div>

              {/* Art Style */}
              <div>
                <label className="text-xs font-medium text-[#1C1B1A]">Art style</label>
                <select
                  value={formStyle}
                  onChange={(e) => setFormStyle(e.target.value as ArtStyle)}
                  className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                >
                  <option value="whimsical-3d-digital">Whimsical 3D Collectible</option>
                  <option value="cinematic-photo">Cinematic Photo</option>
                  <option value="epic-fantasy-oil">Epic Fantasy Oil Painting</option>
                  <option value="digital-anime">Digital Anime / Graphic</option>
                  <option value="dark-noir-ink">Dark Noir Ink</option>
                  <option value="childrens-storybook-watercolor">Children's Storybook Watercolor</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#E8E4DE] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-[8px] text-[#6B6763] hover:text-[#1C1B1A] text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isGenerating || !formName.trim()}
                  className="px-5 py-2.5 rounded-[8px] bg-gradient-to-r from-[#B4553A] to-[#D9A066] text-white font-medium text-sm hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer"
                >
                  {isGenerating ? 'Generating character sheet...' : 'Save character'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
