import React from 'react';
import {
  SlidersHorizontal,
  Building2,
  FileSpreadsheet,
  Search,
  X,
  Menu,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  currentMode: 'excel' | 'divar';
  totalItems: number;
  filteredCount: number;
  isFilterOpenMobile: boolean;
  onToggleFilterMobile: () => void;
  excelFileName?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenHamburgerMenu?: () => void;
  activeDashboardTitle?: string;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
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
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs font-['Vazirmatn',sans-serif] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ROW 1: Hamburger Menu, Branding & Desktop Search */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Hamburger Menu & Brand Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger Button: Icon only, no label */}
            {onOpenHamburgerMenu && (
              <button
                id="navbar-hamburger-btn"
                type="button"
                onClick={onOpenHamburgerMenu}
                className="flex items-center justify-center bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-white p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 border border-transparent dark:border-slate-700"
                title="منو"
              >
                <Menu className="w-5 h-5 text-emerald-400" />
              </button>
            )}

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

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
                  <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight truncate max-w-[150px] sm:max-w-none">
                    {currentMode === 'excel'
                      ? activeDashboardTitle || 'داشبورد من'
                      : 'پنل دیوار'}
                  </h1>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-2xs font-bold ${
                      currentMode === 'excel'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70'
                        : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/70'
                    }`}
                  >
                    {currentMode === 'excel' ? 'اکسل' : 'دیوار'}
                  </span>
                </div>
                <p className="text-2xs text-slate-400 dark:text-slate-400 hidden md:block">
                  {currentMode === 'excel'
                    ? excelFileName
                      ? `فایل: ${excelFileName}`
                      : 'مدیریت و تحلیل هوشمند املاک نجف‌آباد'
                    : 'رصد زنده آگهی‌های دیوار نجف‌آباد'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Action: Desktop Search & Admin */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Search Bar */}
            <div className="hidden sm:block relative w-64 md:w-80 lg:w-96">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="جستجو در محله، آدرس، نوع ملک..."
                className="w-full text-xs bg-slate-100/90 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-xl pr-8 pl-7 py-2 focus:outline-hidden transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-2xs text-right"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="پاک کردن جستجو"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* If Admin: Direct link to Admin Panel */}
            {isAdmin && onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                title="ورود به پنل مدیریت کل سیستم"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">ادمین</span>
              </button>
            )}
          </div>
        </div>

        {/* MOBILE SECTION: Clean Search + Filters */}
        <div className="sm:hidden pb-2.5 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="جستجو در محله، آدرس، نوع ملک..."
              className="w-full text-xs bg-slate-100/90 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-xl pr-8 pl-7 py-2 focus:outline-hidden transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-2xs text-right"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="فیلترهای پیشرفته املاک"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فیلتر</span>
            {filteredCount < totalItems && (
              <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 font-black">
                {filteredCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
