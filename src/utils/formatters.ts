export const toPersianDigits = (n: number | string): string => {
  if (n === null || n === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/[0-9]/g, (w) => farsiDigits[+w]);
};

export const normalizePersianText = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u200B-\u200D\uFEFF]/g, ' ') // zero-width spaces
    .replace(/[\u064B-\u065F]/g, '') // diacritics
    .replace(/\s+/g, ' ');
};

export const formatPrice = (price: number, usePersianDigits = true): string => {
  if (price === null || price === undefined || isNaN(price)) return '۰';
  const formatted = price.toLocaleString('en-US');
  return usePersianDigits ? toPersianDigits(formatted) : formatted;
};

export const formatPriceShort = (price: number, usePersianDigits = true): string => {
  if (!price || isNaN(price)) return '۰';
  if (price >= 1_000_000_000) {
    const billions = price / 1_000_000_000;
    const formatted = billions.toFixed(billions >= 10 ? 1 : 2).replace(/\.0+$/, '');
    return `${usePersianDigits ? toPersianDigits(formatted) : formatted} میلیارد تومان`;
  }
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    const formatted = millions.toFixed(millions >= 10 ? 1 : 2).replace(/\.0+$/, '');
    return `${usePersianDigits ? toPersianDigits(formatted) : formatted} میلیون تومان`;
  }
  return `${formatPrice(price, usePersianDigits)} تومان`;
};

export const parseNumberFromString = (val: any): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  // Convert Persian/Arabic digits to English digits
  const str = val
    .toString()
    .replace(/[۰-۹]/g, (d: string) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d: string) => String(d.charCodeAt(0) - 1632))
    .replace(/[,،\s_]/g, '');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
};

export const parseBooleanStatus = (val: any): boolean => {
  if (typeof val === 'boolean') return val;
  if (!val) return false;
  const normalized = normalizePersianText(val.toString());
  if (
    normalized.includes('دارد') ||
    normalized.includes('بله') ||
    normalized === 'yes' ||
    normalized === 'true' ||
    normalized === '1'
  ) {
    return true;
  }
  return false;
};
