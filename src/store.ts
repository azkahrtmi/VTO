import { create } from 'zustand';

interface AppState {
  showDots: boolean;
  showGlasses: boolean;
  selectedGlassesId: string;
  isAdjustMode: boolean;
  userScale: number;

  setShowDots: (val: boolean) => void;
  setShowGlasses: (val: boolean) => void;
  setSelectedGlassesId: (id: string) => void;
  setUserScale: (scale: number) => void;
  setAdjustMode: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  showDots: true,
  showGlasses: true,
  selectedGlassesId: '',
  isAdjustMode: false,

  userScale: 1.0,
  setShowDots: (val) => set({ showDots: val }),
  setShowGlasses: (val) => set({ showGlasses: val }),
  setSelectedGlassesId: (id) => set({ selectedGlassesId: id }),
  setUserScale: (val) => set({ userScale: val }),
  setAdjustMode: (val) => set({ isAdjustMode: val }),
}));

// Legacy support if needed, but we should move to useAppStore
export const appStore = {
  getState: () => useAppStore.getState(),
  subscribe: (fn: (state: any) => void) => useAppStore.subscribe(fn),
  updateState: (updates: Partial<AppState>) => useAppStore.setState(updates),
};
