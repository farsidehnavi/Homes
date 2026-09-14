import React, { useState } from 'react';
import {
  X,
  MapPin,
  Building2,
  Copy,
  CheckCheck,
  Car,
  Warehouse,
  ArrowUpDown,
  Maximize2,
  BedDouble,
  Layers,
  Clock,
  Compass,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { RealEstateItem } from '../types';
import { formatPrice, formatPriceShort, toPersianDigits } from '../utils/formatters';

interface PropertyDetailModalProps {
  item: RealEstateItem | null;
  onClose: () => void;
  usePersianDigits: boolean;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  item,
  onClose,
  usePersianDigits,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const fmt = (n: number | string) => (usePersianDigits ? toPersianDigits(n) : n);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(item.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optional Image Banner from Divar */}
        {item.imageUrl ? (
          <div className="relative w-full h-56 sm:h-64 bg-slate-900 overflow-hidden shrink-0">
            <img
              src={item.imageUrl}
              alt={item.title || item.address}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/30" />

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                ردیف {fmt(item.rowNumber)}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
                {item.propertyType}
              </span>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 right-4 left-4 text-white">
              <h3 className="text-base sm:text-lg font-bold leading-snug drop-shadow-sm">
                {item.title || item.address}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 mt-1.5">
                {item.district && (
                  <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {item.district}
                  </span>
                )}
                {item.relativeTime && (
                  <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-indigo-300" />
                    {item.relativeTime}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/80 sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  ردیف {fmt(item.rowNumber)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {item.propertyType}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
                  سند: {item.documentType}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {item.title || `اطلاعات کامل ملک در ${item.address.split('،')[1] || 'نجف‌آباد'}`}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 flex-1">
          {/* Address Box with copy & Divar link */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 text-slate-800 text-sm font-medium leading-relaxed">
              <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{item.address}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {item.divarUrl && (
                <a
                  href={item.divarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <span>دیوار</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>کپی</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Pricing Highlight Card */}
          <div className="bg-linear-to-br from-indigo-50 to-blue-50/50 border border-indigo-100 rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-indigo-700 font-medium block mb-1">
                  قیمت کل اعلامی:
                </span>
                {item.price > 0 ? (
                  <>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">
                      {formatPrice(item.price, usePersianDigits)}{' '}
                      <span className="text-xs font-normal text-slate-500">تومان</span>
                    </div>
                    <div className="text-xs font-bold text-indigo-800 mt-1">
                      معادل {formatPriceShort(item.price, usePersianDigits)}
                    </div>
                  </>
                ) : (
                  <div className="text-lg font-black text-amber-800">
                    {item.priceText || 'توافقی / پیشنهادی'}
                  </div>
                )}
              </div>

              <div className="sm:border-r sm:border-indigo-100 sm:pr-4">
                <span className="text-xs text-indigo-700 font-medium block mb-1">
                  قیمت هر متر مربع:
                </span>
                {item.pricePerMeter ? (
                  <div className="text-lg sm:text-xl font-bold text-slate-900">
                    {formatPrice(item.pricePerMeter, usePersianDigits)}{' '}
                    <span className="text-xs font-normal text-slate-500">تومان</span>
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-slate-600">محاسبه نشده</div>
                )}
                <div className="text-xs text-slate-500 mt-1">
                  مساحت: {fmt(item.area)} متر مربع
                </div>
              </div>
            </div>
          </div>

          {/* Specs Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              مشخصات کالبدی و فنی ساختمان
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>متراژ کل</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{fmt(item.area)} متر مربع</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                  <span>تعداد اتاق / خواب</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{fmt(item.rooms)} خواب</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>طبقه ساختمان</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {item.floor === 0 ? 'همکف' : `طبقه ${fmt(item.floor)} از ${fmt(item.totalFloors)}`}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>سن بنا (قدمت)</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {item.age === 0 ? 'نوساز' : `${fmt(item.age)} سال ساخت`}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  <span>موقعیت و جهت</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">جهت {item.orientation}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span>نمای ساختمان</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">نمای {item.facade}</div>
              </div>
            </div>
          </div>

          {/* Amenities Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              امتیازات و امکانات رفاهی
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${
                  item.hasParking
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <Car className="w-5 h-5 mb-1 text-inherit" />
                <span className="text-xs font-bold">پارکینگ اختصاصی</span>
                <span className="text-[11px] mt-0.5">
                  {item.hasParking ? 'دارد' : 'ندارد'}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${
                  item.hasElevator
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <ArrowUpDown className="w-5 h-5 mb-1 text-inherit" />
                <span className="text-xs font-bold">آسانسور</span>
                <span className="text-[11px] mt-0.5">
                  {item.hasElevator ? 'دارد' : 'ندارد'}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${
                  item.hasStorage
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <Warehouse className="w-5 h-5 mb-1 text-inherit" />
                <span className="text-xs font-bold">انباری</span>
                <span className="text-[11px] mt-0.5">
                  {item.hasStorage ? 'دارد' : 'ندارد'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {item.divarUrl && (
              <a
                href={item.divarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>مشاهده صفحه اصلی آگهی در divar.ir</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
