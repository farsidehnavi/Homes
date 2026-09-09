import React from 'react';
import {
  MapPin,
  Maximize2,
  BedDouble,
  Layers,
  Clock,
  Car,
  Warehouse,
  ArrowUpDown,
  Building2,
  ChevronLeft,
} from 'lucide-react';
import { RealEstateItem } from '../types';
import { formatPrice, formatPriceShort, toPersianDigits } from '../utils/formatters';

interface PropertyCardListProps {
  items: RealEstateItem[];
  onSelectItem: (item: RealEstateItem) => void;
  usePersianDigits: boolean;
}

export const PropertyCardList: React.FC<PropertyCardListProps> = ({
  items,
  onSelectItem,
  usePersianDigits,
}) => {
  const fmt = (n: number | string) => (usePersianDigits ? toPersianDigits(n) : n);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ویلایی':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ویلایی
          </span>
        );
      case 'کلنگی':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            کلنگی
          </span>
        );
      case 'دوبلکس':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            دوبلکس
          </span>
        );
      case 'آپارتمان':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {type}
          </span>
        );
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">هیچ ملکی با فیلترهای کنونی یافت نشد</h3>
        <p className="text-xs text-slate-400 mt-1">
          برای مشاهده نتایج، فیلترها را تغییر داده یا بازنشانی کنید
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => {
        return (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="bg-white rounded-xl border border-slate-200 hover:border-indigo-400 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Top row: Row ID + Type Badge + Document Type */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {fmt(item.rowNumber)}
                  </span>
                  {getTypeBadge(item.propertyType)}
                </div>

                <span className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                  سند: {item.documentType}
                </span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-1.5 text-slate-800 font-semibold text-xs sm:text-sm leading-snug mb-3">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item.address}</span>
              </div>

              {/* Price Highlight */}
              <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] text-slate-500">قیمت کل:</span>
                  <div className="text-left">
                    <div className="text-base font-black text-slate-900">
                      {formatPrice(item.price, usePersianDigits)}{' '}
                      <span className="text-xs font-normal text-slate-500">تومان</span>
                    </div>
                    <div className="text-xs font-semibold text-indigo-700">
                      {formatPriceShort(item.price, usePersianDigits)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500">قیمت هر متر مربع:</span>
                  <span className="font-bold text-slate-800">
                    {formatPrice(item.pricePerMeter || 0, usePersianDigits)} تومان
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs mb-3">
                <div className="bg-slate-50/70 p-1.5 rounded border border-slate-100">
                  <span className="block text-[10px] text-slate-400">متراژ</span>
                  <span className="font-bold text-slate-800">{fmt(item.area)} م²</span>
                </div>

                <div className="bg-slate-50/70 p-1.5 rounded border border-slate-100">
                  <span className="block text-[10px] text-slate-400">اتاق</span>
                  <span className="font-bold text-slate-800">{fmt(item.rooms)}</span>
                </div>

                <div className="bg-slate-50/70 p-1.5 rounded border border-slate-100">
                  <span className="block text-[10px] text-slate-400">طبقه</span>
                  <span className="font-bold text-slate-800">
                    {item.floor === 0 ? 'همکف' : `${fmt(item.floor)}/${fmt(item.totalFloors)}`}
                  </span>
                </div>

                <div className="bg-slate-50/70 p-1.5 rounded border border-slate-100">
                  <span className="block text-[10px] text-slate-400">سن بنا</span>
                  <span className="font-bold text-slate-800">
                    {item.age === 0 ? 'نوساز' : `${fmt(item.age)} سال`}
                  </span>
                </div>
              </div>

              {/* Extra info: Orientation & Facade */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-1">
                <span>جهت: <strong className="text-slate-700">{item.orientation}</strong></span>
                <span>نما: <strong className="text-slate-700">{item.facade}</strong></span>
              </div>
            </div>

            {/* Bottom Row: Amenities & Action */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  title={`پارکینگ: ${item.hasParking ? 'دارد' : 'ندارد'}`}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                    item.hasParking
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
                  }`}
                >
                  <Car className="w-3 h-3" />
                  <span>پارکینگ</span>
                </span>

                <span
                  title={`آسانسور: ${item.hasElevator ? 'دارد' : 'ندارد'}`}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                    item.hasElevator
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
                  }`}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>آسانسور</span>
                </span>

                <span
                  title={`انباری: ${item.hasStorage ? 'دارد' : 'ندارد'}`}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                    item.hasStorage
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
                  }`}
                >
                  <Warehouse className="w-3 h-3" />
                  <span>انباری</span>
                </span>
              </div>

              <div className="text-indigo-600 text-xs font-semibold flex items-center gap-0.5 group-hover:-translate-x-1 transition-transform">
                <span>جزئیات</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
