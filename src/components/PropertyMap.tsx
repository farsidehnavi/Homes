import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { RealEstateItem } from '../types';
import { formatPriceShort, toPersianDigits, formatBuiltYear } from '../utils/formatters';
import {
  MapPin,
  ExternalLink,
  Layers,
  FileSpreadsheet,
  Maximize2,
  BedDouble,
  Navigation,
  X,
  Info,
  Calendar,
} from 'lucide-react';

export interface PropertyMapProps {
  items: RealEstateItem[];
  onSelectProperty: (item: RealEstateItem) => void;
  onAddToExcel?: (item: RealEstateItem) => void;
  isExcelMode?: boolean;
  usePersianDigits?: boolean;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  items,
  onSelectProperty,
  onAddToExcel,
  isExcelMode = false,
  usePersianDigits = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedProperty, setSelectedProperty] = useState<RealEstateItem | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fmt = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '—';
    return usePersianDigits ? toPersianDigits(val) : val;
  };

  // Najafabad center default coordinates
  const NAJAFABAD_CENTER: [number, number] = [32.634, 51.366];

  // Properties with valid coordinates
  const validItems = useMemo(() => {
    return items.filter(
      (it) =>
        typeof it.latitude === 'number' &&
        typeof it.longitude === 'number' &&
        !isNaN(it.latitude) &&
        !isNaN(it.longitude)
    );
  }, [items]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: NAJAFABAD_CENTER,
      zoom: 13,
      zoomControl: false,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;
    setMapReady(true);

    // Trigger resize after small delay to fix container sizing
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update Markers when items or map changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup || !mapReady) return;

    markersGroup.clearLayers();

    if (validItems.length === 0) return;

    const bounds: [number, number][] = [];

    validItems.forEach((item) => {
      const lat = item.latitude!;
      const lng = item.longitude!;
      bounds.push([lat, lng]);

      const isRent = item.transactionType === 'رهن و اجاره';
      const priceBadge = isRent
        ? item.deposit && item.deposit > 0
          ? `رهن ${formatPriceShort(item.deposit, usePersianDigits)}`
          : item.depositText || 'توافقی'
        : item.price && item.price > 0
        ? formatPriceShort(item.price, usePersianDigits)
        : item.priceText || 'توافقی';

      const isSelected = selectedProperty?.id === item.id;

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-property-pin-wrapper',
        html: `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: ${isSelected ? '#1e1b4b' : isRent ? '#1d4ed8' : '#059669'};
            color: #ffffff;
            font-family: 'Vazirmatn', sans-serif;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid #ffffff;
            cursor: pointer;
            white-space: nowrap;
            transform: translate(-50%, -100%);
            transition: all 0.2s ease;
          " class="hover:scale-105 active:scale-95">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></span>
            <span>${priceBadge}</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedProperty(item);
        map.panTo([lat, lng], { animate: true });
      });

      markersGroup.addLayer(marker);
    });

    // Fit bounds if we have valid items
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [validItems, mapReady, selectedProperty, usePersianDigits]);

  const handleResetNajafabadView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(NAJAFABAD_CENTER, 13, { animate: true });
  };

  const handleSelectFromList = (item: RealEstateItem) => {
    setSelectedProperty(item);
    if (mapInstanceRef.current && item.latitude && item.longitude) {
      mapInstanceRef.current.setView([item.latitude, item.longitude], 15, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[650px] sm:h-[720px] rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 flex flex-col font-['Vazirmatn',sans-serif]">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 right-4 left-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Count & District Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg text-xs font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500 animate-pulse" />
            <span>
              نمایش <strong className="text-indigo-600">{fmt(validItems.length)}</strong> ملک روی نقشه نجف‌آباد
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetNajafabadView}
            className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg text-xs font-bold text-slate-700 hover:text-indigo-600 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            title="بازگشت به مرکز نجف‌آباد"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مرکز شهر</span>
          </button>
        </div>

        {/* Toggle List View Drawer */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md text-white shadow-lg text-xs font-bold flex items-center gap-2 active:scale-95 transition-all cursor-pointer border border-slate-700"
          >
            <Layers className="w-4 h-4" />
            <span>{sidebarOpen ? 'بستن لیست' : 'لیست املاک روی نقشه'}</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Selected Property Popup Card (Bottom Left / Bottom Center) */}
      {selectedProperty && (
        <div className="absolute bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-[1001] animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-white/98 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-2xl relative text-right">
            {/* Close card button */}
            <button
              type="button"
              onClick={() => setSelectedProperty(null)}
              className="absolute top-3 left-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="بستن"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="flex gap-3.5 items-start">
              {/* Thumbnail */}
              {selectedProperty.imageUrl ? (
                <img
                  src={selectedProperty.imageUrl}
                  alt={selectedProperty.title}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-2xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-500">
                  <MapPin className="w-6 h-6" />
                </div>
              )}

              {/* Title & Specs */}
              <div className="min-w-0 flex-1 space-y-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    selectedProperty.transactionType === 'رهن و اجاره'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedProperty.transactionType || 'املاک دیوار'}
                </span>
                <h4 className="text-xs font-bold text-slate-900 truncate" title={selectedProperty.title}>
                  {selectedProperty.title}
                </h4>
                <p className="text-2xs text-slate-500 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{selectedProperty.address}</span>
                </p>

                {/* Pricing summary */}
                <div className="pt-0.5">
                  {selectedProperty.transactionType === 'رهن و اجاره' ? (
                    <div className="text-2xs font-bold text-blue-900">
                      <span>ودیعه: {selectedProperty.deposit && selectedProperty.deposit > 0 ? `${formatPriceShort(selectedProperty.deposit, usePersianDigits)}` : selectedProperty.depositText || 'توافقی'}</span>
                      {selectedProperty.rent && selectedProperty.rent > 0 && (
                        <span className="mr-2 text-slate-600">| اجاره: {formatPriceShort(selectedProperty.rent, usePersianDigits)}</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-black text-emerald-900">
                      {selectedProperty.price && selectedProperty.price > 0
                        ? `${formatPriceShort(selectedProperty.price, usePersianDigits)} تومان`
                        : selectedProperty.priceText || 'توافقی'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Specs Pills */}
            <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-slate-100 text-2xs text-slate-600 bg-slate-50/80 p-2 rounded-xl">
              <div className="flex items-center gap-1 truncate" title="متراژ">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {selectedProperty.area && selectedProperty.area > 0 ? (
                    <>
                      <strong>{fmt(selectedProperty.area)}</strong> م²
                    </>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1 truncate" title="تعداد خواب">
                <BedDouble className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {selectedProperty.rooms !== undefined && selectedProperty.rooms > 0
                    ? `${fmt(selectedProperty.rooms)} خواب`
                    : '—'}
                </span>
              </div>
              <div className="flex items-center gap-1 truncate" title="سال ساخت">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800">
                  {formatBuiltYear(selectedProperty, usePersianDigits)}
                </span>
              </div>
              <div className="flex items-center gap-1 truncate" title="نوع ملک">
                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{selectedProperty.propertyType}</span>
              </div>
            </div>

            {/* Actions: View Details & Add to Excel */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => onSelectProperty(selectedProperty)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>مشاهده جزئیات کامل ملک</span>
              </button>

              {/* Add to Excel: only shown if NOT opened from Excel */}
              {!isExcelMode && selectedProperty.source !== 'excel' && onAddToExcel && (
                <button
                  type="button"
                  onClick={() => onAddToExcel(selectedProperty)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                  title="افزودن مستقیم این ملک به جدول اکسل من"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">+ اکسل</span>
                </button>
              )}

              {selectedProperty.divarUrl && (
                <a
                  href={selectedProperty.divarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shrink-0"
                  title="مشاهده آگهی در وب‌سایت دیوار"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Property List Drawer */}
      {sidebarOpen && (
        <div className="absolute top-16 left-4 bottom-6 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl z-[1002] flex flex-col overflow-hidden animate-in slide-in-from-left-4 duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-right">
              <h4 className="text-xs font-bold text-slate-800">املاک روی نقشه نجف‌آباد</h4>
              <span className="text-[10px] text-slate-500">برای مشاهده هر ملک روی نقشه کلیک کنید</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-right">
            {validItems.map((item) => {
              const isSelected = selectedProperty?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectFromList(item)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-100'
                  }`}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-slate-800 truncate">{item.title}</h5>
                    <p className="text-2xs text-slate-500 truncate mt-0.5">{item.address}</p>
                    <div className="mt-1 flex items-center justify-between text-2xs">
                      <span className="font-bold text-indigo-700">
                        {item.transactionType === 'رهن و اجاره'
                          ? item.deposit && item.deposit > 0
                            ? `رهن ${formatPriceShort(item.deposit, usePersianDigits)}`
                            : item.depositText || 'توافقی'
                          : item.price && item.price > 0
                          ? formatPriceShort(item.price, usePersianDigits)
                          : item.priceText || 'توافقی'}
                      </span>
                      {item.area && item.area > 0 && (
                        <span className="text-slate-400">{fmt(item.area)} م²</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
