export type PropertyType = 'ویلایی' | 'کلنگی' | 'دوبلکس' | 'آپارتمان' | 'خانه مسکونی' | 'زمین / کلنگی' | string;
export type BuildingOrientation = 'شمالی' | 'جنوبی' | 'شرقی' | 'غربی' | 'دو کله' | string;
export type BuildingFacade = 'سنگ' | 'آجر' | 'کامپوزیت' | 'سرامیک' | 'ترکیبی' | string;
export type DocumentType = 'تک برگ' | 'منگوله‌دار' | 'قولنامه‌ای' | 'وکالتی' | string;
export type BooleanStatus = 'دارد' | 'ندارد' | string;

export type TransactionType = 'خرید و فروش' | 'رهن و اجاره';

export type DivarTimeRange =
  | '1h'
  | '2h'
  | '6h'
  | '12h'
  | '24h'
  | '3d'
  | '7d'
  | '14d'
  | '30d'
  | 'all';

export interface RealEstateItem {
  id: number;
  rowNumber: number; // ردیف
  address: string; // آدرس
  propertyType: PropertyType; // نوع ملک
  transactionType?: TransactionType; // نوع معامله: خرید و فروش یا رهن و اجاره
  area: number; // متراژ (متر مربع)
  rooms: number; // تعداد اتاق
  floor: number; // طبقه
  totalFloors: number; // تعداد کل طبقات
  age: number; // سن بنا (سال)
  orientation: BuildingOrientation; // جهت ساختمان
  facade: BuildingFacade; // نمای ساختمان
  hasParking: boolean; // پارکینگ
  hasElevator: boolean; // آسانسور
  hasStorage: boolean; // انباری
  documentType: DocumentType; // نوع سند
  price: number; // قیمت کل (تومان) برای خرید و فروش
  pricePerMeter?: number; // قیمت هر متر برای خرید و فروش
  deposit?: number; // ودیعه / رهن (تومان) برای رهن و اجاره
  rent?: number; // اجاره ماهیانه (تومان) برای رهن و اجاره
  depositText?: string;
  rentText?: string;
  title?: string; // عنوان آگهی
  district?: string; // محله / منطقه در نجف‌آباد
  divarToken?: string; // توکن آگهی در دیوار
  divarUrl?: string; // لینک مستقیم آگهی
  imageUrl?: string; // تصویر اصلی
  images?: string[]; // کلیه تصاویر آگهی (چند تصویری)
  publishedAt?: string; // تاریخ و زمان انتشار (ISO)
  relativeTime?: string; // زمان نسبی انتشار (مثلاً ۱ ساعت پیش، دیروز)
  priceText?: string; // متن خام قیمت
  source?: 'divar' | 'excel' | 'sample'; // منبع داده
  rawRow?: Record<string, any>; // ستون‌های اضافه در اکسل
}

export interface FilterState {
  searchQuery: string;
  transactionType: 'all' | 'خرید و فروش' | 'رهن و اجاره';
  districts?: string[];
  propertyTypes: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minDeposit: number | null;
  maxDeposit: number | null;
  minRent: number | null;
  maxRent: number | null;
  minArea: number | null;
  maxArea: number | null;
  rooms: number[];
  documentTypes: string[];
  orientations: string[];
  facades: string[];
  parking: 'all' | 'yes' | 'no';
  elevator: 'all' | 'yes' | 'no';
  storage: 'all' | 'yes' | 'no';
  minAge: number | null;
  maxAge: number | null;
  minFloor: number | null;
  maxFloor: number | null;
  timeRange?: DivarTimeRange;
}

export type SortField =
  | 'rowNumber'
  | 'price'
  | 'deposit'
  | 'rent'
  | 'area'
  | 'pricePerMeter'
  | 'age'
  | 'rooms'
  | 'floor'
  | 'propertyType'
  | 'publishedAt';

export type SortOrder = 'asc' | 'desc';

export interface DivarAlert {
  id: string;
  title: string;
  createdAt: string;
  enabled: boolean;
  transactionType?: 'all' | 'خرید و فروش' | 'رهن و اجاره';
  propertyType?: string; // e.g. 'خانه مسکونی', 'ویلایی', 'آپارتمان', 'all'
  targetArea?: number | null; // e.g. 115
  areaTolerance?: number; // e.g. 10 => 105 to 125
  minArea?: number | null;
  maxArea?: number | null;
  streetOrNeighborhood?: string; // e.g. 'شریعتی', 'ویلاشهر'
  maxPrice?: number | null;
  maxDeposit?: number | null;
  maxRent?: number | null;
  requiresParking?: boolean;
  requiresElevator?: boolean;
  notifiedItemIds?: (string | number)[];
}
