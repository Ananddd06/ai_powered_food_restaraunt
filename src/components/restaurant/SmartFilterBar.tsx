import React from 'react';
import { useFilterStore } from '@/stores/useFilterStore';
import { Input, Button, Slider, Switch, Select } from '@/components/ui';
import { Search, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { PriceLevel } from '@/types';

interface SmartFilterBarProps {
  totalResultsCount?: number;
  onOpenMobileDrawer?: () => void;
}

export const SmartFilterBar: React.FC<SmartFilterBarProps> = ({
  totalResultsCount = 0,
  onOpenMobileDrawer,
}) => {
  const {
    filters,
    setSearchQuery,
    setRadiusKm,
    toggleCuisine,
    togglePriceLevel,
    setOpenNowOnly,
    setSortBy,
    resetFilters,
  } = useFilterStore();

  const ALL_CUISINES = ['Italian', 'Japanese', 'Indian', 'Mexican', 'Vegan'];
  const PRICE_LEVELS: PriceLevel[] = ['$', '$$', '$$$', '$$$$'];

  const activeCount =
    (filters.searchQuery ? 1 : 0) +
    filters.cuisines.length +
    filters.priceLevels.length +
    (filters.openNowOnly ? 1 : 0) +
    filters.dietary.length;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-4">
      {/* Top Search Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search restaurant name, cuisine, or dish..."
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-primary" />}
            className="h-11"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Select
            value={filters.sortBy}
            onChange={(e) => setSortBy(e.target.value as 'ai_score' | 'distance' | 'rating')}
            options={[
              { value: 'ai_score', label: '★ Best AI Match' },
              { value: 'distance', label: '📍 Nearest Distance' },
              { value: 'rating', label: '⭐ Highest Rated' },
            ]}
            className="h-11 min-w-[160px]"
          />

          <Button
            variant="outline"
            size="md"
            className="sm:hidden h-11"
            onClick={onOpenMobileDrawer}
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            Filters {activeCount > 0 && `(${activeCount})`}
          </Button>

          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Filter Options Bar */}
      <div className="hidden lg:flex items-center justify-between gap-6 pt-2 border-t border-border/50">
        {/* Radius Slider */}
        <div className="w-56 shrink-0">
          <Slider
            label="Radius"
            value={filters.radiusKm}
            onValueChange={setRadiusKm}
            min={0.5}
            max={10.0}
            step={0.5}
            unit="KM"
          />
        </div>

        {/* Cuisine Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold uppercase text-muted-foreground mr-1">Cuisines:</span>
          {ALL_CUISINES.map((c) => {
            const isSelected = filters.cuisines.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCuisine(c)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Price Level Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-semibold uppercase text-muted-foreground mr-1">Price:</span>
          {PRICE_LEVELS.map((p) => {
            const isSelected = filters.priceLevels.includes(p);
            return (
              <button
                key={p}
                onClick={() => togglePriceLevel(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Open Now Toggle */}
        <div className="shrink-0">
          <Switch
            checked={filters.openNowOnly}
            onCheckedChange={setOpenNowOnly}
            label="Open Now"
          />
        </div>
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span className="flex items-center gap-1 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Showing {totalResultsCount} restaurants within {filters.radiusKm} KM radius
        </span>
      </div>
    </div>
  );
};
