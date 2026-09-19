import React from 'react';
import {
  RotateCw,
  ExternalLink,
  Clock,
  MapPin,
  Building2,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { DivarFetchMeta } from '../data/divarNajafabadData';
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
}) => {
  const fmt = (n: number) => (usePersianDigits ? toPersianDigits(n) : n);

  const lastFetchDisplay = lastSyncedAt
    ? formatRelativeTimePersian(lastSyncedAt)
    : metadata?.fetchedAt
    ? formatRelativeTimePersian(new Date(metadata.fetchedAt))
    : 'به‌روزرسانی شده';

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
                دیوار (divar.ir)
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                <MapPin className="w-3 h-3 text-red-500" />
                شهر نجف‌آباد (اصفهان)
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full font-medium">
                <Clock className="w-3 h-3 text-indigo-600" />
                ۲۴ ساعت گذشته
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>آگهی‌های املاک مسکونی نجف‌آباد ثبت‌شده در ۲۴ ساعت گذشته</span>
              <a
                href="https://divar.ir/s/najafabad/residential-sell"
                target="_blank"
                rel="noopener noreferrer"
                title="مشاهده مستقیم در سایت دیوار"
                className="text-slate-400 hover:text-red-600 transition-colors inline-flex"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              این سامانه مستقیماً به <strong>دیوار (divar.ir)</strong> متصل بوده و کلیه آگهی‌های املاک مسکونی شهر نجف‌آباد در ۲۴ ساعت اخیر را استخراج و برای جستجو، فیلتر متراژ، قیمت و بررسی تصاویر آماده ساخته است.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-start lg:self-center shrink-0">
            <button
              id="refresh-divar-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className={`flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'در حال دریافت از دیوار...' : 'بروزرسانی زنده از دیوار'}</span>
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

        {/* Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تعداد آگهی‌های ۲۴ ساعت اخیر:</span>
              <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-bold text-xs">
                {fmt(totalItems)} ملک
              </strong>
            </div>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>آخرین همگام‌سازی:</span>
              <span className="font-semibold text-slate-700">{lastFetchDisplay}</span>
            </div>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <div className="flex items-center gap-1 text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>دسته‌بندی:</span>
              <span className="text-slate-700">فروش مسکونی (آپارتمان، ویلایی، خانه، کلنگی)</span>
            </div>
          </div>

          <div className="text-slate-400 text-2xs">
            منبع داده مستقیم: api.divar.ir • شهر ۳۱ نجف‌آباد
          </div>
        </div>
      </div>
    </div>
  );
};
