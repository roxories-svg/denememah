import React, { useEffect, useState } from 'react';
import PdfCard from './PdfCard';
import {
  FileText, PlusCircle, Bell, Clock, Sparkles,
  Users, HelpCircle, Lock, Trash2, ArrowRight, Eye, ClipboardCheck
} from 'lucide-react';
import { teacherProfile } from '../data/teacherProfile';

function safeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function getDeadlineTime(value) {
  try {
    if (value && typeof value.toDate === 'function') {
      value = value.toDate();
    }
    const time = new Date(value).getTime();
    return Number.isFinite(time) ? time : 0;
  } catch {
    return 0;
  }
}

function getCountdownParts(deadlineTime, now) {
  const totalSeconds = Math.max(0, Math.floor((deadlineTime - now) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

export default function Dashboard({
  user,
  pdfs = [],
  announcements = [],
  interactiveTests = [],
  isAuthenticated = false,
  onRequireAuth,
  onViewPdf,
  onStartTest,
  onOpenUploadPdf,
  onOpenCreateTest,
  onTogglePdfLock,
  onDeletePdf,
  onDeleteTest,
  onOpenAnnouncements,
  onOpenCreateAnnouncement,
  onOpenLogs,
  logsCount = 0
}) {
  const isTeacher = user?.role === 'teacher';
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const safePdfs = Array.isArray(pdfs) ? pdfs.filter((pdf) => pdf && typeof pdf === 'object') : [];
  const safeAnnouncements = Array.isArray(announcements)
    ? announcements.filter((announcement) => announcement && typeof announcement === 'object')
    : [];
  const safeTests = Array.isArray(interactiveTests)
    ? interactiveTests.filter((test) => test && typeof test === 'object')
    : [];
  const latestAnnouncement = safeAnnouncements[0];

  return (
    <div className="w-full min-w-0 max-w-full min-h-screen bg-slate-950 text-slate-100 pb-24">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#070d18] to-slate-950 border-b border-slate-800/80 pt-6 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {latestAnnouncement ? (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-amber-950/20 backdrop-blur">
              <div
                onClick={onOpenAnnouncements}
                className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1 group"
              >
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {safeText(latestAnnouncement.badge, 'Güncel Duyuru')}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {safeText(latestAnnouncement.date)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300 transition-colors truncate mt-0.5">
                    {safeText(latestAnnouncement.title, 'Yeni duyuru')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isTeacher && (
                  <button
                    onClick={onOpenCreateAnnouncement}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Duyuru Ekle</span>
                  </button>
                )}
                <button
                  onClick={onOpenAnnouncements}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 transition cursor-pointer"
                >
                  Tümünü Gör
                </button>
              </div>
            </div>
          ) : isTeacher ? (
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">Firestore'da henüz yayınlanmış bir duyuru bulunmuyor.</span>
              <button
                onClick={onOpenCreateAnnouncement}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 transition flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>İlk Duyuruyu Ekle</span>
              </button>
            </div>
          ) : null}

          {/* Üst Kart Alanı */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> {isTeacher ? 'Yönetici Paneli' : 'Öğrenci Portalı'}
                </span>
                <span className="text-xs text-slate-400">
                  {isTeacher ? teacherProfile.officialName : safeText(user?.displayName, 'Öğrenci')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic border-l-2 border-cyan-500/50 pl-3">
                "{teacherProfile.welcomeMessage}"
              </p>
            </div>

            {/* Hızlı Aksiyonlar */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Yönetim Aksiyonları</span>
              {isTeacher ? (
                <>
                  <button
                    onClick={onOpenCreateTest}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> İnteraktif Test Oluştur
                  </button>
                  <button
                    onClick={onOpenUploadPdf}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 transition flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Yeni PDF Yükle
                  </button>
                  <button
                    onClick={onOpenLogs}
                    className="w-full py-2 px-3 rounded-xl font-semibold text-xs text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Öğrenci Giriş Takibi ({Number.isFinite(logsCount) ? logsCount : 0} Log)</span>
                  </button>
                </>
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Süresi dolmayan testleri ve PDF'leri zamanında çözünüz.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* İnteraktif Testler Bölümü */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">İnteraktif Sınav ve Testler</h2>
                <p className="text-xs text-slate-400">Süre dolmadan soruları yanıtlayın, anlık başarı skoru alın.</p>
              </div>
            </div>
            {isTeacher && (
              <button
                onClick={onOpenCreateTest}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Test Ekle
              </button>
            )}
          </div>

          {safeTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeTests.map((test, index) => {
                const deadlineTime = getDeadlineTime(test.deadline);
                const isExpired = !deadlineTime || deadlineTime <= now;
                const countdown = getCountdownParts(deadlineTime, now);
                const remainingSeconds = deadlineTime ? Math.max(0, Math.floor((deadlineTime - now) / 1000)) : 0;
                const countdownUrgency = remainingSeconds <= 3600 ? 'critical' : remainingSeconds <= 86400 ? 'warning' : 'normal';
                const questionsCount = Number(test.totalQuestions) || (Array.isArray(test.questions) ? test.questions.length : 0);
                const viewsCount = Number(test.views) || 0;
                const solveCount = Number(test.solveCount) || 0;
                const testId = typeof test.id === 'string' || typeof test.id === 'number' ? test.id : index;

                return (
                  <div key={testId} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="w-full min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isExpired ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {isExpired ? 'Kilitli (Süresi Doldu)' : 'Aktif Test'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{questionsCount} Soru</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700" title="Görüntülenme sayısı">
                          <Eye className="w-3 h-3" /> {viewsCount}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" title="Başarılı çözüm sayısı">
                          <ClipboardCheck className="w-3 h-3" /> {solveCount}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{safeText(test.title, 'Başlıksız test')}</h3>
                      <div className={`mt-3 p-3 sm:p-4 rounded-2xl border shadow-inner transition-colors duration-500 ${countdownUrgency === 'critical' ? 'bg-rose-950/20 border-rose-500/35' : countdownUrgency === 'warning' ? 'bg-orange-950/15 border-orange-500/30' : 'bg-slate-950/70 border-slate-800/80'}`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider ${countdownUrgency === 'critical' ? 'text-rose-300' : countdownUrgency === 'warning' ? 'text-orange-300' : 'text-slate-400'}`}>
                            <Clock className={`w-3.5 h-3.5 ${countdownUrgency === 'critical' ? 'text-rose-400' : countdownUrgency === 'warning' ? 'text-orange-400' : 'text-cyan-400'}`} />
                            Kilit Geri Sayımı (Kalan Süre)
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono text-right">
                            Bitiş: {deadlineTime ? new Date(deadlineTime).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Belirtilmedi'}
                          </span>
                        </div>

                        {isExpired ? (
                          <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 font-semibold">
                            <Lock className="w-3.5 h-3.5" /> Bu sınavın süresi sona ermiştir.
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2 text-center mt-2">
                            {[
                              ['Gün', countdown.days],
                              ['Saat', countdown.hours],
                              ['Dakika', countdown.minutes],
                              ['Saniye', countdown.seconds]
                            ].map(([label, value]) => (
                              <div key={label} className={`min-w-0 p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border shadow-sm transition-colors duration-500 ${countdownUrgency === 'critical' ? 'border-rose-500/40' : countdownUrgency === 'warning' ? 'border-orange-500/35' : 'border-cyan-500/30'}`}>
                                <span className={`block text-base sm:text-lg font-extrabold font-mono tabular-nums ${label === 'Saniye' && countdownUrgency === 'normal' ? 'text-orange-400 animate-pulse' : countdownUrgency === 'critical' ? 'text-rose-300' : countdownUrgency === 'warning' ? 'text-orange-300' : 'text-cyan-300'}`}>
                                  {String(value).padStart(2, '0')}
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-medium">{label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-end gap-2 shrink-0">
                      {isTeacher && (
                        <button
                          onClick={() => onDeleteTest?.(test.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition"
                          title="Testi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {!isExpired ? (
                        <button
                          onClick={() => onStartTest?.(test)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition flex items-center gap-1"
                        >
                          <span>Çöz</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-500 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Kilitli
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
              Henüz yayınlanmış bir interaktif test bulunmuyor.
            </div>
          )}
        </div>

        {/* PDF Liste Alanı */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Mahir Hocam Yazılı Çalışma PDF'leri ({safePdfs.length})</h2>
          {safePdfs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safePdfs.map((pdf, index) => (
                <PdfCard
                  key={pdf.id || index}
                  pdf={pdf}
                  isTeacher={isTeacher}
                  isAuthenticated={isAuthenticated}
                  onRequireAuth={onRequireAuth}
                  onViewPdf={onViewPdf}
                  onToggleLock={onTogglePdfLock}
                  onDeletePdf={onDeletePdf}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
              Henüz PDF çalışması yüklenmedi.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
