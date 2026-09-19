export type PriceLevel = '$' | '$$' | '$$$' | '$$$$';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface GISLocation {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  postalCode?: string;
  isLiveGps: boolean;
}

export interface RestaurantFeatures {
  hasOutdoorSeating: boolean;
  isVegetarianFriendly: boolean;
  isFamilyFriendly: boolean;
  hasParking: boolean;
  isHalal?: boolean;
  isKosher?: boolean;
  isGlutenFree?: boolean;
}

export interface RestaurantDish {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  isPopular?: boolean;
}

export interface RestaurantReview {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  cuisine: string[];
  priceLevel: PriceLevel;
  rating: number;
  reviewCount: number;
  address: string;
  location: LocationCoordinates;
  distanceKm: number;
  phone: string;
  website: string;
  imageUrl: string;
  galleryImages: string[];
  isOpenNow: boolean;
  openingHours: string;
  features: RestaurantFeatures;
  popularDishes: RestaurantDish[];
  reviews: RestaurantReview[];
}

export interface UserPreferences {
  preferredCuisines: string[];
  budgetRange: PriceLevel[];
  defaultRadiusKm: number;
  dietaryRestrictions: string[];
  autoDetectLocation: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  preferences: UserPreferences;
}

export interface RecommendationMatch {
  restaurant: Restaurant;
  aiScore: number; // 0 - 100
  distanceMatchScore: number;
  cuisineMatchScore: number;
  budgetMatchScore: number;
  ratingScore: number;
  matchReasons: string[];
  aiExplanation: string;
}

export interface FilterState {
  searchQuery: string;
  radiusKm: number;
  cuisines: string[];
  priceLevels: PriceLevel[];
  minRating: number;
  openNowOnly: boolean;
  dietary: string[];
  sortBy: 'ai_score' | 'distance' | 'rating';
}

export interface ActivityHistoryItem {
  id: string;
  timestamp: string;
  type: 'search' | 'recommendation' | 'favorite' | 'view';
  title: string;
  detail: string;
}
