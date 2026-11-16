import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Trash2, CheckCircle2 } from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';

interface LocationPickerMapProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat?: number, lng?: number) => void;
  usePersianDigits?: boolean;
}

const NAJAFABAD_CENTER: [number, number] = [32.634, 51.366];

const roundCoord = (val: number) => Math.round(val * 1_000_000) / 1_000_000;

const createPickerPinIcon = () =>
  L.divIcon({
    className: 'property-location-picker-pin',
    html: `
      <div style="position: relative; width: 38px; height: 44px; display: flex; align-items: flex-end; justify-content: center; cursor: grab;">
        <div style="
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(5, 150, 105, 0.45);
          border: 2.5px solid #ffffff;
        ">
          <span style="
            width: 11px;
            height: 11px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></span>
        </div>
      </div>
    `,
    iconSize: [38, 44],
    iconAnchor: [19, 41],
  });

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  onChange,
  usePersianDigits = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const hasValidCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  const fmt = (val: string | number) => (usePersianDigits ? toPersianDigits(val) : String(val));

  // Initialize Leaflet map once
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const initialCenter: [number, number] = hasValidCoords
      ? [latitude!, longitude!]
      : NAJAFABAD_CENTER;
    const initialZoom = hasValidCoords ? 15 : 13;

    const map = L.map(container, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const nextLat = roundCoord(e.latlng.lat);
      const nextLng = roundCoord(e.latlng.lng);
      onChangeRef.current(nextLat, nextLng);
    });

    mapRef.current = map;
    setMapReady(true);

    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        map.invalidateSize();
      });
      observer.observe(container);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      observer?.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker position with latitude / longitude props
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (hasValidCoords) {
      const lat = latitude!;
      const lng = longitude!;

      if (!markerRef.current) {
        const marker = L.marker([lat, lng], {
          icon: createPickerPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onChangeRef.current(roundCoord(pos.lat), roundCoord(pos.lng));
        });

        markerRef.current = marker;
        map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
    } else if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }, [latitude, longitude, hasValidCoords, mapReady]);

  const handleCenterNajafabad = () => {
    if (!mapRef.current) return;
    mapRef.current.setView(NAJAFABAD_CENTER, 13, { animate: true });
  };

  const handleClearLocation = () => {
    onChange(undefined, undefined);
  };

  return (
    <div className="space-y-2.5">
      {/* Status & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-2xs">
          {hasValidCoords ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>موقعیت ثبت شد</span>
              <span className="dir-ltr font-mono text-[10px] opacity-85 mr-1">
                ({fmt(latitude!.toFixed(5))}, {fmt(longitude!.toFixed(5))})
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>روی نقشه کلیک کنید تا موقعیت ملک مشخص شود</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCenterNajafabad}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-2xs font-semibold transition-colors cursor-pointer"
            title="بازگشت نمای نقشه به مرکز نجف‌آباد"
          >
            <Navigation className="w-3 h-3 text-indigo-500" />
            <span>مرکز نجف‌آباد</span>
          </button>

          {hasValidCoords && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/70 text-2xs font-semibold transition-colors cursor-pointer"
              title="حذف موقعیت انتخاب‌شده"
            >
              <Trash2 className="w-3 h-3" />
              <span>حذف موقعیت</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-800">
        <div
          ref={containerRef}
          className="w-full h-56 sm:h-64 z-0 cursor-crosshair"
        />
        <div className="pointer-events-none absolute top-2.5 right-2.5 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700/80 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
          {hasValidCoords
            ? 'برای تغییر محل، روی نقطه جدید کلیک کنید یا پین را بکشید'
            : 'برای ثبت موقعیت ملک روی نقشه کلیک کنید'}
        </div>
      </div>
    </div>
  );
};
