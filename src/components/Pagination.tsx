import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  usePersianDigits: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  usePersianDigits,
}) => {
  const fmt = (n: number) => (usePersianDigits ? toPersianDigits(n) : n);

  if (totalItems === 0) return null;

  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:px-5 rounded-xl border border-slate-200 shadow-xs mt-4">
      {/* Items info */}
      <div className="text-xs text-slate-500 font-medium">
        نمایش <strong className="text-slate-800">{fmt(startItem)}</strong> تا{' '}
        <strong className="text-slate-800">{fmt(endItem)}</strong> از{' '}
        <strong className="text-slate-800">{fmt(totalItems)}</strong> مورد
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1.5">
        {/* Next/Prev button in RTL: Right arrow goes to previous page, Left arrow goes to next page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="صفحه قبل"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(Number(p))}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {fmt(Number(p))}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="صفحه بعد"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Page size selector */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>تعداد در هر صفحه:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="bg-slate-50 border border-slate-300 text-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          <option value={10}>۱۰</option>
          <option value={25}>۲۵</option>
          <option value={50}>۵۰</option>
          <option value={100}>۱۰۰</option>
        </select>
      </div>
    </div>
  );
};
