import React from 'react';
import { RealEstateItem } from '../types';
import { formatPriceShort, toPersianDigits } from '../utils/formatters';
import { Building2, Home, Landmark, Castle } from 'lucide-react';

interface StatsOverviewProps {
  items: RealEstateItem[];
  totalUploaded: number;
  usePersianDigits: boolean;
  onSelectPropertyType?: (type: string) => void;
  selectedTypes: string[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  items,
  totalUploaded,
  usePersianDigits,
  onSelectPropertyType,
  selectedTypes,
}) => {
  const fmtNum = (n: number) => (usePersianDigits ? toPersianDigits(n) : n);

  // Calculations
  const count = items.length;
  const totalPrice = items.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const avgPrice = count > 0 ? Math.round(totalPrice / count) : 0;

  const totalArea = items.reduce((acc, curr) => acc + (curr.area || 0), 0);
  const avgPricePerMeter =
    totalArea > 0 ? Math.round(totalPrice / totalArea) : 0;

  const minPrice = count > 0 ? Math.min(...items.map((i) => i.price)) : 0;
  const maxPrice = count > 0 ? Math.max(...items.map((i) => i.price)) : 0;

  // Counts by type
  const typeCounts = items.reduce((acc, curr) => {
    acc[curr.propertyType] = (acc[curr.propertyType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typesList = [
    { label: 'آپارتمان', icon: Building2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'دوبلکس', icon: Landmark, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { label: 'ویلایی', icon: Castle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'کلنگی', icon: Home, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      {/* Top metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pb-4 border-b border-slate-100">
        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
          <div className="text-xs text-slate-500 font-medium mb-1">تعداد املاک نمایش داده شده</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-baseline gap-1.5">
            <span>{fmtNum(count)}</span>
            <span className="text-xs text-slate-400 font-normal">
              از {fmtNum(totalUploaded)} مورد
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
          <div className="text-xs text-slate-500 font-medium mb-1">میانگین کل قیمت</div>
          <div className="text-base sm:text-lg font-bold text-slate-900">
            {formatPriceShort(avgPrice, usePersianDigits)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">برای کل املاک فیلتر شده</div>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
          <div className="text-xs text-slate-500 font-medium mb-1">میانگین قیمت هر متر مربع</div>
          <div className="text-base sm:text-lg font-bold text-indigo-700">
            {formatPriceShort(avgPricePerMeter, usePersianDigits)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">متری به طور متوسط</div>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
          <div className="text-xs text-slate-500 font-medium mb-1">دامنه قیمت املاک</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-800 flex flex-col">
            <span>از {formatPriceShort(minPrice, usePersianDigits)}</span>
            <span className="text-slate-500">تا {formatPriceShort(maxPrice, usePersianDigits)}</span>
          </div>
        </div>
      </div>

      {/* Property type pills */}
      <div className="pt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 ml-1">تفکیک نوع ملک:</span>
        {typesList.map(({ label, icon: Icon, color }) => {
          const typeCount = typeCounts[label] || 0;
          const isSelected = selectedTypes.includes(label);

          return (
            <button
              key={label}
              onClick={() => onSelectPropertyType && onSelectPropertyType(label)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : `${color} hover:shadow-xs`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-black/5'
              }`}>
                {fmtNum(typeCount)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
