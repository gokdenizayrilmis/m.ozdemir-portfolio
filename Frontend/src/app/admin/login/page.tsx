'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import { Lock, Mail, Loader2, AlertCircle, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await authService.login(email, password);
    setLoading(false);

    if (res.isSuccess && res.data) {
      router.push('/admin');
    } else {
      setError(
        res.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-serif font-bold text-white">
            Klinik Yönetim Paneli (CMS)
          </h1>
          <p className="text-xs text-slate-400">
            Prof. Dr. Mustafa Özdemir Kliniği Yetkili Girişi
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-Posta Adresi
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mustafaozdemir@yahoo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              <span>Yönetici Olarak Giriş Yap</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-[11px] text-slate-500">
            Varsayılan Şifre: MustafaOzdemir2026!
          </span>
        </div>
      </div>
    </div>
  );
}

