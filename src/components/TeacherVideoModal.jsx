import React, { useState } from 'react';
import { X, PlayCircle, Link2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { addTubeVideoToFirestore } from '../firebase';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../utils/youtube';

export default function TeacherVideoModal({ isOpen, onClose, onVideoCreated }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!title.trim() || !subject.trim() || !youtubeLink.trim()) {
      setError('Video başlığı, konu adı ve YouTube bağlantısını doldurun.');
      return;
    }

    const videoId = extractYouTubeId(youtubeLink);
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      setError('Geçerli bir YouTube video bağlantısı veya 11 karakterlik Video ID girin.');
      return;
    }

    const customThumbnail = thumbnailUrl.trim();
    if (customThumbnail) {
      try {
        const parsedThumbnail = new URL(customThumbnail);
        if (!['http:', 'https:'].includes(parsedThumbnail.protocol)) throw new Error();
      } catch {
        setError('Geçerli bir özel kapak fotoğrafı URL girin.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const thumbnail = customThumbnail || getYouTubeThumbnailUrl(videoId);
      await addTubeVideoToFirestore({
        title: title.trim(),
        subject: subject.trim(),
        youtubeUrl: youtubeLink.trim(),
        videoId,
        embedUrl: getYouTubeEmbedUrl(youtubeLink),
        thumbnailUrl: thumbnail,
        customThumbnail: Boolean(customThumbnail)
      });
      setSuccess('Video Mahir Hocam Tube bölümüne yayınlandı.');
      setTitle('');
      setSubject('');
      setYoutubeLink('');
      setThumbnailUrl('');
      onVideoCreated?.();
    } catch (saveError) {
      setError(saveError?.message || 'Video kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white">Mahir Hocam Tube Video Ekle</h2>
              <p className="text-[11px] text-slate-400">YouTube bağlantısı ve özel kapak fotoğrafı</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-slate-300">Video Başlığı *</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500/60" placeholder="Örn. Hareket Problemleri Çözümü" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-300">Konu Adı *</span>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500/60" placeholder="Örn. Hareket - Hız ve İvme" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-300">YouTube Video Linki veya Video ID *</span>
            <div className="relative mt-2">
              <Link2 className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={youtubeLink} onChange={(event) => setYoutubeLink(event.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500/60" placeholder="https://youtu.be/..." />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-300">Özel Kapak Fotoğrafı Linki <span className="font-normal text-slate-500">(isteğe bağlı)</span></span>
            <div className="relative mt-2">
              <Link2 className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500/60" placeholder="https://imgur.com/ornek-kapak.jpg" />
            </div>
          </label>

          {error && <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
          {success && <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>{success}</span></div>}

          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 disabled:opacity-60 text-white text-sm font-bold transition">
            {submitting ? 'Yayınlanıyor...' : 'Videoyu Yayınla'}
          </button>
        </form>
      </div>
    </div>
  );
}
