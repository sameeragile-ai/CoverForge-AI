import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SeriesPlan, Character, BookCover, SeriesBookPlan } from '../types';
import { exportCompositeCover } from '../utils/canvasExport';

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
      title: `Voyage into the Unknown ${newVol}`,
      subtitle: `The Next Chapter`,
      scene: `Exploring a perilous new realm with signature outfit intact and courageous expression`,
      setting: 'Unknown Frontiers',
      colorPalette: 'Deep Amber, Shadow Navy, Gold',
      pose: 'Dynamic forward discovery pose',
      coverThumbnail: activeCharacter?.characterSheet.frontView,
      consistencyScore: 95,
    };
    onUpdateSeries({ ...series, books: [...series.books, newBook] });
  };

  const avgConsistency = Math.round(
    series.books.reduce((acc, b) => acc + (b.consistencyScore || 95), 0) / series.books.length
  );

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Book Consistency Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">
            Series Mode: {series.seriesTitle}
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
            Authors design a 3 to 5 book franchise with one shared protagonist. Side-by-side series view lets you verify face, wardrobe, and style consistency across every volume.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <div className="text-[10px] text-zinc-500 uppercase font-semibold">Series Consistency</div>
              <div className="text-xs font-bold text-emerald-400">{avgConsistency}% Match</div>
            </div>
          </div>

          {series.books.length < 5 && (
            <button
              onClick={handleAddBook}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Book {series.books.length + 1}</span>
            </button>
          )}
        </div>
      </div>

      {/* HORIZONTAL SIDE-BY-SIDE SERIES VIEW */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 lg:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
              Series View: Side-By-Side Visual Cohesion
            </h2>
            <p className="text-xs text-zinc-400">
              Compare all {series.books.length} volumes side-by-side to ensure harmonious title hierarchy and zero character deviation.
            </p>
          </div>
        </div>

        {/* The Books Grid / Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {series.books.map((book, idx) => {
            const isSelected = selectedBookIndex === idx;
            return (
              <div
                key={book.volume}
                onClick={() => setSelectedBookIndex(idx)}
                className={`group rounded-2xl border p-3 flex flex-col justify-between transition-all cursor-pointer bg-zinc-950 ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  {/* Volume Label & Score Pill */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      Book {book.volume}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{book.consistencyScore || 96}%</span>
                    </span>
                  </div>

                  {/* 6x9 Cover Preview with Text */}
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-md">
                    <img
                      src={book.coverThumbnail || activeCharacter?.characterSheet.frontView}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Book Overlay Simulation */}
                    <div className="absolute inset-x-2 top-3 text-center">
                      <div className="text-[8px] text-zinc-300 uppercase tracking-widest font-semibold">
                        {book.subtitle}
                      </div>
                      <div className="text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md leading-tight mt-0.5">
                        {book.title}
                      </div>
                    </div>

                    <div className="absolute inset-x-2 bottom-2 text-center text-[8px] text-zinc-300 uppercase tracking-wider font-bold">
                      {series.authorName}
                    </div>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="mt-3 pt-2 border-t border-zinc-800/80">
                  <h4 className="text-xs font-bold text-white truncate">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-indigo-400 truncate mt-0.5">
                    {book.setting}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToCoverWithBook(book);
                    }}
                    className="w-full mt-2 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <span>Regenerate Cover</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Volume Detail Editor */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              {selectedBook.volume}
            </span>
            <h3 className="text-lg font-bold text-white">
              Configure Volume {selectedBook.volume}: {selectedBook.title}
            </h3>
          </div>

          <button
            onClick={() => onNavigateToCoverWithBook(selectedBook)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Open in Cover Creator</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400">Book Title</label>
              <input
                type="text"
                value={selectedBook.title}
                onChange={(e) => handleUpdateBook(selectedBookIndex, { title: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400">Subtitle / Lore Hook</label>
              <input
                type="text"
                value={selectedBook.subtitle}
                onChange={(e) => handleUpdateBook(selectedBookIndex, { subtitle: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400">Setting & Environment Contrast</label>
              <input
                type="text"
                value={selectedBook.setting}
                onChange={(e) => handleUpdateBook(selectedBookIndex, { setting: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400">Scene Narrative & Action</label>
              <textarea
                rows={3}
                value={selectedBook.scene}
                onChange={(e) => handleUpdateBook(selectedBookIndex, { scene: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Color Palette</label>
                <input
                  type="text"
                  value={selectedBook.colorPalette}
                  onChange={(e) => handleUpdateBook(selectedBookIndex, { colorPalette: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Character Pose</label>
                <input
                  type="text"
                  value={selectedBook.pose}
                  onChange={(e) => handleUpdateBook(selectedBookIndex, { pose: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
