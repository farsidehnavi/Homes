import React from 'react';
import {
  Download,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  RefreshCw,
  Building2,
  FileSpreadsheet,
  Home,
  Upload,
  ArrowRight,
  BellRing,
  PlusCircle,
} from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';

interface NavbarProps {
  currentMode: 'excel' | 'divar';
  onSwitchMode: (mode: 'excel' | 'divar') => void;
  onGoHome: () => void;
  onResetData: () => void;
  activeView: 'table' | 'cards';
  onToggleView: (view: 'table' | 'cards') => void;
  usePersianDigits: boolean;
  onTogglePersianDigits: () => void;
  totalItems: number;
  filteredCount: number;
  isFilterOpenMobile: boolean;
  onToggleFilterMobile: () => void;
  onRefreshDivar?: () => void;
  isRefreshingDivar?: boolean;
  onExportExcel?: () => void;
  onUploadNewExcel?: () => void;
  onAddNewProperty?: () => void;
  onOpenAlertsModal?: () => void;
  activeAlertsCount?: number;
  matchedAlertsCount?: number;
  excelFileName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSwitchMode,
  onGoHome,
  onResetData,
  activeView,
  onToggleView,
  usePersianDigits,
  onTogglePersianDigits,
  totalItems,
  filteredCount,
  isFilterOpenMobile,
  onToggleFilterMobile,
  onRefreshDivar,
  isRefreshingDivar = false,
  onExportExcel,
  onUploadNewExcel,
  onAddNewProperty,
  onOpenAlertsModal,
  activeAlertsCount = 0,
  matchedAlertsCount = 0,
  excelFileName,
}) => {
  const fmt = (n: number) => (usePersianDigits ? toPersianDigits(n) : n);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          {/* Logo, Title & Back to Home */}
          <div className="flex items-center gap-2.5">
            <button
              id="navbar-back-to-home-btn"
              onClick={onGoHome}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
              title="بازگشت به صفحه انتخاب منبع"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">صفحه اصلی</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 ${
                  currentMode === 'excel'
                    ? 'bg-linear-to-br from-emerald-600 to-teal-700 shadow-emerald-600/20'
                    : 'bg-linear-to-br from-red-600 to-rose-700 shadow-red-600/20'
                }`}
              >
                {currentMode === 'excel' ? (
                  <FileSpreadsheet className="w-5 h-5" />
                ) : (
                  <Building2 className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                    {currentMode === 'excel' ? 'داشبورد من' : 'پنل دیوار'}
                  </h1>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-black ${
                      currentMode === 'excel'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {currentMode === 'excel' ? 'مدیریت اکسل' : 'divar.ir'}
                  </span>
                </div>
                <p className="text-2xs text-slate-400 hidden lg:block">
                  {currentMode === 'excel'
                    ? excelFileName
                      ? `فایل اکسل: ${excelFileName}`
                      : 'مدیریت، ویرایش و تحلیل هوشمند املاک'
                    : 'رصد زنده و فیلتر زمانی آگهی‌های دیوار نجف‌آباد'}
                </p>
              </div>
            </div>
          </div>

          {/* Center Mode Switcher Tabs (Side by Side Switcher) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="switch-to-excel-mode-btn"
              onClick={() => onSwitchMode('excel')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentMode === 'excel'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>داشبورد من</span>
            </button>

            <button
              id="switch-to-divar-mode-btn"
              onClick={() => onSwitchMode('divar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentMode === 'divar'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-red-600" />
              <span>پنل دیوار</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Divar Mode: Alerts (گوش‌به‌زنگ) Button */}
            {currentMode === 'divar' && onOpenAlertsModal && (
              <button
                type="button"
                onClick={onOpenAlertsModal}
                className="relative flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                title="تنظیم گوش‌به‌زنگ و هشدارهای هوشمند ملک"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span className="hidden sm:inline">گوش‌به‌زنگ</span>
                {matchedAlertsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {fmt(matchedAlertsCount)}
                  </span>
                )}
              </button>
            )}

            {/* Divar Mode: Refresh Button */}
            {currentMode === 'divar' && onRefreshDivar && (
              <button
                id="refresh-divar-navbar-btn"
                onClick={onRefreshDivar}
                disabled={isRefreshingDivar}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
                title="دریافت آخرین آگهی‌های دیوار"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDivar ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isRefreshingDivar ? 'در حال دریافت...' : 'بروزرسانی'}
                </span>
              </button>
            )}

            {/* Excel Mode: Add New Property Button */}
            {currentMode === 'excel' && onAddNewProperty && (
              <button
                type="button"
                onClick={onAddNewProperty}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
                title="افزودن ملک جدید به اکسل"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">افزودن ملک</span>
              </button>
            )}

            {/* Excel Mode: Upload New Excel Button */}
            {currentMode === 'excel' && onUploadNewExcel && (
              <button
                id="upload-new-excel-navbar-btn"
                onClick={onUploadNewExcel}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                title="بارگذاری یا جایگزینی فایل اکسل"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">آپلود اکسل</span>
              </button>
            )}

            {/* Export to Excel */}
            {onExportExcel && (
              <button
                id="export-excel-navbar-btn"
                onClick={onExportExcel}
                className="hidden md:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                title="دانلود خروجی اکسل بروز شده"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>خروجی اکسل</span>
              </button>
            )}

            {/* Mobile Filter Toggle */}
            <button
              id="mobile-filter-toggle-btn"
              onClick={onToggleFilterMobile}
              className={`lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                isFilterOpenMobile
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">فیلترها</span>
              <span className="inline-flex items-center justify-center w-4 h-4 text-2xs rounded-full bg-slate-100 text-slate-800 font-bold">
                {fmt(filteredCount)}
              </span>
            </button>

            {/* View Switcher: Table vs Cards */}
            <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center">
              <button
                id="view-table-btn"
                onClick={() => onToggleView('table')}
                title="نمای جدولی"
                className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  activeView === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">جدول</span>
              </button>
              <button
                id="view-cards-btn"
                onClick={() => onToggleView('cards')}
                title="نمای کارتی"
                className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  activeView === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">کارت</span>
              </button>
            </div>

            {/* Persian/English Digits Toggle */}
            <button
              id="toggle-digits-btn"
              onClick={onTogglePersianDigits}
              title="تغییر نمایش اعداد (فارسی / انگلیسی)"
              className="px-2 py-1 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors hidden sm:inline-block cursor-pointer"
            >
              {usePersianDigits ? '۱۲۳' : '123'}
            </button>

            {/* Reset Data Button */}
            <button
              id="reset-data-btn"
              onClick={onResetData}
              title="بازنشانی فیلترها"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Switcher Row on Small Screens */}
        <div className="sm:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onSwitchMode('excel')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold ${
              currentMode === 'excel'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-slate-600'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>داشبورد من</span>
          </button>
          <button
            onClick={() => onSwitchMode('divar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold ${
              currentMode === 'divar'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'text-slate-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>پنل دیوار</span>
          </button>
        </div>
      </div>
    </header>
  );
};
