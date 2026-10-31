import React from 'react';
import { BookOpen, CheckCircle, Bookmark, ArrowRight, Sparkles, Trash2, Image } from 'lucide-react';

export default function QuestionCard({ 
  question, 
  onOpenSolution, 
  isSolved, 
  isBookmarked, 
  onToggleBookmark, 
  onToggleSolved,
  isTeacher,
  onDeleteQuestion
}) {
  const difficultyConfig = {
    Kolay: {
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400'
    },
    Orta: {
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400'
    },
    Zor: {
      badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400'
    }
  };

  const diff = difficultyConfig[question.difficulty] || difficultyConfig['Orta'];

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`"${question.title}" başlıklı soruyu Firestore'dan silmek istediğinize emin misiniz?`)) {
      onDeleteQuestion(question.id);
    }
  };

  return (
    <div className={`group relative bg-slate-900/70 hover:bg-slate-900/90 border transition-all duration-300 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg shadow-black/20 hover:shadow-cyan-950/30 hover:border-cyan-500/40 backdrop-blur ${
      isSolved ? 'border-emerald-500/30' : 'border-slate-800'
    }`}>
      
      {/* Top Meta Line */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-slate-800 text-cyan-400 border border-slate-700">
              #{String(question.id).length > 6 ? String(question.id).substring(0, 5) + '..' : question.id}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
              {question.unit}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${diff.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
              {question.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* If teacher, show delete button */}
            {isTeacher && onDeleteQuestion && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 rounded-lg border bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 border-rose-500/30 transition cursor-pointer"
                title="Soruyu Firestore'dan Sil (Öğretmen Yetkisi)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onToggleBookmark(question.id)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isBookmarked 
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/40' 
                  : 'bg-slate-800/60 text-slate-500 hover:text-slate-300 border-slate-700/60'
              }`}
              title={isBookmarked ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => onToggleSolved(question.id)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isSolved 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-slate-800/60 text-slate-500 hover:text-slate-300 border-slate-700/60'
              }`}
              title={isSolved ? 'Çözüldü olarak işaretlendi' : 'Çözüldü olarak işaretle'}
            >
              <CheckCircle className={`w-3.5 h-3.5 ${isSolved ? 'text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Thumbnail if uploaded image exists */}
        {question.imageUrl && (
          <div className="mb-3 h-28 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative">
            <img
              src={question.imageUrl}
              alt={question.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-950/80 text-cyan-300 font-mono flex items-center gap-1 border border-slate-800">
              <Image className="w-3 h-3" /> Görselli
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
          {question.title}
        </h3>

        {/* Preview snippet */}
        <p className="mt-2 text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
          {question.preview}
        </p>

        {/* Quick specs pill */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="text-purple-400 font-medium">🎯 {question.points} Puan</span>
          <span>•</span>
          <span>{question.grade}</span>
          {question.author && (
            <>
              <span>•</span>
              <span className="text-cyan-400 font-medium">{question.author}</span>
            </>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          {question.steps ? `${question.steps.length} Adımda Çözüm` : 'Detaylı Çözüm'}
        </span>

        <button
          onClick={() => onOpenSolution(question)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 hover:border-cyan-400 shadow-sm transition-all duration-200 cursor-pointer group/btn"
        >
          <span>Çözümü Gör</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
}
