import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
} from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';

interface NavbarProps {
  onFileUpload: (file: File) => void;
  onDownloadSample: () => void;
  onResetData: () => void;
  activeView: 'table' | 'cards';
  onToggleView: (view: 'table' | 'cards') => void;
  usePersianDigits: boolean;
  onTogglePersianDigits: () => void;
  totalItems: number;
  filteredCount: number;
  isFilterOpenMobile: boolean;
  onToggleFilterMobile: () => void;
  fileName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onFileUpload,
  onDownloadSample,
  onResetData,
  activeView,
  onToggleView,
  usePersianDigits,
  onTogglePersianDigits,
  totalItems,
  filteredCount,
  isFilterOpenMobile,
  onToggleFilterMobile,
  fileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fmt = (n: number) => (usePersianDigits ? toPersianDigits(n) : n);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  سامانه تحلیل و جستجوی فایل اکسل املاک
                </h1>
                {fileName && (
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {fileName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                مشاهده، فیلتر پیشرفته و جستجوی هوشمند مشخصات و قیمت املاک
              </p>
            </div>
          </div>

          {/* Right/Left Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Filter Toggle */}
            <button
              id="mobile-filter-toggle-btn"
              onClick={onToggleFilterMobile}
              className={`lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                isFilterOpenMobile
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden xs:inline">فیلترها</span>
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-slate-100 text-slate-800 font-bold">
                {fmt(filteredCount)}
              </span>
            </button>

            {/* View Switcher: Table vs Cards */}
            <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center">
              <button
                id="view-table-btn"
                onClick={() => onToggleView('table')}
                title="نمای جدولی"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                  activeView === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">جدول</span>
              </button>
              <button
                id="view-cards-btn"
                onClick={() => onToggleView('cards')}
                title="نمای کارتی"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                  activeView === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">کارت</span>
              </button>
            </div>

            {/* Persian/English Digits Toggle */}
            <button
              id="toggle-digits-btn"
              onClick={onTogglePersianDigits}
              title="تغییر نمایش اعداد (فارسی / انگلیسی)"
              className="px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors hidden sm:inline-block"
            >
              {usePersianDigits ? 'اعداد: ۱۲۳' : 'اعداد: 123'}
            </button>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            {/* Upload Excel Button */}
            <button
              id="upload-excel-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>آپلود فایل اکسل</span>
            </button>

            {/* Sample Download button */}
            <button
              id="download-sample-btn"
              onClick={onDownloadSample}
              title="دانلود فایل اکسل نمونه (۱۰۰ ردیف نجف‌آباد)"
              className="hidden md:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود اکسل نمونه</span>
            </button>

            {/* Reset Data Button */}
            <button
              id="reset-data-btn"
              onClick={onResetData}
              title="بازنشانی به ۱۰۰ ردیف اولیه پی‌دی‌اف"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
