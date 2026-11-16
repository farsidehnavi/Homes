import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PlusCircle,
  Edit3,
  Building2,
  Home,
  MapPin,
  Tag,
  DollarSign,
  Maximize2,
  BedDouble,
  Layers,
  Clock,
  Compass,
  Palette,
  FileCheck2,
  Car,
  Warehouse,
  ArrowUpDown,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Trash2,
  Star,
  Plus,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { RealEstateItem, TransactionType, PropertyType } from '../types';
import { formatPrice } from '../utils/formatters';
import { LocationPickerMap } from './LocationPickerMap';

interface PropertyFormModalProps {
  isOpen: boolean;
  itemToEdit?: RealEstateItem | null; // null => Add mode; non-null => Edit mode
  initialData?: RealEstateItem | null; // backward-compatible alias
  onClose: () => void;
  onSave: (item: Partial<RealEstateItem>) => void;
  usePersianDigits: boolean;
}

const normalizeNumericInput = (raw: string, allowNegative = false): string => {
  const ascii = raw
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));

  let cleaned = '';
  for (let i = 0; i < ascii.length; i++) {
    const ch = ascii[i];
    if (ch >= '0' && ch <= '9') {
      cleaned += ch;
    } else if (allowNegative && ch === '-' && cleaned.length === 0) {
      cleaned += ch;
    }
  }

  if (cleaned.length > 1 && cleaned.startsWith('0')) {
    cleaned = cleaned.replace(/^0+(?=\d)/, '');
  } else if (cleaned.length > 2 && cleaned.startsWith('-0')) {
    cleaned = '-' + cleaned.slice(1).replace(/^0+(?=\d)/, '');
  }

  return cleaned;
};

const cycleTriState = (val: boolean | undefined): boolean | undefined => {
  if (val === undefined) return true;
  if (val === true) return false;
  return undefined;
};

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  itemToEdit,
  initialData,
  onClose,
  onSave,
  usePersianDigits,
}) => {
  const effectiveEditItem = itemToEdit ?? initialData ?? null;
  const isEdit = Boolean(effectiveEditItem);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('خرید و فروش');
  const [propertyType, setPropertyType] = useState<PropertyType>('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [deposit, setDeposit] = useState<string>('');
  const [rent, setRent] = useState<string>('');
  const [rooms, setRooms] = useState<string>('');
  const [floor, setFloor] = useState<string>('');
  const [totalFloors, setTotalFloors] = useState<string>('');
  const [builtYear, setBuiltYear] = useState<string>('');
  const [orientation, setOrientation] = useState<string>('');
  const [facade, setFacade] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const [hasParking, setHasParking] = useState<boolean | undefined>(undefined);
  const [hasElevator, setHasElevator] = useState<boolean | undefined>(undefined);
  const [hasStorage, setHasStorage] = useState<boolean | undefined>(undefined);

  // Image support
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  // Map location support
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isMapSectionOpen, setIsMapSectionOpen] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (effectiveEditItem) {
      setTitle(effectiveEditItem.title || '');
      setTransactionType(
        effectiveEditItem.transactionType ||
          (effectiveEditItem.deposit || effectiveEditItem.rent ? 'رهن و اجاره' : 'خرید و فروش')
      );
      setPropertyType(effectiveEditItem.propertyType || '');
      setAddress(effectiveEditItem.address || '');
      setDistrict(effectiveEditItem.district || '');
      setArea(effectiveEditItem.area && effectiveEditItem.area > 0 ? String(effectiveEditItem.area) : '');
      setPrice(effectiveEditItem.price && effectiveEditItem.price > 0 ? String(effectiveEditItem.price) : '');
      setDeposit(effectiveEditItem.deposit && effectiveEditItem.deposit > 0 ? String(effectiveEditItem.deposit) : '');
      setRent(effectiveEditItem.rent && effectiveEditItem.rent > 0 ? String(effectiveEditItem.rent) : '');
      setRooms(effectiveEditItem.rooms && effectiveEditItem.rooms > 0 ? String(effectiveEditItem.rooms) : '');
      setFloor(
        effectiveEditItem.floor !== undefined && effectiveEditItem.floor !== null
          ? String(effectiveEditItem.floor)
          : ''
      );
      setTotalFloors(
        effectiveEditItem.totalFloors !== undefined &&
          effectiveEditItem.totalFloors !== null &&
          effectiveEditItem.totalFloors > 0
          ? String(effectiveEditItem.totalFloors)
          : ''
      );
      const existingYear =
        effectiveEditItem.builtYear ??
        (effectiveEditItem.age !== undefined
          ? effectiveEditItem.age > 1300
            ? effectiveEditItem.age
            : effectiveEditItem.age === 0
            ? 1403
            : 1403 - effectiveEditItem.age
          : undefined);
      setBuiltYear(existingYear !== undefined ? String(existingYear) : '');
      setOrientation(effectiveEditItem.orientation || '');
      setFacade(effectiveEditItem.facade || '');
      setDocumentType(effectiveEditItem.documentType || '');
      setHasParking(effectiveEditItem.hasParking);
      setHasElevator(effectiveEditItem.hasElevator);
      setHasStorage(effectiveEditItem.hasStorage);
      setLatitude(
        typeof effectiveEditItem.latitude === 'number' && !isNaN(effectiveEditItem.latitude)
          ? effectiveEditItem.latitude
          : undefined
      );
      setLongitude(
        typeof effectiveEditItem.longitude === 'number' && !isNaN(effectiveEditItem.longitude)
          ? effectiveEditItem.longitude
          : undefined
      );

      const existingImages =
        effectiveEditItem.images && effectiveEditItem.images.length > 0
          ? effectiveEditItem.images
          : effectiveEditItem.imageUrl
          ? [effectiveEditItem.imageUrl]
          : [];
      setImages(existingImages);
    } else {
      // Reset all fields empty for Add mode (no default values)
      setTitle('');
      setTransactionType('خرید و فروش');
      setPropertyType('');
      setAddress('');
      setDistrict('');
      setArea('');
      setPrice('');
      setDeposit('');
      setRent('');
      setRooms('');
      setFloor('');
      setTotalFloors('');
      setBuiltYear('');
      setOrientation('');
      setFacade('');
      setDocumentType('');
      setHasParking(undefined);
      setHasElevator(undefined);
      setHasStorage(undefined);
      setLatitude(undefined);
      setLongitude(undefined);
      setImages([]);
    }
    setImageUrlInput('');
    setShowUrlInput(false);
    setValidationError(null);
    setIsMapSectionOpen(true);
  }, [effectiveEditItem, isOpen]);

  if (!isOpen) return null;

  const numArea = area.trim() !== '' ? Number(area) || 0 : 0;
  const numPrice = price.trim() !== '' ? Number(price) || 0 : 0;
  const numDeposit = deposit.trim() !== '' ? Number(deposit) || 0 : 0;
  const numRent = rent.trim() !== '' ? Number(rent) || 0 : 0;
  const pricePerMeter = numArea > 0 && numPrice > 0 ? Math.round(numPrice / numArea) : 0;

  // Handle local image file upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setImageUrlInput('');
    setShowUrlInput(false);
  };

  // Remove an image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Make an image the primary cover image (move to index 0)
  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() && !title.trim()) {
      setValidationError('لطفاً عنوان یا آدرس ملک را وارد فرمایید.');
      return;
    }
    setValidationError(null);

    const hasValidLocation =
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude);

    const parsedFloor =
      floor.trim() !== '' && floor.trim() !== '-' && !isNaN(Number(floor)) ? Number(floor) : undefined;
    const parsedTotalFloors =
      totalFloors.trim() !== '' && !isNaN(Number(totalFloors)) ? Number(totalFloors) : undefined;
    const parsedRooms = rooms !== '' && !isNaN(Number(rooms)) ? Number(rooms) : undefined;
    const parsedBuiltYear =
      builtYear.trim() !== '' && !isNaN(Number(builtYear)) ? Number(builtYear) : undefined;
    const parsedArea = area.trim() !== '' && !isNaN(Number(area)) ? Number(area) : undefined;

    const computedAge =
      parsedBuiltYear !== undefined
        ? parsedBuiltYear > 1300 && parsedBuiltYear <= 1500
          ? Math.max(0, 1403 - parsedBuiltYear)
          : parsedBuiltYear > 1900
          ? Math.max(0, 2025 - parsedBuiltYear)
          : parsedBuiltYear
        : undefined;

    const fallbackTitle = [propertyType, district.trim() || address.trim()].filter(Boolean).join(' در ');

    const itemData: Partial<RealEstateItem> = {
      title: title.trim() || fallbackTitle || 'ملک جدید',
      address: address.trim() || (district.trim() ? `نجف‌آباد، ${district.trim()}` : ''),
      district: district.trim() || undefined,
      propertyType: propertyType || '',
      transactionType,
      area: parsedArea,
      rooms: parsedRooms,
      floor: parsedFloor,
      totalFloors: parsedTotalFloors,
      builtYear: parsedBuiltYear,
      age: computedAge,
      orientation: orientation || undefined,
      facade: facade || undefined,
      documentType: documentType || undefined,
      hasParking,
      hasElevator,
      hasStorage,
      price: transactionType === 'خرید و فروش' ? numPrice : 0,
      pricePerMeter: transactionType === 'خرید و فروش' ? pricePerMeter : 0,
      deposit: transactionType === 'رهن و اجاره' ? numDeposit : 0,
      rent: transactionType === 'رهن و اجاره' ? numRent : 0,
      depositText: transactionType === 'رهن و اجاره' && numDeposit > 0 ? `${formatPrice(numDeposit)} تومان` : undefined,
      rentText: transactionType === 'رهن و اجاره' && numRent > 0 ? `${formatPrice(numRent)} تومان` : undefined,
      priceText:
        transactionType === 'خرید و فروش'
          ? numPrice > 0
            ? `${formatPrice(numPrice)} تومان`
            : undefined
          : numDeposit > 0 || numRent > 0
          ? `ودیعه: ${(numDeposit / 1000000).toLocaleString('fa-IR')} م • اجاره: ${(numRent / 1000000).toLocaleString('fa-IR')} م`
          : undefined,
      imageUrl: images.length > 0 ? images[0] : undefined,
      images: images.length > 0 ? images : undefined,
      latitude: hasValidLocation ? latitude : undefined,
      longitude: hasValidLocation ? longitude : undefined,
      source: 'excel',
    };

    onSave(itemData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full h-[95vh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                isEdit ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            >
              {isEdit ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isEdit ? 'ویرایش مشخصات ملک در داشبورد من' : 'افزودن ملک جدید به داشبورد من (اکسل)'}
              </h2>
              <p className="text-2xs text-slate-400 dark:text-slate-500">
                {isEdit
                  ? `ویرایش ردیف ${effectiveEditItem?.rowNumber || ''} — امکان ویرایش مشخصات، موقعیت روی نقشه، تصاویر و خروجی اکسل`
                  : 'مشخصات، موقعیت روی نقشه و تصاویر ملک را ثبت کنید تا به جدول اضافه و در اکسل خروجی گرفته شود'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {validationError && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
          {/* IMAGE UPLOAD & GALLERY SECTION */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>تصاویر ملک:</span>
                {images.length > 0 && (
                  <span className="text-2xs font-normal text-slate-500 dark:text-slate-400">
                    ({images.length} تصویر ثبت شده)
                  </span>
                )}
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-2xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>آپلود عکس از دستگاه</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-2xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  <span>افزودن لینک عکس</span>
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageFileUpload}
              className="hidden"
            />

            {/* Optional URL Input field */}
            {showUrlInput && (
              <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://example.com/property-photo.jpg"
                  className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-left dir-ltr focus:border-indigo-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="bg-slate-800 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  افزودن
                </button>
              </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 aspect-4/3 shadow-2xs"
                  >
                    <img
                      src={img}
                      alt={`تصویر ملک ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge for cover / primary image */}
                    {idx === 0 ? (
                      <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        کاور اصلی
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/90 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="انتخاب به عنوان تصویر شاخص اصلی"
                      >
                        انتخاب شاخص
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute bottom-1 left-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="حذف تصویر"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 bg-white/60 dark:bg-slate-900/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/30 p-5 rounded-xl text-center cursor-pointer transition-colors"
              >
                <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  برای آپلود تصاویر ملک از کامپیوتر یا گوشی اینجا کلیک کنید
                </p>
                <p className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">
                  پشتیبانی از فرمت‌های PNG، JPG و WEBP (چند عکسی)
                </p>
              </div>
            )}
          </div>

          {/* Transaction Type Selector (خرید و فروش vs رهن و اجاره) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">نوع معامله:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransactionType('خرید و فروش')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  transactionType === 'خرید و فروش'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>خرید و فروش (قیمت کل)</span>
              </button>

              <button
                type="button"
                onClick={() => setTransactionType('رهن و اجاره')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  transactionType === 'رهن و اجاره'
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-800 dark:text-blue-300 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>رهن و اجاره (ودیعه و کرایه)</span>
              </button>
            </div>
          </div>

          {/* Title & Property Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">عنوان یا تیتر ملک:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="مثلاً: آپارتمان ۱۱۰ متری دو خواب در ویلاشهر"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">نوع ملک:</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden cursor-pointer"
              >
                <option value="">انتخاب کنید...</option>
                <option value="آپارتمان">آپارتمان</option>
                <option value="خانه مسکونی">خانه مسکونی</option>
                <option value="ویلایی">ویلایی</option>
                <option value="دوبلکس">دوبلکس</option>
                <option value="زمین / کلنگی">زمین / کلنگی</option>
              </select>
            </div>
          </div>

          {/* Pricing depending on transactionType */}
          {transactionType === 'خرید و فروش' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-800/60">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">قیمت کل (تومان):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={price}
                  onChange={(e) => setPrice(normalizeNumericInput(e.target.value))}
                  placeholder="مثلاً: 3500000000"
                  className="w-full text-xs text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-hidden"
                />
                <span className="text-2xs text-emerald-700 dark:text-emerald-400 font-medium block">
                  {numPrice > 0 ? `${formatPrice(numPrice)} تومان` : '—'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">قیمت هر متر (محاسبه خودکار):</label>
                <div className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span>{pricePerMeter > 0 ? `${formatPrice(pricePerMeter)} تومان` : '—'}</span>
                  <span className="text-2xs text-slate-400 dark:text-slate-500">بر اساس متراژ</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-800/60">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">مبلغ رهن / ودیعه (تومان):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={deposit}
                  onChange={(e) => setDeposit(normalizeNumericInput(e.target.value))}
                  placeholder="مثلاً: 250000000"
                  className="w-full text-xs text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-2xs text-blue-700 dark:text-blue-400 font-medium block">
                  {numDeposit > 0 ? `${formatPrice(numDeposit)} تومان` : '—'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">اجاره ماهیانه (تومان):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={rent}
                  onChange={(e) => setRent(normalizeNumericInput(e.target.value))}
                  placeholder="مثلاً: 6000000"
                  className="w-full text-xs text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-2xs text-blue-700 dark:text-blue-400 font-medium block">
                  {numRent > 0 ? `${formatPrice(numRent)} تومان` : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Area, District, Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">متراژ (متر مربع):</label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={area}
                onChange={(e) => setArea(normalizeNumericInput(e.target.value))}
                placeholder="مثلاً: 110"
                className="w-full text-xs text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">محله / منطقه در نجف‌آباد:</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="مثلاً: ویلاشهر، خیابان شریعتی، فردوسی..."
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">تعداد اتاق خواب:</label>
              <select
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden cursor-pointer"
              >
                <option value="">انتخاب کنید...</option>
                <option value="1">۱ خواب</option>
                <option value="2">۲ خواب</option>
                <option value="3">۳ خواب</option>
                <option value="4">۴ خواب یا بیشتر</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">آدرس کامل:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="مثلاً: نجف‌آباد، خیابان منتظری جنوبی، کوچه ۱۸، پلاک ۴۰"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Interactive Map Location Picker */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 space-y-3">
            <button
              type="button"
              onClick={() => setIsMapSectionOpen((prev) => !prev)}
              className="w-full flex items-center justify-between gap-2 text-right cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>انتخاب موقعیت ملک روی نقشه:</span>
              </span>
              <span className="inline-flex items-center gap-1 text-2xs font-semibold text-slate-500 dark:text-slate-400">
                <span>{isMapSectionOpen ? 'بستن نقشه' : 'باز کردن نقشه'}</span>
                {isMapSectionOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            </button>

            {isMapSectionOpen && (
              <LocationPickerMap
                latitude={latitude}
                longitude={longitude}
                onChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                usePersianDigits={usePersianDigits}
              />
            )}
          </div>

          {/* Building Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400">طبقه:</label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={floor}
                onChange={(e) => setFloor(normalizeNumericInput(e.target.value, true))}
                placeholder="مثلاً: 2"
                className="w-full text-xs text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-2 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400">کل طبقات:</label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={totalFloors}
                onChange={(e) => setTotalFloors(normalizeNumericInput(e.target.value))}
                placeholder="مثلاً: 4"
                className="w-full text-xs text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-2 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400">سال ساخت:</label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={builtYear}
                onChange={(e) => setBuiltYear(normalizeNumericInput(e.target.value))}
                placeholder="مثلاً: 1403"
                className="w-full text-xs text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-2 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400">جهت:</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-2 cursor-pointer"
              >
                <option value="">انتخاب کنید...</option>
                <option value="شمالی">شمالی</option>
                <option value="جنوبی">جنوبی</option>
                <option value="شرقی">شرقی</option>
                <option value="غربی">غربی</option>
                <option value="دو کله">دو کله</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400">نمای ساختمان:</label>
              <select
                value={facade}
                onChange={(e) => setFacade(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-2 cursor-pointer"
              >
                <option value="">انتخاب کنید...</option>
                <option value="سنگ">سنگ</option>
                <option value="آجر">آجر</option>
                <option value="سرامیک">سرامیک</option>
                <option value="کامپوزیت">کامپوزیت</option>
                <option value="ترکیبی">ترکیبی</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-semibold text-slate-600 dark:text-slate-400">نوع سند:</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-2 cursor-pointer"
              >
                <option value="">انتخاب کنید...</option>
                <option value="تک برگ">تک برگ</option>
                <option value="منگوله‌دار">منگوله‌دار</option>
                <option value="قولنامه‌ای">قولنامه‌ای</option>
                <option value="وکالتی">وکالتی</option>
              </select>
            </div>
          </div>

          {/* Amenities toggles */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">امکانات رفاهی:</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setHasParking(cycleTriState(hasParking))}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  hasParking === true
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                    : hasParking === false
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>پارکینگ: {hasParking === true ? 'دارد' : hasParking === false ? 'ندارد' : 'نامشخص'}</span>
              </button>

              <button
                type="button"
                onClick={() => setHasElevator(cycleTriState(hasElevator))}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  hasElevator === true
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                    : hasElevator === false
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>آسانسور: {hasElevator === true ? 'دارد' : hasElevator === false ? 'ندارد' : 'نامشخص'}</span>
              </button>

              <button
                type="button"
                onClick={() => setHasStorage(cycleTriState(hasStorage))}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  hasStorage === true
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                    : hasStorage === false
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Warehouse className="w-3.5 h-3.5" />
                <span>انباری: {hasStorage === true ? 'دارد' : hasStorage === false ? 'ندارد' : 'نامشخص'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-800/90 backdrop-blur-xs shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs hover:shadow transition-all cursor-pointer ${
              isEdit ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEdit ? 'ذخیره تغییرات در اکسل' : 'افزودن ملک به اکسل'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
