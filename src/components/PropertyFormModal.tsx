import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { RealEstateItem, TransactionType, PropertyType } from '../types';
import { toPersianDigits, formatPrice, parseNumberFromString } from '../utils/formatters';

interface PropertyFormModalProps {
  isOpen: boolean;
  itemToEdit: RealEstateItem | null; // null => Add mode; non-null => Edit mode
  onClose: () => void;
  onSave: (item: Partial<RealEstateItem>) => void;
  usePersianDigits: boolean;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave,
  usePersianDigits,
}) => {
  const isEdit = Boolean(itemToEdit);

  const [title, setTitle] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('خرید و فروش');
  const [propertyType, setPropertyType] = useState<PropertyType>('آپارتمان');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState<number | ''>(100);
  const [price, setPrice] = useState<number | ''>(3000000000);
  const [deposit, setDeposit] = useState<number | ''>(200000000);
  const [rent, setRent] = useState<number | ''>(5000000);
  const [rooms, setRooms] = useState<number>(2);
  const [floor, setFloor] = useState<number>(1);
  const [totalFloors, setTotalFloors] = useState<number>(4);
  const [age, setAge] = useState<number>(3);
  const [orientation, setOrientation] = useState<string>('شمالی');
  const [facade, setFacade] = useState<string>('سنگ');
  const [documentType, setDocumentType] = useState<string>('تک برگ');
  const [hasParking, setHasParking] = useState<boolean>(true);
  const [hasElevator, setHasElevator] = useState<boolean>(true);
  const [hasStorage, setHasStorage] = useState<boolean>(true);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setTransactionType(itemToEdit.transactionType || (itemToEdit.deposit || itemToEdit.rent ? 'رهن و اجاره' : 'خرید و فروش'));
      setPropertyType(itemToEdit.propertyType || 'آپارتمان');
      setAddress(itemToEdit.address || '');
      setDistrict(itemToEdit.district || '');
      setArea(itemToEdit.area || 100);
      setPrice(itemToEdit.price || 0);
      setDeposit(itemToEdit.deposit || 0);
      setRent(itemToEdit.rent || 0);
      setRooms(itemToEdit.rooms || 2);
      setFloor(itemToEdit.floor ?? 1);
      setTotalFloors(itemToEdit.totalFloors || 4);
      setAge(itemToEdit.age ?? 0);
      setOrientation(itemToEdit.orientation || 'شمالی');
      setFacade(itemToEdit.facade || 'سنگ');
      setDocumentType(itemToEdit.documentType || 'تک برگ');
      setHasParking(Boolean(itemToEdit.hasParking));
      setHasElevator(Boolean(itemToEdit.hasElevator));
      setHasStorage(Boolean(itemToEdit.hasStorage));
    } else {
      // Reset for add
      setTitle('');
      setTransactionType('خرید و فروش');
      setPropertyType('آپارتمان');
      setAddress('');
      setDistrict('ویلاشهر');
      setArea(110);
      setPrice(3500000000);
      setDeposit(250000000);
      setRent(6000000);
      setRooms(2);
      setFloor(1);
      setTotalFloors(3);
      setAge(2);
      setOrientation('شمالی');
      setFacade('سنگ');
      setDocumentType('تک برگ');
      setHasParking(true);
      setHasElevator(true);
      setHasStorage(true);
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const numArea = Number(area) || 0;
  const numPrice = Number(price) || 0;
  const numDeposit = Number(deposit) || 0;
  const numRent = Number(rent) || 0;
  const pricePerMeter = numArea > 0 && numPrice > 0 ? Math.round(numPrice / numArea) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() && !title.trim()) {
      alert('لطفاً عنوان یا آدرس ملک را وارد فرمایید.');
      return;
    }

    const itemData: Partial<RealEstateItem> = {
      title: title.trim() || `${propertyType} در ${district || address}`,
      address: address.trim() || `نجف‌آباد، ${district}`,
      district: district.trim(),
      propertyType,
      transactionType,
      area: numArea,
      rooms,
      floor,
      totalFloors,
      age,
      orientation,
      facade,
      documentType,
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
          ? `${formatPrice(numPrice)} تومان`
          : `ودیعه: ${(numDeposit / 1000000).toLocaleString('fa-IR')} م • اجاره: ${(numRent / 1000000).toLocaleString('fa-IR')} م`,
      source: 'excel',
    };

    onSave(itemData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                isEdit ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            >
              {isEdit ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEdit ? 'ویرایش مشخصات ملک در اکسل' : 'افزودن ملک جدید به داشبورد اکسل'}
              </h2>
              <p className="text-2xs text-slate-400">
                {isEdit
                  ? `ویرایش ردیف ${itemToEdit?.rowNumber || ''} — پس از ذخیره، خروجی اکسل بروز می‌شود`
                  : 'مشخصات ملک را وارد کنید تا به جدول افزوده شده و در خروجی اکسل درج گردد'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Transaction Type Selector (خرید و فروش vs رهن و اجاره) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">نوع معامله:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransactionType('خرید و فروش')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  transactionType === 'خرید و فروش'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>خرید و فروش (قیمت کل)</span>
              </button>

              <button
                type="button"
                onClick={() => setTransactionType('رهن و اجاره')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  transactionType === 'رهن و اجاره'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>رهن و اجاره (ودیعه و کرایه)</span>
              </button>
            </div>
          </div>

          {/* Title & Property Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">عنوان یا تیتر ملک:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً: آپارتمان ۱۱۰ متری دو خواب در ویلاشهر"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">نوع ملک:</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
              >
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">قیمت کل (تومان):</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="مثلاً: 3500000000"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-hidden"
                />
                <span className="text-2xs text-emerald-700 font-medium block">
                  {numPrice > 0 ? `${formatPrice(numPrice)} تومان` : '۰ تومان'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">قیمت هر متر (محاسبه خودکار):</label>
                <div className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 flex items-center justify-between">
                  <span>{pricePerMeter > 0 ? `${formatPrice(pricePerMeter)} تومان` : '—'}</span>
                  <span className="text-2xs text-slate-400">بر اساس متراژ</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">مبلغ رهن / ودیعه (تومان):</label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="مثلاً: 250000000"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-2xs text-blue-700 font-medium block">
                  {numDeposit > 0 ? `${formatPrice(numDeposit)} تومان` : '۰ تومان'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اجاره ماهیانه (تومان):</label>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="مثلاً: 6000000"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-2xs text-blue-700 font-medium block">
                  {numRent > 0 ? `${formatPrice(numRent)} تومان` : '۰ تومان (رهن کامل)'}
                </span>
              </div>
            </div>
          )}

          {/* Area, District, Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">متراژ (متر مربع):</label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="115"
                min="10"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">محله / منطقه در نجف‌آباد:</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="مثلاً: ویلاشهر، خیابان شریعتی، فردوسی..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">تعداد اتاق خواب:</label>
              <select
                value={rooms}
                onChange={(e) => setRooms(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
              >
                <option value={1}>۱ خواب</option>
                <option value={2}>۲ خواب</option>
                <option value={3}>۳ خواب</option>
                <option value={4}>۴ خواب یا بیشتر</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">آدرس کامل:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثلاً: نجف‌آباد، خیابان منتظری جنوبی، کوچه ۱۸، پلاک ۴۰"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Building Specifications: floor, totalFloors, age, orientation, facade, doc */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-2xs font-semibold text-slate-600">طبقه:</label>
              <input
                type="number"
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-semibold text-slate-600">کل طبقات:</label>
              <input
                type="number"
                value={totalFloors}
                onChange={(e) => setTotalFloors(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-semibold text-slate-600">سن بنا (سال):</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-semibold text-slate-600">جهت:</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 cursor-pointer"
              >
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
              <label className="text-2xs font-semibold text-slate-600">نمای ساختمان:</label>
              <select
                value={facade}
                onChange={(e) => setFacade(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 cursor-pointer"
              >
                <option value="سنگ">سنگ</option>
                <option value="آجر">آجر</option>
                <option value="سرامیک">سرامیک</option>
                <option value="کامپوزیت">کامپوزیت</option>
                <option value="ترکیبی">ترکیبی</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-semibold text-slate-600">نوع سند:</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 cursor-pointer"
              >
                <option value="تک برگ">تک برگ</option>
                <option value="منگوله‌دار">منگوله‌دار</option>
                <option value="قولنامه‌ای">قولنامه‌ای</option>
                <option value="وکالتی">وکالتی</option>
              </select>
            </div>
          </div>

          {/* Amenities toggles */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-700 block">امکانات رفاهی:</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setHasParking(!hasParking)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  hasParking
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>پارکینگ: {hasParking ? 'دارد' : 'ندارد'}</span>
              </button>

              <button
                type="button"
                onClick={() => setHasElevator(!hasElevator)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  hasElevator
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>آسانسور: {hasElevator ? 'دارد' : 'ندارد'}</span>
              </button>

              <button
                type="button"
                onClick={() => setHasStorage(!hasStorage)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  hasStorage
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <Warehouse className="w-3.5 h-3.5" />
                <span>انباری: {hasStorage ? 'دارد' : 'ندارد'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs hover:shadow transition-all cursor-pointer ${
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
