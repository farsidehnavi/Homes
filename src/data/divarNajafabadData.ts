import { RealEstateItem } from '../types';
import divar24hJson from './divarNajafabad24h.json';

export interface DivarFetchMeta {
  city: string;
  cityId: number;
  category: string;
  fetchedAt: string;
  cutoff24h: string;
  totalCount: number;
}

export const DIVAR_METADATA: DivarFetchMeta = divar24hJson.metadata as DivarFetchMeta;

export const DIVAR_NAJAFABAD_24H_DATA: RealEstateItem[] = divar24hJson.items as RealEstateItem[];
