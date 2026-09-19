import { create } from 'zustand';
import { FilterState } from '@/types';

interface FilterStoreState {
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setRadiusKm: (radius: number) => void;
  toggleCuisine: (cuisine: string) => void;
  togglePriceLevel: (price: '$' | '$$' | '$$$' | '$$$$') => void;
  setMinRating: (rating: number) => void;
  setOpenNowOnly: (openNow: boolean) => void;
  toggleDietary: (restriction: string) => void;
  setSortBy: (sortBy: 'ai_score' | 'distance' | 'rating') => void;
  resetFilters: () => void;
}

const initialFilters: FilterState = {
  searchQuery: '',
  radiusKm: 3.0,
  cuisines: [],
  priceLevels: [],
  minRating: 0,
  openNowOnly: false,
  dietary: [],
  sortBy: 'ai_score',
};

export const useFilterStore = create<FilterStoreState>((set) => ({
  filters: initialFilters,

  setSearchQuery: (searchQuery) =>
    set((state) => ({ filters: { ...state.filters, searchQuery } })),

  setRadiusKm: (radiusKm) =>
    set((state) => ({ filters: { ...state.filters, radiusKm } })),

  toggleCuisine: (cuisine) =>
    set((state) => {
      const current = state.filters.cuisines;
      const cuisines = current.includes(cuisine)
        ? current.filter((c) => c !== cuisine)
        : [...current, cuisine];
      return { filters: { ...state.filters, cuisines } };
    }),

  togglePriceLevel: (price) =>
    set((state) => {
      const current = state.filters.priceLevels;
      const priceLevels = current.includes(price)
        ? current.filter((p) => p !== price)
        : [...current, price];
      return { filters: { ...state.filters, priceLevels } };
    }),

  setMinRating: (minRating) =>
    set((state) => ({ filters: { ...state.filters, minRating } })),

  setOpenNowOnly: (openNowOnly) =>
    set((state) => ({ filters: { ...state.filters, openNowOnly } })),

  toggleDietary: (restriction) =>
    set((state) => {
      const current = state.filters.dietary;
      const dietary = current.includes(restriction)
        ? current.filter((d) => d !== restriction)
        : [...current, restriction];
      return { filters: { ...state.filters, dietary } };
    }),

  setSortBy: (sortBy) =>
    set((state) => ({ filters: { ...state.filters, sortBy } })),

  resetFilters: () => set({ filters: initialFilters }),
}));
