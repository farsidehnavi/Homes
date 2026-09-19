import { RealEstateItem } from '../types';
import { DIVAR_NAJAFABAD_24H_DATA, DIVAR_METADATA, DivarFetchMeta } from '../data/divarNajafabadData';

export interface DivarClientResponse {
  success: boolean;
  items: RealEstateItem[];
  metadata: DivarFetchMeta;
  source: 'live' | 'cached';
  error?: string;
}

export async function loadNajafabadDivarHomes(forceRefresh = false): Promise<DivarClientResponse> {
  try {
    const url = forceRefresh ? '/api/divar/najafabad-24h?refresh=true' : '/api/divar/najafabad-24h';
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        return {
          success: true,
          items: data.items,
          metadata: data.metadata || {
            ...DIVAR_METADATA,
            totalCount: data.items.length,
          },
          source: data.source || 'live',
        };
      }
    }
  } catch (err) {
    console.warn('Direct API load failed, using pre-crawled 24h Divar dataset:', err);
  }

  // Graceful fallback to pre-crawled 24h data
  return {
    success: true,
    items: DIVAR_NAJAFABAD_24H_DATA,
    metadata: DIVAR_METADATA,
    source: 'cached',
  };
}

export async function refreshDivarHomes(): Promise<DivarClientResponse> {
  try {
    const res = await fetch('/api/divar/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        return {
          success: true,
          items: data.items,
          metadata: data.metadata || {
            ...DIVAR_METADATA,
            totalCount: data.items.length,
          },
          source: data.source || 'live',
        };
      }
    }
  } catch (err) {
    console.warn('Refresh request failed:', err);
  }

  return loadNajafabadDivarHomes(true);
}
