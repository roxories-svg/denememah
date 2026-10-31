import React from 'react';
import { X, Calendar, AlertCircle, Trash2, Bell, PlusCircle } from 'lucide-react';

export default function Announcements({ 
  isOpen, 
  onClose, 
  announcements = [], 
  isTeacher, 
  onOpenCreateAnnouncement,
  onDeleteAnnouncement 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Mahir Şengün Sınav & Yazılı Duyuruları</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Canlı Firestore
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Fizik yazılı sınav tarihleri, canlı etüt saatleri ve laboratuvar duyuruları
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTeacher && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateAnnouncement();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Duyuru Ekle</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Announcements */}
        <div className="mt-5 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {announcements.length > 0 ? (
            announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-4 sm:p-5 rounded-2xl border transition ${
                  ann.important 
                    ? 'bg-rose-950/15 border-rose-500/40' 
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      ann.important 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                    }`}>
                      {ann.badge || 'Duyuru'}
                    </span>
                    {ann.important && (
                      <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Acil / Önemli
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {ann.date}
                    </span>

                    {isTeacher && onDeleteAnnouncement && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) {
                            onDeleteAnnouncement(ann.id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Duyuruyu Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                  {ann.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-xs text-slate-500">
              Henüz yayınlanmış bir duyuru bulunmuyor.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
