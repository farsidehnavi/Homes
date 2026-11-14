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
  Camera,
  Lock,
} from 'lucide-react';
import { RealEstateItem, SortField, SortOrder } from '../types';
import { formatPrice, formatPriceShort, toPersianDigits, formatBuiltYear } from '../utils/formatters';

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
  onAddToExcel?: (item: RealEstateItem) => void;
  canEditItem?: (item: RealEstateItem) => boolean;
  canDeleteItem?: (item: RealEstateItem) => boolean;
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
  onAddToExcel,
  canEditItem,
  canDeleteItem,
}) => {
  const fmt = (n: number | string) => (usePersianDigits ? toPersianDigits(n) : n);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 font-bold" />
    );
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ویلایی':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70">
            ویلایی
          </span>
        );
      case 'کلنگی':
      case 'زمین / کلنگی':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70">
            زمین / کلنگی
          </span>
        );
      case 'دوبلکس':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/70">
            دوبلکس
          </span>
        );
      case 'خانه مسکونی':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/70">
            خانه مسکونی
          </span>
        );
      case 'آپارتمان':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/70">
            {type}
          </span>
        );
    }
  };

  const renderBooleanBadge = (has?: boolean | null) => {
    if (has === undefined || has === null) {
      return (
        <span className="text-slate-300 dark:text-slate-600 text-xs font-semibold select-none" title="در آگهی ذکر نشده">
          —
        </span>
      );
    }
    return has ? (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 text-xs" title="دارد">
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
      </span>
    ) : (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs" title="ندارد">
        <X className="w-3.5 h-3.5" />
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col transition-colors">
      {/* Table Action Bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
            {isExcelMode ? 'جدول املاک داشبورد من' : 'جدول آگهی‌های پنل دیوار (نجف‌آباد)'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>خروجی اکسل ({fmt(filteredCount)})</span>
          </button>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs border-collapse">
          <thead className="bg-slate-100/80 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 select-none">
            <tr>
              <th
                onClick={() => onSort('rowNumber')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors w-12 text-center"
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
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>نوع ملک</span>
                  {getSortIcon('propertyType')}
                </div>
              </th>

              <th
                onClick={() => onSort('area')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>متراژ (م²)</span>
                  {getSortIcon('area')}
                </div>
              </th>

              <th
                onClick={() => onSort('rooms')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>اتاق</span>
                  {getSortIcon('rooms')}
                </div>
              </th>

              <th
                onClick={() => onSort('floor')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>طبقه</span>
                  {getSortIcon('floor')}
                </div>
              </th>

              <th
                onClick={() => onSort('age')}
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>سال ساخت</span>
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
                className="py-3 px-3 cursor-pointer group hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors text-left min-w-[150px]"
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

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2 py-6">
                    <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {filteredCount === 0
                        ? 'این داشبورد در حال حاضر خالی است'
                        : 'هیچ ملکی با فیلترهای انتخاب شده یافت نشد'}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {filteredCount === 0
                        ? 'فایل اکسل خود را آپلود کرده یا با زدن دکمه «+ ملک» در گوشه پایین، اولین ملک را ثبت نمایید.'
                        : 'لطفاً فیلترها را تغییر داده یا بازنشانی کنید'}
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
                    className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer group"
                  >
                    {/* Row number */}
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
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
                            className="w-10 h-10 rounded-lg object-cover mx-auto border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : isExcelMode ? (
                          <div
                            onClick={(e) => {
                              if (onEditItem) {
                                e.stopPropagation();
                                onEditItem(item);
                              }
                            }}
                            className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 mx-auto transition-colors cursor-pointer"
                            title="کلیک برای افزودن عکس به این ملک"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-bold mt-0.5 leading-none">+ عکس</span>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto">
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
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                      <div className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title || item.address}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-2xs text-slate-500 dark:text-slate-400 mt-1">
                        {item.district && (
                          <span className="inline-flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">
                            <MapPin className="w-2.5 h-2.5 text-red-500" />
                            {item.district}
                          </span>
                        )}
                        {item.relativeTime && (
                          <span className="inline-flex items-center gap-0.5 text-slate-400 dark:text-slate-500">
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
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/70'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70'
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
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {item.area && item.area > 0 ? (
                        <div>
                          <div>
                            {fmt(item.area)} <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">م²</span>
                          </div>
                          {item.buildingArea && item.landArea && item.buildingArea !== item.landArea && (
                            <div className="text-3xs text-slate-400 dark:text-slate-500 font-normal">
                              ({fmt(item.buildingArea)} بنا)
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-normal text-2xs">ذکر نشده</span>
                      )}
                    </td>

                    {/* Rooms */}
                    <td className="py-2.5 px-3 text-center text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {item.rooms !== undefined && item.rooms > 0 ? fmt(item.rooms) : <span className="text-slate-400 dark:text-slate-500">—</span>}
                    </td>

                    {/* Floor */}
                    <td className="py-2.5 px-3 text-center text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {item.floor !== undefined ? (
                        item.floor === 0 ? 'همکف' : `${fmt(item.floor)} ${item.totalFloors ? `از ${fmt(item.totalFloors)}` : ''}`
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>

                    {/* Built Year */}
                    <td className="py-2.5 px-3 text-center text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium">
                      {formatBuiltYear(item, usePersianDigits)}
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
                          <div className="font-bold text-blue-900 dark:text-blue-300 text-xs">
                            {item.deposit && item.deposit > 0
                              ? `رهن: ${formatPriceShort(item.deposit, usePersianDigits)}`
                              : item.depositText
                              ? `رهن: ${item.depositText}`
                              : 'ودیعه: توافقی'}
                          </div>
                          <div className="text-2xs text-blue-700 dark:text-blue-400 font-semibold">
                            {item.rent && item.rent > 0
                              ? `اجاره: ${formatPriceShort(item.rent, usePersianDigits)}`
                              : item.rentText
                              ? `اجاره: ${item.rentText}`
                              : item.deposit && item.deposit > 0
                              ? 'رهن کامل'
                              : 'توافقی'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="font-black text-emerald-900 dark:text-emerald-300 text-xs">
                            {item.price && item.price > 0 ? `${formatPrice(item.price, usePersianDigits)} تومان` : item.priceText || 'توافقی'}
                          </div>
                          {(item.pricePerMeter || (item.price && item.area && item.area > 0)) && (
                            <div className="text-2xs text-slate-400 dark:text-slate-500">
                              متری {fmt(item.pricePerMeter ? formatPrice(item.pricePerMeter, usePersianDigits) : formatPrice(Math.round(item.price! / item.area!), usePersianDigits))}
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
                            canEditItem && !canEditItem(item) ? (
                              <span
                                className="p-1.5 text-slate-300 dark:text-slate-600 rounded-lg cursor-not-allowed inline-flex items-center"
                                title={`این ملک توسط «${item.createdByUsername || 'کاربر دیگر'}» در اکسل مدیر ثبت شده و برای شما قفل است.`}
                              >
                                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onEditItem(item)}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors cursor-pointer"
                                title="ویرایش ملک"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                          {onDeleteItem && (!canDeleteItem || canDeleteItem(item)) && (
                            <button
                              type="button"
                              onClick={() => onDeleteItem(item)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                              title="حذف ملک"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!isExcelMode && item.source !== 'excel' && onAddToExcel && (
                            <button
                              type="button"
                              onClick={() => onAddToExcel(item)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-2xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-95 border border-emerald-200 dark:border-emerald-800/70 rounded-md transition-all cursor-pointer shadow-2xs"
                              title="افزودن مستقیم این ملک به جدول اکسل من"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>+ اکسل</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectItem(item)}
                            className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-2xs font-semibold py-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>مشاهده</span>
                          </button>
                        </div>
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
