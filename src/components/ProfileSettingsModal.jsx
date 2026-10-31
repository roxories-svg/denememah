import React, { useEffect, useState } from 'react';
import { X, User, Mail, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updateStudentProfile } from '../firebase';

export default function ProfileSettingsModal({ isOpen, onClose, user, onProfileUpdated }) {
  const [fullName, setFullName] = useState(user?.displayName || user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setFullName(user?.displayName || user?.fullName || '');
    setEmail(user?.email || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Yeni şifre ve tekrarı eşleşmiyor.');
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await updateStudentProfile(user, {
        fullName,
        email,
        currentPassword,
        password: newPassword
      });
      onProfileUpdated?.(updatedUser);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Profil bilgileriniz güncellendi.');
    } catch (submitError) {
      console.error('Profil güncellenemedi:', submitError);
      setError(submitError.message || 'Profil güncellenemedi. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/50 border border-cyan-500/25 rounded-2xl shadow-2xl shadow-cyan-950/40">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Öğrenci Portalı</p>
            <h2 className="text-lg font-bold text-white">Profil Düzenleme</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800" aria-label="Profili kapat">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div role="alert" className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          {success && <div role="status" className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</div>}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2"><User className="w-4 h-4 text-cyan-400" />Ad Soyad</label>
            <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full px-3.5 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" autoComplete="name" required />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2"><Mail className="w-4 h-4 text-cyan-400" />E-posta</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full px-3.5 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" autoComplete="email" required />
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <p className="text-xs font-semibold text-slate-300">Şifre değişikliği</p>
            <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Mevcut şifre (gerekirse)" className="w-full px-3.5 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" autoComplete="current-password" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Yeni şifre" className="w-full px-3.5 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" autoComplete="new-password" />
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Yeni şifre tekrar" className="w-full px-3.5 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" autoComplete="new-password" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full min-h-11 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/30 disabled:opacity-50">
            <Save className="w-4 h-4" />{loading ? 'Kaydediliyor...' : 'Profili Kaydet'}
          </button>
          <p className="text-[11px] leading-relaxed text-slate-500">E-posta veya şifre değişiminde Firebase Auth yeniden doğrulama isteyebilir.</p>
        </form>
      </div>
    </div>
  );
}