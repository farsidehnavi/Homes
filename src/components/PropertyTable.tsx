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
  ExternalLink,
  MapPin,
  Clock,
  Images,
  Edit,
  Trash2,
  PlusCircle,
  Tag,
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
  isExcelMode?: boolean;
  onAddNewProperty?: () => void;
  onEditItem?: (item: RealEstateItem) => void;
  onDeleteItem?: (item: RealEstateItem) => void;
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
  isExcelMode = false,
  onAddNewProperty,
  onEditItem,
  onDeleteItem,
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
      case 'زمین / کلنگی':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            زمین / کلنگی
          </span>
        );
      case 'دوبلکس':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            دوبلکس
          </span>
        );
      case 'خانه مسکونی':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
            خانه مسکونی
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Table Action Bar */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {isExcelMode ? 'جدول املاک داشبورد من' : 'جدول آگهی‌های پنل دیوار (نجف‌آباد)'}
          </span>
          <span className="text-xs text-slate-500 font-normal">
            ({fmt(filteredCount)} مورد یافت شده)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* If Excel Mode: Add New Property Button */}
          {isExcelMode && onAddNewProperty && (
            <button
              onClick={onAddNewProperty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ افزودن ملک جدید</span>
            </button>
          )}

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>خروجی اکسل ({fmt(filteredCount)})</span>
          </button>
        </div>
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

              <th className="py-3 px-2 text-center w-14">
                <span>تصاویر</span>
              </th>

              <th className="py-3 px-3 min-w-[220px]">
                <span>عنوان ملک و محله</span>
              </th>

              <th className="py-3 px-2 text-center whitespace-nowrap">
                <span>معامله</span>
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
                  <span>متراژ (م²)</span>
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
                  <span>قدمت</span>
                  {getSortIcon('age')}
                </div>
              </th>

              <th className="py-3 px-2 text-center w-10">
                <span title="پارکینگ">پارکینگ</span>
              </th>

              <th className="py-3 px-2 text-center w-10">
                <span title="آسانسور">آسانسور</span>
              </th>

              <th className="py-3 px-2 text-center w-10">
                <span title="انباری">انباری</span>
              </th>

              <th
                onClick={() => onSort('price')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 transition-colors text-left min-w-[150px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>قیمت کل / رهن و اجاره</span>
                  {getSortIcon('price')}
                </div>
              </th>

              {isExcelMode ? (
                <th className="py-3 px-3 text-center w-24">
                  <span>عملیات (ویرایش/حذف)</span>
                </th>
              ) : (
                <th className="py-3 px-3 text-center w-20">
                  <span>مشاهده</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-12 text-center text-slate-500">
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
              items.map((item) => {
                const isRent = item.transactionType === 'رهن و اجاره' || Boolean(item.deposit || item.rent);
                const photoCount = item.images ? item.images.length : item.imageUrl ? 1 : 0;

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                  >
                    {/* Row number */}
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-500 group-hover:text-indigo-600">
                      {fmt(item.rowNumber)}
                    </td>

                    {/* Thumbnail Image with photo count badge */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="relative inline-block">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover mx-auto border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                            <Building2 className="w-4 h-4" />
                          </div>
                        )}
                        {photoCount > 1 && (
                          <span
                            className="absolute -bottom-1 -left-1 px-1 py-0.2 bg-black/75 text-white rounded text-[9px] font-bold shadow-xs"
                            title={`${fmt(photoCount)} تصویر`}
                          >
                            {fmt(photoCount)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Title / District */}
                    <td className="py-2.5 px-3 font-medium text-slate-900 leading-relaxed">
                      <div className="font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {item.title || item.address}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-2xs text-slate-500 mt-1">
                        {item.district && (
                          <span className="inline-flex items-center gap-0.5 bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            <MapPin className="w-2.5 h-2.5 text-red-500" />
                            {item.district}
                          </span>
                        )}
                        {item.relativeTime && (
                          <span className="inline-flex items-center gap-0.5 text-slate-400">
                            <Clock className="w-2.5 h-2.5" />
                            {item.relativeTime}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Transaction Type */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold ${
                          isRent
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isRent ? 'رهن و اجاره' : 'خرید و فروش'}
                      </span>
                    </td>

                    {/* Property type */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getTypeBadge(item.propertyType)}
                    </td>

                    {/* Area */}
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-800 whitespace-nowrap">
                      {fmt(item.area)} <span className="text-[10px] text-slate-500 font-normal">م²</span>
                    </td>

                    {/* Rooms */}
                    <td className="py-2.5 px-3 text-center text-slate-700 font-medium whitespace-nowrap">
                      {fmt(item.rooms)}
                    </td>

                    {/* Floor */}
                    <td className="py-2.5 px-3 text-center text-slate-700 whitespace-nowrap">
                      {item.floor === 0 ? 'همکف' : `${fmt(item.floor)} از ${fmt(item.totalFloors)}`}
                    </td>

                    {/* Age */}
                    <td className="py-2.5 px-3 text-center text-slate-700 whitespace-nowrap">
                      {item.age === 0 ? 'نوساز' : `${fmt(item.age)} سال`}
                    </td>

                    {/* Parking */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      {renderBooleanBadge(item.hasParking)}
                    </td>

                    {/* Elevator */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      {renderBooleanBadge(item.hasElevator)}
                    </td>

                    {/* Storage */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      {renderBooleanBadge(item.hasStorage)}
                    </td>

                    {/* Pricing */}
                    <td className="py-2.5 px-3 text-left whitespace-nowrap">
                      {isRent ? (
                        <div className="text-right">
                          <div className="font-bold text-blue-900 text-xs">
                            {item.deposit && item.deposit > 0 ? `رهن: ${formatPriceShort(item.deposit, usePersianDigits)}` : 'ودیعه: توافقی'}
                          </div>
                          <div className="text-2xs text-blue-700 font-semibold">
                            {item.rent && item.rent > 0 ? `اجاره: ${formatPriceShort(item.rent, usePersianDigits)}` : 'رهن کامل'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="font-black text-emerald-900 text-xs">
                            {item.price > 0 ? `${formatPrice(item.price, usePersianDigits)} تومان` : item.priceText || 'توافقی'}
                          </div>
                          {item.price > 0 && (
                            <div className="text-2xs text-slate-400">
                              متری {fmt(item.pricePerMeter ? formatPrice(item.pricePerMeter, usePersianDigits) : Math.round(item.price / (item.area || 1)))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions: Edit & Delete (Excel) or View Details (Divar) */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {isExcelMode ? (
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {onEditItem && (
                            <button
                              type="button"
                              onClick={() => onEditItem(item)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="ویرایش ملک"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteItem && (
                            <button
                              type="button"
                              onClick={() => onDeleteItem(item)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف ملک"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 text-2xs font-semibold py-1 px-2 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده</span>
                        </button>
                      )}
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
