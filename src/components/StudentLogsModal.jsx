import React, { useState, useMemo } from 'react';
import { 
  X, Search, Clock, Calendar, 
  UserCheck, Laptop, Smartphone, GraduationCap, CheckCircle 
} from 'lucide-react';

function safeText(value, fallback) {
  try {
    if (typeof value === 'string' && value) return value;
    if (typeof value === 'number' && Number.isFinite(value) && value !== 0) return String(value);
    return fallback;
  } catch {
    return fallback;
  }
}

function formatLogTime(log) {
  try {
    if (typeof log?.loginDateFormatted === 'string' && log.loginDateFormatted) {
      return log.loginDateFormatted;
    }

    const formatDate = (value) => {
      let date;
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string' || typeof value === 'number') {
        date = new Date(value);
      } else if (value && typeof value.toDate === 'function') {
        date = value.toDate();
      }

      return date instanceof Date && Number.isFinite(date.getTime())
        ? date.toLocaleString('tr-TR')
        : null;
    };

    const loginAt = formatDate(log?.loginAt);
    if (loginAt) return loginAt;

    const submittedAt = formatDate(log?.submittedAt);
    if (submittedAt) return submittedAt;

    const timestamp = formatDate(log?.timestamp);
    if (timestamp) return timestamp;

    return 'Zaman bilgisi yok';
  } catch {
    return 'Bilinmiyor';
  }
}

function formatRegistrationTime(value) {
  try {
    if (!value) return 'Kayıt tarihi bulunamadı';
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (Number.isFinite(date.getTime())) return date.toLocaleString('tr-TR');
    }
    if (value && typeof value.toDate === 'function') {
      const date = value.toDate();
      if (Number.isFinite(date.getTime())) return date.toLocaleString('tr-TR');
    }
  } catch {}
  return 'Kayıt tarihi bulunamadı';
}

export default function StudentLogsModal({ isOpen, onClose, logs = [], testResults = [], studentAccounts = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [activeView, setActiveView] = useState('logins');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const safeLogs = useMemo(() => {
    try {
      if (!Array.isArray(logs)) return [];

      return logs.map((log) => {
        try {
          if (!log || typeof log !== 'object' || Array.isArray(log)) return null;
          return {
            id: typeof log.id === 'string' || typeof log.id === 'number' ? log.id : undefined,
            studentName: safeText(log.studentName, 'Öğrenci'),
            studentEmail: safeText(log.studentEmail, 'E-posta Yok'),
            gradeClass: safeText(log.gradeClass, '11-A'),
            activity: safeText(log.activity, 'Portala Giriş Yapıldı'),
            userAgent: safeText(log.userAgent, ''),
            formattedTime: formatLogTime(log)
          };
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch {
      return [];
    }
  }, [logs]);

  const safeTestResults = useMemo(() => {
    if (!Array.isArray(testResults)) return [];
    return testResults.filter((result) => result && typeof result === 'object').map((result) => ({
      ...result,
      studentName: safeText(result.studentName, 'Öğrenci'),
      studentEmail: safeText(result.studentEmail, 'E-posta Yok'),
      gradeClass: safeText(result.gradeClass, 'Belirtilmedi'),
      testTitle: safeText(result.testTitle, 'Başlıksız test'),
      correctCount: Number(result.correctCount) || 0,
      wrongCount: Number(result.wrongCount) || 0,
      emptyCount: Number(result.emptyCount) || 0,
      successRate: Number(result.successRate) || 0,
      formattedTime: formatLogTime(result)
    }));
  }, [testResults]);

  const classStats = useMemo(() => {
    if (!Array.isArray(studentAccounts)) return [];
    const counts = new Map();
    studentAccounts.forEach((account) => {
      if (!account || typeof account !== 'object') return;
      const match = String(account.gradeClass || '').trim().match(/^(9|10|11|12)\s*-\s*([A-Z])/i);
      const gradeClass = match ? `${match[1]}-${match[2].toUpperCase()}` : 'Belirtilmedi';
      counts.set(gradeClass, (counts.get(gradeClass) || 0) + 1);
    });
    return Array.from(counts, ([gradeClass, count]) => ({ gradeClass, count }))
      .sort((a, b) => a.gradeClass.localeCompare(b.gradeClass, 'tr'));
  }, [studentAccounts]);

  // Loglardan mevcut sınıfları dinamik olarak çıkar
  const classList = useMemo(() => {
    try {
      const classes = new Set([
        ...safeLogs.map((log) => log?.gradeClass),
        ...safeTestResults.map((result) => result.gradeClass),
        ...classStats.map((item) => item.gradeClass)
      ].filter(Boolean));
      return ['all', ...Array.from(classes)];
    } catch {
      return ['all'];
    }
  }, [safeLogs, safeTestResults, classStats]);

  // Arama ve Sınıf filtrelemesi
  const filteredLogs = useMemo(() => {
    try {
      return safeLogs.filter((log) => {
        if (!log) return false;
        const nameMatch = log.studentName ? log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const emailMatch = log.studentEmail ? log.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        
        const matchesSearch = !searchTerm.trim() || nameMatch || emailMatch;
        const matchesClass = selectedClassFilter === 'all' || log.gradeClass === selectedClassFilter;

        return matchesSearch && matchesClass;
      });
    } catch {
      return [];
    }
  }, [safeLogs, searchTerm, selectedClassFilter]);

  const filteredTestResults = useMemo(() => safeTestResults.filter((result) => {
    const queryText = searchTerm.trim().toLowerCase();
    const matchesSearch = !queryText || [result.studentName, result.studentEmail, result.testTitle]
      .some((value) => value.toLowerCase().includes(queryText));
    const matchesClass = selectedClassFilter === 'all' || result.gradeClass === selectedClassFilter;
    return matchesSearch && matchesClass;
  }), [safeTestResults, searchTerm, selectedClassFilter]);

  // Tekil öğrenci sayısı
  const uniqueStudentsCount = useMemo(() => {
    try {
      const emails = new Set(safeLogs.map((l) => l?.studentEmail).filter(Boolean));
      return emails.size;
    } catch {
      return 0;
    }
  }, [safeLogs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/40 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Sınıf ve Öğrenci Giriş Takip Paneli</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Canlı Firestore
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Mahir Şengün Admin Paneli • Sınıflar, öğrenci giriş zamanları ve anlık aktiviteler
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

        {/* Stats, Class Filters & Search Bar */}
        <div className="p-4 sm:p-6 bg-slate-950/60 border-b border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveView('logins')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${activeView === 'logins' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              Giriş Takibi
            </button>
            <button
              type="button"
              onClick={() => setActiveView('results')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${activeView === 'results' ? 'bg-emerald-400 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              Test Çözenler ve Sonuçlar ({safeTestResults.length})
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <div className="text-left leading-tight">
                <span className="block text-[10px] text-slate-400">Tekil Öğrenci</span>
                <span className="text-sm font-bold text-white">{uniqueStudentsCount}</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <div className="text-left leading-tight">
                <span className="block text-[10px] text-slate-400">Toplam Log</span>
                <span className="text-sm font-bold text-purple-300">{safeLogs.length}</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <div className="text-left leading-tight">
                <span className="block text-[10px] text-slate-400">Test Sonucu</span>
                <span className="text-sm font-bold text-emerald-300">{safeTestResults.length}</span>
              </div>
            </div>

            {/* Sınıf Filtreleme Butonları */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
              {classList.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClassFilter(cls)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    selectedClassFilter === cls ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cls === 'all' ? 'Tüm Sınıflar' : cls}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeView === 'results' ? 'Öğrenci, e-posta veya test ara...' : 'Öğrenci adı veya e-posta ara...'}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">Sınıf bazlı kayıt sayısı</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {classStats.length ? classStats.map(({ gradeClass, count }) => (
                <span key={gradeClass} className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] whitespace-nowrap">
                  <strong className="text-cyan-300">{gradeClass}</strong>
                  <span className="text-slate-400">: {count} öğrenci</span>
                </span>
              )) : <span className="text-[11px] text-slate-500">Henüz kayıtlı öğrenci bulunmuyor.</span>}
            </div>
          </div>
        </div>

        {/* Scrollable Logs List */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 max-h-[60vh]">
          {activeView === 'results' ? (
            filteredTestResults.length > 0 ? (
              <div className="space-y-3">
                {filteredTestResults.map((result, index) => (
                  <article
                    key={result.id || `${result.studentEmail}-${result.testTitle}-${index}`}
                    onClick={() => setSelectedStudent({
                      fullName: result.studentName,
                      studentName: result.studentName,
                      email: result.studentEmail,
                      gradeClass: result.gradeClass,
                      createdAt: null
                    })}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-cyan-500/40 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{result.studentName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {result.gradeClass}
                        </span>
                      </div>
                      <span className="block text-xs text-slate-400 font-mono mt-0.5">{result.studentEmail}</span>
                      <span className="block text-xs text-slate-200 mt-2 truncate">{result.testTitle}</span>
                      <span className="block text-[11px] text-slate-500 mt-1">{result.formattedTime}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 shrink-0 text-center">
                      <div className="min-w-14 px-2 py-2 rounded-lg bg-slate-900 border border-slate-800">
                        <strong className="block text-sm text-emerald-300">{result.correctCount}</strong>
                        <span className="text-[10px] text-slate-500">Doğru</span>
                      </div>
                      <div className="min-w-14 px-2 py-2 rounded-lg bg-slate-900 border border-slate-800">
                        <strong className="block text-sm text-rose-300">{result.wrongCount}</strong>
                        <span className="text-[10px] text-slate-500">Yanlış</span>
                      </div>
                      <div className="min-w-14 px-2 py-2 rounded-lg bg-slate-900 border border-slate-800">
                        <strong className="block text-sm text-amber-300">{result.emptyCount}</strong>
                        <span className="text-[10px] text-slate-500">Boş</span>
                      </div>
                      <div className="min-w-14 px-2 py-2 rounded-lg bg-slate-900 border border-slate-800">
                        <strong className="block text-sm text-cyan-300">%{result.successRate}</strong>
                        <span className="text-[10px] text-slate-500">Başarı</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-slate-500">
                {searchTerm || selectedClassFilter !== 'all'
                  ? 'Seçtiğiniz filtreye uygun test sonucu bulunamadı.'
                  : 'Henüz çözülen bir interaktif test bulunmuyor.'}
              </div>
            )
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredLogs.map((log, index) => {
                const studentName = log.studentName;
                const gradeClass = log.gradeClass;
                const studentEmail = log.studentEmail;
                const activity = log.activity;
                const formattedTime = log.formattedTime;
                const isMobile = log?.userAgent && /Mobile|Android|iPhone/i.test(log.userAgent);

                return (
                  <div
                    key={log?.id || index}
                    onClick={() => {
                      const account = studentAccounts.find((item) =>
                        String(item.email || '').toLowerCase() === String(studentEmail || '').toLowerCase()
                      );
                      setSelectedStudent(account || {
                        fullName: studentName,
                        email: studentEmail,
                        gradeClass,
                        createdAt: null
                      });
                    }}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-cyan-500/40 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                        {studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {studentName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {gradeClass}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block font-mono mt-0.5">
                          {studentEmail}
                        </span>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Aktivite: <strong className="text-white">{activity}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-400 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="flex items-center gap-1.5 font-mono text-cyan-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{formattedTime}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        {isMobile ? <Smartphone className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
                        <span>{isMobile ? 'Mobil' : 'PC'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-slate-500">
              {searchTerm || selectedClassFilter !== 'all' 
                ? 'Seçtiğiniz filtreye uygun öğrenci kaydı bulunamadı.' 
                : 'Henüz sisteme giriş yapan öğrenci bulunmuyor. Öğrenciler giriş yaptıkça loglar burada anlık listelenecektir.'}
            </div>
          )}
        </div>

        {/* Öğrenci Sicil ve Takip Kartı */}
        {selectedStudent && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
            <div className="w-full max-w-3xl max-h-full overflow-y-auto rounded-3xl border border-cyan-500/30 bg-slate-900 shadow-2xl shadow-cyan-950/30">
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95">
                <div>
                  <h3 className="text-base font-bold text-white">Öğrenci Sicil ve Takip Kartı</h3>
                  <p className="text-xs text-slate-400 mt-1">Kayıt, geçmiş test ve net karnesi</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const email = String(selectedStudent.email || '').toLowerCase();
                const name = String(selectedStudent.fullName || selectedStudent.studentName || '').toLowerCase();
                const account = studentAccounts.find((item) =>
                  String(item.email || '').toLowerCase() === email ||
                  String(item.fullName || item.studentName || item.nickname || '').toLowerCase() === name
                ) || selectedStudent;
                const history = safeTestResults.filter((result) =>
                  String(result.studentEmail || '').toLowerCase() === email ||
                  (name && String(result.studentName || '').toLowerCase() === name)
                );
                const totals = history.reduce((sum, result) => ({
                  correct: sum.correct + result.correctCount,
                  wrong: sum.wrong + result.wrongCount,
                  empty: sum.empty + result.emptyCount
                }), { correct: 0, wrong: 0, empty: 0 });
                const net = Math.max(0, totals.correct - (totals.wrong / 4));

                return (
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Öğrenci</span>
                        <strong className="text-sm text-white">{safeText(account.fullName || account.studentName || name, 'Öğrenci')}</strong>
                        <span className="block text-xs text-slate-400 mt-1">{safeText(account.email || account.studentEmail, '-')}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Sınıf</span>
                        <strong className="text-sm text-cyan-300">{safeText(account.gradeClass, 'Belirtilmedi')}</strong>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Kayıt Tarihi</span>
                        <strong className="text-xs text-white">{formatRegistrationTime(account.createdAt || selectedStudent.createdAt)}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        ['Toplam Test', history.length, 'text-cyan-300'],
                        ['Doğru', totals.correct, 'text-emerald-300'],
                        ['Yanlış', totals.wrong, 'text-rose-300'],
                        ['Net', net.toFixed(2), 'text-amber-300']
                      ].map(([label, value, color]) => (
                        <div key={label} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                          <strong className={`block text-lg ${color}`}>{value}</strong>
                          <span className="text-[10px] text-slate-500">{label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300">Geçmiş Tüm Testler</h4>
                      {history.length ? history.map((result, index) => (
                        <div key={result.id || index} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="min-w-0">
                            <strong className="block text-xs text-white truncate">{result.testTitle}</strong>
                            <span className="text-[10px] text-slate-500">{result.formattedTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-emerald-300">D {result.correctCount}</span>
                            <span className="text-rose-300">Y {result.wrongCount}</span>
                            <span className="text-amber-300">B {result.emptyCount}</span>
                            <span className="text-cyan-300">%{result.successRate}</span>
                          </div>
                        </div>
                      )) : (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500 text-center">
                          Bu öğrenciye ait kayıtlı test sonucu bulunmuyor.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between text-xs text-slate-400">
          <span>Yönetici: <strong className="text-white">Mahir Şengün</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}