import React from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  Database,
  Calendar,
  Layers,
  PlusCircle,
  Edit3,
} from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';

interface ExcelBannerProps {
  fileName: string;
  totalItems: number;
  filteredItemsCount: number;
  onUploadClick: () => void;
  onLoadSampleClick: () => void;
  onExportExcel: () => void;
  onAddNewProperty: () => void;
  usePersianDigits: boolean;
  hasUnsavedChanges?: boolean;
}

export const ExcelBanner: React.FC<ExcelBannerProps> = ({
  fileName,
  totalItems,
  filteredItemsCount,
  onUploadClick,
  onLoadSampleClick,
  onExportExcel,
  onAddNewProperty,
  usePersianDigits,
  hasUnsavedChanges = false,
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
                داشبورد من
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                فایل فعال: {fileName}
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full font-medium">
                {fmt(totalItems)} ملک ثبت شده
              </span>

              {hasUnsavedChanges && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                  تغییرات جدید آماده دانلود در خروجی اکسل
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>مدیریت، ویرایش و تحلیل هوشمند فایل‌های اکسل املاک</span>
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              در <strong>داشبورد من</strong> می‌توانید به راحتی ملک جدید اضافه کنید، مشخصات املاک موجود را ویرایش یا حذف نمایید و با زدن دکمه <strong>«خروجی اکسل»</strong> فایل جدید را با تمام تغییرات دانلود کنید.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-start lg:self-center shrink-0">
            {/* Add Property Button */}
            <button
              id="excel-banner-add-btn"
              onClick={onAddNewProperty}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ افزودن ملک جدید</span>
            </button>

            <button
              id="excel-banner-upload-btn"
              onClick={onUploadClick}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
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
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
              title="دانلود لیست بروز شده در قالب اکسل"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>خروجی اکسل ({fmt(filteredItemsCount)})</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>امکانات فعال: افزودن، ویرایش، حذف، تفکیک رهن و اجاره و دانلود اکسل بروز شده</span>
          </div>

          <div className="text-slate-400 text-2xs">
            پشتیبانی از فرمت‌های xlsx. و xls.
          </div>
        </div>
      </div>
    </div>
  );
};
