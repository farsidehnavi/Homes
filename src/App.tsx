import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  RealEstateItem,
  FilterState,
  SortField,
  SortOrder,
  DivarTimeRange,
  DivarAlert,
} from './types';
import {
  DIVAR_NAJAFABAD_24H_DATA,
  DIVAR_METADATA,
  DivarFetchMeta,
} from './data/divarNajafabadData';
import { INITIAL_REAL_ESTATE_DATA } from './data/sampleRealEstateData';
import { ModeSelectionScreen } from './components/ModeSelectionScreen';
import { Navbar } from './components/Navbar';
import { DivarSyncBanner } from './components/DivarSyncBanner';
import { ExcelBanner } from './components/ExcelBanner';
import { UploadDropzone } from './components/UploadDropzone';
import { StatsOverview } from './components/StatsOverview';
import { FilterPanel } from './components/FilterPanel';
import { PropertyTable } from './components/PropertyTable';
import { PropertyCardList } from './components/PropertyCardList';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { PropertyFormModal } from './components/PropertyFormModal';
import { DivarAlertsModal, matchItemWithAlert } from './components/DivarAlertsModal';
import { Pagination } from './components/Pagination';
import { exportToExcel } from './utils/excelUtils';
import { normalizePersianText, toPersianDigits } from './utils/formatters';
import { getTimeCutoffMs } from './utils/divarCrawler';
import { playNotificationChime } from './utils/audioAlert';
import {
  CheckCircle2,
  AlertCircle,
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

const DEFAULT_ALERTS: DivarAlert[] = [];

export default function App() {
  // Navigation Mode: 'home' (the 2-button landing page), 'excel' (داشبورد من), or 'divar' (پنل دیوار)
  const [currentMode, setCurrentMode] = useState<'home' | 'excel' | 'divar'>('home');

  // Excel dataset state (داشبورد من)
  const [excelData, setExcelData] = useState<RealEstateItem[]>(INITIAL_REAL_ESTATE_DATA);
  const [excelFileName, setExcelFileName] = useState<string>('داده‌های_املاک_نجف‌آباد.xlsx');
  const [showExcelDropzone, setShowExcelDropzone] = useState<boolean>(false);
  const [hasExcelModifications, setHasExcelModifications] = useState<boolean>(false);

  // Property Form Modal for Excel CRUD
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState<boolean>(false);
  const [propertyToEdit, setPropertyToEdit] = useState<RealEstateItem | null>(null);

  // Divar dataset state (پنل دیوار)
  const [divarData, setDivarData] = useState<RealEstateItem[]>(DIVAR_NAJAFABAD_24H_DATA);
  const [divarMeta, setDivarMeta] = useState<DivarFetchMeta | null>(DIVAR_METADATA);
  const [isLoadingDivar, setIsLoadingDivar] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [divarTimeRange, setDivarTimeRange] = useState<DivarTimeRange>('24h');

  // Divar Alerts (گوش‌به‌زنگ)
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [divarAlerts, setDivarAlerts] = useState<DivarAlert[]>(() => {
    try {
      const saved = localStorage.getItem('najafabad_divar_alerts');
      return saved ? JSON.parse(saved) : DEFAULT_ALERTS;
    } catch {
      return DEFAULT_ALERTS;
    }
  });

  // Save alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('najafabad_divar_alerts', JSON.stringify(divarAlerts));
    } catch (e) {
      console.warn(e);
    }
  }, [divarAlerts]);

  // Shared UI & Filter state
  const [filter, setFilter] = useState<FilterState>(INITIAL_FILTER);
  const [sortField, setSortField] = useState<SortField>('rowNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [activeView, setActiveView] = useState<'table' | 'cards'>('table');
  const [usePersianDigits, setUsePersianDigits] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<RealEstateItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'alert' } | null>(null);

  // Auto-switch to cards view on mobile screens
  useEffect(() => {
    if (window.innerWidth < 768) {
      setActiveView('cards');
    }
  }, []);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // Fetch live Divar data from server route with timeRange
  const fetchLiveDivar = useCallback(async (timeRange = divarTimeRange) => {
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
        showToast(
          `آگهی‌های دیوار نجف‌آباد (${json.items.length} مورد) با موفقیت همگام‌سازی شد.`,
          'success'
        );
      } else {
        showToast('آگهی جدیدی در پاسخ دیوار دریافت نشد.', 'error');
      }
    } catch (err: any) {
      showToast(
        'استفاده از آخرین نسخه ذخیره‌شده آگهی‌های دیوار نجف‌آباد.',
        'alert'
      );
    } finally {
      setIsLoadingDivar(false);
    }
  }, [divarTimeRange, showToast]);

  // Handle Divar Time Range Change (1 hour to 1 month)
  const handleDivarTimeRangeChange = (newRange: DivarTimeRange) => {
    setDivarTimeRange(newRange);
    setCurrentPage(1);
    fetchLiveDivar(newRange);
  };

  // Handle new Excel file loaded from dropzone
  const handleExcelDataLoaded = (items: RealEstateItem[], fileName: string) => {
    setExcelData(items);
    setExcelFileName(fileName);
    setShowExcelDropzone(false);
    setHasExcelModifications(false);
    setFilter(INITIAL_FILTER);
    setCurrentPage(1);
    showToast(`فایل «${fileName}» با ${items.length} ملک با موفقیت در داشبورد من بارگذاری شد.`, 'success');
  };

  // Reload default sample Excel data
  const handleLoadSampleExcel = () => {
    setExcelData(INITIAL_REAL_ESTATE_DATA);
    setExcelFileName('داده‌های_پیش‌فرض_املاک_نجف‌آباد.xlsx');
    setShowExcelDropzone(false);
    setHasExcelModifications(false);
    setFilter(INITIAL_FILTER);
    setCurrentPage(1);
    showToast('دیتاست ۱۰۰ ملک نمونه نجف‌آباد بارگذاری گردید.', 'success');
  };

  // CRUD Operations in Excel Version (داشبورد من)
  const handleOpenAddPropertyModal = () => {
    setPropertyToEdit(null);
    setIsPropertyFormOpen(true);
  };

  const handleOpenEditPropertyModal = (item: RealEstateItem) => {
    setPropertyToEdit(item);
    setIsPropertyFormOpen(true);
  };

  const handleSaveProperty = (itemData: Partial<RealEstateItem>) => {
    if (propertyToEdit) {
      // Edit existing
      setExcelData((prev) =>
        prev.map((item) =>
          item.id === propertyToEdit.id
            ? { ...item, ...itemData, id: item.id, rowNumber: item.rowNumber }
            : item
        )
      );
      setHasExcelModifications(true);
      showToast(`ملک ردیف ${propertyToEdit.rowNumber} با موفقیت ویرایش شد. خروجی اکسل بروز گردید.`, 'success');
    } else {
      // Add new
      const nextId = excelData.length > 0 ? Math.max(...excelData.map((i) => i.id)) + 1 : 1;
      const nextRow = excelData.length + 1;
      const newItem: RealEstateItem = {
        id: nextId,
        rowNumber: nextRow,
        address: itemData.address || 'نجف‌آباد',
        propertyType: itemData.propertyType || 'آپارتمان',
        transactionType: itemData.transactionType || 'خرید و فروش',
        area: itemData.area || 100,
        rooms: itemData.rooms || 2,
        floor: itemData.floor ?? 1,
        totalFloors: itemData.totalFloors || 4,
        age: itemData.age ?? 0,
        orientation: itemData.orientation || 'شمالی',
        facade: itemData.facade || 'سنگ',
        hasParking: Boolean(itemData.hasParking),
        hasElevator: Boolean(itemData.hasElevator),
        hasStorage: Boolean(itemData.hasStorage),
        documentType: itemData.documentType || 'تک برگ',
        price: itemData.price || 0,
        pricePerMeter: itemData.pricePerMeter || 0,
        deposit: itemData.deposit || 0,
        rent: itemData.rent || 0,
        depositText: itemData.depositText,
        rentText: itemData.rentText,
        title: itemData.title,
        district: itemData.district,
        priceText: itemData.priceText,
        source: 'excel',
      };
      setExcelData((prev) => [newItem, ...prev]);
      setHasExcelModifications(true);
      showToast('ملک جدید به داشبورد من اضافه شد و در خروجی اکسل لحاظ گردید.', 'success');
    }
    setIsPropertyFormOpen(false);
    setPropertyToEdit(null);
  };

  const handleDeleteProperty = (itemToDelete: RealEstateItem) => {
    const confirmed = window.confirm(
      `آیا از حذف ملک ردیف ${itemToDelete.rowNumber} (${itemToDelete.title || itemToDelete.address}) اطمینان دارید؟`
    );
    if (!confirmed) return;

    setExcelData((prev) => {
      const filtered = prev.filter((i) => i.id !== itemToDelete.id);
      return filtered.map((item, idx) => ({ ...item, rowNumber: idx + 1 }));
    });
    setHasExcelModifications(true);
    showToast(`ملک ردیف ${itemToDelete.rowNumber} از لیست و فایل اکسل حذف گردید.`, 'success');
  };

  // Reset filters and data
  const handleResetData = () => {
    setFilter(INITIAL_FILTER);
    setCurrentPage(1);
    setSortField('rowNumber');
    setSortOrder('asc');
    showToast('فیلترها و مرتب‌سازی بازنشانی شدند.', 'success');
  };

  // Active dataset depending on mode
  const activeDataset = useMemo(() => {
    return currentMode === 'excel' ? excelData : divarData;
  }, [currentMode, excelData, divarData]);

  // Export currently filtered items to Excel (Reflecting all Add / Edit / Delete changes!)
  const handleExportFiltered = () => {
    const baseName =
      currentMode === 'excel'
        ? `خروجی_داشبورد_من_${excelFileName.replace(/\.[^/.]+$/, '')}.xlsx`
        : `املاک_پنل_دیوار_نجف_آباد_${divarTimeRange}.xlsx`;
    exportToExcel(filteredAndSortedItems, baseName);
    showToast(
      `فایل اکسل شامل ${filteredAndSortedItems.length} ملک (با تمام تغییرات و ویرایش‌ها) دانلود شد.`,
      'success'
    );
  };

  // Calculate matched items count for Divar Alerts
  const matchedAlertItems = useMemo(() => {
    if (currentMode !== 'divar') return [];
    return divarData.filter((item) =>
      divarAlerts.some((alert) => matchItemWithAlert(item, alert))
    );
  }, [currentMode, divarData, divarAlerts]);

  // Alert management handlers
  const handleAddAlert = (alertData: Omit<DivarAlert, 'id' | 'createdAt'>) => {
    const newAlert: DivarAlert = {
      ...alertData,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDivarAlerts((prev) => [newAlert, ...prev]);
    showToast(`هشدار «${newAlert.title}» با موفقیت فعال شد.`, 'success');
  };

  const handleToggleAlert = (id: string) => {
    setDivarAlerts((prev) =>
      prev.map((al) => (al.id === id ? { ...al, enabled: !al.enabled } : al))
    );
  };

  const handleDeleteAlert = (id: string) => {
    setDivarAlerts((prev) => prev.filter((al) => al.id !== id));
    showToast('هشدار مورد نظر حذف شد.', 'success');
  };

  // Dynamic filter options based on active dataset
  const availablePropertyTypes = useMemo(() => {
    const types = Array.from(new Set(activeDataset.map((i) => i.propertyType))).filter(Boolean);
    return types.length > 0 ? types : ['آپارتمان', 'دوبلکس', 'ویلایی', 'خانه مسکونی', 'زمین / کلنگی'];
  }, [activeDataset]);

  const availableDocumentTypes = useMemo(() => {
    const docs = Array.from(new Set(activeDataset.map((i) => i.documentType))).filter(Boolean);
    return docs.length > 0 ? docs : ['تک برگ', 'منگوله‌دار', 'قولنامه‌ای'];
  }, [activeDataset]);

  const availableFacades = useMemo(() => {
    const facs = Array.from(new Set(activeDataset.map((i) => i.facade))).filter(Boolean);
    return facs.length > 0 ? facs : ['سنگ', 'آجر', 'سرامیک', 'کامپوزیت'];
  }, [activeDataset]);

  const availableOrientations = useMemo(() => {
    const oris = Array.from(new Set(activeDataset.map((i) => i.orientation))).filter(Boolean);
    return oris.length > 0 ? oris : ['شمالی', 'جنوبی', 'شرقی', 'غربی', 'دو کله'];
  }, [activeDataset]);

  // Filtering & Sorting
  const filteredAndSortedItems = useMemo(() => {
    let result = [...activeDataset];

    // 0. Time Range Cutoff (in Divar Mode)
    if (currentMode === 'divar' && divarTimeRange !== 'all') {
      const cutoffDiffMs = getTimeCutoffMs(divarTimeRange);
      const cutoffTime = Date.now() - cutoffDiffMs;
      result = result.filter((item) => {
        if (!item.publishedAt) return true;
        const itemTime = new Date(item.publishedAt).getTime();
        return isNaN(itemTime) || itemTime >= cutoffTime;
      });
    }

    // 1. Transaction Type (خرید و فروش vs رهن و اجاره)
    if (filter.transactionType && filter.transactionType !== 'all') {
      result = result.filter((item) => {
        const itemType = item.transactionType || (item.deposit || item.rent ? 'رهن و اجاره' : 'خرید و فروش');
        return itemType === filter.transactionType;
      });
    }

    // 2. Search Query
    if (filter.searchQuery.trim()) {
      const q = normalizePersianText(filter.searchQuery);
      result = result.filter((item) => {
        const titleNorm = item.title ? normalizePersianText(item.title) : '';
        const addressNorm = normalizePersianText(item.address);
        const districtNorm = item.district ? normalizePersianText(item.district) : '';
        const typeNorm = normalizePersianText(item.propertyType);
        const transNorm = item.transactionType ? normalizePersianText(item.transactionType) : '';
        const facadeNorm = normalizePersianText(item.facade);
        const oriNorm = normalizePersianText(item.orientation);
        const docNorm = normalizePersianText(item.documentType);
        const rowStr = item.rowNumber.toString();

        return (
          titleNorm.includes(q) ||
          addressNorm.includes(q) ||
          districtNorm.includes(q) ||
          typeNorm.includes(q) ||
          transNorm.includes(q) ||
          facadeNorm.includes(q) ||
          oriNorm.includes(q) ||
          docNorm.includes(q) ||
          rowStr.includes(q)
        );
      });
    }

    // 3. Property Types
    if (filter.propertyTypes.length > 0) {
      result = result.filter((item) => filter.propertyTypes.includes(item.propertyType));
    }

    // 4. Sale Price
    if (filter.minPrice !== null) {
      result = result.filter((item) => item.price >= (filter.minPrice || 0));
    }
    if (filter.maxPrice !== null) {
      result = result.filter((item) => item.price <= (filter.maxPrice || Infinity));
    }

    // 5. Deposit (رهن / ودیعه)
    if (filter.minDeposit !== null) {
      result = result.filter((item) => (item.deposit || 0) >= (filter.minDeposit || 0));
    }
    if (filter.maxDeposit !== null) {
      result = result.filter((item) => (item.deposit || 0) <= (filter.maxDeposit || Infinity));
    }

    // 6. Monthly Rent (اجاره ماهیانه)
    if (filter.minRent !== null) {
      result = result.filter((item) => (item.rent || 0) >= (filter.minRent || 0));
    }
    if (filter.maxRent !== null) {
      result = result.filter((item) => (item.rent || 0) <= (filter.maxRent || Infinity));
    }

    // 7. Area
    if (filter.minArea !== null) {
      result = result.filter((item) => item.area >= (filter.minArea || 0));
    }
    if (filter.maxArea !== null) {
      result = result.filter((item) => item.area <= (filter.maxArea || Infinity));
    }

    // 8. Rooms
    if (filter.rooms.length > 0) {
      result = result.filter((item) => {
        return filter.rooms.some((r) => (r === 4 ? item.rooms >= 4 : item.rooms === r));
      });
    }

    // 9. Document Types
    if (filter.documentTypes.length > 0) {
      result = result.filter((item) => filter.documentTypes.includes(item.documentType));
    }

    // 10. Orientations
    if (filter.orientations.length > 0) {
      result = result.filter((item) => filter.orientations.includes(item.orientation));
    }

    // 11. Facades
    if (filter.facades.length > 0) {
      result = result.filter((item) => filter.facades.includes(item.facade));
    }

    // 12. Amenities
    if (filter.parking === 'yes') result = result.filter((item) => item.hasParking);
    if (filter.parking === 'no') result = result.filter((item) => !item.hasParking);

    if (filter.elevator === 'yes') result = result.filter((item) => item.hasElevator);
    if (filter.elevator === 'no') result = result.filter((item) => !item.hasElevator);

    if (filter.storage === 'yes') result = result.filter((item) => item.hasStorage);
    if (filter.storage === 'no') result = result.filter((item) => !item.hasStorage);

    // 13. Building Age
    if (filter.minAge !== null) {
      result = result.filter((item) => item.age >= (filter.minAge || 0));
    }
    if (filter.maxAge !== null) {
      result = result.filter((item) => item.age <= (filter.maxAge || Infinity));
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      valA = valA || 0;
      valB = valB || 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [activeDataset, currentMode, divarTimeRange, filter, sortField, sortOrder]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Paginated Slice
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedItems.slice(start, start + pageSize);
  }, [filteredAndSortedItems, currentPage, pageSize]);

  // IF ON HOME MODE: render clean 2-button choice landing page
  if (currentMode === 'home') {
    return (
      <ModeSelectionScreen
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          setCurrentPage(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Vazirmatn',sans-serif] overflow-x-hidden w-full max-w-full">
      {/* Top Navigation Bar with Mode Switcher & Home Button */}
      <Navbar
        currentMode={currentMode}
        onSwitchMode={(m) => {
          setCurrentMode(m);
          setCurrentPage(1);
        }}
        onGoHome={() => setCurrentMode('home')}
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 lg:pb-8">
        {/* Mode-Specific Header Banner */}
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
            onTimeRangeChange={handleDivarTimeRangeChange}
            onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
            matchedAlertsCount={matchedAlertItems.length}
          />
        ) : (
          <>
            <ExcelBanner
              fileName={excelFileName}
              totalItems={excelData.length}
              filteredItemsCount={filteredAndSortedItems.length}
              onUploadClick={() => setShowExcelDropzone((prev) => !prev)}
              onLoadSampleClick={handleLoadSampleExcel}
              onExportExcel={handleExportFiltered}
              onAddNewProperty={handleOpenAddPropertyModal}
              usePersianDigits={usePersianDigits}
              hasUnsavedChanges={hasExcelModifications}
            />

            {/* Expandable Excel File Upload Dropzone */}
            {showExcelDropzone && (
              <div className="relative mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    بارگذاری یا جایگزینی فایل اکسل:
                  </span>
                  <button
                    onClick={() => setShowExcelDropzone(false)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span>بستن باکس آپلود</span>
                  </button>
                </div>
                <UploadDropzone
                  onDataLoaded={handleExcelDataLoaded}
                  onLoadSampleData={handleLoadSampleExcel}
                  currentFileName={excelFileName}
                  totalLoadedItems={excelData.length}
                  usePersianDigits={usePersianDigits}
                />
              </div>
            )}
          </>
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

        {/* Content Layout: Sidebar Filter + Main Content (Table / Cards) */}
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
              onTimeRangeChange={handleDivarTimeRangeChange}
            />
          </div>

          {/* Main Results View (3 cols on desktop) */}
          <div className="lg:col-span-3 space-y-4">
            {activeView === 'table' ? (
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
              />
            ) : (
              <PropertyCardList
                items={paginatedItems}
                onSelectItem={setSelectedItem}
                usePersianDigits={usePersianDigits}
                isExcelMode={currentMode === 'excel'}
                onEditItem={handleOpenEditPropertyModal}
                onDeleteItem={handleDeleteProperty}
              />
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalItems={filteredAndSortedItems.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              usePersianDigits={usePersianDigits}
            />
          </div>
        </div>
      </main>

      {/* Mobile Sticky Floating Action Bar on small screens */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-30 max-w-md mx-auto animate-in slide-in-from-bottom-3 duration-200">
        <div className="bg-slate-900/95 text-white backdrop-blur-md px-3 py-2 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-1.5 text-xs">
          {/* Filter button with counter */}
          <button
            id="mobile-bottom-bar-filter-btn"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فیلترها</span>
            {filteredAndSortedItems.length !== activeDataset.length && (
              <span className="w-4 h-4 rounded-full bg-white text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                {usePersianDigits ? toPersianDigits(filteredAndSortedItems.length) : filteredAndSortedItems.length}
              </span>
            )}
          </button>

          {/* Mode-specific quick actions */}
          {currentMode === 'divar' ? (
            <div className="flex items-center gap-1">
              <button
                id="mobile-bottom-bar-alert-btn"
                onClick={() => setIsAlertsModalOpen(true)}
                className="relative flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-2 rounded-xl font-bold cursor-pointer transition-all"
                title="گوش‌به‌زنگ دیوار"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">گوش‌به‌زنگ</span>
                {matchedAlertItems.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {usePersianDigits ? toPersianDigits(matchedAlertItems.length) : matchedAlertItems.length}
                  </span>
                )}
              </button>

              <button
                id="mobile-bottom-bar-refresh-btn"
                onClick={() => fetchLiveDivar(divarTimeRange)}
                disabled={isLoadingDivar}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer"
                title="بروزرسانی دیوار"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDivar ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                id="mobile-bottom-bar-upload-btn"
                onClick={() => setShowExcelDropzone((prev) => !prev)}
                className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer font-bold"
                title="آپلود یا جایگزینی فایل اکسل"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>آپلود</span>
              </button>

              <button
                id="mobile-bottom-bar-export-btn"
                onClick={handleExportFiltered}
                className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition-all cursor-pointer font-bold"
                title="دانلود فایل اکسل"
              >
                <Download className="w-3.5 h-3.5" />
                <span>خروجی</span>
              </button>
            </div>
          )}

          {/* View toggle (Cards vs Table) */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveView('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'cards' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400'
              }`}
              title="نمای کارتی"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'table' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400'
              }`}
              title="نمای جدولی"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scroll to Top button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="بازگشت به بالای صفحه"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Telegram-style Floating Action Button (FAB) for Adding New Property */}
      {currentMode === 'excel' && (
        <div className="fixed bottom-20 sm:bottom-8 left-4 sm:left-8 z-40 animate-in zoom-in-75 duration-200">
          <button
            id="telegram-fab-add-property"
            onClick={handleOpenAddPropertyModal}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 hover:scale-105 active:scale-90 text-white shadow-xl shadow-emerald-700/40 hover:shadow-2xl hover:shadow-emerald-700/60 transition-all duration-200 cursor-pointer border-2 border-white/40"
            title="افزودن ملک جدید (مشابه دکمه گفتگوی جدید تلگرام)"
            aria-label="افزودن ملک جدید"
          >
            <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />

            {/* Telegram-style floating label badge */}
            <span className="hidden sm:group-hover:inline-flex absolute right-full mr-3.5 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold whitespace-nowrap shadow-xl backdrop-blur-xs border border-slate-700 pointer-events-none animate-in fade-in">
              + افزودن ملک جدید
            </span>
          </button>
        </div>
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
              onTimeRangeChange={handleDivarTimeRangeChange}
            />
          </div>
        </div>
      )}

      {/* Property Detail Modal (Multi-image Gallery) */}
      <PropertyDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        usePersianDigits={usePersianDigits}
        isExcelMode={currentMode === 'excel'}
        onEditItem={handleOpenEditPropertyModal}
      />

      {/* Property Form Modal for Excel CRUD (Add/Edit) */}
      <PropertyFormModal
        isOpen={isPropertyFormOpen}
        itemToEdit={propertyToEdit}
        onClose={() => {
          setIsPropertyFormOpen(false);
          setPropertyToEdit(null);
        }}
        onSave={handleSaveProperty}
        usePersianDigits={usePersianDigits}
      />

      {/* Divar Alerts (گوش‌به‌زنگ) Modal */}
      <DivarAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={divarAlerts}
        onAddAlert={handleAddAlert}
        onToggleAlert={handleToggleAlert}
        onDeleteAlert={handleDeleteAlert}
        divarItems={divarData}
        onSelectProperty={(item) => setSelectedItem(item)}
        usePersianDigits={usePersianDigits}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toastMessage.type === 'alert'
                ? 'bg-amber-900 text-white border-amber-700'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'alert' ? (
              <BellRing className="w-4 h-4 text-amber-300 shrink-0 animate-bounce" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="mr-2 p-1 text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
