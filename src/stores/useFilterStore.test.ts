import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from './useFilterStore';

describe('useFilterStore', () => {
  beforeEach(() => {
    useFilterStore.getState().resetFilters();
  });

  it('initializes with default filters', () => {
    const { filters } = useFilterStore.getState();
    expect(filters.searchQuery).toBe('');
    expect(filters.radiusKm).toBe(3.0);
    expect(filters.cuisines).toEqual([]);
    expect(filters.priceLevels).toEqual([]);
    expect(filters.minRating).toBe(0);
    expect(filters.openNowOnly).toBe(false);
    expect(filters.sortBy).toBe('ai_score');
  });

  it('updates search query', () => {
    useFilterStore.getState().setSearchQuery('Biryani');
    expect(useFilterStore.getState().filters.searchQuery).toBe('Biryani');
  });

  it('updates radius in km', () => {
    useFilterStore.getState().setRadiusKm(15.0);
    expect(useFilterStore.getState().filters.radiusKm).toBe(15.0);
  });

  it('toggles cuisines (add and remove)', () => {
    // Add cuisine
    useFilterStore.getState().toggleCuisine('South Indian');
    expect(useFilterStore.getState().filters.cuisines).toContain('South Indian');

    // Add another
    useFilterStore.getState().toggleCuisine('Italian');
    expect(useFilterStore.getState().filters.cuisines).toEqual(['South Indian', 'Italian']);

    // Remove first
    useFilterStore.getState().toggleCuisine('South Indian');
    expect(useFilterStore.getState().filters.cuisines).toEqual(['Italian']);
  });

  it('toggles price levels', () => {
    useFilterStore.getState().togglePriceLevel('$$');
    expect(useFilterStore.getState().filters.priceLevels).toContain('$$');

    useFilterStore.getState().togglePriceLevel('$$');
    expect(useFilterStore.getState().filters.priceLevels).not.toContain('$$');
  });

  it('resets filters back to initial state', () => {
    useFilterStore.getState().setSearchQuery('Chettinad spicy');
    useFilterStore.getState().setRadiusKm(25.0);
    useFilterStore.getState().setMinRating(4.5);
    useFilterStore.getState().setOpenNowOnly(true);

    useFilterStore.getState().resetFilters();

    const { filters } = useFilterStore.getState();
    expect(filters.searchQuery).toBe('');
    expect(filters.radiusKm).toBe(3.0);
    expect(filters.minRating).toBe(0);
    expect(filters.openNowOnly).toBe(false);
  });
});

