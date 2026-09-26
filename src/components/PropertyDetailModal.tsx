import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Images,
  Tag,
  Loader2,
} from 'lucide-react';
import { RealEstateItem } from '../types';
import { formatPrice, formatPriceShort, toPersianDigits, formatDepositRent } from '../utils/formatters';

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [liveDivarImages, setLiveDivarImages] = useState<string[] | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Fetch real images live from Divar API for this specific post token
  useEffect(() => {
    setLiveDivarImages(null);
    setActiveImageIndex(0);

    if (item && item.divarToken) {
      setIsLoadingImages(true);
      fetch(`/api/divar/post/${item.divarToken}/images`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.images) && data.images.length > 0) {
            setLiveDivarImages(data.images);
          }
        })
        .catch((err) => {
          console.warn('Error fetching live Divar images:', err);
        })
        .finally(() => {
          setIsLoadingImages(false);
        });
    }
  }, [item]);

  // Extract all real images
  const allImages = useMemo(() => {
    if (liveDivarImages && liveDivarImages.length > 0) {
      return liveDivarImages;
    }
    if (!item) return [];
    if (item.images && item.images.length > 0) {
      return item.images;
    }
    if (item.imageUrl) {
      return [item.imageUrl];
    }
    return [];
  }, [liveDivarImages, item]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allImages.length <= 1) return;
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allImages, onClose]);

  if (!item) return null;

  const fmt = (n: number | string) => (usePersianDigits ? toPersianDigits(n) : n);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(item.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRent = item.transactionType === 'رهن و اجاره' || Boolean(item.deposit || item.rent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Real Divar Image Interactive Gallery */}
        {allImages.length > 0 ? (
          <div className="relative w-full bg-slate-950 flex flex-col shrink-0">
            {/* Main Active Image Viewport */}
            <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-slate-900 group">
              <img
                src={allImages[activeImageIndex]}
                alt={`${item.title || item.address} - تصویر واقعی دیوار ${activeImageIndex + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

              {/* Prev / Next Carousel Arrow Controls */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-lg"
                    title="تصویر قبلی دیوار (جهت راست)"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-lg"
                    title="تصویر بعدی دیوار (جهت چپ)"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Top Badges */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                  ردیف {fmt(item.rowNumber)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                    isRent ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}
                >
                  {isRent ? 'رهن و اجاره' : 'خرید و فروش'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800/80 backdrop-blur-md text-white border border-white/20">
                  {item.propertyType}
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs transition-colors cursor-pointer"
                title="بستن"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Real Divar Image Counter Badge */}
              <div className="absolute top-4 left-16 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5">
                {isLoadingImages ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                ) : (
                  <Images className="w-3.5 h-3.5 text-red-400" />
                )}
                <span>
                  عکس {fmt(activeImageIndex + 1)} از {fmt(allImages.length)} (تصاویر واقعی دیوار)
                </span>
              </div>

              {/* Bottom Image Overlay Details */}
              <div className="absolute bottom-3 right-4 left-4 text-white">
                <h3 className="text-base sm:text-lg font-bold leading-snug drop-shadow-md">
                  {item.title || item.address}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200 mt-1">
                  {item.district && (
                    <span className="flex items-center gap-1 bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      {item.district}
                    </span>
                  )}
                  {item.relativeTime && (
                    <span className="flex items-center gap-1 bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      <Clock className="w-3.5 h-3.5 text-indigo-300" />
                      {item.relativeTime}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail Ribbon of real Divar photos */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 p-2.5 bg-slate-900/95 overflow-x-auto border-t border-slate-800">
                <span className="text-2xs text-slate-400 shrink-0 px-1 font-semibold flex items-center gap-1">
                  <Images className="w-3 h-3 text-red-400" />
                  تمام {fmt(allImages.length)} عکس دیوار:
                </span>
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-red-500 scale-105 shadow-md ring-2 ring-red-500/40'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`تصویر دیوار ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 left-0 bg-black/70 text-white text-[9px] text-center font-bold">
                      {fmt(idx + 1)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Header when no photos were provided on Divar */
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                  ردیف {fmt(item.rowNumber)}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${
                    isRent ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}
                >
                  {isRent ? 'رهن و اجاره' : 'خرید و فروش'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  {item.propertyType}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title || item.address}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Scrollable Details Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Pricing Highlight Card */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isRent ? 'bg-blue-50/60 border-blue-200' : 'bg-emerald-50/60 border-emerald-200'
            }`}
          >
            {isRent ? (
              <>
                <div className="space-y-1">
                  <span className="text-2xs font-semibold text-blue-700 uppercase tracking-wide">
                    شرایط رهن و اجاره در دیوار:
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <span className="text-xs text-slate-500 block">مبلغ ودیعه / رهن:</span>
                      <span className="text-lg sm:text-xl font-black text-blue-900">
                        {item.deposit && item.deposit > 0 ? `${formatPrice(item.deposit)} تومان` : 'توافقی'}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-blue-200 hidden sm:block" />
                    <div>
                      <span className="text-xs text-slate-500 block">اجاره ماهیانه:</span>
                      <span className="text-lg sm:text-xl font-black text-blue-900">
                        {item.rent && item.rent > 0 ? `${formatPrice(item.rent)} تومان` : 'رهن کامل'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-blue-100 text-right">
                  <span className="text-2xs text-slate-500 block">متراژ واحد:</span>
                  <span className="text-base font-bold text-slate-900">{fmt(item.area)} متر مربع</span>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-0.5">
                  <span className="text-2xs font-semibold text-emerald-700 uppercase tracking-wide">
                    قیمت کل در دیوار:
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-900">
                    {item.price > 0 ? `${formatPrice(item.price)} تومان` : item.priceText || 'توافقی'}
                  </div>
                  {item.price > 0 && (
                    <div className="text-xs text-emerald-700 font-semibold">
                      معادل {formatPriceShort(item.price, usePersianDigits)}
                    </div>
                  )}
                </div>

                <div className="bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-emerald-100 text-right space-y-0.5">
                  <span className="text-2xs text-slate-500 block">قیمت هر متر مربع:</span>
                  <span className="text-base font-bold text-slate-900">
                    {item.pricePerMeter && item.pricePerMeter > 0
                      ? `${formatPrice(item.pricePerMeter)} تومان`
                      : fmt(Math.round(item.price / (item.area || 1)))}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Key Specifications Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>مشخصات فنی و ساختمانی ملک:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-2xs block mb-1">متراژ</span>
                <span className="font-bold text-slate-900">{fmt(item.area)} متر مربع</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-2xs block mb-1">تعداد اتاق</span>
                <span className="font-bold text-slate-900">{fmt(item.rooms)} خوابه</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-2xs block mb-1">طبقه</span>
                <span className="font-bold text-slate-900">
                  {item.floor === 0 ? 'همکف' : fmt(item.floor)} از {fmt(item.totalFloors)}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-2xs block mb-1">سن بنا</span>
                <span className="font-bold text-slate-900">
                  {item.age === 0 ? 'نوساز (صفر)' : `${fmt(item.age)} سال ساخت`}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-2xs block mb-1">جهت ساختمان</span>
                <span className="font-bold text-slate-900">{item.orientation}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-2xs block mb-1">نمای ساختمان</span>
                <span className="font-bold text-slate-900">{item.facade}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-2xs block mb-1">نوع سند</span>
                <span className="font-bold text-slate-900">{item.documentType}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-2xs block mb-1">نوع ملک</span>
                <span className="font-bold text-slate-900">{item.propertyType}</span>
              </div>
            </div>
          </div>

          {/* Amenities Badges */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-3">امکانات رفاهی:</h4>
            <div className="grid grid-cols-3 gap-3">
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  item.hasParking
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  <span>پارکینگ</span>
                </div>
                <span>{item.hasParking ? 'دارد' : 'ندارد'}</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  item.hasElevator
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>آسانسور</span>
                </div>
                <span>{item.hasElevator ? 'دارد' : 'ندارد'}</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  item.hasStorage
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4" />
                  <span>انباری</span>
                </div>
                <span>{item.hasStorage ? 'دارد' : 'ندارد'}</span>
              </div>
            </div>
          </div>

          {/* Address & Divar Link */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700">موقعیت و آدرس:</h4>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700 min-w-0">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span className="truncate">{item.address}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyAddress}
                className="flex items-center gap-1 text-2xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shrink-0 cursor-pointer"
              >
                {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'کپی شد' : 'کپی آدرس'}</span>
              </button>
            </div>

            {item.divarUrl && (
              <a
                href={item.divarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all"
              >
                <span>مشاهده این آگهی مستقیماً در سایت دیوار</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
