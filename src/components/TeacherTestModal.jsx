import React, { useState } from 'react';
import { X, Clock, Sparkles, AlertCircle, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { addInteractiveTestToFirestore, uploadTestImage } from '../firebase';

export default function TeacherTestModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const [totalQuestions, setTotalQuestions] = useState(10);
  const [imagePages, setImagePages] = useState([{ file: null, preview: '' }]);
  const [answerKey, setAnswerKey] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];
  const questionCount = Math.max(1, Math.min(300, Number(totalQuestions) || 1));

  const handleImageChange = (pageIndex, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setImagePages((current) => current.map((page, index) => {
      if (index !== pageIndex) return page;
      if (page.preview) URL.revokeObjectURL(page.preview);
      return { file, preview: URL.createObjectURL(file) };
    }));
  };

  const handleAddImagePage = () => {
    setImagePages((current) => [...current, { file: null, preview: '' }]);
  };

  const handleRemoveImagePage = (pageIndex) => {
    setImagePages((current) => {
      if (current.length <= 1) return current;
      if (current[pageIndex]?.preview) URL.revokeObjectURL(current[pageIndex].preview);
      return current.filter((_, index) => index !== pageIndex);
    });
  };

  const handleCorrectChange = (questionIndex, answer) => {
    setAnswerKey((current) => ({ ...current, [questionIndex]: answer }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Lütfen test adını giriniz.');
      return;
    }
    const deadlineTime = new Date(deadline).getTime();
    if (!Number.isFinite(deadlineTime) || deadlineTime <= Date.now()) {
      setError('Bitiş tarihi ve saati gelecekte olmalıdır.');
      return;
    }
    if (!Number.isInteger(Number(totalQuestions)) || Number(totalQuestions) < 1 || Number(totalQuestions) > 300) {
      setError('Toplam soru sayısı 1 ile 300 arasında olmalıdır.');
      return;
    }
    if (imagePages.some((page) => !page.file)) {
      setError('Lütfen kitapçığın tüm sayfa görsellerini seçiniz.');
      return;
    }
    for (let i = 0; i < questionCount; i++) {
      if (!answerKey[i]) {
        setError(`${i + 1}. sorunun doğru cevabını seçiniz.`);
        return;
      }
    }

    try {
      setSubmitting(true);

      const testImageUrls = await Promise.all(imagePages.map((page) => uploadTestImage(page.file)));
      const totalImageDataSize = testImageUrls.reduce((total, imageUrl) => total + imageUrl.length, 0);
      if (totalImageDataSize > 900 * 1024) {
        throw new Error('Kitapçık görsellerinin toplam boyutu çok büyük. Firestore kaydı için daha küçük görseller seçiniz.');
      }

      await addInteractiveTestToFirestore({
        title: title.trim(),
        deadline: new Date(deadline).toISOString(),
        totalQuestions: questionCount,
        testImageUrls,
        answerKey: Object.fromEntries(
          Array.from({ length: questionCount }, (_, index) => [index, answerKey[index]])
        )
      });

      onClose();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      setError(err?.message || 'Test kaydedilirken hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl my-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Fotoğraflı İnteraktif Test Oluştur</h2>
              <p className="text-xs text-slate-400">Test kitapçığını yükleyin ve cevap anahtarını belirleyin.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200">
          {error && (
            <div className="p-3 text-xs bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Test Adı ve Kilitlenme Tarihi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Test / Deneme Adı *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 11. Sınıf Fizik 2. Yazılı Deneme Sınavı"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Bitiş Tarihi ve Saati *
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-purple-500/40 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>
          </div>

          <div className="space-y-5 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Toplam Soru Sayısı *</label>
              <input
                type="number"
                min="1"
                max="300"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                className="w-full md:w-48 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-semibold text-slate-300">Test Kitapçığı Sayfaları *</h3>
                <button
                  type="button"
                  onClick={handleAddImagePage}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Sayfa Ekle
                </button>
              </div>
              {imagePages.map((page, pageIndex) => (
                <div key={pageIndex} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-cyan-300">{pageIndex + 1}. Sayfa Fotoğrafı</span>
                    {imagePages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImagePage(pageIndex)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        aria-label={`${pageIndex + 1}. sayfayı kaldır`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <label className="w-full flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-lg cursor-pointer bg-slate-900/50 transition">
                    {page.preview ? (
                      <div className="space-y-2 text-center">
                        <img src={page.preview} alt={`${pageIndex + 1}. sayfa önizleme`} className="max-h-48 mx-auto rounded-lg border border-slate-700 object-contain" />
                        <span className="text-[11px] text-cyan-400 font-medium">Değiştirmek için tıklayın</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-2">
                        <Upload className="w-5 h-5 text-cyan-400 mb-1" />
                        <span className="text-xs font-bold text-slate-200">Sayfa görselini seçin</span>
                        <span className="text-[10px] text-slate-500">PNG, JPG veya JPEG (en fazla 10 MB)</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                      onChange={(e) => handleImageChange(pageIndex, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Cevap Anahtarı ({questionCount} Soru)</h3>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {Array.from({ length: questionCount }, (_, questionIndex) => (
                  <div key={questionIndex} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs font-bold text-slate-300 w-20">{questionIndex + 1}. Soru</span>
                    <div className="flex gap-1.5">
                      {optionLabels.map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handleCorrectChange(questionIndex, label)}
                          aria-label={`${questionIndex + 1}. soru doğru cevap ${label}`}
                          aria-pressed={answerKey[questionIndex] === label}
                          className={`w-8 h-8 rounded-full text-xs font-bold transition ${answerKey[questionIndex] === label ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Yükleniyor...' : 'Testi Yayınla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}