import React from 'react';
import {
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  Building2,
  FileSpreadsheet,
  Search,
  X,
  Menu,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';

interface NavbarProps {
  currentMode: 'excel' | 'divar';
  onSwitchMode: (mode: 'excel' | 'divar') => void;
  onGoHome?: () => void;
  onResetData?: () => void;
  activeView: 'table' | 'cards' | 'map';
  onToggleView: (view: 'table' | 'cards' | 'map') => void;
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
  activeView,
  onToggleView,
  usePersianDigits,
  onTogglePersianDigits,
  totalItems,
  filteredCount,
  isFilterOpenMobile,
  onToggleFilterMobile,
  onOpenHamburgerMenu,
  activeDashboardTitle,
  excelFileName,
  searchQuery = '',
  onSearchChange,
  isAdmin = false,
  onOpenAdminPanel,
}) => {
  const fmt = (n: number) => (usePersianDigits ? toPersianDigits(n) : n);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs font-['Vazirmatn',sans-serif]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ROW 1: Hamburger Menu, Branding & View Switcher */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Hamburger Menu & Brand Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger Button: Primary access to Dashboards, Excel Import/Export & Modes */}
            {onOpenHamburgerMenu && (
              <button
                id="navbar-hamburger-btn"
                type="button"
                onClick={onOpenHamburgerMenu}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                title="منوی امکانات (انتخاب داشبوردها، آپلود و دانلود خروجی اکسل)"
              >
                <Menu className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">منوی امکانات</span>
              </button>
            )}

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Brand Title */}
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
                  <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight truncate max-w-[150px] sm:max-w-none">
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
                <p className="text-2xs text-slate-400 hidden md:block">
                  {currentMode === 'excel'
                    ? excelFileName
                      ? `فایل: ${excelFileName}`
                      : 'مدیریت و تحلیل هوشمند املاک نجف‌آباد'
                    : 'رصد زنده آگهی‌های دیوار نجف‌آباد'}
                </p>
              </div>
            </div>
          </div>

          {/* Center Mode Switcher Tabs (Desktop Only) */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
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

          {/* Right Action: Clean View Switcher (Cards / Table / Map) + Digits */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* If Admin: Direct link to Admin Panel */}
            {isAdmin && onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                title="ورود به پنل مدیریت کل سیستم"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>ادمین</span>
              </button>
            )}

            {/* View Switcher: Table vs Cards vs Map */}
            <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center">
              <button
                id="view-cards-btn"
                onClick={() => onToggleView('cards')}
                title="نمای کارتی"
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-2xs sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeView === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>کارت</span>
              </button>

              <button
                id="view-table-btn"
                onClick={() => onToggleView('table')}
                title="نمای جدولی"
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-2xs sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeView === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>جدول</span>
              </button>

              <button
                id="view-map-btn"
                onClick={() => onToggleView('map')}
                title="نمای نقشه نجف‌آباد"
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-2xs sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeView === 'map'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>نقشه</span>
              </button>
            </div>

            {/* Persian/English Digits Toggle (Desktop) */}
            <button
              id="toggle-digits-btn"
              onClick={onTogglePersianDigits}
              title="تغییر نمایش اعداد (فارسی / انگلیسی)"
              className="px-2 py-1 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors hidden sm:inline-block cursor-pointer"
            >
              {usePersianDigits ? '۱۲۳' : '123'}
            </button>
          </div>
        </div>

        {/* MOBILE SECTION: Clean and Tidy Search + Filters in ONE line */}
        <div className="sm:hidden pb-2.5 pt-1 border-t border-slate-100 flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="جستجو در محله، آدرس، نوع ملک..."
              className="w-full text-xs bg-slate-100/90 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl pr-8 pl-7 py-2 focus:outline-hidden transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="پاک کردن جستجو"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Drawer Toggle Button */}
          <button
            id="mobile-filter-toggle-btn"
            onClick={onToggleFilterMobile}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
              isFilterOpenMobile
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="فیلترهای پیشرفته املاک"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فیلتر</span>
            {filteredCount < totalItems && (
              <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-black">
                {fmt(filteredCount)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
