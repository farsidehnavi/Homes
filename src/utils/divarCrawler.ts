import { RealEstateItem, DivarTimeRange, TransactionType } from '../types';
import { DIVAR_NAJAFABAD_24H_DATA, DIVAR_METADATA, DivarFetchMeta } from '../data/divarNajafabadData';

export interface DivarFetchResult {
  success: boolean;
  items: RealEstateItem[];
  metadata: DivarFetchMeta;
  source: 'live' | 'cached';
  error?: string;
}

export function getTimeCutoffMs(timeRange: DivarTimeRange = '24h'): number {
  const hoursMap: Record<DivarTimeRange, number> = {
    '1h': 1,
    '2h': 2,
    '6h': 6,
    '12h': 12,
    '24h': 24,
    '3d': 24 * 3,
    '7d': 24 * 7,
    '14d': 24 * 14,
    '30d': 24 * 30,
    'all': 24 * 90,
  };
  const hours = hoursMap[timeRange] || 24;
  return hours * 60 * 60 * 1000;
}

function toEnglishDigits(text: any): string {
  if (!text) return '';
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  let res = '';
  for (const ch of String(text)) {
    const pIdx = persianDigits.indexOf(ch);
    const aIdx = arabicDigits.indexOf(ch);
    if (pIdx !== -1) res += pIdx;
    else if (aIdx !== -1) res += aIdx;
    else res += ch;
  }
  return res;
}

function parseNumber(text: any): number | undefined {
  if (!text) return undefined;
  const clean = toEnglishDigits(text).replace(/[,،]/g, '');
  const match = clean.match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
}

function parsePrice(priceStr: string): number {
  if (!priceStr || priceStr.includes('توافقی') || priceStr.includes('معاوضه') || priceStr.includes('رایگان')) {
    return 0;
  }
  const clean = toEnglishDigits(priceStr).replace(/[,،]/g, '');
  const match = clean.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// In-memory post detail cache to avoid redundant network calls
const postDetailsCache = new Map<string, any>();

export async function fetchDivarPostDetails(token: string): Promise<any | null> {
  if (!token) return null;
  if (postDetailsCache.has(token)) {
    return postDetailsCache.get(token);
  }

  try {
    const res = await fetch(`https://api.divar.ir/v8/posts-v2/web/${token}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    postDetailsCache.set(token, json);
    return json;
  } catch {
    return null;
  }
}

export async function fetchRealDivarPostImages(token: string): Promise<string[]> {
  const detail = await fetchDivarPostDetails(token);
  if (!detail) return [];

  const widgets = detail.sections?.flatMap((s: any) => s.widgets || []) || [];
  const carousel = widgets.find(
    (w: any) => w.widget_type === 'IMAGE_CAROUSEL' || w.widget_type === 'IMAGES_SLIDER'
  );
  if (carousel && carousel.data && Array.isArray(carousel.data.items)) {
    const urls: string[] = carousel.data.items
      .map((it: any) => it.image?.url || it.image?.thumbnail_url)
      .filter(Boolean);
    return urls;
  }
  return [];
}

/**
 * Extracts ONLY genuine data from Divar without making up anything.
 * If a field is not present in Divar, it remains undefined.
 */
function extractDivarFields(
  title: string,
  priceText: string,
  bottomText: string,
  postDetail: any | null
) {
  let description = '';
  let area: number | undefined = undefined;
  let rooms: number | undefined = undefined;
  let floor: number | undefined = undefined;
  let totalFloors: number | undefined = undefined;
  let age: number | undefined = undefined;
  let hasElevator: boolean | undefined = undefined;
  let hasParking: boolean | undefined = undefined;
  let hasStorage: boolean | undefined = undefined;
  let facade: string | undefined = undefined;
  let orientation: string | undefined = undefined;
  let documentType: string | undefined = undefined;
  let detailImages: string[] = [];
  let detailPrice: number | undefined = undefined;
  let detailPricePerMeter: number | undefined = undefined;
  let detailDeposit: number | undefined = undefined;
  let detailRent: number | undefined = undefined;

  if (postDetail) {
    const widgets = postDetail.sections?.flatMap((s: any) => s.widgets || []) || [];

    for (const w of widgets) {
      const wt = w.widget_type;
      const d = w.data || {};

      if (wt === 'DESCRIPTION_ROW') {
        description += ' ' + (d.text || '');
      } else if (wt === 'GROUP_INFO_ROW') {
        for (const it of d.items || []) {
          const tIt = it.title || '';
          const vIt = it.value || '';
          if (tIt.includes('متراژ')) {
            area = parseNumber(vIt);
          } else if (tIt.includes('اتاق')) {
            rooms = parseNumber(vIt);
          } else if (tIt.includes('ساخت')) {
            if (vIt.includes('نوساز') || vIt.includes('صفر')) {
              age = 0;
            } else {
              const y = parseNumber(vIt);
              if (y && y > 1300) {
                age = Math.max(0, 1403 - y);
              } else if (y !== undefined) {
                age = y;
              }
            }
          }
        }
      } else if (wt === 'GROUP_FEATURE_ROW') {
        for (const it of d.items || []) {
          const tIt = it.title || '';
          const avail = it.available;
          if (tIt.includes('آسانسور')) {
            hasElevator = tIt.includes('ندارد') || avail === false ? false : true;
          } else if (tIt.includes('پارکینگ')) {
            hasParking = tIt.includes('ندارد') || avail === false ? false : true;
          } else if (tIt.includes('انباری')) {
            hasStorage = tIt.includes('ندارد') || avail === false ? false : true;
          }
        }
      } else if (wt === 'UNEXPANDABLE_ROW') {
        const tRow = d.title || '';
        const vRow = d.value || '';
        if (tRow.includes('متراژ') && area === undefined) {
          area = parseNumber(vRow);
        } else if (tRow.includes('قیمت کل')) {
          detailPrice = parseNumber(vRow);
        } else if (tRow.includes('قیمت هر متر')) {
          detailPricePerMeter = parseNumber(vRow);
        } else if (tRow.includes('ودیعه')) {
          detailDeposit = parseNumber(vRow);
        } else if (tRow.includes('اجاره')) {
          detailRent = parseNumber(vRow);
        } else if (tRow.includes('طبقه')) {
          if (vRow.includes('همکف')) {
            floor = 0;
          } else {
            floor = parseNumber(vRow);
          }
        } else if (tRow.includes('تعداد طبقات') || tRow.includes('تعداد کل طبقات')) {
          totalFloors = parseNumber(vRow);
        }
      } else if (wt === 'IMAGE_CAROUSEL' || wt === 'IMAGES_SLIDER') {
        if (Array.isArray(d.items)) {
          detailImages = d.items
            .map((it: any) => it.image?.url || it.image?.thumbnail_url)
            .filter(Boolean);
        }
      }
    }
  }

  const fullText = `${title} ${description} ${bottomText}`;
  const fullTextNorm = toEnglishDigits(fullText);

  // Area: ONLY if explicitly mentioned in text (if not in widgets)
  if (area === undefined) {
    const m = fullTextNorm.match(/(\d+)\s*(?:متر|متری|متر مربع)/);
    if (m) {
      const val = parseInt(m[1], 10);
      if (val >= 10 && val <= 50000) area = val;
    }
  }

  // Rooms: ONLY if explicitly mentioned
  if (rooms === undefined) {
    if (fullText.includes('تک خواب') || fullText.includes('یک خواب') || fullText.includes('۱ خواب')) rooms = 1;
    else if (fullText.includes('دو خواب') || fullText.includes('۲ خواب')) rooms = 2;
    else if (fullText.includes('سه خواب') || fullText.includes('۳ خواب')) rooms = 3;
    else if (fullText.includes('چهار خواب') || fullText.includes('۴ خواب')) rooms = 4;
    else {
      const mRooms = fullTextNorm.match(/(\d+)\s*خواب/);
      if (mRooms) rooms = parseInt(mRooms[1], 10);
    }
  }

  // Floor: ONLY if explicitly mentioned
  if (floor === undefined) {
    if (fullText.includes('همکف')) floor = 0;
    else {
      const mFloor = fullTextNorm.match(/طبقه\s*(\d+)/);
      if (mFloor) floor = parseInt(mFloor[1], 10);
    }
  }

  // Elevator: "If it didn't mention having an elevator. Don't mention. That's it"
  if (hasElevator === undefined) {
    if (
      fullText.includes('آسانسور دارد') ||
      fullText.includes('با آسانسور') ||
      fullText.includes('دارای آسانسور')
    ) {
      hasElevator = true;
    } else if (
      fullText.includes('بدون آسانسور') ||
      fullText.includes('فاقد آسانسور') ||
      fullText.includes('آسانسور ندارد')
    ) {
      hasElevator = false;
    }
    // If not mentioned at all -> remains undefined!
  }

  // Parking: ONLY if mentioned
  if (hasParking === undefined) {
    if (
      fullText.includes('پارکینگ دارد') ||
      fullText.includes('با پارکینگ') ||
      fullText.includes('دارای پارکینگ') ||
      fullText.includes('پارکینگ اختصاصی')
    ) {
      hasParking = true;
    } else if (
      fullText.includes('بدون پارکینگ') ||
      fullText.includes('فاقد پارکینگ') ||
      fullText.includes('پارکینگ ندارد')
    ) {
      hasParking = false;
    }
  }

  // Storage: ONLY if mentioned
  if (hasStorage === undefined) {
    if (
      fullText.includes('انباری دارد') ||
      fullText.includes('با انباری') ||
      fullText.includes('دارای انباری')
    ) {
      hasStorage = true;
    } else if (
      fullText.includes('بدون انباری') ||
      fullText.includes('فاقد انباری') ||
      fullText.includes('انباری ندارد')
    ) {
      hasStorage = false;
    }
  }

  // Facade (Outside view material): ONLY if explicitly mentioned in Divar ad
  const facadeCandidates = ['سنگ رومی', 'سنگ', 'آجر نما', 'آجر', 'سرامیک', 'کامپوزیت', 'ترکیبی'];
  for (const cand of facadeCandidates) {
    if (fullText.includes('نما ' + cand) || fullText.includes('نمای ' + cand)) {
      facade = cand;
      break;
    }
  }

  // Orientation: ONLY if explicitly mentioned
  for (const cand of ['دو کله', 'جنوبی', 'شمالی', 'شرقی', 'غربی']) {
    if (fullText.includes(cand)) {
      orientation = cand;
      break;
    }
  }

  // Document Type: ONLY if explicitly mentioned
  if (fullText.includes('تک برگ') || fullText.includes('تک‌برگ')) documentType = 'تک برگ';
  else if (fullText.includes('شش دانگ') || fullText.includes('۶ دانگ')) documentType = 'شش دانگ';
  else if (fullText.includes('قولنامه')) documentType = 'قولنامه‌ای';
  else if (fullText.includes('مشاع')) documentType = 'مشاع';
  else if (fullText.includes('وکالت')) documentType = 'وکالتی';

  return {
    area,
    rooms,
    floor,
    totalFloors,
    age,
    hasElevator,
    hasParking,
    hasStorage,
    facade,
    orientation,
    documentType,
    detailImages,
    detailPrice,
    detailPricePerMeter,
    detailDeposit,
    detailRent,
  };
}

function detectPropertyType(title: string): string {
  if (title.includes('آپارتمان')) return 'آپارتمان';
  if (title.includes('ویلایی') || title.includes('ویلا') || title.includes('باغ ویلا')) return 'ویلایی';
  if (title.includes('دوبلکس') || title.includes('دو طبقه') || title.includes('۲ طبقه')) return 'دوبلکس';
  if (title.includes('زمین') || title.includes('کلنگی') || title.includes('سفت‌کاری')) return 'زمین / کلنگی';
  return 'خانه مسکونی';
}

export async function fetchNajafabadDivar(
  timeRange: DivarTimeRange = '24h',
  forceRefresh = false
): Promise<DivarFetchResult> {
  const cutoffDiff = getTimeCutoffMs(timeRange);
  const cutoffTime = new Date(Date.now() - cutoffDiff);
  const cutoffIso = cutoffTime.toISOString();

  try {
    const categories = [
      { cat: 'residential-sell', transType: 'خرید و فروش' as TransactionType },
      { cat: 'residential-rent', transType: 'رهن و اجاره' as TransactionType },
    ];
    const items: RealEstateItem[] = [];
    let rowNum = 1;

    for (const { cat, transType } of categories) {
      try {
        const payload: any = {
          city_ids: ['31'], // Najaf Abad
          search_data: {
            form_data: {
              data: {
                category: { str: { value: cat } },
              },
            },
          },
        };

        const res = await fetch('https://api.divar.ir/v8/postlist/w/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) continue;

        const json: any = await res.json();
        const widgets: any[] = json.list_widgets || [];
        const postRows = widgets.filter((w) => w.widget_type === 'POST_ROW');

        // Fetch details for posts to get accurate non-fabricated info
        const postsWithDetails = await Promise.all(
          postRows.map(async (w) => {
            const token = w.data?.token;
            let detail: any = null;
            if (token) {
              detail = await fetchDivarPostDetails(token);
            }
            return { widget: w, detail };
          })
        );

        for (const { widget: w, detail } of postsWithDetails) {
          const d = w.data || {};
          const info = w.action_log?.server_side_info?.info || {};
          const sortDateStr = info.sort_date;
          if (!sortDateStr) continue;

          const sortDate = new Date(sortDateStr);
          if (isNaN(sortDate.getTime())) continue;

          // Time filter check
          if (sortDate.getTime() < cutoffTime.getTime()) {
            continue;
          }

          const title = d.title || 'آگهی املاک نجف‌آباد';
          const priceText = d.middle_description_text || '';
          const token = d.token;
          const webInfo = d.action?.payload?.web_info || {};
          const rawDistrict = webInfo.district_persian || d.bottom_description_text || 'نجف‌آباد';

          const districtClean = rawDistrict
            .replace(/^در\s+/, '')
            .replace(/^یک ربع پیش در\s+/, '')
            .replace(/^نیم ساعت پیش در\s+/, '')
            .replace(/^دقایقی پیش در\s+/, '')
            .trim();

          const address =
            districtClean && !districtClean.includes('نجف')
              ? `نجف‌آباد، ${districtClean}`
              : districtClean || 'نجف‌آباد';

          const extracted = extractDivarFields(title, priceText, d.bottom_description_text || '', detail);
          const propType = detectPropertyType(title);

          const price =
            extracted.detailPrice !== undefined
              ? extracted.detailPrice
              : transType === 'خرید و فروش'
              ? parsePrice(priceText)
              : 0;

          const pricePerMeter =
            extracted.detailPricePerMeter !== undefined
              ? extracted.detailPricePerMeter
              : extracted.area && extracted.area > 0 && price > 0
              ? Math.round(price / extracted.area)
              : undefined;

          let deposit = extracted.detailDeposit || 0;
          let rent = extracted.detailRent || 0;
          if (transType === 'رهن و اجاره' && !deposit && !rent) {
            const rawNumbers = toEnglishDigits(priceText).match(/\d+/g);
            if (rawNumbers && rawNumbers.length >= 2) {
              deposit = parseInt(rawNumbers[0], 10);
              rent = parseInt(rawNumbers[1], 10);
            }
          }

          const primaryImage = d.image_url;
          const images =
            extracted.detailImages.length > 0
              ? extracted.detailImages
              : primaryImage
              ? [primaryImage]
              : [];

          items.push({
            id: rowNum,
            rowNumber: rowNum,
            title,
            address,
            propertyType: propType,
            transactionType: transType,
            area: extracted.area,
            rooms: extracted.rooms,
            floor: extracted.floor,
            totalFloors: extracted.totalFloors,
            age: extracted.age,
            orientation: extracted.orientation,
            facade: extracted.facade,
            hasParking: extracted.hasParking,
            hasElevator: extracted.hasElevator,
            hasStorage: extracted.hasStorage,
            documentType: extracted.documentType,
            price,
            pricePerMeter,
            deposit,
            rent,
            depositText: deposit > 0 ? `${deposit.toLocaleString('fa-IR')} تومان` : undefined,
            rentText: rent > 0 ? `${rent.toLocaleString('fa-IR')} تومان` : undefined,
            priceText: priceText || (transType === 'رهن و اجاره' ? 'ودیعه و اجاره توافقی' : 'توافقی'),
            district: districtClean,
            divarToken: token,
            divarUrl: token ? `https://divar.ir/v/-/${token}` : 'https://divar.ir/s/najafabad/real-estate',
            imageUrl: primaryImage || images[0],
            images,
            publishedAt: sortDateStr,
            relativeTime: d.bottom_description_text || 'امروز',
            source: 'divar',
          });
          rowNum++;
        }
      } catch (e) {
        // Continue
      }
    }

    // Sort by publish date descending
    items.sort((a, b) => {
      const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return timeB - timeA;
    });

    // Re-index rowNumbers
    items.forEach((item, index) => {
      item.id = index + 1;
      item.rowNumber = index + 1;
    });

    if (items.length > 0) {
      return {
        success: true,
        items,
        metadata: {
          city: 'نجف‌آباد',
          cityId: 31,
          category: 'residential',
          fetchedAt: new Date().toISOString(),
          cutoff24h: cutoffIso,
          totalCount: items.length,
        },
        source: 'live',
      };
    }
  } catch (err: any) {
    console.warn('[DivarCrawler] Live fetch warning/fallback:', err?.message || err);
  }

  // Fallback to verified local dataset filtered by cutoff
  const filteredFallback = DIVAR_NAJAFABAD_24H_DATA.filter((it) => {
    if (!it.publishedAt) return true;
    return new Date(it.publishedAt).getTime() >= cutoffTime.getTime();
  });

  return {
    success: true,
    items: filteredFallback.length > 0 ? filteredFallback : DIVAR_NAJAFABAD_24H_DATA,
    metadata: {
      ...DIVAR_METADATA,
      fetchedAt: new Date().toISOString(),
      cutoff24h: cutoffIso,
      totalCount: filteredFallback.length,
    },
    source: 'cached',
  };
}

export const fetchNajafabadDivar24h = (forceRefresh = false) =>
  fetchNajafabadDivar('24h', forceRefresh);
