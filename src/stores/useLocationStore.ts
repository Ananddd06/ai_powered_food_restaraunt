import { create } from 'zustand';
import { GISLocation } from '@/types';
import { GeocodingService } from '@/services/geocoding.service';
import { DEFAULT_CENTER_LOCATION } from '@/services/mockData';
import { useAuthStore } from './useAuthStore';

interface LocationStoreState {
  currentLocation: GISLocation;
  isDetecting: boolean;
  detectLocation: () => Promise<void>;
  setCustomLocation: (lat: number, lng: number, address?: string) => void;
}

export const useLocationStore = create<LocationStoreState>((set) => ({
  currentLocation: DEFAULT_CENTER_LOCATION,
  isDetecting: false,

  detectLocation: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      return;
    }
    set({ isDetecting: true });
    const location = await GeocodingService.getCurrentLocation();
    set({ currentLocation: location, isDetecting: false });
  },


  setCustomLocation: (lat, lng, address = 'Custom Pin Location') => {
    set({
      currentLocation: {
        lat,
        lng,
        address,
        city: 'San Francisco',
        isLiveGps: false,
      },
    });
  },
}));
