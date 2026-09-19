import React from 'react';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Heart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favorites } = useFavoritesStore();

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase mb-1">
            <Heart className="w-3.5 h-3.5 fill-accent" /> Saved Collections
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
            Saved Favorite Restaurants
          </h1>
          <p className="text-sm text-muted-foreground">
            Quick access to your bookmarked dining spots ({favorites.length} saved)
          </p>
        </div>

        {favorites.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4 text-destructive" />}
            onClick={() => useFavoritesStore.setState({ favorites: [] })}
          >
            Clear All Favorites
          </Button>
        )}
      </div>

      {/* Grid of Saved Favorites */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Favorite Restaurants Saved Yet"
          description="Click the heart icon on any restaurant card to save your favorite dining spots for instant access."
          icon={<Heart className="w-10 h-10 text-muted-foreground/60" />}
          actionLabel="Discover Restaurants Near You"
          onAction={() => navigate('/dashboard')}
        />
      )}
    </div>
  );
};
