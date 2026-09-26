import React, { useState } from 'react';
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
  Home,
  Tag,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Eye,
  Check,
} from 'lucide-react';
import { DivarAlert, RealEstateItem, TransactionType, PropertyType } from '../types';
import { toPersianDigits, formatPriceShort, normalizePersianText } from '../utils/formatters';
import { playNotificationChime } from '../utils/audioAlert';

interface DivarAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: DivarAlert[];
  onAddAlert: (alert: Omit<DivarAlert, 'id' | 'createdAt'>) => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  divarItems: RealEstateItem[];
  onSelectProperty: (item: RealEstateItem) => void;
  usePersianDigits: boolean;
}

export function matchItemWithAlert(item: RealEstateItem, alert: DivarAlert): boolean {
  if (!alert.enabled) return false;

  // 1. Transaction Type
  if (alert.transactionType && alert.transactionType !== 'all') {
    if (item.transactionType && item.transactionType !== alert.transactionType) {
      return false;
    }
  }

  // 2. Property Type (e.g. want a house not an apartment)
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

  // 3. Area / Metrage matching (e.g. 115m with tolerance or min/max)
  if (alert.targetArea && alert.targetArea > 0) {
    const tol = alert.areaTolerance || 10;
    const minA = alert.minArea || alert.targetArea - tol;
    const maxA = alert.maxArea || alert.targetArea + tol;
    if (item.area < minA || item.area > maxA) {
      return false;
    }
  } else {
    if (alert.minArea && item.area < alert.minArea) return false;
    if (alert.maxArea && item.area > alert.maxArea) return false;
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
  if (alert.maxPrice && alert.maxPrice > 0 && item.price > alert.maxPrice) {
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
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
  divarItems,
  onSelectProperty,
  usePersianDigits,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(alerts.length === 0);
  const [title, setTitle] = useState('');
  const [transactionType, setTransactionType] = useState<'all' | 'خرید و فروش' | 'رهن و اجاره'>('all');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [targetArea, setTargetArea] = useState<number | ''>('');
  const [areaTolerance, setAreaTolerance] = useState<number>(10);
  const [streetOrNeighborhood, setStreetOrNeighborhood] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [requiresParking, setRequiresParking] = useState(false);
  const [requiresElevator, setRequiresElevator] = useState(false);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [browserNotificationStatus, setBrowserNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [testTriggered, setTestTriggered] = useState(false);

  if (!isOpen) return null;

  const fmt = (n: number | string) => (usePersianDigits ? toPersianDigits(n) : n);

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

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle =
      title.trim() ||
      `${propertyType !== 'all' ? propertyType : 'ملک'} ${targetArea ? `${targetArea} متری` : ''} ${
        streetOrNeighborhood ? `در ${streetOrNeighborhood}` : ''
      }`.trim();

    onAddAlert({
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
    });

    // Reset & close form
    setTitle('');
    setTargetArea('');
    setStreetOrNeighborhood('');
    setShowCreateForm(false);
    playNotificationChime();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-red-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  گوش‌به‌زنگ دیوار (هشدار هوشمند ملک دلخواه)
                </h2>
                <span className="text-2xs font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                  رصد زنده دیوار
                </span>
              </div>
              <p className="text-2xs text-slate-500">
                مشخصات ملک مورد انتظار خود را ثبت کنید تا به محض انتشار در دیوار، اعلان دریافت نمایید.
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
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">مجوز نوتیفیکیشن مرورگر:</span>
            {browserNotificationStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3" /> فعال است
              </span>
            ) : (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors cursor-pointer"
              >
                <Bell className="w-3 h-3" /> فعال‌سازی اعلان مرورگر
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestAlert}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                testTriggered
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{testTriggered ? 'زنگ هشدار نواخته شد!' : 'تست صدای زنگ و اعلان'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showCreateForm ? 'بستن فرم' : 'ثبت هشدار جدید'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create Alert Form (Collapsible or if empty) */}
          {showCreateForm && (
            <form
              onSubmit={handleCreateAlert}
              className="bg-red-50/40 border border-red-200 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>تنظیم مشخصات ملک مورد انتظار شما:</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-700">نام یا عنوان هشدار:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثلاً: خانه مسکونی ۱۱۵ متری در خیابان شریعتی"
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-700">نوع معامله:</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 cursor-pointer"
                  >
                    <option value="all">همه معامله‌ها (خرید، فروش، رهن و اجاره)</option>
                    <option value="خرید و فروش">فقط خرید و فروش</option>
                    <option value="رهن و اجاره">فقط رهن و اجاره</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-700">نوع ملک (ویلایی، خانه، آپارتمان):</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 cursor-pointer font-bold text-red-800"
                  >
                    <option value="خانه مسکونی">خانه مسکونی (نه آپارتمان)</option>
                    <option value="ویلایی">ویلایی / باغ ویلا</option>
                    <option value="آپارتمان">آپارتمان</option>
                    <option value="دوبلکس">دوبلکس</option>
                    <option value="زمین / کلنگی">زمین / کلنگی</option>
                    <option value="all">هر نوع ملکی</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-700">متراژ دقیق مدنظر (متر مربع):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={targetArea}
                      onChange={(e) => setTargetArea(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="115"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-center font-bold"
                    />
                    <span className="text-2xs text-slate-400 whitespace-nowrap">متر (±{fmt(areaTolerance)})</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-700">خیابان یا محله دلخواه:</label>
                  <input
                    type="text"
                    value={streetOrNeighborhood}
                    onChange={(e) => setStreetOrNeighborhood(e.target.value)}
                    placeholder="مثلاً: خیابان شریعتی، ویلاشهر..."
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="flex items-center gap-4 text-xs text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresParking}
                      onChange={(e) => setRequiresParking(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span>حتماً دارای پارکینگ باشد</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresElevator}
                      onChange={(e) => setRequiresElevator(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span>حتماً دارای آسانسور باشد</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    لغو
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>فعال‌سازی این هشدار</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Active Alerts List */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 flex items-center justify-between">
              <span>هشدارهای فعال شما ({fmt(alerts.length)} مورد):</span>
              <span className="text-2xs text-slate-400 font-normal">
                سیستم با هر بار بازخوانی دیوار، تمام موارد منطبق را اطلاع‌رسانی می‌کند
              </span>
            </h3>

            {alerts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">هیچ هشداری هنوز ثبت نشده است</p>
                <p className="text-2xs text-slate-400 mt-1 mb-4">
                  مشخصات ملک مدنظر خود را تنظیم کنید تا به محض انتشار در دیوار، اعلان دریافت نمایید.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت اولین هشدار</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((al) => {
                  const matchedItems = divarItems.filter((it) => matchItemWithAlert(it, al));
                  const isExpanded = expandedAlertId === al.id;

                  return (
                    <div
                      key={al.id}
                      className={`bg-white rounded-2xl border transition-all ${
                        al.enabled ? 'border-red-200 shadow-xs' : 'border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                al.enabled ? 'bg-red-600 animate-pulse' : 'bg-slate-300'
                              }`}
                            />
                            <h4 className="text-xs font-bold text-slate-900">{al.title}</h4>
                            <span className="text-2xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                              {al.propertyType || 'همه املاک'}
                            </span>
                            {al.targetArea && (
                              <span className="text-2xs px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                حدود {fmt(al.targetArea)} متر
                              </span>
                            )}
                            {al.streetOrNeighborhood && (
                              <span className="text-2xs px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-blue-500" />
                                {al.streetOrNeighborhood}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-2xs text-slate-500">
                            <span>معامله: {al.transactionType === 'all' ? 'همه' : al.transactionType}</span>
                            <span>•</span>
                            <span>
                              وضعیت تطابق:{' '}
                              <strong className={matchedItems.length > 0 ? 'text-emerald-700' : 'text-slate-500'}>
                                {fmt(matchedItems.length)} ملک منطبق در دیوار یافت شد
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          {matchedItems.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedAlertId(isExpanded ? null : al.id)}
                              className="flex items-center gap-1 text-2xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>مشاهده {fmt(matchedItems.length)} آگهی منطبق</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onToggleAlert(al.id)}
                            className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-colors cursor-pointer ${
                              al.enabled
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {al.enabled ? 'روشن (فعال)' : 'خاموش'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteAlert(al.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف هشدار"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Matched Listings */}
                      {isExpanded && matchedItems.length > 0 && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl space-y-2">
                          <span className="text-2xs font-bold text-slate-600 block">
                            آگهی‌های پیدا شده در دیوار مطابق این مشخصات:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {matchedItems.map((m) => (
                              <div
                                key={m.id}
                                onClick={() => {
                                  onSelectProperty(m);
                                  onClose();
                                }}
                                className="bg-white p-2.5 rounded-xl border border-slate-200 hover:border-red-400 flex items-center justify-between gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {m.imageUrl && (
                                    <img
                                      src={m.imageUrl}
                                      alt={m.title}
                                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-bold text-slate-900 truncate">{m.title}</h5>
                                    <p className="text-2xs text-slate-400 truncate">{m.address}</p>
                                    <span className="text-2xs text-emerald-700 font-semibold">{m.priceText}</span>
                                  </div>
                                </div>
                                <span className="text-2xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md shrink-0">
                                  مشاهده ↗
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-2xs text-slate-400">
            هشدارها به طور خودکار در مرورگر ذخیره شده و با هر بازدید فعال خواهند بود.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
