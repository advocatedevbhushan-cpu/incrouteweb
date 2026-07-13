import React, { useEffect, useState } from "react";

interface DraftPreviewProps {
  title: string;
  content: string;
  zoom: number; // e.g. 100, 110, 90
  className?: string;
  fullHeight?: boolean;
}

export default function DraftPreview({ title, content, zoom, className = "", fullHeight = false }: DraftPreviewProps) {
  const [highlightKey, setHighlightKey] = useState<number>(0);

  // Trigger subtle light-purple animation on contents change
  useEffect(() => {
    setHighlightKey(prev => prev + 1);
  }, [content]);

  // Split content by paragraphs to render them cleanly
  const paragraphs = content.split("\n\n");

  return (
    <div className={`w-full bg-[#0B1120] border border-[#1E293B] rounded-3xl p-4 sm:p-6 flex items-center justify-center relative ${
      fullHeight ? "min-h-0 overflow-visible" : "min-h-[500px] overflow-hidden"
    } ${className}`}>
      {/* Scanline overlay for that premium legal terminal look */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0.01)_50%,rgba(255,255,255,0))] bg-[length:100%_4px] opacity-20 pointer-events-none z-20" />

      {/* Scaled paper preview container */}
      <div
        className={`w-full transition-transform duration-200 origin-center ${
          fullHeight ? "max-w-2xl" : "max-w-lg"
        }`}
        style={{ transform: `scale(${zoom / 100})` }}
      >
        <div
          key={highlightKey}
          className={`w-full bg-white text-black p-8 sm:p-12 shadow-2xl rounded-sm flex flex-col justify-between select-text text-left relative custom-scrollbar animate-[pulse-highlight_0.8s_ease-out] ${
            fullHeight ? "min-h-[842px] overflow-visible" : "aspect-[1/1.414] max-h-[620px] overflow-y-auto"
          }`}
          style={{
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          {/* Subtle page header */}
          <div className="border-b border-slate-100 pb-2 mb-6 flex justify-between items-center select-none text-[8px] text-slate-400 font-sans font-bold uppercase tracking-wider">
            <span>Incroute Legal Draft System</span>
            <span>A4 Document Format</span>
          </div>

          {/* Document Content */}
          <div className="flex-1 space-y-4 text-xs leading-[1.7] text-slate-800 text-justify">
            {paragraphs.map((para: string, idx: number) => {
              if (para.trim() === "") return null;
              
              // Highlight document headers differently
              const isHeader = para === para.toUpperCase() && para.length < 100;

              return (
                <p
                  key={idx}
                  className={`${
                    isHeader
                      ? "text-sm font-bold text-slate-900 text-center tracking-wide uppercase pt-1 pb-2"
                      : "indent-6"
                  }`}
                >
                  {para.split("\n").map((line, lIdx) => (
                    <span key={lIdx} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              );
            })}
          </div>

          {/* Page Footer */}
          <div className="border-t border-slate-100 pt-4 mt-8 flex justify-between items-center select-none text-[7px] text-slate-300 font-sans uppercase tracking-widest">
            <span>Copyright © {new Date().getFullYear()} Incroute</span>
            <span>Unsigned Draft</span>
          </div>
        </div>
      </div>

      {/* Styled highlight keyframe injection */}
      <style>{`
        @keyframes pulse-highlight {
          0% { box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.25); background-color: #F5F3FF; }
          100% { box-shadow: 0 4px 20px -2px rgba(0,0,0,0.1); background-color: #FFFFFF; }
        }
      `}</style>
    </div>
  );
}
