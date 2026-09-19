import { RecommendationMatch, UserPreferences, LocationCoordinates } from '@/types';
import { RestaurantService } from './restaurant.service';
import { DEFAULT_CENTER_LOCATION } from './mockData';

export class RecommendationService {
  static async getSmartRecommendations(
    userPreferences: UserPreferences,
    centerLocation: LocationCoordinates = DEFAULT_CENTER_LOCATION,
    radiusKm: number = 3.0
  ): Promise<RecommendationMatch[]> {
    const restaurants = await RestaurantService.searchRestaurants({ radiusKm }, centerLocation);

    return restaurants
      .map((restaurant) => {
        // Distance match score (decay function within radius)
        const distanceRatio = Math.max(0, 1 - restaurant.distanceKm / radiusKm);
        const distanceScore = Math.round(distanceRatio * 30); // 30% max weight

        // Cuisine match score
        const sharedCuisines = restaurant.cuisine.filter((c) =>
          userPreferences.preferredCuisines.includes(c)
        );
        const cuisineScore = sharedCuisines.length > 0 ? 35 : 10; // 35% max weight

        // Rating score
        const ratingScore = Math.round((restaurant.rating / 5.0) * 25); // 25% max weight

        // Budget match score
        const budgetMatch = userPreferences.budgetRange.includes(restaurant.priceLevel);
        const budgetScore = budgetMatch ? 10 : 5; // 10% max weight

        const totalScore = distanceScore + cuisineScore + ratingScore + budgetScore;

        const matchReasons: string[] = [];
        if (sharedCuisines.length > 0) {
          matchReasons.push(`Matches your ${sharedCuisines.join(' & ')} cuisine preference`);
        }
        if (restaurant.distanceKm <= 1.0) {
          matchReasons.push(`Walking distance (${restaurant.distanceKm} km away)`);
        } else {
          matchReasons.push(`Within ${restaurant.distanceKm} km from location`);
        }
        if (restaurant.rating >= 4.7) {
          matchReasons.push(`Highly rated (${restaurant.rating} ★)`);
        }

        const aiExplanation = `GourmetAI matched ${restaurant.name} because it features ${restaurant.cuisine.join(
          ', '
        )} cuisine matching your dining profile. It is located ${
          restaurant.distanceKm
        } km from your current GPS pin with a stellar ${restaurant.rating} star rating.`;

        return {
          restaurant,
          aiScore: Math.min(99, Math.max(70, totalScore)),
          distanceMatchScore: distanceScore,
          cuisineMatchScore: cuisineScore,
          budgetMatchScore: budgetScore,
          ratingScore,
          matchReasons,
          aiExplanation,
        };
      })
      .sort((a, b) => b.aiScore - a.aiScore);
  }
}
