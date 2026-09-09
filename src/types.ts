export type PropertyType = 'ویلایی' | 'کلنگی' | 'دوبلکس' | 'آپارتمان' | string;
export type BuildingOrientation = 'شمالی' | 'جنوبی' | 'شرقی' | 'غربی' | string;
export type BuildingFacade = 'سنگ' | 'آجر' | 'کامپوزیت' | 'سرامیک' | string;
export type DocumentType = 'تک برگ' | 'منگوله‌دار' | 'قولنامه‌ای' | string;
export type BooleanStatus = 'دارد' | 'ندارد' | string;

export interface RealEstateItem {
  id: number;
  rowNumber: number; // ردیف
  address: string; // آدرس
  propertyType: PropertyType; // نوع ملک
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
  price: number; // قیمت (تومان)
  pricePerMeter?: number; // محاسبه شده: قیمت هر متر
  rawRow?: Record<string, any>; // برای ستون‌های اضافی در اکسل‌های دلخواه
}

export interface FilterState {
  searchQuery: string;
  propertyTypes: string[];
  minPrice: number | null;
  maxPrice: number | null;
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
}

export type SortField = 'rowNumber' | 'price' | 'area' | 'pricePerMeter' | 'age' | 'rooms' | 'floor' | 'propertyType';
export type SortOrder = 'asc' | 'desc';
