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
} from 'lucide-react';

interface ModeSelectionScreenProps {
  onSelectMode: (mode: 'excel' | 'divar') => void;
}

export const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      {/* Background Subtle Accents */}
      <div className="w-full max-w-4xl mx-auto text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-300/60">
          <MapPin className="w-3.5 h-3.5 text-red-600" />
          <span>شهرستان نجف‌آباد • سامانه املاک</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          سامانه هوشمند تحلیل و بررسی املاک
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          برای آغاز کار، لطفاً منبع دریافت داده‌های املاک را انتخاب نمایید:
        </p>
      </div>

      {/* Two Prominent Buttons / Cards Side by Side */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Option 1: Excel Version */}
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
                فایل محلی / اکسل
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
              ورود و تحلیل فایل اکسل
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              بارگذاری و پردازش فایل‌های اکسل (<code className="text-emerald-700 font-mono">.xlsx</code> و <code className="text-emerald-700 font-mono">.xls</code>) املاک، دسته‌بندی ستون‌ها، فیلترهای پیشرفته قیمت و متراژ، و محاسبه هوشمند میانگین‌ها.
            </p>

            {/* Feature checklist */}
            <div className="space-y-2 mb-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>پشتیبانی از فایل‌های اکسل شخصی یا سازمانی</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>دسترسی به دیتاست آماده ۱۰۰ ملک نجف‌آباد</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>استخراج خروجی اکسل فیلترشده با فرمت استاندارد</span>
              </div>
            </div>
          </div>

          <button
            id="select-excel-mode-btn"
            type="button"
            className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-sm py-3.5 px-5 rounded-2xl shadow-xs group-hover:shadow-md transition-all"
          >
            <span>ورود به نسخه اکسل</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Option 2: Divar.ir Version */}
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
                آنلاین • ۲۴ ساعت اخیر
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-700 transition-colors">
              آگهی‌های ۲۴ ساعت گذشته دیوار
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              دریافت مستقیم و زنده آگهی‌های املاک مسکونی نجف‌آباد از سایت دیوار (<code className="text-red-700 font-mono">divar.ir</code>) در ۲۴ ساعت گذشته با تصاویر، جزئیات متراژ، قیمت و محله.
            </p>

            {/* Feature checklist */}
            <div className="space-y-2 mb-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                <span>رصد لحظه‌ای و دریافت خودکار از API دیوار</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                <span>مشاهده تصاویر باکیفیت و برچسب زمان آگهی</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                <span>فیلتر بر اساس محله‌های نجف‌آباد (فردوسی، ویلاشهر و...)</span>
              </div>
            </div>
          </div>

          <button
            id="select-divar-mode-btn"
            type="button"
            className="w-full mt-4 flex items-center justify-center gap-2 bg-red-600 group-hover:bg-red-700 text-white font-bold text-sm py-3.5 px-5 rounded-2xl shadow-xs group-hover:shadow-md transition-all"
          >
            <span>ورود به نسخه دیوار (divar.ir)</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="mt-8 text-center text-xs text-slate-400">
        نکته: در هر زمان می‌توانید با استفاده از منوی بالای صفحه بین نسخه اکسل و نسخه دیوار جابجا شوید.
      </div>
    </div>
  );
};
