import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocationStore } from '@/stores/useLocationStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { LocationPickerModal } from './LocationPickerModal';
import { Avatar } from '@/components/ui/Avatar';
import {
  Sparkles,
  Sun,
  Moon,
  Monitor,
  MapPin,
  Compass,
  Heart,
  History,
  User,
  Menu,
  X,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const { user } = useAuthStore();
  const { currentLocation } = useLocationStore();
  const { favorites } = useFavoritesStore();
  const { filters } = useFilterStore();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Active filters count
  const activeFiltersCount =
    (filters.searchQuery ? 1 : 0) +
    filters.cuisines.length +
    filters.priceLevels.length +
    (filters.openNowOnly ? 1 : 0) +
    filters.dietary.length +
    (filters.minRating > 0 ? 1 : 0);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 glass-panel">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg leading-none tracking-tight text-foreground">
                Gourmet<span className="text-primary">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase mt-0.5">
                GIS Dining Discovery
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Map
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Link>

            <Link
              to="/favorites"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/favorites')
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Heart className="w-4 h-4" />
              Favorites
              {favorites.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold">
                  {favorites.length}
                </span>
              )}
            </Link>

            <Link
              to="/history"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/history')
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </Link>

            <Link
              to="/design-system"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/design-system')
                  ? 'bg-secondary text-foreground font-bold'
                  : 'text-muted-foreground/80 hover:text-foreground hover:bg-muted/60'
              }`}
            >
              Design System
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* GIS Location Picker Button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium border border-border/60 hover:bg-muted transition-all max-w-[160px] sm:max-w-[220px] truncate cursor-pointer shadow-xs"
              title="Change Discovery Location"
            >
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0 animate-bounce" />
              <span className="truncate">
                {currentLocation.address || 'San Francisco'} ({filters.radiusKm} KM)
              </span>
            </button>

            {/* Theme Switcher Toggle */}
            <div className="hidden sm:flex items-center bg-muted/80 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Light Theme"
                aria-label="Light Theme"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Dark Theme"
                aria-label="Dark Theme"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  theme === 'system'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="System Theme"
                aria-label="System Theme"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Avatar / Auth Buttons */}
            {user ? (
              <Link to="/profile" title="User Profile" className="flex items-center gap-2">
                <Avatar
                  src={user?.avatarUrl}
                  fallback={user?.name || 'User'}
                  size="sm"
                  className="hover:ring-2 hover:ring-primary hover:ring-offset-1 transition-all"
                />
                <span className="hidden sm:inline text-xs font-semibold text-foreground">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors border border-border/60"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
                >
                  Sign Up
                </Link>
              </div>
            )}


            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { favorites } = useFavoritesStore();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 glass-panel px-4 py-2">
      <div className="flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium ${
            isActive('/') ? 'text-primary font-bold' : 'text-muted-foreground'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          Home
        </Link>
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium ${
            isActive('/dashboard') ? 'text-primary font-bold' : 'text-muted-foreground'
          }`}
        >
          <Compass className="w-5 h-5" />
          Map
        </Link>
        <Link
          to="/favorites"
          className={`relative flex flex-col items-center gap-1 p-1 text-[11px] font-medium ${
            isActive('/favorites') ? 'text-primary font-bold' : 'text-muted-foreground'
          }`}
        >
          <Heart className="w-5 h-5" />
          Favorites
          {favorites.length > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-accent animate-ping" />
          )}
        </Link>
        <Link
          to="/history"
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium ${
            isActive('/history') ? 'text-primary font-bold' : 'text-muted-foreground'
          }`}
        >
          <History className="w-5 h-5" />
          History
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium ${
            isActive('/profile') ? 'text-primary font-bold' : 'text-muted-foreground'
          }`}
        >
          <User className="w-5 h-5" />
          Profile
        </Link>
      </div>
    </div>
  );
};
