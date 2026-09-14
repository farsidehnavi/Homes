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
  ExternalLink,
  Tag,
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
      case 'زمین / کلنگی':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            زمین / کلنگی
          </span>
        );
      case 'دوبلکس':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            دوبلکس
          </span>
        );
      case 'خانه مسکونی':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
            خانه مسکونی
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
            className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Optional Divar Image */}
              {item.imageUrl ? (
                <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title || item.address}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

                  {/* Top Left/Right Badges */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-bold">
                      {fmt(item.rowNumber)}
                    </span>
                    {getTypeBadge(item.propertyType)}
                  </div>

                  {item.divarUrl && (
                    <a
                      href={item.divarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-black/50 hover:bg-red-600 text-white transition-colors"
                      title="مشاهده مستقیم در دیوار"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Bottom info on image */}
                  <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-between text-white text-2xs">
                    {item.district && (
                      <span className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400" />
                        {item.district}
                      </span>
                    )}

                    {item.relativeTime && (
                      <span className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-300" />
                        {item.relativeTime}
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="p-4">
                {/* If no image, show row ID & badges header */}
                {!item.imageUrl && (
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                        {fmt(item.rowNumber)}
                      </span>
                      {getTypeBadge(item.propertyType)}
                    </div>

                    {item.district && (
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {item.district}
                      </span>
                    )}
                  </div>
                )}

                {/* Title / Address */}
                <div className="mb-3">
                  <h4 className="text-slate-900 font-bold text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {item.title || item.address}
                  </h4>
                  {item.title && item.title !== item.address && (
                    <div className="flex items-center gap-1 text-slate-500 text-2xs mt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{item.address}</span>
                    </div>
                  )}
                </div>

                {/* Price Highlight */}
                <div className="bg-slate-50 rounded-xl p-2.5 mb-3 border border-slate-100">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] text-slate-500">قیمت:</span>
                    <div className="text-left">
                      {item.price > 0 ? (
                        <>
                          <div className="text-base font-black text-slate-900">
                            {formatPrice(item.price, usePersianDigits)}{' '}
                            <span className="text-xs font-normal text-slate-500">تومان</span>
                          </div>
                          <div className="text-xs font-semibold text-indigo-700">
                            {formatPriceShort(item.price, usePersianDigits)}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm font-bold text-amber-700">
                          {item.priceText || 'توافقی / قیمت پیشنهادی'}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.pricePerMeter ? (
                    <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-500">هر متر مربع:</span>
                      <span className="font-bold text-slate-800">
                        {formatPrice(item.pricePerMeter, usePersianDigits)} تومان
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs mb-3">
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400">متراژ</span>
                    <span className="font-bold text-slate-800">{fmt(item.area)} م²</span>
                  </div>

                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400">اتاق</span>
                    <span className="font-bold text-slate-800">{fmt(item.rooms)}</span>
                  </div>

                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400">طبقه</span>
                    <span className="font-bold text-slate-800">
                      {item.floor === 0 ? 'همکف' : `${fmt(item.floor)}/${fmt(item.totalFloors)}`}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400">سن بنا</span>
                    <span className="font-bold text-slate-800">
                      {item.age === 0 ? 'نوساز' : `${fmt(item.age)} سال`}
                    </span>
                  </div>
                </div>

                {/* Extra info: Orientation & Facade */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 px-1">
                  <span>جهت: <strong className="text-slate-700">{item.orientation}</strong></span>
                  <span>سند: <strong className="text-slate-700">{item.documentType}</strong></span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Amenities & Action */}
            <div className="p-3 pt-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  title={`پارکینگ: ${item.hasParking ? 'دارد' : 'ندارد'}`}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                    item.hasParking
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
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
                      : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
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
                      : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
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

