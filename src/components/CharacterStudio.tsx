import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Upload,
  Lock,
  Copy,
  Check,
  CheckCircle2,
  Trash2,
  Eye,
  Sliders,
  Palette,
  X,
  FileText,
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
      // Compile locked prompt via server API or fallback
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
        lockedPrompt = `${formName}, ${formBuild || 'slender'}, with ${formHair || 'chestnut waves'}, ${formEyes || 'intense eyes'}, wearing ${formClothing || 'signature jacket'}, ${formFeatures || 'distinct charm'}. Rendered in ${formStyle} with consistent volumetric lighting, keeping exact facial symmetry and costume motifs across generations.`;
        tagline = `${formPersonality || 'Intrepid'} ${formEthnicity || 'Adventurer'}`;
      }

      // Generate visual sheet (either from uploaded image or procedural generator)
      const primaryRef = uploadedImages[0] || createQuackersSvg({ theme: 'studio' });
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
        tagline: tagline || `${formName} Identity Sheet`,
        age: formAge || 'Unknown',
        genderOrArchetype: formPersonality || 'Protagonist',
        speciesOrEthnicity: formEthnicity || 'Human',
        hair: formHair || 'Distinct styling',
        eyes: formEyes || 'Expressive eyes',
        build: formBuild || 'Medium build',
        signatureClothing: formClothing || 'Signature outfit',
        distinguishingFeatures: formFeatures || 'None',
        personalityMood: formPersonality || 'Heroic',
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
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Lock className="w-3.5 h-3.5" />
            <span>Character Identity Lock</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">
            Character Studio & Library
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
            Create your character once with multi-angle reference sheets. Their locked visual prompt is automatically injected into all future book covers to prevent facial, hair, and costume drift.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Character</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Library on Left, Selected Character Sheet on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Character Library Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
              Saved Characters ({characters.length})
            </h2>
            <span className="text-xs text-zinc-500">Click to view sheet</span>
          </div>

          <div className="space-y-3">
            {characters.map((char) => {
              const isSelected = selectedForInspection.id === char.id;
              const isActive = activeCharacter?.id === char.id;

              return (
                <div
                  key={char.id}
                  onClick={() => setSelectedForInspection(char)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-zinc-900 border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                      : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={char.referenceImages[0] || char.characterSheet.frontView}
                      alt={char.name}
                      className="w-16 h-20 rounded-xl object-cover bg-zinc-950 border border-zinc-700/80 shrink-0 shadow-sm"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white truncate">
                          {char.name}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 shrink-0">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-indigo-400 font-medium truncate mt-0.5">
                        {char.tagline}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {char.artStyle.replace(/-/g, ' ')}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-800">
                          {char.signatureClothing.split(',')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectActiveCharacter(char);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/50'
                          : 'text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Active for Covers' : 'Set as Active'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {characters.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete character "${char.name}"?`)) {
                              onDeleteCharacter(char.id);
                            }
                          }}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Delete character"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Character Sheet Inspector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-7 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white">
                    {selectedForInspection.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Character Sheet
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mt-0.5">
                  {selectedForInspection.tagline}
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectActiveCharacter(selectedForInspection);
                  onNavigateToCover();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Covers with {selectedForInspection.name.split(' ')[0]}</span>
              </button>
            </div>

            {/* 6-Angle Character Sheet Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Multi-Angle Reference Sheet & Expressions</span>
                </span>
                <span className="text-[11px] text-zinc-500">6 Verified Canonical Angles</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {[
                  { label: 'Front View', img: selectedForInspection.characterSheet.frontView },
                  { label: 'Side Profile', img: selectedForInspection.characterSheet.sideView },
                  { label: '3/4 Perspective', img: selectedForInspection.characterSheet.threeQuarterView },
                  { label: 'Neutral', img: selectedForInspection.characterSheet.expressionNeutral },
                  { label: 'Determined', img: selectedForInspection.characterSheet.expressionDetermined },
                  { label: 'Smiling / Joy', img: selectedForInspection.characterSheet.expressionSmilingOrFierce },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-xl bg-zinc-950 border border-zinc-800 p-1.5 flex flex-col items-center hover:border-zinc-700 transition-all"
                  >
                    <img
                      src={item.img}
                      alt={item.label}
                      className="w-full aspect-[2/3] object-cover rounded-lg bg-zinc-900 border border-zinc-800/80"
                    />
                    <span className="text-[10px] font-semibold text-zinc-400 mt-1.5 truncate text-center w-full">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Locked Visual Description Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked Visual Description (Prompt Anchor)</span>
                </label>

                <button
                  onClick={handleCopyLockedPrompt}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Anchor</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 text-xs text-zinc-300 font-mono leading-relaxed relative">
                {selectedForInspection.lockedVisualPrompt}
              </div>
              <p className="text-[11px] text-zinc-500">
                This exact prompt block is injected into every Gemini cover request alongside reference image conditioning to guarantee consistent physical structure.
              </p>
            </div>

            {/* Physical Traits Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Species / Type</div>
                <div className="text-xs font-bold text-zinc-200 mt-0.5 truncate">
                  {selectedForInspection.speciesOrEthnicity || 'Standard'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Signature Wardrobe</div>
                <div className="text-xs font-bold text-zinc-200 mt-0.5 truncate">
                  {selectedForInspection.signatureClothing.split(',')[0]}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Eyes & Features</div>
                <div className="text-xs font-bold text-zinc-200 mt-0.5 truncate">
                  {selectedForInspection.eyes}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Art Style</div>
                <div className="text-xs font-bold text-indigo-400 mt-0.5 truncate capitalize">
                  {selectedForInspection.artStyle.replace(/-/g, ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE NEW CHARACTER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Create New Character Profile</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Set up a permanent character anchor with locked traits and multi-angle sheets.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Creation Mode Tabs: Option A vs Option B */}
            <div className="px-6 pt-4 flex gap-2 border-b border-zinc-800">
              <button
                type="button"
                onClick={() => setCreationMode('prompt')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                  creationMode === 'prompt'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Option B: Describe in Text</span>
              </button>

              <button
                type="button"
                onClick={() => setCreationMode('upload')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                  creationMode === 'upload'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Option A: Upload Reference Photos (1-3)</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCharacter} className="p-6 space-y-5">
              {creationMode === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/80 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-zinc-950/50 relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-zinc-200">
                      Upload 1 to 3 reference images
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Front face, 3/4 profile, or costume details (PNG, JPG, WebP)
                    </p>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {uploadedImages.map((src, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden border border-zinc-700 aspect-[3/4] bg-zinc-950">
                          <img src={src} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Core Information Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Character Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Captain Quackers, Mara Thorne"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">Age / Archetype</label>
                  <input
                    type="text"
                    placeholder="e.g. Mid-20s, Timeless Mascot, 40s Detective"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Species / Ethnicity</label>
                  <input
                    type="text"
                    placeholder="e.g. Yellow Duck, Nordic, Elf"
                    value={formEthnicity}
                    onChange={(e) => setFormEthnicity(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">Hair / Head Crest</label>
                  <input
                    type="text"
                    placeholder="e.g. Short raven hair, Vinyl crest"
                    value={formHair}
                    onChange={(e) => setFormHair(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">Eyes & Expression</label>
                  <input
                    type="text"
                    placeholder="e.g. Amber eyes, Glossy black buttons"
                    value={formEyes}
                    onChange={(e) => setFormEyes(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">
                    Signature Clothing & Colors *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Red knitted wool scarf, brown leather explorer fedora"
                    value={formClothing}
                    onChange={(e) => setFormClothing(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">
                    Distinguishing Accessories & Personality
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gold compass badge on hat, fearless cheerful spirit"
                    value={formFeatures}
                    onChange={(e) => setFormFeatures(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Art Style Selector */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Art Style Preset</span>
                </label>
                <select
                  value={formStyle}
                  onChange={(e) => setFormStyle(e.target.value as ArtStyle)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="whimsical-3d-digital">Whimsical 3D Digital Collectible (Pixar / Vinyl)</option>
                  <option value="cinematic-photo">Cinematic Photo (Photorealistic & Dramatic)</option>
                  <option value="epic-fantasy-oil">Epic Fantasy Oil Painting (Rich Textures)</option>
                  <option value="digital-anime">Modern Digital Anime / Graphic</option>
                  <option value="dark-noir-ink">Dark Noir Ink & Comic</option>
                  <option value="childrens-storybook-watercolor">Children's Storybook Watercolor</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isGenerating || !formName.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Locking Identity & Generating Sheet...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Lock Character & Generate Sheet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
