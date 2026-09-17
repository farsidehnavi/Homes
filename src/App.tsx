import React, { useState, useMemo, useEffect } from 'react';
import { RealEstateItem, FilterState, SortField, SortOrder } from './types';
import { INITIAL_REAL_ESTATE_DATA } from './data/sampleRealEstateData';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { UploadDropzone } from './components/UploadDropzone';
import { FilterPanel } from './components/FilterPanel';
import { PropertyTable } from './components/PropertyTable';
import { PropertyCardList } from './components/PropertyCardList';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { Pagination } from './components/Pagination';
import { parseExcelFile, exportToExcel } from './utils/excelUtils';
import { normalizePersianText } from './utils/formatters';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const INITIAL_FILTER: FilterState = {
  searchQuery: '',
  propertyTypes: [],
  minPrice: null,
  maxPrice: null,
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
  const [data, setData] = useState<RealEstateItem[]>(INITIAL_REAL_ESTATE_DATA);
  const [currentFileName, setCurrentFileName] = useState<string>('فایل نمونه (PDF املاک نجف‌آباد)');
  const [filter, setFilter] = useState<FilterState>(INITIAL_FILTER);
  const [sortField, setSortField] = useState<SortField>('rowNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [activeView, setActiveView] = useState<'table' | 'cards'>('table');
  const [usePersianDigits, setUsePersianDigits] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<RealEstateItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Auto-switch to cards view on very small mobile screens by default if desired
  useEffect(() => {
    if (window.innerWidth < 768) {
      setActiveView('cards');
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Upload handler
  const handleFileUpload = async (file: File) => {
    const result = await parseExcelFile(file);
    if (result.success && result.items.length > 0) {
      setData(result.items);
      setCurrentFileName(file.name);
      setFilter(INITIAL_FILTER);
      setCurrentPage(1);
      showToast(`فایل "${file.name}" با موفقیت با ${result.items.length} رکورد بارگذاری شد.`, 'success');
    } else {
      showToast(result.errorMessage || 'خطا در بارگذاری فایل اکسل', 'error');
    }
  };

  // Reset to initial dataset
  const handleResetData = () => {
    setData(INITIAL_REAL_ESTATE_DATA);
    setCurrentFileName('فایل نمونه (PDF املاک نجف‌آباد)');
    setFilter(INITIAL_FILTER);
    setCurrentPage(1);
    showToast('اطلاعات به ۱۰۰ ردیف اولیه بازنشانی شد.', 'success');
  };

  // Download Sample Excel
  const handleDownloadSample = () => {
    exportToExcel(INITIAL_REAL_ESTATE_DATA, 'املاک_نمونه_نجف_آباد.xlsx');
    showToast('فایل اکسل نمونه با موفقیت دانلود شد.', 'success');
  };

  // Export currently filtered items
  const handleExportFiltered = () => {
    exportToExcel(filteredAndSortedItems, 'املاک_فیلتر_شده.xlsx');
    showToast(`فایل اکسل شامل ${filteredAndSortedItems.length} مورد با موفقیت صادر شد.`, 'success');
  };

  // Unique values for dynamic filter options
  const availablePropertyTypes = useMemo(() => {
    const types = Array.from(new Set(data.map((i) => i.propertyType))).filter(Boolean);
    return types.length > 0 ? types : ['آپارتمان', 'دوبلکس', 'ویلایی', 'کلنگی'];
  }, [data]);

  const availableDocumentTypes = useMemo(() => {
    const docs = Array.from(new Set(data.map((i) => i.documentType))).filter(Boolean);
    return docs.length > 0 ? docs : ['تک برگ', 'منگوله‌دار', 'قولنامه‌ای'];
  }, [data]);

  const availableFacades = useMemo(() => {
    const facs = Array.from(new Set(data.map((i) => i.facade))).filter(Boolean);
    return facs.length > 0 ? facs : ['سنگ', 'آجر', 'سرامیک', 'کامپوزیت'];
  }, [data]);

  const availableOrientations = useMemo(() => {
    const oris = Array.from(new Set(data.map((i) => i.orientation))).filter(Boolean);
    return oris.length > 0 ? oris : ['شمالی', 'جنوبی', 'شرقی', 'غربی'];
  }, [data]);

  // Filtering & Sorting
  const filteredAndSortedItems = useMemo(() => {
    let result = [...data];

    // 1. Search Query
    if (filter.searchQuery.trim()) {
      const q = normalizePersianText(filter.searchQuery);
      result = result.filter((item) => {
        const addressNorm = normalizePersianText(item.address);
        const typeNorm = normalizePersianText(item.propertyType);
        const facadeNorm = normalizePersianText(item.facade);
        const oriNorm = normalizePersianText(item.orientation);
        const docNorm = normalizePersianText(item.documentType);
        const rowStr = item.rowNumber.toString();

        return (
          addressNorm.includes(q) ||
          typeNorm.includes(q) ||
          facadeNorm.includes(q) ||
          oriNorm.includes(q) ||
          docNorm.includes(q) ||
          rowStr.includes(q)
        );
      });
    }

    // 2. Property Types
    if (filter.propertyTypes.length > 0) {
      result = result.filter((item) => filter.propertyTypes.includes(item.propertyType));
    }

    // 3. Price
    if (filter.minPrice !== null) {
      result = result.filter((item) => item.price >= (filter.minPrice || 0));
    }
    if (filter.maxPrice !== null) {
      result = result.filter((item) => item.price <= (filter.maxPrice || Infinity));
    }

    // 4. Area
    if (filter.minArea !== null) {
      result = result.filter((item) => item.area >= (filter.minArea || 0));
    }
    if (filter.maxArea !== null) {
      result = result.filter((item) => item.area <= (filter.maxArea || Infinity));
    }

    // 5. Rooms
    if (filter.rooms.length > 0) {
      result = result.filter((item) => {
        return filter.rooms.some((r) => (r === 4 ? item.rooms >= 4 : item.rooms === r));
      });
    }

    // 6. Document Types
    if (filter.documentTypes.length > 0) {
      result = result.filter((item) => filter.documentTypes.includes(item.documentType));
    }

    // 7. Orientations
    if (filter.orientations.length > 0) {
      result = result.filter((item) => filter.orientations.includes(item.orientation));
    }

    // 8. Facades
    if (filter.facades.length > 0) {
      result = result.filter((item) => filter.facades.includes(item.facade));
    }

    // 9. Amenities
    if (filter.parking === 'yes') result = result.filter((item) => item.hasParking);
    if (filter.parking === 'no') result = result.filter((item) => !item.hasParking);

    if (filter.elevator === 'yes') result = result.filter((item) => item.hasElevator);
    if (filter.elevator === 'no') result = result.filter((item) => !item.hasElevator);

    if (filter.storage === 'yes') result = result.filter((item) => item.hasStorage);
    if (filter.storage === 'no') result = result.filter((item) => !item.hasStorage);

    // 10. Building Age
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
  }, [data, filter, sortField, sortOrder]);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Vazirmatn',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        onFileUpload={handleFileUpload}
        onDownloadSample={handleDownloadSample}
        onResetData={handleResetData}
        activeView={activeView}
        onToggleView={setActiveView}
        usePersianDigits={usePersianDigits}
        onTogglePersianDigits={() => setUsePersianDigits((prev) => !prev)}
        totalItems={data.length}
        filteredCount={filteredAndSortedItems.length}
        isFilterOpenMobile={isMobileFilterOpen}
        onToggleFilterMobile={() => setIsMobileFilterOpen((prev) => !prev)}
        fileName={currentFileName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Upload Dropzone */}
        <UploadDropzone
          onFileUpload={handleFileUpload}
          onDownloadSample={handleDownloadSample}
          currentFileName={currentFileName}
          totalRecords={data.length}
        />

        {/* Stats Overview */}
        <StatsOverview
          items={filteredAndSortedItems}
          totalUploaded={data.length}
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
        />

        {/* Content Layout: Left/Right Sidebar (Filter) + Main Content (Table / Cards) */}
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
              totalAvailable={data.length}
              availablePropertyTypes={availablePropertyTypes}
              availableDocumentTypes={availableDocumentTypes}
              availableFacades={availableFacades}
              availableOrientations={availableOrientations}
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
              />
            ) : (
              <PropertyCardList
                items={paginatedItems}
                onSelectItem={setSelectedItem}
                usePersianDigits={usePersianDigits}
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

      {/* Mobile Filter Drawer / Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-5/6 max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col">
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
              totalAvailable={data.length}
              availablePropertyTypes={availablePropertyTypes}
              availableDocumentTypes={availableDocumentTypes}
              availableFacades={availableFacades}
              availableOrientations={availableOrientations}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Property Detail Modal */}
      <PropertyDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        usePersianDigits={usePersianDigits}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : 'bg-rose-800 text-white border-rose-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="mr-2 p-1 text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
