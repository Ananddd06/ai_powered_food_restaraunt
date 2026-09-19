import { useQuery } from '@tanstack/react-query';
import { FilterState, LocationCoordinates } from '@/types';
import { RestaurantService } from '@/services/restaurant.service';

export function useRestaurants(filter: Partial<FilterState>, centerLocation: LocationCoordinates) {
  return useQuery({
    queryKey: ['restaurants', filter, centerLocation],
    queryFn: () => RestaurantService.searchRestaurants(filter, centerLocation),
  });
}

export function useRestaurantDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => (id ? RestaurantService.getRestaurantById(id) : null),
    enabled: !!id,
  });
}
