import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Award, HelpCircle, RotateCcw, FileText, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { incrementInteractiveTestCounter, saveInteractiveTestResult } from '../firebase';

function getDeadlineTime(value) {
  try {
    if (value && typeof value.toDate === 'function') value = value.toDate();
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

export default function ExamTestModal({ 
  isOpen, 
  onClose, 
  examTitle = "Fizik Sınavı", 
  testData = {},
  user
}) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [resultSaveError, setResultSaveError] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isOpen) return undefined;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !testData?.id) return;
    incrementInteractiveTestCounter(testData.id, 'views').catch((error) => {
      console.warn('Test görüntülenme sayısı artırılamadı:', error);
    });
  }, [isOpen, testData?.id]);

  if (!isOpen) return null;

  const deadlineTime = getDeadlineTime(testData.deadline);
  const isExpired = (Boolean(testData.id) && !deadlineTime) || (deadlineTime > 0 && deadlineTime <= now);
  const countdown = getCountdownParts(deadlineTime, now);
  const remainingSeconds = deadlineTime ? Math.max(0, Math.floor((deadlineTime - now) / 1000)) : 0;
  const countdownUrgency = remainingSeconds <= 3600 ? 'critical' : remainingSeconds <= 86400 ? 'warning' : 'normal';

  // Eski testlerdeki tek görsel alanlarını da destekle.
  const testImageUrls = Array.isArray(testData.testImageUrls)
    ? testData.testImageUrls.filter((url) => typeof url === 'string' && url)
    : [testData.testImageUrl || testData.imageUrl].filter(Boolean);
  const totalPages = testImageUrls.length;
  const safeCurrentPage = Math.min(currentPage, Math.max(0, totalPages - 1));
  const imageUrl = testImageUrls[safeCurrentPage] || '';
  const questionsList = testData.questions || [];
  
  // Eğer Mahir hoca yeni sistemle tek görsel + toplam soru sayısı girdiyse:
  const totalQCount = Math.max(1, Number(testData.totalQuestions) || questionsList.length || 10);
  const optionLabels = ["A", "B", "C", "D", "E"];

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (isSubmitted || isExpired) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  const calculateScore = () => {
    let correctCount = 0;
    const answeredCount = Object.keys(selectedAnswers).length;
    const toAnswerLabel = (answer) => typeof answer === 'number'
      ? optionLabels[answer]
      : String(answer || '').trim().toUpperCase();

    if (questionsList.length > 0) {
      // Eski soru bazlı dizi varsa
      questionsList.forEach((q, idx) => {
        if (selectedAnswers[idx] !== undefined && toAnswerLabel(selectedAnswers[idx]) === toAnswerLabel(q.correct)) correctCount++;
      });
      return {
        correct: correctCount,
        wrong: answeredCount - correctCount,
        empty: questionsList.length - answeredCount,
        successRate: Math.round((correctCount / Math.max(1, questionsList.length)) * 100),
        total: questionsList.length
      };
    } else {
      // Yeni sanal optik cevap anahtarı sistemi (testData.answerKey objesi {0: 1, 1: 4} şeklinde tutulabilir)
      const answerKey = testData.answerKey || {};
      for (let i = 0; i < totalQCount; i++) {
        if (selectedAnswers[i] !== undefined && toAnswerLabel(selectedAnswers[i]) === toAnswerLabel(answerKey[i])) {
          correctCount++;
        }
      }
      return {
        correct: correctCount,
        wrong: answeredCount - correctCount,
        empty: Math.max(0, totalQCount - answeredCount),
        successRate: Math.round((correctCount / totalQCount) * 100),
        total: totalQCount
      };
    }
  };

  const handleSubmitAnswers = async () => {
    if (isExpired) return;
    setIsSavingResult(true);
    setResultSaveError('');
    try {
      const score = calculateScore();
      await saveInteractiveTestResult({
        studentUid: user?.uid || '',
        studentName: user?.displayName || user?.fullName || user?.nickname || 'Öğrenci',
        studentEmail: user?.email || '',
        gradeClass: user?.gradeClass || 'Belirtilmedi',
        ...(testData.id ? { testId: testData.id } : {}),
        testTitle: examTitle,
        correctCount: score.correct,
        wrongCount: score.wrong,
        emptyCount: score.empty,
        successRate: score.successRate
      });
      setIsSubmitted(true);
      if (testData.id) {
        incrementInteractiveTestCounter(testData.id, 'solveCount').catch((error) => {
          console.warn('Test çözüm sayısı artırılamadı:', error);
        });
      }
    } catch (error) {
      console.error('Test sonucu kaydedilemedi:', error);
      setResultSaveError(error?.message || 'Sonuç kaydedilemedi. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSavingResult(false);
    }
  };

  const stats = calculateScore();
  const bookletViewer = (
    <div className="w-full max-w-full lg:col-span-7 min-w-0 bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col min-h-[300px] sm:min-h-[350px] overflow-hidden">
      <div className="w-full min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 min-w-0">
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Soru Kitapçığı</span>
        </span>
        <div className="w-full min-w-0 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 sm:w-auto sm:flex sm:justify-start sm:gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
            disabled={safeCurrentPage === 0}
            aria-label="Önceki Sayfa"
            className="w-full min-w-0 min-h-10 px-1 sm:px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-0.5 sm:gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5 shrink-0" /><span className="hidden sm:inline truncate">Önceki Sayfa</span><span className="sm:hidden truncate">Önceki</span>
          </button>
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 whitespace-nowrap text-center">
            Sayfa {totalPages ? safeCurrentPage + 1 : 0} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))}
            disabled={safeCurrentPage >= totalPages - 1}
            aria-label="Sonraki Sayfa"
            className="w-full min-w-0 min-h-10 px-1 sm:px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-0.5 sm:gap-1"
          >
            <span className="hidden sm:inline truncate">Sonraki Sayfa</span><span className="sm:hidden truncate">Sonraki</span><ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>
      <div className="flex-1 w-full min-w-0 max-w-full flex items-center justify-center overflow-auto rounded-xl bg-slate-900/50 p-2">
        {imageUrl ? (
          <img
            key={`${safeCurrentPage}-${imageUrl}`}
            src={imageUrl}
            alt={`Test kitapçığı ${safeCurrentPage + 1}. sayfa`}
            className="max-h-[65vh] max-w-full w-auto object-contain rounded-lg border border-slate-800 shadow-lg animate-fadeIn"
          />
        ) : (
          <div className="text-center py-16 text-slate-500 text-xs space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto opacity-40" />
            <p>Bu test için kitapçık görseli bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full min-w-0 max-w-5xl max-h-[95vh] flex flex-col bg-slate-900 border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-2xl shadow-cyan-950/40 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="min-w-0 flex items-start sm:items-center justify-between gap-2 p-3 sm:p-5 border-b border-slate-800 bg-slate-900/95">
          <div className="min-w-0 flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl sm:rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="min-w-0 max-w-full text-sm sm:text-lg font-bold text-white flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <span className="min-w-0 break-words">{examTitle}</span>
                <span className="max-w-full text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Sanal Optik Formu
                </span>
              </h2>
              <p className="hidden sm:block text-xs text-slate-400">
                Soruları inceleyin ve yandaki / alttaki sanal optik formuna cevaplarınızı işaretleyin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sol Taraf Soru Görseli, Sağ Taraf Sanal Optik */}
        <div className="w-full min-w-0 max-w-full p-3 sm:p-6 overflow-y-auto overflow-x-hidden flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {testData.deadline && (
            <div
              className={`w-full min-w-0 max-w-full lg:col-span-12 p-3 sm:p-4 rounded-2xl border shadow-inner transition-colors duration-500 ${
                isExpired
                  ? 'bg-rose-950/20 border-rose-500/35 text-rose-200'
                  : countdownUrgency === 'critical'
                    ? 'bg-rose-950/20 border-rose-500/35 text-rose-100'
                    : countdownUrgency === 'warning'
                      ? 'bg-orange-950/15 border-orange-500/30 text-orange-100'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-100'
              }`}
              role="status"
              aria-live="off"
            >
              <div className="min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                <span className={`text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider ${isExpired ? 'text-rose-300' : countdownUrgency === 'critical' ? 'text-rose-300' : countdownUrgency === 'warning' ? 'text-orange-300' : 'text-slate-400'}`}>
                  {isExpired ? <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> : <Clock className={`w-3.5 h-3.5 ${countdownUrgency === 'critical' ? 'text-rose-400' : countdownUrgency === 'warning' ? 'text-orange-400' : 'text-cyan-400'}`} />}
                  Kilit Geri Sayımı (Kalan Süre)
                </span>
                <span className="min-w-0 text-[10px] sm:text-[11px] text-slate-500 font-mono sm:text-right break-words">
                  Bitiş: {deadlineTime ? new Date(deadlineTime).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Belirtilmedi'}
                </span>
              </div>
              {isExpired ? (
                <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4" /> Bu sınavın süresi sona ermiştir.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center mt-2">
                  {[
                    ['Gün', countdown.days],
                    ['Saat', countdown.hours],
                    ['Dakika', countdown.minutes],
                    ['Saniye', countdown.seconds]
                  ].map(([label, value]) => (
                    <div key={label} className={`min-w-0 p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border shadow-sm transition-colors duration-500 ${countdownUrgency === 'critical' ? 'border-rose-500/40' : countdownUrgency === 'warning' ? 'border-orange-500/35' : 'border-cyan-500/30'}`}>
                      <span className={`block text-sm sm:text-lg font-extrabold font-mono tabular-nums ${label === 'Saniye' && countdownUrgency === 'normal' ? 'text-orange-400 animate-pulse' : countdownUrgency === 'critical' ? 'text-rose-300' : countdownUrgency === 'warning' ? 'text-orange-300' : 'text-cyan-300'}`}>
                        {String(value).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {!isSubmitted ? (
            <>
              {bookletViewer}

              {/* Sağ Alan: Sanal Optik Formu (Tüm Sorular Toplu İşaretleme) */}
              <div className="w-full min-w-0 max-w-full lg:col-span-5 bg-slate-950 p-3 sm:p-5 rounded-2xl border border-cyan-500/30 space-y-4 shadow-xl overflow-hidden">
                <div className="min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <span className="min-w-0 text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider flex flex-wrap items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Sanal Optik Cevap Formu
                  </span>
                  <span className="self-start sm:self-auto px-2 py-1 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] sm:text-xs font-mono text-cyan-300 whitespace-nowrap">
                    {Object.keys(selectedAnswers).length} / {totalQCount} İşaretlendi
                  </span>
                </div>

                {/* Soru Satırları ve Şık Baloncukları */}
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {Array.from({ length: totalQCount }).map((_, qIdx) => (
                    <div key={qIdx} className="w-full min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition">
                      <span className="text-xs font-bold text-slate-300 font-mono">
                        {qIdx + 1}. Soru
                      </span>

                      <div className="w-full sm:w-auto min-w-0 grid grid-cols-5 gap-1.5 sm:gap-2">
                        {optionLabels.map((optLabel, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              disabled={isExpired}
                              className={`w-full min-w-0 h-10 sm:w-9 sm:h-9 rounded-full text-sm font-bold transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed ${
                                isSelected
                                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950 font-extrabold scale-110 border border-cyan-300'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                              }`}
                            >
                              {optLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Testi Bitir Butonu */}
                {resultSaveError && (
                  <p role="alert" className="text-xs text-rose-300">{resultSaveError}</p>
                )}
                <button
                  onClick={handleSubmitAnswers}
                  disabled={isSavingResult || isExpired}
                  className="w-full min-w-0 min-h-12 px-4 py-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer mt-2 mb-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingResult ? 'Sonuç Kaydediliyor...' : 'Optik Formu Gönder'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Sonuç Ekranı */
            <>
              {bookletViewer}

              <div className="lg:col-span-5 text-center py-8 space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Sanal Optik Değerlendirildi!</h3>
                  <p className="text-xs text-slate-400 mt-1">Optik form sonuç analiziniz:</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="block text-2xl font-extrabold text-emerald-400">{stats.correct}</span>
                    <span className="text-xs text-slate-400">Doğru</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="block text-2xl font-extrabold text-rose-400">{stats.wrong}</span>
                    <span className="text-xs text-slate-400">Yanlış</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="block text-2xl font-extrabold text-amber-300">{stats.empty}</span>
                    <span className="text-xs text-slate-400">Boş</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="block text-2xl font-extrabold text-cyan-400">%{stats.successRate}</span>
                    <span className="text-xs text-slate-400">Başarı</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedAnswers({});
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Yeniden Çöz</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}