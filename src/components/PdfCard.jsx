import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, Lock, Unlock, Download, Eye, 
  Trash2, AlertTriangle, CheckCircle2, ShieldCheck, 
  ExternalLink, Calendar, HardDrive 
} from 'lucide-react';

export default function PdfCard({ 
  pdf, 
  isTeacher, 
  isAuthenticated = false,
  onRequireAuth,
  onViewPdf, 
  onToggleLock, 
  onDeletePdf 
}) {
  const lockTargetTime = pdf.lockUntil || pdf.deadline;
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  function calculateTimeLeft() {
    if (!lockTargetTime) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const difference = new Date(lockTargetTime).getTime() - Date.now();
    
    if (difference <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      total: difference,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  // Update countdown every second
  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [lockTargetTime]);

  // Determine lock state:
  // Locked if time is expired (difference <= 0) OR if manually locked by Mahir Şengün
  const isExpired = timeLeft.total <= 0;
  const isLocked = isExpired || pdf.isManuallyLocked;
  const isExternalPdf = pdf.isExternalLink === true;

  // Format deadline date for display
  const deadlineDateStr = lockTargetTime ? new Date(lockTargetTime).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Belirtilmedi';

  const handleDelete = () => {
    if (window.confirm(`"${pdf.title}" dosyasını silmek istediğinize emin misiniz?`)) {
      onDeletePdf(pdf.id);
    }
  };

  const requestPdfAccess = () => {
    onRequireAuth?.('PDF görüntülemek veya indirmek için lütfen giriş yapın veya kayıt olun.');
  };

  const handleViewPdf = () => {
    if (!isAuthenticated) {
      requestPdfAccess();
      return;
    }
    onViewPdf(pdf);
  };

  const handleOpenExternalPdf = () => {
    if (!isAuthenticated) {
      requestPdfAccess();
      return;
    }
    try {
      window.open(pdf.pdfUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Harici PDF açılamadı:', error);
      setDownloadError('PDF bağlantısı açılamadı. Lütfen tekrar deneyiniz.');
    }
  };

  const handleDownload = async () => {
    if (!isAuthenticated) {
      requestPdfAccess();
      return;
    }
    setIsDownloading(true);
    setDownloadError('');
    let objectUrl = '';

    try {
      if (!pdf.pdfUrl) throw new Error('PDF dosya verisi bulunamadı.');
      const link = document.createElement('a');
      link.download = pdf.fileName || 'yazili_calismasi.pdf';

      if (pdf.pdfUrl.startsWith('data:')) {
        const response = await fetch(pdf.pdfUrl);
        if (!response.ok) throw new Error('PDF verisi okunamadı.');
        objectUrl = URL.createObjectURL(await response.blob());
        link.href = objectUrl;
      } else {
        link.href = pdf.pdfUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('PDF indirilemedi:', error);
      setDownloadError(error?.message || 'PDF indirilemedi. Lütfen tekrar deneyiniz.');
    } finally {
      if (objectUrl) window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setIsDownloading(false);
    }
  };

  return (
    <div className={`relative rounded-3xl border transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between backdrop-blur-xl ${
      isLocked 
        ? 'bg-slate-950/70 border-slate-800/80 shadow-lg' 
        : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-950/30'
    }`}>
      
      {/* Top Header: Status Badges & Mahir Hoca Controls */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          
          {/* Lock / Active Status Pill */}
          <div className="flex items-center gap-2">
            {isLocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Lock className="w-3.5 h-3.5" />
                {pdf.isManuallyLocked ? 'Öğretmen Tarafından Kilitlendi' : 'Süre Doldu / Kilitlendi'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Çalışmaya Açık (Aktif)
              </span>
            )}

            <span className="text-[11px] font-mono text-slate-500">
              {pdf.fileSize || 'PDF Belgesi'}
            </span>
          </div>

          {/* Mahir Hoca Special Controls */}
          {isTeacher && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleLock(pdf.id, !pdf.isManuallyLocked)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 border transition cursor-pointer ${
                  pdf.isManuallyLocked
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                }`}
                title={pdf.isManuallyLocked ? "Öğrencilere erişimi aç" : "Öğrencilere erişimi kilitle"}
              >
                {pdf.isManuallyLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Kilidi Aç</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Manuel Kilitle</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition cursor-pointer"
                title="PDF'i Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Title and Description */}
        <div className="flex items-start gap-3.5">
          <div className={`p-3 rounded-2xl shrink-0 mt-1 border ${
            isLocked 
              ? 'bg-slate-900 text-slate-500 border-slate-800' 
              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-md shadow-cyan-500/10'
          }`}>
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-base sm:text-lg font-bold leading-snug ${
              isLocked ? 'text-slate-400 line-through decoration-rose-500/60' : 'text-white'
            }`}>
              {isExternalPdf && !isLocked ? (
                <button type="button" onClick={handleOpenExternalPdf} className="text-left hover:text-cyan-300 transition-colors">
                  {pdf.title}
                </button>
              ) : pdf.title}
            </h3>
            {pdf.description && (
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {pdf.description}
              </p>
            )}
          </div>
        </div>

        {/* Live Countdown Display Box */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className={`w-3.5 h-3.5 ${isLocked ? 'text-rose-500' : 'text-cyan-400'}`} />
              Kilit Geri Sayımı (Kalan Süre)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Bitiş: {deadlineDateStr}
            </span>
          </div>

          {/* Countdown Numbers */}
          {!isExpired ? (
            <div className="grid grid-cols-4 gap-2 text-center mt-2">
              <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-sm">
                <span className="block text-lg sm:text-xl font-extrabold font-mono text-cyan-300">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-medium">Gün</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-sm">
                <span className="block text-lg sm:text-xl font-extrabold font-mono text-cyan-300">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-medium">Saat</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-sm">
                <span className="block text-lg sm:text-xl font-extrabold font-mono text-cyan-300">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-medium">Dakika</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-sm">
                <span className="block text-lg sm:text-xl font-extrabold font-mono text-orange-400 animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-medium">Saniye</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Süre Dolmuştur! Bu çalışma dosyası artık kilitlidir.</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Yükleyen:</span>
          <span className="text-cyan-400 font-semibold">{pdf.author || 'Mahir Şengün'}</span>
          {pdf.downloadCount !== undefined && (
            <>
              <span>•</span>
              <span>{pdf.downloadCount} indirme</span>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
          {isLocked ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed select-none">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Erişim Kilitlendi</span>
            </div>
          ) : (
            <>
              {isExternalPdf ? (
                <button
                  type="button"
                  onClick={handleOpenExternalPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>PDF'i İncele</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleViewPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>PDF'i İncele</span>
                </button>
              )}

              {isExternalPdf ? (
                <button
                  type="button"
                  onClick={handleOpenExternalPdf}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-lg shadow-cyan-500/25 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>İndir</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Hazırlanıyor...' : 'İndir'}</span>
                </button>
              )}
            </>
          )}
          </div>
          {downloadError && <span role="alert" className="max-w-xs text-right text-[11px] text-rose-300">{downloadError}</span>}
        </div>
      </div>

    </div>
  );
}
