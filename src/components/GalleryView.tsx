import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Trash2,
  ShieldCheck,
  Eye,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { BookCover } from '../types';
import { exportCompositeCover } from '../utils/canvasExport';

interface GalleryViewProps {
  covers: BookCover[];
  onDeleteCover: (id: string) => void;
  onNavigateToCreate: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  covers,
  onDeleteCover,
  onNavigateToCreate,
}) => {
  const [inspectingCover, setInspectingCover] = useState<BookCover | null>(null);

  const handleDownload = async (cover: BookCover) => {
    try {
      await exportCompositeCover(
        cover.imageUrl,
        cover.title,
        cover.subtitle,
        cover.authorName,
        cover.typography,
        `${cover.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-cover.png`
      );
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Master Cover Portfolio</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">
            Saved Book Cover Gallery ({covers.length})
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Export ready-to-publish 6x9 print covers compositing high-resolution character background art with your custom typography.
          </p>
        </div>

        <button
          onClick={onNavigateToCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Create New Cover</span>
        </button>
      </div>

      {/* Empty State */}
      {covers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800 max-w-md mx-auto my-12">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Covers Saved Yet</h3>
          <p className="text-zinc-400 text-xs mt-1">
            Generate your first character-consistent cover in the studio and save it here.
          </p>
          <button
            onClick={onNavigateToCreate}
            className="mt-5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            Open Cover Creator
          </button>
        </div>
      ) : (
        /* Covers Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {covers.map((cover) => (
            <div
              key={cover.id}
              className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-lg hover:shadow-2xl"
            >
              {/* Cover Card Image Stage */}
              <div
                onClick={() => setInspectingCover(cover)}
                className="relative aspect-[2/3] overflow-hidden cursor-pointer bg-zinc-950"
              >
                <img
                  src={cover.imageUrl}
                  alt={cover.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Simulated typographic overlay on thumbnail */}
                <div className="absolute inset-x-3 top-4 text-center pointer-events-none">
                  {cover.typography.showSubtitle && cover.subtitle && (
                    <div className="text-[9px] text-zinc-300 uppercase tracking-widest font-semibold drop-shadow">
                      {cover.subtitle}
                    </div>
                  )}
                  <div className="text-sm font-black text-amber-300 uppercase tracking-wider drop-shadow-md leading-tight mt-0.5">
                    {cover.title}
                  </div>
                </div>

                <div className="absolute inset-x-3 bottom-3 text-center text-[10px] text-zinc-200 uppercase tracking-wider font-bold drop-shadow">
                  {cover.authorName}
                </div>

                {/* Score Pill Badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-emerald-500/40 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{cover.consistencyReport.overallScore}%</span>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white truncate" title={cover.title}>
                    {cover.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                    <span className="capitalize text-indigo-400 font-medium">
                      {cover.genre}
                    </span>
                    <span>{cover.characterName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                  <button
                    onClick={() => handleDownload(cover)}
                    className="flex items-center gap-1 text-zinc-300 hover:text-white font-medium hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setInspectingCover(cover)}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                      title="Inspect full resolution"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${cover.title}"?`)) {
                          onDeleteCover(cover.id);
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg"
                      title="Delete cover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INSPECT MODAL */}
      {inspectingCover && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-8">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {inspectingCover.title}
                </h3>
                <p className="text-xs text-zinc-400">
                  By {inspectingCover.authorName} • {inspectingCover.genre.toUpperCase()}
                </p>
              </div>

              <button
                onClick={() => setInspectingCover(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Cover Preview Stage */}
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 bg-zinc-950">
                <img
                  src={inspectingCover.imageUrl}
                  alt={inspectingCover.title}
                  className="w-full h-full object-cover"
                />

                <div
                  style={{
                    top: `${inspectingCover.typography.titleY}%`,
                    fontFamily: `"${inspectingCover.typography.titleFont}", sans-serif`,
                    fontSize: `${(inspectingCover.typography.titleSize / 100) * 44}px`,
                    color: inspectingCover.typography.titleColor,
                    letterSpacing: `${inspectingCover.typography.titleTracking}px`,
                    textShadow: `0 3px 12px ${inspectingCover.typography.shadowColor}`,
                  }}
                  className="absolute inset-x-3 text-center font-extrabold uppercase leading-tight pointer-events-none"
                >
                  {inspectingCover.title}
                </div>

                <div
                  style={{
                    top: `${inspectingCover.typography.authorY}%`,
                    fontFamily: `"${inspectingCover.typography.authorFont}", sans-serif`,
                    fontSize: `${(inspectingCover.typography.authorSize / 100) * 26}px`,
                    color: inspectingCover.typography.authorColor,
                    letterSpacing: `${inspectingCover.typography.authorTracking}px`,
                    textShadow: `0 2px 8px ${inspectingCover.typography.shadowColor}`,
                  }}
                  className="absolute inset-x-3 text-center font-bold uppercase pointer-events-none"
                >
                  {inspectingCover.authorName}
                </div>
              </div>

              {/* Metadata & Consistency Details */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase">
                      Consistency Score
                    </span>
                    <span className="text-lg font-black text-emerald-400">
                      {inspectingCover.consistencyReport.overallScore}% Match
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Verdict: <strong className="text-white">{inspectingCover.consistencyReport.verdict}</strong>
                  </p>
                  <ul className="text-[11px] text-zinc-400 space-y-1 pt-1">
                    {inspectingCover.consistencyReport.driftObservations.map((obs, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5 text-xs">
                  <div className="text-zinc-500 uppercase font-semibold text-[10px]">Scene Prompt</div>
                  <div className="text-zinc-300">{inspectingCover.scenePrompt}</div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleDownload(inspectingCover)}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full Resolution 6x9 PNG</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
