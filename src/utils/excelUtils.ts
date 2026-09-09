import * as XLSX from 'xlsx';
import { RealEstateItem } from '../types';
import { parseBooleanStatus, parseNumberFromString, normalizePersianText } from './formatters';

export interface ExcelParseResult {
  success: boolean;
  items: RealEstateItem[];
  sheetNames: string[];
  totalRows: number;
  fileName: string;
  errorMessage?: string;
}

export const parseExcelFile = async (file: File): Promise<ExcelParseResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        success: false,
        items: [],
        sheetNames: [],
        totalRows: 0,
        fileName: file.name,
        errorMessage: 'فایل اکسل انتخاب شده شیت معتبری ندارد.',
      };
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (!rawData || rawData.length === 0) {
      return {
        success: false,
        items: [],
        sheetNames: workbook.SheetNames,
        totalRows: 0,
        fileName: file.name,
        errorMessage: 'شیت انتخاب شده خالی است.',
      };
    }

    // Find header row: look for row that contains known keywords like "آدرس", "قیمت", "نوع", "address", "price"
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      if (Array.isArray(row)) {
        const rowStr = row.map((c) => String(c || '')).join(' ');
        const norm = normalizePersianText(rowStr);
        if (
          norm.includes('ادرس') ||
          norm.includes('قیمت') ||
          norm.includes('نوع') ||
          norm.includes('ردیف') ||
          norm.includes('price') ||
          norm.includes('address')
        ) {
          headerRowIndex = i;
          break;
        }
      }
    }

    const headers = (rawData[headerRowIndex] || []).map((h) => String(h || '').trim());
    const dataRows = rawData.slice(headerRowIndex + 1);

    // Map column indices
    const colIndex: Record<string, number> = {};

    headers.forEach((h, idx) => {
      const norm = normalizePersianText(h);
      if (norm.includes('ردیف') || norm === 'id' || norm === 'row') colIndex.rowNumber = idx;
      else if (norm.includes('ادرس') || norm.includes('نشانی') || norm === 'address') colIndex.address = idx;
      else if (norm.includes('نوع ملک') || norm === 'نوع' || norm === 'property type' || norm === 'type')
        colIndex.propertyType = idx;
      else if (norm.includes('متراژ') || norm.includes('مساحت') || norm === 'area' || norm === 'size')
        colIndex.area = idx;
      else if (norm.includes('اتاق') || norm.includes('خواب') || norm === 'rooms' || norm === 'bedrooms')
        colIndex.rooms = idx;
      else if (norm.includes('کل طبقات') || norm.includes('تعداد طبقات') || norm === 'total floors')
        colIndex.totalFloors = idx;
      else if (norm.includes('طبقه') || norm === 'floor') colIndex.floor = idx;
      else if (norm.includes('سن بنا') || norm.includes('عمر بنا') || norm.includes('قدمت') || norm === 'age')
        colIndex.age = idx;
      else if (norm.includes('جهت') || norm === 'orientation' || norm === 'direction') colIndex.orientation = idx;
      else if (norm.includes('نما') || norm === 'facade') colIndex.facade = idx;
      else if (norm.includes('پارکینگ') || norm === 'parking') colIndex.parking = idx;
      else if (norm.includes('آسانسور') || norm.includes('اسانسور') || norm === 'elevator' || norm === 'lift')
        colIndex.elevator = idx;
      else if (norm.includes('انباری') || norm === 'storage') colIndex.storage = idx;
      else if (norm.includes('سند') || norm === 'document' || norm === 'deed') colIndex.documentType = idx;
      else if (norm.includes('قیمت') || norm.includes('مبلغ') || norm === 'price' || norm === 'cost')
        colIndex.price = idx;
    });

    const items: RealEstateItem[] = [];

    dataRows.forEach((row, idx) => {
      if (!row || row.length === 0 || row.every((c) => c === undefined || c === null || String(c).trim() === '')) {
        return; // skip empty rows
      }

      const getVal = (field: string) => {
        const i = colIndex[field];
        return i !== undefined ? row[i] : undefined;
      };

      const addressVal = getVal('address') || (row.find((c) => typeof c === 'string' && c.length > 10) ?? `ملک شماره ${idx + 1}`);
      const priceVal = parseNumberFromString(getVal('price'));
      const areaVal = parseNumberFromString(getVal('area')) || 100;
      const rowNumVal = parseNumberFromString(getVal('rowNumber')) || idx + 1;

      // Extract raw dictionary for any custom columns
      const rawRow: Record<string, any> = {};
      headers.forEach((h, hIdx) => {
        if (h && row[hIdx] !== undefined) {
          rawRow[h] = row[hIdx];
        }
      });

      items.push({
        id: idx + 1,
        rowNumber: rowNumVal,
        address: String(addressVal || '').trim(),
        propertyType: String(getVal('propertyType') || 'آپارتمان').trim(),
        area: areaVal,
        rooms: parseNumberFromString(getVal('rooms')) || 1,
        floor: parseNumberFromString(getVal('floor')) || 0,
        totalFloors: parseNumberFromString(getVal('totalFloors')) || 1,
        age: parseNumberFromString(getVal('age')) || 0,
        orientation: String(getVal('orientation') || 'نامشخص').trim(),
        facade: String(getVal('facade') || 'نامشخص').trim(),
        hasParking: parseBooleanStatus(getVal('parking')),
        hasElevator: parseBooleanStatus(getVal('elevator')),
        hasStorage: parseBooleanStatus(getVal('storage')),
        documentType: String(getVal('documentType') || 'تک برگ').trim(),
        price: priceVal,
        pricePerMeter: areaVal > 0 ? Math.round(priceVal / areaVal) : 0,
        rawRow,
      });
    });

    return {
      success: true,
      items,
      sheetNames: workbook.SheetNames,
      totalRows: items.length,
      fileName: file.name,
    };
  } catch (err: any) {
    console.error('Error parsing Excel file:', err);
    return {
      success: false,
      items: [],
      sheetNames: [],
      totalRows: 0,
      fileName: file.name,
      errorMessage: `خطا در خواندن فایل اکسل: ${err.message || 'فرمت نامعتبر است'}`,
    };
  }
};

export const exportToExcel = (items: RealEstateItem[], fileName = 'لیست_املاک.xlsx') => {
  const exportData = items.map((item) => ({
    ردیف: item.rowNumber,
    آدرس: item.address,
    'نوع ملک': item.propertyType,
    'متراژ (متر مربع)': item.area,
    'تعداد اتاق': item.rooms,
    طبقه: item.floor === 0 ? 'همکف' : item.floor,
    'تعداد کل طبقات': item.totalFloors,
    'سن بنا (سال)': item.age,
    'جهت ساختمان': item.orientation,
    'نمای ساختمان': item.facade,
    پارکینگ: item.hasParking ? 'دارد' : 'ندارد',
    آسانسور: item.hasElevator ? 'دارد' : 'ندارد',
    انباری: item.hasStorage ? 'دارد' : 'ندارد',
    'نوع سند': item.documentType,
    'قیمت (تومان)': item.price,
    'قیمت هر متر (تومان)': item.pricePerMeter || Math.round(item.price / (item.area || 1)),
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'لیست املاک');

  // Set RTL direction for the worksheet
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ rightToLeft: true });

  XLSX.writeFile(workbook, fileName);
};
