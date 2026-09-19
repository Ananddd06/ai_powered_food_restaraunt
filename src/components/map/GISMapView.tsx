import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Restaurant, LocationCoordinates } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Star, Sparkles, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet Default Marker Icon Issue in React
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icon Creators
const createCenterIcon = () =>
  L.divIcon({
    className: 'custom-gps-pin',
    html: `<div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-primary/30 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const createRestaurantIcon = (rating: number, isSelected: boolean) =>
  L.divIcon({
    className: 'custom-restaurant-pin',
    html: `<div class="px-2.5 py-1 rounded-xl font-bold text-xs shadow-md border flex items-center gap-1 transition-transform ${
      isSelected
        ? 'bg-accent text-accent-foreground border-white ring-2 ring-accent scale-110'
        : 'bg-card text-foreground border-border hover:scale-105'
    }">
            <span class="text-amber-500 font-bold">★ ${rating}</span>
           </div>`,
    iconSize: [50, 26],
    iconAnchor: [25, 13],
  });

interface MapControllerProps {
  center: LocationCoordinates;
}

const MapController: React.FC<MapControllerProps> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 14, { duration: 1.2 });
  }, [center, map]);
  return null;
};

interface GISMapViewProps {
  centerLocation: LocationCoordinates;
  radiusKm: number;
  restaurants: Restaurant[];
  selectedRestaurantId?: string;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
  className?: string;
}

export const GISMapView: React.FC<GISMapViewProps> = ({
  centerLocation,
  radiusKm,
  restaurants,
  selectedRestaurantId,
  onSelectRestaurant,
  className = 'h-[500px] w-full',
}) => {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();

  // Dynamic Tile URL based on Active Theme (Using CSS filters for dark mode)
  const tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const radiusMeters = radiusKm * 1000;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border shadow-md ${className}`}>
      <MapContainer
        center={[centerLocation.lat, centerLocation.lng]}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapController center={centerLocation} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileLayerUrl}
          className={resolvedTheme === 'dark' ? 'dark-map-tiles' : ''}
        />

        {/* 3.0 KM Radius Circle Overlay */}
        <Circle
          center={[centerLocation.lat, centerLocation.lng]}
          radius={radiusMeters}
          pathOptions={{
            color: resolvedTheme === 'dark' ? '#34d399' : '#059669',
            fillColor: resolvedTheme === 'dark' ? '#10b981' : '#10b981',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '6, 8',
          }}
        />

        {/* User GPS Center Marker */}
        <Marker
          position={[centerLocation.lat, centerLocation.lng]}
          icon={createCenterIcon()}
        >
          <Popup>
            <div className="p-2 text-center space-y-1">
              <span className="font-semibold text-xs text-foreground flex items-center justify-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-primary" /> Active Center Location
              </span>
              <p className="text-[11px] text-muted-foreground">Search Radius: {radiusKm} KM</p>
            </div>
          </Popup>
        </Marker>

        {/* Restaurant Markers */}
        {restaurants.map((restaurant) => {
          const isSelected = restaurant.id === selectedRestaurantId;
          return (
            <Marker
              key={restaurant.id}
              position={[restaurant.location.lat, restaurant.location.lng]}
              icon={createRestaurantIcon(restaurant.rating, isSelected)}
              eventHandlers={{
                click: () => onSelectRestaurant && onSelectRestaurant(restaurant),
              }}
            >
              <Popup>
                <div className="w-64 overflow-hidden rounded-xl bg-card text-foreground">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-28 object-cover"
                  />
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold font-heading text-sm text-foreground leading-tight">
                        {restaurant.name}
                      </h4>
                      <Badge variant="success" className="text-[10px] py-0">
                        {restaurant.priceLevel}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {restaurant.tagline}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                      <span className="flex items-center gap-1 font-semibold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {restaurant.rating} ({restaurant.reviewCount})
                      </span>
                      <span className="text-primary font-semibold">
                        {restaurant.distanceKm} KM Away
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full h-8 text-xs mt-1"
                      leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      View Details & AI Score
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Control Info Overlay Badge */}
      <div className="absolute top-4 right-4 z-20 glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 border border-border shadow-md">
        <MapPin className="w-3.5 h-3.5 text-primary animate-pulse" />
        <span className="text-xs font-semibold text-foreground">
          GIS Radius: {radiusKm} KM ({restaurants.length} Restaurants Found)
        </span>
      </div>
    </div>
  );
};
