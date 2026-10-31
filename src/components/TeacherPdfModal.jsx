import React, { useState } from 'react';
import { 
  X, Upload, FileText, Calendar, Clock, AlertCircle, 
  Sparkles, CheckCircle2, ShieldCheck, Lock, ExternalLink
} from 'lucide-react';
import { uploadPdfFile, addExamPdf } from '../firebase';

export default function TeacherPdfModal({ isOpen, onClose, onPdfUploaded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [externalPdfUrl, setExternalPdfUrl] = useState('');
  const [deadline, setDeadline] = useState(() => {
    // Default deadline to 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 0, 0);
    // Format to YYYY-MM-DDTHH:mm
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
        setError('Lütfen sadece PDF formatında (.pdf) bir belge seçiniz.');
        return;
      }
      if (selected.size > 700 * 1024) {
        setFile(null);
        setError('Firestore sınırı nedeniyle PDF en fazla 700 KB olabilir.');
        return;
      }
      setFile(selected);
      setExternalPdfUrl('');
      setError('');
      // Auto-suggest title from filename if empty
      if (!title) {
        const cleanName = selected.name.replace('.pdf', '').replace(/_/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Lütfen yazılı PDF dosyasının adını belirtiniz.');
      return;
    }

    const externalUrl = externalPdfUrl.trim();
    if (!file && !externalUrl) {
      setError('Bir PDF dosyası seçiniz veya harici PDF bağlantısı giriniz.');
      return;
    }
    if (file && externalUrl) {
      setError('Lütfen dosya yükleme veya harici bağlantı yöntemlerinden yalnızca birini seçiniz.');
      return;
    }
    if (externalUrl) {
      try {
        const parsedUrl = new URL(externalUrl);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
      } catch {
        setError('Lütfen geçerli bir Google Drive veya harici PDF bağlantısı giriniz.');
        return;
      }
    }

    if (!deadline) {
      setError('Lütfen kilitlenme tarihi ve saatini belirleyiniz.');
      return;
    }

    try {
      setSubmitting(true);
      
      const pdfUrl = externalUrl || await uploadPdfFile(file, (prog) => {
        setUploadProgress(prog);
      });

      const fileSizeStr = file ? `${(file.size / 1024).toFixed(0)} KB` : 'Harici bağlantı';

      // 2. Save the PDF and metadata to Firestore
      const newPdfDoc = await addExamPdf({
        title: title.trim(),
        description: description.trim(),
        fileName: file?.name || `${title.trim()}.pdf`,
        fileSize: fileSizeStr,
        pdfUrl: pdfUrl,
        isExternalLink: Boolean(externalUrl),
        deadline: new Date(deadline).toISOString(),
        lockUntil: new Date(deadline).toISOString(),
        isManuallyLocked: false
      });

      if (onPdfUploaded) {
        onPdfUploaded(newPdfDoc);
      }

      // Reset and close
      onClose();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      setUploadProgress(0);
      setError('PDF yüklenirken bir hata oluştu: ' + (err.message || 'Lütfen tekrar deneyiniz.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/40 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Yeni Yazılı PDF'i Yükle</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Mahir Şengün Paneli
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Öğrenciler için yazılı soruları veya çalışma föyü yükleyin ve son erişim kilit tarihini belirleyin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5 text-slate-200">
          
          {error && (
            <div className="p-3 text-xs bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. File Name / Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Yazılı Çalışma Dosyası Adı *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 1. Dönem 1. Yazılı Genel Tekrar ve Çalışma Soruları"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
          </div>

          {/* 2. Description / Topic notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Çalışma Notu & Açıklama (Öğrencilere Tavsiye / Soru Sayısı)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: 11. Sınıf müfredatı; Vektörler, Bağıl Hareket ve Dinamik ünitesinden 35 klasik yazılı sorusu içerir."
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 leading-relaxed font-sans"
            />
          </div>

          {/* 3. PDF File Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              PDF Dosyası Seç (en fazla 700 KB)
            </label>
            
            <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl cursor-pointer bg-slate-950/60 transition group">
              <FileText className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform mb-2" />
              <span className="text-xs font-bold text-slate-200">
                {file ? file.name : 'Bilgisayarınızdan PDF dosyasını seçmek için tıklayın'}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                {file ? `${(file.size / 1024).toFixed(0)} KB seçildi` : 'Sadece .pdf formatı; Firestore sınırı için en fazla 700 KB'}
              </span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>PDF okunuyor...</span>
                  <span>%{uploadProgress}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              Google Drive / Harici PDF Linki
            </label>
            <input
              type="url"
              value={externalPdfUrl}
              onChange={(e) => {
                const value = e.target.value;
                setExternalPdfUrl(value);
                if (value.trim()) setFile(null);
                setError('');
              }}
              placeholder="https://drive.google.com/file/d/.../view"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <p className="mt-1 text-[11px] text-slate-500">Dosya yükleme veya bağlantı yöntemlerinden birini kullanın. Harici bağlantılar yeni sekmede açılır.</p>
          </div>

          {/* 4. Deadline / Countdown Date & Time */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
            <label className="block text-xs font-bold text-purple-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" />
              Kilit Tarihi ve Saati (Geri Sayım Bitiş Süresi) *
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Bu tarih ve saat dolduğunda, çalışma öğrencilere otomatik olarak kilitlenecek ve indirme kapatılacaktır. (Dilediğiniz zaman panelinizden kilidi açabilirsiniz).
            </p>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-purple-500/40 rounded-xl text-sm font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-lg shadow-purple-950/40 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>PDF Kaydediliyor...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>PDF'i Yayınla & Geri Sayımı Başlat</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
