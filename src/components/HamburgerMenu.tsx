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
  Sliders,
  Upload,
  Download,
  AlertTriangle,
  UserPlus,
  Users,
  Eye,
  Lock,
  ChevronDown,
  ChevronUp,
  MapPin,
} from 'lucide-react';
import { AppUser, UserDashboard } from '../types';
import { toPersianDigits } from '../utils/formatters';
import { UserCustomizationModal } from './UserCustomizationModal';

export interface SharedExcelOption {
  userId: string;
  ownerName: string;
  title: string;
  itemCount: number;
  isAccountAdmin: boolean;
  canAdd?: boolean;
}

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  accountOwner?: AppUser | null;
  accountMembers?: AppUser[];
  currentMode: 'excel' | 'divar';
  onSelectMode: (mode: 'excel' | 'divar') => void;
  dashboards: UserDashboard[];
  activeDashboardId: string;
  onSelectDashboard: (dashboardId: string) => void;
  onCreateDashboard: (title?: string) => void;
  onRenameDashboard: (dashboardId: string, newTitle: string) => void;
  onDeleteDashboard?: (dashboardId: string) => void;
  onOpenAdminPanel?: () => void;
  onLogout: () => void;
  onUploadExcel?: () => void;
  onExportExcel?: () => void;
  excelItemCount?: number;
  hasExcelModifications?: boolean;
  allUsers?: AppUser[];
  onUpdateUser?: (userId: string, updates: Partial<AppUser>) => void;
  onCreateAccountMember?: (data: {
    username: string;
    password: string;
    displayName: string;
  }) => void;
  adminDashboard?: UserDashboard | null;
  isViewingAdminSharedExcel?: boolean;
  onSelectAdminSharedExcel?: () => void;
  sharedExcels?: SharedExcelOption[];
  activeSharedUserId?: string | null;
  onSelectSharedExcel?: (userId: string) => void;
  activeView?: 'cards' | 'map';
  onSelectView?: (view: 'cards' | 'map') => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  currentUser,
  accountOwner,
  accountMembers = [],
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
  onUploadExcel,
  onExportExcel,
  excelItemCount,
  hasExcelModifications = false,
  allUsers = [],
  onUpdateUser,
  onCreateAccountMember,
  adminDashboard,
  isViewingAdminSharedExcel = false,
  onSelectAdminSharedExcel,
  sharedExcels = [],
  activeSharedUserId,
  onSelectSharedExcel,
  activeView = 'cards',
  onSelectView,
}) => {
  const [selectedUserForCustomization, setSelectedUserForCustomization] = useState<AppUser | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [dashboardToDelete, setDashboardToDelete] = useState<UserDashboard | null>(null);

  // New member creation form state inside Hamburger Menu
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberDisplayName, setNewMemberDisplayName] = useState('');
  const [memberError, setMemberError] = useState('');

  if (!isOpen) return null;

  // Only Hesam has the Admin Panel. Ali customizes members directly in the Hamburger menu.
  const canAccessAdmin =
    currentUser.username === 'hesam' || currentUser.role === 'superadmin';

  const maxDashboards = currentUser.maxDashboards || 5;
  const canCreateMore = dashboards.length < maxDashboards;

  // Teammates in current account (for Ali: Reza, Hamed, etc.)
  const teamList =
    accountMembers.length > 0
      ? accountMembers.filter((u) => u.id !== currentUser.id && u.username !== 'hesam')
      : allUsers.filter((u) => u.id !== currentUser.id && u.username !== 'hesam');

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

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError('');
    if (!newMemberUsername.trim()) {
      setMemberError('لطفاً نام کاربری را وارد کنید.');
      return;
    }
    if (!newMemberPassword || newMemberPassword.trim().length < 2) {
      setMemberError('رمز عبور باید حداقل ۲ کاراکتر باشد.');
      return;
    }

    if (onCreateAccountMember) {
      onCreateAccountMember({
        username: newMemberUsername.trim(),
        password: newMemberPassword.trim(),
        displayName: newMemberDisplayName.trim() || newMemberUsername.trim(),
      });
      setNewMemberUsername('');
      setNewMemberPassword('');
      setNewMemberDisplayName('');
      setShowAddMemberForm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex font-['Vazirmatn',sans-serif]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container (Right side in RTL) */}
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
                      currentUser.role === 'superadmin' || currentUser.username === 'hesam'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : isAccountHead
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {currentUser.role === 'superadmin' || currentUser.username === 'hesam'
                      ? 'مدیر کل ارشد سامانه'
                      : isAccountHead
                      ? 'مدیر ارشد حساب (علی)'
                      : 'همکار / مشاور املاک'}
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
              {/* Option 1: Excel Mode */}
              <button
                type="button"
                onClick={() => {
                  onSelectMode('excel');
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-right transition-all cursor-pointer ${
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
                  <div className="text-xs font-bold">داشبورد من (اکسل)</div>
                </div>
                {currentMode === 'excel' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                )}
              </button>

              {/* Option 2: Divar Mode */}
              <button
                type="button"
                onClick={() => {
                  onSelectMode('divar');
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-right transition-all cursor-pointer ${
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
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>پنل دیوار (divar.ir)</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  </div>
                </div>
                {currentMode === 'divar' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                )}
              </button>

              {/* Option 3: Map View Single Button */}
              <button
                id="hamburger-map-view-btn"
                type="button"
                onClick={() => {
                  if (onSelectView) {
                    onSelectView(activeView === 'map' ? 'cards' : 'map');
                  }
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                  activeView === 'map'
                    ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      activeView === 'map'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <MapPin className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>نقشه املاک نجف‌آباد</span>
                    {activeView === 'map' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                        فعال
                      </span>
                    )}
                  </div>
                </div>
                {activeView === 'map' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                )}
              </button>
            </div>
          </div>

          {/* Section: Excel Operations (Import & Export inside Hamburger for clean view) */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>عملیات فایل اکسل</span>
              </div>
              {excelItemCount !== undefined && excelItemCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {toPersianDigits(excelItemCount)} ملک ثبت شده
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onUploadExcel?.();
                  onClose();
                }}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-50/90 hover:bg-emerald-100/90 active:scale-98 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group"
                title="بارگذاری فایل اکسل جدید در این داشبورد"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <span>آپلود فایل اکسل</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onExportExcel?.();
                  onClose();
                }}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-teal-50/90 hover:bg-teal-100/90 active:scale-98 text-teal-900 border border-teal-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group"
                title="دانلود فایل اکسل بروزرسانی شده با آخرین تغییرات"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <span>دانلود خروجی اکسل</span>
              </button>
            </div>

            {hasExcelModifications && (
              <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-xl px-2.5 py-1.5 text-center font-medium animate-pulse">
                تغییرات جدید در این داشبورد آماده خروجی گرفتن است
              </p>
            )}
          </div>

          {/* Section 2: User Dashboards (Max 5, separated) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>داشبوردهای شخصی من</span>
              </div>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {toPersianDigits(dashboards.length)} از {toPersianDigits(maxDashboards)}
              </span>
            </div>

            {/* List of Personal Dashboards */}
            <div className="space-y-2">
              {dashboards.map((dash, idx) => {
                const isActive = !activeSharedUserId && !isViewingAdminSharedExcel && dash.id === activeDashboardId;
                const isEditing = editingId === dash.id;

                return (
                  <div
                    key={dash.id}
                    className={`p-3 rounded-2xl border transition-all text-right ${
                      isActive
                        ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs'
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
                سقف مجاز ({toPersianDigits(maxDashboards)} داشبورد مجزا) برای این حساب تکمیل شده است.
              </div>
            )}
          </div>

          {/* Section 2.5: Shared Excels in this Account (For Members like Reza, Hamed) */}
          {sharedExcels.length > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                  <span>اکسل‌های اشتراکی در حساب</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {toPersianDigits(sharedExcels.length)} فایل اشتراکی
                </span>
              </div>

              <div className="space-y-2">
                {sharedExcels.map((shared) => {
                  const isCurrent = activeSharedUserId === shared.userId;

                  return (
                    <div
                      key={shared.userId}
                      onClick={() => {
                        onSelectSharedExcel?.(shared.userId);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl border transition-all text-right cursor-pointer flex items-center justify-between gap-2.5 ${
                        isCurrent
                          ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/30 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-amber-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                            isCurrent
                              ? 'bg-amber-600 text-white'
                              : shared.isAccountAdmin
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          <FileSpreadsheet className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                            <span className="truncate">{shared.title}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold shrink-0 ${
                                shared.isAccountAdmin
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {shared.isAccountAdmin ? 'اکسل مدیر' : 'اکسل همکار'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span>مالک: {shared.ownerName}</span>
                            <span>•</span>
                            <span>{toPersianDigits(shared.itemCount)} ملک</span>
                            {shared.canAdd && (
                              <span className="text-emerald-700 font-bold mr-1">• افزودن مجاز</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isCurrent && (
                        <Check className="w-5 h-5 text-amber-600 stroke-[3] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: ACCOUNT ADMIN (Ali) - Teammates List & User Customization */}
          {isAccountHead && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>مدیریت کاربران حساب (همکاران)</span>
                </div>
                {onOpenAdminPanel && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAdminPanel();
                      onClose();
                    }}
                    className="text-[10px] text-amber-700 hover:text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    پنل کامل
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed px-1">
                به عنوان مدیر این حساب، کاربران جدید تعریف کنید و دسترسی هر کاربر به اکسل خود، اکسل همکاران یا پنل را سفارشی‌سازی کنید:
              </p>

              {/* Add Member Quick Accordion */}
              {onCreateAccountMember && (
                <div>
                  {!showAddMemberForm ? (
                    <button
                      type="button"
                      onClick={() => setShowAddMemberForm(true)}
                      className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-600" />
                      <span>+ افزودن همکار / کاربر جدید به حساب</span>
                    </button>
                  ) : (
                    <form
                      onSubmit={handleAddMemberSubmit}
                      className="p-3 bg-slate-50 border border-emerald-400 rounded-2xl space-y-2.5 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          مشخصات کاربر جدید در حساب شما:
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddMemberForm(false)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {memberError && (
                        <div className="text-2xs text-rose-600 font-bold bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                          {memberError}
                        </div>
                      )}

                      <div>
                        <input
                          type="text"
                          value={newMemberUsername}
                          onChange={(e) => setNewMemberUsername(e.target.value)}
                          placeholder="نام کاربری (مثال: reza)"
                          className="w-full text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:border-emerald-500 focus:outline-hidden text-right"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          value={newMemberPassword}
                          onChange={(e) => setNewMemberPassword(e.target.value)}
                          placeholder="رمز عبور (مثال: reza)"
                          className="w-full text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:border-emerald-500 focus:outline-hidden text-right font-mono"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          value={newMemberDisplayName}
                          onChange={(e) => setNewMemberDisplayName(e.target.value)}
                          placeholder="نام و نشان (مثال: رضا - مشاور)"
                          className="w-full text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:border-emerald-500 focus:outline-hidden text-right"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          ایجاد کاربر
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddMemberForm(false)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs"
                        >
                          انصراف
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Members List */}
              <div className="space-y-2">
                {teamList.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-2xs text-slate-500">
                    هنوز کاربری به حساب شما اضافه نشده است. با دکمه بالا همکارانی مانند رضا یا حامد را ثبت کنید.
                  </div>
                ) : (
                  teamList.map((member) => {
                    const canSeeAdminExcel = member.permissions?.canViewAdminExcel;
                    const canAddToAdminExcel = member.permissions?.canAddToAdminExcel;
                    const allowedTeammatesCount = member.permissions?.allowedUserExcelIds?.length || 0;
                    const hasAdminPanel = member.permissions?.canAccessAdminPanel;

                    return (
                      <div
                        key={member.id}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs shrink-0">
                            {member.displayName.charAt(0) || member.username.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {member.displayName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                              @{member.username}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              {canSeeAdminExcel ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">
                                  اکسل شما: مجاز
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-medium">
                                  اکسل شما: قفل
                                </span>
                              )}
                              {allowedTeammatesCount > 0 && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-medium">
                                  اکسل {toPersianDigits(allowedTeammatesCount)} همکار
                                </span>
                              )}
                              {hasAdminPanel && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                                  پنل ادمین
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedUserForCustomization(member)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-amber-50 active:scale-95 text-slate-800 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-xl text-2xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                          title="تنظیم فهرست اختیارات و دسترسی‌های این کاربر"
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-600" />
                          <span>تنظیم دسترسی</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          {/* Admin panel button if user has permission */}
          {canAccessAdmin && onOpenAdminPanel && (
            <button
              type="button"
              onClick={() => {
                onOpenAdminPanel();
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>ورود به پنل مدیریت حساب (Admin Panel)</span>
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

      {/* User Customization Modal Triggered from Hamburger Menu */}
      {selectedUserForCustomization && (
        <UserCustomizationModal
          isOpen={Boolean(selectedUserForCustomization)}
          onClose={() => setSelectedUserForCustomization(null)}
          user={selectedUserForCustomization}
          accountOwner={accountOwner || currentUser}
          accountTeammates={accountMembers.length > 0 ? accountMembers : allUsers}
          onSave={(userId, updates) => {
            onUpdateUser?.(userId, updates);
            setSelectedUserForCustomization(null);
          }}
        />
      )}

      {/* Confirmation Modal to Prevent Accidental Deletion */}
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
                  onDeleteDashboard?.(idToDelete);
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
