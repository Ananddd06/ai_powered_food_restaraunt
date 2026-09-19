export interface ScoreBreakdown {
  total_score: number;
  semantic_similarity: number;
  distance_score: number;
  rating_score: number;
  price_score: number;
  popularity_score: number;
}

export interface RecommendedRestaurant {
  id: string | number;
  name: string;
  zomato_url?: string;
  address?: string;
  location: string;
  latitude: number;
  longitude: number;
  cuisines: string[];
  top_dishes: string[];
  price_for_two: number;
  dining_rating?: number;
  delivery_rating?: number;
  overall_rating: number;
  total_rating_count: number;
  features: string[];
  distance_km: number;
  score_breakdown: ScoreBreakdown;
  ai_explanation: string;
  source?: string;
  is_live_verified?: boolean;
}

export interface PipelineTelemetry {
  execution_time_ms: number;
  postgis_local_count: number;
  live_osm_count: number;
  duplicates_merged: number;
  unified_candidates: number;
  final_ranked_count: number;
}

export interface RecommendationResponse {
  query: string;
  user_location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  total_results: number;
  recommendations: RecommendedRestaurant[];
  pipeline_telemetry?: PipelineTelemetry;
  served_from_cache?: boolean;
}

export interface Locality {
  name: string;
  latitude: number;
  longitude: number;
}

const API_BASE_URL = "http://localhost:8000/api/v1";

export async function notifyLocationPermission(params: {
  recipient_email: string;
  user_email?: string;
  latitude: number;
  longitude: number;
  locality_name?: string;
}): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/recommendations/notify-gps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to send location email notification");
  }
  return await res.json();
}

export async function detectNearestLocality(lat: number, lon: number): Promise<{ locality: string; distance_to_center_km: number; latitude: number; longitude: number }> {
  const res = await fetch(`${API_BASE_URL}/recommendations/detect-location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: lat, longitude: lon }),
  });
  if (!res.ok) throw new Error("Failed to detect location");
  return await res.json();
}

export async function fetchChennaiLocalities(): Promise<Locality[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations/localities`);
    if (!res.ok) throw new Error("Failed to fetch localities");
    return await res.json();
  } catch (error) {
    console.warn("Could not load localities from backend, using fallback dataset.", error);
    return [
      { name: "T. Nagar", latitude: 13.0418, longitude: 80.2341 },
      { name: "Velachery", latitude: 12.9750, longitude: 80.2207 },
      { name: "Anna Nagar East", latitude: 13.0880, longitude: 80.2170 },
      { name: "Adyar", latitude: 13.0012, longitude: 80.2565 },
      { name: "Kilpauk", latitude: 13.0820, longitude: 80.2410 },
      { name: "Nungambakkam", latitude: 13.0604, longitude: 80.2496 },
      { name: "Mylapore", latitude: 13.0368, longitude: 80.2676 },
      { name: "Porur", latitude: 13.0382, longitude: 80.1565 },
      { name: "OMR", latitude: 12.9200, longitude: 80.2300 },
    ];
  }
}

export async function fetchLatestCachedRecommendations(userId: string): Promise<RecommendationResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations/latest-cache?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.cached && data.data) {
      return data.data as RecommendationResponse;
    }
    return null;
  } catch (e) {
    console.warn("Error fetching latest cache:", e);
    return null;
  }
}

export async function getRecommendations(params: {
  query: string;
  location_name?: string;
  user_lat?: number;
  user_lon?: number;
  max_distance_km?: number;
  target_price?: number;
  top_k?: number;
  user_id?: string;
}): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE_URL}/recommendations/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to fetch recommendations");
  }

  return await res.json();
}

import { Restaurant } from "../types";
export function mapRecommendedToRestaurant(rec: RecommendedRestaurant): Restaurant {
  return {
    id: String(rec.id),
    name: rec.name,
    tagline: rec.cuisines ? rec.cuisines.join(', ') : "",
    description: rec.ai_explanation || "",
    cuisine: rec.cuisines || [],
    priceLevel: rec.price_for_two > 1000 ? '$$$' : (rec.price_for_two > 500 ? '$$' : '$'),
    rating: rec.overall_rating || 0,
    reviewCount: rec.total_rating_count || 0,
    address: rec.address || rec.location || "",
    location: { lat: rec.latitude, lng: rec.longitude },
    distanceKm: rec.distance_km || 0,
    phone: "",
    website: rec.zomato_url || "",
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800",
    galleryImages: [],
    isOpenNow: true,
    openingHours: "",
    features: {
      hasOutdoorSeating: (rec.features || []).includes("Outdoor Seating"),
      isVegetarianFriendly: (rec.features || []).includes("Vegetarian"),
      isFamilyFriendly: true,
      hasParking: false,
    },
    popularDishes: [],
    reviews: []
  };
}

