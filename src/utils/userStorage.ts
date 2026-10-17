import { AppUser, UserDashboard, RealEstateItem } from '../types';

const USERS_STORAGE_KEY = 'najafabad_realestate_users_v1';
const CURRENT_USER_KEY = 'najafabad_realestate_current_user_v1';
const DASHBOARDS_PREFIX = 'najafabad_dashboards_v2_';
const ACTIVE_DASHBOARD_PREFIX = 'najafabad_active_dash_v2_';

const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user_admin_hesam',
    username: 'hesam',
    password: 'hesam',
    displayName: 'حسام (مدیر کل سیستم)',
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    maxDashboards: 5,
  },
];

export function getUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    // Always ensure admin hesam is present
    const hasAdmin = parsed.some((u) => u.username === 'hesam');
    if (!hasAdmin) {
      parsed.unshift(DEFAULT_USERS[0]);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
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

export function createUser(data: {
  username: string;
  password: string;
  displayName: string;
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

  const newUser: AppUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    username: trimmedUser,
    password: data.password.trim(),
    displayName: data.displayName.trim() || trimmedUser,
    role: 'user',
    createdAt: new Date().toISOString(),
    maxDashboards: 5,
  };

  users.push(newUser);
  saveUsers(users);

  // Automatically seed first dashboard for the newly created user
  createDashboard(newUser.id, 'داشبورد اصلی املاک');

  return { success: true, message: 'کاربر جدید با موفقیت ایجاد شد.', user: newUser };
}

export function deleteUser(userId: string): { success: boolean; message: string } {
  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) {
    return { success: false, message: 'کاربر یافت نشد.' };
  }
  if (target.username === 'hesam') {
    return { success: false, message: 'امکان حذف کاربر مدیر اصلی (hesam) وجود ندارد.' };
  }

  const updated = users.filter((u) => u.id !== userId);
  saveUsers(updated);

  // Clean user's dashboards from localStorage
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

  // Update last login timestamp
  match.lastLoginAt = new Date().toISOString();
  saveUsers(users);
  setCurrentUser(match);

  return { success: true, user: match };
}

export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
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

// ---------------- Multi-Dashboard Management (Max 5 per user) ----------------

export function getUserDashboards(userId: string): UserDashboard[] {
  try {
    const raw = localStorage.getItem(DASHBOARDS_PREFIX + userId);
    if (!raw) {
      // Create initial dashboard which is EMPTY at first
      const initial: UserDashboard = {
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
      localStorage.setItem(DASHBOARDS_PREFIX + userId, JSON.stringify([initial]));
      setActiveDashboardId(userId, initial.id);
      return [initial];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial: UserDashboard = {
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
      localStorage.setItem(DASHBOARDS_PREFIX + userId, JSON.stringify([initial]));
      setActiveDashboardId(userId, initial.id);
      return [initial];
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

export function createDashboard(
  userId: string,
  title?: string
): { success: boolean; dashboard?: UserDashboard; message?: string } {
  const list = getUserDashboards(userId);
  if (list.length >= 5) {
    return {
      success: false,
      message: 'هر کاربر حداکثر می‌تواند ۵ داشبورد مستقل داشته باشد.',
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
    // If only 1 dashboard, reset it to a brand new empty dashboard 1
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
    return { success: true, nextActiveId: freshDash.id, message: 'داشبورد پاکسازی و خالی شد.' };
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
