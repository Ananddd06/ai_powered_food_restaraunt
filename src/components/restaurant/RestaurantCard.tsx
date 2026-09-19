import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Restaurant, RecommendationMatch } from '@/types';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Star, Heart, MapPin, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  recommendation?: RecommendationMatch;
  isSelected?: boolean;
  onHover?: (restaurant: Restaurant | null) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  recommendation,
  isSelected = false,
  onHover,
}) => {
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const favorite = isFavorite(restaurant.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorite) {
      removeFavorite(restaurant.id);
    } else {
      addFavorite(restaurant);
    }
  };

  const aiScore = recommendation?.aiScore || 90;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25 }}
    >
      <Card
        hoverable
        onMouseEnter={() => onHover && onHover(restaurant)}
        onMouseLeave={() => onHover && onHover(null)}
        className={`transition-all duration-200 cursor-pointer overflow-hidden ${
          isSelected ? 'border-primary ring-2 ring-primary/40 shadow-xl' : 'border-border/70 hover:shadow-md'
        }`}
        onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Photo Container */}
          <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden bg-muted">
            <motion.img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />

            {/* AI Score Badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="default" className="shadow-md backdrop-blur-xs bg-primary text-primary-foreground font-bold text-xs py-1 px-2.5">
                <Sparkles className="w-3 h-3" /> {aiScore}% Match
              </Badge>
            </div>

            {/* Favorite Toggle Button */}
            <motion.button
              onClick={toggleFavorite}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md ${
                favorite
                  ? 'bg-destructive text-white shadow-destructive/30'
                  : 'bg-background/80 text-muted-foreground hover:text-destructive hover:bg-background'
              }`}
              title={favorite ? 'Remove from favorites' : 'Save to favorites'}
              aria-label="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-white' : ''}`} />
            </motion.button>
          </div>

          {/* Info Content */}
          <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-start gap-2 mb-1">
                <h3 className="text-lg font-bold font-heading text-foreground leading-snug group-hover:text-primary transition-colors">
                  {restaurant.name}
                </h3>
                <Badge variant="secondary" className="font-semibold shrink-0">
                  {restaurant.priceLevel}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                {restaurant.tagline}
              </p>

              {/* Cuisines Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {restaurant.cuisine.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-0.5 rounded-md bg-secondary/80 border border-border/50 text-secondary-foreground text-[11px] font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* AI Match Reason snippet if available */}
              {recommendation && recommendation.matchReasons.length > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-fit">
                  <Sparkles className="w-3 h-3 shrink-0 text-emerald-500" />
                  <span className="truncate">{recommendation.matchReasons[0]}</span>
                </p>
              )}
            </div>

            {/* Card Footer Details */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {restaurant.rating}
                  <span className="text-muted-foreground font-normal">({restaurant.reviewCount})</span>
                </span>

                <span className="flex items-center gap-1 font-semibold text-primary">
                  <MapPin className="w-3.5 h-3.5" /> {restaurant.distanceKm} KM
                </span>

                <span className="hidden sm:flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" /> {restaurant.isOpenNow ? 'Open Now' : 'Closed'}
                </span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1 p-1 h-auto"
              >
                Details <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

