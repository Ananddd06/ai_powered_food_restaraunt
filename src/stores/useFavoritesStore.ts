import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Restaurant } from '@/types';
import { api } from '@/services/api';

interface FavoritesStoreState {
  favorites: Restaurant[];
  fetchFavorites: () => Promise<void>;
  addFavorite: (restaurant: Restaurant) => Promise<void>;
  removeFavorite: (restaurantId: string) => Promise<void>;
  isFavorite: (restaurantId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStoreState>()(
  persist(
    (set, get) => ({
      favorites: [],

      fetchFavorites: async () => {
        try {
          const res = await api.get<Restaurant[]>('/favorites');
          set({ favorites: res.data });
        } catch {
          // Keep local state if unauthenticated or offline
        }
      },

      addFavorite: async (restaurant) => {
        set((state) => ({
          favorites: [...state.favorites.filter((r) => r.id !== restaurant.id), restaurant],
        }));
        try {
          await api.post(`/favorites/${restaurant.id}`);
        } catch {
          // Handled gracefully
        }
      },

      removeFavorite: async (restaurantId) => {
        set((state) => ({
          favorites: state.favorites.filter((r) => r.id !== restaurantId),
        }));
        try {
          await api.delete(`/favorites/${restaurantId}`);
        } catch {
          // Handled gracefully
        }
      },

      isFavorite: (restaurantId) =>
        get().favorites.some((r) => r.id === restaurantId),
    }),
    {
      name: 'gourmet_favorites_storage',
    }
  )
);

