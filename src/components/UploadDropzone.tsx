import React, { useRef, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  FileCheck2,
  Download,
  Sparkles,
  Database,
} from 'lucide-react';
import { parseExcelFile, ExcelParseResult } from '../utils/excelUtils';
import { RealEstateItem } from '../types';

interface UploadDropzoneProps {
  onDataLoaded: (items: RealEstateItem[], fileName: string) => void;
  onLoadSampleData: () => void;
  currentFileName?: string;
  totalLoadedItems?: number;
  usePersianDigits?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onDataLoaded,
  onLoadSampleData,
  currentFileName,
  totalLoadedItems,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    // Validate file extension
    const validExts = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage('فرمت فایل پشتیبانی نمی‌شود. لطفاً یک فایل اکسل (.xlsx یا .xls) انتخاب کنید.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result: ExcelParseResult = await parseExcelFile(file);
      if (result.success && result.items.length > 0) {
        onDataLoaded(result.items, result.fileName);
      } else {
        setErrorMessage(
          result.errorMessage || 'هیچ داده معتبری در فایل اکسل یافت نشد. لطفاً از شیت حاوی ستون‌های قیمت، متراژ و آدرس اطمینان حاصل کنید.'
        );
      }
    } catch (err: any) {
      setErrorMessage(`خطا در پردازش فایل: ${err?.message || 'نامشخص'}`);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 mb-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id="excel-file-input"
        type="file"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Main Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/60'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
          {isLoading ? (
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
          {isLoading ? 'در حال پردازش و استخراج اطلاعات اکسل...' : 'فایل اکسل املاک را اینجا رها کنید'}
        </h3>

        <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          یا برای انتخاب فایل از کامپیوتر خود کلیک کنید. از پسوندهای{' '}
          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
            .xlsx
          </span>{' '}
          و{' '}
          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
            .xls
          </span>{' '}
          پشتیبانی می‌شود.
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>انتخاب فایل اکسل</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Sample Data Quick Loader */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 text-center sm:text-right">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 hidden sm:inline" />
          <span>فایل اکسل آماده ندارید؟ می‌توانید از دیتاست پیش‌فرض املاک نجف‌آباد استفاده نمایید.</span>
        </div>

        <button
          id="load-sample-excel-btn"
          type="button"
          onClick={onLoadSampleData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shrink-0"
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>بارگذاری داده‌های نمونه نجف‌آباد (۱۰۰ ملک)</span>
        </button>
      </div>
    </div>
  );
};
