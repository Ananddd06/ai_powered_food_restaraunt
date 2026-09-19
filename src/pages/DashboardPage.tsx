import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  fetchChennaiLocalities,
  getRecommendations,
  detectNearestLocality,
  fetchLatestCachedRecommendations,
  Locality,
  RecommendationResponse,
} from "../services/recommendationService";
import { useAuthStore } from "../stores/useAuthStore";
import { useLocationStore } from "../stores/useLocationStore";
import { RecommendationCard } from "../components/restaurant/RecommendationCard";
import { RecommendationMapView } from "../components/map/RecommendationMapView";
import { LocationPermissionModal } from "../components/ui/LocationPermissionModal";
import { PipelineInspector } from "../components/restaurant/PipelineInspector";
import {
  Search,
  MapPin,
  Sparkles,
  Loader2,
  Utensils,
  Map as MapIcon,
  List as ListIcon,
  Navigation,
  Compass,
  CheckCircle2,
  AlertCircle,
  GitMerge,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { setCustomLocation } = useLocationStore();
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [detectingGps] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(15);
  const [targetPrice, setTargetPrice] = useState<number>(500);

  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"split" | "list" | "map" | "pipeline">("split");


  useEffect(() => {
    fetchChennaiLocalities().then((data) => {
      setLocalities(data);
    });

    // Auto-GPS detection removed to prevent prompting without user interaction.
    // GPS will only be requested when the user clicks "Enable GPS & Location Alerts".

    // Check Database TTL Cache on refresh for signed-in user
    const userId = user?.id || "demo_user";
    fetchLatestCachedRecommendations(userId).then((cachedResults) => {
      if (cachedResults) {
        setResults(cachedResults);
        setSearchQuery(cachedResults.query);
        if (cachedResults.user_location) {
          setSelectedLocality(cachedResults.user_location.name);
          setUserCoords({
            lat: cachedResults.user_location.latitude,
            lon: cachedResults.user_location.longitude,
          });
          setCustomLocation(
            cachedResults.user_location.latitude,
            cachedResults.user_location.longitude,
            cachedResults.user_location.name
          );
        }
      } else {
        // No cache found on login/first-load -> Prompt the user to set their live location
        setIsLocationModalOpen(true);
      }
    });
  }, [user]);

  const handleDetectLocation = () => {
    setIsLocationModalOpen(true);
  };

  const handleLocationGranted = async (coords: { lat: number; lon: number }) => {
    setUserCoords(coords);
    setIsGpsActive(true);
    setError(null);
    let detectedLocality = "";
    try {
      const detected = await detectNearestLocality(coords.lat, coords.lon);
      detectedLocality = detected.locality;
      setSelectedLocality(detectedLocality);
      setCustomLocation(coords.lat, coords.lon, detectedLocality);
    } catch (err) {
      console.warn("Could not match exact locality name:", err);
      detectedLocality = "Live GPS Location";
      setCustomLocation(coords.lat, coords.lon, detectedLocality);
    }

    // Auto-discover based on dataset if this is the first load (no results yet)
    if (!results) {
      const defaultQuery = "Popular Top Rated Restaurants";
      setSearchQuery(defaultQuery);
      setLoading(true);
      try {
        const res = await getRecommendations({
          query: defaultQuery,
          location_name: detectedLocality !== "Live GPS Location" ? detectedLocality : undefined,
          user_lat: coords.lat,
          user_lon: coords.lon,
          max_distance_km: maxDistanceKm,
          target_price: targetPrice,
          top_k: 10,
          user_id: user?.id || "demo_user",
        });
        setResults(res);
      } catch (err: any) {
        setError(err.message || "Could not fetch initial recommendations.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();

    const queryToUse = customQuery !== undefined ? customQuery : searchQuery;
    if (!queryToUse.trim()) {
      setError("Please enter the type of restaurant or food you are aiming for.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loc = localities.find((l) => l.name === selectedLocality);
      const lat = userCoords?.lat ?? loc?.latitude;
      const lon = userCoords?.lon ?? loc?.longitude;

      const res = await getRecommendations({
        query: queryToUse,
        location_name: selectedLocality || undefined,
        user_lat: lat,
        user_lon: lon,
        max_distance_km: maxDistanceKm,
        target_price: targetPrice,
        top_k: 10,
        user_id: user?.id || "demo_user",
      });
      setResults(res);
    } catch (err: any) {
      setError(err.message || "Could not fetch recommendations. Please check server connection.");
    } finally {
      setLoading(false);
    }
  };


  const currentCenter: [number, number] = userCoords
    ? [userCoords.lat, userCoords.lon]
    : results?.user_location
    ? [results.user_location.latitude, results.user_location.longitude]
    : [13.0418, 80.2341];

  const categoryChips = [
    { label: "Biryani & Kebabs", query: "Authentic Hyderabadi Mutton Biryani and Kebabs", icon: "🍛" },
    { label: "South Indian Tiffin", query: "Traditional South Indian Filter Coffee, Crispy Dosa, Pongal", icon: "☕" },
    { label: "Chettinad Spicy", query: "Spicy Chettinad Chicken Gravy and Parotta", icon: "🌶️" },
    { label: "Pizza & Italian", query: "Woodfired Pizza, Creamy Pasta, Italian Cafe", icon: "🍕" },
    { label: "Burgers & Fast Food", query: "Juicy Chicken Burgers, Peri Peri Fries, Fast Food", icon: "🍔" },
    { label: "Arabian & Shawarma", query: "Chicken Shawarma, Mandi, Arabian Barbecue", icon: "🥙" },
    { label: "Chinese & Asian", query: "Fried Rice, Momos, Dragon Chicken, Chinese Noodles", icon: "🍜" },
    { label: "North Indian Thali", query: "Paneer Butter Masala, Garlic Naan, North Indian Thali", icon: "🍲" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/70 to-slate-900 border border-purple-900/40 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> PostGIS + OpenStreetMap Live + Qwen AI Pipeline
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Chennai AI Dining Concierge
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Enable live GPS sharing with email verification alerts to discover 12,000+ Kaggle & live OpenStreetMap restaurants 
            deduplicated, spatial-indexed, and ranked with Hugging Face Qwen 72B explanations.
          </p>
        </div>
      </div>

      {/* Main Search & Location Control Card */}
      <form
        onSubmit={handleSearch}
        className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6"
      >
        {/* Step 1: Location Prompt Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isGpsActive ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-purple-950 text-purple-300 border-purple-800"}`}>
              <Navigation className={`w-5 h-5 ${isGpsActive ? "animate-spin" : ""}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Target GIS Location</span>
                {isGpsActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Live GPS & Email Alerts Active
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-white mt-0.5">
                {selectedLocality ? `Location set to ${selectedLocality}` : "Detect location to begin search"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detectingGps}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 shrink-0"
          >
            {detectingGps ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
            <span>{detectingGps ? "Detecting GPS..." : "Enable GPS & Location Alerts"}</span>
          </button>
        </div>

        {/* Step 2: Natural Language Query Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            What type of restaurant or food are you aiming for?
          </label>
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-amber-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Authentic Chettinad Biryani, South Indian Breakfast, Italian Pasta Cafe..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-12 pr-32 py-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Find Matches</span>
            </button>
          </div>
        </div>

        {/* Step 3: GIS Location Selector & Distance/Price Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" /> Or Select Chennai Neighborhood
            </label>
            <select
              value={selectedLocality}
              onChange={(e) => {
                const name = e.target.value;
                setSelectedLocality(name);
                setIsGpsActive(false);
                const loc = localities.find((l) => l.name === name);
                if (loc) {
                  setUserCoords({ lat: loc.latitude, lon: loc.longitude });
                  setCustomLocation(loc.latitude, loc.longitude, name);
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {localities.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.latitude.toFixed(3)}, {loc.longitude.toFixed(3)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Search Radius
              </label>
              <span className="text-xs font-bold text-indigo-400">{maxDistanceKm} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target Budget (for 2)
              </label>
              <span className="text-xs font-bold text-emerald-400">₹{targetPrice}</span>
            </div>
            <input
              type="range"
              min="150"
              max="2500"
              step="50"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </form>

      {/* Category Chips */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Or Tap a Dining Preference:
        </label>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {categoryChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => {
                setSearchQuery(chip.query);
                handleSearch(undefined, chip.query);
              }}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>{chip.icon}</span>
              <span className="font-medium">{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-950/80 border border-red-800 text-red-200 p-4 rounded-2xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Search Notice:</span> {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800/60">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-sm text-slate-300 font-medium animate-pulse">
            Querying PostGIS spatial data, discovering live OpenStreetMap nodes, deduplicating candidates, & fetching Hugging Face explanations...
          </p>
        </div>
      )}

      {/* Initial Empty Guidance State */}
      {!loading && !results && (
        <div className="text-center py-16 px-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Start Your Chennai Dining Discovery</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Click <strong>"Enable GPS & Location Alerts"</strong> above or type the kind of restaurant/food you're craving 
            (e.g., <em>"Spicy Chettinad Mutton Biryani"</em>) to see AI recommendations, live OSM nodes, and PostGIS map pins.
          </p>
        </div>
      )}

      {/* Results View Section */}
      {!loading && results && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-400" /> Top {results.recommendations.length} Recommended Matches
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Center: <span className="text-emerald-400 font-medium">{results.user_location.name}</span>
              </span>

              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("split")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "split" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setActiveTab("map")}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                    activeTab === "map" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" /> Map Only
                </button>
                <button
                  onClick={() => setActiveTab("list")}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                    activeTab === "list" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" /> List Only
                </button>
                <button
                  onClick={() => setActiveTab("pipeline")}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                    activeTab === "pipeline" ? "bg-emerald-400 text-slate-950 font-bold" : "text-emerald-400 hover:text-emerald-300"
                  }`}
                >
                  <GitMerge className="w-3.5 h-3.5" /> 10-Step Pipeline Flow
                </button>
              </div>
            </div>
          </div>

          {/* View Modes */}
          {activeTab === "split" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 h-[600px] sticky top-6">
                <RecommendationMapView
                  center={currentCenter}
                  centerName={results.user_location.name}
                  radiusKm={maxDistanceKm}
                  restaurants={results.recommendations}
                  className="h-full w-full"
                />
              </div>

              <div className="lg:col-span-6 space-y-6 overflow-y-auto max-h-[600px] pr-1">
                {results.recommendations.map((restaurant, idx) => (
                  <RecommendationCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    rank={idx + 1}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "map" && (
            <div className="h-[650px] w-full">
              <RecommendationMapView
                center={currentCenter}
                centerName={results.user_location.name}
                radiusKm={maxDistanceKm}
                restaurants={results.recommendations}
                className="h-full w-full"
              />
            </div>
          )}

          {activeTab === "list" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.recommendations.map((restaurant, idx) => (
                <RecommendationCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  rank={idx + 1}
                />
              ))}
            </div>
          )}

          {activeTab === "pipeline" && (
            <PipelineInspector
              telemetry={results.pipeline_telemetry}
              userLocationName={results.user_location.name}
              isGpsActive={isGpsActive}
            />
          )}
        </div>
      )}

      {/* GPS Location Authorization Modal */}
      <LocationPermissionModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationGranted={handleLocationGranted}
        userDefaultEmail={user?.email}
      />
    </motion.div>
  );
};

