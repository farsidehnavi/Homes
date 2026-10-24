import React, { useState } from 'react';
import {
  Building2,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { authenticate } from '../utils/userStorage';
import { AppUser } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('لطفاً نام کاربری را وارد نمایید.');
      return;
    }
    if (!password) {
      setError('لطفاً رمز عبور را وارد نمایید.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authenticate(username, password);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'نام کاربری یا رمز عبور اشتباه است.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-['Vazirmatn',sans-serif]">
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-700 text-emerald-400 flex items-center justify-center text-xs shadow-md border-2 border-slate-800">
              <KeyRound className="w-3 h-3" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            سامانه املاک شهرستان نجف‌آباد
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            ورود ایمن به پنل کاربری املاک، اکسل و دیوار
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">
              نام کاربری:
            </label>
            <div className="relative">
              <input
                id="login-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="نام کاربری خود را وارد کنید"
                autoFocus
                autoComplete="username"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-3 pr-10 pl-4 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-right"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">
              رمز عبور:
            </label>
            <div className="relative">
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور خود را وارد کنید"
                autoComplete="current-password"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-3 pr-10 pl-11 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                title={showPassword ? 'مخفی‌سازی رمز' : 'نمایش رمز'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>ورود به سامانه</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Assurance Notice */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-center gap-2 text-2xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>ایمن شده توسط حامد</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-2xs text-slate-500 max-w-sm leading-relaxed">
        سامانه املاک شهرستان نجف‌آباد • جهت دریافت حساب کاربری با مدیر سیستم تماس بگیرید.
      </div>
    </div>
  );
};
