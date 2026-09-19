import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocationStore } from '@/stores/useLocationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { GeocodingService } from '@/services/geocoding.service';
import { Navigation, Search, Lock, LogIn } from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { currentLocation, detectLocation, isDetecting, setCustomLocation } =
    useLocationStore();
  const [searchAddress, setSearchAddress] = useState('');
  const [authError, setAuthError] = useState(false);

  const handleUseGps = async () => {
    if (!isAuthenticated) {
      setAuthError(true);
      return;
    }
    setAuthError(false);
    await detectLocation();
    onClose();
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchAddress.trim()) {
      const res = await GeocodingService.geocodeAddress(searchAddress.trim());
      setCustomLocation(res.lat, res.lng, res.address);
      onClose();
    }
  };

  const handleNavigateLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Set Discovery Location"
      description="Restaurants and recommendations will be discovered within radius of your selected point."
      maxWidth="md"
    >
      <div className="space-y-6 pt-2">
        {/* Auth Required Notice for GPS */}
        {authError && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Sign in required to access Live Device GPS coordinates.</span>
            </div>
            <Button size="sm" variant="primary" onClick={handleNavigateLogin} leftIcon={<LogIn className="w-3.5 h-3.5" />}>
              Sign In
            </Button>
          </div>
        )}

        {/* GPS Live Button */}
        <Button
          variant={currentLocation.isLiveGps ? 'primary' : 'outline'}
          className={`w-full justify-start gap-3 h-14 shadow-sm relative ${
            !isAuthenticated ? 'opacity-85 border-amber-500/40 bg-amber-500/5' : ''
          }`}
          isLoading={isDetecting}
          leftIcon={
            !isAuthenticated ? (
              <Lock className="w-5 h-5 text-amber-500 shrink-0" />
            ) : (
              <Navigation className="w-5 h-5 text-primary shrink-0" />
            )
          }
          onClick={handleUseGps}
        >
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Use Live Browser GPS</span>
              {!isAuthenticated && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                  Sign In Required
                </span>
              )}
            </div>
            <span className="text-[11px] opacity-80 font-normal">
              {!isAuthenticated
                ? 'Sign in to allow automated device sensor location detection'
                : 'Automatically detect position via device sensors'}
            </span>
          </div>
        </Button>

        {/* Manual Address Input */}
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <Input
            placeholder="Enter city, neighborhood, or street address..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            rightIcon={
              <Button type="submit" size="sm" variant="ghost">
                Set
              </Button>
            }
          />
        </form>
      </div>
    </Dialog>
  );
};


