import React from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  Database,
  Calendar,
  Layers,
} from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';

interface ExcelBannerProps {
  fileName: string;
  totalItems: number;
  filteredItemsCount: number;
  onUploadClick: () => void;
  onLoadSampleClick: () => void;
  onExportExcel: () => void;
  usePersianDigits: boolean;
}

export const ExcelBanner: React.FC<ExcelBannerProps> = ({
  fileName,
  totalItems,
  filteredItemsCount,
  onUploadClick,
  onLoadSampleClick,
  onExportExcel,
  usePersianDigits,
}) => {
  const fmt = (n: number) => (usePersianDigits ? toPersianDigits(n) : n);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs mb-6 overflow-hidden transition-all">
      {/* Top Emerald Gradient Accent */}
      <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 h-1.5 w-full" />

      <div className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Info block */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                نسخه تحلیل فایل اکسل
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                فایل فعال: {fileName}
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full font-medium">
                {fmt(totalItems)} ردیف استخراج شده
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>املاک نجف‌آباد (بارگذاری شده از فایل اکسل)</span>
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              اطلاعات این بخش از فایل اکسل شما استخراج شده است. می‌توانید ردیف‌ها را بر اساس متراژ، قیمت، نوع ملک، امکانات و مشخصات فیلتر و جستجو نمایید یا فایل اکسل جدیدی بارگذاری کنید.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-start lg:self-center shrink-0">
            <button
              id="excel-banner-upload-btn"
              onClick={onUploadClick}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>آپلود فایل جدید</span>
            </button>

            <button
              id="excel-banner-sample-btn"
              onClick={onLoadSampleClick}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
              title="بارگذاری مجدد ۱۰۰ رکورد نمونه نجف‌آباد"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>دیتاست نمونه</span>
            </button>

            <button
              id="excel-banner-export-btn"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
              title="دانلود لیست فیلترشده در قالب اکسل"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>خروجی اکسل ({fmt(filteredItemsCount)})</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تعداد ردیف‌های فایل:</span>
              <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-bold text-xs">
                {fmt(totalItems)} ملک
              </strong>
            </div>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <div className="flex items-center gap-1 text-slate-500">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>موارد فیلتر شده:</span>
              <span className="font-semibold text-slate-700">{fmt(filteredItemsCount)} ملک</span>
            </div>
          </div>

          <div className="text-slate-400 text-2xs">
            سازگار با فرمت‌های .xlsx و .xls و .csv
          </div>
        </div>
      </div>
    </div>
  );
};
