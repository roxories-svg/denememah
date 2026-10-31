import React, { useEffect } from 'react';
import { X, Download, ExternalLink, FileText, Lock } from 'lucide-react';

export default function PdfViewerModal({ pdf, onClose, isAuthenticated = false, onRequireAuth }) {
  if (!pdf) return null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {pdf.title}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {pdf.fileName} • {pdf.fileSize || 'PDF'} • Mahir Hoca
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pdf.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Yeni Sekmede Aç"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Yeni Sekmede Aç</span>
            </a>

            <a
              href={pdf.pdfUrl}
              download={pdf.fileName || "yazili_calismasi.pdf"}
              onClick={(event) => {
                if (!isAuthenticated) {
                  event.preventDefault();
                  onRequireAuth?.('PDF indirmek için lütfen giriş yapın veya kayıt olun.');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Iframe Viewer Body */}
        <div className="flex-1 w-full bg-slate-950 relative overflow-hidden">
          <iframe
            src={pdf.pdfUrl}
            title={pdf.title}
            className="w-full h-full border-0"
          />
        </div>

      </div>
    </div>
  );
}
