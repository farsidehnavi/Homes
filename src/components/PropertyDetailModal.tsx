import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
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
  Edit,
  Camera,
  Upload,
  FileSpreadsheet,
  BellRing,
  Navigation,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { RealEstateItem } from '../types';
import { formatPrice, formatPriceShort, toPersianDigits, formatDepositRent, formatBuiltYear } from '../utils/formatters';

interface PropertyDetailModalProps {
  item: RealEstateItem | null;
  onClose: () => void;
  usePersianDigits: boolean;
  isExcelMode?: boolean;
  onEditItem?: (item: RealEstateItem) => void;
  onAddToExcel?: (item: RealEstateItem) => void;
  onAddToAlerts?: (item: RealEstateItem) => void;
}

const PropertyMiniMap: React.FC<{
  lat: number;
  lng: number;
  title?: string;
  address?: string;
}> = ({ lat, lng }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const customPin = L.divIcon({
      className: 'detail-modal-map-pin',
      html: `
        <div style="position: relative; transform: translate(-50%, -100%);">
          <div style="
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5);
            border: 2px solid #ffffff;
          ">
            <span style="
              width: 12px;
              height: 12px;
              background: #ffffff;
              border-radius: 50%;
              transform: rotate(45deg);
            "></span>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });

    L.marker([lat, lng], { icon: customPin }).addTo(map);
    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 z-10 shadow-inner"
    />
  );
};

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  item,
  onClose,
  usePersianDigits,
  isExcelMode = false,
  onEditItem,
  onAddToExcel,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [liveDivarImages, setLiveDivarImages] = useState<string[] | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [liveMapData, setLiveMapData] = useState<{
    latitude?: number;
    longitude?: number;
    mapImageUrl?: string;
    topAddress?: string;
  } | null>(null);

  // Fetch live map data and exact location from Divar for this post
  useEffect(() => {
    setLiveMapData(null);
    if (item && item.divarToken) {
      fetch(`/api/divar/post/${item.divarToken}/map`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success) {
            setLiveMapData({
              latitude: data.latitude,
              longitude: data.longitude,
              mapImageUrl: data.mapImageUrl,
              topAddress: data.topAddress,
            });
          }
        })
        .catch(() => {});
    }
  }, [item]);

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

  const effectiveLat = liveMapData?.latitude ?? item.latitude;
  const effectiveLng = liveMapData?.longitude ?? item.longitude;
  const effectiveAddress = liveMapData?.topAddress ?? item.address;
  const effectiveMapImage = liveMapData?.mapImageUrl ?? item.mapImageUrl;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(effectiveAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRent = item.transactionType === 'رهن و اجاره' || Boolean(item.deposit || item.rent);

  // Common Details Section (Used for both mobile and desktop)
  const renderDetailsBody = () => (
    <div className="space-y-6">
      {/* Title & basic info */}
      <div>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            ردیف {fmt(item.rowNumber)}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs ${
              isRent ? 'bg-blue-600' : 'bg-emerald-600'
            }`}
          >
            {isRent ? 'رهن و اجاره' : 'خرید و فروش'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {item.propertyType}
          </span>
          {item.district && (
            <span className="text-2xs text-slate-500 flex items-center gap-1 font-semibold">
              <MapPin className="w-3 h-3 text-red-500" />
              <span>{item.district}</span>
            </span>
          )}
          {item.relativeTime && (
            <span className="text-2xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{item.relativeTime}</span>
            </span>
          )}
        </div>
        <h3 className="text-lg font-black text-slate-900 leading-snug">
          {item.title || item.address}
        </h3>
      </div>

      {/* Pricing Highlight Card */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isRent ? 'bg-blue-50/70 border-blue-200' : 'bg-emerald-50/70 border-emerald-200'
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
                    {item.deposit && item.deposit > 0
                      ? `${formatPrice(item.deposit)} تومان`
                      : item.depositText || 'توافقی'}
                  </span>
                </div>
                <div className="h-8 w-px bg-blue-200 hidden sm:block" />
                <div>
                  <span className="text-xs text-slate-500 block">اجاره ماهیانه:</span>
                  <span className="text-lg sm:text-xl font-black text-blue-900">
                    {item.rent && item.rent > 0
                      ? `${formatPrice(item.rent)} تومان`
                      : item.rentText || 'توافقی'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-blue-100 text-right space-y-0.5">
              <span className="text-2xs text-slate-500 block">متراژ ملک:</span>
              <span className="text-base font-bold text-slate-900">
                {item.area && item.area > 0 ? `${fmt(item.area)} متر مربع` : 'نامشخص'}
              </span>
              {item.buildingArea && item.landArea && item.buildingArea !== item.landArea && (
                <span className="text-2xs text-slate-500 block mt-0.5 font-medium">
                  زیربنا: {fmt(item.buildingArea)} متر مربع
                </span>
              )}
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

            {(item.pricePerMeter || (item.price && item.area && item.area > 0)) && (
              <div className="bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-emerald-100 text-right space-y-0.5">
                <span className="text-2xs text-slate-500 block">
                  قیمت هر متر مربع:
                </span>
                <span className="text-base font-bold text-slate-900">
                  {item.pricePerMeter && item.pricePerMeter > 0
                    ? `${formatPrice(item.pricePerMeter)} تومان`
                    : `${formatPrice(Math.round(item.price! / item.area!))} تومان`}
                </span>
                {item.area && item.area > 0 && (
                  <span className="text-2xs text-slate-500 block">
                    متراژ کل: {fmt(item.area)} متر
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Key Specifications Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span>مشخصات فنی و ساختمانی ملک:</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-2xs block mb-1">
              {item.landArea && item.buildingArea && item.landArea !== item.buildingArea
                ? 'متراژ کل / زمین'
                : 'متراژ'}
            </span>
            <span className="font-bold text-slate-900">
              {item.area && item.area > 0 ? `${fmt(item.area)} متر مربع` : 'ذکر نشده در آگهی'}
            </span>
            {item.buildingArea && item.landArea && item.buildingArea !== item.landArea && (
              <span className="text-2xs text-slate-500 block mt-0.5">
                زیربنا: {fmt(item.buildingArea)} متر مربع
              </span>
            )}
          </div>

          {item.rooms !== undefined && item.rooms > 0 && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-2xs block mb-1">تعداد اتاق</span>
              <span className="font-bold text-slate-900">{fmt(item.rooms)} خوابه</span>
            </div>
          )}

          {item.floor !== undefined && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-2xs block mb-1">طبقه</span>
              <span className="font-bold text-slate-900">
                {item.floor === 0 ? 'همکف' : fmt(item.floor)} {item.totalFloors ? `از ${fmt(item.totalFloors)}` : ''}
              </span>
            </div>
          )}

          {(item.builtYear !== undefined || item.age !== undefined) && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-2xs block mb-1">سال ساخت</span>
              <span className="font-bold text-slate-900">
                {formatBuiltYear(item, usePersianDigits)}
              </span>
            </div>
          )}

          {item.orientation && item.orientation.trim() !== '' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-2xs block mb-1">جهت ساختمان</span>
              <span className="font-bold text-slate-900">{item.orientation}</span>
            </div>
          )}

          {item.facade && item.facade.trim() !== '' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-2xs block mb-1">نمای ساختمان</span>
              <span className="font-bold text-slate-900">{item.facade}</span>
            </div>
          )}

          {item.documentType && item.documentType.trim() !== '' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-2xs block mb-1">نوع سند</span>
              <span className="font-bold text-slate-900">{item.documentType}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-2xs block mb-1">نوع ملک</span>
            <span className="font-bold text-slate-900">{item.propertyType}</span>
          </div>
        </div>
      </div>

      {/* Description from Divar or Excel */}
      {item.description && item.description.trim() !== '' && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>توضیحات تکمیلی آگهی‌دهنده:</span>
          </h4>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs font-normal">
            {item.description}
          </p>
        </div>
      )}

      {/* Amenities Badges - only rendered if actually mentioned */}
      {(item.hasParking !== undefined || item.hasElevator !== undefined || item.hasStorage !== undefined) && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 mb-3">امکانات رفاهی:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {item.hasParking !== undefined && (
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
            )}

            {item.hasElevator !== undefined && (
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
            )}

            {item.hasStorage !== undefined && (
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
            )}
          </div>
        </div>
      )}

      {/* Address & Divar Map Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <h4 className="text-xs font-bold text-slate-800">
              موقعیت مکانی و آدرس روی نقشه دیوار:
            </h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            نقشه رسمی دیوار
          </span>
        </div>

        {/* Address bar written on top of map */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-800 font-bold min-w-0">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <span className="truncate">{effectiveAddress}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="flex items-center gap-1 text-2xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کپی شد' : 'کپی آدرس'}</span>
          </button>
        </div>

        {/* Exact Divar Map */}
        {effectiveLat && effectiveLng ? (
          <div className="space-y-2">
            <PropertyMiniMap
              lat={effectiveLat}
              lng={effectiveLng}
              title={item.title}
              address={effectiveAddress}
            />

            {/* Direct Navigation Links */}
            <div className="grid grid-cols-3 gap-2 text-2xs">
              <a
                href={`https://neshan.org/maps/@${effectiveLat},${effectiveLng},16z`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold transition-all shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>مسیریابی نشان</span>
              </a>
              <a
                href={`https://balad.ir/location?latitude=${effectiveLat}&longitude=${effectiveLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold transition-all shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>مسیریابی بلد</span>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${effectiveLat},${effectiveLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold transition-all shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Google Maps</span>
              </a>
            </div>
          </div>
        ) : effectiveMapImage ? (
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <img src={effectiveMapImage} alt="نقشه دیوار" className="w-full h-52 sm:h-64 object-cover" />
          </div>
        ) : null}
      </div>

      {/* If NOT in Excel mode and item is NOT from Excel, show Add to Excel */}
      {!isExcelMode && item.source !== 'excel' && onAddToExcel && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onAddToExcel(item)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>افزودن مستقیم این ملک به جدول اکسل من</span>
          </button>
        </div>
      )}

      {item.divarUrl && (
        <a
          href={item.divarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
        >
          <span>مشاهده این آگهی در وب‌سایت دیوار</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>
      )}
    </div>
  );

  // Gallery component with active image, prev/next buttons, and thumbnails
  const renderGalleryView = (isDesktop: boolean) => {
    if (allImages.length === 0) {
      return (
        <div className="w-full h-48 sm:h-64 bg-slate-900 text-slate-400 flex flex-col items-center justify-center gap-2 p-6">
          <Camera className="w-10 h-10 text-slate-600" />
          <span className="text-xs font-semibold">این ملک تصویری ندارد.</span>
        </div>
      );
    }

    return (
      <div className={`w-full bg-slate-950 flex flex-col shrink-0 ${isDesktop ? 'h-full justify-between' : ''}`}>
        {/* Main active image viewport */}
        <div className={`relative w-full overflow-hidden bg-slate-900 group ${isDesktop ? 'flex-1 min-h-[360px] rounded-2xl' : 'h-64 sm:h-80'}`}>
          <img
            src={allImages[activeImageIndex]}
            alt={`${item.title || item.address} - عکس ${activeImageIndex + 1}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

          {/* Prev / Next controls */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-lg"
                title="تصویر قبلی"
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
                title="تصویر بعدی"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image counter pill */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5">
            {isLoadingImages ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
            ) : (
              <Images className="w-3.5 h-3.5 text-red-400" />
            )}
            <span>
              عکس {fmt(activeImageIndex + 1)} از {fmt(allImages.length)}
            </span>
          </div>
        </div>

        {/* Thumbnail ribbon */}
        {allImages.length > 1 && (
          <div className="flex items-center gap-2 p-3 bg-slate-900/95 overflow-x-auto border-t border-slate-800">
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
                  alt={`تصویر ${idx + 1}`}
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
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-white md:bg-black/80 md:backdrop-blur-xs md:flex md:items-center md:justify-center md:p-6 overflow-hidden animate-in fade-in duration-200 font-['Vazirmatn',sans-serif]"
      onClick={onClose}
    >
      <div
        className="w-full h-full md:h-auto md:max-h-[92vh] md:max-w-6xl md:rounded-3xl bg-white md:border md:border-slate-200 md:shadow-2xl flex flex-col overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* MOBILE VIEW (Screen < md): 100% full screen, single scroll */}
        {/* When user scrolls, images go UP and details occupy full view */}
        {/* ========================================================= */}
        <div className="flex flex-col h-full md:hidden">
          {/* Mobile Top Navigation Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white shrink-0 z-20 shadow-2xs">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 py-1.5 px-3 rounded-xl transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت</span>
            </button>

            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 shrink-0">
                ردیف {fmt(item.rowNumber)}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white shrink-0 ${
                  isRent ? 'bg-blue-600' : 'bg-emerald-600'
                }`}
              >
                {isRent ? 'رهن و اجاره' : 'خرید و فروش'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Single Scrollable Viewport: Images on top, details underneath */}
          {/* As user scrolls down, images naturally scroll UP and out of the view */}
          <div className="flex-1 overflow-y-auto">
            {/* Gallery at top */}
            {renderGalleryView(false)}

            {/* Details below gallery */}
            <div className="p-4 space-y-6 pb-12">
              {renderDetailsBody()}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PC / DESKTOP VIEW (Screen >= md): Side-by-Side Layout      */}
        {/* Images on one side, details on another side with scroll   */}
        {/* ========================================================= */}
        <div className="hidden md:flex flex-col h-full overflow-hidden">
          {/* Desktop Modal Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                ردیف {fmt(item.rowNumber)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                  isRent ? 'bg-blue-600' : 'bg-emerald-600'
                }`}
              >
                {isRent ? 'رهن و اجاره' : 'خرید و فروش'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                {item.propertyType}
              </span>
              <h3 className="text-base font-black text-slate-900 truncate max-w-md">
                {item.title || item.address}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {isExcelMode && onEditItem && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditItem(item);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>ویرایش مشخصات</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="بستن پنجره"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Side-by-Side Body */}
          <div className="flex flex-row flex-1 overflow-hidden">
            {/* Side 1: Images Gallery Side */}
            <div className="w-1/2 bg-slate-950 flex flex-col p-5 shrink-0 border-l border-slate-800 justify-between overflow-hidden">
              {renderGalleryView(true)}
            </div>

            {/* Side 2: Scrollable Details Side */}
            <div className="w-1/2 flex-1 overflow-y-auto p-6 space-y-6">
              {renderDetailsBody()}
            </div>
          </div>

          {/* Desktop Footer */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {!isExcelMode && onAddToExcel && item.source !== 'excel' && (
                <button
                  type="button"
                  onClick={() => onAddToExcel(item)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>+ افزودن به جدول اکسل من</span>
                </button>
              )}

              {item.divarUrl && (
                <a
                  href={item.divarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>مشاهده در دیوار</span>
                </a>
              )}
            </div>

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
    </div>
  );
};
