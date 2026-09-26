import * as XLSX from 'xlsx';
import { RealEstateItem, TransactionType } from '../types';
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

    // Find header row: look for row that contains known keywords
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
          norm.includes('معامله') ||
          norm.includes('رهن') ||
          norm.includes('اجاره') ||
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
      else if (norm.includes('معامله') || norm === 'transaction' || norm.includes('نوع قرارداد'))
        colIndex.transactionType = idx;
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
      else if (norm.includes('قیمت') || norm.includes('مبلغ کل') || norm === 'price' || norm === 'cost')
        colIndex.price = idx;
      else if (norm.includes('رهن') || norm.includes('ودیعه') || norm === 'deposit')
        colIndex.deposit = idx;
      else if (norm.includes('اجاره') || norm === 'rent')
        colIndex.rent = idx;
      else if (norm.includes('محله') || norm.includes('منطقه') || norm === 'district')
        colIndex.district = idx;
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

      const addressVal = getVal('address') || (row.find((c) => typeof c === 'string' && c.length > 8) ?? `ملک شماره ${idx + 1}`);
      const priceVal = parseNumberFromString(getVal('price'));
      const depositVal = parseNumberFromString(getVal('deposit'));
      const rentVal = parseNumberFromString(getVal('rent'));
      const areaVal = parseNumberFromString(getVal('area')) || 100;
      const rowNumVal = parseNumberFromString(getVal('rowNumber')) || idx + 1;

      let transType: TransactionType = 'خرید و فروش';
      const rawTrans = getVal('transactionType');
      if (rawTrans) {
        const normTrans = normalizePersianText(String(rawTrans));
        if (normTrans.includes('اجاره') || normTrans.includes('رهن')) {
          transType = 'رهن و اجاره';
        }
      } else if (depositVal > 0 || rentVal > 0) {
        transType = 'رهن و اجاره';
      }

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
        district: String(getVal('district') || '').trim() || undefined,
        propertyType: String(getVal('propertyType') || 'آپارتمان').trim(),
        transactionType: transType,
        area: areaVal,
        rooms: parseNumberFromString(getVal('rooms')) || 1,
        floor: parseNumberFromString(getVal('floor')) || 0,
        totalFloors: parseNumberFromString(getVal('totalFloors')) || 1,
        age: parseNumberFromString(getVal('age')) || 0,
        orientation: String(getVal('orientation') || 'شمالی').trim(),
        facade: String(getVal('facade') || 'سنگ').trim(),
        hasParking: parseBooleanStatus(getVal('parking')),
        hasElevator: parseBooleanStatus(getVal('elevator')),
        hasStorage: parseBooleanStatus(getVal('storage')),
        documentType: String(getVal('documentType') || 'تک برگ').trim(),
        price: priceVal,
        pricePerMeter: areaVal > 0 && priceVal > 0 ? Math.round(priceVal / areaVal) : 0,
        deposit: depositVal,
        rent: rentVal,
        depositText: depositVal > 0 ? `${depositVal.toLocaleString('fa-IR')} تومان` : undefined,
        rentText: rentVal > 0 ? `${rentVal.toLocaleString('fa-IR')} تومان` : undefined,
        priceText:
          transType === 'خرید و فروش'
            ? `${priceVal.toLocaleString('fa-IR')} تومان`
            : `ودیعه: ${(depositVal / 1000000).toLocaleString('fa-IR')} م • اجاره: ${(rentVal / 1000000).toLocaleString('fa-IR')} م`,
        source: 'excel',
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

export const exportToExcel = (items: RealEstateItem[], fileName = 'املاک_داشبورد_من.xlsx') => {
  const exportData = items.map((item, idx) => ({
    ردیف: item.rowNumber || idx + 1,
    'نوع معامله': item.transactionType || (item.deposit || item.rent ? 'رهن و اجاره' : 'خرید و فروش'),
    'عنوان / آدرس': item.title || item.address,
    'نوع ملک': item.propertyType,
    'متراژ (متر مربع)': item.area,
    'قیمت کل (تومان)': item.price || 0,
    'قیمت هر متر (تومان)': item.pricePerMeter || (item.area > 0 && item.price ? Math.round(item.price / item.area) : 0),
    'ودیعه / رهن (تومان)': item.deposit || 0,
    'اجاره ماهیانه (تومان)': item.rent || 0,
    محله: item.district || '',
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
    آدرس: item.address,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'لیست املاک');

  // Set RTL direction for the worksheet
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ rightToLeft: true });

  XLSX.writeFile(workbook, fileName);
};
