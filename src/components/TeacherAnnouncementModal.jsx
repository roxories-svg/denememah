import React, { useState } from 'react';
import { X, Bell, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { addAnnouncementToFirestore } from '../firebase';

export default function TeacherAnnouncementModal({ isOpen, onClose, onAnnouncementCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [badge, setBadge] = useState('1. Yazılı Sınavı');
  const [important, setImportant] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Lütfen duyuru başlığını ve içeriğini giriniz.');
      return;
    }

    try {
      setSubmitting(true);
      const newAnn = await addAnnouncementToFirestore({
        title: title.trim(),
        content: content.trim(),
        badge: badge.trim(),
        important
      });

      if (onAnnouncementCreated) {
        onAnnouncementCreated(newAnn);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('Duyuru eklenirken hata: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Yeni Duyuru Yayınla</h2>
              <p className="text-xs text-slate-400">Mahir Şengün • Tüm öğrencilere anlık canlı duyuru paneli</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Duyuru Başlığı *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 1. Dönem 1. Yazılı Sınav Tarihi ve Konuları"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kategori / Etiket
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="1. Yazılı Sınavı">1. Yazılı Sınavı</option>
                <option value="Yazılı Çalışma Föyü">Yazılı Çalışma Föyü</option>
                <option value="Online Etüt">Online Etüt</option>
                <option value="Lab Ödevi">Lab Ödevi</option>
                <option value="Genel Duyuru">Genel Duyuru</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Önem Durumu
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={important}
                  onChange={(e) => setImportant(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className={important ? 'text-rose-400 font-bold' : ''}>Kırmızı Acil Uyarılı</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Duyuru Detayı ve Mesajınız *
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Öğrencilerinizin bilmesi gereken sınav ayrıntılarını, ders saatini ve hazırlık tavsiyelerini yazınız..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 leading-relaxed font-sans"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-950/40 transition cursor-pointer flex items-center gap-2"
            >
              {submitting ? 'Yayınlanıyor...' : 'Duyuruyu Canlıya Gönder'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
