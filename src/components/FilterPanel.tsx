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
  Tag,
  Key,
  Layers,
} from 'lucide-react';
import { FilterState, PropertyType, DivarTimeRange, TransactionType } from '../types';
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
  isDivarMode?: boolean;
  currentTimeRange?: DivarTimeRange;
  onTimeRangeChange?: (range: DivarTimeRange) => void;
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
  isDivarMode = false,
  currentTimeRange = '24h',
  onTimeRangeChange,
}) => {
  const [openSections, setOpenSections] = useState({
    timeRange: true,
    transaction: true,
    propertyType: true,
    price: true,
    rent: true,
    area: true,
    rooms: true,
    amenities: true,
    advanced: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const fmt = (n: number | string) => (usePersianDigits ? toPersianDigits(n) : n);

  const isFiltered =
    filter.searchQuery.trim() !== '' ||
    filter.transactionType !== 'all' ||
    filter.propertyTypes.length > 0 ||
    filter.minPrice !== null ||
    filter.maxPrice !== null ||
    filter.minDeposit !== null ||
    filter.maxDeposit !== null ||
    filter.minRent !== null ||
    filter.maxRent !== null ||
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

  const timeOptions: { id: DivarTimeRange; label: string; desc: string }[] = [
    { id: '1h', label: '۱ ساعت گذشته', desc: 'تازه ترین آگهی ها' },
    { id: '2h', label: '۲ ساعت گذشته', desc: '۲ ساعت اخیر' },
    { id: '6h', label: '۶ ساعت گذشته', desc: 'نیم روز گذشته' },
    { id: '12h', label: '۱۲ ساعت گذشته', desc: 'امروز' },
    { id: '24h', label: '۲۴ ساعت گذشته', desc: '۱ روز اخیر (پیش فرض)' },
    { id: '3d', label: '۳ روز گذشته', desc: '۳ روز اخیر' },
    { id: '7d', label: '۱ هفته گذشته', desc: '۷ روز گذشته' },
    { id: '14d', label: '۲ هفته گذشته', desc: '۱۴ روز گذشته' },
    { id: '30d', label: '۱ ماه گذشته', desc: '۳۰ روز اخیر' },
    { id: 'all', label: 'همه زمان‌ها', desc: 'کل تاریخچه دیوار' },
  ];

  const pricePresets = [
    { label: 'همه', min: null, max: null },
    { label: 'زیر ۳ میلیارد', min: null, max: 3_000_000_000 },
    { label: '۳ تا ۵ میلیارد', min: 3_000_000_000, max: 5_000_000_000 },
    { label: '۵ تا ۱۰ میلیارد', min: 5_000_000_000, max: 10_000_000_000 },
    { label: 'بالای ۱۰ میلیارد', min: 10_000_000_000, max: null },
  ];

  const depositPresets = [
    { label: 'همه', min: null, max: null },
    { label: 'زیر ۲۰۰ میلیون', min: null, max: 200_000_000 },
    { label: '۲۰۰ تا ۵۰۰ میلیون', min: 200_000_000, max: 500_000_000 },
    { label: 'بالای ۵۰۰ میلیون', min: 500_000_000, max: null },
  ];

  const rentPresets = [
    { label: 'همه', min: null, max: null },
    { label: 'زیر ۴ میلیون', min: null, max: 4_000_000 },
    { label: '۴ تا ۸ میلیون', min: 4_000_000, max: 8_000_000 },
    { label: 'بالای ۸ میلیون', min: 8_000_000, max: null },
  ];

  const areaPresets = [
    { label: 'همه', min: null, max: null },
    { label: 'زیر ۸۰ متر', min: null, max: 80 },
    { label: '۸۰ تا ۱۲۰ متر', min: 80, max: 120 },
    { label: '۱۲۰ تا ۲۰۰ متر', min: 120, max: 200 },
    { label: 'بالای ۲۰۰ متر', min: 200, max: null },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-900">فیلترهای پیشرفته</h2>
          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
            {fmt(totalFiltered)} از {fmt(totalAvailable)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold hover:bg-rose-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
              title="پاک کردن همه فیلترها"
            >
              <RotateCcw className="w-3 h-3" />
              <span>پاک‌سازی</span>
            </button>
          )}

          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-right divide-y divide-slate-100">
        {/* 1. Search Query */}
        <div className="space-y-1.5 pt-0">
          <label className="text-xs font-bold text-slate-700 block">جستجوی متنی:</label>
          <div className="relative">
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
              placeholder="جستجو در محله، آدرس، خیابان، نوع ملک..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-8 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {filter.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Divar Time Range Selector (Only in Divar mode) */}
        {isDivarMode && onTimeRangeChange && (
          <div className="pt-4 space-y-2">
            <button
              type="button"
              onClick={() => toggleSection('timeRange')}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-red-700">
                <Clock className="w-4 h-4" />
                <span>زمان انتشار آگهی دیوار:</span>
              </div>
              {openSections.timeRange ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {openSections.timeRange && (
              <div className="space-y-2 pt-1">
                <select
                  value={currentTimeRange}
                  onChange={(e) => onTimeRangeChange(e.target.value as DivarTimeRange)}
                  className="w-full text-xs font-bold bg-red-50/60 border border-red-200 text-red-900 rounded-xl px-3 py-2.5 focus:outline-hidden cursor-pointer"
                >
                  {timeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      ⏱ {opt.label} ({opt.desc})
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {timeOptions.slice(0, 6).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onTimeRangeChange(opt.id)}
                      className={`py-1.5 px-2 rounded-lg text-2xs font-semibold text-center border transition-all cursor-pointer ${
                        currentTimeRange === opt.id
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Transaction Type (خرید و فروش vs رهن و اجاره) */}
        <div className="pt-4 space-y-2">
          <button
            type="button"
            onClick={() => toggleSection('transaction')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>نوع معامله (خرید / اجاره):</span>
            </div>
            {openSections.transaction ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSections.transaction && (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onFilterChange({ ...filter, transactionType: 'all' })}
                className={`py-2 px-2 text-2xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  filter.transactionType === 'all'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                همه
              </button>

              <button
                type="button"
                onClick={() => onFilterChange({ ...filter, transactionType: 'خرید و فروش' })}
                className={`py-2 px-2 text-2xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  filter.transactionType === 'خرید و فروش'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                خرید و فروش
              </button>

              <button
                type="button"
                onClick={() => onFilterChange({ ...filter, transactionType: 'رهن و اجاره' })}
                className={`py-2 px-2 text-2xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  filter.transactionType === 'رهن و اجاره'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                رهن و اجاره
              </button>
            </div>
          )}
        </div>

        {/* 4. Property Types */}
        <div className="pt-4 space-y-2">
          <button
            type="button"
            onClick={() => toggleSection('propertyType')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
          >
            <span>نوع ملک:</span>
            {openSections.propertyType ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSections.propertyType && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {availablePropertyTypes.map((type) => {
                const active = filter.propertyTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeToggle(type)}
                    className={`text-2xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Pricing: Sale Price (if not pure rent) */}
        {filter.transactionType !== 'رهن و اجاره' && (
          <div className="pt-4 space-y-2">
            <button
              type="button"
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
            >
              <span>قیمت خرید (تومان):</span>
              {openSections.price ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {openSections.price && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-2xs text-slate-400 block mb-0.5">از:</label>
                    <input
                      type="number"
                      value={filter.minPrice ?? ''}
                      onChange={(e) =>
                        onFilterChange({
                          ...filter,
                          minPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="حداقل قیمت"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>

                  <div>
                    <label className="text-2xs text-slate-400 block mb-0.5">تا:</label>
                    <input
                      type="number"
                      value={filter.maxPrice ?? ''}
                      onChange={(e) =>
                        onFilterChange({
                          ...filter,
                          maxPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="حداکثر قیمت"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {pricePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        onFilterChange({
                          ...filter,
                          minPrice: preset.min,
                          maxPrice: preset.max,
                        })
                      }
                      className="text-2xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. Pricing: Deposit & Rent (if rent or all) */}
        {filter.transactionType !== 'خرید و فروش' && (
          <div className="pt-4 space-y-2">
            <button
              type="button"
              onClick={() => toggleSection('rent')}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-blue-700">
                <Key className="w-3.5 h-3.5" />
                <span>رهن و اجاره ماهیانه:</span>
              </div>
              {openSections.rent ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {openSections.rent && (
              <div className="space-y-3 pt-1">
                {/* Deposit */}
                <div className="space-y-1">
                  <span className="text-2xs font-semibold text-slate-600 block">سقف مبلغ ودیعه (رهن):</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filter.minDeposit ?? ''}
                      onChange={(e) =>
                        onFilterChange({
                          ...filter,
                          minDeposit: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="حداقل ودیعه"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                    <input
                      type="number"
                      value={filter.maxDeposit ?? ''}
                      onChange={(e) =>
                        onFilterChange({
                          ...filter,
                          maxDeposit: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="حداکثر ودیعه"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {depositPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          onFilterChange({
                            ...filter,
                            minDeposit: preset.min,
                            maxDeposit: preset.max,
                          })
                        }
                        className="text-2xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 hover:bg-blue-100"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rent */}
                <div className="space-y-1">
                  <span className="text-2xs font-semibold text-slate-600 block">سقف اجاره ماهیانه:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filter.minRent ?? ''}
                      onChange={(e) =>
                        onFilterChange({
                          ...filter,
                          minRent: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="حداقل اجاره"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                    <input
                      type="number"
                      value={filter.maxRent ?? ''}
                      onChange={(e) =>
                        onFilterChange({
                          ...filter,
                          maxRent: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="حداکثر اجاره"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {rentPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          onFilterChange({
                            ...filter,
                            minRent: preset.min,
                            maxRent: preset.max,
                          })
                        }
                        className="text-2xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. Area (Metrage) */}
        <div className="pt-4 space-y-2">
          <button
            type="button"
            onClick={() => toggleSection('area')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
          >
            <span>متراژ (متر مربع):</span>
            {openSections.area ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSections.area && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filter.minArea ?? ''}
                  onChange={(e) =>
                    onFilterChange({
                      ...filter,
                      minArea: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="حداقل متراژ"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
                />
                <input
                  type="number"
                  value={filter.maxArea ?? ''}
                  onChange={(e) =>
                    onFilterChange({
                      ...filter,
                      maxArea: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="حداکثر متراژ"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {areaPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filter,
                        minArea: preset.min,
                        maxArea: preset.max,
                      })
                    }
                    className="text-2xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 8. Rooms */}
        <div className="pt-4 space-y-2">
          <button
            type="button"
            onClick={() => toggleSection('rooms')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
          >
            <span>تعداد اتاق:</span>
            {openSections.rooms ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSections.rooms && (
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[1, 2, 3, 4].map((r) => {
                const active = filter.rooms.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoomToggle(r)}
                    className={`py-1.5 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {r === 4 ? '+۴ خواب' : `${fmt(r)} خواب`}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 9. Amenities: Parking, Elevator, Storage */}
        <div className="pt-4 space-y-2">
          <button
            type="button"
            onClick={() => toggleSection('amenities')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
          >
            <span>امکانات رفاهی:</span>
            {openSections.amenities ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSections.amenities && (
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">پارکینگ:</span>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-2xs">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filter, parking: 'all' })}
                    className={`px-2 py-1 rounded ${filter.parking === 'all' ? 'bg-white font-bold shadow-xs' : 'text-slate-500'}`}
                  >
                    همه
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filter, parking: 'yes' })}
                    className={`px-2 py-1 rounded ${filter.parking === 'yes' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'}`}
                  >
                    دارد
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filter, parking: 'no' })}
                    className={`px-2 py-1 rounded ${filter.parking === 'no' ? 'bg-rose-600 text-white font-bold' : 'text-slate-500'}`}
                  >
                    ندارد
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">آسانسور:</span>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-2xs">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filter, elevator: 'all' })}
                    className={`px-2 py-1 rounded ${filter.elevator === 'all' ? 'bg-white font-bold shadow-xs' : 'text-slate-500'}`}
                  >
                    همه
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filter, elevator: 'yes' })}
                    className={`px-2 py-1 rounded ${filter.elevator === 'yes' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'}`}
                  >
                    دارد
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filter, elevator: 'no' })}
                    className={`px-2 py-1 rounded ${filter.elevator === 'no' ? 'bg-rose-600 text-white font-bold' : 'text-slate-500'}`}
                  >
                    ندارد
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">انباری:</span>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-2xs">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filter, storage: 'all' })}
                    className={`px-2 py-1 rounded ${filter.storage === 'all' ? 'bg-white font-bold shadow-xs' : 'text-slate-500'}`}
                  >
                    همه
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filter, storage: 'yes' })}
                    className={`px-2 py-1 rounded ${filter.storage === 'yes' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'}`}
                  >
                    دارد
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filter, storage: 'no' })}
                    className={`px-2 py-1 rounded ${filter.storage === 'no' ? 'bg-rose-600 text-white font-bold' : 'text-slate-500'}`}
                  >
                    ندارد
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
