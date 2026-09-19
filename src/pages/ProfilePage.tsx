import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFilterStore } from '@/stores/useFilterStore';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Avatar,
  Badge,
  Slider,
  Switch,
  Toast,
} from '@/components/ui';
import { User, Mail, Sparkles, Sliders, CheckCircle2, LogOut, ShieldCheck } from 'lucide-react';
import { PriceLevel } from '@/types';

export const ProfilePage: React.FC = () => {
  const { user, updatePreferences, logout } = useAuthStore();
  const { setRadiusKm } = useFilterStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const ALL_CUISINES = ['Italian', 'Japanese', 'Indian', 'Mexican', 'Vegan', 'Chinese', 'Thai', 'American'];
  const BUDGET_LEVELS: PriceLevel[] = ['$', '$$', '$$$', '$$$$'];
  const DIETARY_OPTIONS = ['Vegetarian Friendly', 'Gluten Free', 'Halal', 'Kosher'];

  const preferences = user?.preferences || {
    preferredCuisines: ['Italian', 'Japanese', 'Indian'],
    budgetRange: ['$', '$$', '$$$'],
    defaultRadiusKm: 3.0,
    dietaryRestrictions: ['Vegetarian Friendly'],
    autoDetectLocation: true,
  };

  const [cuisines, setCuisines] = useState<string[]>(preferences.preferredCuisines);
  const [budgets, setBudgets] = useState<PriceLevel[]>(preferences.budgetRange);
  const [radius, setRadius] = useState<number>(preferences.defaultRadiusKm);
  const [dietary, setDietary] = useState<string[]>(preferences.dietaryRestrictions);
  const [autoDetect, setAutoDetect] = useState<boolean>(preferences.autoDetectLocation);

  const toggleCuisine = (c: string) => {
    setCuisines((prev) => (prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]));
  };

  const toggleBudget = (b: PriceLevel) => {
    setBudgets((prev) => (prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]));
  };

  const toggleDietary = (d: string) => {
    setDietary((prev) => (prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    await updatePreferences({
      preferredCuisines: cuisines,
      budgetRange: budgets,
      defaultRadiusKm: radius,
      dietaryRestrictions: dietary,
      autoDetectLocation: autoDetect,
    });
    setRadiusKm(radius);
    setIsSaving(false);
    setToastMessage('Dining profile & AI preferences updated in PostgreSQL!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8 pb-24"
    >
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50">
          <Toast
            id="profile-toast"
            type="success"
            title="Preferences Saved"
            message={toastMessage}
            onDismiss={() => setToastMessage(null)}
          />
        </div>
      )}

      {/* Profile Header */}
      <Card className="glass-panel border-primary/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar src={user?.avatarUrl} fallback={user?.name || 'User'} size="lg" className="w-20 h-20 border-2 border-primary shadow-md" />
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-bold font-heading text-foreground">{user?.name || 'Anand Raj'}</h1>
                <Badge variant="success" className="w-fit mx-auto sm:mx-0">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Explorer
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user?.email || 'anand.engineer@gourmetai.io'}</p>
              <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                <Badge variant="default">{radius} KM Default Radius</Badge>
                <Badge variant="accent">{cuisines.length} Preferred Cuisines</Badge>
              </div>
            </div>

            <Button variant="outline" size="sm" leftIcon={<LogOut className="w-4 h-4" />} onClick={logout}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info Form */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Personal Information
          </CardTitle>
          <CardDescription>Update your public account display details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" defaultValue={user?.name || 'Anand Raj'} leftIcon={<User className="w-4 h-4" />} />
          <Input label="Email Address" defaultValue={user?.email || 'anand.engineer@gourmetai.io'} leftIcon={<Mail className="w-4 h-4" />} />
        </CardContent>
      </Card>

      {/* Dining & AI Preferences Manager */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sliders className="w-5 h-5 text-accent" /> AI Recommendation Preferences
              </CardTitle>
              <CardDescription>Configure scoring weights stored in PostgreSQL</CardDescription>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
                isLoading={isSaving}
                onClick={handleSavePreferences}
                className="shadow-md shadow-primary/20"
              >
                Save Preferences
              </Button>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Cuisines Selector */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preferred Cuisines (Multi-select)
            </span>
            <div className="flex flex-wrap gap-2">
              {ALL_CUISINES.map((c) => {
                const isSelected = cuisines.includes(c);
                return (
                  <motion.button
                    key={c}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => toggleCuisine(c)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                        : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    {c}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Budget Selector */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preferred Budget Tier ($ to $$$$)
            </span>
            <div className="grid grid-cols-4 gap-3 max-w-md">
              {BUDGET_LEVELS.map((b) => {
                const isSelected = budgets.includes(b);
                return (
                  <motion.button
                    key={b}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => toggleBudget(b)}
                    className={`py-2.5 rounded-xl text-sm font-bold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {b}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Default Search Radius Slider */}
          <div className="max-w-md space-y-2">
            <Slider
              label="Default GIS Search Radius"
              value={radius}
              onValueChange={setRadius}
              min={0.5}
              max={10.0}
              step={0.5}
              unit="KM"
            />
            <p className="text-xs text-muted-foreground">
              Default search radius used during automated restaurant map discovery.
            </p>
          </div>

          {/* Dietary Restrictions Checklist */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dietary & Lifestyle Needs
            </span>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((d) => {
                const isSelected = dietary.includes(d);
                return (
                  <motion.button
                    key={d}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => toggleDietary(d)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {d}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Auto Detect Location Switch */}
          <div className="pt-2 border-t border-border">
            <Switch
              checked={autoDetect}
              onCheckedChange={setAutoDetect}
              label="Auto-detect Browser GPS Location on Launch"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

