import { useQuery } from '@tanstack/react-query';
import { UserPreferences, LocationCoordinates } from '@/types';
import { RecommendationService } from '@/services/recommendation.service';

export function useRecommendations(
  userPreferences: UserPreferences,
  centerLocation: LocationCoordinates,
  radiusKm: number
) {
  return useQuery({
    queryKey: ['recommendations', userPreferences, centerLocation, radiusKm],
    queryFn: () => RecommendationService.getSmartRecommendations(userPreferences, centerLocation, radiusKm),
  });
}
