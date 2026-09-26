import React from 'react';
import {
  RotateCw,
  ExternalLink,
  Clock,
  MapPin,
  Building2,
  Download,
  CheckCircle2,
  BellRing,
  Images,
} from 'lucide-react';
import { DivarFetchMeta } from '../data/divarNajafabadData';
import { DivarTimeRange } from '../types';
import { toPersianDigits, formatRelativeTimePersian } from '../utils/formatters';

interface DivarSyncBannerProps {
  metadata: DivarFetchMeta | null;
  totalItems: number;
  filteredItemsCount: number;
  isLoading: boolean;
  onRefresh: () => void;
  onExportExcel: () => void;
  usePersianDigits: boolean;
  lastSyncedAt?: Date | null;
  currentTimeRange: DivarTimeRange;
  onTimeRangeChange: (range: DivarTimeRange) => void;
  onOpenAlertsModal: () => void;
  matchedAlertsCount?: number;
}

export const DivarSyncBanner: React.FC<DivarSyncBannerProps> = ({
  metadata,
  totalItems,
  filteredItemsCount,
  isLoading,
  onRefresh,
  onExportExcel,
  usePersianDigits,
  lastSyncedAt,
  currentTimeRange,
  onTimeRangeChange,
  onOpenAlertsModal,
  matchedAlertsCount = 0,
}) => {
  const fmt = (n: number) => (usePersianDigits ? toPersianDigits(n) : n);

  const lastFetchDisplay = lastSyncedAt
    ? formatRelativeTimePersian(lastSyncedAt)
    : metadata?.fetchedAt
    ? formatRelativeTimePersian(new Date(metadata.fetchedAt))
    : 'به‌روزرسانی شده';

  const timeOptions: { id: DivarTimeRange; label: string }[] = [
    { id: '1h', label: '۱ ساعت گذشته' },
    { id: '2h', label: '۲ ساعت گذشته' },
    { id: '6h', label: '۶ ساعت گذشته' },
    { id: '12h', label: '۱۲ ساعت گذشته' },
    { id: '24h', label: '۲۴ ساعت گذشته' },
    { id: '3d', label: '۳ روز گذشته' },
    { id: '7d', label: '۱ هفته گذشته' },
    { id: '14d', label: '۲ هفته گذشته' },
    { id: '30d', label: '۱ ماه گذشته' },
    { id: 'all', label: 'همه زمان‌ها' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs mb-6 overflow-hidden transition-all">
      {/* Top Banner Gradient Strip */}
      <div className="bg-linear-to-r from-red-600 via-rose-600 to-indigo-600 h-1.5 w-full" />

      <div className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Info block */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                پنل دیوار (divar.ir)
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                <MapPin className="w-3 h-3 text-red-500" />
                شهر نجف‌آباد (اصفهان)
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full font-medium">
                <Clock className="w-3 h-3 text-indigo-600" />
                بازه زمانی: {timeOptions.find((t) => t.id === currentTimeRange)?.label}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>رصد زنده و فیلتر آگهی‌های املاک دیوار نجف‌آباد</span>
              <a
                href="https://divar.ir/s/najafabad/real-estate"
                target="_blank"
                rel="noopener noreferrer"
                title="مشاهده مستقیم در سایت دیوار"
                className="text-slate-400 hover:text-red-600 transition-colors inline-flex"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              در <strong>پنل دیوار</strong> می‌توانید آگهی‌ها را بر اساس بازه‌های زمانی دلخواه (از ۱ ساعت تا ۱ ماه گذشته) فیلتر کرده، تمامی تصاویر هر ملک را مشاهده نمایید و برای دریافت اعلان ملک دلخواه خود سیستم <strong>«گوش‌به‌زنگ»</strong> را فعال کنید.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-start lg:self-center shrink-0">
            {/* Divar Alert Button */}
            <button
              id="open-divar-alerts-btn"
              onClick={onOpenAlertsModal}
              className="relative flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <BellRing className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>گوش‌به‌زنگ (اعلان ملک)</span>
              {matchedAlertsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                  {fmt(matchedAlertsCount)}
                </span>
              )}
            </button>

            <button
              id="refresh-divar-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className={`flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'در حال دریافت از دیوار...' : 'بروزرسانی دیوار'}</span>
            </button>

            <button
              id="export-divar-excel-btn"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
              title="دانلود لیست فیلترشده در قالب اکسل"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>خروجی اکسل ({fmt(filteredItemsCount)})</span>
            </button>
          </div>
        </div>

        {/* Time Selector Pills: From 1 hour to 1 month */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-2xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              انتخاب زمان آگهی‌ها:
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {timeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onTimeRangeChange(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    currentTimeRange === opt.id
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-2xs text-slate-400 shrink-0">
            نمایش: <strong>{fmt(filteredItemsCount)}</strong> از <strong>{fmt(totalItems)}</strong> ملک
          </div>
        </div>
      </div>
    </div>
  );
};
