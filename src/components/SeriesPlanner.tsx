import React, { useState } from 'react';
import {
  Plus,
  ArrowRight,
} from 'lucide-react';
import { SeriesPlan, Character, SeriesBookPlan } from '../types';

interface SeriesPlannerProps {
  series: SeriesPlan;
  activeCharacter: Character | null;
  onUpdateSeries: (updated: SeriesPlan) => void;
  onNavigateToCoverWithBook: (book: SeriesBookPlan) => void;
}

export const SeriesPlanner: React.FC<SeriesPlannerProps> = ({
  series,
  activeCharacter,
  onUpdateSeries,
  onNavigateToCoverWithBook,
}) => {
  const [selectedBookIndex, setSelectedBookIndex] = useState<number>(0);

  const selectedBook = series.books[selectedBookIndex] || series.books[0];

  const handleUpdateBook = (index: number, updates: Partial<SeriesBookPlan>) => {
    const updatedBooks = [...series.books];
    updatedBooks[index] = { ...updatedBooks[index], ...updates };
    onUpdateSeries({ ...series, books: updatedBooks });
  };

  const handleAddBook = () => {
    if (series.books.length >= 5) return;
    const newVol = series.books.length + 1;
    const newBook: SeriesBookPlan = {
      volume: newVol,
      title: `The Next Voyage`,
      subtitle: `Volume ${newVol}`,
      scene: `Exploring a new frontier with signature wardrobe intact and determined gaze`,
      setting: 'Unknown Realm',
      colorPalette: 'Muted Amber, Deep Slate, Chalk White',
      pose: 'Dynamic discovery stance',
      coverThumbnail: activeCharacter?.characterSheet.frontView,
      consistencyScore: 95,
    };
    onUpdateSeries({ ...series, books: [...series.books, newBook] });
  };

  const avgConsistency = Math.round(
    series.books.reduce((acc, b) => acc + (b.consistencyScore || 95), 0) / series.books.length
  );

  return (
    <div className="p-8 lg:p-12 max-w-[1200px] mx-auto w-full space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8E4DE] pb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
            Series Planning
          </span>
          <h1 className="font-['Playfair_Display'] text-3xl lg:text-4xl font-normal text-[#1C1B1A] mt-2">
            {series.seriesTitle}
          </h1>
          <p className="text-[#6B6763] text-sm mt-2 max-w-2xl leading-relaxed">
            Plan a 3 to 5 book series featuring {activeCharacter?.name || 'your character'}. The side-by-side shelf view lets you review visual continuity, title typography, and color progression across volumes.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start md:self-auto">
          {/* Quiet Consistency Metric */}
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#6B6763] block">
              Series consistency
            </span>
            <span className="font-['Playfair_Display'] text-2xl font-normal text-[#1C1B1A]">
              {avgConsistency}%
            </span>
          </div>

          {series.books.length < 5 && (
            <button
              onClick={handleAddBook}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-gradient-to-r from-[#B4553A] to-[#D9A066] text-white text-xs font-medium hover:opacity-95 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Add book {series.books.length + 1}</span>
            </button>
          )}
        </div>
      </div>

      {/* SIDE-BY-SIDE BOOKSTORE SHELF VIEW */}
      <div className="bg-white border border-[#E8E4DE] rounded-[10px] p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
              Series Shelf ({series.books.length} Volumes)
            </span>
            <p className="text-xs text-[#6B6763] mt-0.5">
              Side-by-side comparison for typography scale and character fidelity
            </p>
          </div>
        </div>

        {/* 6x9 Covers Shelf Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
          {series.books.map((book, idx) => {
            const isSelected = selectedBookIndex === idx;
            return (
              <div
                key={book.volume}
                onClick={() => setSelectedBookIndex(idx)}
                className={`group rounded-[10px] border p-3 flex flex-col justify-between transition-all cursor-pointer bg-white ${
                  isSelected
                    ? 'border-[#B4553A] ring-1 ring-[#B4553A]/30 shadow-sm'
                    : 'border-[#E8E4DE] hover:border-[#D2CDC5]'
                }`}
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-[11px] font-medium text-[#6B6763]">
                      Book {book.volume}
                    </span>
                    <span className="text-[11px] font-medium text-[#1C1B1A]">
                      {book.consistencyScore || 96}%
                    </span>
                  </div>

                  {/* 6x9 Book Cover Container */}
                  <div className="relative aspect-[2/3] rounded-[6px] overflow-hidden border border-[#E8E4DE] bg-[#FAF8F5]">
                    <img
                      src={book.coverThumbnail || activeCharacter?.characterSheet.frontView}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Typography */}
                    <div className="absolute inset-x-2 top-3 text-center pointer-events-none">
                      <div className="text-[8px] text-white/80 uppercase tracking-widest font-medium drop-shadow-sm truncate">
                        {book.subtitle}
                      </div>
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider leading-tight mt-0.5 drop-shadow-md truncate">
                        {book.title}
                      </div>
                    </div>

                    <div className="absolute inset-x-2 bottom-2 text-center text-[8px] text-white/90 uppercase tracking-wider font-medium drop-shadow-sm truncate">
                      {series.authorName}
                    </div>

                    {/* Subtle book spine edge highlight */}
                    <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-3 pt-3 border-t border-[#E8E4DE]">
                  <h4 className="text-xs font-semibold text-[#1C1B1A] truncate">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-[#6B6763] truncate mt-0.5">
                    {book.setting}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToCoverWithBook(book);
                    }}
                    className="w-full mt-2.5 py-1.5 px-2 rounded-[6px] bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 text-[#1C1B1A] border border-[#E8E4DE] text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Open in creator</span>
                    <ArrowRight className="w-3 h-3 text-[#6B6763]" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Volume Configuration Details */}
      <div className="bg-white border border-[#E8E4DE] rounded-[10px] p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
              Volume Settings
            </span>
            <h3 className="font-['Playfair_Display'] text-xl font-normal text-[#1C1B1A] mt-1">
              Book {selectedBook.volume}: {selectedBook.title}
            </h3>
          </div>

          <button
            onClick={() => onNavigateToCoverWithBook(selectedBook)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-gradient-to-r from-[#B4553A] to-[#D9A066] text-white text-xs font-medium hover:opacity-95 transition-opacity"
          >
            <span>Create cover for Book {selectedBook.volume}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#1C1B1A]">Book title</label>
              <input
                type="text"
                value={selectedBook.title}
                onChange={(e) => handleUpdateBook(selectedBookIndex, { title: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#1C1B1A]">Subtitle</label>
              <input
                type="text"
                value={selectedBook.subtitle}
                onChange={(e) => handleUpdateBook(selectedBookIndex, { subtitle: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#1C1B1A]">Setting & Environment</label>
              <input
                type="text"
                value={selectedBook.setting}
                onChange={(e) => handleUpdateBook(selectedBookIndex, { setting: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#1C1B1A]">Scene description</label>
              <textarea
                rows={3}
                value={selectedBook.scene}
                onChange={(e) => handleUpdateBook(selectedBookIndex, { scene: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-sm focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#1C1B1A]">Color palette</label>
                <input
                  type="text"
                  value={selectedBook.colorPalette}
                  onChange={(e) => handleUpdateBook(selectedBookIndex, { colorPalette: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-xs focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#1C1B1A]">Character pose</label>
                <input
                  type="text"
                  value={selectedBook.pose}
                  onChange={(e) => handleUpdateBook(selectedBookIndex, { pose: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-[8px] bg-white border border-[#E8E4DE] text-[#1C1B1A] text-xs focus:outline-none focus:border-[#B4553A] focus:ring-1 focus:ring-[#B4553A]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
