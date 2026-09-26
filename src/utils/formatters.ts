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

export const formatDepositRent = (
  deposit?: number,
  rent?: number,
  usePersianDigits = true,
  short = true
): string => {
  const depStr =
    deposit !== undefined && deposit !== null && deposit > 0
      ? short
        ? `ودیعه: ${formatPriceShort(deposit, usePersianDigits)}`
        : `ودیعه: ${formatPrice(deposit, usePersianDigits)} تومان`
      : 'ودیعه: رایگان / توافقی';

  const rentStr =
    rent !== undefined && rent !== null && rent > 0
      ? short
        ? `اجاره: ${formatPriceShort(rent, usePersianDigits)}`
        : `اجاره: ${formatPrice(rent, usePersianDigits)} تومان`
      : 'اجاره: رایگان / رهن کامل';

  return `${depStr} • ${rentStr}`;
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

export const formatRelativeTimePersian = (date: Date): string => {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'چند لحظه پیش';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${toPersianDigits(diffMin)} دقیقه پیش`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${toPersianDigits(diffHours)} ساعت پیش`;
  const diffDays = Math.floor(diffHours / 24);
  return `${toPersianDigits(diffDays)} روز پیش`;
};
