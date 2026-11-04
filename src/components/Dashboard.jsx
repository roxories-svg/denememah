import React, { useEffect, useState } from 'react';
import PdfCard from './PdfCard';
import {
  FileText, PlusCircle, Bell, Clock, Sparkles,
  Users, HelpCircle, Lock, Trash2, ArrowRight, Eye, ClipboardCheck, PlayCircle,
  GraduationCap, Headphones, Star, Magnet, Waves, Atom, Triangle, MoveRight, BookOpen
} from 'lucide-react';
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
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-hidden bg-[#05070d] pb-24 text-slate-100">
      {latestAnnouncement && <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onOpenAnnouncements} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-sky-400/20 bg-slate-900/60 px-4 py-3 text-left backdrop-blur-md transition hover:border-sky-400/40">
          <Bell className="h-4 w-4 shrink-0 text-sky-300" />
          <span className="min-w-0"><span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-sky-300">{safeText(latestAnnouncement.badge, 'Duyuru')}</span><span className="block truncate text-xs text-slate-200 sm:inline">{safeText(latestAnnouncement.title, 'Yeni duyuru')}</span></span>
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-500" />
        </button>
        {isTeacher && <button type="button" onClick={onOpenCreateAnnouncement} aria-label="Duyuru ekle" className="rounded-xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-300"><PlusCircle className="h-4 w-4" /></button>}
      </div>}

      <section id="home" className="relative isolate scroll-mt-24 overflow-hidden bg-[radial-gradient(ellipse_at_75%_30%,rgba(0,114,255,0.16),transparent_38%),linear-gradient(125deg,#0b0f19_0%,#05070d_62%,#08101e_100%)]">
        <div className="pointer-events-none absolute -left-36 top-20 h-80 w-80 rounded-full bg-sky-500/10 blur-[110px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:min-h-[490px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-0 lg:px-8 lg:pb-14">
          <div className="relative z-10 max-w-2xl py-2 lg:py-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/[0.07] px-3.5 py-2 text-[10px] font-bold tracking-[0.2em] text-sky-200 sm:text-xs"><span className="h-2 w-2 animate-pulse rounded-full bg-sky-400 shadow-[0_0_12px_#00a8ff]" />YKS’YE GİDEN YOLDA</span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">Mahir Hocam <span className="bg-gradient-to-r from-sky-300 via-[#00a8ff] to-blue-500 bg-clip-text text-transparent">FİZİK DERSİ</span></h1>
            <p className="mt-5 max-w-lg text-base text-slate-300 sm:text-lg">Öğrenirken Yanında, <span className="font-semibold text-white">Başarırken Destekçin.</span></p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#dersler" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-6 text-sm font-bold text-slate-950 shadow-[0_0_28px_rgba(0,168,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-110">Derslere Başla <MoveRight className="h-4 w-4" /></a>
              <a href="#kaynaklar" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-black/20 px-6 text-sm font-semibold text-slate-200 transition hover:border-sky-400/50 hover:text-white"><BookOpen className="h-4 w-4" />Kaynakları Keşfet</a>
            </div>
            <div className="mt-8 flex items-center gap-3 text-xs text-slate-400"><span className="flex h-8 w-5 items-start justify-center rounded-full border border-slate-500/70 pt-1"><span className="h-1.5 w-0.5 rounded-full bg-sky-300" /></span>Fiziği birlikte keşfetmeye başla</div>
          </div>
          <div className="relative mx-auto w-full max-w-2xl lg:absolute lg:inset-y-0 lg:right-0 lg:my-0 lg:w-[58%] lg:max-w-none">
            <div className="absolute inset-8 rounded-full bg-blue-600/20 blur-[90px]" />
            <img src="/banner.png" alt="Mahir Hocam fizik dersi bannerı" className="relative h-full min-h-56 w-full rounded-3xl border border-sky-400/10 object-cover object-[70%_center] shadow-[0_25px_80px_rgba(0,40,120,0.28)] sm:min-h-80 lg:absolute lg:inset-0 lg:rounded-none lg:border-0 lg:shadow-none" />
            <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#080d17] via-[#080d17]/55 to-transparent lg:block" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-24 bg-gradient-to-t from-[#05070d] to-transparent lg:block" />
          </div>
        </div>
      </section>

      <section id="hakkimizda" className="relative z-10 mx-auto -mt-1 grid max-w-7xl grid-cols-1 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/60 px-3 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-md sm:grid-cols-2 lg:-mt-8 lg:grid-cols-4 lg:px-2" aria-label="Eğitim özellikleri">
        {[
          { title: 'YKS Odaklı', subtitle: 'Sınavlara En Doğru Hazırlık', icon: GraduationCap },
          { title: 'Deneyimli Eğitmen', subtitle: 'Yılların Tecrübesiyle', icon: Users },
          { title: '%100 Destek', subtitle: 'Her Adımda Yanınızdayız', icon: Star },
          { title: 'Güçlü Öğrenci Topluluğu', subtitle: 'Birlikte Daha Güçlüyüz', icon: Headphones }
        ].map(({ title, subtitle, icon: Icon }, index) => <div key={title} className={`flex items-center gap-3 px-3 py-4 sm:px-5 lg:px-6 ${index > 0 ? 'border-t border-slate-700/70 sm:border-t-0 lg:border-l' : ''} ${index === 1 ? 'sm:border-l' : ''} ${index === 2 ? 'lg:border-l' : ''}`}>
          <Icon className="h-8 w-8 shrink-0 text-sky-400 drop-shadow-[0_0_10px_rgba(0,168,255,0.5)]" />
          <div><h2 className="text-xs font-bold text-white sm:text-sm">{title}</h2><p className="mt-1 text-[10px] text-slate-400 sm:text-xs">{subtitle}</p></div>
        </div>)}
      </section>

      <section id="dersler" className="mx-auto grid max-w-7xl scroll-mt-28 gap-8 px-4 pt-16 sm:px-6 lg:grid-cols-[0.8fr_1.6fr] lg:items-center lg:gap-14 lg:px-8 lg:pt-24">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-sky-300"><span className="h-px w-6 bg-sky-400" />DERSLERİMİZ</span>
          <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">Fiziği Anlamanın <span className="block bg-gradient-to-r from-sky-300 to-blue-500 bg-clip-text text-transparent">En Kolay Yolu</span></h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">Mahir Hocam ile fizik dersini sadece öğrenmekle kalmayacak, sınavda fark yaratacaksın.</p>
          <a href="#tube-videos" className="mt-6 inline-flex items-center gap-2 rounded-full border border-sky-400/50 px-5 py-2.5 text-xs font-bold text-sky-200 transition hover:bg-sky-400/10">Tüm Dersleri Gör <ArrowRight className="h-4 w-4" /></a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: 'Manyetizma', subtitle: 'Konu Anlatımı & Soru Çözümleri', icon: Magnet },
            { title: 'Dalga Mekaniği', subtitle: 'Özet + Örnek Sorular', icon: Waves },
            { title: 'Modern Fizik', subtitle: 'Konu Anlatımı & Taktikler', icon: Atom },
            { title: 'Optik', subtitle: 'Detaylı Anlatım & Soru Çözümleri', icon: Triangle }
          ].map(({ title, subtitle, icon: Icon }) => <a key={title} href="#tube-videos" className="group flex min-h-24 items-center gap-4 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-slate-900/90 hover:shadow-[0_0_20px_rgba(0,168,255,0.3)] sm:gap-5 sm:px-5">
            <Icon className="h-9 w-9 shrink-0 text-sky-400 transition group-hover:scale-110 group-hover:text-cyan-300" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-white">{title}</span><span className="mt-1 block text-xs leading-relaxed text-slate-400">{subtitle}</span></span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-200 transition group-hover:bg-sky-500 group-hover:text-slate-950"><ArrowRight className="h-4 w-4" /></span>
          </a>)}
        </div>
      </section>

      {isTeacher && <section className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center gap-2 px-4 sm:px-6 lg:px-8">
        <span className="mr-2 text-xs font-semibold text-slate-500">Yönetim:</span>
        <button type="button" onClick={onOpenCreateTest} className="rounded-xl border border-sky-400/20 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:border-sky-400/50"><PlusCircle className="mr-1 inline h-3.5 w-3.5" />Test Oluştur</button>
        <button type="button" onClick={onOpenUploadPdf} className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400/40"><FileText className="mr-1 inline h-3.5 w-3.5" />PDF Yükle</button>
        <button type="button" onClick={onOpenLogs} className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400/40"><Users className="mr-1 inline h-3.5 w-3.5" />Öğrenci Takibi ({Number.isFinite(logsCount) ? logsCount : 0})</button>
      </section>}

      {/* 6 Güçlü Modül - Ana Sayfa Kart Izgarası */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8" aria-label="Portal özellikleri">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'İnteraktif Fizik Testleri', description: 'Süreli testler ve anlık optik değerlendirme.', icon: HelpCircle, color: 'cyan', action: onOpenExamTest },
            { title: 'Sınıf & Okul Sıralaması', description: 'Sınıf içi ve okul genelinde başarı kıyaslaması.', icon: Users, color: 'emerald', action: onOpenLogs },
            { title: 'Yapay Zeka Soru Asistanı', description: 'Fizik sorularında akıllı adım adım destek.', icon: Sparkles, color: 'violet', action: null, soon: true },
            { title: 'Konu Analizli Optik Form', description: 'Doğru, yanlış ve boşlarını konu bazında analiz et.', icon: ClipboardCheck, color: 'amber', action: onOpenExamTest },
            { title: 'Mahir Hoca İle Canlı Takip', description: 'Öğrenci gelişimini ve sınav performansını takip et.', icon: Bell, color: 'rose', action: onOpenLogs },
            { title: 'Formül & Özet Kütüphanesi', description: 'Fizik formülleri ve kısa konu özetleri tek yerde.', icon: FileText, color: 'blue', action: onOpenFormulas }
          ].map(({ title, description, icon: Icon, color, soon }) => {
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
      <main className="mx-auto mt-14 max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div id="interaktif-testler" className="scroll-mt-28">
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
        <div id="tube-videos" className="scroll-mt-28">
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
        <div id="kaynaklar" className="scroll-mt-28">
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
