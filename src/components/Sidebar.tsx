import React from 'react';
import {
  Users,
  BookOpen,
  Layers,
  Image as ImageIcon,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Character } from '../types';

interface SidebarProps {
  currentTab: 'create' | 'characters' | 'series' | 'gallery';
  onSelectTab: (tab: 'create' | 'characters' | 'series' | 'gallery') => void;
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
}) => {
  const navItems = [
    {
      id: 'create' as const,
      label: 'Create cover',
      icon: BookOpen,
      count: null,
    },
    {
      id: 'characters' as const,
      label: 'Characters',
      icon: Users,
      count: characters.length,
    },
    {
      id: 'series' as const,
      label: 'Series',
      icon: Layers,
      count: null,
    },
    {
      id: 'gallery' as const,
      label: 'Gallery',
      icon: ImageIcon,
      count: savedCoversCount,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E8E4DE] flex flex-col justify-between h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#E8E4DE]">
        <h1 className="font-['Playfair_Display'] text-2xl font-normal text-[#1C1B1A] tracking-tight">
          CoverForge
        </h1>
        {/* The single signature thin accent line in the header */}
        <div className="h-[2px] w-10 bg-gradient-to-r from-[#B4553A] to-[#D9A066] mt-2.5 rounded-full" />
        <p className="text-xs text-[#6B6763] mt-2 font-normal">
          Book Cover Studio
        </p>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-medium tracking-[0.08em] text-[#6B6763] uppercase">
          Studio
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors ${
                isActive
                  ? 'text-[#1C1B1A] bg-[#FAF8F5] font-semibold'
                  : 'text-[#6B6763] hover:text-[#1C1B1A] hover:bg-[#FAF8F5]'
              }`}
            >
              {/* Active nav indicator: short gradient bar on the left */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-gradient-to-b from-[#B4553A] to-[#D9A066]" />
              )}

              <div className="flex items-center gap-3">
                <Icon
                  className="w-4 h-4 text-[#6B6763]"
                  strokeWidth={1.5}
                />
                <span>{item.label}</span>
              </div>

              {item.count !== null && (
                <span className="text-xs text-[#6B6763] tabular-nums font-normal px-2 py-0.5 rounded bg-white border border-[#E8E4DE]">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Character Pill & Specification Link */}
      <div className="p-4 border-t border-[#E8E4DE] space-y-3 bg-[#FAF8F5]/50">
        {activeCharacter ? (
          <div
            onClick={() => onSelectTab('characters')}
            className="p-3 bg-white rounded-[10px] border border-[#E8E4DE] flex items-center justify-between cursor-pointer hover:border-[#D2CDC5] transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={activeCharacter.referenceImages[0] || activeCharacter.characterSheet.frontView}
                alt={activeCharacter.name}
                className="w-9 h-11 rounded-[6px] object-cover bg-[#FAF8F5] border border-[#E8E4DE] shrink-0"
              />
              <div className="truncate">
                <div className="text-xs font-semibold text-[#1C1B1A] truncate">
                  {activeCharacter.name}
                </div>
                <div className="text-[11px] text-[#6B6763] truncate">
                  Active character
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B6763] shrink-0" strokeWidth={1.5} />
          </div>
        ) : (
          <button
            onClick={() => onSelectTab('characters')}
            className="w-full text-xs py-2 px-3 rounded-[8px] border border-[#E8E4DE] text-[#6B6763] hover:text-[#1C1B1A] bg-white transition-colors"
          >
            Select a character
          </button>
        )}

        <button
          onClick={onOpenPromptModal}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[8px] bg-white hover:bg-[#FAF8F5] text-[#6B6763] hover:text-[#1C1B1A] border border-[#E8E4DE] text-xs font-medium transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-[#6B6763]" strokeWidth={1.5} />
          <span>Build specification</span>
        </button>
      </div>
    </aside>
  );
};
