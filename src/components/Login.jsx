import React, { useState } from 'react';
import {
  AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff,
  LockKeyhole, Mail, UserRound, X
} from 'lucide-react';
import { teacherProfile } from '../data/teacherProfile';
import { loginWithNickname, registerStudentWithNickname, sendStudentPasswordReset } from '../firebase';

export default function Login({ onLoginSuccess, onClose, notice = '' }) {
  const [authMode, setAuthMode] = useState('login');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('11');
  const [section, setSection] = useState('A');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const sectionOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Lütfen kullanıcı adı veya e-posta adresinizi ve şifrenizi girin.');
      return;
    }

    if (authMode === 'register') {
      if (!fullName.trim() || !email.trim()) {
        setError('Ad soyad ve e-posta adresi zorunludur.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
        return;
      }
      if (password.length < 6) {
        setError('Şifreniz en az 6 karakter olmalıdır.');
        return;
      }
    }

    try {
      setLoading(true);
      const user = authMode === 'register'
        ? await registerStudentWithNickname(identifier.trim(), password, email.trim(), fullName.trim(), `${gradeLevel}-${section}`)
        : await loginWithNickname(identifier.trim(), password);
      onLoginSuccess(user);
    } catch (submitError) {
      setError(submitError.message || 'İşlem başarısız oldu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      await sendStudentPasswordReset(email);
      setSuccess('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (resetError) {
      const errorMessages = {
        'auth/user-not-found': 'Bu e-posta Firebase Authentication hesabına bağlı değil. Eski kullanıcı hesabınız varsa mevcut şifrenizle bir kez giriş yapın.',
        'auth/operation-not-allowed': 'Firebase Console üzerinden E-posta/Şifre giriş yöntemini etkinleştirin.',
        'auth/invalid-email': 'Geçerli bir e-posta adresi girin.'
      };
      setError(errorMessages[resetError.code] || resetError.message || 'Sıfırlama bağlantısı gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setIsForgotPassword(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#030712] px-4 py-8 text-slate-100 selection:bg-sky-400 selection:text-slate-950 sm:px-8 lg:justify-end lg:px-[8vw]">
      <div className="absolute inset-0 z-0">
        <img src="/banner.png" alt="" aria-hidden="true" className="h-full w-full object-cover object-[62%_center] opacity-55" />
      </div>
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(2,6,18,0.68)_0%,rgba(2,6,18,0.54)_48%,rgba(2,6,18,0.86)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_78%_50%,rgba(0,114,255,0.16),transparent_42%),linear-gradient(135deg,rgba(0,95,255,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute -left-24 top-16 z-[1] h-72 w-72 rounded-full bg-blue-600/20 blur-[100px]" />

      {onClose && <button type="button" onClick={onClose} aria-label="Giriş ekranını kapat" className="absolute right-4 top-4 z-30 rounded-full border border-white/15 bg-slate-950/50 p-2.5 text-slate-300 backdrop-blur transition hover:border-sky-400/50 hover:text-white sm:right-7 sm:top-7"><X className="h-5 w-5" /></button>}

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(400px,0.78fr)] lg:gap-16">
        <section className="hidden max-w-2xl lg:block">
          <div className="mb-7 flex items-center gap-3 text-sky-300"><span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-sky-400/40 bg-sky-500/10 shadow-[0_0_28px_rgba(0,168,255,0.24)]"><img src="/favicon.png" alt="Mahir Hocam logosu" className="h-full w-full object-cover" /></span><span className="text-xs font-bold uppercase tracking-[0.3em]">YKS Fizik Eğitim Platformu</span></div>
          <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-white xl:text-7xl">Mahir <span className="bg-gradient-to-r from-sky-300 via-[#00a8ff] to-blue-500 bg-clip-text text-transparent">Hocam</span><span className="mt-2 block text-2xl font-semibold tracking-[0.34em] text-slate-200 xl:text-3xl">FİZİK DERSİ</span></h1>
          <div className="mt-6 h-1 w-64 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-transparent shadow-[0_0_18px_rgba(0,168,255,0.6)]" />
          <p className="mt-7 max-w-lg text-xl leading-relaxed text-slate-200 xl:text-2xl">“Öğrenirken Yanında,<br /><span className="font-semibold text-sky-300">Başarırken Destekçin.</span>”</p>
        </section>

        <section className="mx-auto w-full max-w-md rounded-[2rem] border border-sky-400/60 bg-[#030b1b]/85 p-6 shadow-[0_0_18px_rgba(0,145,255,0.18),0_0_65px_rgba(0,95,255,0.15)] backdrop-blur-2xl sm:p-9">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl drop-shadow-[0_0_18px_rgba(0,168,255,0.75)]"><img src="/favicon.png" alt="Mahir Hocam logosu" className="h-full w-full object-cover" /></span>
            <h2 className="text-4xl font-black tracking-tight text-white">{isForgotPassword ? 'Şifreni Sıfırla' : authMode === 'register' ? 'Kayıt Ol' : <>Giriş <span className="bg-gradient-to-r from-sky-300 to-blue-500 bg-clip-text text-transparent">Yap</span></>}</h2>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-300">{isForgotPassword ? 'Hesabınıza bağlı e-posta adresini girin.' : authMode === 'register' ? 'Hesabını oluştur, Mahir Hocam ile çalışmaya başla.' : 'Hesabınıza giriş yaparak Mahir Hocam ile devam edin.'}</p>
          </div>

          {notice && <div role="status" className="mb-4 rounded-xl border border-sky-400/25 bg-sky-400/10 p-3 text-xs text-sky-100">{notice}</div>}
          {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" /><span>{error}</span></div>}
          {success && <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-200"><CheckCircle2 className="h-4 w-4 shrink-0" /><span>{success}</span></div>}

          <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-3.5">
            {isForgotPassword ? <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-300">Hesabınıza kayıtlı e-posta adresi</span>
              <span className="flex min-h-14 items-center gap-3 rounded-full border border-slate-500/70 bg-slate-950/45 px-4 transition focus-within:border-sky-400 focus-within:shadow-[0_0_14px_rgba(0,168,255,0.16)]"><Mail className="h-5 w-5 shrink-0 text-slate-400" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ornek@eposta.com" autoComplete="email" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400" required /></span>
            </label> : <>
              {authMode === 'register' && <>
                <label className="block"><span className="sr-only">Adınız ve Soyadınız</span><span className="flex min-h-12 items-center gap-3 rounded-full border border-slate-500/70 bg-slate-950/45 px-4 transition focus-within:border-sky-400 focus-within:shadow-[0_0_14px_rgba(0,168,255,0.16)]"><UserRound className="h-5 w-5 shrink-0 text-slate-400" /><input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Adınız ve Soyadınız" autoComplete="name" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400" required /></span></label>
                <label className="block"><span className="sr-only">E-posta adresi</span><span className="flex min-h-12 items-center gap-3 rounded-full border border-slate-500/70 bg-slate-950/45 px-4 transition focus-within:border-sky-400"><Mail className="h-5 w-5 shrink-0 text-slate-400" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-posta adresi" autoComplete="email" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400" required /></span></label>
                <div className="grid grid-cols-2 gap-3"><label className="block"><span className="sr-only">Sınıf seviyesi</span><select value={gradeLevel} onChange={(event) => setGradeLevel(event.target.value)} className="min-h-12 w-full rounded-full border border-slate-500/70 bg-[#071327] px-4 text-sm text-slate-200 outline-none focus:border-sky-400">{['9', '10', '11', '12'].map((level) => <option key={level} value={level}>{level}. Sınıf</option>)}</select></label><label className="block"><span className="sr-only">Şube</span><select value={section} onChange={(event) => setSection(event.target.value)} className="min-h-12 w-full rounded-full border border-slate-500/70 bg-[#071327] px-4 text-sm text-slate-200 outline-none focus:border-sky-400">{sectionOptions.map((letter) => <option key={letter} value={letter}>{letter} Şubesi</option>)}</select></label></div>
              </>}

              <label className="block"><span className="sr-only">Kullanıcı adı veya e-posta</span><span className="flex min-h-14 items-center gap-3 rounded-full border border-slate-500/70 bg-slate-950/45 px-4 transition focus-within:border-sky-400 focus-within:shadow-[0_0_14px_rgba(0,168,255,0.16)]"><UserRound className="h-5 w-5 shrink-0 text-slate-400" /><input type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Kullanıcı Adı veya E-posta" autoComplete="username" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400" required /></span></label>

              <label className="block"><span className="sr-only">Şifre</span><span className="flex min-h-14 items-center gap-3 rounded-full border border-slate-500/70 bg-slate-950/45 px-4 transition focus-within:border-sky-400 focus-within:shadow-[0_0_14px_rgba(0,168,255,0.16)]"><LockKeyhole className="h-5 w-5 shrink-0 text-slate-400" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Şifre" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400" required /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'} className="shrink-0 text-slate-400 transition hover:text-sky-300">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span></label>

              {authMode === 'register' && <label className="block"><span className="sr-only">Şifre tekrar</span><span className="flex min-h-12 items-center gap-3 rounded-full border border-slate-500/70 bg-slate-950/45 px-4 transition focus-within:border-sky-400"><LockKeyhole className="h-5 w-5 shrink-0 text-slate-400" /><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Şifre tekrar" autoComplete="new-password" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400" required /></span></label>}

              {authMode === 'login' && <div className="-mt-1 flex justify-end"><button type="button" onClick={() => { setEmail(identifier.includes('@') ? identifier : ''); setIsForgotPassword(true); setError(''); setSuccess(''); }} className="min-h-9 px-2 text-xs font-medium text-sky-300 transition hover:text-sky-200">Şifreni mi unuttun?</button></div>}
            </>}

            <button type="submit" disabled={loading} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-blue-600 px-5 text-sm font-bold text-white shadow-[0_0_28px_rgba(0,145,255,0.32)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60">{loading ? 'Lütfen bekleyin…' : isForgotPassword ? 'Sıfırlama Bağlantısı Gönder' : authMode === 'register' ? 'Kayıt Ol ve Giriş Yap' : 'Giriş Yap'} {!loading && <ArrowRight className="h-4 w-4" />}</button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-300">
            {isForgotPassword ? <button type="button" onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }} className="min-h-9 px-2 font-medium text-sky-300 transition hover:text-sky-200">Giriş ekranına dön</button> : <>{authMode === 'login' ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'} <button type="button" onClick={() => switchAuthMode(authMode === 'login' ? 'register' : 'login')} className="ml-1 font-semibold text-sky-300 transition hover:text-sky-200">{authMode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}</button></>}
          </div>
          <p className="mt-6 text-center text-[10px] text-slate-500">© 2026-2027 {teacherProfile.portalBrand} • {teacherProfile.officialName}</p>
        </section>
      </div>
    </div>
  );
}
