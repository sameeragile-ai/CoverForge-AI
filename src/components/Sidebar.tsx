import React from 'react';
import {
  Users,
  BookOpen,
  Layers,
  Sparkles,
  FileCode2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Character } from '../types';

interface SidebarProps {
  currentTab: 'characters' | 'create' | 'series' | 'gallery';
  onSelectTab: (tab: 'characters' | 'create' | 'series' | 'gallery') => void;
  activeCharacter: Character | null;
  characters: Character[];
  savedCoversCount: number;
  onOpenPromptModal: () => void;
  onSelectCharacter: (char: Character) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeCharacter,
  characters,
  savedCoversCount,
  onOpenPromptModal,
  onSelectCharacter,
}) => {
  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between h-screen shrink-0 sticky top-0 select-none">
      {/* Brand & Tagline */}
      <div className="p-5 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white font-['Plus_Jakarta_Sans']">
                CoverForge
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                AI Studio
              </span>
            </div>
            <p className="text-xs text-zinc-400">Consistent Book Covers</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
          Studio Navigation
        </div>

        <button
          onClick={() => onSelectTab('create')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'create'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Create Cover</span>
          </div>
          <span className="text-xs bg-indigo-950/60 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">
            4-Var
          </span>
        </button>

        <button
          onClick={() => onSelectTab('characters')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'characters'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Character Studio</span>
          </div>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
            {characters.length}
          </span>
        </button>

        <button
          onClick={() => onSelectTab('series')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'series'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Series Planner</span>
          </div>
          <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/40">
            Series View
          </span>
        </button>

        <button
          onClick={() => onSelectTab('gallery')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'gallery'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Cover Gallery</span>
          </div>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
            {savedCoversCount}
          </span>
        </button>

        {/* Consistency Engine Feature Tag */}
        <div className="pt-6 px-3">
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800/90 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Identity Lock Engine</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Gemini Vision verifies 0-100 character fidelity on facial features, accessories, and art style across every cover.
            </p>
          </div>
        </div>
      </div>

      {/* Active Character Drawer & Prompt Modal Button */}
      <div className="p-3.5 border-t border-zinc-800 space-y-2.5 bg-zinc-950/60">
        {/* Active Character Pill */}
        {activeCharacter ? (
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={activeCharacter.referenceImages[0] || activeCharacter.characterSheet.frontView}
                alt={activeCharacter.name}
                className="w-9 h-9 rounded-lg object-cover border border-amber-400/40 bg-zinc-800 shrink-0"
              />
              <div className="truncate">
                <div className="text-xs font-bold text-zinc-200 truncate flex items-center gap-1">
                  <span>{activeCharacter.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {activeCharacter.speciesOrEthnicity || activeCharacter.genderOrArchetype}
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('characters')}
              title="Change active character"
              className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSelectTab('characters')}
            className="w-full text-xs py-2 px-3 rounded-lg border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 flex items-center justify-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Select or Create Character</span>
          </button>
        )}

        {/* View Specification Prompt Modal Button */}
        <button
          onClick={onOpenPromptModal}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-all"
        >
          <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Copy AI Studio Build Prompt</span>
        </button>
      </div>
    </aside>
  );
};
