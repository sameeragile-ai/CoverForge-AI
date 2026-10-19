/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Character, BookCover, SeriesPlan, SeriesBookPlan } from './types';
import { demoCharacter, demoSeries, demoCovers } from './demoData';
import { Sidebar } from './components/Sidebar';
import { CharacterStudio } from './components/CharacterStudio';
import { CoverCreator } from './components/CoverCreator';
import { SeriesPlanner } from './components/SeriesPlanner';
import { GalleryView } from './components/GalleryView';
import { PromptModal } from './components/PromptModal';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'create' | 'characters' | 'series' | 'gallery'>('create');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Characters state with localStorage persistence
  const [characters, setCharacters] = useState<Character[]>(() => {
    try {
      const stored = localStorage.getItem('coverforge_characters');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored characters:', e);
    }
    return [demoCharacter];
  });

  const [activeCharacter, setActiveCharacter] = useState<Character | null>(() => {
    return characters[0] || demoCharacter;
  });

  // Series state with localStorage persistence
  const [series, setSeries] = useState<SeriesPlan>(() => {
    try {
      const stored = localStorage.getItem('coverforge_series');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored series:', e);
    }
    return demoSeries;
  });

  // Gallery covers state with localStorage persistence
  const [covers, setCovers] = useState<BookCover[]>(() => {
    try {
      const stored = localStorage.getItem('coverforge_gallery');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored covers:', e);
    }
    return demoCovers;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('coverforge_characters', JSON.stringify(characters));
    } catch (e) {
      console.warn('Error saving characters to storage:', e);
    }
  }, [characters]);

  useEffect(() => {
    try {
      localStorage.setItem('coverforge_series', JSON.stringify(series));
    } catch (e) {
      console.warn('Error saving series to storage:', e);
    }
  }, [series]);

  useEffect(() => {
    try {
      localStorage.setItem('coverforge_gallery', JSON.stringify(covers));
    } catch (e) {
      console.warn('Error saving covers to storage:', e);
    }
  }, [covers]);

  // Handlers
  const handleSaveCharacter = (newChar: Character) => {
    setCharacters((prev) => {
      const filtered = prev.filter((c) => c.id !== newChar.id);
      return [newChar, ...filtered];
    });
    setActiveCharacter(newChar);
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (activeCharacter?.id === id) {
        setActiveCharacter(updated[0] || null);
      }
      return updated;
    });
  };

  const handleSaveCover = (newCover: BookCover) => {
    setCovers((prev) => [newCover, ...prev]);

    // Also update thumbnail in series if matching volume
    if (newCover.volumeNumber) {
      setSeries((prev) => ({
        ...prev,
        books: prev.books.map((b) =>
          b.volume === newCover.volumeNumber
            ? { ...b, coverThumbnail: newCover.imageUrl, consistencyScore: newCover.consistencyReport.overallScore }
            : b
        ),
      }));
    }
  };

  const handleDeleteCover = (id: string) => {
    setCovers((prev) => prev.filter((c) => c.id !== id));
  };

  const handleNavigateToCoverWithBook = (book: SeriesBookPlan) => {
    setCurrentTab('create');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1B1A] flex flex-col md:flex-row antialiased">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#E8E4DE] sticky top-0 z-40">
        <div>
          <span className="font-['Playfair_Display'] text-xl font-normal text-[#1C1B1A]">
            CoverForge
          </span>
          <div className="h-[2px] w-8 bg-gradient-to-r from-[#B4553A] to-[#D9A066] mt-1 rounded-full" />
        </div>

        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 text-[#6B6763] hover:text-[#1C1B1A] rounded-[6px] hover:bg-[#FAF8F5]"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Desktop Sidebar & Mobile Drawer */}
      <div
        className={`${
          isMobileSidebarOpen ? 'block' : 'hidden'
        } md:block fixed md:sticky top-0 z-50 md:z-auto h-screen`}
      >
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          activeCharacter={activeCharacter}
          characters={characters}
          savedCoversCount={covers.length}
          onOpenPromptModal={() => setIsPromptModalOpen(true)}
          onSelectCharacter={(char) => setActiveCharacter(char)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {currentTab === 'create' && (
          <CoverCreator
            activeCharacter={activeCharacter}
            onNavigateToCharacters={() => setCurrentTab('characters')}
            onSaveToGallery={handleSaveCover}
          />
        )}

        {currentTab === 'characters' && (
          <CharacterStudio
            characters={characters}
            activeCharacter={activeCharacter}
            onSelectActiveCharacter={(char) => setActiveCharacter(char)}
            onSaveCharacter={handleSaveCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            onNavigateToCover={() => setCurrentTab('create')}
          />
        )}

        {currentTab === 'series' && (
          <SeriesPlanner
            series={series}
            activeCharacter={activeCharacter}
            onUpdateSeries={setSeries}
            onNavigateToCoverWithBook={handleNavigateToCoverWithBook}
          />
        )}

        {currentTab === 'gallery' && (
          <GalleryView
            covers={covers}
            onDeleteCover={handleDeleteCover}
            onNavigateToCreate={() => setCurrentTab('create')}
          />
        )}
      </main>

      {/* Specification Modal */}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
      />
    </div>
  );
}
