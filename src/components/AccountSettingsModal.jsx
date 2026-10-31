import React, { useEffect, useState } from 'react';
import { X, User, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getTeacherAccount, updateTeacherAccount } from '../firebase';

export default function AccountSettingsModal({ isOpen, onClose }) {
  const [nickname, setNickname] = useState('mahirsengun');
  const [password, setPassword] = useState('mahirsengun2440');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess('');
    getTeacherAccount().then((account) => {
      if (account) {
        setNickname(account.nickname || 'mahirsengun');
        setPassword(account.password || 'mahirsengun2440');
      }
    }).catch((err) => setError(err.message));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      await updateTeacherAccount(nickname, password);
      setSuccess('Öğretmen hesap bilgileri başarıyla güncellendi!');
    } catch (err) {
      setError(err.message || 'Hesap bilgileri kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Admin Paneli</p>
            <h2 className="text-lg font-bold text-white">Öğretmen Hesap Ayarları</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          {success && <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</div>}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2"><User className="w-4 h-4 text-purple-400" />Kullanıcı Adı (Nickname)</label>
            <input 
              type="text"
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              className="w-full px-3.5 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2"><Lock className="w-4 h-4 text-indigo-400" />Şifre</label>
            <input 
              type="text" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-3.5 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono" 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
            <Save className="w-4 h-4" />{loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
}