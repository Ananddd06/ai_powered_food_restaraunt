import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Switch, Button, Toast } from '@/components/ui';
import { Settings, Moon, Sun, Monitor, MapPin, Bell, ShieldCheck, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [locationPermission, setLocationPermission] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClearCache = () => {
    localStorage.clear();
    setToastMessage('Local storage & cache cleared successfully!');
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8 pb-24">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50">
          <Toast
            id="settings-toast"
            type="success"
            title="Settings Updated"
            message={toastMessage}
            onDismiss={() => setToastMessage(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold uppercase mb-1">
          <Settings className="w-3.5 h-3.5" /> Preferences & System
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
          Application Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage system theme, location permissions, and offline data storage
        </p>
      </div>

      {/* Theme Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" /> Theme Appearance
          </CardTitle>
          <CardDescription>Select your preferred color theme for the interface and map tiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="text-sm">Light Mode</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="text-sm">Dark Mode (CartoDB Dark)</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all cursor-pointer ${
                theme === 'system'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="w-6 h-6" />
              <span className="text-sm">System Preference</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Permissions & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Privacy & GIS Permissions
          </CardTitle>
          <CardDescription>Control browser geolocation prompts and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Browser Geolocation Sensor Access
              </span>
              <p className="text-xs text-muted-foreground">
                Allows automated detection of current GPS coordinates for 3.0 KM radius calculation
              </p>
            </div>
            <Switch checked={locationPermission} onCheckedChange={setLocationPermission} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent" /> Recommendation Push Notifications
              </span>
              <p className="text-xs text-muted-foreground">
                Receive notifications when dining options matching your preferences are nearby
              </p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Storage & Clear Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" /> Data Storage & Mock Adapter
          </CardTitle>
          <CardDescription>Clear saved client storage and reset application state</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Clear Local Saved Data</p>
            <p className="text-xs text-muted-foreground">
              Resets saved favorite restaurants, search history, and theme settings stored in browser.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearCache}>
            Clear Local Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
