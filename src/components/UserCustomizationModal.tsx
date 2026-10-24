import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  User,
  Lock,
  FileSpreadsheet,
  Building2,
  Check,
  AlertTriangle,
  Sliders,
  PlusCircle,
  Edit3,
  Trash2,
  Download,
  Upload,
  BellRing,
  Key,
  Users,
  Eye,
} from 'lucide-react';
import { AppUser, UserPermissions, DEFAULT_USER_PERMISSIONS } from '../types';
import { toPersianDigits } from '../utils/formatters';

interface UserCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
  accountOwner?: AppUser | null;
  accountTeammates?: AppUser[];
  onSave: (userId: string, updates: Partial<AppUser>) => void;
  usePersianDigits?: boolean;
}

export const UserCustomizationModal: React.FC<UserCustomizationModalProps> = ({
  isOpen,
  onClose,
  user,
  accountOwner,
  accountTeammates = [],
  onSave,
  usePersianDigits = true,
}) => {
  if (!isOpen || !user) return null;

  const fmt = (n: number | string) => (usePersianDigits ? toPersianDigits(n) : n);

  const ownerName = accountOwner?.displayName || accountOwner?.username || 'مدیر حساب';

  const [displayName, setDisplayName] = useState(user.displayName);
  const [password, setPassword] = useState(user.password);
  const [maxDashboards, setMaxDashboards] = useState(user.maxDashboards || 5);
  const [permissions, setPermissions] = useState<UserPermissions>(() => {
    return {
      ...DEFAULT_USER_PERMISSIONS,
      ...(user.permissions || {}),
      allowedUserExcelIds: user.permissions?.allowedUserExcelIds || [],
    };
  });
  const [showPassword, setShowPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setPassword(user.password);
      setMaxDashboards(user.maxDashboards || 5);
      setPermissions({
        ...DEFAULT_USER_PERMISSIONS,
        ...(user.permissions || {}),
        allowedUserExcelIds: user.permissions?.allowedUserExcelIds || [],
      });
      setSavedSuccess(false);
    }
  }, [user]);

  const togglePermission = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleTeammateExcel = (teammateId: string) => {
    setPermissions((prev) => {
      const currentList = prev.allowedUserExcelIds || [];
      const exists = currentList.includes(teammateId);
      const updatedList = exists
        ? currentList.filter((id) => id !== teammateId)
        : [...currentList, teammateId];
      return {
        ...prev,
        allowedUserExcelIds: updatedList,
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    onSave(user.id, {
      displayName: displayName.trim() || user.username,
      password: password.trim(),
      maxDashboards,
      permissions,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  // Other colleagues in this account excluding the user being edited and the account owner
  const otherTeammates = accountTeammates.filter(
    (t) => t.id !== user.id && t.id !== accountOwner?.id && t.username !== 'hesam'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs font-['Vazirmatn',sans-serif] animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-slate-900 via-slate-850 to-slate-800 text-white flex items-center justify-between border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-base shadow-inner">
              {user.displayName.charAt(0) || user.username.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                  سفارشی‌سازی دسترسی‌های «{user.displayName}»
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  @{user.username}
                </span>
              </div>
              <p className="text-2xs text-slate-300 mt-0.5">
                توسط مدیر حساب ({ownerName}) • کنترل دسترسی به اکسل علی، اکسل سایر همکاران و پنل
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors cursor-pointer"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-right">
          {/* Section 1: User Account Credentials */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>مشخصات ورود و رمز عبور {user.displayName}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Display Name */}
              <div>
                <label className="block text-2xs font-bold text-slate-600 mb-1">نام نمایشی:</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-indigo-500 font-medium transition-all"
                  placeholder="مثال: رضا احمدی"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-2xs font-bold text-slate-600 mb-1">
                  رمز عبور کاربر (تنظیم توسط {ownerName}):
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl pr-3 pl-8 py-2 text-slate-900 font-mono focus:outline-hidden focus:border-indigo-500 transition-all"
                    placeholder="حداقل ۲ کاراکتر"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-2xs cursor-pointer"
                    title={showPassword ? 'مخفی کردن' : 'نمایش'}
                  >
                    {showPassword ? 'مخفی' : 'نمایش'}
                  </button>
                </div>
              </div>
            </div>

            {/* Max Dashboards Limit */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
              <div className="text-2xs text-slate-600 font-medium">
                سقف مجاز تعداد داشبوردهای شخصی این کاربر:
              </div>
              <div className="flex items-center gap-2">
                {[1, 3, 5, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMaxDashboards(num)}
                    className={`px-2.5 py-1 text-2xs font-bold rounded-lg border transition-all cursor-pointer ${
                      maxDashboards === num
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {fmt(num)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: ACCESS TO ADMIN'S EXCEL (Ali's Excel) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>دسترسی به فایل اکسل مدیر حساب ({ownerName})</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                تعیین اختیارات {user.displayName} روی اکسل {ownerName}
              </span>
            </div>

            {/* Setting 1: Can View Admin's Excel */}
            <div
              onClick={() => togglePermission('canViewAdminExcel')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                permissions.canViewAdminExcel
                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet
                    className={`w-4 h-4 ${
                      permissions.canViewAdminExcel ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-black text-slate-900">
                    مشاهده آیتم‌های اکسل {ownerName} (مدیر حساب)
                  </span>
                  {permissions.canViewAdminExcel ? (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-900">
                      مجاز
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-200 text-slate-600">
                      قفل / غیرمجاز
                    </span>
                  )}
                </div>
                <p className="text-2xs text-slate-500 leading-relaxed">
                  آیا {user.displayName} می‌تواند در منوی خود گزینه «📁 اکسل مدیر حساب ({ownerName})» را ببیند و املاک آن را بررسی کند؟
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  permissions.canViewAdminExcel
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-slate-300 text-transparent'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>

            {/* Setting 2: Can Add New Items to Admin's Excel */}
            <div
              onClick={() => {
                if (!permissions.canViewAdminExcel) return;
                togglePermission('canAddToAdminExcel');
              }}
              className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                !permissions.canViewAdminExcel
                  ? 'bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed'
                  : permissions.canAddToAdminExcel
                  ? 'bg-teal-50/70 border-teal-300 ring-1 ring-teal-400/20 cursor-pointer'
                  : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <PlusCircle
                    className={`w-4 h-4 ${
                      permissions.canAddToAdminExcel ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-black text-slate-900">
                    افزودن ملک جدید به اکسل {ownerName}
                  </span>
                  {permissions.canAddToAdminExcel && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-teal-200 text-teal-900">
                      مجاز
                    </span>
                  )}
                </div>
                <p className="text-2xs text-slate-500 leading-relaxed">
                  آیا {user.displayName} می‌تواند در اکسل {ownerName} ملک جدید ثبت کند؟ (املاک ثبت‌شده با نام «{user.displayName}» برچسب می‌خورند).
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  permissions.canAddToAdminExcel
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white border-slate-300 text-transparent'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>

            {/* Setting 3: Can Edit Items NOT made by this user in Admin's Excel */}
            <div
              onClick={() => {
                if (!permissions.canViewAdminExcel) return;
                togglePermission('canEditOthersItemsInAdminExcel');
              }}
              className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                !permissions.canViewAdminExcel
                  ? 'bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed'
                  : permissions.canEditOthersItemsInAdminExcel
                  ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/20 cursor-pointer'
                  : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Edit3
                    className={`w-4 h-4 ${
                      permissions.canEditOthersItemsInAdminExcel ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-black text-slate-900">
                    ویرایش املاکی که خودش در اکسل {ownerName} نساخته است
                  </span>
                  {permissions.canEditOthersItemsInAdminExcel ? (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-200 text-indigo-900">
                      ویرایش کلیه املاک
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-200 text-slate-700">
                      فقط املاک ساخته شده توسط {user.displayName}
                    </span>
                  )}
                </div>
                <p className="text-2xs text-slate-500 leading-relaxed">
                  <strong>اگر تیک فعال باشد:</strong> می‌تواند هر ملکی در اکسل {ownerName} را ویرایش کند.{' '}
                  <strong>اگر تیک غیرفعال باشد:</strong> {user.displayName} فقط املاکی که خودش ثبت کرده را می‌تواند ویرایش نماید و املاک دیگران برای او قفل خواهند بود.
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  permissions.canEditOthersItemsInAdminExcel
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-300 text-transparent'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          </div>

          {/* Section 3: CROSS-MEMBER EXCEL VISIBILITY (e.g. Can Reza see Hamed's Excel or not?) */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>مشاهده اکسل سایر همکاران این حساب (دفتر)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                تعیین اشتراک اکسل بین اعضا توسط {ownerName}
              </span>
            </div>

            <p className="text-2xs text-slate-500 leading-relaxed">
              مشخص کنید آیا {user.displayName} اجازه دارد اکسل شخصی کدام یک از سایر همکاران این حساب را مشاهده کند:
            </p>

            {otherTeammates.length === 0 ? (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-2xs text-slate-500">
                کاربر دیگری در این حساب برای اشتراک‌گذاری اکسل وجود ندارد. (با افزودن همکارانی مانند حامد، لیست آن‌ها در اینجا ظاهر می‌شود).
              </div>
            ) : (
              <div className="space-y-2">
                {otherTeammates.map((teammate) => {
                  const isAllowed = permissions.allowedUserExcelIds?.includes(teammate.id);

                  return (
                    <div
                      key={teammate.id}
                      onClick={() => toggleTeammateExcel(teammate.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isAllowed
                          ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isAllowed
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {teammate.displayName.charAt(0) || teammate.username.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>مشاهده اکسل «{teammate.displayName}»</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              @{teammate.username}
                            </span>
                            {isAllowed ? (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-200 text-indigo-900">
                                مجاز به مشاهده
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-200 text-slate-600">
                                غیرمجاز
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {isAllowed
                              ? `${user.displayName} می‌تواند در منوی خود گزینه «📁 اکسل ${teammate.displayName}» را ببیند.`
                              : `اکسل ${teammate.displayName} برای ${user.displayName} مخفی است.`}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          isAllowed
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: ACCESS TO ADMIN PANEL (Can Reza access Ali's management panel?) */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>دسترسی به پنل مدیریت حساب ({ownerName})</span>
              </div>
            </div>

            <div
              onClick={() => togglePermission('canAccessAdminPanel')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                permissions.canAccessAdminPanel
                  ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className={`w-4 h-4 ${
                      permissions.canAccessAdminPanel ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-black text-slate-900">
                    مشاهده دکمه و ورود به پنل مدیریت این حساب
                  </span>
                  {permissions.canAccessAdminPanel ? (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-200 text-amber-900">
                      دسترسی داده شده
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-200 text-slate-600">
                      غیرمجاز (پیش‌فرض)
                    </span>
                  )}
                </div>
                <p className="text-2xs text-slate-500 leading-relaxed">
                  اگر این تیک غیرفعال باشد (حالت استاندارد)، {user.displayName} هیچ کلیدی برای ورود به پنل مدیریت حساب نخواهد داشت و نمی‌تواند وارد پنل {ownerName} شود.
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  permissions.canAccessAdminPanel
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-white border-slate-300 text-transparent'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          </div>

          {/* Section 5: General Permissions (Excel Export/Upload, Divar) */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="text-2xs font-bold text-slate-600 mb-1">سایر دسترسی‌ها:</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Export Excel */}
              <div
                onClick={() => togglePermission('canExportExcel')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  permissions.canExportExcel ? 'bg-slate-50 border-emerald-300' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">دانلود خروجی اکسل</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    permissions.canExportExcel ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {permissions.canExportExcel && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Upload Excel */}
              <div
                onClick={() => togglePermission('canUploadExcel')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  permissions.canUploadExcel ? 'bg-slate-50 border-emerald-300' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">آپلود فایل جدید اکسل</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    permissions.canUploadExcel ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {permissions.canUploadExcel && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Divar Access */}
              <div
                onClick={() => togglePermission('canAccessDivar')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  permissions.canAccessDivar ? 'bg-slate-50 border-red-300' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-bold text-slate-800">رصد پنل دیوار نجف‌آباد</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    permissions.canAccessDivar ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {permissions.canAccessDivar && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Divar Alerts */}
              <div
                onClick={() => togglePermission('canCreateDivarAlerts')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  permissions.canCreateDivarAlerts ? 'bg-slate-50 border-amber-300' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BellRing className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800">سیستم گوش‌به‌زنگ دیوار</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    permissions.canCreateDivarAlerts
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {permissions.canCreateDivarAlerts && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600'
                  : 'bg-slate-900 hover:bg-slate-800 active:scale-95'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>تغییرات ذخیره شد!</span>
                </>
              ) : (
                <span>ذخیره تنظیمات {user.displayName}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
