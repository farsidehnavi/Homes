import React from 'react';
import {
  FileSpreadsheet,
  Building2,
  ArrowLeft,
  Sparkles,
  Zap,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  BellRing,
  Images,
  Edit3,
} from 'lucide-react';

interface ModeSelectionScreenProps {
  onSelectMode: (mode: 'excel' | 'divar') => void;
}

export const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      {/* Header Accent */}
      <div className="w-full max-w-4xl mx-auto text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-300/60">
          <MapPin className="w-3.5 h-3.5 text-red-600" />
          <span>شهرستان نجف‌آباد • سامانه هوشمند املاک</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          سامانه جامع تحلیل و رصد املاک نجف‌آباد
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          لطفاً برای ورود، یکی از دو بخش زیر را انتخاب نمایید:
        </p>
      </div>

      {/* Two Prominent Cards Side by Side */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Option 1: داشبورد من (Excel Version) */}
        <div
          onClick={() => onSelectMode('excel')}
          className="group relative bg-white rounded-3xl border-2 border-slate-200/80 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between cursor-pointer text-right overflow-hidden hover:-translate-y-1"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                مدیریت و اکسل
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
              داشبورد من
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              بخش شخصی شما برای بارگذاری، مدیریت و تحلیل فایل‌های اکسل املاک با قابلیت افزودن، ویرایش و حذف کامل ردیف‌ها و دانلود مجدد اکسل بروز شده.
            </p>

            {/* Feature checklist */}
            <div className="space-y-2.5 mb-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>پشتیبانی کامل از خرید و فروش و رهن و اجاره</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>امکان افزودن، ویرایش و حذف موارد در فایل اکسل</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>استخراج خروجی اکسل بروز شده با تمام تغییرات</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>دیتاست نمونه ۱۰۰ ملک مسکونی نجف‌آباد</span>
              </div>
            </div>
          </div>

          <button
            id="select-excel-mode-btn"
            type="button"
            className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-sm py-3.5 px-5 rounded-2xl shadow-xs group-hover:shadow-md transition-all"
          >
            <span>ورود به داشبورد من</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Option 2: پنل دیوار (Divar Version) */}
        <div
          onClick={() => onSelectMode('divar')}
          className="group relative bg-white rounded-3xl border-2 border-slate-200/80 hover:border-red-500 hover:shadow-xl transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between cursor-pointer text-right overflow-hidden hover:-translate-y-1"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="text-2xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                رصد زنده • ۱ ساعت تا ۱ ماه
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-red-700 transition-colors">
              پنل دیوار
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              رصد هوشمند، فیلتر زمانی و دریافت مستقیم آگهی‌های املاک نجف‌آباد از سایت دیوار همراه با مشاهده تمام تصاویر و سیستم گوش‌به‌زنگ اعلان ملک دلخواه.
            </p>

            {/* Feature checklist */}
            <div className="space-y-2.5 mb-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600 shrink-0" />
                <span>فیلتر زمانی گسترده: از ۱ ساعت تا ۱ ماه گذشته</span>
              </div>
              <div className="flex items-center gap-2">
                <Images className="w-4 h-4 text-red-600 shrink-0" />
                <span>مشاهده کلیه تصاویر و گالری کامل هر ملک</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                <span>پشتیبانی کامل از خرید و فروش و رهن و اجاره</span>
              </div>
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-red-600 shrink-0" />
                <span>گوش‌به‌زنگ و اعلان خودکار برای ملک با مشخصات دلخواه</span>
              </div>
            </div>
          </div>

          <button
            id="select-divar-mode-btn"
            type="button"
            className="w-full mt-4 flex items-center justify-center gap-2 bg-red-600 group-hover:bg-red-700 text-white font-bold text-sm py-3.5 px-5 rounded-2xl shadow-xs group-hover:shadow-md transition-all"
          >
            <span>ورود به پنل دیوار</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="mt-8 text-center text-xs text-slate-400">
        نکته: در هر زمان می‌توانید با استفاده از منوی بالای صفحه بین <strong>«داشبورد من»</strong> و <strong>«پنل دیوار»</strong> جابجا شوید.
      </div>
    </div>
  );
};
