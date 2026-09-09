import React, { useState } from 'react';
import {
  Search,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Filter,
  Car,
  Warehouse,
  FileCheck2,
  Compass,
  Palette,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { FilterState, PropertyType } from '../types';
import { toPersianDigits, formatPriceShort } from '../utils/formatters';

interface FilterPanelProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onResetFilters: () => void;
  usePersianDigits: boolean;
  totalFiltered: number;
  totalAvailable: number;
  availablePropertyTypes: string[];
  availableDocumentTypes: string[];
  availableFacades: string[];
  availableOrientations: string[];
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filter,
  onFilterChange,
  onResetFilters,
  usePersianDigits,
  totalFiltered,
  totalAvailable,
  availablePropertyTypes,
  availableDocumentTypes,
  availableFacades,
  availableOrientations,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const [openSections, setOpenSections] = useState({
    propertyType: true,
    price: true,
    area: true,
    rooms: true,
    amenities: true,
    advanced: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const fmt = (n: number | string) => (usePersianDigits ? toPersianDigits(n) : n);

  // Helper to check if any non-default filter is active
  const isFiltered =
    filter.searchQuery.trim() !== '' ||
    filter.propertyTypes.length > 0 ||
    filter.minPrice !== null ||
    filter.maxPrice !== null ||
    filter.minArea !== null ||
    filter.maxArea !== null ||
    filter.rooms.length > 0 ||
    filter.documentTypes.length > 0 ||
    filter.orientations.length > 0 ||
    filter.facades.length > 0 ||
    filter.parking !== 'all' ||
    filter.elevator !== 'all' ||
    filter.storage !== 'all' ||
    filter.minAge !== null ||
    filter.maxAge !== null;

  const handleTypeToggle = (type: string) => {
    const exists = filter.propertyTypes.includes(type);
    const updated = exists
      ? filter.propertyTypes.filter((t) => t !== type)
      : [...filter.propertyTypes, type];
    onFilterChange({ ...filter, propertyTypes: updated });
  };

  const handleRoomToggle = (room: number) => {
    const exists = filter.rooms.includes(room);
    const updated = exists
      ? filter.rooms.filter((r) => r !== room)
      : [...filter.rooms, room];
    onFilterChange({ ...filter, rooms: updated });
  };

  const handleDocumentToggle = (doc: string) => {
    const exists = filter.documentTypes.includes(doc);
    const updated = exists
      ? filter.documentTypes.filter((d) => d !== doc)
      : [...filter.documentTypes, doc];
    onFilterChange({ ...filter, documentTypes: updated });
  };

  const handleOrientationToggle = (ori: string) => {
    const exists = filter.orientations.includes(ori);
    const updated = exists
      ? filter.orientations.filter((o) => o !== ori)
      : [...filter.orientations, ori];
    onFilterChange({ ...filter, orientations: updated });
  };

  const handleFacadeToggle = (fac: string) => {
    const exists = filter.facades.includes(fac);
    const updated = exists
      ? filter.facades.filter((f) => f !== fac)
      : [...filter.facades, fac];
    onFilterChange({ ...filter, facades: updated });
  };

  const pricePresets = [
    { label: 'همه', min: null, max: null },
    { label: 'زیر ۵ میلیارد', min: null, max: 5_000_000_000 },
    { label: '۵ تا ۱۰ میلیارد', min: 5_000_000_000, max: 10_000_000_000 },
    { label: '۱۰ تا ۱۵ میلیارد', min: 10_000_000_000, max: 15_000_000_000 },
    { label: 'بالای ۱۵ میلیارد', min: 15_000_000_000, max: null },
  ];

  const areaPresets = [
    { label: 'همه', min: null, max: null },
    { label: 'زیر ۱۰۰ متر', min: null, max: 100 },
    { label: '۱۰۰ تا ۲۰۰ متر', min: 100, max: 200 },
    { label: '۲۰۰ تا ۳۰۰ متر', min: 200, max: 300 },
    { label: 'بالای ۳۰۰ متر', min: 300, max: null },
  ];

  const agePresets = [
    { label: 'همه', min: null, max: null },
    { label: 'نوساز (زیر ۳ سال)', min: null, max: 3 },
    { label: '۳ تا ۱۰ سال', min: 3, max: 10 },
    { label: '۱۰ تا ۲۰ سال', min: 10, max: 20 },
    { label: 'قدیمی (بالای ۲۰ سال)', min: 20, max: null },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">فیلتر و جستجو</h2>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold border border-indigo-100">
            {fmt(totalFiltered)} مورد
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              id="clear-all-filters-btn"
              onClick={onResetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>حذف فیلترها</span>
            </button>
          )}

          {isMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-4 overflow-y-auto space-y-5 flex-1 divide-y divide-slate-100">
        {/* 1. Global Search Box */}
        <div className="pt-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            جستجوی نام خیابان، کوچه یا نشانی:
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-input"
              type="text"
              value={filter.searchQuery}
              onChange={(e) =>
                onFilterChange({ ...filter, searchQuery: e.target.value })
              }
              placeholder="مثلاً ابوالقاسمی، 22 بهمن، صمصام..."
              className="w-full pl-8 pr-9 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
            {filter.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Property Type (نوع ملک) */}
        <div className="pt-4">
          <button
            onClick={() => toggleSection('propertyType')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 mb-2 hover:text-indigo-600"
          >
            <span>نوع ملک</span>
            {openSections.propertyType ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {openSections.propertyType && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {availablePropertyTypes.map((type) => {
                const isSelected = filter.propertyTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Price Range (محدوده قیمت) */}
        <div className="pt-4">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 mb-2 hover:text-indigo-600"
          >
            <span>محدوده قیمت (تومان)</span>
            {openSections.price ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {openSections.price && (
            <div className="space-y-2 mt-2">
              {/* Presets */}
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {pricePresets.map((preset, idx) => {
                  const isActive =
                    filter.minPrice === preset.min &&
                    filter.maxPrice === preset.max;
                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        onFilterChange({
                          ...filter,
                          minPrice: preset.min,
                          maxPrice: preset.max,
                        })
                      }
                      className={`p-1.5 rounded-md text-[11px] font-medium border text-center transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Min - Max custom inputs */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">از (تومان):</span>
                  <input
                    type="number"
                    placeholder="حداقل"
                    value={filter.minPrice ?? ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filter,
                        minPrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {filter.minPrice && (
                    <div className="text-[10px] text-indigo-600 mt-0.5 font-medium truncate">
                      {formatPriceShort(filter.minPrice, usePersianDigits)}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">تا (تومان):</span>
                  <input
                    type="number"
                    placeholder="حداکثر"
                    value={filter.maxPrice ?? ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filter,
                        maxPrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {filter.maxPrice && (
                    <div className="text-[10px] text-indigo-600 mt-0.5 font-medium truncate">
                      {formatPriceShort(filter.maxPrice, usePersianDigits)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Area Range (متراژ متر مربع) */}
        <div className="pt-4">
          <button
            onClick={() => toggleSection('area')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 mb-2 hover:text-indigo-600"
          >
            <span>متراژ (متر مربع)</span>
            {openSections.area ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {openSections.area && (
            <div className="space-y-2 mt-2">
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {areaPresets.map((preset, idx) => {
                  const isActive =
                    filter.minArea === preset.min &&
                    filter.maxArea === preset.max;
                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        onFilterChange({
                          ...filter,
                          minArea: preset.min,
                          maxArea: preset.max,
                        })
                      }
                      className={`p-1.5 rounded-md text-[11px] font-medium border text-center transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">از متراژ:</span>
                  <input
                    type="number"
                    placeholder="مثلاً 80"
                    value={filter.minArea ?? ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filter,
                        minArea: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">تا متراژ:</span>
                  <input
                    type="number"
                    placeholder="مثلاً 250"
                    value={filter.maxArea ?? ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filter,
                        maxArea: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Room Count (تعداد اتاق) */}
        <div className="pt-4">
          <button
            onClick={() => toggleSection('rooms')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 mb-2 hover:text-indigo-600"
          >
            <span>تعداد اتاق / خواب</span>
            {openSections.rooms ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {openSections.rooms && (
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[1, 2, 3, 4].map((room) => {
                const isSelected = filter.rooms.includes(room);
                return (
                  <button
                    key={room}
                    onClick={() => handleRoomToggle(room)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {fmt(room)} {room === 4 ? '+ خواب' : 'خواب'}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Amenities (امکانات: پارکینگ، آسانسور، انباری) */}
        <div className="pt-4">
          <button
            onClick={() => toggleSection('amenities')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 mb-2 hover:text-indigo-600"
          >
            <span>امکانات و امتیازات</span>
            {openSections.amenities ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {openSections.amenities && (
            <div className="space-y-2 mt-2">
              {/* Parking */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Car className="w-3.5 h-3.5 text-slate-500" />
                  پارکینگ
                </span>
                <div className="flex rounded-md border border-slate-300 p-0.5 bg-white">
                  {(['all', 'yes', 'no'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onFilterChange({ ...filter, parking: mode })}
                      className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                        filter.parking === mode
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode === 'all' ? 'همه' : mode === 'yes' ? 'دارد' : 'ندارد'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Elevator */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  آسانسور
                </span>
                <div className="flex rounded-md border border-slate-300 p-0.5 bg-white">
                  {(['all', 'yes', 'no'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onFilterChange({ ...filter, elevator: mode })}
                      className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                        filter.elevator === mode
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode === 'all' ? 'همه' : mode === 'yes' ? 'دارد' : 'ندارد'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Warehouse className="w-3.5 h-3.5 text-slate-500" />
                  انباری
                </span>
                <div className="flex rounded-md border border-slate-300 p-0.5 bg-white">
                  {(['all', 'yes', 'no'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onFilterChange({ ...filter, storage: mode })}
                      className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                        filter.storage === mode
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode === 'all' ? 'همه' : mode === 'yes' ? 'دارد' : 'ندارد'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 7. Advanced Filters: Document, Orientation, Facade, Age */}
        <div className="pt-4">
          <button
            onClick={() => toggleSection('advanced')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 mb-2 hover:text-indigo-600"
          >
            <span>فیلترهای پیشرفته (سند، جهت، نما، سن)</span>
            {openSections.advanced ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {openSections.advanced && (
            <div className="space-y-3 mt-2">
              {/* Document Type (نوع سند) */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1.5">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  نوع سند:
                </span>
                <div className="flex flex-wrap gap-1">
                  {availableDocumentTypes.map((doc) => {
                    const isSelected = filter.documentTypes.includes(doc);
                    return (
                      <button
                        key={doc}
                        onClick={() => handleDocumentToggle(doc)}
                        className={`px-2 py-1 rounded text-xs border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {doc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orientation (جهت ساختمان) */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  جهت ساختمان:
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {availableOrientations.map((ori) => {
                    const isSelected = filter.orientations.includes(ori);
                    return (
                      <button
                        key={ori}
                        onClick={() => handleOrientationToggle(ori)}
                        className={`py-1 text-xs rounded border text-center transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {ori}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Facade (نمای ساختمان) */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  نمای ساختمان:
                </span>
                <div className="flex flex-wrap gap-1">
                  {availableFacades.map((fac) => {
                    const isSelected = filter.facades.includes(fac);
                    return (
                      <button
                        key={fac}
                        onClick={() => handleFacadeToggle(fac)}
                        className={`px-2 py-1 rounded text-xs border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {fac}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Age (سن بنا) */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  سن بنا:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  {agePresets.map((p, idx) => {
                    const isActive =
                      filter.minAge === p.min && filter.maxAge === p.max;
                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          onFilterChange({
                            ...filter,
                            minAge: p.min,
                            maxAge: p.max,
                          })
                        }
                        className={`p-1 rounded border text-center transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white border-slate-900 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Reset button */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <button
          onClick={onResetFilters}
          className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بازنشانی تمام فیلترها</span>
        </button>
      </div>
    </div>
  );
};
