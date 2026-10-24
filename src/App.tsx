import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  RealEstateItem,
  FilterState,
  SortField,
  SortOrder,
  DivarTimeRange,
  DivarAlert,
  AppUser,
  UserDashboard,
} from './types';
import {
  DIVAR_NAJAFABAD_24H_DATA,
  DIVAR_METADATA,
  DivarFetchMeta,
} from './data/divarNajafabadData';
import { LoginPage } from './components/LoginPage';
import { AdminPanel } from './components/AdminPanel';
import { HamburgerMenu, SharedExcelOption } from './components/HamburgerMenu';
import { Navbar } from './components/Navbar';
import { DivarSyncBanner } from './components/DivarSyncBanner';
import { UploadDropzone } from './components/UploadDropzone';
import { StatsOverview } from './components/StatsOverview';
import { FilterPanel } from './components/FilterPanel';
import { PropertyTable } from './components/PropertyTable';
import { PropertyCardList } from './components/PropertyCardList';
import { PropertyMap } from './components/PropertyMap';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { PropertyFormModal } from './components/PropertyFormModal';
import { DivarAlertsModal, matchItemWithAlert } from './components/DivarAlertsModal';
import { Pagination } from './components/Pagination';
import { exportToExcel } from './utils/excelUtils';
import { normalizePersianText, toPersianDigits } from './utils/formatters';
import { getTimeCutoffMs } from './utils/divarCrawler';
import { playNotificationChime } from './utils/audioAlert';
import {
  getCurrentUser,
  setCurrentUser,
  logout as logoutUser,
  getUsers,
  updateUser,
  createUser,
  getUsersForAccount,
  getAccountOwner,
  getUserPrimaryDashboard,
  getAdminUser,
  getAdminPrimaryDashboard,
  getUserDashboards,
  saveSingleDashboard,
  createDashboard as createNewDashboard,
  deleteDashboard as deleteExistingDashboard,
  renameDashboard as renameExistingDashboard,
  getActiveDashboardId,
  setActiveDashboardId,
} from './utils/userStorage';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Trash2,
  X,
  ChevronUp,
  BellRing,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  PlusCircle,
  Plus,
  Upload,
  Download,
  RefreshCw,
  ArrowUp,
  Menu,
  FileSpreadsheet,
} from 'lucide-react';

const INITIAL_FILTER: FilterState = {
  searchQuery: '',
  transactionType: 'all',
  propertyTypes: [],
  minPrice: null,
  maxPrice: null,
  minDeposit: null,
  maxDeposit: null,
  minRent: null,
  maxRent: null,
  minArea: null,
  maxArea: null,
  rooms: [],
  documentTypes: [],
  orientations: [],
  facades: [],
  parking: 'all',
  elevator: 'all',
  storage: 'all',
  minAge: null,
  maxAge: null,
  minFloor: null,
  maxFloor: null,
};

export default function App() {
  // 1. Authentication State
  const [currentUser, setLoggedInUser] = useState<AppUser | null>(() => getCurrentUser());
  const [currentScreen, setCurrentScreen] = useState<'login' | 'admin' | 'workspace'>(() => {
    const user = getCurrentUser();
    if (!user) return 'login';
    if (user.role === 'admin' || user.username === 'hesam') return 'admin';
    return 'workspace';
  });

  // Target workspace user (when admin is previewing another user's workspace)
  const [workspaceUser, setWorkspaceUser] = useState<AppUser | null>(() => getCurrentUser());

  // 2. Dashboards State for current workspace user (max dashboards per user)
  const [userDashboards, setUserDashboards] = useState<UserDashboard[]>([]);
  const [activeDashboardId, setActiveDashId] = useState<string>('');
  const [isHamburgerOpen, setIsHamburgerOpen] = useState<boolean>(false);

  // User Management & Permissions (Admin controls user customizations)
  const [allUsers, setAllUsers] = useState<AppUser[]>(() => getUsers());
  const refreshAllUsers = useCallback(() => {
    setAllUsers(getUsers());
  }, []);

  // Account Owner and Teammates for current user
  const accountOwner = useMemo(() => {
    if (!currentUser) return null;
    return getAccountOwner(currentUser.accountId || 'acc_ali') || null;
  }, [currentUser, allUsers]);

  const accountMembers = useMemo(() => {
    if (!currentUser) return [];
    return getUsersForAccount(currentUser.accountId || 'acc_ali', currentUser.username);
  }, [currentUser, allUsers]);

  // Shared Excel state (Supports viewing Ali's Excel or teammates' Excels e.g. Hamed, Reza)
  const [activeSharedUserId, setActiveSharedUserId] = useState<string | null>(null);

  const activeSharedUser = useMemo(() => {
    if (!activeSharedUserId) return null;
    return allUsers.find((u) => u.id === activeSharedUserId) || null;
  }, [activeSharedUserId, allUsers]);

  const activeSharedDashboard = useMemo(() => {
    if (!activeSharedUserId) return null;
    return getUserPrimaryDashboard(activeSharedUserId);
  }, [activeSharedUserId, allUsers]);

  // Active dashboard instance (either personal dashboard or shared user's dashboard)
  const activeDashboard = useMemo(() => {
    if (activeSharedUserId && activeSharedDashboard) {
      return activeSharedDashboard;
    }
    return (
      userDashboards.find((d) => d.id === activeDashboardId) ||
      userDashboards[0] ||
      null
    );
  }, [activeSharedUserId, activeSharedDashboard, userDashboards, activeDashboardId]);

  // Load dashboards whenever workspaceUser changes
  const reloadDashboards = useCallback((userId: string, targetDashId?: string) => {
    const list = getUserDashboards(userId);
    setUserDashboards(list);
    const activeId = targetDashId || getActiveDashboardId(userId) || (list[0] ? list[0].id : '');
    setActiveDashId(activeId);
  }, []);

  useEffect(() => {
    if (workspaceUser) {
      reloadDashboards(workspaceUser.id);
    }
  }, [workspaceUser, reloadDashboards]);

  // Mode: Straight forward to 'excel', with 'divar' as an option in hamburger menu
  const [currentMode, setCurrentMode] = useState<'excel' | 'divar'>('excel');

  // Excel dataset state (isolated per active dashboard) - empty at first
  const [excelData, setExcelData] = useState<RealEstateItem[]>([]);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [showExcelDropzone, setShowExcelDropzone] = useState<boolean>(false);
  const [hasExcelModifications, setHasExcelModifications] = useState<boolean>(false);
  const [propertyToDelete, setPropertyToDelete] = useState<RealEstateItem | null>(null);

  // Divar dataset state
  const [divarData, setDivarData] = useState<RealEstateItem[]>(DIVAR_NAJAFABAD_24H_DATA);
  const [divarMeta, setDivarMeta] = useState<DivarFetchMeta | null>(DIVAR_METADATA);
  const [isLoadingDivar, setIsLoadingDivar] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [divarTimeRange, setDivarTimeRange] = useState<DivarTimeRange>('24h');

  // Divar Alerts (گوش‌به‌زنگ)
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [divarAlerts, setDivarAlerts] = useState<DivarAlert[]>([]);
  const [alertsInitialFilter, setAlertsInitialFilter] = useState<FilterState | null>(null);
  const [alertsInitialItem, setAlertsInitialItem] = useState<RealEstateItem | null>(null);

  // Synchronize component states whenever active dashboard changes
  useEffect(() => {
    if (activeDashboard) {
      setExcelData(Array.isArray(activeDashboard.excelData) ? activeDashboard.excelData : []);
      setExcelFileName(activeDashboard.excelFileName || '');
      setHasExcelModifications(activeDashboard.hasExcelModifications || false);
      if (activeDashboard.divarTimeRange) {
        setDivarTimeRange(activeDashboard.divarTimeRange);
      }
      if (activeDashboard.divarAlerts) {
        setDivarAlerts(activeDashboard.divarAlerts);
      }
    }
  }, [activeDashboard?.id]);

  // Save current dashboard state to storage (routes to shared user dashboard if viewing shared Excel)
  const persistActiveDashboard = useCallback(
    (updates: Partial<UserDashboard>) => {
      if (activeSharedUserId && activeSharedDashboard) {
        const updated: UserDashboard = {
          ...activeSharedDashboard,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveSingleDashboard(activeSharedUserId, updated);
        refreshAllUsers();
        return;
      }

      if (!workspaceUser || !activeDashboard) return;
      const updated: UserDashboard = {
        ...activeDashboard,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveSingleDashboard(workspaceUser.id, updated);
      setUserDashboards((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );
    },
    [workspaceUser, activeDashboard, activeSharedUserId, activeSharedDashboard, refreshAllUsers]
  );

  // Property Form Modal for Excel CRUD
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState<boolean>(false);
  const [propertyToEdit, setPropertyToEdit] = useState<RealEstateItem | null>(null);

  // Shared UI & Filter state
  const [filter, setFilter] = useState<FilterState>(INITIAL_FILTER);
  const [sortField, setSortField] = useState<SortField>('rowNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [activeView, setActiveView] = useState<'table' | 'cards' | 'map'>('cards');
  const [usePersianDigits, setUsePersianDigits] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<RealEstateItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'alert';
  } | null>(null);

  // Auto-switch to cards view on mobile screens
  useEffect(() => {
    if (window.innerWidth < 768) {
      setActiveView('cards');
    }
  }, []);

  const showToast = useCallback(
    (text: string, type: 'success' | 'error' | 'alert' = 'success') => {
      setToastMessage({ text, type });
      setTimeout(() => {
        setToastMessage(null);
      }, 4500);
    },
    []
  );

  // Fetch live Divar data
  const fetchLiveDivar = useCallback(
    async (timeRange = divarTimeRange) => {
      setIsLoadingDivar(true);
      try {
        const res = await fetch(`/api/divar/najafabad-24h?timeRange=${timeRange}&refresh=true`);
        if (!res.ok) {
          throw new Error(`خطای سرور: ${res.status}`);
        }
        const json = await res.json();
        if (json && Array.isArray(json.items) && json.items.length > 0) {
          setDivarData(json.items);
          if (json.metadata) {
            setDivarMeta(json.metadata);
          }
          setLastSyncedAt(new Date());
          showToast(`دریافت شد: ${toPersianDigits(json.items.length)} آگهی اخیر نجف‌آباد از دیوار`, 'success');
        } else {
          showToast('اطلاعات آگهی‌های دیوار بروزرسانی شد.', 'success');
        }
      } catch (err: any) {
        console.warn('Error fetching live Divar data:', err);
        showToast('عدم دسترسی موقت به دیوار، از دیتای پشتیبان استفاده شد.', 'alert');
      } finally {
        setIsLoadingDivar(false);
      }
    },
    [divarTimeRange, showToast]
  );

  // Auth Handlers
  const handleLoginSuccess = (user: AppUser) => {
    setLoggedInUser(user);
    setWorkspaceUser(user);
    if (user.role === 'admin' || user.username === 'hesam') {
      setCurrentScreen('admin');
      showToast(`خوش آمدید حسام عزیز! وارد پنل مدیریت شدید.`, 'success');
    } else {
      setCurrentScreen('workspace');
      setCurrentMode('excel');
      reloadDashboards(user.id);
      showToast(`خوش آمدید ${user.displayName}! وارد داشبورد شدید.`, 'success');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setLoggedInUser(null);
    setWorkspaceUser(null);
    setCurrentScreen('login');
    setIsHamburgerOpen(false);
    showToast('با موفقیت از حساب کاربری خارج شدید.', 'success');
  };

  const handleEnterWorkspace = (targetUser: AppUser) => {
    setWorkspaceUser(targetUser);
    setCurrentScreen('workspace');
    setCurrentMode('excel');
    reloadDashboards(targetUser.id);
  };

  // Dashboard Management Handlers
  const handleSelectDashboard = (dashboardId: string) => {
    setActiveSharedUserId(null);
    if (!workspaceUser) return;
    setActiveDashboardId(workspaceUser.id, dashboardId);
    setActiveDashId(dashboardId);
    setCurrentPage(1);
    const target = userDashboards.find((d) => d.id === dashboardId);
    if (target) {
      showToast(`داشبورد «${target.title}» بارگذاری شد.`, 'success');
    }
  };

  const handleSelectSharedExcel = (userId: string) => {
    setActiveSharedUserId(userId);
    setCurrentMode('excel');
    setCurrentPage(1);
    const target = allUsers.find((u) => u.id === userId);
    showToast(`اکسل اشتراکی «${target?.displayName || 'همکار'}» بارگذاری شد.`, 'success');
  };

  const handleCreateAccountMember = (data: {
    username: string;
    password: string;
    displayName: string;
  }) => {
    const res = createUser({
      username: data.username,
      password: data.password,
      displayName: data.displayName,
      accountId: currentUser?.accountId || 'acc_ali',
      accountOwnerUsername: currentUser?.username,
    });
    refreshAllUsers();
    showToast(res.message, res.success ? 'success' : 'error');
  };

  // Shared Excels available in this account for the logged-in user
  const sharedExcels: SharedExcelOption[] = useMemo(() => {
    if (!currentUser) return [];
    const list: SharedExcelOption[] = [];

    // 1. Account Owner's Excel (Ali's Excel) - available if user is not Ali and canViewAdminExcel is true
    if (
      accountOwner &&
      accountOwner.id !== currentUser.id &&
      currentUser.permissions?.canViewAdminExcel
    ) {
      const ownerDash = getUserPrimaryDashboard(accountOwner.id);
      if (ownerDash) {
        list.push({
          userId: accountOwner.id,
          ownerName: accountOwner.displayName,
          title: ownerDash.title || `اکسل مدیر (${accountOwner.displayName})`,
          itemCount: ownerDash.excelData?.length || 0,
          isAccountAdmin: true,
          canAdd: Boolean(currentUser.permissions?.canAddToAdminExcel),
        });
      }
    }

    // 2. Cross-Member Excels (Reza seeing Hamed's Excel, Hamed seeing Reza's Excel)
    const allowedIds = currentUser.permissions?.allowedUserExcelIds || [];
    allowedIds.forEach((teammateId) => {
      if (teammateId !== currentUser.id && teammateId !== accountOwner?.id) {
        const teammate = allUsers.find((u) => u.id === teammateId);
        if (teammate) {
          const teamDash = getUserPrimaryDashboard(teammate.id);
          if (teamDash) {
            list.push({
              userId: teammate.id,
              ownerName: teammate.displayName,
              title: teamDash.title || `اکسل ${teammate.displayName}`,
              itemCount: teamDash.excelData?.length || 0,
              isAccountAdmin: false,
              canAdd: false,
            });
          }
        }
      }
    });

    return list;
  }, [currentUser, accountOwner, allUsers]);

  const handleUpdateUser = useCallback(
    (userId: string, updates: Partial<AppUser>) => {
      const res = updateUser(userId, updates);
      refreshAllUsers();
      if (res.user && workspaceUser?.id === userId) {
        setWorkspaceUser(res.user);
      }
      if (res.user && currentUser?.id === userId) {
        setLoggedInUser(res.user);
      }
      showToast(res.message, res.success ? 'success' : 'error');
    },
    [workspaceUser, currentUser, refreshAllUsers, showToast]
  );

  // Permission checkers based on Admin customizations
  const canSeeAdminPanel = Boolean(
    currentUser?.role === 'superadmin' ||
    currentUser?.role === 'account_admin' ||
    currentUser?.username === 'ali' ||
    currentUser?.username === 'hesam' ||
    currentUser?.permissions?.canAccessAdminPanel
  );

  const canAddProperty = useMemo(() => {
    if (!activeSharedUserId) return true; // personal dashboard
    if (currentUser?.username === 'hesam') return true;
    if (accountOwner && activeSharedUserId === accountOwner.id) {
      if (currentUser?.id === accountOwner.id) return true;
      return Boolean(currentUser?.permissions?.canAddToAdminExcel);
    }
    return false; // other teammate's excel is view-only
  }, [activeSharedUserId, accountOwner, currentUser]);

  const canEditProperty = useCallback(
    (item: RealEstateItem): boolean => {
      if (!activeSharedUserId) return true; // personal dashboard
      if (currentUser?.username === 'hesam') return true;
      if (accountOwner && activeSharedUserId === accountOwner.id) {
        if (currentUser?.id === accountOwner.id) return true;
        if (currentUser?.permissions?.canEditOthersItemsInAdminExcel) return true;
        return Boolean(item.createdByUserId && item.createdByUserId === currentUser?.id);
      }
      return false;
    },
    [activeSharedUserId, accountOwner, currentUser]
  );

  const canDeleteProperty = useCallback(
    (item: RealEstateItem): boolean => {
      if (!activeSharedUserId) return true;
      if (currentUser?.username === 'hesam') return true;
      if (accountOwner && activeSharedUserId === accountOwner.id) {
        if (currentUser?.id === accountOwner.id) return true;
        if (currentUser?.permissions?.canDeleteFromAdminExcel) return true;
        return Boolean(item.createdByUserId && item.createdByUserId === currentUser?.id);
      }
      return false;
    },
    [activeSharedUserId, accountOwner, currentUser]
  );

  const handleCreateDashboard = (title?: string) => {
    if (!workspaceUser) return;
    const res = createNewDashboard(workspaceUser.id, title);
    if (res.success && res.dashboard) {
      reloadDashboards(workspaceUser.id, res.dashboard.id);
      showToast(`داشبورد جدید «${res.dashboard.title}» ایجاد شد.`, 'success');
    } else {
      showToast(res.message || 'خطا در ایجاد داشبورد', 'error');
    }
  };

  const handleDeleteDashboard = (dashboardId: string) => {
    if (!workspaceUser) return;
    const res = deleteExistingDashboard(workspaceUser.id, dashboardId);
    if (res.success) {
      reloadDashboards(workspaceUser.id, res.nextActiveId);
      showToast('داشبورد با موفقیت حذف شد.', 'success');
    } else {
      showToast(res.message || 'خطا در حذف داشبورد', 'error');
    }
  };

  const handleRenameDashboard = (dashboardId: string, newTitle: string) => {
    if (!workspaceUser) return;
    renameExistingDashboard(workspaceUser.id, dashboardId, newTitle);
    reloadDashboards(workspaceUser.id, dashboardId);
    showToast('نام داشبورد تغییر یافت.', 'success');
  };

  // Excel handlers (synced with activeDashboard)
  const handleExcelDataLoaded = (items: RealEstateItem[], fileName: string) => {
    setExcelData(items);
    setExcelFileName(fileName);
    setHasExcelModifications(true);
    setShowExcelDropzone(false);
    setCurrentPage(1);
    persistActiveDashboard({
      excelData: items,
      excelFileName: fileName,
      hasExcelModifications: true,
    });
    showToast(`فایل «${fileName}» با ${toPersianDigits(items.length)} ملک بارگذاری و در این داشبورد ذخیره شد.`, 'success');
  };

  const handleOpenAddPropertyModal = () => {
    if (activeSharedUserId && !canAddProperty) {
      showToast('شما مجوز افزودن ملک به این اکسل را ندارید.', 'error');
      return;
    }
    setPropertyToEdit(null);
    setIsPropertyFormOpen(true);
  };

  const handleOpenEditPropertyModal = (item: RealEstateItem) => {
    if (!canEditProperty(item)) {
      showToast('شما فقط مجاز به ویرایش املاکی هستید که خودتان ثبت کرده‌اید.', 'error');
      return;
    }
    setPropertyToEdit(item);
    setIsPropertyFormOpen(true);
  };

  const handleSaveProperty = (propertyData: Partial<RealEstateItem>) => {
    let updated: RealEstateItem[];
    if (propertyToEdit) {
      updated = excelData.map((item) =>
        item.id === propertyToEdit.id ? ({ ...item, ...propertyData } as RealEstateItem) : item
      );
      showToast('ملک با موفقیت در این داشبورد ویرایش شد.', 'success');
    } else {
      const newId = excelData.length > 0 ? Math.max(...excelData.map((i) => i.id)) + 1 : 1;
      const newRowNumber = excelData.length + 1;
      const newItem = {
        ...propertyData,
        id: newId,
        rowNumber: newRowNumber,
        source: 'excel',
        createdByUserId: currentUser?.id,
        createdByUsername: currentUser?.displayName || currentUser?.username,
      } as RealEstateItem;
      updated = [newItem, ...excelData];
      showToast('ملک جدید به این داشبورد اضافه شد.', 'success');
    }
    setExcelData(updated);
    setHasExcelModifications(true);
    setIsPropertyFormOpen(false);
    persistActiveDashboard({
      excelData: updated,
      hasExcelModifications: true,
    });
  };

  const handleDeleteProperty = (itemToDelete: RealEstateItem) => {
    if (!canDeleteProperty(itemToDelete)) {
      showToast('شما مجوز حذف این ملک را ندارید.', 'error');
      return;
    }
    setPropertyToDelete(itemToDelete);
  };

  const confirmDeleteProperty = () => {
    if (!propertyToDelete) return;
    const updated = excelData.filter((i) => i.id !== propertyToDelete.id);
    setExcelData(updated);
    setHasExcelModifications(true);
    persistActiveDashboard({
      excelData: updated,
      hasExcelModifications: true,
    });
    showToast(`ملک ردیف ${toPersianDigits(propertyToDelete.rowNumber)} با موفقیت حذف شد.`, 'success');
    setPropertyToDelete(null);
  };

  const handleExportFiltered = () => {
    const listToExport = filteredAndSortedItems;
    if (listToExport.length === 0) {
      showToast('هیچ ملکی برای استخراج وجود ندارد.', 'error');
      return;
    }
    const filename =
      currentMode === 'divar'
        ? `آگهی_های_دیوار_نجف_آباد_${divarTimeRange}.xlsx`
        : activeDashboard
        ? `خروجی_${activeDashboard.title.replace(/\s+/g, '_')}.xlsx`
        : 'املاک_نجف_آباد.xlsx';

    exportToExcel(listToExport, filename);
    showToast(`فایل «${filename}» با ${toPersianDigits(listToExport.length)} رکورد دانلود شد.`, 'success');
  };

  const handleResetData = () => {
    setFilter(INITIAL_FILTER);
    setCurrentPage(1);
    showToast('فیلترها بازنشانی شدند.', 'success');
  };

  // Add single Divar item directly into Excel sheet
  const handleAddDivarItemToExcel = useCallback(
    (item: RealEstateItem) => {
      const alreadyExists = excelData.some(
        (ex) =>
          (ex.divarToken && ex.divarToken === item.divarToken) ||
          (ex.title === item.title && ex.address === item.address)
      );
      if (alreadyExists) {
        showToast(`ملک «${item.title}» قبلاً در جدول اکسل شما ذخیره شده است.`, 'alert');
        return;
      }

      const newId = excelData.length > 0 ? Math.max(...excelData.map((i) => i.id)) + 1 : 1;
      const newRowNumber = excelData.length + 1;

      const newItem: RealEstateItem = {
        ...item,
        id: newId,
        rowNumber: newRowNumber,
        source: 'excel',
      };

      const updated = [newItem, ...excelData];
      setExcelData(updated);
      setHasExcelModifications(true);
      persistActiveDashboard({
        excelData: updated,
        hasExcelModifications: true,
      });

      showToast(`ملک «${item.title}» مستقیماً به جدول اکسل افزوده شد!`, 'success');
    },
    [excelData, persistActiveDashboard, showToast]
  );

  // Add multiple Divar items from an alert result directly into Excel sheet
  const handleAddMultipleDivarItemsToExcel = useCallback(
    (itemsToAdd: RealEstateItem[]) => {
      const itemsToInsert: RealEstateItem[] = [];
      for (const item of itemsToAdd) {
        const alreadyExists = excelData.some(
          (ex) =>
            (ex.divarToken && item.divarToken && ex.divarToken === item.divarToken) ||
            (ex.title === item.title && ex.address === item.address)
        );
        if (!alreadyExists) {
          itemsToInsert.push(item);
        }
      }

      if (itemsToInsert.length === 0) {
        showToast('تمام این املاک قبلاً در جدول اکسل شما ذخیره شده‌اند.', 'alert');
        return;
      }

      const startId = excelData.length > 0 ? Math.max(...excelData.map((i) => i.id)) : 0;
      let curRow = excelData.length;
      const formattedNew: RealEstateItem[] = itemsToInsert.map((item, idx) => ({
        ...item,
        id: startId + idx + 1,
        rowNumber: curRow + idx + 1,
        source: 'excel',
      }));

      const newExcelData = [...formattedNew, ...excelData];
      setExcelData(newExcelData);
      setHasExcelModifications(true);
      persistActiveDashboard({
        excelData: newExcelData,
        hasExcelModifications: true,
      });

      showToast(`${toPersianDigits(itemsToInsert.length)} ملک با موفقیت به جدول اکسل اضافه شد!`, 'success');
    },
    [excelData, persistActiveDashboard, showToast]
  );

  const handleOpenAlertsWithCurrentFilters = useCallback(() => {
    setAlertsInitialFilter(filter);
    setAlertsInitialItem(null);
    setIsAlertsModalOpen(true);
  }, [filter]);

  const handleOpenAlertsWithItem = useCallback((item: RealEstateItem) => {
    setAlertsInitialItem(item);
    setAlertsInitialFilter(null);
    setIsAlertsModalOpen(true);
  }, []);

  // Active dataset depending on mode
  const activeDataset = useMemo(() => {
    return currentMode === 'divar' ? divarData : excelData;
  }, [currentMode, divarData, excelData]);

  // Unique types, documents, facades, orientations for filter options
  const availablePropertyTypes = useMemo(() => {
    const set = new Set<string>();
    activeDataset.forEach((item) => {
      if (item.propertyType) set.add(item.propertyType);
    });
    return Array.from(set);
  }, [activeDataset]);

  const availableDocumentTypes = useMemo(() => {
    const set = new Set<string>();
    activeDataset.forEach((item) => {
      if (item.documentType) set.add(item.documentType);
    });
    return Array.from(set);
  }, [activeDataset]);

  const availableFacades = useMemo(() => {
    const set = new Set<string>();
    activeDataset.forEach((item) => {
      if (item.facade) set.add(item.facade);
    });
    return Array.from(set);
  }, [activeDataset]);

  const availableOrientations = useMemo(() => {
    const set = new Set<string>();
    activeDataset.forEach((item) => {
      if (item.orientation) set.add(item.orientation);
    });
    return Array.from(set);
  }, [activeDataset]);

  // Filtered and Sorted items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...activeDataset];

    // 1. Time range filter (Divar mode)
    if (currentMode === 'divar' && divarTimeRange !== 'all') {
      const cutoffMs = getTimeCutoffMs(divarTimeRange);
      if (cutoffMs > 0) {
        const threshold = Date.now() - cutoffMs;
        result = result.filter((item) => {
          if (!item.publishedAt) return true;
          const pubTime = new Date(item.publishedAt).getTime();
          return pubTime >= threshold;
        });
      }
    }

    // 2. Search Query
    if (filter.searchQuery.trim()) {
      const q = normalizePersianText(filter.searchQuery);
      result = result.filter((item) => {
        const addr = normalizePersianText(item.address || '');
        const title = normalizePersianText(item.title || '');
        const dist = normalizePersianText(item.district || '');
        const type = normalizePersianText(item.propertyType || '');
        return addr.includes(q) || title.includes(q) || dist.includes(q) || type.includes(q);
      });
    }

    // 3. Transaction Type
    if (filter.transactionType !== 'all') {
      result = result.filter((item) => item.transactionType === filter.transactionType);
    }

    // 4. Property Types
    if (filter.propertyTypes.length > 0) {
      result = result.filter((item) => filter.propertyTypes.includes(item.propertyType));
    }

    // 5. Price range (for sale)
    if (filter.minPrice !== null) {
      result = result.filter((item) => item.price >= (filter.minPrice || 0));
    }
    if (filter.maxPrice !== null) {
      result = result.filter((item) => item.price <= (filter.maxPrice || Infinity));
    }

    // 6. Deposit / Rent range
    if (filter.minDeposit !== null) {
      result = result.filter((item) => (item.deposit || 0) >= (filter.minDeposit || 0));
    }
    if (filter.maxDeposit !== null) {
      result = result.filter((item) => (item.deposit || 0) <= (filter.maxDeposit || Infinity));
    }
    if (filter.minRent !== null) {
      result = result.filter((item) => (item.rent || 0) >= (filter.minRent || 0));
    }
    if (filter.maxRent !== null) {
      result = result.filter((item) => (item.rent || 0) <= (filter.maxRent || Infinity));
    }

    // 7. Area range
    if (filter.minArea !== null) {
      result = result.filter((item) => item.area !== undefined && item.area >= (filter.minArea || 0));
    }
    if (filter.maxArea !== null) {
      result = result.filter((item) => item.area !== undefined && item.area <= (filter.maxArea || Infinity));
    }

    // 8. Rooms
    if (filter.rooms.length > 0) {
      result = result.filter((item) => item.rooms !== undefined && filter.rooms.includes(item.rooms));
    }

    // 9. Document Types
    if (filter.documentTypes.length > 0) {
      result = result.filter((item) => Boolean(item.documentType && filter.documentTypes.includes(item.documentType)));
    }

    // 10. Orientations
    if (filter.orientations.length > 0) {
      result = result.filter((item) => Boolean(item.orientation && filter.orientations.includes(item.orientation)));
    }

    // 11. Facades
    if (filter.facades.length > 0) {
      result = result.filter((item) => Boolean(item.facade && filter.facades.includes(item.facade)));
    }

    // 12. Facilities
    if (filter.parking !== 'all') {
      const val = filter.parking === 'yes';
      result = result.filter((item) => item.hasParking === val);
    }
    if (filter.elevator !== 'all') {
      const val = filter.elevator === 'yes';
      result = result.filter((item) => item.hasElevator === val);
    }
    if (filter.storage !== 'all') {
      const val = filter.storage === 'yes';
      result = result.filter((item) => item.hasStorage === val);
    }

    // 13. Age
    if (filter.minAge !== null) {
      result = result.filter((item) => item.age !== undefined && item.age >= (filter.minAge || 0));
    }
    if (filter.maxAge !== null) {
      result = result.filter((item) => item.age !== undefined && item.age <= (filter.maxAge || Infinity));
    }

    // 14. Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'age') {
        valA = a.builtYear ?? (a.age !== undefined ? (a.age > 1300 ? a.age : a.age === 0 ? 1403 : 1403 - a.age) : 0);
        valB = b.builtYear ?? (b.age !== undefined ? (b.age > 1300 ? b.age : b.age === 0 ? 1403 : 1403 - b.age) : 0);
      } else if (sortField === 'pricePerMeter') {
        valA = a.price && a.area ? a.price / a.area : 0;
        valB = b.price && b.area ? b.price / b.area : 0;
      }

      if (valA === undefined || valA === null) valA = 0;
      if (valB === undefined || valB === null) valB = 0;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [activeDataset, currentMode, divarTimeRange, filter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedItems.slice(start, start + pageSize);
  }, [filteredAndSortedItems, currentPage, pageSize]);

  // Alert matching (Divar)
  const matchedAlertItems = useMemo(() => {
    if (divarAlerts.length === 0) return [];
    const activeList = divarAlerts.filter((a) => a.enabled);
    if (activeList.length === 0) return [];

    return divarData.filter((item) => activeList.some((alert) => matchItemWithAlert(item, alert)));
  }, [divarAlerts, divarData]);

  // Automated matching and auto-add to Excel for alerts with autoAddToExcel: true
  useEffect(() => {
    if (divarAlerts.length === 0 || divarData.length === 0) return;

    const activeAutoExcelAlerts = divarAlerts.filter((a) => a.enabled && a.autoAddToExcel);
    if (activeAutoExcelAlerts.length === 0) return;

    let newlyAddedItems: RealEstateItem[] = [];
    let alertsUpdated = false;
    const updatedAlerts = [...divarAlerts];

    for (let i = 0; i < updatedAlerts.length; i++) {
      const alert = updatedAlerts[i];
      if (!alert.enabled || !alert.autoAddToExcel) continue;

      const notifiedIds = new Set(alert.notifiedItemIds || []);
      const matchingItems = divarData.filter((item) => matchItemWithAlert(item, alert));

      for (const item of matchingItems) {
        const itemKey = item.divarToken || String(item.id);
        if (!notifiedIds.has(itemKey)) {
          notifiedIds.add(itemKey);
          alertsUpdated = true;

          const existsInExcel = excelData.some(
            (ex) =>
              (ex.divarToken && ex.divarToken === item.divarToken) ||
              (ex.title === item.title && ex.address === item.address)
          );

          if (!existsInExcel) {
            newlyAddedItems.push(item);
          }
        }
      }
      alert.notifiedItemIds = Array.from(notifiedIds);
    }

    if (newlyAddedItems.length > 0) {
      const startId = excelData.length > 0 ? Math.max(...excelData.map((i) => i.id)) : 0;
      let curRow = excelData.length;
      const formattedNewItems: RealEstateItem[] = newlyAddedItems.map((item, idx) => ({
        ...item,
        id: startId + idx + 1,
        rowNumber: curRow + idx + 1,
        source: 'excel',
      }));

      const newExcelData = [...formattedNewItems, ...excelData];
      setExcelData(newExcelData);
      setHasExcelModifications(true);
      persistActiveDashboard({
        excelData: newExcelData,
        hasExcelModifications: true,
        divarAlerts: updatedAlerts,
      });

      playNotificationChime();
      showToast(
        `🔔 گوش‌به‌زنگ: ${toPersianDigits(newlyAddedItems.length)} ملک منطبق در دیوار پیدا و خودکار به جدول اکسل اضافه شد!`,
        'success'
      );

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('گوش‌به‌زنگ دیوار: ملک جدید به اکسل اضافه شد', {
          body: `${newlyAddedItems[0].title} مطابق فیلترهای گوش‌به‌زنگ شما پیدا شد.`,
        });
      }
    } else if (alertsUpdated) {
      persistActiveDashboard({ divarAlerts: updatedAlerts });
    }
  }, [divarData, divarAlerts, excelData, persistActiveDashboard, showToast]);

  // SCREEN 1: LOGIN PAGE (If user is not logged in)
  if (!currentUser || currentScreen === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // SCREEN 2: ADMIN PANEL (If hesam admin is viewing Admin Panel)
  if (currentScreen === 'admin') {
    return (
      <AdminPanel
        currentUser={currentUser}
        onLogout={handleLogout}
        onEnterUserWorkspace={handleEnterWorkspace}
      />
    );
  }

  // SCREEN 3: WORKSPACE (Straightforward into Excel mode, Divar in hamburger menu)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Vazirmatn',sans-serif] overflow-x-hidden w-full max-w-full">
      {/* Top Navigation Bar */}
      <Navbar
        currentMode={currentMode}
        onSwitchMode={(m) => {
          setCurrentMode(m);
          setCurrentPage(1);
        }}
        onResetData={handleResetData}
        activeView={activeView}
        onToggleView={setActiveView}
        usePersianDigits={usePersianDigits}
        onTogglePersianDigits={() => setUsePersianDigits((prev) => !prev)}
        totalItems={activeDataset.length}
        filteredCount={filteredAndSortedItems.length}
        isFilterOpenMobile={isMobileFilterOpen}
        onToggleFilterMobile={() => setIsMobileFilterOpen((prev) => !prev)}
        onRefreshDivar={currentMode === 'divar' ? () => fetchLiveDivar(divarTimeRange) : undefined}
        isRefreshingDivar={isLoadingDivar}
        onExportExcel={handleExportFiltered}
        onUploadNewExcel={
          currentMode === 'excel' ? () => setShowExcelDropzone((prev) => !prev) : undefined
        }
        onAddNewProperty={currentMode === 'excel' ? handleOpenAddPropertyModal : undefined}
        onOpenAlertsModal={currentMode === 'divar' ? () => setIsAlertsModalOpen(true) : undefined}
        activeAlertsCount={divarAlerts.filter((a) => a.enabled).length}
        matchedAlertsCount={matchedAlertItems.length}
        excelFileName={excelFileName}
        searchQuery={filter.searchQuery}
        onSearchChange={(q) => {
          setFilter((prev) => ({ ...prev, searchQuery: q }));
          setCurrentPage(1);
        }}
        onOpenHamburgerMenu={() => setIsHamburgerOpen(true)}
        activeDashboardTitle={
          activeSharedUserId
            ? (activeDashboard?.title || 'اکسل اشتراکی')
            : activeDashboard?.title
        }
        currentUserName={workspaceUser?.displayName}
        isAdmin={canSeeAdminPanel}
        onOpenAdminPanel={canSeeAdminPanel ? () => setCurrentScreen('admin') : undefined}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 sm:pb-8">
        {/* Banner for Shared Excel viewing */}
        {activeSharedUserId && currentMode === 'excel' && (
          <div className="bg-amber-50/90 border border-amber-300 text-amber-950 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-bold mb-5 shadow-xs animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-amber-900">
                    در حال مشاهده: {activeDashboard?.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-950 border border-amber-300">
                    اکسل اشتراکی
                  </span>
                </div>
                <div className="text-[11px] text-amber-800 font-normal mt-0.5">
                  مالک فایل: {activeSharedUser?.displayName} (@{activeSharedUser?.username}) •
                  {canAddProperty ? ' شما مجاز به ثبت ملک جدید در این اکسل هستید.' : ' فقط مشاهده املاک.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveSharedUserId(null);
                showToast('به داشبورد شخصی خود بازگشتید.', 'success');
              }}
              className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 cursor-pointer shadow-2xs transition-all text-center"
            >
              بازگشت به داشبورد شخصی من
            </button>
          </div>
        )}

        {/* Banner */}
        {currentMode === 'divar' ? (
          <DivarSyncBanner
            metadata={divarMeta}
            totalItems={divarData.length}
            filteredItemsCount={filteredAndSortedItems.length}
            isLoading={isLoadingDivar}
            onRefresh={() => fetchLiveDivar(divarTimeRange)}
            onExportExcel={handleExportFiltered}
            usePersianDigits={usePersianDigits}
            lastSyncedAt={lastSyncedAt}
            currentTimeRange={divarTimeRange}
            onTimeRangeChange={(range) => {
              setDivarTimeRange(range);
              fetchLiveDivar(range);
              persistActiveDashboard({ divarTimeRange: range });
            }}
            onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
            matchedAlertsCount={matchedAlertItems.length}
          />
        ) : (
          /* Expandable Excel File Upload Dropzone (shown on request or when dashboard is empty) */
          (showExcelDropzone || excelData.length === 0) ? (
            <div className="relative mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  بارگذاری فایل اکسل در داشبورد فعلی ({activeDashboard?.title}):
                </span>
                {excelData.length > 0 && (
                  <button
                    onClick={() => setShowExcelDropzone(false)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span>بستن باکس آپلود</span>
                  </button>
                )}
              </div>
              <UploadDropzone
                onDataLoaded={handleExcelDataLoaded}
                currentFileName={excelFileName}
                totalLoadedItems={excelData.length}
                usePersianDigits={usePersianDigits}
              />
            </div>
          ) : null
        )}

        {/* Stats Overview */}
        <StatsOverview
          items={filteredAndSortedItems}
          totalUploaded={activeDataset.length}
          usePersianDigits={usePersianDigits}
          selectedTypes={filter.propertyTypes}
          onSelectPropertyType={(type) => {
            const exists = filter.propertyTypes.includes(type);
            const updated = exists
              ? filter.propertyTypes.filter((t) => t !== type)
              : [...filter.propertyTypes, type];
            setFilter({ ...filter, propertyTypes: updated });
            setCurrentPage(1);
          }}
          selectedTransactionType={filter.transactionType}
          onSelectTransactionType={(t) => {
            setFilter({ ...filter, transactionType: t });
            setCurrentPage(1);
          }}
        />

        {/* Content Layout: Sidebar Filter + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-20 max-h-[calc(100vh-6rem)]">
            <FilterPanel
              filter={filter}
              onFilterChange={(newF) => {
                setFilter(newF);
                setCurrentPage(1);
              }}
              onResetFilters={() => {
                setFilter(INITIAL_FILTER);
                setCurrentPage(1);
              }}
              usePersianDigits={usePersianDigits}
              totalFiltered={filteredAndSortedItems.length}
              totalAvailable={activeDataset.length}
              availablePropertyTypes={availablePropertyTypes}
              availableDocumentTypes={availableDocumentTypes}
              availableFacades={availableFacades}
              availableOrientations={availableOrientations}
              isDivarMode={currentMode === 'divar'}
              currentTimeRange={divarTimeRange}
              onTimeRangeChange={(range) => {
                setDivarTimeRange(range);
                fetchLiveDivar(range);
                persistActiveDashboard({ divarTimeRange: range });
              }}
              onSaveFiltersAsAlert={handleOpenAlertsWithCurrentFilters}
            />
          </div>

          {/* Main Results View */}
          <div className="lg:col-span-3 space-y-4">
            {activeView === 'map' ? (
              <PropertyMap
                items={filteredAndSortedItems}
                onSelectProperty={setSelectedItem}
                onAddToExcel={handleAddDivarItemToExcel}
                isExcelMode={currentMode === 'excel'}
                usePersianDigits={usePersianDigits}
              />
            ) : activeView === 'table' ? (
              <PropertyTable
                items={paginatedItems}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                onSelectItem={setSelectedItem}
                usePersianDigits={usePersianDigits}
                onExportExcel={handleExportFiltered}
                filteredCount={filteredAndSortedItems.length}
                isExcelMode={currentMode === 'excel'}
                onAddNewProperty={handleOpenAddPropertyModal}
                onEditItem={handleOpenEditPropertyModal}
                onDeleteItem={handleDeleteProperty}
                onAddToExcel={handleAddDivarItemToExcel}
                canEditItem={canEditProperty}
                canDeleteItem={canDeleteProperty}
              />
            ) : (
              <PropertyCardList
                items={paginatedItems}
                onSelectItem={setSelectedItem}
                usePersianDigits={usePersianDigits}
                isExcelMode={currentMode === 'excel'}
                onEditItem={handleOpenEditPropertyModal}
                onDeleteItem={handleDeleteProperty}
                onAddToExcel={handleAddDivarItemToExcel}
                onAddToAlerts={handleOpenAlertsWithItem}
                canEditItem={canEditProperty}
                canDeleteItem={canDeleteProperty}
              />
            )}

            {/* Pagination: only displayed in table and cards view */}
            {activeView !== 'map' && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredAndSortedItems.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                usePersianDigits={usePersianDigits}
              />
            )}
          </div>
        </div>
      </main>

      {/* Authentic Telegram-style Floating Action Button (FAB) at the bottom corner */}
      {currentMode === 'excel' && canAddProperty ? (
        <div className="fixed bottom-6 left-6 z-40 animate-in zoom-in-75 duration-200">
          <button
            id="telegram-fab-add-property"
            onClick={handleOpenAddPropertyModal}
            className="group relative flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-linear-to-tr from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-90 text-white shadow-xl shadow-emerald-700/40 hover:shadow-2xl hover:shadow-emerald-700/60 transition-all duration-200 cursor-pointer border-2 border-white/50"
            title="افزودن ملک جدید"
            aria-label="افزودن ملک جدید"
          >
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.8] transition-transform duration-200 group-hover:rotate-90" />

            {/* Telegram-style floating label badge on desktop hover */}
            <span className="hidden sm:group-hover:inline-flex absolute right-full mr-3.5 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold whitespace-nowrap shadow-xl backdrop-blur-xs border border-slate-700 pointer-events-none animate-in fade-in">
              + افزودن ملک جدید
            </span>
          </button>
        </div>
      ) : currentMode === 'divar' ? (
        <div className="fixed bottom-6 left-6 z-40 animate-in zoom-in-75 duration-200">
          <button
            id="telegram-fab-divar-alerts"
            onClick={() => setIsAlertsModalOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-linear-to-tr from-amber-500 via-red-500 to-rose-600 hover:from-amber-400 hover:to-red-500 active:scale-90 text-white shadow-xl shadow-red-700/35 hover:shadow-2xl transition-all duration-200 cursor-pointer border-2 border-white/50"
            title="تنظیم گوش‌به‌زنگ و اعلان آگهی‌های دیوار"
            aria-label="گوش‌به‌زنگ"
          >
            <BellRing className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
            {matchedAlertItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[11px] flex items-center justify-center font-black border-2 border-white shadow-xs">
                {usePersianDigits ? toPersianDigits(matchedAlertItems.length) : matchedAlertItems.length}
              </span>
            )}
            <span className="hidden sm:group-hover:inline-flex absolute right-full mr-3.5 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold whitespace-nowrap shadow-xl backdrop-blur-xs border border-slate-700 pointer-events-none animate-in fade-in">
              گوش‌به‌زنگ ملک
            </span>
          </button>
        </div>
      ) : null}

      {/* Hamburger Menu Drawer */}
      {workspaceUser && (
        <HamburgerMenu
          isOpen={isHamburgerOpen}
          onClose={() => setIsHamburgerOpen(false)}
          currentUser={currentUser}
          accountOwner={accountOwner}
          accountMembers={accountMembers}
          currentMode={currentMode}
          onSelectMode={(m) => {
            setCurrentMode(m);
            setCurrentPage(1);
          }}
          dashboards={userDashboards}
          activeDashboardId={activeDashboardId}
          onSelectDashboard={handleSelectDashboard}
          onCreateDashboard={handleCreateDashboard}
          onRenameDashboard={handleRenameDashboard}
          onDeleteDashboard={handleDeleteDashboard}
          onUploadExcel={() => {
            setIsHamburgerOpen(false);
            setShowExcelDropzone(true);
          }}
          onExportExcel={() => {
            setIsHamburgerOpen(false);
            handleExportFiltered();
          }}
          excelItemCount={excelData.length}
          hasExcelModifications={hasExcelModifications}
          allUsers={allUsers}
          onUpdateUser={handleUpdateUser}
          onCreateAccountMember={handleCreateAccountMember}
          sharedExcels={sharedExcels}
          activeSharedUserId={activeSharedUserId}
          onSelectSharedExcel={handleSelectSharedExcel}
          onOpenAdminPanel={
            canSeeAdminPanel
              ? () => {
                  setCurrentScreen('admin');
                  setIsHamburgerOpen(false);
                }
              : undefined
          }
          onLogout={handleLogout}
        />
      )}

      {/* Mobile Filter Drawer / Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-250">
            <FilterPanel
              filter={filter}
              onFilterChange={(newF) => {
                setFilter(newF);
                setCurrentPage(1);
              }}
              onResetFilters={() => {
                setFilter(INITIAL_FILTER);
                setCurrentPage(1);
              }}
              usePersianDigits={usePersianDigits}
              totalFiltered={filteredAndSortedItems.length}
              totalAvailable={activeDataset.length}
              availablePropertyTypes={availablePropertyTypes}
              availableDocumentTypes={availableDocumentTypes}
              availableFacades={availableFacades}
              availableOrientations={availableOrientations}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
              isDivarMode={currentMode === 'divar'}
              currentTimeRange={divarTimeRange}
              onTimeRangeChange={(range) => {
                setDivarTimeRange(range);
                fetchLiveDivar(range);
                persistActiveDashboard({ divarTimeRange: range });
              }}
              onSaveFiltersAsAlert={() => {
                setIsMobileFilterOpen(false);
                handleOpenAlertsWithCurrentFilters();
              }}
            />
          </div>
        </div>
      )}

      {/* Property Detail Modal */}
      <PropertyDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        usePersianDigits={usePersianDigits}
        isExcelMode={currentMode === 'excel'}
        onEditItem={handleOpenEditPropertyModal}
        onAddToExcel={handleAddDivarItemToExcel}
        onAddToAlerts={handleOpenAlertsWithItem}
      />

      {/* Property Form Modal for Excel CRUD */}
      <PropertyFormModal
        isOpen={isPropertyFormOpen}
        onClose={() => setIsPropertyFormOpen(false)}
        onSave={handleSaveProperty}
        initialData={propertyToEdit}
        availablePropertyTypes={availablePropertyTypes}
        availableDocumentTypes={availableDocumentTypes}
        availableFacades={availableFacades}
        availableOrientations={availableOrientations}
        usePersianDigits={usePersianDigits}
      />

      {/* Divar Alerts Modal */}
      <DivarAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => {
          setIsAlertsModalOpen(false);
          setAlertsInitialFilter(null);
          setAlertsInitialItem(null);
        }}
        alerts={divarAlerts}
        onSaveAlerts={(updated) => {
          setDivarAlerts(updated);
          persistActiveDashboard({ divarAlerts: updated });
        }}
        usePersianDigits={usePersianDigits}
        divarItems={divarData}
        currentDivarItems={divarData}
        excelItems={excelData}
        onSelectProperty={setSelectedItem}
        onAddToExcel={handleAddDivarItemToExcel}
        onAddMultipleToExcel={handleAddMultipleDivarItemsToExcel}
        initialFilter={alertsInitialFilter}
        initialItem={alertsInitialItem}
      />

      {/* Property Deletion Confirmation Modal (Prevents Accidental Touch) */}
      {propertyToDelete && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPropertyToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-right animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            </div>

            <h3 className="text-base font-black text-slate-900 text-center mb-2">
              حذف ملک ردیف {toPersianDigits(propertyToDelete.rowNumber)}
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed text-center mb-6">
              آیا از حذف ملک «{propertyToDelete.title || propertyToDelete.propertyType || `ردیف ${toPersianDigits(propertyToDelete.rowNumber)}`}» از این داشبورد اطمینان دارید؟
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={confirmDeleteProperty}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>بله، حذف شود</span>
              </button>

              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold text-white transition-all animate-in slide-in-from-top-4 duration-200 backdrop-blur-md max-w-sm border bg-slate-900/90 border-slate-700">
          {toastMessage.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          {toastMessage.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          {toastMessage.type === 'alert' && (
            <BellRing className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          )}
          <span className="leading-snug">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white mr-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
