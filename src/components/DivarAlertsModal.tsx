import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Sparkles,
  MapPin,
  Tag,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Eye,
  Check,
  FileSpreadsheet,
  User,
  Phone,
  PhoneCall,
  Copy,
  CheckCheck,
  Building2,
  BedDouble,
  Clock,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { DivarAlert, RealEstateItem, FilterState } from '../types';
import { toPersianDigits, formatPriceShort, normalizePersianText, formatBuiltYear } from '../utils/formatters';
import { playNotificationChime } from '../utils/audioAlert';

interface DivarAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: DivarAlert[];
  onSaveAlerts?: (alerts: DivarAlert[]) => void;
  onAddAlert?: (alert: Omit<DivarAlert, 'id' | 'createdAt'>) => void;
  onToggleAlert?: (id: string) => void;
  onDeleteAlert?: (id: string) => void;
  divarItems?: RealEstateItem[];
  currentDivarItems?: RealEstateItem[];
  excelItems?: RealEstateItem[];
  onSelectProperty?: (item: RealEstateItem) => void;
  onAddToExcel?: (item: RealEstateItem) => void;
  onAddMultipleToExcel?: (items: RealEstateItem[]) => void;
  usePersianDigits: boolean;
  initialFilter?: FilterState | null;
  initialItem?: RealEstateItem | null;
}

export function matchItemWithAlert(item: RealEstateItem, alert: DivarAlert): boolean {
  if (!alert.enabled) return false;

  // 1. Transaction Type
  if (alert.transactionType && alert.transactionType !== 'all') {
    if (item.transactionType && item.transactionType !== alert.transactionType) {
      return false;
    }
  }

  // 2. Property Type (e.g. want a house/villa not an apartment, or apartment)
  if (alert.propertyType && alert.propertyType !== 'all') {
    const itemNorm = normalizePersianText(item.propertyType || '');
    const titleNorm = normalizePersianText(item.title || '');
    const targetNorm = normalizePersianText(alert.propertyType);

    if (alert.propertyType === 'خانه مسکونی' || alert.propertyType === 'ویلایی') {
      const isHouse =
        itemNorm.includes('خانه') ||
        itemNorm.includes('ویلا') ||
        itemNorm.includes('مسکونی') ||
        titleNorm.includes('منزل') ||
        titleNorm.includes('خانه') ||
        titleNorm.includes('ویلا');
      const isApartment = itemNorm.includes('آپارتمان') || titleNorm.includes('آپارتمان');
      if (!isHouse || isApartment) return false;
    } else if (alert.propertyType === 'آپارتمان') {
      if (!itemNorm.includes('آپارتمان') && !titleNorm.includes('آپارتمان')) return false;
    } else {
      if (!itemNorm.includes(targetNorm) && !titleNorm.includes(targetNorm)) return false;
    }
  }

  // 3. Area / Metrage matching (e.g. 100m or 500m with tolerance)
  if (alert.targetArea && alert.targetArea > 0) {
    const tol = alert.areaTolerance !== undefined ? alert.areaTolerance : (alert.targetArea >= 300 ? 50 : 15);
    const minA = alert.minArea || alert.targetArea - tol;
    const maxA = alert.maxArea || alert.targetArea + tol;
    if (item.area !== undefined && item.area !== null) {
      if (item.area < minA || item.area > maxA) {
        return false;
      }
    }
  } else {
    if (alert.minArea && item.area && item.area < alert.minArea) return false;
    if (alert.maxArea && item.area && item.area > alert.maxArea) return false;
  }

  // 4. Street or Neighborhood
  if (alert.streetOrNeighborhood && alert.streetOrNeighborhood.trim()) {
    const streetNorm = normalizePersianText(alert.streetOrNeighborhood);
    const itemAddressNorm = normalizePersianText(item.address || '');
    const itemDistrictNorm = normalizePersianText(item.district || '');
    const itemTitleNorm = normalizePersianText(item.title || '');

    const matchesStreet =
      itemAddressNorm.includes(streetNorm) ||
      itemDistrictNorm.includes(streetNorm) ||
      itemTitleNorm.includes(streetNorm);

    if (!matchesStreet) return false;
  }

  // 5. Max Price / Deposit
  if (alert.maxPrice && alert.maxPrice > 0 && item.price && item.price > alert.maxPrice) {
    return false;
  }
  if (alert.maxDeposit && alert.maxDeposit > 0 && item.deposit && item.deposit > alert.maxDeposit) {
    return false;
  }
  if (alert.maxRent && alert.maxRent > 0 && item.rent && item.rent > alert.maxRent) {
    return false;
  }

  // 6. Amenities
  if (alert.requiresParking && !item.hasParking) return false;
  if (alert.requiresElevator && !item.hasElevator) return false;

  return true;
}

export const DivarAlertsModal: React.FC<DivarAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onSaveAlerts,
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
  divarItems = [],
  currentDivarItems = [],
  excelItems = [],
  onSelectProperty,
  onAddToExcel,
  onAddMultipleToExcel,
  usePersianDigits,
  initialFilter,
  initialItem,
}) => {
  const activeItems = divarItems.length > 0 ? divarItems : currentDivarItems;
  const [showCreateForm, setShowCreateForm] = useState(alerts.length === 0);
  const [title, setTitle] = useState('');
  const [transactionType, setTransactionType] = useState<'all' | 'خرید و فروش' | 'رهن و اجاره'>('all');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [targetArea, setTargetArea] = useState<number | ''>('');
  const [areaTolerance, setAreaTolerance] = useState<number>(15);
  const [streetOrNeighborhood, setStreetOrNeighborhood] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [requiresParking, setRequiresParking] = useState(false);
  const [requiresElevator, setRequiresElevator] = useState(false);
  const [autoAddToExcel, setAutoAddToExcel] = useState(true);

  // Customer info fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Map of collapsed alert result sections (by default all open)
  const [collapsedAlertIds, setCollapsedAlertIds] = useState<Record<string, boolean>>({});

  const [browserNotificationStatus, setBrowserNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [testTriggered, setTestTriggered] = useState(false);

  // Sync with initialFilter or initialItem when opened
  useEffect(() => {
    if (!isOpen) return;
    if (initialFilter) {
      setShowCreateForm(true);
      setTitle('هشدار بر اساس فیلترهای دیوار');
      setTransactionType(
        initialFilter.transactionType === 'all'
          ? 'all'
          : (initialFilter.transactionType as any) || 'all'
      );
      if (initialFilter.propertyTypes && initialFilter.propertyTypes.length > 0) {
        setPropertyType(initialFilter.propertyTypes[0]);
      } else {
        setPropertyType('all');
      }
      if (initialFilter.minArea || initialFilter.maxArea) {
        const areaVal = initialFilter.minArea || initialFilter.maxArea || '';
        setTargetArea(areaVal);
        setAreaTolerance(areaVal && Number(areaVal) >= 300 ? 50 : 15);
      }
      if (initialFilter.maxPrice || initialFilter.maxDeposit) {
        setMaxPrice(initialFilter.maxPrice || initialFilter.maxDeposit || '');
      }
      if (initialFilter.searchQuery) {
        setStreetOrNeighborhood(initialFilter.searchQuery);
      }
      setRequiresParking(initialFilter.parking === 'yes');
      setRequiresElevator(initialFilter.elevator === 'yes');
      setAutoAddToExcel(true);
    } else if (initialItem) {
      setShowCreateForm(true);
      setTitle(`املاک مشابه ${initialItem.title || initialItem.propertyType}`);
      setTransactionType(
        initialItem.transactionType === 'خرید و فروش' || initialItem.transactionType === 'رهن و اجاره'
          ? initialItem.transactionType
          : 'all'
      );
      setPropertyType(initialItem.propertyType || 'all');
      setTargetArea(initialItem.area || '');
      setAreaTolerance(initialItem.area && initialItem.area >= 300 ? 50 : 15);
      setStreetOrNeighborhood(initialItem.district || '');
      setMaxPrice(initialItem.price || initialItem.deposit || '');
      setRequiresParking(initialItem.hasParking === true);
      setRequiresElevator(initialItem.hasElevator === true);
      setAutoAddToExcel(true);
    }
  }, [isOpen, initialFilter, initialItem]);

  if (!isOpen) return null;

  const fmt = (n: number | string) => (usePersianDigits ? toPersianDigits(n) : n);

  const isItemInExcel = (item: RealEstateItem) => {
    if (!excelItems || excelItems.length === 0) return false;
    return excelItems.some(
      (ex) =>
        (ex.divarToken && item.divarToken && ex.divarToken === item.divarToken) ||
        (ex.title === item.title && ex.address === item.address)
    );
  };

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const res = await Notification.requestPermission();
      setBrowserNotificationStatus(res);
      if (res === 'granted') {
        playNotificationChime();
        new Notification('گوش‌به‌زنگ دیوار نجف‌آباد فعال شد', {
          body: 'به محض انتشار آگهی ملک مطابق سلیقه شما، بلافاصله مطلع خواهید شد.',
        });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleTestAlert = () => {
    playNotificationChime();
    setTestTriggered(true);
    setTimeout(() => setTestTriggered(false), 3000);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('هشدار آزمایشی گوش‌به‌زنگ دیوار!', {
        body: 'ملک جدیدی مطابق معیارهای جستجوی شما در دیوار نجف‌آباد پیدا شد.',
      });
    }
  };

  const handleToggle = (id: string) => {
    if (onToggleAlert) {
      onToggleAlert(id);
    } else if (onSaveAlerts) {
      onSaveAlerts(alerts.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
    }
  };

  const handleDelete = (id: string) => {
    if (onDeleteAlert) {
      onDeleteAlert(id);
    } else if (onSaveAlerts) {
      onSaveAlerts(alerts.filter((a) => a.id !== id));
    }
  };

  const handleToggleAutoExcel = (id: string) => {
    if (onSaveAlerts) {
      onSaveAlerts(alerts.map((a) => (a.id === id ? { ...a, autoAddToExcel: !a.autoAddToExcel } : a)));
    }
  };

  const toggleCollapseResults = (id: string) => {
    setCollapsedAlertIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePhoneInputChange = (raw: string) => {
    // Normalize Persian/Arabic digits to English digits
    const clean = raw
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
      .replace(/[^0-9]/g, '');

    setCustomerPhone(clean);
    if (clean.length > 0 && !clean.startsWith('09')) {
      setPhoneError('شماره تلفن حتماً باید با ۰۹ شروع شود (مثال: 09131234567)');
    } else {
      setPhoneError('');
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = customerPhone.trim();
    if (cleanPhone) {
      if (!cleanPhone.startsWith('09')) {
        setPhoneError('شماره تلفن مشتری حتماً باید با ۰۹ آغاز شود (مثال: 09131234567)');
        return;
      }
      if (cleanPhone.length !== 11) {
        setPhoneError('شماره تلفن همراه باید ۱۱ رقم باشد (مثال: 09131234567)');
        return;
      }
    }

    const finalTitle =
      title.trim() ||
      `${propertyType !== 'all' ? propertyType : 'ملک'} ${targetArea ? `${targetArea} متری` : ''} ${
        streetOrNeighborhood ? `در ${streetOrNeighborhood}` : ''
      }`.trim();

    const newAlertData = {
      title: finalTitle || 'هشدار سفارشی ملک',
      enabled: true,
      transactionType,
      propertyType,
      targetArea: targetArea === '' ? null : Number(targetArea),
      areaTolerance,
      streetOrNeighborhood: streetOrNeighborhood.trim(),
      maxPrice: maxPrice === '' ? null : Number(maxPrice),
      requiresParking,
      requiresElevator,
      autoAddToExcel,
      customerName: customerName.trim() || undefined,
      customerPhone: cleanPhone || undefined,
      notifiedItemIds: [],
    };

    if (onAddAlert) {
      onAddAlert(newAlertData);
    } else if (onSaveAlerts) {
      const fullAlert: DivarAlert = {
        ...newAlertData,
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      onSaveAlerts([fullAlert, ...alerts]);
    }

    // Reset & close form
    setTitle('');
    setTargetArea('');
    setStreetOrNeighborhood('');
    setCustomerName('');
    setCustomerPhone('');
    setPhoneError('');
    setShowCreateForm(false);
    playNotificationChime();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full h-[95vh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-red-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  گوش‌به‌زنگ دیوار نجف‌آباد (تفکیک نتایج و انتقال به اکسل)
                </h2>
                <span className="text-2xs font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                  رصد زنده
                </span>
              </div>
              <p className="text-2xs text-slate-500">
                مشخصات ملک و اطلاعات مشتری را ثبت کنید؛ برای هر هشدار بخش نتایج جداگانه با دکمه انتقال مستقیم به اکسل ایجاد می‌شود.
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

        {/* Action / Banner Strip */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">اعلان مرورگر:</span>
            {browserNotificationStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-2xs">
                <Check className="w-3 h-3" /> فعال است
              </span>
            ) : (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors cursor-pointer text-2xs"
              >
                <Bell className="w-3 h-3" /> فعال‌سازی زنگ مرورگر
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestAlert}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                testTriggered
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{testTriggered ? 'زنگ نواخته شد!' : 'تست صدا'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showCreateForm ? 'بستن فرم' : '+ ثبت هشدار و مشتری جدید'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 pb-20 sm:pb-6">
          {/* Create Alert Form (Collapsible) */}
          {showCreateForm && (
            <form
              onSubmit={handleCreateAlert}
              className="bg-linear-to-br from-red-50/60 via-amber-50/40 to-slate-50 border border-red-200 rounded-3xl p-5 space-y-4 animate-in slide-in-from-top-2 shadow-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-red-100">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>ثبت گوش‌به‌زنگ جدید (معیار ملک + اطلاعات متقاضی):</span>
                </h3>
              </div>

              {/* Title & Transaction Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-700">نام یا عنوان هشدار:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثلاً: آپارتمان ۱۰۰ متری شریعتی یا ویلایی ۵۰۰ متری"
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-700">نوع معامله:</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 cursor-pointer"
                  >
                    <option value="all">همه معامله‌ها (خرید، فروش، رهن و اجاره)</option>
                    <option value="خرید و فروش">فقط خرید و فروش</option>
                    <option value="رهن و اجاره">فقط رهن و اجاره</option>
                  </select>
                </div>
              </div>

              {/* Property Type, Area, Neighborhood */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-700">نوع ملک:</label>
                  <select
                    value={propertyType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPropertyType(val);
                      if (val === 'ویلایی' && (!targetArea || targetArea < 200)) {
                        setTargetArea(500);
                        setAreaTolerance(50);
                      } else if (val === 'آپارتمان' && (!targetArea || targetArea > 250)) {
                        setTargetArea(100);
                        setAreaTolerance(15);
                      }
                    }}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 cursor-pointer font-bold text-red-800"
                  >
                    <option value="آپارتمان">آپارتمان</option>
                    <option value="ویلایی">ویلایی / باغ ویلا</option>
                    <option value="خانه مسکونی">خانه مسکونی (دربست)</option>
                    <option value="دوبلکس">دوبلکس</option>
                    <option value="زمین / کلنگی">زمین / کلنگی</option>
                    <option value="all">هر نوع ملکی</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-700">متراژ مدنظر (متر مربع):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={targetArea}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setTargetArea(val);
                        if (typeof val === 'number') {
                          setAreaTolerance(val >= 300 ? 50 : 15);
                        }
                      }}
                      placeholder="مثلاً: 100 یا 500"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-center font-bold"
                    />
                    <span className="text-2xs text-slate-400 whitespace-nowrap">متر (±{fmt(areaTolerance)})</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-700">خیابان یا محله نجف‌آباد:</label>
                  <input
                    type="text"
                    value={streetOrNeighborhood}
                    onChange={(e) => setStreetOrNeighborhood(e.target.value)}
                    placeholder="مثلاً: خیابان شریعتی، ویلاشهر، فردوسی..."
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
              </div>

              {/* Customer Information Section (Name and Phone starting with 09) */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span>مشخصات مشتری متقاضی این ملک (اختیاری):</span>
                  </div>
                  <span className="text-3xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                    برای تماس سریع هنگام انتشار آگهی در دیوار
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-slate-700 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>نام و نام خانوادگی مشتری:</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثلاً: آقای محمدی / خانم رضایی"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-slate-700 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>شماره همراه مشتری (شروع با ۰۹):</span>
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={customerPhone}
                      onChange={(e) => handlePhoneInputChange(e.target.value)}
                      placeholder="09xxxxxxxxx"
                      className={`w-full text-xs bg-white border rounded-xl px-3 py-2.5 font-mono text-left focus:outline-hidden ${
                        phoneError ? 'border-rose-400 focus:border-rose-500 bg-rose-50/40' : 'border-slate-200 focus:border-amber-500'
                      }`}
                    />
                    {phoneError ? (
                      <span className="text-3xs text-rose-600 font-bold block">{phoneError}</span>
                    ) : (
                      <span className="text-3xs text-slate-400 block">شماره تلفن حتماً با ۰۹ شروع شود (۱۱ رقم)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto add to Excel toggle */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="auto-add-excel-cb"
                  checked={autoAddToExcel}
                  onChange={(e) => setAutoAddToExcel(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-0.5 cursor-pointer"
                />
                <label htmlFor="auto-add-excel-cb" className="cursor-pointer text-xs text-slate-800 space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <span>افزودن خودکار به جدول اکسل من به محض انتشار ملک منطبق</span>
                  </div>
                  <p className="text-2xs text-slate-600 leading-normal">
                    هر ملکی که در دیوار نجف‌آباد منتشر شود و با این مشخصات تطابق داشته باشد، علاوه بر ارسال هشدار، خودکار در فایل اکسل شما ثبت می‌شود.
                  </p>
                </label>
              </div>

              {/* Amenities & Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-4 text-xs text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresParking}
                      onChange={(e) => setRequiresParking(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                    <span>حتماً دارای پارکینگ</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresElevator}
                      onChange={(e) => setRequiresElevator(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                    <span>حتماً دارای آسانسور</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>فعال‌سازی این گوش‌به‌زنگ</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Active Alerts List - Each Alert has a dedicated section for Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-red-600" />
                <span>هشدارهای ثبت‌شده شما ({fmt(alerts.length)} مورد):</span>
              </h3>
              <span className="text-2xs text-slate-500 font-medium">
                برای هر مورد، بخش اختصاصی نتایج دیوار با دکمه انتقال به اکسل قرار دارد.
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">هیچ گوش‌به‌زنگی هنوز ثبت نشده است</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  مثلاً: «آپارتمان ۱۰۰ متری» یا «ویلایی ۵۰۰ متری» همراه با مشخصات مشتری را اضافه کنید.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت اولین هشدار</span>
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {alerts.map((al) => {
                  const matchedItems = activeItems.filter((it) => matchItemWithAlert(it, al));
                  const isCollapsed = collapsedAlertIds[al.id] === true;

                  return (
                    <div
                      key={al.id}
                      className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                        al.enabled ? 'border-red-200 shadow-md' : 'border-slate-200 opacity-60'
                      }`}
                    >
                      {/* Top Header Card */}
                      <div className="p-4 sm:p-5 space-y-3 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Alert Title & Tags */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`w-3 h-3 rounded-full shrink-0 ${
                                  al.enabled ? 'bg-red-600 animate-pulse' : 'bg-slate-300'
                                }`}
                              />
                              <h4 className="text-sm font-black text-slate-900">{al.title}</h4>

                              <span className="text-2xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {al.propertyType === 'all' ? 'همه انواع ملک' : al.propertyType}
                              </span>

                              {al.targetArea && (
                                <span className="text-2xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  متراژ: حدود {fmt(al.targetArea)} متر (±{fmt(al.areaTolerance || 15)})
                                </span>
                              )}

                              {al.streetOrNeighborhood && (
                                <span className="text-2xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-red-500" />
                                  {al.streetOrNeighborhood}
                                </span>
                              )}

                              {al.transactionType && al.transactionType !== 'all' && (
                                <span className="text-2xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {al.transactionType}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            {/* Auto add to Excel toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleAutoExcel(al.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                                al.autoAddToExcel
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-50 text-slate-400 border-slate-200'
                              }`}
                              title="تغییر وضعیت ثبت خودکار در اکسل"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{al.autoAddToExcel ? 'اکسل خودکار: روشن' : 'اکسل خودکار: خاموش'}</span>
                            </button>

                            {/* Toggle Active Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggle(al.id)}
                              className={`px-3 py-1.5 rounded-xl text-2xs font-bold transition-colors cursor-pointer border ${
                                al.enabled
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {al.enabled ? 'رصد فعال' : 'غیرفعال'}
                            </button>

                            {/* Delete Alert Button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(al.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="حذف این هشدار"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Customer Information Badge (If user entered customer name or phone) */}
                        {(al.customerName || al.customerPhone) && (
                          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-3xs shrink-0 shadow-2xs">
                                <User className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-500 text-2xs">مشتری متقاضی:</span>
                                <strong className="text-amber-950 font-bold">{al.customerName || 'مشتری بدون نام'}</strong>
                              </div>
                            </div>

                            {al.customerPhone && (
                              <div className="flex items-center gap-2">
                                <a
                                  href={`tel:${al.customerPhone}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-2xs transition-all shadow-2xs"
                                  title="تماس مستقیم با مشتری متقاضی"
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  <span dir="ltr" className="font-mono">{al.customerPhone}</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(al.customerPhone!);
                                    setCopiedPhoneId(al.id);
                                    setTimeout(() => setCopiedPhoneId(null), 2500);
                                  }}
                                  className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                                  title="کپی شماره تلفن"
                                >
                                  {copiedPhoneId === al.id ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* DEDICATED RESULTS SECTION FOR THIS ALERT */}
                      <div className="border-t border-slate-100 bg-slate-50/80 p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <h5 className="text-xs font-bold text-slate-800">
                              نتایج و املاک یافت‌شده در دیوار نجف‌آباد:
                            </h5>
                            <span
                              className={`text-2xs px-2.5 py-0.5 rounded-full font-bold ${
                                matchedItems.length > 0
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {matchedItems.length > 0
                                ? `${fmt(matchedItems.length)} ملک پیدا شد`
                                : 'هنوز موردی ثبت نشده'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Batch Move to Excel */}
                            {matchedItems.length > 0 && onAddMultipleToExcel && (
                              <button
                                type="button"
                                onClick={() => onAddMultipleToExcel(matchedItems)}
                                className="px-3 py-1.5 text-2xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-2xs"
                                title="انتقال یکجای تمام این نتایج به جدول اکسل من"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                                <span>انتقال همه ({fmt(matchedItems.length)} ملک) به اکسل</span>
                              </button>
                            )}

                            {/* Collapse/Expand Toggle */}
                            <button
                              type="button"
                              onClick={() => toggleCollapseResults(al.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                              title={isCollapsed ? 'نمایش نتایج' : 'بستن نتایج'}
                            >
                              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {!isCollapsed && (
                          <>
                            {matchedItems.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {matchedItems.map((m) => {
                                  const inExcel = isItemInExcel(m);

                                  return (
                                    <div
                                      key={m.id}
                                      onClick={() => {
                                        if (onSelectProperty) onSelectProperty(m);
                                        onClose();
                                      }}
                                      className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-red-400 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3 cursor-pointer group"
                                    >
                                      {/* Top Row: Thumbnail + Title & Price */}
                                      <div className="flex gap-3 items-start">
                                        {m.imageUrl ? (
                                          <img
                                            src={m.imageUrl}
                                            alt={m.title}
                                            referrerPolicy="no-referrer"
                                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 shadow-2xs group-hover:scale-105 transition-transform"
                                          />
                                        ) : (
                                          <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                                            <Building2 className="w-6 h-6" />
                                          </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                          <h6 className="text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1">
                                            {m.title || m.address}
                                          </h6>

                                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                            <span>{m.district ? `نجف‌آباد، ${m.district}` : m.address}</span>
                                          </div>

                                          <div className="mt-1 text-xs font-bold text-emerald-700 truncate">
                                            {m.priceText || (m.price > 0 ? `${formatPriceShort(m.price, usePersianDigits)}` : 'توافقی')}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Quick Specs Pill Row */}
                                      <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1.5 rounded-xl text-3xs text-slate-600 border border-slate-100">
                                        <div className="flex items-center gap-1 truncate" title="متراژ">
                                          <Maximize2 className="w-3 h-3 text-slate-400 shrink-0" />
                                          <span>{m.area ? `${fmt(m.area)} م²` : '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 truncate" title="تعداد اتاق">
                                          <BedDouble className="w-3 h-3 text-slate-400 shrink-0" />
                                          <span>{m.rooms ? `${fmt(m.rooms)} خواب` : '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 truncate" title="سال ساخت">
                                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                          <span>{formatBuiltYear(m, usePersianDigits)}</span>
                                        </div>
                                      </div>

                                      {/* Bottom Actions Row: Move to Excel & Details */}
                                      <div
                                        className="flex items-center justify-between pt-1 border-t border-slate-100 text-2xs"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                          <Clock className="w-3 h-3 text-slate-400" />
                                          <span>{m.relativeTime || 'امروز'}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                          {inExcel ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-3xs">
                                              <Check className="w-3 h-3 text-emerald-600" />
                                              <span>در اکسل موجود است</span>
                                            </span>
                                          ) : (
                                            onAddToExcel && (
                                              <button
                                                type="button"
                                                onClick={() => onAddToExcel(m)}
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-3xs shadow-2xs transition-all cursor-pointer"
                                                title="انتقال مستقیم به جدول اکسل من"
                                              >
                                                <FileSpreadsheet className="w-3 h-3" />
                                                <span>انتقال به اکسل</span>
                                              </button>
                                            )
                                          )}

                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (onSelectProperty) onSelectProperty(m);
                                              onClose();
                                            }}
                                            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold text-3xs transition-colors cursor-pointer"
                                          >
                                            مشاهده ↗
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-4 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-1">
                                <p className="text-xs font-semibold text-slate-700">
                                  در حال حاضر ملکی با این مشخصات در دیوار نجف‌آباد یافت نشده است.
                                </p>
                                <p className="text-3xs text-slate-400">
                                  به محض انتشار هر ملک جدید با این معیارها در دیوار، زنگ هشدار به صدا درآمده و مستقیماً در این بخش قرار می‌گیرد.
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs shrink-0">
          <span className="text-2xs text-slate-500 hidden xs:inline">
            هشدارهای گوش‌به‌زنگ به همراه نتایج و اطلاعات مشتری به طور خودکار در این داشبورد ذخیره می‌شوند.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full xs:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
