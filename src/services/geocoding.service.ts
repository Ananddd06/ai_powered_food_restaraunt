import { GISLocation } from '@/types';
import { DEFAULT_CENTER_LOCATION } from './mockData';

export class GeocodingService {
  static async getCurrentLocation(): Promise<GISLocation> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(DEFAULT_CENTER_LOCATION);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Live GPS Location',
            city: 'San Francisco',
            isLiveGps: true,
          });
        },
        (_error) => {
          resolve(DEFAULT_CENTER_LOCATION);
        },
        { timeout: 5000 }
      );
    });
  }

  static async geocodeAddress(query: string): Promise<{ lat: number; lng: number; address: string }> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'GourmetAI-GIS-Restaurant-App/1.0',
          },
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name.split(',')[0] || query,
        };
      }
    } catch {
      // Fallback
    }
    return {
      lat: 37.7749,
      lng: -122.4194,
      address: query,
    };
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'GourmetAI-GIS-Restaurant-App/1.0',
          },
        }
      );
      const data = await response.json();
      if (data && data.display_name) {
        return data.display_name.split(',').slice(0, 2).join(',');
      }
    } catch {
      // Fallback
    }
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  }
}

