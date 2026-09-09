import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Building2,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { RealEstateItem, SortField, SortOrder } from '../types';
import { formatPrice, formatPriceShort, toPersianDigits } from '../utils/formatters';

interface PropertyTableProps {
  items: RealEstateItem[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onSelectItem: (item: RealEstateItem) => void;
  usePersianDigits: boolean;
  onExportExcel: () => void;
  filteredCount: number;
}

export const PropertyTable: React.FC<PropertyTableProps> = ({
  items,
  sortField,
  sortOrder,
  onSort,
  onSelectItem,
  usePersianDigits,
  onExportExcel,
  filteredCount,
}) => {
  const fmt = (n: number | string) => (usePersianDigits ? toPersianDigits(n) : n);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 font-bold" />
    );
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ویلایی':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ویلایی
          </span>
        );
      case 'کلنگی':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            کلنگی
          </span>
        );
      case 'دوبلکس':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            دوبلکس
          </span>
        );
      case 'آپارتمان':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            {type}
          </span>
        );
    }
  };

  const getDocBadge = (doc: string) => {
    switch (doc) {
      case 'تک برگ':
        return <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">تک برگ</span>;
      case 'منگوله‌دار':
        return <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">منگوله‌دار</span>;
      case 'قولنامه‌ای':
      default:
        return <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">قولنامه‌ای</span>;
    }
  };

  const renderBooleanBadge = (has: boolean) => {
    return has ? (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs" title="دارد">
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
      </span>
    ) : (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400 text-xs" title="ندارد">
        <X className="w-3.5 h-3.5" />
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Table Action Bar */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            جدول داده‌های املاک
          </span>
          <span className="text-xs text-slate-500 font-normal">
            ({fmt(filteredCount)} مورد)
          </span>
        </div>

        <button
          onClick={onExportExcel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>خروجی اکسل ({fmt(filteredCount)} مورد)</span>
        </button>
      </div>

      {/* Scrollable Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs border-collapse">
          <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10 select-none">
            <tr>
              <th
                onClick={() => onSort('rowNumber')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 transition-colors w-12 text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>ردیف</span>
                  {getSortIcon('rowNumber')}
                </div>
              </th>

              <th className="py-3 px-3 min-w-[220px]">
                <span>آدرس و نشانی ملک</span>
              </th>

              <th
                onClick={() => onSort('propertyType')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>نوع ملک</span>
                  {getSortIcon('propertyType')}
                </div>
              </th>

              <th
                onClick={() => onSort('area')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>متراژ (م² )</span>
                  {getSortIcon('area')}
                </div>
              </th>

              <th
                onClick={() => onSort('rooms')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>اتاق</span>
                  {getSortIcon('rooms')}
                </div>
              </th>

              <th
                onClick={() => onSort('floor')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>طبقه</span>
                  {getSortIcon('floor')}
                </div>
              </th>

              <th
                onClick={() => onSort('age')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>سن بنا</span>
                  {getSortIcon('age')}
                </div>
              </th>

              <th className="py-3 px-3 text-center">
                <span>جهت</span>
              </th>

              <th className="py-3 px-3 text-center">
                <span>نما</span>
              </th>

              <th className="py-3 px-2 text-center">
                <span>پارکینگ</span>
              </th>

              <th className="py-3 px-2 text-center">
                <span>آسانسور</span>
              </th>

              <th className="py-3 px-2 text-center">
                <span>انباری</span>
              </th>

              <th className="py-3 px-3 text-center">
                <span>نوع سند</span>
              </th>

              <th
                onClick={() => onSort('price')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 transition-colors text-left"
              >
                <div className="flex items-center justify-end gap-1">
                  {getSortIcon('price')}
                  <span>قیمت کل (تومان)</span>
                </div>
              </th>

              <th
                onClick={() => onSort('pricePerMeter')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 transition-colors text-left"
              >
                <div className="flex items-center justify-end gap-1">
                  {getSortIcon('pricePerMeter')}
                  <span>قیمت هر متر</span>
                </div>
              </th>

              <th className="py-3 px-3 text-center w-12">
                <span>جزئیات</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Building2 className="w-10 h-10 text-slate-300" />
                    <span className="text-sm font-semibold text-slate-700">
                      هیچ ملکی با فیلترهای انتخاب شده یافت نشد
                    </span>
                    <span className="text-xs text-slate-400">
                      لطفاً فیلترها را تغییر داده یا بازنشانی کنید
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                  >
                    {/* Row number */}
                    <td className="py-3 px-3 text-center font-semibold text-slate-500 group-hover:text-indigo-600">
                      {fmt(item.rowNumber)}
                    </td>

                    {/* Address */}
                    <td className="py-3 px-3 font-medium text-slate-900 leading-relaxed">
                      <div className="line-clamp-2 max-w-[280px]" title={item.address}>
                        {item.address}
                      </div>
                    </td>

                    {/* Property type */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getTypeBadge(item.propertyType)}
                    </td>

                    {/* Area */}
                    <td className="py-3 px-3 text-center font-semibold text-slate-800 whitespace-nowrap">
                      {fmt(item.area)} <span className="text-[10px] text-slate-500 font-normal">م²</span>
                    </td>

                    {/* Rooms */}
                    <td className="py-3 px-3 text-center text-slate-700 font-medium whitespace-nowrap">
                      {fmt(item.rooms)}
                    </td>

                    {/* Floor */}
                    <td className="py-3 px-3 text-center text-slate-700 whitespace-nowrap">
                      {item.floor === 0 ? 'همکف' : `${fmt(item.floor)} از ${fmt(item.totalFloors)}`}
                    </td>

                    {/* Age */}
                    <td className="py-3 px-3 text-center text-slate-700 whitespace-nowrap">
                      {item.age === 0 ? 'نوساز' : `${fmt(item.age)} سال`}
                    </td>

                    {/* Orientation */}
                    <td className="py-3 px-3 text-center text-slate-600 whitespace-nowrap">
                      {item.orientation}
                    </td>

                    {/* Facade */}
                    <td className="py-3 px-3 text-center text-slate-600 whitespace-nowrap">
                      {item.facade}
                    </td>

                    {/* Parking */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {renderBooleanBadge(item.hasParking)}
                    </td>

                    {/* Elevator */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {renderBooleanBadge(item.hasElevator)}
                    </td>

                    {/* Storage */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {renderBooleanBadge(item.hasStorage)}
                    </td>

                    {/* Document type */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {getDocBadge(item.documentType)}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 text-left whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {formatPrice(item.price, usePersianDigits)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {formatPriceShort(item.price, usePersianDigits)}
                      </div>
                    </td>

                    {/* Price per meter */}
                    <td className="py-3 px-3 text-left whitespace-nowrap">
                      <div className="font-semibold text-indigo-700">
                        {formatPrice(item.pricePerMeter || 0, usePersianDigits)}
                      </div>
                      <div className="text-[10px] text-slate-400">تومان/متر</div>
                    </td>

                    {/* View Details Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="مشاهده جزئیات کامل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
