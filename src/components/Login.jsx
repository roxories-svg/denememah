import React, { useState } from 'react';
import { GraduationCap, ArrowRight, Atom, ShieldCheck, Lock, User, Mail, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { teacherProfile } from '../data/teacherProfile';
import { loginWithNickname, registerStudentWithNickname, sendStudentPasswordReset } from '../firebase';

export default function Login({ onLoginSuccess, onClose, notice = '' }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' veya 'register'
  const [role, setRole] = useState('student'); // 'student' veya 'teacher'
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [identifier, setIdentifier] = useState(''); // Nickname veya E-posta
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (role === 'student' && authMode === 'register') {
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
      let user;
      if (role === 'teacher') {
        user = await loginWithNickname(identifier.trim(), password, 'teacher');
      } else if (authMode === 'register') {
        user = await registerStudentWithNickname(identifier.trim(), password, email.trim(), fullName.trim(), `${gradeLevel}-${section}`);
      } else {
        user = await loginWithNickname(identifier.trim(), password, 'student');
      }
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'İşlem başarısız oldu.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      await sendStudentPasswordReset(email);
      setSuccess('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (err) {
      const errorMessages = {
        'auth/user-not-found': 'Bu e-posta Firebase Authentication hesabına bağlı değil. Eski nickname hesabınız varsa önce mevcut şifrenizle bir kez giriş yapınız.',
        'auth/operation-not-allowed': 'Firebase Console üzerinden E-posta/Şifre giriş yöntemini etkinleştiriniz.',
        'auth/invalid-email': 'Geçerli bir e-posta adresi giriniz.'
      };
      setError(errorMessages[err.code] || err.message || 'Sıfırlama bağlantısı gönderilemedi. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setAuthMode('login');
    setError('');
    setIdentifier('');
    setPassword('');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative w-full max-w-xl my-6">
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-cyan-950/40">
          {onClose && (
            <div className="flex justify-end -mb-2">
              <button type="button" onClick={onClose} className="min-h-10 inline-flex items-center gap-1.5 px-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <span>Ana Sayfaya Dön</span><X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Atom className="w-3.5 h-3.5" />
              {teacherProfile.portalBrand} • Fizik Yazılı Çalışma Portalı
            </span>
          </div>

          {/* Banner Image */}
          <div className="w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-[#070d18] shadow-lg p-2 mb-6 flex items-center justify-center">
            <img src="/bannnee.jpg" alt="Mahir Hocam - Fizik Dersi" className="w-full h-auto object-contain object-center rounded-xl max-h-[140px]" />
          </div>

          {/* Role Selectors */}
          {!isForgotPassword && <div className="mb-5 grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
            <button type="button" onClick={() => selectRole('student')} className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${role === 'student' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}>
              <GraduationCap className="w-4 h-4" /> Öğrenci Portalı
            </button>
            <button type="button" onClick={() => selectRole('teacher')} className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${role === 'teacher' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
              <ShieldCheck className="w-4 h-4" /> Mahir Şengün (Admin)
            </button>
          </div>}

          {!isForgotPassword && role === 'student' && (
            <div className="flex items-center justify-center gap-4 mb-5 text-xs font-semibold">
              <button type="button" onClick={() => { setAuthMode('login'); setError(''); }} className={`pb-1 border-b-2 transition ${authMode === 'login' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400'}`}>Giriş Yap</button>
              <span className="text-slate-600">•</span>
              <button type="button" onClick={() => { setAuthMode('register'); setError(''); }} className={`pb-1 border-b-2 transition ${authMode === 'register' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400'}`}>Yeni Kayıt Ol</button>
            </div>
          )}

          {notice && <div role="status" className="mb-4 p-3 text-xs bg-cyan-500/10 border border-cyan-500/25 text-cyan-200 rounded-xl">{notice}</div>}
          {error && (
            <div className="mb-4 p-3 text-xs bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" /><span>{error}</span>
            </div>
          )}
          {success && <div role="status" className="mb-4 p-3 text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl">{success}</div>}

          <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-3.5">
            {isForgotPassword ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-cyan-400" />Hesabınıza kayıtlı e-posta adresi</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ogrenci@okul.k12.tr" autoComplete="email" className="w-full px-3.5 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" required />
                </div>
                <button type="submit" disabled={loading} className="w-full min-h-11 mt-3 py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-lg disabled:opacity-50">
                  <span>{loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}</span><ArrowRight className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }} className="w-full min-h-10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition">
                  Giriş ekranına dön
                </button>
              </>
            ) : (
              <>
            {authMode === 'register' && role === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Adınız ve Soyadınız *</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ahmet Yılmaz" className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" required />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">E-posta Adresi * (Her e-posta ile 1 hesap)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ogrenci@okul.k12.tr" className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Sınıf Seviyesi *</label>
                    <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-slate-100">
                      {['9', '10', '11', '12'].map((level) => <option key={level} value={level} className="bg-slate-900">{level}. Sınıf</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Şube *</label>
                    <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-slate-100">
                      {sectionOptions.map((letter) => <option key={letter} value={letter} className="bg-slate-900">{letter} Şubesi</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                {role === 'teacher' ? 'Admin Kullanıcı Adı *' : (authMode === 'register' ? 'Benzersiz Kullanıcı Adı (Nickname) *' : 'Kullanıcı Adı veya E-posta *')}
              </label>
              <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={role === 'teacher' ? 'mahirsengun' : 'kullaniciadi'} autoComplete="username" className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" required />
            </div>

            {authMode === 'login' && role === 'student' && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail(identifier.includes('@') ? identifier : '');
                    setIsForgotPassword(true);
                    setError('');
                    setSuccess('');
                  }}
                  className="min-h-10 px-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
                >
                  Şifremi Unuttum?
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-indigo-400" />Şifre *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} className="w-full px-3.5 py-2.5 pr-10 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            {authMode === 'register' && role === 'student' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-indigo-400" />Şifre Tekrarı *</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" required />
              </div>
            )}

            <button type="submit" disabled={loading} className={`w-full mt-3 py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white shadow-lg active:scale-[0.99] transition disabled:opacity-50 cursor-pointer ${role === 'teacher' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-cyan-500 to-indigo-600'}`}>
              <span>{loading ? 'İşlem Yapılıyor...' : (role === 'teacher' ? 'Admin Paneline Giriş Yap' : (authMode === 'login' ? 'Portala Giriş Yap' : 'Kayıt Ol ve Giriş Yap'))}</span><ArrowRight className="w-4 h-4" />
            </button>
              </>
            )}
          </form>
        </div>
        <p className="text-center text-xs text-slate-500 mt-4">© 2026-2027 {teacherProfile.portalBrand} • {teacherProfile.officialName}</p>
      </div>
    </div>
  );
}