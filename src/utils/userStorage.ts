import {
  AppUser,
  UserDashboard,
  RealEstateItem,
  UserPermissions,
  DEFAULT_USER_PERMISSIONS,
  ADMIN_USER_PERMISSIONS,
} from '../types';
import { DIVAR_NAJAFABAD_24H_DATA } from '../data/divarNajafabadData';

const USERS_STORAGE_KEY = 'najafabad_realestate_users_v2';
const CURRENT_USER_KEY = 'najafabad_realestate_current_user_v2';
const DASHBOARDS_PREFIX = 'najafabad_dashboards_v3_';
const ACTIVE_DASHBOARD_PREFIX = 'najafabad_active_dash_v3_';

// Initial pre-configured accounts:
// 1. Hesam: System Super-Admin
// 2. Ali: Account Admin / Owner of 'acc_ali'
// 3. Reza: Member in Ali's account (customized by Ali)
// 4. Hamed: Member in Ali's account (customized by Ali)
const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user_hesam',
    accountId: 'system',
    username: 'hesam',
    password: 'hesam',
    displayName: 'حسام (مدیر کل ارشد سامانه)',
    role: 'superadmin',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    maxDashboards: 5,
    permissions: ADMIN_USER_PERMISSIONS,
  },
  {
    id: 'user_ali',
    accountId: 'acc_ali',
    username: 'ali',
    password: 'ali',
    displayName: 'علی (مدیر حساب املاک)',
    role: 'account_admin',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    maxDashboards: 5,
    permissions: ADMIN_USER_PERMISSIONS,
  },
  {
    id: 'user_reza',
    accountId: 'acc_ali',
    accountOwnerUsername: 'ali',
    username: 'reza',
    password: 'reza',
    displayName: 'رضا (مشاور املاک)',
    role: 'member',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    maxDashboards: 5,
    permissions: {
      ...DEFAULT_USER_PERMISSIONS,
      canAccessAdminPanel: false,
      canViewAdminExcel: true, // Ali allowed Reza to see Ali's excel
      canAddToAdminExcel: true, // Ali allowed Reza to add to Ali's excel
      canEditOthersItemsInAdminExcel: false, // Reza only edits his own items
      allowedUserExcelIds: ['user_hamed'], // Ali allowed Reza to also view Hamed's excel!
    },
  },
  {
    id: 'user_hamed',
    accountId: 'acc_ali',
    accountOwnerUsername: 'ali',
    username: 'hamed',
    password: 'hamed',
    displayName: 'حامد (مشاور املاک)',
    role: 'member',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    maxDashboards: 5,
    permissions: {
      ...DEFAULT_USER_PERMISSIONS,
      canAccessAdminPanel: false,
      canViewAdminExcel: false, // Initially locked until Ali customizes Hamed
      canAddToAdminExcel: false,
      canEditOthersItemsInAdminExcel: false,
      allowedUserExcelIds: [],
    },
  },
];

export function getUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    let list: AppUser[] = [];
    if (!raw) {
      list = DEFAULT_USERS;
    } else {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        list = DEFAULT_USERS;
      } else {
        list = parsed;
      }
    }

    // Ensure all 4 core users (hesam, ali, reza, hamed) exist
    for (const defUser of DEFAULT_USERS) {
      if (!list.some((u) => u.username === defUser.username)) {
        list.push(defUser);
      }
    }

    // Guarantee full valid fields and permissions on all users
    const mapped: AppUser[] = list.map((u) => {
      const isSuper = u.role === 'superadmin' || u.username === 'hesam';
      const isAccAdmin = u.role === 'account_admin' || u.username === 'ali';
      const role = isSuper ? 'superadmin' : isAccAdmin ? 'account_admin' : 'member';
      const basePerms = (isSuper || isAccAdmin) ? ADMIN_USER_PERMISSIONS : DEFAULT_USER_PERMISSIONS;

      return {
        ...u,
        accountId: u.accountId || (isSuper ? 'system' : 'acc_ali'),
        accountOwnerUsername: u.accountOwnerUsername || (isAccAdmin ? undefined : 'ali'),
        role,
        maxDashboards: u.maxDashboards || 5,
        permissions: {
          ...basePerms,
          ...(u.permissions || {}),
          allowedUserExcelIds: u.permissions?.allowedUserExcelIds || [],
        },
      };
    });

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mapped));
    return mapped;
  } catch (e) {
    console.error('Failed to parse users from localStorage', e);
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

// Returns ONLY users that belong to the current account (unless SuperAdmin hesam is viewing all)
export function getUsersForAccount(accountId: string, currentUsername?: string): AppUser[] {
  const users = getUsers();
  if (currentUsername === 'hesam') {
    return users;
  }
  return users.filter((u) => u.accountId === accountId);
}

// Returns the owner / head of an account (e.g. Ali)
export function getAccountOwner(accountId: string): AppUser | undefined {
  const users = getUsers();
  return (
    users.find((u) => u.accountId === accountId && (u.role === 'account_admin' || u.username === 'ali')) ||
    users.find((u) => u.accountId === accountId)
  );
}

export function createUser(data: {
  username: string;
  password: string;
  displayName: string;
  accountId?: string;
  accountOwnerUsername?: string;
  permissions?: Partial<UserPermissions>;
  maxDashboards?: number;
}): { success: boolean; message: string; user?: AppUser } {
  const users = getUsers();
  const trimmedUser = data.username.trim().toLowerCase();
  if (!trimmedUser) {
    return { success: false, message: 'نام کاربری نمی‌تواند خالی باشد.' };
  }
  if (!data.password || data.password.trim().length < 2) {
    return { success: false, message: 'رمز عبور باید حداقل ۲ کاراکتر باشد.' };
  }
  if (users.some((u) => u.username.toLowerCase() === trimmedUser)) {
    return { success: false, message: 'این نام کاربری قبلاً در سامانه ثبت شده است.' };
  }

  const accountId = data.accountId || 'acc_ali';
  const newUser: AppUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    accountId,
    accountOwnerUsername: data.accountOwnerUsername || 'ali',
    username: trimmedUser,
    password: data.password.trim(),
    displayName: data.displayName.trim() || trimmedUser,
    role: 'member',
    createdAt: new Date().toISOString(),
    maxDashboards: data.maxDashboards || 5,
    permissions: {
      ...DEFAULT_USER_PERMISSIONS,
      canAccessAdminPanel: false,
      canViewAdminExcel: false,
      canAddToAdminExcel: false,
      allowedUserExcelIds: [],
      ...(data.permissions || {}),
    },
  };

  users.push(newUser);
  saveUsers(users);

  // Automatically seed first clean dashboard for the new user
  createDashboard(newUser.id, `داشبورد ${newUser.displayName}`);

  return { success: true, message: `کاربر «${newUser.displayName}» به حساب کاربری اضافه شد.`, user: newUser };
}

export function updateUser(
  userId: string,
  updates: Partial<AppUser>
): { success: boolean; message: string; user?: AppUser } {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) {
    return { success: false, message: 'کاربر مورد نظر یافت نشد.' };
  }

  const target = { ...users[idx] };

  if (updates.username && updates.username.trim().toLowerCase() !== target.username.toLowerCase()) {
    const desired = updates.username.trim().toLowerCase();
    if (users.some((u) => u.id !== userId && u.username.toLowerCase() === desired)) {
      return { success: false, message: 'این نام کاربری قبلاً توسط کاربر دیگری ثبت شده است.' };
    }
    target.username = desired;
  }

  if (updates.password && updates.password.trim()) {
    target.password = updates.password.trim();
  }

  if (updates.displayName !== undefined) {
    target.displayName = updates.displayName.trim() || target.username;
  }

  if (updates.maxDashboards !== undefined) {
    target.maxDashboards = Math.max(1, Math.min(10, updates.maxDashboards));
  }

  if (updates.permissions) {
    const base = target.permissions || DEFAULT_USER_PERMISSIONS;
    target.permissions = {
      ...base,
      ...updates.permissions,
      allowedUserExcelIds: updates.permissions.allowedUserExcelIds ?? base.allowedUserExcelIds ?? [],
    };
  }

  users[idx] = target;
  saveUsers(users);

  // Sync current user session if it matches
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(target);
  }

  return { success: true, message: `تنظیمات کاربر «${target.displayName}» با موفقیت ذخیره شد.`, user: target };
}

export function deleteUser(userId: string): { success: boolean; message: string } {
  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) {
    return { success: false, message: 'کاربر یافت نشد.' };
  }
  if (target.username === 'hesam' || target.username === 'ali') {
    return { success: false, message: 'امکان حذف مدیر اصلی وجود ندارد.' };
  }

  const updated = users.filter((u) => u.id !== userId);
  saveUsers(updated);

  try {
    localStorage.removeItem(DASHBOARDS_PREFIX + target.id);
    localStorage.removeItem(ACTIVE_DASHBOARD_PREFIX + target.id);
  } catch (e) {
    // ignore
  }

  return { success: true, message: `کاربر «${target.displayName}» با موفقیت حذف شد.` };
}

export function authenticate(
  username: string,
  password: string
): { success: boolean; user?: AppUser; message?: string } {
  const users = getUsers();
  const trimmed = username.trim().toLowerCase();
  const match = users.find(
    (u) => u.username.toLowerCase() === trimmed && u.password === password
  );

  if (!match) {
    return { success: false, message: 'نام کاربری یا رمز عبور اشتباه است.' };
  }

  match.lastLoginAt = new Date().toISOString();
  saveUsers(users);
  setCurrentUser(match);

  return { success: true, user: match };
}

export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      // Default auto-login to Ali (Head of account)
      const users = getUsers();
      const ali = users.find((u) => u.username === 'ali') || users[0];
      if (ali) {
        setCurrentUser(ali);
        return ali;
      }
      return null;
    }
    const user = JSON.parse(raw);
    const users = getUsers();
    const fresh = users.find((u) => u.id === user.id) || user;
    return fresh;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch {
    // ignore
  }
}

export function logout(): void {
  setCurrentUser(null);
}

// ---------------- Multi-Dashboard Management ----------------

export function getUserDashboards(userId: string): UserDashboard[] {
  try {
    const raw = localStorage.getItem(DASHBOARDS_PREFIX + userId);
    if (!raw) {
      // Seed initial dashboard tailored to user
      let seededData: RealEstateItem[] = [];
      let initialTitle = 'داشبورد ۱';
      let fileName = '';

      if (userId === 'user_ali') {
        initialTitle = 'اکسل جامع املاک نجف‌آباد (علی)';
        fileName = 'فایل_جامع_املاک_علی.xlsx';
        seededData = DIVAR_NAJAFABAD_24H_DATA.slice(0, 15).map((item, idx) => ({
          ...item,
          id: idx + 1,
          rowNumber: idx + 1,
          source: 'excel',
          createdByUserId: 'user_ali',
          createdByUsername: 'علی',
        }));
      } else if (userId === 'user_hamed') {
        initialTitle = 'املاک ثبت شده توسط حامد';
        fileName = 'فایل_املاک_حامد.xlsx';
        seededData = DIVAR_NAJAFABAD_24H_DATA.slice(15, 18).map((item, idx) => ({
          ...item,
          id: idx + 1,
          rowNumber: idx + 1,
          source: 'excel',
          createdByUserId: 'user_hamed',
          createdByUsername: 'حامد',
        }));
      } else if (userId === 'user_reza') {
        initialTitle = 'املاک ثبت شده توسط رضا';
        fileName = 'فایل_املاک_رضا.xlsx';
        seededData = DIVAR_NAJAFABAD_24H_DATA.slice(18, 20).map((item, idx) => ({
          ...item,
          id: idx + 1,
          rowNumber: idx + 1,
          source: 'excel',
          createdByUserId: 'user_reza',
          createdByUsername: 'رضا',
        }));
      }

      const initial: UserDashboard = {
        id: 'dash_' + userId + '_' + Date.now(),
        userId,
        title: initialTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        excelFileName: fileName,
        excelData: seededData,
        hasExcelModifications: false,
        divarTimeRange: '24h',
        divarAlerts: [],
      };
      localStorage.setItem(DASHBOARDS_PREFIX + userId, JSON.stringify([initial]));
      setActiveDashboardId(userId, initial.id);
      return [initial];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getUserDashboards(userId);
    }
    return parsed;
  } catch (e) {
    console.error('Failed to get user dashboards', e);
    return [];
  }
}

export function saveUserDashboards(userId: string, dashboards: UserDashboard[]): void {
  try {
    localStorage.setItem(DASHBOARDS_PREFIX + userId, JSON.stringify(dashboards));
  } catch (e) {
    console.error('Failed to save dashboards', e);
  }
}

export function saveSingleDashboard(userId: string, dashboard: UserDashboard): void {
  const list = getUserDashboards(userId);
  const idx = list.findIndex((d) => d.id === dashboard.id);
  if (idx >= 0) {
    list[idx] = { ...dashboard, updatedAt: new Date().toISOString() };
  } else {
    list.push({ ...dashboard, updatedAt: new Date().toISOString() });
  }
  saveUserDashboards(userId, list);
}

export function getUserPrimaryDashboard(userId: string): UserDashboard | null {
  const dashboards = getUserDashboards(userId);
  return dashboards.length > 0 ? dashboards[0] : null;
}

export function getAdminUser(accountId = 'acc_ali'): AppUser | undefined {
  return getAccountOwner(accountId);
}

export function getAdminPrimaryDashboard(accountId = 'acc_ali'): UserDashboard | null {
  const admin = getAdminUser(accountId);
  if (!admin) return null;
  return getUserPrimaryDashboard(admin.id);
}

export function createDashboard(
  userId: string,
  title?: string
): { success: boolean; dashboard?: UserDashboard; message?: string } {
  const list = getUserDashboards(userId);
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  const maxAllowed = user?.maxDashboards || 5;

  if (list.length >= maxAllowed) {
    return {
      success: false,
      message: `سقف مجاز تعداد داشبوردها (${maxAllowed}) برای این کاربر تکمیل شده است.`,
    };
  }

  const dashNumber = list.length + 1;
  const newDash: UserDashboard = {
    id: 'dash_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId,
    title: title?.trim() || `داشبورد ${dashNumber}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    excelFileName: '',
    excelData: [],
    hasExcelModifications: false,
    divarTimeRange: '24h',
    divarAlerts: [],
  };

  list.push(newDash);
  saveUserDashboards(userId, list);
  setActiveDashboardId(userId, newDash.id);

  return { success: true, dashboard: newDash };
}

export function deleteDashboard(
  userId: string,
  dashboardId: string
): { success: boolean; message?: string; nextActiveId?: string } {
  const list = getUserDashboards(userId);
  if (list.length <= 1) {
    const freshDash: UserDashboard = {
      id: 'dash_' + Date.now(),
      userId,
      title: 'داشبورد ۱',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      excelFileName: '',
      excelData: [],
      hasExcelModifications: false,
      divarTimeRange: '24h',
      divarAlerts: [],
    };
    saveUserDashboards(userId, [freshDash]);
    setActiveDashboardId(userId, freshDash.id);
    return { success: true, nextActiveId: freshDash.id, message: 'داشبورد پاکسازی شد.' };
  }

  const filtered = list.filter((d) => d.id !== dashboardId);
  saveUserDashboards(userId, filtered);

  let nextActive = getActiveDashboardId(userId);
  if (nextActive === dashboardId) {
    nextActive = filtered[0].id;
    setActiveDashboardId(userId, nextActive);
  }

  return { success: true, nextActiveId: nextActive };
}

export function renameDashboard(userId: string, dashboardId: string, newTitle: string): void {
  const list = getUserDashboards(userId);
  const target = list.find((d) => d.id === dashboardId);
  if (target && newTitle.trim()) {
    target.title = newTitle.trim();
    target.updatedAt = new Date().toISOString();
    saveUserDashboards(userId, list);
  }
}

export function getActiveDashboardId(userId: string): string | null {
  try {
    const saved = localStorage.getItem(ACTIVE_DASHBOARD_PREFIX + userId);
    if (saved) return saved;
    const list = getUserDashboards(userId);
    if (list.length > 0) {
      setActiveDashboardId(userId, list[0].id);
      return list[0].id;
    }
    return null;
  } catch {
    return null;
  }
}

export function setActiveDashboardId(userId: string, dashboardId: string): void {
  try {
    localStorage.setItem(ACTIVE_DASHBOARD_PREFIX + userId, dashboardId);
  } catch {
    // ignore
  }
}
