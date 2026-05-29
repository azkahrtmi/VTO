import { create } from 'zustand';
import { fetchGlassesFromOdoo, type OdooGlassesProduct } from './utils/odooApi';
import { GLASSES_CATALOG } from './catalog/glasses';
import type { Glasses } from './types/glasses';

interface AppState {
  showDots: boolean;
  showGlasses: boolean;
  selectedGlassesId: string;
  isAdjustMode: boolean;
  userScale: number;
  glassesCatalog: Glasses[];
  odooProducts: OdooGlassesProduct[];

  setShowDots: (val: boolean) => void;
  setShowGlasses: (val: boolean) => void;
  setSelectedGlassesId: (id: string) => void;
  setUserScale: (scale: number) => void;
  setAdjustMode: (val: boolean) => void;
  loadCatalogFromOdoo: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  showDots: true,
  showGlasses: true,
  selectedGlassesId: '',
  isAdjustMode: false,

  userScale: 1.0,
  glassesCatalog: GLASSES_CATALOG, // Fallback initial state
  odooProducts: [],

  setShowDots: (val) => set({ showDots: val }),
  setShowGlasses: (val) => set({ showGlasses: val }),
  setSelectedGlassesId: (id) => set({ selectedGlassesId: id }),
  setUserScale: (val) => set({ userScale: val }),
  setAdjustMode: (val) => set({ isAdjustMode: val }),
  
  loadCatalogFromOdoo: async () => {
    try {
      const odooGlasses = await fetchGlassesFromOdoo();
      if (odooGlasses && odooGlasses.length > 0) {
        // Map Odoo data to Glasses type
        set({ odooProducts: odooGlasses });
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
