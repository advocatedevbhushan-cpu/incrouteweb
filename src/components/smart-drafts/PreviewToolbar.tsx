import React from "react";
import {
  ZoomIn, ZoomOut, RotateCcw, Copy, Printer,
  Download, Maximize2, Minimize2, Sparkles, Check, FileDown
} from "lucide-react";

interface PreviewToolbarProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  onCopy: () => void;
  onPrint: () => void;
  onReset: () => void;
  onDownloadPDF: () => void;
  onDownloadDocx: () => void;
  isCopied: boolean;
  isAutosaved: boolean;
  isFullscreen: boolean;
  setIsFullscreen: (full: boolean) => void;
  canDownload: boolean;
}

export default function PreviewToolbar({
  zoom,
  setZoom,
  onCopy,
  onPrint,
  onReset,
  onDownloadPDF,
  onDownloadDocx,
  isCopied,
  isAutosaved,
  isFullscreen,
  setIsFullscreen,
  canDownload
}: PreviewToolbarProps) {
  return (
    <div className="w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-slate-300">
      
      {/* Zoom and status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setZoom(Math.max(80, zoom - 10))}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-md transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold w-12 text-center select-none">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(130, zoom + 10))}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-md transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 select-none">
          <span className={`w-1.5 h-1.5 rounded-full ${isAutosaved ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
          <span className="text-[9px] font-mono tracking-wider uppercase text-slate-400 font-bold">
            {isAutosaved ? "AUTO-SAVED" : "UNSAVED"}
          </span>
        </div>
      </div>

      {/* Editor & Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Reset draft */}
        <button
          onClick={onReset}
          className="p-2 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-800/80 bg-slate-900/20 text-slate-400 text-[10px] uppercase font-bold tracking-wider"
          title="Reset Draft Fields"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>

        {/* Copy */}
        <button
          onClick={onCopy}
          className="p-2 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-800/80 bg-slate-900/20 text-slate-400 text-[10px] uppercase font-bold tracking-wider"
          title="Copy Document Text"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy
            </>
          )}
        </button>

        {/* Print */}
        <button
          onClick={onPrint}
          className="p-2 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-800/80 bg-slate-900/20 text-slate-400 text-[10px] uppercase font-bold tracking-wider"
          title="Print Document"
        >
          <Printer className="w-3.5 h-3.5" /> Print
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-800/80 bg-slate-900/20 text-slate-400 text-[10px] uppercase font-bold tracking-wider"
          title="Toggle Fullscreen Preview"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />} Preview
        </button>

        {/* Download dropdown / split buttons */}
        <div className="relative flex items-center gap-1">
          <button
            onClick={onDownloadPDF}
            disabled={!canDownload}
            className="px-3.5 py-2 bg-gradient-to-r from-[#4F46E5] to-[#635BFF] hover:from-[#4338CA] hover:to-[#574AE2] text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold shadow-md shadow-indigo-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={onDownloadDocx}
            disabled={!canDownload}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download Word Document (.doc)"
          >
            <FileDown className="w-3.5 h-3.5" /> Word
          </button>
        </div>
      </div>
    </div>
  );
}
