import React, { useState } from 'react';
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
  ChevronRight,
  ExternalLink,
  Tag,
  Edit,
  Trash2,
  Images,
} from 'lucide-react';
import { RealEstateItem } from '../types';
import { formatPrice, formatPriceShort, toPersianDigits } from '../utils/formatters';

interface PropertyCardListProps {
  items: RealEstateItem[];
  onSelectItem: (item: RealEstateItem) => void;
  usePersianDigits: boolean;
  isExcelMode?: boolean;
  onEditItem?: (item: RealEstateItem) => void;
  onDeleteItem?: (item: RealEstateItem) => void;
}

// Subcomponent for card image carousel to browse all images
const CardImageCarousel: React.FC<{
  images: string[];
  title: string;
  usePersianDigits: boolean;
}> = ({ images, title, usePersianDigits }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const fmt = (n: number | string) => (usePersianDigits ? toPersianDigits(n) : n);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-44 bg-slate-900 overflow-hidden group/img">
      <img
        src={images[currentIndex]}
        alt={`${title} - عکس ${currentIndex + 1}`}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-300"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Prev / Next controls */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs opacity-0 group-hover/img:opacity-100"
            title="عکس قبلی"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs opacity-0 group-hover/img:opacity-100"
            title="عکس بعدی"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots / Counter */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
            <Images className="w-2.5 h-2.5 text-indigo-300" />
            <span>
              {fmt(currentIndex + 1)} / {fmt(images.length)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export const PropertyCardList: React.FC<PropertyCardListProps> = ({
  items,
  onSelectItem,
  usePersianDigits,
  isExcelMode = false,
  onEditItem,
  onDeleteItem,
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
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
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
        const isRent = item.transactionType === 'رهن و اجاره' || Boolean(item.deposit || item.rent);
        const cardImages = item.images && item.images.length > 0 ? item.images : item.imageUrl ? [item.imageUrl] : [];

        return (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Image Carousel (supporting all photos) */}
              {cardImages.length > 0 ? (
                <div className="relative">
                  <CardImageCarousel
                    images={cardImages}
                    title={item.title || item.address}
                    usePersianDigits={usePersianDigits}
                  />

                  {/* Badges on top of image */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-black/60 text-white backdrop-blur-xs border border-white/20">
                      ردیف {fmt(item.rowNumber)}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-2xs font-bold text-white shadow-xs ${
                        isRent ? 'bg-blue-600' : 'bg-emerald-600'
                      }`}
                    >
                      {isRent ? 'رهن و اجاره' : 'خرید و فروش'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 pb-0 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">ردیف {fmt(item.rowNumber)}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-2xs font-bold text-white ${
                        isRent ? 'bg-blue-600' : 'bg-emerald-600'
                      }`}
                    >
                      {isRent ? 'رهن و اجاره' : 'خرید و فروش'}
                    </span>
                    {getTypeBadge(item.propertyType)}
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Title & Type */}
                <div>
                  {cardImages.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {getTypeBadge(item.propertyType)}
                      {item.district && (
                        <span className="text-2xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {item.district}
                        </span>
                      )}
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.title || item.address}
                  </h3>

                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{item.address}</span>
                  </p>
                </div>

                {/* Price Display */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    isRent ? 'bg-blue-50/60 border-blue-100' : 'bg-emerald-50/60 border-emerald-100'
                  }`}
                >
                  {isRent ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">رهن / ودیعه:</span>
                        <span className="font-bold text-blue-900">
                          {item.deposit && item.deposit > 0 ? `${formatPriceShort(item.deposit, usePersianDigits)}` : 'توافقی'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">اجاره ماهیانه:</span>
                        <span className="font-bold text-blue-900">
                          {item.rent && item.rent > 0 ? `${formatPriceShort(item.rent, usePersianDigits)}` : 'رهن کامل'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-base font-black text-emerald-900">
                        {item.price > 0 ? `${formatPrice(item.price, usePersianDigits)} تومان` : item.priceText || 'توافقی'}
                      </div>
                      {item.price > 0 && (
                        <div className="text-2xs text-emerald-700 font-semibold mt-0.5 flex justify-between items-center">
                          <span>{formatPriceShort(item.price, usePersianDigits)}</span>
                          <span>
                            متری {fmt(item.pricePerMeter ? formatPrice(item.pricePerMeter, usePersianDigits) : Math.round(item.price / (item.area || 1)))}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Specs Pill Grid */}
                <div className="grid grid-cols-3 gap-2 text-2xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                  <div className="flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">{fmt(item.area)}</span> متر
                  </div>

                  <div className="flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">{fmt(item.rooms)}</span> خواب
                  </div>

                  <div className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      طبقه <strong className="text-slate-800">{item.floor === 0 ? 'همکف' : fmt(item.floor)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Amenities & CRUD (in Excel mode) */}
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
              {/* Amenities icons */}
              <div className="flex items-center gap-2">
                <span className={item.hasParking ? 'text-emerald-600 font-semibold' : 'text-slate-300'} title="پارکینگ">
                  <Car className="w-3.5 h-3.5" />
                </span>
                <span className={item.hasElevator ? 'text-emerald-600 font-semibold' : 'text-slate-300'} title="آسانسور">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </span>
                <span className={item.hasStorage ? 'text-emerald-600 font-semibold' : 'text-slate-300'} title="انباری">
                  <Warehouse className="w-3.5 h-3.5" />
                </span>
                {item.relativeTime && (
                  <span className="text-[10px] text-slate-400 mr-1">{item.relativeTime}</span>
                )}
              </div>

              {/* If Excel mode: Edit & Delete buttons */}
              {isExcelMode ? (
                <div className="flex items-center gap-1">
                  {onEditItem && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditItem(item);
                      }}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="ویرایش ملک"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteItem && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="حذف ملک"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-600 font-medium">
                  <span>جزئیات</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
