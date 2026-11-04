import React from 'react';
import { 
  User, LogOut, Bell, PlusCircle, BookOpen, ShieldCheck, 
  FilePlus, Users, LogIn, PlayCircle
} from 'lucide-react';
import { teacherProfile } from '../data/teacherProfile';

export default function Navbar({ 
  user, 
  onLogout, 
  onOpenAnnouncements, 
  onOpenFormulas, 
  onOpenUploadPdf,
  onOpenCreateAnnouncement,
  onOpenAddVideo,
  onOpenLogs,
  onOpenAccountSettings,
  logsCount = 0
}) {
  const isTeacher = user?.role === 'teacher';

  return (
    <header className="relative w-full bg-[#070d18] border-b border-slate-800/80 overflow-hidden select-none">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 max-w-full h-36 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/12 -translate-y-1/2 w-64 h-36 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="relative z-20 w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-3 sm:pb-2 flex flex-wrap items-center justify-between gap-3">
        
        {/* Top Left: Live Status */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/90 text-cyan-400 border border-slate-800 backdrop-blur shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mahir Hocam Öğrenci Portalı</span>
          </span>
        </div>

        {/* Top Right: User Profile & Actions */}
        <div className="w-full min-w-0 sm:w-auto sm:ml-auto grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
          
          {isTeacher && (
            <>
              <button
                onClick={onOpenAddVideo}
                title="Ders Videosu Ekle"
                aria-label="Ders Videosu Ekle"
                className="min-h-10 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 border border-rose-400/30 transition cursor-pointer"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ders Videosu Ekle</span>
              </button>

              <button
                onClick={onOpenLogs}
                title="Giriş Takibi"
                aria-label="Giriş Takibi"
                className="min-h-10 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 transition cursor-pointer shadow-sm"
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Giriş Takibi</span>
                {logsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500 text-slate-950 font-extrabold font-mono">
                    {logsCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenUploadPdf}
                title="Yeni PDF Yükle"
                aria-label="Yeni PDF Yükle"
                className="min-h-10 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-950/40 border border-purple-500/40 transition cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Yeni PDF Yükle</span>
              </button>

              <button
                onClick={onOpenCreateAnnouncement}
                className="hidden md:flex min-h-10 items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Duyuru Ekle</span>
              </button>

              <button
                onClick={onOpenAccountSettings}
                title="Hesap Ayarları"
                aria-label="Hesap Ayarları"
                className="min-h-10 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden lg:inline">Hesap Ayarları</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenFormulas}
            className="hidden lg:flex min-h-10 items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Formüller</span>
          </button>

          <button
            onClick={onOpenAnnouncements}
            title="Duyurular"
            aria-label="Duyurular"
            className="min-h-10 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition cursor-pointer relative"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Duyurular</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {/* User Tag */}
          {isTeacher ? <div className="flex items-center justify-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
              isTeacher 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {isTeacher ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-slate-200 block leading-tight max-w-[100px] sm:max-w-[140px] truncate">
                {isTeacher ? teacherProfile.officialName : (user.displayName || user.fullName || user.nickname || 'Öğrenci')}
              </span>
              <span className={`text-[10px] font-medium block leading-none ${
                isTeacher ? 'text-purple-400' : 'text-cyan-400'
              }`}>
                {isTeacher ? 'Fizik Öğretmeni' : (user.gradeClass || 'Öğrenci')}
              </span>
            </div>
          </div> : user ? (
            <button
              type="button"
              onClick={onOpenAccountSettings}
              title="Profil Düzenleme"
              aria-label="Profil Düzenleme"
              className="min-h-10 flex items-center justify-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition"
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs bg-cyan-500/20 text-cyan-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-slate-200 block leading-tight max-w-[100px] sm:max-w-[140px] truncate">{user.displayName || user.fullName || user.nickname || 'Öğrenci'}</span>
                <span className="text-[10px] font-medium block leading-none text-cyan-400">{user.gradeClass || 'Profil'}</span>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAccountSettings}
              title="Giriş Yap veya Kayıt Ol"
              aria-label="Giriş Yap veya Kayıt Ol"
              className="min-h-10 flex items-center justify-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/30 text-slate-200 transition"
            >
              <LogIn className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold">Giriş Yap</span>
            </button>
          )}

          {user && (
            <button
              onClick={onLogout}
              title="Oturumu Kapat"
              aria-label="Oturumu Kapat"
              className="min-h-10 min-w-10 flex items-center justify-center p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* Main Centered Banner Image Section */}
      <div className="relative z-10 w-full flex items-center justify-center px-4 py-2 bg-slate-950/60">
        <img
          src="/bannnee.jpg"
          alt="Mahir Hocam - Fizik Dersi"
          className="w-full max-w-5xl h-auto object-contain object-center rounded-2xl shadow-xl border border-slate-800/60"
        />
      </div>

    </header>
  );
}