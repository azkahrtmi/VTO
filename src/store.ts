import { create } from 'zustand';
import { fetchGlassesFromOdoo, type OdooGlassesProduct } from './utils/odooApi';
import { GLASSES_CATALOG } from './catalog/glasses';
import type { Glasses } from './types/glasses';

const PD_STORAGE_KEY = 'vto-pd-result';

type StoredPD = { pdMm: number; measuredAt: string };

const loadStoredPD = (): StoredPD | null => {
  try {
    const raw = localStorage.getItem(PD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPD;
    return typeof parsed.pdMm === 'number' && Number.isFinite(parsed.pdMm)
      ? parsed
      : null;
  } catch {
    return null;
  }
};

const normalizeAssetUrl = (value?: string): string => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
};

const mapOdooToGlasses = (item: OdooGlassesProduct): Glasses => ({
  id: `odoo-${item.id}`,
  name: item.name,
  sku: normalizeAssetUrl(item.model_3d_url) || normalizeAssetUrl(item.deepar_effect_url),
  color: item.color_hex || '#000000',
  type: 'local',
  deeparEffect: normalizeAssetUrl(item.deepar_effect_url),
});

interface AppState {
  showDots: boolean;
  showGlasses: boolean;
  selectedGlassesId: string;
  isAdjustMode: boolean;
  userScale: number;
  glassesCatalog: Glasses[];
  odooProducts: OdooGlassesProduct[];
  pdResultMm: number | null;
  pdMeasuredAt: string | null;

  setShowDots: (val: boolean) => void;
  setShowGlasses: (val: boolean) => void;
  setSelectedGlassesId: (id: string) => void;
  setUserScale: (scale: number) => void;
  setAdjustMode: (val: boolean) => void;
  setPDResult: (pdMm: number) => void;
  clearPDResult: () => void;
  loadCatalogFromOdoo: () => Promise<void>;
}

const storedPD = loadStoredPD();

export const useAppStore = create<AppState>((set) => ({
  showDots: true,
  showGlasses: true,
  selectedGlassesId: '',
  isAdjustMode: false,

  userScale: 1.0,
  glassesCatalog: GLASSES_CATALOG, // Fallback initial state
  odooProducts: [],
  pdResultMm: storedPD?.pdMm ?? null,
  pdMeasuredAt: storedPD?.measuredAt ?? null,

  setShowDots: (val) => set({ showDots: val }),
  setShowGlasses: (val) => set({ showGlasses: val }),
  setSelectedGlassesId: (id) => set({ selectedGlassesId: id }),
  setUserScale: (val) => set({ userScale: val }),
  setAdjustMode: (val) => set({ isAdjustMode: val }),

  setPDResult: (pdMm) => {
    const measuredAt = new Date().toISOString();
    try {
      localStorage.setItem(
        PD_STORAGE_KEY,
        JSON.stringify({ pdMm, measuredAt }),
      );
    } catch {
      // localStorage penuh/diblokir — hasil tetap tersimpan di memori
    }
    set({ pdResultMm: pdMm, pdMeasuredAt: measuredAt });
  },

  clearPDResult: () => {
    try {
      localStorage.removeItem(PD_STORAGE_KEY);
    } catch {
      // abaikan
    }
    set({ pdResultMm: null, pdMeasuredAt: null });
  },
  
  loadCatalogFromOdoo: async () => {
    try {
      const odooGlasses = await fetchGlassesFromOdoo();
      if (odooGlasses && odooGlasses.length > 0) {
        const mappedCatalog = odooGlasses
          .map(mapOdooToGlasses)
          .filter((g): g is Glasses => Boolean(g.sku));
        set({
          odooProducts: odooGlasses,
          glassesCatalog: [...mappedCatalog, ...GLASSES_CATALOG],
        });
      }
    } catch (error) {
      console.error('Failed to load catalog from Odoo, using local fallback:', error);
    }
  },
}));

// Legacy support if needed, but we should move to useAppStore
export const appStore = {
  getState: () => useAppStore.getState(),
  subscribe: (fn: (state: any) => void) => useAppStore.subscribe(fn),
  updateState: (updates: Partial<AppState>) => useAppStore.setState(updates),
};
