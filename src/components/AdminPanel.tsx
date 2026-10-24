import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Users,
  LogOut,
  Building2,
  FileSpreadsheet,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Lock,
  User,
  Tag,
  Eye,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { AppUser, UserDashboard } from '../types';
import {
  getUsersForAccount,
  createUser,
  updateUser,
  deleteUser,
  getUserDashboards,
  getAccountOwner,
} from '../utils/userStorage';
import { toPersianDigits } from '../utils/formatters';
import { UserCustomizationModal } from './UserCustomizationModal';

interface AdminPanelProps {
  currentUser: AppUser;
  onLogout: () => void;
  onEnterUserWorkspace: (user: AppUser) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onLogout,
  onEnterUserWorkspace,
}) => {
  const isHesam = currentUser.username === 'hesam' || currentUser.role === 'superadmin';
  const isAli = currentUser.username === 'ali' || currentUser.role === 'account_admin';

  const [users, setUsers] = useState<AppUser[]>(() =>
    getUsersForAccount(currentUser.accountId || 'acc_ali', currentUser.username)
  );
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [selectedUserForCustomization, setSelectedUserForCustomization] = useState<AppUser | null>(null);

  const refreshUserList = () => {
    setUsers(getUsersForAccount(currentUser.accountId || 'acc_ali', currentUser.username));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!newUsername.trim()) {
      setStatusMessage({ text: 'لطفاً نام کاربری را وارد کنید.', type: 'error' });
      return;
    }
    if (!newPassword || newPassword.trim().length < 2) {
      setStatusMessage({
        text: 'رمز عبور باید حداقل ۲ کاراکتر باشد.',
        type: 'error',
      });
      return;
    }

    const res = createUser({
      username: newUsername,
      password: newPassword,
      displayName: newDisplayName.trim() || newUsername.trim(),
      accountId: currentUser.accountId || 'acc_ali',
      accountOwnerUsername: currentUser.username,
    });

    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
      setNewUsername('');
      setNewPassword('');
      setNewDisplayName('');
      refreshUserList();
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    const res = deleteUser(userToDelete.id);
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
      refreshUserList();
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
    setUserToDelete(null);
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q)
    );
  });

  const accountOwner = isHesam ? getAccountOwner('acc_ali') : currentUser;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Vazirmatn',sans-serif]">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700/80 shadow-md">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white">
                  {isHesam
                    ? 'پنل مدیریت کل سامانه (حسام)'
                    : `پنل مدیریت حساب املاک (${currentUser.displayName})`}
                </h1>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-2xs font-bold px-2 py-0.5 rounded-full">
                  {isHesam
                    ? 'مدیر ارشد کل سیستم'
                    : `مدیر حساب (${currentUser.username})`}
                </span>
              </div>
              <p className="text-2xs text-slate-400 hidden sm:block">
                {isHesam
                  ? 'تعریف حساب‌های مدیران و کنترل ساختار چندمستاجری املاک نجف‌آباد'
                  : 'تعریف اعضای حساب (رضا، حامد)، تعیین رمز عبور و سفارشی‌سازی دسترسی به اکسل شما و اکسل سایر همکاران'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Go to personal workspace */}
            <button
              onClick={() => onEnterUserWorkspace(currentUser)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              title="ورود به داشبورد و اکسل‌های این حساب"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">ورود به داشبورد اکسل</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/60 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="خروج از حساب مدیریت"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Status Toast Alert */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold shadow-lg animate-in slide-in-from-top-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4.5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xs text-slate-400 font-medium">
                {isHesam ? 'کل حساب‌های سامانه' : 'کاربران و همکاران این حساب'}
              </div>
              <div className="text-2xl font-black text-white">
                {toPersianDigits(users.length)} <span className="text-xs font-normal text-slate-400">کاربر</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4.5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xs text-slate-400 font-medium">سقف داشبورد هر کاربر</div>
              <div className="text-2xl font-black text-emerald-400">
                {toPersianDigits(5)} <span className="text-xs font-normal text-slate-400">داشبورد مستقل</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Columns: Create User Form + Users List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Create User Form Box */}
          <div className="lg:col-span-1 bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl sticky top-22">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/80 text-emerald-400 font-black text-sm">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>
                {isHesam ? 'تعریف حساب مدیر جدید' : 'افزودن همکار جدید به حساب'}
              </span>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  نام کاربری (جهت لاگین):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="مثال: reza یا hamed"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pr-9 pl-3 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition-all text-right font-mono"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  کلمه عبور:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="رمز ورود کاربر"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pr-9 pl-3 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition-all text-right font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  نام و عنوان کاربر (اختیاری):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="مثال: رضا (مشاور املاک)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pr-9 pl-3 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition-all text-right"
                  />
                  <Tag className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 text-2xs text-slate-400 leading-relaxed">
                💡 کاربر ایجاد شده فوراً می‌تواند لاگین کند. شما به عنوان مدیر می‌توانید دسترسی او به اکسل خود و همکاران را سفارشی‌سازی کنید.
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>ثبت و ایجاد کاربر در حساب</span>
              </button>
            </form>
          </div>

          {/* Users List Table */}
          <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700 rounded-3xl shadow-xl overflow-hidden flex flex-col">
            {/* Header of Table */}
            <div className="p-4 sm:p-5 border-b border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800">
              <div className="flex items-center gap-2 self-start sm:self-center">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">
                  {isHesam ? 'لیست تمام کاربران' : 'لیست همکاران این حساب'}
                </h2>
                <span className="text-2xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  {toPersianDigits(filteredUsers.length)} کاربر
                </span>
              </div>

              <div className="w-full sm:w-64 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در نام یا نام کاربری..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 transition-all"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-700/80 overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  کاربری با این مشخصات در حساب یافت نشد.
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const userDashboards = getUserDashboards(user.id);
                  const isThisUserHesam = user.username === 'hesam';
                  const isThisUserAli = user.username === 'ali' || user.role === 'account_admin';

                  return (
                    <div
                      key={user.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-750 transition-colors"
                    >
                      {/* User Info */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                            isThisUserHesam
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : isThisUserAli
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {user.displayName.charAt(0) || user.username.charAt(0)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {user.displayName}
                            </span>
                            <span className="font-mono text-2xs px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                              @{user.username}
                            </span>
                            {isThisUserHesam ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                مدیر کل ارشد سامانه
                              </span>
                            ) : isThisUserAli ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                مدیر حساب (مالک)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                                همکار / مشاور املاک
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-2xs text-slate-400">
                            <span className="flex items-center gap-1 font-mono">
                              <Lock className="w-3 h-3 text-slate-500" />
                              رمز: {user.password}
                            </span>
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3 text-slate-500" />
                              داشبوردها:{' '}
                              <strong className="text-emerald-400 font-bold">
                                {toPersianDigits(userDashboards.length)}
                              </strong>{' '}
                              از {toPersianDigits(user.maxDashboards || 5)}
                            </span>
                            {user.lastLoginAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                آخرین فعالیت:{' '}
                                {new Date(user.lastLoginAt).toLocaleDateString('fa-IR')}
                              </span>
                            )}
                          </div>

                          {/* Quick Permission Badges */}
                          {!isThisUserAli && !isThisUserHesam && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {user.permissions?.canViewAdminExcel ? (
                                <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded-md font-medium">
                                  ✓ مشاهده اکسل مدیر ({accountOwner?.displayName || 'علی'})
                                </span>
                              ) : (
                                <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md">
                                  ✕ بدون اکسل مدیر
                                </span>
                              )}
                              {(user.permissions?.allowedUserExcelIds?.length || 0) > 0 && (
                                <span className="text-[10px] bg-indigo-950/60 text-indigo-300 border border-indigo-800/80 px-2 py-0.5 rounded-md font-medium">
                                  ✓ اکسل {toPersianDigits(user.permissions!.allowedUserExcelIds!.length)} همکار
                                </span>
                              )}
                              {user.permissions?.canAccessAdminPanel && (
                                <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded-md font-medium">
                                  ✓ دسترسی به پنل ادمین
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Customize user permissions */}
                        <button
                          type="button"
                          onClick={() => setSelectedUserForCustomization(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/25 active:scale-95 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="سفارشی‌سازی تنظیمات و سطوح دسترسی این کاربر"
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span>سفارشی‌سازی دسترسی‌ها</span>
                        </button>

                        {/* Switch / View this user's workspace */}
                        <button
                          type="button"
                          onClick={() => onEnterUserWorkspace(user)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-indigo-600 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
                          title="ورود به فضای کار این کاربر"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>ورود به داشبورد</span>
                        </button>

                        {/* Delete user (disabled for account owner and hesam) */}
                        {!isThisUserAli && !isThisUserHesam && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-500/30"
                            title="حذف این کاربر"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Delete User */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">حذف کاربر</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                آیا از حذف کاربر «<strong>{userToDelete.displayName}</strong>» با نام کاربری «<strong>{userToDelete.username}</strong>» و تمام داشبوردهای او مطمئن هستید؟ این عمل غیرقابل بازگشت است.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                بله، حذف کاربر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Customization Modal */}
      {selectedUserForCustomization && (
        <UserCustomizationModal
          isOpen={Boolean(selectedUserForCustomization)}
          onClose={() => setSelectedUserForCustomization(null)}
          user={selectedUserForCustomization}
          accountOwner={accountOwner}
          accountTeammates={users}
          onSave={(userId, updates) => {
            const res = updateUser(userId, updates);
            if (res.success) {
              setStatusMessage({ text: res.message, type: 'success' });
              refreshUserList();
            } else {
              setStatusMessage({ text: res.message, type: 'error' });
            }
            setSelectedUserForCustomization(null);
          }}
        />
      )}
    </div>
  );
};
