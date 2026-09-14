import React from 'react';
import {
  Download,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';

interface NavbarProps {
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
}

export const Navbar: React.FC<NavbarProps> = ({
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
}) => {
  const fmt = (n: number) => (usePersianDigits ? toPersianDigits(n) : n);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-sm shadow-red-600/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  املاک نجف‌آباد (دیوار ۲۴ ساعت اخیر)
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-black bg-red-50 text-red-700 border border-red-200">
                  divar.ir
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                رصد خودکار، فیلتر پیشرفته و تحلیل قیمت خانه‌های ۲۴ ساعت گذشته نجف‌آباد
              </p>
            </div>
          </div>

          {/* Right/Left Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Live Refresh Button */}
            {onRefreshDivar && (
              <button
                id="refresh-divar-navbar-btn"
                onClick={onRefreshDivar}
                disabled={isRefreshingDivar}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
                title="دریافت آخرین آگهی‌های ۲۴ ساعت گذشته از دیوار"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDivar ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isRefreshingDivar ? 'در حال بروزرسانی...' : 'بروزرسانی دیوار'}
                </span>
              </button>
            )}

            {/* Export to Excel */}
            {onExportExcel && (
              <button
                id="export-excel-navbar-btn"
                onClick={onExportExcel}
                className="hidden md:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                title="دانلود خروجی اکسل"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>خروجی اکسل</span>
              </button>
            )}

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

            {/* Reset Data Button */}
            <button
              id="reset-data-btn"
              onClick={onResetData}
              title="بازنشانی فیلترها و اطلاعات"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
