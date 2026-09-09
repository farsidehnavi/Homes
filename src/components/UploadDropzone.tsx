import React, { useState, useRef } from 'react';
import { FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface UploadDropzoneProps {
  onFileUpload: (file: File) => void;
  onDownloadSample: () => void;
  currentFileName?: string;
  totalRecords: number;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileUpload,
  onDownloadSample,
  currentFileName,
  totalRecords,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setErrorMessage(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
      setErrorMessage('لطفاً فقط فایل با پسوند .xlsx ، .xls یا .csv انتخاب نمایید.');
      return;
    }
    setErrorMessage(null);
    onFileUpload(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isCollapsed) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-3 mb-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>
            فایل فعال: <strong>{currentFileName || 'داده‌های اولیه پی‌دی‌اف املاک نجف‌آباد'}</strong> (
            {totalRecords} ردیف)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2.5 py-1 bg-emerald-50 rounded border border-emerald-200"
          >
            بارگذاری فایل جدید
          </button>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
          >
            نمایش بخش آپلود
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept=".xlsx, .xls, .csv"
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 mb-6 shadow-xs relative">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>بارگذاری و خواندن فایل اکسل (Excel / CSV)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            فایل اکسل خود را بکشید و رها کنید یا برای بارگذاری کلیک کنید. اطلاعات به صورت خودکار خوانده و تحلیل می‌شود.
          </p>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          className="text-xs text-slate-400 hover:text-slate-600 p-1"
          title="جمع کردن"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept=".xlsx, .xls, .csv"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>

          <div className="text-sm font-semibold text-slate-800">
            فایل اکسل را اینجا بکشید و رها کنید، یا{' '}
            <span className="text-emerald-700 underline">انتخاب فایل از دستگاه</span>
          </div>

          <p className="text-xs text-slate-400">
            پشتیبانی از انواع فرمت‌های Excel شامل <span className="font-mono text-slate-600">.xlsx</span> ،{' '}
            <span className="font-mono text-slate-600">.xls</span> و{' '}
            <span className="font-mono text-slate-600">.csv</span>
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Current File Status & Sample download button */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>فایل در حال استفاده:</span>
          <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {currentFileName || 'داده‌های اولیه مستخرج از فایل ارسالی (PDF نجف‌آباد)'}
          </span>
          <span className="text-slate-400">({totalRecords} رکورد)</span>
        </div>

        <button
          onClick={onDownloadSample}
          className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>دانلود فایل اکسل دقیق همین داده‌ها برای تست مجدد</span>
        </button>
      </div>
    </div>
  );
};
