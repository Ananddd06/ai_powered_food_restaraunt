import React, { useState } from "react";
import { RecommendedRestaurant, mapRecommendedToRestaurant } from "../../services/recommendationService";
import { ScoreBreakdownBadge } from "./ScoreBreakdownBadge";
import { Star, MapPin, Utensils, DollarSign, Sparkles, ChevronDown, ChevronUp, ExternalLink, Heart } from "lucide-react";
import { useFavoritesStore } from "../../stores/useFavoritesStore";

interface RecommendationCardProps {
  restaurant: RecommendedRestaurant;
  rank: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ restaurant, rank }) => {
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  
  const favorite = isFavorite(String(restaurant.id));
  const toggleFavorite = () => {
    if (favorite) removeFavorite(String(restaurant.id));
    else addFavorite(mapRecommendedToRestaurant(restaurant));
  };

  return (
    <div className="relative group bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl">
      {/* Rank Badge */}
      <div className="absolute -top-3 -left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900">
        #{rank}
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
              {restaurant.name}
            </h3>
            <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
              {restaurant.location}
            </span>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3" /> {restaurant.distance_km} km away
            </span>
            {restaurant.source && (
              <span className="bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {restaurant.source}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{restaurant.address || `${restaurant.location}, Chennai`}</p>
        </div>

        {/* Total Score Pill & Favorites */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite();
            }}
            className={`p-2 rounded-xl border transition-all ${
              favorite 
                ? "bg-accent/20 border-accent/40 text-accent" 
                : "bg-slate-800/50 border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white"
            }`}
            title="Toggle Favorite"
          >
            <Heart className={`w-4 h-4 ${favorite ? "fill-accent" : ""}`} />
          </button>
          
          <button
            onClick={() => setShowScoreDetails(!showScoreDetails)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
          >
            <span>{restaurant.score_breakdown.total_score}% Match</span>
            {showScoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Score Breakdown */}
      {showScoreDetails && (
        <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <ScoreBreakdownBadge breakdown={restaurant.score_breakdown} />
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs">
        <div className="flex items-center gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <div>
            <span className="font-bold text-white text-sm">{restaurant.overall_rating.toFixed(1)}</span>
            <span className="text-slate-400 ml-1">({restaurant.total_rating_count} reviews)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="font-bold text-white text-sm">₹{restaurant.price_for_two.toFixed(0)}</span>
            <span className="text-slate-400 ml-1">for two</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <Utensils className="w-4 h-4 text-cyan-400" />
          <div className="truncate">
            <span className="text-slate-300 truncate">{restaurant.cuisines.join(", ") || "Multi-cuisine"}</span>
          </div>
        </div>
      </div>

      {/* Top Dishes */}
      {restaurant.top_dishes && restaurant.top_dishes.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1">Famous Dishes:</span>
          {restaurant.top_dishes.slice(0, 5).map((dish, i) => (
            <span
              key={i}
              className="bg-amber-950/40 text-amber-300 border border-amber-800/40 text-[11px] px-2 py-0.5 rounded-md"
            >
              {dish}
            </span>
          ))}
        </div>
      )}

      {/* Qwen AI Explanation Box */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-800/40 rounded-xl p-4">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg shrink-0 mt-0.5 border border-purple-500/30">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              Qwen AI Recommendation Rationale
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              {restaurant.ai_explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Zomato link footer */}
      {restaurant.zomato_url && (
        <div className="mt-3 flex justify-end">
          <a
            href={restaurant.zomato_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            <span>View on Zomato</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
