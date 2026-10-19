import React, { useState } from 'react';
import {
  Download,
  Trash2,
  X,
  Eye,
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
    <div className="p-8 lg:p-12 max-w-[1200px] mx-auto w-full space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8E4DE] pb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
            Portfolio
          </span>
          <h1 className="font-['Playfair_Display'] text-3xl lg:text-4xl font-normal text-[#1C1B1A] mt-2">
            Cover Gallery
          </h1>
          <p className="text-[#6B6763] text-sm mt-2 max-w-xl leading-relaxed">
            Archive of completed 6x9 book covers. Download print-ready high-resolution PNGs with composite typography.
          </p>
        </div>

        <button
          onClick={onNavigateToCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-gradient-to-r from-[#B4553A] to-[#D9A066] text-white text-sm font-medium hover:opacity-95 transition-opacity self-start md:self-auto cursor-pointer"
        >
          <span>Create cover</span>
        </button>
      </div>

      {/* Empty State */}
      {covers.length === 0 ? (
        <div className="p-12 text-center rounded-[10px] bg-white border border-[#E8E4DE] max-w-md mx-auto my-12">
          <h3 className="font-['Playfair_Display'] text-xl font-normal text-[#1C1B1A]">
            No covers saved yet
          </h3>
          <p className="text-[#6B6763] text-xs mt-2 leading-relaxed">
            Generate and save book covers in the studio to build your series archive.
          </p>
          <button
            onClick={onNavigateToCreate}
            className="mt-6 px-4 py-2 rounded-[8px] bg-gradient-to-r from-[#B4553A] to-[#D9A066] text-white font-medium text-xs hover:opacity-95 transition-opacity"
          >
            Create first cover
          </button>
        </div>
      ) : (
        /* Bookstore Shelf Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {covers.map((cover) => (
            <div
              key={cover.id}
              className="group bg-white border border-[#E8E4DE] hover:border-[#D2CDC5] rounded-[10px] p-3 flex flex-col justify-between transition-all hover:shadow-sm"
            >
              {/* 6x9 Book Cover Container */}
              <div
                onClick={() => setInspectingCover(cover)}
                className="relative aspect-[2/3] rounded-[6px] overflow-hidden cursor-pointer bg-[#FAF8F5] border border-[#E8E4DE]"
              >
                <img
                  src={cover.imageUrl}
                  alt={cover.title}
                  className="w-full h-full object-cover"
                />

                {/* Typography Overlay Simulation */}
                <div className="absolute inset-x-3 top-4 text-center pointer-events-none">
                  {cover.typography.showSubtitle && cover.subtitle && (
                    <div className="text-[9px] text-white/90 uppercase tracking-widest font-medium drop-shadow-sm truncate">
                      {cover.subtitle}
                    </div>
                  )}
                  <div className="text-sm font-bold text-white uppercase tracking-wider drop-shadow-md leading-tight mt-0.5 truncate">
                    {cover.title}
                  </div>
                </div>

                <div className="absolute inset-x-3 bottom-3 text-center text-[10px] text-white/90 uppercase tracking-wider font-medium drop-shadow-sm truncate">
                  {cover.authorName}
                </div>

                {/* Subtle book spine edge highlight */}
                <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

                {/* Consistency score pill */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[4px] bg-white/90 backdrop-blur-sm border border-[#E8E4DE] text-[10px] font-medium text-[#1C1B1A]">
                  {cover.consistencyReport.overallScore}%
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="pt-3 space-y-2">
                <div>
                  <h3 className="font-['Playfair_Display'] text-base font-normal text-[#1C1B1A] truncate" title={cover.title}>
                    {cover.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-[#6B6763] mt-0.5">
                    <span className="capitalize">{cover.genre}</span>
                    <span>{cover.characterName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8E4DE] text-xs">
                  <button
                    onClick={() => handleDownload(cover)}
                    className="inline-flex items-center gap-1.5 text-[#1C1B1A] hover:text-[#B4553A] font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Download</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setInspectingCover(cover)}
                      className="p-1.5 text-[#6B6763] hover:text-[#1C1B1A] rounded-[4px] hover:bg-[#FAF8F5]"
                      title="Inspect"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${cover.title}"?`)) {
                          onDeleteCover(cover.id);
                        }
                      }}
                      className="p-1.5 text-[#6B6763] hover:text-[#B4553A] rounded-[4px] hover:bg-[#FAF8F5]"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
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
        <div className="fixed inset-0 z-50 bg-[#1C1B1A]/40 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E4DE] rounded-[10px] w-full max-w-3xl overflow-hidden shadow-lg relative my-8">
            <div className="p-6 border-b border-[#E8E4DE] flex items-center justify-between">
              <div>
                <h3 className="font-['Playfair_Display'] text-2xl font-normal text-[#1C1B1A]">
                  {inspectingCover.title}
                </h3>
                <p className="text-xs text-[#6B6763] mt-1">
                  By {inspectingCover.authorName} • {inspectingCover.genre.toUpperCase()}
                </p>
              </div>

              <button
                onClick={() => setInspectingCover(null)}
                className="p-2 text-[#6B6763] hover:text-[#1C1B1A] rounded-[6px] hover:bg-[#FAF8F5]"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Cover Preview Stage */}
              <div className="relative aspect-[2/3] rounded-[6px] overflow-hidden border border-[#E8E4DE] bg-[#FAF8F5]">
                <img
                  src={inspectingCover.imageUrl}
                  alt={inspectingCover.title}
                  className="w-full h-full object-cover"
                />

                <div
                  style={{
                    top: `${inspectingCover.typography.titleY}%`,
                    fontFamily: `"${inspectingCover.typography.titleFont}", serif`,
                    fontSize: `${(inspectingCover.typography.titleSize / 100) * 44}px`,
                    color: inspectingCover.typography.titleColor,
                    letterSpacing: `${inspectingCover.typography.titleTracking}px`,
                    textShadow: `0 3px 12px ${inspectingCover.typography.shadowColor}`,
                  }}
                  className="absolute inset-x-3 text-center font-normal uppercase leading-tight pointer-events-none"
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
                  className="absolute inset-x-3 text-center font-medium uppercase pointer-events-none"
                >
                  {inspectingCover.authorName}
                </div>
              </div>

              {/* Metadata Details */}
              <div className="space-y-4">
                <div className="p-4 rounded-[8px] bg-[#FAF8F5] border border-[#E8E4DE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6763]">
                      Consistency Score
                    </span>
                    <span className="font-['Playfair_Display'] text-xl font-normal text-[#1C1B1A]">
                      {inspectingCover.consistencyReport.overallScore}%
                    </span>
                  </div>
                  <ul className="text-xs text-[#6B6763] space-y-1 pt-1">
                    {inspectingCover.consistencyReport.driftObservations.map((obs, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#B4553A]">•</span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-[8px] bg-[#FAF8F5] border border-[#E8E4DE] space-y-1 text-xs">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-[#6B6763]">Scene Prompt</div>
                  <div className="text-[#1C1B1A] leading-relaxed">{inspectingCover.scenePrompt}</div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleDownload(inspectingCover)}
                    className="w-full py-3 rounded-[8px] bg-gradient-to-r from-[#B4553A] to-[#D9A066] text-white font-medium text-sm hover:opacity-95 transition-opacity inline-flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" strokeWidth={1.5} />
                    <span>Download 6x9 PNG</span>
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
