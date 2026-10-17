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
  area?: number; // متراژ اصلی / کل (متر مربع)
  landArea?: number; // متراژ زمین (متر مربع - در صورت وجود)
  buildingArea?: number; // متراژ زیربنا / بنا (متر مربع - در صورت وجود)
  rooms?: number; // تعداد اتاق
  floor?: number; // طبقه
  totalFloors?: number; // تعداد کل طبقات
  age?: number; // سن بنا (سال)
  orientation?: BuildingOrientation | string; // جهت ساختمان (تنها در صورت قید در آگهی)
  facade?: BuildingFacade | string; // نمای ساختمان (تنها در صورت قید در آگهی)
  hasParking?: boolean; // پارکینگ (تنها در صورت ذکر در امکانات آگهی)
  hasElevator?: boolean; // آسانسور (تنها در صورت ذکر در آگهی قید می‌شود)
  hasStorage?: boolean; // انباری (تنها در صورت ذکر در امکانات آگهی)
  documentType?: DocumentType | string; // نوع سند (تنها در صورت قید در آگهی)
  price?: number; // قیمت کل (تومان) برای خرید و فروش
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
  targetArea?: number | null; // e.g. 120
  areaTolerance?: number; // e.g. 10 => 110 to 130
  minArea?: number | null;
  maxArea?: number | null;
  streetOrNeighborhood?: string; // e.g. 'شریعتی', 'ویلاشهر'
  maxPrice?: number | null;
  maxDeposit?: number | null;
  maxRent?: number | null;
  requiresParking?: boolean;
  requiresElevator?: boolean;
  notifiedItemIds?: (string | number)[];
  autoAddToExcel?: boolean; // افزودن خودکار ملک‌های منطبق به جدول اکسل من
}

export interface AppUser {
  id: string;
  username: string;
  password: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLoginAt?: string;
  maxDashboards?: number; // default 5
}

export interface UserDashboard {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  excelFileName: string;
  excelData: RealEstateItem[];
  hasExcelModifications: boolean;
  divarTimeRange?: DivarTimeRange;
  divarAlerts?: DivarAlert[];
}
