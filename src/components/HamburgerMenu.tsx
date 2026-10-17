import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Building2,
  Plus,
  Trash2,
  Edit2,
  Check,
  ShieldCheck,
  LogOut,
  Layers,
  ChevronRight,
  Database,
  User,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { AppUser, UserDashboard } from '../types';
import { toPersianDigits } from '../utils/formatters';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  currentMode: 'excel' | 'divar';
  onSelectMode: (mode: 'excel' | 'divar') => void;
  dashboards: UserDashboard[];
  activeDashboardId: string;
  onSelectDashboard: (dashboardId: string) => void;
  onCreateDashboard: (title?: string) => void;
  onRenameDashboard: (dashboardId: string, newTitle: string) => void;
  onDeleteDashboard: (dashboardId: string) => void;
  onOpenAdminPanel?: () => void;
  onLogout: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentMode,
  onSelectMode,
  dashboards,
  activeDashboardId,
  onSelectDashboard,
  onCreateDashboard,
  onRenameDashboard,
  onDeleteDashboard,
  onOpenAdminPanel,
  onLogout,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [dashboardToDelete, setDashboardToDelete] = useState<UserDashboard | null>(null);

  if (!isOpen) return null;

  const maxDashboards = currentUser.maxDashboards || 5;
  const canCreateMore = dashboards.length < maxDashboards;

  const handleStartRename = (dash: UserDashboard) => {
    setEditingId(dash.id);
    setEditTitle(dash.title);
  };

  const handleSaveRename = (dashboardId: string) => {
    if (editTitle.trim()) {
      onRenameDashboard(dashboardId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCreateNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canCreateMore) {
      onCreateDashboard(newTitle.trim() || undefined);
      setNewTitle('');
      setIsCreatingNew(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex font-['Vazirmatn',sans-serif]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container (Sliding in from Right in RTL) */}
      <div className="relative mr-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">
                منوی مدیریت و دسترسی
              </div>
              <div className="text-2xs text-slate-500">
                املاک نجف‌آباد • پنل یکپارچه
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            title="بستن منو"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* User Profile Card */}
          <div className="p-4 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-black text-lg">
                {currentUser.displayName.charAt(0) || currentUser.username.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">
                  {currentUser.displayName}
                </div>
                <div className="text-2xs text-slate-400 font-mono truncate">
                  @{currentUser.username}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {currentUser.role === 'admin' ? 'مدیر کل سیستم' : 'کاربر املاک'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Main Panel Mode (Excel vs Divar) */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 px-1">
              <span>محیط کاری فعال:</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Option 1: Excel Mode (Straightforward default) */}
              <button
                type="button"
                onClick={() => {
                  onSelectMode('excel');
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                  currentMode === 'excel'
                    ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      currentMode === 'excel'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">داشبورد من (اکسل)</div>
                    <div className="text-2xs text-slate-500">
                      مدیریت، ویرایش و خروجی فایل‌های اکسل
                    </div>
                  </div>
                </div>
                {currentMode === 'excel' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                )}
              </button>

              {/* Option 2: Divar Mode (In hamburger menu as requested) */}
              <button
                type="button"
                onClick={() => {
                  onSelectMode('divar');
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                  currentMode === 'divar'
                    ? 'bg-red-50/90 border-red-500 text-red-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      currentMode === 'divar'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>پنل دیوار (divar.ir)</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    </div>
                    <div className="text-2xs text-slate-500">
                      رصد زنده آگهی‌های املاک نجف‌آباد
                    </div>
                  </div>
                </div>
                {currentMode === 'divar' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                )}
              </button>
            </div>
          </div>

          {/* Section 2: User Dashboards (Max 5, completely separated data) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>داشبوردهای من</span>
              </div>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {toPersianDigits(dashboards.length)} از {toPersianDigits(maxDashboards)}
              </span>
            </div>

            {/* List of Dashboards */}
            <div className="space-y-2">
              {dashboards.map((dash, idx) => {
                const isActive = dash.id === activeDashboardId;
                const isEditing = editingId === dash.id;

                return (
                  <div
                    key={dash.id}
                    className={`p-3 rounded-2xl border transition-all text-right ${
                      isActive
                        ? 'bg-slate-50 border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 text-xs border border-emerald-500 rounded-lg px-2 py-1 focus:outline-hidden text-right"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(dash.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(dash.id)}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectDashboard(dash.id);
                            onClose();
                          }}
                          className="flex items-center gap-2.5 flex-1 text-right min-w-0 cursor-pointer"
                        >
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {toPersianDigits(idx + 1)}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                              <span>{dash.title}</span>
                              {isActive && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                                  فعال
                                </span>
                              )}
                            </div>
                            <div className="text-2xs text-slate-500">
                              {toPersianDigits(dash.excelData?.length || 0)} ملک ثبت شده
                            </div>
                          </div>
                        </button>

                        {/* Actions: Rename / Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartRename(dash)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="تغییر نام داشبورد"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDashboardToDelete(dash);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="حذف این داشبورد"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Create New Dashboard (if < 5) */}
            {canCreateMore ? (
              isCreatingNew ? (
                <form
                  onSubmit={handleCreateNewSubmit}
                  className="p-3 bg-slate-50 rounded-2xl border border-dashed border-emerald-400 space-y-2"
                >
                  <label className="block text-2xs font-bold text-slate-700">
                    عنوان داشبورد جدید (حداکثر ۵ داشبورد):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={`داشبورد ${toPersianDigits(dashboards.length + 1)}`}
                      className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:border-emerald-500 focus:outline-hidden"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      افزودن
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="w-full py-2.5 px-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl text-xs font-bold text-slate-700 hover:text-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>ایجاد داشبورد جدید ({toPersianDigits(dashboards.length + 1)})</span>
                </button>
              )
            ) : (
              <div className="p-2.5 bg-slate-100 rounded-xl text-center text-2xs text-slate-500 font-medium">
                سقف مجاز (۵ داشبورد مجزا) برای این حساب تکمیل شده است.
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          {/* Admin panel link if current user is admin */}
          {currentUser.role === 'admin' && onOpenAdminPanel && (
            <button
              type="button"
              onClick={() => {
                onOpenAdminPanel();
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>پنل مدیریت کل سیستم (Admin)</span>
            </button>
          )}

          {/* Logout button */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>خروج از حساب کاربری</span>
          </button>
        </div>
      </div>

      {/* Confirmation Pop-up Modal to Prevent Accidental Deletion */}
      {dashboardToDelete && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDashboardToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-right animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            </div>

            <h3 className="text-base font-black text-slate-900 text-center mb-2">
              حذف داشبورد «{dashboardToDelete.title}»
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed text-center mb-6">
              {dashboards.length <= 1
                ? 'این تنها داشبورد شماست. با تایید، تمامی املاک و فایل اکسل این داشبورد به صورت کامل پاکسازی شده و یک داشبورد خالی جایگزین آن می‌شود.'
                : 'آیا از حذف این داشبورد اطمینان دارید؟ تمامی اطلاعات املاک و فایل اکسل ذخیره شده در آن به صورت کامل حذف خواهند شد.'}
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const idToDelete = dashboardToDelete.id;
                  setDashboardToDelete(null);
                  onDeleteDashboard(idToDelete);
                }}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>بله، حذف شود</span>
              </button>

              <button
                type="button"
                onClick={() => setDashboardToDelete(null)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
