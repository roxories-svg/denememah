import React, { useEffect, useState } from 'react';
import PdfCard from './PdfCard';
import {
  FileText, PlusCircle, Bell, Clock, Sparkles,
  Users, HelpCircle, Lock, Trash2, ArrowRight, Eye, ClipboardCheck, PlayCircle
} from 'lucide-react';
import { teacherProfile } from '../data/teacherProfile';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../utils/youtube';

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

function getTubeVideoId(video) {
  const existingId = safeText(video?.videoId);
  if (/^[a-zA-Z0-9_-]{11}$/.test(existingId)) return existingId;
  const existingEmbed = safeText(video?.embedUrl);
  const source = safeText(video?.youtubeUrl || video?.driveUrl || existingEmbed);
  return extractYouTubeId(source);
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
  onOpenAddVideo,
  onTogglePdfLock,
  onDeletePdf,
  onDeleteTest,
  onOpenAnnouncements,
  onOpenCreateAnnouncement,
  onOpenLogs,
  onOpenFormulas,
  onOpenExamTest,
  testResults = [],
  logsCount = 0,
  tubeVideos = [],
  onDeleteTubeVideo
}) {
  const isTeacher = user?.role === 'teacher';
  const [now, setNow] = useState(() => Date.now());
  const [rankingTestId, setRankingTestId] = useState('');
  const [rankingDetailId, setRankingDetailId] = useState('');
  const [activeTubeVideoId, setActiveTubeVideoId] = useState('');

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
  const safeTubeVideos = Array.isArray(tubeVideos)
    ? tubeVideos.filter((video) => video && typeof video === 'object')
    : [];
  const latestAnnouncement = safeAnnouncements[0];

  return (
    <div className="w-full min-w-0 max-w-full min-h-screen bg-slate-950 text-slate-100 pb-24">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#070d18] to-slate-950 border-b border-slate-800/80 pt-6 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="w-full rounded-2xl border border-rose-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/20 px-3 sm:px-5 py-3 flex items-center gap-3 sm:gap-4">
            <img
              src="/MahirHocam Physics Channel Emblem.png"
              alt="Mahir Hocam Tube"
              className="w-12 h-12 sm:w-16 sm:h-16 max-w-[22vw] shrink-0 rounded-xl object-contain"
            />
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-rose-400 uppercase tracking-[0.18em]">Mahir Hocam</p>
              <h1 className="text-lg sm:text-2xl font-black text-white leading-tight truncate">Mahir Hocam Tube</h1>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Fizik ders videoları tek yerde</p>
            </div>
          </div>
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
                    onClick={onOpenAddVideo}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 transition flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" /> Ders Videosu Ekle
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

      {/* 6 Güçlü Modül - Ana Sayfa Kart Izgarası */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'İnteraktif Fizik Testleri', description: 'Süreli testler ve anlık optik değerlendirme.', icon: HelpCircle, color: 'cyan', action: onOpenExamTest },
            { title: 'Sınıf & Okul Sıralaması', description: 'Sınıf içi ve okul genelinde başarı kıyaslaması.', icon: Users, color: 'emerald', action: onOpenLogs },
            { title: 'Yapay Zeka Soru Asistanı', description: 'Fizik sorularında akıllı adım adım destek.', icon: Sparkles, color: 'violet', action: null, soon: true },
            { title: 'Konu Analizli Optik Form', description: 'Doğru, yanlış ve boşlarını konu bazında analiz et.', icon: ClipboardCheck, color: 'amber', action: onOpenExamTest },
            { title: 'Mahir Hoca İle Canlı Takip', description: 'Öğrenci gelişimini ve sınav performansını takip et.', icon: Bell, color: 'rose', action: onOpenLogs },
            { title: 'Formül & Özet Kütüphanesi', description: 'Fizik formülleri ve kısa konu özetleri tek yerde.', icon: FileText, color: 'blue', action: onOpenFormulas }
          ].map(({ title, description, icon: Icon, color, action, soon }) => {
            const colors = {
              cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300 group-hover:border-cyan-400/50',
              emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300 group-hover:border-emerald-400/50',
              violet: 'border-violet-500/20 bg-violet-500/10 text-violet-300 group-hover:border-violet-400/50',
              amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300 group-hover:border-amber-400/50',
              rose: 'border-rose-500/20 bg-rose-500/10 text-rose-300 group-hover:border-rose-400/50',
              blue: 'border-blue-500/20 bg-blue-500/10 text-blue-300 group-hover:border-blue-400/50'
            }[color];
            return (
              <div
                key={title}
                className="group relative text-left p-5 min-h-36 rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden select-none"
              >
                {soon && (
                  <span className="absolute right-4 top-4 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-violet-500 text-white border border-violet-300/40 shadow-lg shadow-violet-950/50">
                    ÇOK YAKINDA
                  </span>
                )}
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 transition ${colors}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white pr-20">{title}</h3>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{description}</p>
              </div>
            );
          })}
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
                const participantsMap = new Map();
                if (isTeacher) {
                  (Array.isArray(testResults) ? testResults : []).forEach((result) => {
                    if (result?.testId && String(result.testId) !== String(testId)) return;
                    if (!result?.testId && String(result?.testTitle || '') !== String(test.title || '')) return;
                    const studentKey = String(result.studentEmail || result.studentUid || result.studentName || '').trim().toLowerCase();
                    if (!studentKey) return;
                    const previous = participantsMap.get(studentKey);
                    if (!previous || String(result.submittedAt || '').localeCompare(String(previous.submittedAt || '')) >= 0) {
                      participantsMap.set(studentKey, result);
                    }
                  });
                }
                const participants = Array.from(participantsMap.values()).map((result) => {
                  const wrong = Number(result.wrongCount) || 0;
                  const correct = Number(result.correctCount) || 0;
                  const net = Number.isFinite(Number(result.netScore))
                    ? Number(result.netScore)
                    : Number((correct - (wrong / 4)).toFixed(2));
                  return { ...result, wrongCount: wrong, correctCount: correct, netScore: net };
                }).sort((a, b) =>
                  b.netScore - a.netScore ||
                  Number(b.successRate || 0) - Number(a.successRate || 0) ||
                  a.studentName.localeCompare(b.studentName, 'tr')
                );

                return (
                  <div key={testId} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

                    {isTeacher && (
                      <div className="w-full pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setRankingTestId((current) => current === String(testId) ? '' : String(testId));
                            setRankingDetailId('');
                          }}
                          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/20 text-xs font-bold text-cyan-300 hover:border-cyan-400/40 transition"
                        >
                          <span>Test Katılımcıları ve Anlık Başarı Listesi ({participants.length})</span>
                          <span>{rankingTestId === String(testId) ? 'Kapat' : 'Göster'}</span>
                        </button>

                        {rankingTestId === String(testId) && (
                          <div className="mt-3 rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                            {participants.length > 0 ? (
                              <div className="divide-y divide-slate-800">
                                {participants.map((participant, participantIndex) => {
                                  const participantId = String(participant.id || `${participant.studentEmail || participant.studentUid}-${participantIndex}`);
                                  const details = Array.isArray(participant.answerDetails) ? participant.answerDetails : [];
                                  return (
                                    <div key={participantId}>
                                      <button
                                        type="button"
                                        onClick={() => setRankingDetailId((current) => current === participantId ? '' : participantId)}
                                        className="w-full grid grid-cols-[42px_minmax(0,1fr)_auto] sm:grid-cols-[42px_minmax(150px,1fr)_70px_70px_90px_auto] items-center gap-2 px-3 py-3 text-left hover:bg-slate-900/70 transition"
                                      >
                                        <span className="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-black flex items-center justify-center">{participantIndex + 1}</span>
                                        <span className="min-w-0">
                                          <strong className="block truncate text-xs text-white">{safeText(participant.studentName, 'Öğrenci')}</strong>
                                          <span className="block truncate text-[10px] text-slate-500">{safeText(participant.studentEmail, '')}</span>
                                        </span>
                                        <span className="hidden sm:block text-xs text-center text-emerald-300">D {participant.correctCount}</span>
                                        <span className="hidden sm:block text-xs text-center text-rose-300">Y {participant.wrongCount}</span>
                                        <span className="text-xs text-center font-bold text-amber-300">Net {participant.netScore.toFixed(2)}</span>
                                        <span className="hidden sm:block text-[10px] text-cyan-300">%{Number(participant.successRate) || 0}</span>
                                      </button>
                                      {rankingDetailId === participantId && (
                                        <div className="px-3 pb-3">
                                          {details.length > 0 ? (
                                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                                              {details.map((detail) => (
                                                <div
                                                  key={detail.questionNumber}
                                                  title={`${detail.questionNumber}. soru: Seçilen ${detail.selectedAnswer}, Doğru ${detail.correctAnswer}`}
                                                  className={`p-1.5 rounded-lg border text-center text-[10px] font-bold ${
                                                    detail.status === 'correct'
                                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                      : detail.status === 'wrong'
                                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                                        : 'bg-slate-800 border-slate-700 text-slate-400'
                                                  }`}
                                                >
                                                  <span className="block">{detail.questionNumber}</span>
                                                  <span className="block">{detail.selectedAnswer}</span>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="text-[11px] text-slate-500">Bu eski sonuç için soru bazlı cevap ayrıntısı bulunmuyor.</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-xs text-slate-500">Henüz bu testi çözen öğrenci bulunmuyor.</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
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

        {/* Mahir Hocam Tube */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">Ders Videoları - Mahir Hocam Tube</h2>
                <p className="text-xs text-slate-400">{safeTubeVideos.length} video</p>
              </div>
            </div>
            {isTeacher && (
              <button
                onClick={onOpenAddVideo}
                className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-400 transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Video Ekle
              </button>
            )}
          </div>

          {safeTubeVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {safeTubeVideos.map((video, index) => {
                const tubeVideoId = getTubeVideoId(video);
                const autoThumbnail = getYouTubeThumbnailUrl(tubeVideoId);
                const tubeThumbnail = safeText(video.thumbnailUrl) || autoThumbnail;
                const embedUrl = getYouTubeEmbedUrl(
                  tubeVideoId || safeText(video.youtubeUrl) || safeText(video.embedUrl)
                );
                return (
                <article key={video.id || index} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-full px-2 py-1 mb-2">
                        <PlayCircle className="w-3 h-3" /> {safeText(video.subject, 'Fizik Dersi')}
                      </span>
                      <h3 className="text-sm font-bold text-white break-words">{safeText(video.title, 'Ders Videosu')}</h3>
                    </div>
                    {isTeacher && (
                      <button
                        type="button"
                        onClick={() => onDeleteTubeVideo?.(video.id)}
                        className="p-2 shrink-0 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Videoyu sil"
                        aria-label="Videoyu sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="px-3 pb-3">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
                      {activeTubeVideoId === String(video.id || index) && embedUrl ? (
                        <iframe
                          src={embedUrl}
                          title={safeText(video.title, 'Ders videosu')}
                          className="w-full h-full absolute inset-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveTubeVideoId(String(video.id || index))}
                          className="absolute inset-0 group w-full h-full cursor-pointer"
                          aria-label={`${safeText(video.title, 'Dersi')} videoyu oynat`}
                        >
                          {tubeThumbnail ? (
                            <img
                              src={tubeThumbnail}
                              alt={safeText(video.title, 'Video kapak fotoğrafı')}
                              className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                              loading="lazy"
                              onError={(event) => {
                                if (autoThumbnail && event.currentTarget.src !== autoThumbnail) {
                                  event.currentTarget.onerror = null;
                                  event.currentTarget.src = autoThumbnail;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950" />
                          )}
                          <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-600 text-white border border-white/30 shadow-2xl flex items-center justify-center group-hover:bg-rose-500 transition">
                            <PlayCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-white/10" />
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ); })}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
              Henüz ders videosu eklenmedi.
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
