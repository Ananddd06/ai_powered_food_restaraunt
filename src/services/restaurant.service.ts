import { Restaurant, FilterState, LocationCoordinates } from '@/types';
import { api } from './api';
import { MOCK_RESTAURANTS, DEFAULT_CENTER_LOCATION } from './mockData';

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export class RestaurantService {
  static async searchRestaurants(
    filter: Partial<FilterState>,
    centerLocation: LocationCoordinates = DEFAULT_CENTER_LOCATION
  ): Promise<Restaurant[]> {
    try {
      // Build query string
      const params = new URLSearchParams();
      params.append('lat', centerLocation.lat.toString());
      params.append('lng', centerLocation.lng.toString());
      
      if (filter.radiusKm) {
        params.append('radiusKm', filter.radiusKm.toString());
      }
      
      if (filter.searchQuery && filter.searchQuery.trim() !== '') {
        params.append('searchQuery', filter.searchQuery.trim());
      }
      
      if (filter.cuisines && filter.cuisines.length > 0) {
        // Send first selected cuisine for now
        params.append('cuisine', filter.cuisines[0]);
      }
      
      if (filter.priceLevels && filter.priceLevels.length > 0) {
        params.append('price_level', filter.priceLevels[0]);
      }
      
      if (filter.openNowOnly) {
        params.append('open_now', 'true');
      }
      
      // Default limit
      params.append('limit', '50');

      const response = await api.get<Restaurant[]>(`/restaurants?${params.toString()}`);
      return response.data;
    } catch {
      // Fallback if backend is offline
      return MOCK_RESTAURANTS.map((restaurant) => {
        const distance = calculateDistanceKm(
          centerLocation.lat,
          centerLocation.lng,
          restaurant.location.lat,
          restaurant.location.lng
        );
        return { ...restaurant, distanceKm: distance };
      });
    }
  }

  static async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const response = await api.get<Restaurant>(`/restaurants/${id}`);
      return response.data;
    } catch {
      return MOCK_RESTAURANTS.find((r) => r.id === id) || null;
    }
  }
}

