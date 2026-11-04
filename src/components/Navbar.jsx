import React, { useState } from 'react';
import {
  Bell, BookOpen, FilePlus, LogIn, LogOut, Menu, PlayCircle,
  PlusCircle, Search, ShieldCheck, User, Users, X
} from 'lucide-react';
import { teacherProfile } from '../data/teacherProfile';

const navigation = [
  ['Ana Sayfa', '#home'],
  ['Dersler', '#dersler'],
  ['Kaynaklar', '#kaynaklar'],
  ['Hakkımızda', '#hakkimizda'],
  ['İletişim', '#iletisim']
];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const isTeacher = user?.role === 'teacher';

  const scrollToCourses = (event) => {
    event.preventDefault();
    document.getElementById('dersler')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderUserAction = () => user ? (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onOpenAccountSettings} className="flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs text-slate-200 transition hover:border-sky-400/40">
        {isTeacher ? <ShieldCheck className="h-4 w-4 text-sky-300" /> : <User className="h-4 w-4 text-sky-300" />}
        <span className="max-w-32 truncate">{isTeacher ? teacherProfile.officialName : (user.displayName || user.fullName || user.nickname || 'Öğrenci')}</span>
      </button>
      <button type="button" onClick={onLogout} aria-label="Oturumu kapat" className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-rose-400/40 hover:text-rose-300"><LogOut className="h-4 w-4" /></button>
    </div>
  ) : (
    <button type="button" onClick={onOpenAccountSettings} className="flex min-h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-5 text-xs font-bold text-slate-950 shadow-[0_0_22px_rgba(0,168,255,0.28)] transition hover:brightness-110"><LogIn className="h-4 w-4" />Giriş Yap</button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070d]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#home" className="flex shrink-0 items-center gap-3" aria-label="Mahir Hocam ana sayfa">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-sky-400/30 bg-sky-400/10 shadow-[0_0_22px_rgba(0,168,255,0.16)]"><img src="/favicon.png" alt="Mahir Hocam logosu" className="h-full w-full object-cover" /></span>
          <span className="leading-tight"><span className="block text-sm font-black tracking-wide text-white sm:text-base">Mahir Hocam</span><span className="text-[10px] tracking-[0.28em] text-slate-400">FİZİK DERSİ</span></span>
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 xl:flex" aria-label="Ana gezinme">
          {navigation.map(([label, href], index) => <a key={href} href={href} className={`rounded-full px-3 py-2 text-xs font-medium transition 2xl:px-4 ${index === 0 ? 'border border-sky-400/30 bg-sky-400/10 text-sky-200' : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'}`}>{label}</a>)}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <form onSubmit={scrollToCourses} className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2.5 transition focus-within:border-sky-400/50">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Aradığın konuyu yaz..." aria-label="Konu ara" className="w-36 bg-transparent text-xs text-white outline-none placeholder:text-slate-500 2xl:w-40" />
          </form>
          {renderUserAction()}
        </div>

        <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'} className="rounded-xl border border-white/10 p-2 text-slate-200 xl:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>

      {menuOpen && <div className="border-t border-white/10 bg-[#070b13] px-4 py-4 xl:hidden">
        <nav className="grid grid-cols-2 gap-2" aria-label="Mobil gezinme">{navigation.map(([label, href]) => <a onClick={() => setMenuOpen(false)} key={href} href={href} className="rounded-xl border border-white/[0.07] px-3 py-2.5 text-sm text-slate-300">{label}</a>)}</nav>
        <form onSubmit={scrollToCourses} className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Aradığın konuyu yaz..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" /></form>
        <div className="mt-3 flex flex-wrap gap-2">
          {isTeacher && <>
            <button type="button" onClick={onOpenAddVideo} className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200"><PlayCircle className="mr-1 inline h-3.5 w-3.5" />Video Ekle</button>
            <button type="button" onClick={onOpenUploadPdf} className="rounded-lg border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs text-sky-200"><FilePlus className="mr-1 inline h-3.5 w-3.5" />PDF Yükle</button>
            <button type="button" onClick={onOpenLogs} className="rounded-lg border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs text-sky-200"><Users className="mr-1 inline h-3.5 w-3.5" />Giriş Takibi ({logsCount})</button>
            <button type="button" onClick={onOpenCreateAnnouncement} className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-200"><PlusCircle className="mr-1 inline h-3.5 w-3.5" />Duyuru Ekle</button>
          </>}
          <button type="button" onClick={onOpenAnnouncements} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300"><Bell className="mr-1 inline h-3.5 w-3.5" />Duyurular</button>
          <button type="button" onClick={onOpenFormulas} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300"><BookOpen className="mr-1 inline h-3.5 w-3.5" />Formüller</button>
          {user ? <button type="button" onClick={onOpenAccountSettings} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300">Hesap ayarları</button> : <button type="button" onClick={onOpenAccountSettings} className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-slate-950"><LogIn className="mr-1 inline h-3.5 w-3.5" />Giriş Yap</button>}
          {user && <button type="button" onClick={onLogout} className="rounded-lg border border-rose-400/20 px-3 py-2 text-xs text-rose-200"><LogOut className="mr-1 inline h-3.5 w-3.5" />Çıkış yap</button>}
        </div>
      </div>}
    </header>
  );
}
