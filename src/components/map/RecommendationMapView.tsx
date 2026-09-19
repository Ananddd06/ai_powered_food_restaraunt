import React, { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { RecommendedRestaurant, mapRecommendedToRestaurant } from "../../services/recommendationService";
import { MapPin, Star, Navigation, ExternalLink, Heart } from "lucide-react";
import { useFavoritesStore } from "../../stores/useFavoritesStore";
import "leaflet/dist/leaflet.css";

// Fix Leaflet Default Marker Icon Issue in React
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createCenterIcon = () =>
  L.divIcon({
    className: "custom-gps-pin",
    html: `<div class="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-slate-900 ring-4 ring-emerald-500/30 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const createRestaurantIcon = (rank: number, matchScore: number) =>
  L.divIcon({
    className: "custom-restaurant-pin",
    html: `<div class="px-2.5 py-1 rounded-xl font-bold text-xs shadow-xl border border-amber-500/60 bg-slate-900 text-amber-300 flex items-center gap-1.5 hover:scale-110 transition-transform">
            <span class="bg-amber-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">#${rank}</span>
            <span class="font-bold text-emerald-400">${matchScore}%</span>
           </div>`,
    iconSize: [64, 28],
    iconAnchor: [32, 14],
  });

interface MapControllerProps {
  center: [number, number];
}

const MapController: React.FC<MapControllerProps> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.2 });
  }, [center, map]);
  return null;
};

interface RecommendationMapViewProps {
  center: [number, number];
  centerName: string;
  radiusKm: number;
  restaurants: RecommendedRestaurant[];
  className?: string;
}

export const RecommendationMapView: React.FC<RecommendationMapViewProps> = ({
  center,
  centerName,
  radiusKm,
  restaurants,
  className = "h-[450px] w-full",
}) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  
  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapController center={center} />

        {/* OpenStreetMap Tiles with CSS Dark Mode Filter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-map-tiles"
        />

        {/* GIS Radius Circle Overlay */}
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.08,
            weight: 2,
            dashArray: "6, 8",
          }}
        />

        {/* Center Target Locality Marker */}
        <Marker position={center} icon={createCenterIcon()}>
          <Popup>
            <div className="p-2 text-center space-y-1 bg-slate-900 text-white rounded-lg">
              <span className="font-semibold text-xs text-emerald-400 flex items-center justify-center gap-1">
                <Navigation className="w-3.5 h-3.5" /> Center: {centerName}
              </span>
              <p className="text-[11px] text-slate-300">GIS Radius: {radiusKm} KM</p>
            </div>
          </Popup>
        </Marker>

        {/* Recommended Restaurant Markers */}
        {restaurants.map((restaurant, idx) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.latitude, restaurant.longitude]}
            icon={createRestaurantIcon(idx + 1, restaurant.score_breakdown.total_score)}
          >
            <Popup>
              <div className="w-64 p-3 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-white">{restaurant.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isFavorite(String(restaurant.id))) removeFavorite(String(restaurant.id));
                        else addFavorite(mapRecommendedToRestaurant(restaurant));
                      }}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isFavorite(String(restaurant.id)) 
                          ? "bg-accent/20 border-accent/40 text-accent" 
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                      title="Toggle Favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(String(restaurant.id)) ? "fill-accent" : ""}`} />
                    </button>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-800">
                      {restaurant.score_breakdown.total_score}% Match
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">{restaurant.location} • {restaurant.distance_km} km away</p>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {restaurant.overall_rating.toFixed(1)} ({restaurant.total_rating_count} reviews)
                  </span>
                  <span className="font-semibold text-emerald-400">
                    ₹{restaurant.price_for_two.toFixed(0)} for 2
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ', ' + (restaurant.location || centerName) + ', Chennai')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-[11px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 px-2 rounded-lg transition-colors"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {restaurant.zomato_url && (
                    <a
                      href={restaurant.zomato_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 text-[11px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 px-2 rounded-lg transition-colors"
                    >
                      <span>Zomato</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Info Badge */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-700 shadow-xl">
        <MapPin className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold text-white">
          OpenStreetMap GIS View: {restaurants.length} Recommended Pins
        </span>
      </div>
    </div>
  );
};
