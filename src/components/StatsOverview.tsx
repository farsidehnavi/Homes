import React from 'react';
import { RealEstateItem, TransactionType } from '../types';
import { formatPriceShort, toPersianDigits } from '../utils/formatters';
import { Building2, Home, Landmark, Castle, Tag, DollarSign, Key } from 'lucide-react';

interface StatsOverviewProps {
  items: RealEstateItem[];
  totalUploaded: number;
  usePersianDigits: boolean;
  onSelectPropertyType?: (type: string) => void;
  selectedTypes: string[];
  selectedTransactionType?: 'all' | 'خرید و فروش' | 'رهن و اجاره';
  onSelectTransactionType?: (type: 'all' | 'خرید و فروش' | 'رهن و اجاره') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  items,
  totalUploaded,
  usePersianDigits,
  onSelectPropertyType,
  selectedTypes,
  selectedTransactionType = 'all',
  onSelectTransactionType,
}) => {
  const fmtNum = (n: number) => (usePersianDigits ? toPersianDigits(n) : n);

  const count = items.length;

  // Split into sales and rentals
  const saleItems = items.filter((i) => i.transactionType === 'خرید و فروش' || (!i.deposit && !i.rent && i.price > 0));
  const rentItems = items.filter((i) => i.transactionType === 'رهن و اجاره' || Boolean(i.deposit || i.rent));

  // Sales calculations
  const totalSalePrice = saleItems.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const avgSalePrice = saleItems.length > 0 ? Math.round(totalSalePrice / saleItems.length) : 0;
  const totalSaleArea = saleItems.reduce((acc, curr) => acc + (curr.area || 0), 0);
  const avgPricePerMeter = totalSaleArea > 0 ? Math.round(totalSalePrice / totalSaleArea) : 0;

  // Rent calculations
  const totalDeposit = rentItems.reduce((acc, curr) => acc + (curr.deposit || 0), 0);
  const avgDeposit = rentItems.length > 0 ? Math.round(totalDeposit / rentItems.length) : 0;
  const totalRent = rentItems.reduce((acc, curr) => acc + (curr.rent || 0), 0);
  const avgRent = rentItems.length > 0 ? Math.round(totalRent / rentItems.length) : 0;

  // Counts by type
  const typeCounts = items.reduce((acc, curr) => {
    if (curr.propertyType) {
      acc[curr.propertyType] = (acc[curr.propertyType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const getIconForType = (type: string) => {
    if (type.includes('آپارتمان')) return Building2;
    if (type.includes('ویلا')) return Castle;
    if (type.includes('زمین') || type.includes('کلنگی')) return Landmark;
    return Home;
  };

  const getColorForType = (type: string) => {
    if (type.includes('آپارتمان')) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (type.includes('ویلا')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (type.includes('زمین') || type.includes('کلنگی')) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-indigo-700 bg-indigo-50 border-indigo-200';
  };

  const presentTypes = Object.keys(typeCounts).sort(
    (a, b) => (typeCounts[b] || 0) - (typeCounts[a] || 0)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      {/* Top metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pb-4 border-b border-slate-100">
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="text-2xs text-slate-500 font-semibold mb-1">املاک فیلتر شده</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-baseline gap-1.5">
            <span>{fmtNum(count)}</span>
            <span className="text-2xs text-slate-400 font-normal">از {fmtNum(totalUploaded)} ملک</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-700 font-bold">{fmtNum(saleItems.length)} فروش</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">{fmtNum(rentItems.length)} رهن و اجاره</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
          <div className="text-2xs text-emerald-800 font-semibold mb-1 flex items-center justify-between">
            <span>میانگین قیمت فروش</span>
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-950">
            {formatPriceShort(avgSalePrice, usePersianDigits)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">
            متری {formatPriceShort(avgPricePerMeter, usePersianDigits)}
          </div>
        </div>

        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
          <div className="text-2xs text-blue-800 font-semibold mb-1 flex items-center justify-between">
            <span>میانگین ودیعه (رهن)</span>
            <Key className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-blue-950">
            {formatPriceShort(avgDeposit, usePersianDigits)}
          </div>
          <div className="text-[11px] text-blue-700 mt-0.5">
            {fmtNum(rentItems.length)} مورد اجاره‌ای
          </div>
        </div>

        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <div className="text-2xs text-indigo-800 font-semibold mb-1">میانگین اجاره ماهانه</div>
          <div className="text-base sm:text-lg font-black text-indigo-950">
            {formatPriceShort(avgRent, usePersianDigits)}
          </div>
          <div className="text-[11px] text-indigo-700 mt-0.5">ماهیانه به طور متوسط</div>
        </div>
      </div>

      {/* Transaction Type quick toggles & Property type pills */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
        {/* Transaction Type Filter Tabs */}
        {onSelectTransactionType && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => onSelectTransactionType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedTransactionType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              همه ({fmtNum(items.length)})
            </button>

            <button
              type="button"
              onClick={() => onSelectTransactionType('خرید و فروش')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedTransactionType === 'خرید و فروش'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>خرید و فروش ({fmtNum(saleItems.length)})</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTransactionType('رهن و اجاره')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedTransactionType === 'رهن و اجاره'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <Key className="w-3 h-3" />
              <span>رهن و اجاره ({fmtNum(rentItems.length)})</span>
            </button>
          </div>
        )}

        {/* Property Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-2xs text-slate-400 font-semibold ml-1">دسته‌بندی‌ها:</span>
          {presentTypes.map((type) => {
            const Icon = getIconForType(type);
            const isSelected = selectedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectPropertyType && onSelectPropertyType(type)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-2xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : `${getColorForType(type)} hover:opacity-80`
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{type}</span>
                <span className="text-[10px] opacity-75">({fmtNum(typeCounts[type])})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
