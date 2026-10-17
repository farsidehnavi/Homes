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
  Upload,
  BellRing,
  PlusCircle,
  Search,
  X,
  Menu,
  ShieldCheck,
  LogOut,
  Layers,
} from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';

interface NavbarProps {
  currentMode: 'excel' | 'divar';
  onSwitchMode: (mode: 'excel' | 'divar') => void;
  onGoHome?: () => void;
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
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  // Account & Dashboard properties
  onOpenHamburgerMenu?: () => void;
  activeDashboardTitle?: string;
  currentUserName?: string;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSwitchMode,
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
  searchQuery = '',
  onSearchChange,
  onOpenHamburgerMenu,
  activeDashboardTitle,
  currentUserName,
  isAdmin = false,
  onOpenAdminPanel,
  onLogout,
}) => {
  const fmt = (n: number) => (usePersianDigits ? toPersianDigits(n) : n);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ROW 1: Hamburger Menu, Branding, Mode Selector & Top Actions */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Hamburger Menu & Brand Title */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Hamburger Button */}
            {onOpenHamburgerMenu && (
              <button
                id="navbar-hamburger-btn"
                type="button"
                onClick={onOpenHamburgerMenu}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                title="منوی دسترسی (انتخاب داشبوردها، پنل دیوار و تنظیمات)"
              >
                <Menu className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">منو و داشبوردها</span>
              </button>
            )}

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 ${
                  currentMode === 'excel'
                    ? 'bg-linear-to-br from-emerald-600 to-teal-700 shadow-emerald-600/20'
                    : 'bg-linear-to-br from-red-600 to-rose-700 shadow-red-600/20'
                }`}
              >
                {currentMode === 'excel' ? (
                  <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight truncate max-w-[140px] sm:max-w-none">
                    {currentMode === 'excel'
                      ? activeDashboardTitle || 'داشبورد من'
                      : 'پنل دیوار'}
                  </h1>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-2xs font-bold ${
                      currentMode === 'excel'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {currentMode === 'excel' ? 'اکسل' : 'دیوار'}
                  </span>
                </div>
                <p className="text-2xs text-slate-400 hidden lg:block">
                  {currentMode === 'excel'
                    ? excelFileName
                      ? `فایل اکسل: ${excelFileName}`
                      : 'مدیریت و تحلیل هوشمند املاک'
                    : 'رصد زنده و فیلتر زمانی آگهی‌های دیوار نجف‌آباد'}
                </p>
              </div>
            </div>
          </div>

          {/* Center Mode Switcher Tabs (Desktop) */}
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

          {/* Desktop Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            {/* If Admin: Direct link to Admin Panel */}
            {isAdmin && onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                title="ورود به پنل مدیریت کل سیستم"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>پنل ادمین</span>
              </button>
            )}

            {/* Divar Mode: Alerts (گوش‌به‌زنگ) Button */}
            {currentMode === 'divar' && onOpenAlertsModal && (
              <button
                type="button"
                onClick={onOpenAlertsModal}
                className="relative flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                title="تنظیم گوش‌به‌زنگ و هشدارهای هوشمند ملک"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>گوش‌به‌زنگ</span>
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
                <span>{isRefreshingDivar ? 'در حال دریافت...' : 'بروزرسانی'}</span>
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
                <span>افزودن ملک</span>
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

            {/* View Switcher: Table vs Cards */}
            <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center">
              <button
                id="view-table-btn"
                onClick={() => onToggleView('table')}
                title="نمای جدولی"
                className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  activeView === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>جدول</span>
              </button>
              <button
                id="view-cards-btn"
                onClick={() => onToggleView('cards')}
                title="نمای کارتی"
                className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  activeView === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>کارت</span>
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

            {/* Logout Button */}
            {onLogout && (
              <button
                id="navbar-logout-btn"
                onClick={onLogout}
                title="خروج از حساب"
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Right Actions in Row 1 */}
          <div className="sm:hidden flex items-center gap-1.5 shrink-0">
            {isAdmin && onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="p-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-2xs font-bold"
                title="پنل مدیریت"
              >
                ادمین
              </button>
            )}

            {currentMode === 'divar' ? (
              <>
                {onOpenAlertsModal && (
                  <button
                    type="button"
                    onClick={onOpenAlertsModal}
                    className="relative p-2 bg-amber-50 text-amber-800 border border-amber-300 rounded-xl cursor-pointer"
                    title="گوش‌به‌زنگ"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-600" />
                    {matchedAlertsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">
                        {fmt(matchedAlertsCount)}
                      </span>
                    )}
                  </button>
                )}
                {onRefreshDivar && (
                  <button
                    onClick={onRefreshDivar}
                    disabled={isRefreshingDivar}
                    className="p-2 bg-red-600 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                    title="بروزرسانی دیوار"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDivar ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </>
            ) : (
              <>
                {onUploadNewExcel && (
                  <button
                    type="button"
                    onClick={onUploadNewExcel}
                    className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 rounded-xl cursor-pointer"
                    title="آپلود فایل اکسل"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* MOBILE SECTION: TWO DEDICATED ROWS (Strictly NO horizontal scrolling!) */}
        <div className="sm:hidden border-t border-slate-100">
          {/* ROW 1: Full-width Search Input */}
          <div className="pt-2 pb-1.5">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="جستجوی محله، خیابان، نوع ملک..."
                className="w-full text-xs bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl pr-8 pl-8 py-2.5 focus:outline-hidden transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="پاک کردن جستجو"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ROW 2: Mobile Action Buttons (Filters, View Switcher, Export/Refresh, Reset) */}
          <div className="pb-2.5 flex items-center gap-1.5 w-full">
            {/* Filter Drawer Toggle Button */}
            <button
              id="mobile-filter-toggle-btn"
              onClick={onToggleFilterMobile}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isFilterOpenMobile
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="فیلترهای پیشرفته"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>فیلترها</span>
              <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] rounded-full bg-slate-100 text-slate-800 font-black">
                {fmt(filteredCount)}
              </span>
            </button>

            {/* View Switcher: Table vs Cards */}
            <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center shrink-0">
              <button
                onClick={() => onToggleView('cards')}
                title="نمای کارتی"
                className={`p-1.5 px-2 rounded-lg text-2xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeView === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px]">کارت</span>
              </button>
              <button
                onClick={() => onToggleView('table')}
                title="نمای جدولی"
                className={`p-1.5 px-2 rounded-lg text-2xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeView === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="text-[11px]">جدول</span>
              </button>
            </div>

            {/* Mode-specific Quick Action */}
            {currentMode === 'excel' && onExportExcel && (
              <button
                onClick={onExportExcel}
                className="flex items-center gap-1 py-2 px-2.5 rounded-xl text-2xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
                title="دانلود خروجی اکسل"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px]">خروجی</span>
              </button>
            )}

            {currentMode === 'divar' && onRefreshDivar && (
              <button
                onClick={onRefreshDivar}
                disabled={isRefreshingDivar}
                className="flex items-center gap-1 py-2 px-2.5 rounded-xl text-2xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                title="بروزرسانی دیوار"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDivar ? 'animate-spin' : ''}`} />
                <span className="text-[11px]">بروزرسانی</span>
              </button>
            )}

            {/* Reset Filters Button */}
            <button
              id="mobile-reset-data-btn"
              onClick={onResetData}
              title="بازنشانی فیلترها"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 bg-white rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
