import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Users,
  LogOut,
  Building2,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Lock,
  User,
  Tag,
  Ban,
  Check,
  Power,
  ShieldAlert,
} from 'lucide-react';
import { AppUser } from '../types';
import {
  getAccountHeads,
  createUser,
  updateUser,
  deleteUser,
  toggleUserSuspension,
} from '../utils/userStorage';
import { toPersianDigits } from '../utils/formatters';

interface AdminPanelProps {
  currentUser: AppUser;
  onLogout: () => void;
  onEnterUserWorkspace?: (user: AppUser) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onLogout,
}) => {
  // Hesam only sees account heads (each main user/account). Subusers of each user are completely hidden.
  const [users, setUsers] = useState<AppUser[]>(() => getAccountHeads());
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [userToToggleSuspend, setUserToToggleSuspend] = useState<AppUser | null>(null);

  const refreshUserList = () => {
    setUsers(getAccountHeads());
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
      isAccountHead: true,
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

  const handleToggleSuspendConfirm = () => {
    if (!userToToggleSuspend) return;
    const res = toggleUserSuspension(userToToggleSuspend.id);
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
      refreshUserList();
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
    setUserToToggleSuspend(null);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    const targetId = userToDelete.id;
    const res = deleteUser(targetId);
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
      setUsers(getAccountHeads());
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
    setUserToDelete(null);
  };

  const handleUpdateUserMaxDashboards = (userId: string, newMax: number) => {
    updateUser(userId, { maxDashboards: newMax });
    refreshUserList();
    setStatusMessage({
      text: `سقف مجاز داشبورد کاربر با موفقیت به ${newMax} تغییر یافت.`,
      type: 'success',
    });
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q)
    );
  });

  const activeUsersCount = users.filter((u) => !u.isSuspended).length;
  const suspendedUsersCount = users.filter((u) => u.isSuspended).length;

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
                  پنل مدیریت کل سامانه (حسام)
                </h1>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-2xs font-bold px-2 py-0.5 rounded-full">
                  مدیر ارشد سامانه
                </span>
              </div>
              <p className="text-2xs text-slate-400 hidden sm:block">
                ایجاد، تعلیق، فعال‌سازی و حذف حساب‌های کاربران (همکاران هر حساب توسط خود کاربر مدیریت می‌شوند)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/60 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="خروج از حساب مدیریت"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4.5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xs text-slate-400 font-medium">کل حساب‌های ثبت‌شده</div>
              <div className="text-2xl font-black text-white">
                {toPersianDigits(users.length)} <span className="text-xs font-normal text-slate-400">حساب کاربر</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4.5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xs text-slate-400 font-medium">حساب‌های فعال</div>
              <div className="text-2xl font-black text-emerald-400">
                {toPersianDigits(activeUsersCount)} <span className="text-xs font-normal text-slate-400">حساب فعال</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4.5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xs text-slate-400 font-medium">حساب‌های مسدود / معلق</div>
              <div className="text-2xl font-black text-rose-400">
                {toPersianDigits(suspendedUsersCount)} <span className="text-xs font-normal text-slate-400">حساب معلق</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Columns: Create User Form + Users List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Create User Form Box (Account Head) */}
          <div className="lg:col-span-1 bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl sticky top-22">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/80 text-emerald-400 font-black text-sm">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>تعریف کاربر جدید (ایجاد حساب)</span>
            </div>

            <p className="text-2xs text-slate-400 mb-4 leading-relaxed">
              کاربری که تعریف می‌کنید، <strong>مدیر حساب خود</strong> خواهد بود (مانند علی). او دسترسی کامل به فایل اکسل، نقشه، دیوار و افزودن و سفارشی‌سازی همکاران زیرمجموعه خود دارد.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  نام کاربری (جهت ورود):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="مثال: ali یا mohammad"
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
                  نام نمایشی و عنوان حساب:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="مثال: علی (املاک سپهر)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pr-9 pl-3 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition-all text-right"
                  />
                  <Tag className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 text-2xs text-slate-400 leading-relaxed">
                💡 با ایجاد این حساب، داشبورد اختصاصی اکسل برای او فعال می‌گردد و می‌تواند فوراً لاگین نماید.
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>ایجاد کاربر جدید</span>
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
                  فهرست حساب‌های کاربری
                </h2>
                <span className="text-2xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  {toPersianDigits(filteredUsers.length)} حساب
                </span>
              </div>

              <div className="w-full sm:w-64 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در نام یا نام کاربری..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 transition-all text-right"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-700/80 overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  هیچ حساب کاربری در سامانه یافت نشد. با استفاده از فرم بالا می‌توانید یک حساب جدید تعریف کنید.
                </div>
              ) : (
                filteredUsers.map((user) => {
                  return (
                    <div
                      key={user.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        user.isSuspended ? 'bg-rose-950/20 hover:bg-rose-950/30' : 'hover:bg-slate-750'
                      }`}
                    >
                      {/* User Info */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                            user.isSuspended
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
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

                            {/* Status Badge */}
                            {user.isSuspended ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                <Ban className="w-3 h-3 text-rose-400" />
                                <span>معلق / مسدود</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>فعال</span>
                              </span>
                            )}

                            {/* Role Badge */}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              مدیر حساب املاک
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-2xs text-slate-400">
                            <span className="flex items-center gap-1 font-mono">
                              <Lock className="w-3 h-3 text-slate-500" />
                              رمز: {user.password}
                            </span>

                            {/* Max Dashboards Control */}
                            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
                              <Layers className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-300">سقف داشبورد:</span>
                              <div className="flex items-center gap-1 mr-1">
                                {[1, 3, 5, 8, 10, 15].map((limit) => (
                                  <button
                                    key={limit}
                                    type="button"
                                    onClick={() => handleUpdateUserMaxDashboards(user.id, limit)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                      (user.maxDashboards || 5) === limit
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                                    title={`تنظیم سقف مجاز داشبورد به ${limit}`}
                                  >
                                    {toPersianDigits(limit)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {user.lastLoginAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                آخرین فعالیت:{' '}
                                {new Date(user.lastLoginAt).toLocaleDateString('fa-IR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons for Hesam: Suspend/Unsuspend + Remove */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Suspend / Unsuspend Button */}
                        <button
                          type="button"
                          onClick={() => setUserToToggleSuspend(user)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                            user.isSuspended
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                              : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40'
                          }`}
                          title={
                            user.isSuspended
                              ? 'رفع تعلیق و فعال‌سازی مجدد حساب کاربر'
                              : 'تعلیق و مسدودسازی موقت ورود کاربر (اطلاعات او محفوظ می‌ماند)'
                          }
                        >
                          {user.isSuspended ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>رفع تعلیق</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              <span>تعلیق حساب</span>
                            </>
                          )}
                        </button>

                        {/* Delete user */}
                        <button
                          id={`delete-account-btn-${user.username}`}
                          type="button"
                          onClick={() => setUserToDelete(user)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 active:scale-95 rounded-xl transition-all cursor-pointer border border-rose-500/30 text-xs font-bold shadow-2xs"
                          title="حذف کامل این حساب از سامانه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Suspend / Unsuspend */}
      {userToToggleSuspend && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setUserToToggleSuspend(null)}
        >
          <div
            className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                userToToggleSuspend.isSuspended
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
              }`}
            >
              {userToToggleSuspend.isSuspended ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-white">
                {userToToggleSuspend.isSuspended
                  ? `رفع تعلیق حساب «${userToToggleSuspend.displayName}»`
                  : `تعلیق حساب «${userToToggleSuspend.displayName}»`}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {userToToggleSuspend.isSuspended
                  ? `با رفع تعلیق، کاربر می‌تواند مجدداً با نام کاربری «${userToToggleSuspend.username}» وارد سامانه شود و به تمام داشبوردها و داده‌های قبلی خود دسترسی خواهد داشت.`
                  : `با تعلیق حساب، ورود کاربر با نام کاربری «${userToToggleSuspend.username}» مسدود می‌شود. داده‌ها و داشبوردهای او در سامانه باقی مانده و پس از رفع تعلیق مجدداً در دسترس وی خواهد بود.`}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToToggleSuspend(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleToggleSuspendConfirm}
                className={`flex-1 py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-lg cursor-pointer ${
                  userToToggleSuspend.isSuspended
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                }`}
              >
                {userToToggleSuspend.isSuspended ? 'بله، فعال‌سازی شود' : 'بله، تعلیق شود'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete User */}
      {userToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setUserToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">حذف کامل حساب</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                آیا از حذف کامل حساب «<strong>{userToDelete.displayName}</strong>» با نام کاربری «<strong>{userToDelete.username}</strong>» اطمینان دارید؟ با حذف این حساب، اطلاعات اکسل و همکاران زیرمجموعه آن نیز به صورت کامل از سامانه پاکسازی خواهند شد.
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
                id="confirm-delete-user-btn"
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>بله، حذف حساب</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
