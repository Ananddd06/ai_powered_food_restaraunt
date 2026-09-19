import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRestaurantDetail } from '@/hooks/useRestaurants';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { useLocationStore } from '@/stores/useLocationStore';
import { Button, Badge, Card, CardContent, Skeleton, Toast } from '@/components/ui';
import { GISMapView } from '@/components/map/GISMapView';
import {
  Star,
  Heart,
  MapPin,
  Sparkles,
  Phone,
  Globe,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Navigation,
  Utensils,
  MessageSquare,
} from 'lucide-react';

export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: restaurant, isLoading } = useRestaurantDetail(id);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { currentLocation } = useLocationStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-80 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 md:col-span-2 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold font-heading text-foreground mb-2">Restaurant Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">The requested restaurant details could not be loaded.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to Map Discovery
        </Button>
      </div>
    );
  }

  const favorite = isFavorite(restaurant.id);

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(restaurant.id);
      setToastMessage('Removed from saved favorites');
    } else {
      addFavorite(restaurant);
      setToastMessage('Saved to your favorites collection!');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Link copied to clipboard!');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 pb-24">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50">
          <Toast
            id="detail-toast"
            type="info"
            title="Notification"
            message={toastMessage}
            onDismiss={() => setToastMessage(null)}
          />
        </div>
      )}

      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard Map
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Share2 className="w-4 h-4" />} onClick={handleShare}>
            Share
          </Button>
          <Button
            variant={favorite ? 'destructive' : 'primary'}
            size="sm"
            leftIcon={<Heart className={`w-4 h-4 ${favorite ? 'fill-white' : ''}`} />}
            onClick={toggleFavorite}
          >
            {favorite ? 'Saved Favorite' : 'Save Favorite'}
          </Button>
        </div>
      </div>

      {/* Hero Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl overflow-hidden border border-border/80 shadow-md">
        <div className="md:col-span-2 h-72 sm:h-96 overflow-hidden">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="hidden md:flex flex-col gap-4 h-96">
          {restaurant.galleryImages.slice(0, 2).map((img, idx) => (
            <div key={idx} className="flex-1 overflow-hidden">
              <img
                src={img}
                alt={`${restaurant.name} gallery ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Title Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" className="text-xs font-bold py-1 px-3">
              <Sparkles className="w-3.5 h-3.5" /> 98% AI Match Score
            </Badge>
            {restaurant.cuisine.map((c) => (
              <Badge key={c} variant="secondary">
                {c}
              </Badge>
            ))}
            <Badge variant="outline" className="font-bold">
              {restaurant.priceLevel}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground tracking-tight">
            {restaurant.name}
          </h1>
          <p className="text-base text-muted-foreground">{restaurant.tagline}</p>
        </div>

        <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-2xl border border-border/60">
          <div className="text-center border-r border-border/60 pr-4">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-500 font-heading">
              <Star className="w-6 h-6 fill-amber-500" /> {restaurant.rating}
            </div>
            <p className="text-xs text-muted-foreground">{restaurant.reviewCount} Reviews</p>
          </div>

          <div className="text-center pl-2">
            <div className="text-2xl font-bold text-primary font-heading">{restaurant.distanceKm} KM</div>
            <p className="text-xs text-muted-foreground">From GPS Center</p>
          </div>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (AI Explanation, Overview, Dishes, Reviews) */}
        <div className="lg:col-span-8 space-y-8">
          {/* AI Explanation Card */}
          <Card className="glass-panel border-primary/30">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-lg font-heading">
                <Sparkles className="w-5 h-5" /> Why GourmetAI Recommended This Restaurant For You
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                GourmetAI analyzed your preference profile and matched {restaurant.name} because it features{' '}
                <span className="font-semibold text-primary">{restaurant.cuisine.join(' & ')}</span> cuisine aligned with your saved preferences. It is located just{' '}
                <span className="font-semibold">{restaurant.distanceKm} KM</span> from your current GPS pin and holds a stellar rating of{' '}
                <span className="font-semibold text-amber-500">{restaurant.rating} ★</span>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-background border border-border text-center">
                  <span className="block text-[11px] text-muted-foreground uppercase font-semibold">Cuisine Match</span>
                  <span className="text-base font-bold text-emerald-500">100%</span>
                </div>
                <div className="p-3 rounded-xl bg-background border border-border text-center">
                  <span className="block text-[11px] text-muted-foreground uppercase font-semibold">Distance Decay</span>
                  <span className="text-base font-bold text-primary">0.8 KM</span>
                </div>
                <div className="p-3 rounded-xl bg-background border border-border text-center">
                  <span className="block text-[11px] text-muted-foreground uppercase font-semibold">Budget Alignment</span>
                  <span className="text-base font-bold text-accent">{restaurant.priceLevel}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview & Description */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold font-heading text-foreground">About the Restaurant</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{restaurant.description}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              {restaurant.features.hasOutdoorSeating && (
                <Badge variant="success">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Outdoor Seating
                </Badge>
              )}
              {restaurant.features.isVegetarianFriendly && (
                <Badge variant="success">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Vegetarian Friendly
                </Badge>
              )}
              {restaurant.features.isFamilyFriendly && (
                <Badge variant="secondary">Family Friendly</Badge>
              )}
              {restaurant.features.hasParking && (
                <Badge variant="secondary">Parking Available</Badge>
              )}
            </div>
          </div>

          {/* Popular Menu Highlights */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" /> Popular Dishes & Menu Highlights
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {restaurant.popularDishes.map((dish) => (
                <div key={dish.id} className="p-4 rounded-2xl border border-border/70 bg-card space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-foreground">{dish.name}</h4>
                    <span className="font-bold text-sm text-primary">${dish.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{dish.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" /> Verified Reviews
            </h3>

            <div className="space-y-3">
              {restaurant.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl border border-border bg-card space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-foreground">{rev.authorName}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {rev.rating} / 5
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-muted-foreground/80 block text-right">{rev.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Info Card & OSRM Map Preview */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold font-heading text-base text-foreground border-b border-border pb-3">
                Location & Contact Details
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">{restaurant.address}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-foreground">{restaurant.openingHours}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <a href={`tel:${restaurant.phone}`} className="text-primary hover:underline font-medium">
                    {restaurant.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-medium truncate"
                  >
                    {restaurant.website}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Map Route Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-primary" /> GIS Spatial Location & Route
            </h4>
            <GISMapView
              centerLocation={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              radiusKm={restaurant.distanceKm + 0.5}
              restaurants={[restaurant]}
              selectedRestaurantId={restaurant.id}
              className="h-64 w-full shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
