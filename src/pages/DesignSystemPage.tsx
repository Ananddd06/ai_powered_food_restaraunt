import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Badge,
  Avatar,
  Skeleton,
  Switch,
  Slider,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Dialog,
  Drawer,
  Tabs,
  Accordion,
  Toast,
  EmptyState,
  ErrorState,
  Tooltip,
} from '@/components/ui';
import { Search, Sparkles, MapPin, SlidersHorizontal, Heart } from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [switchChecked, setSwitchChecked] = useState(true);
  const [sliderValue, setSliderValue] = useState(3.0);
  const [toastVisible, setToastVisible] = useState(true);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Phase 2 Component Showcase
        </div>
        <h1 className="text-3xl font-bold font-heading text-foreground">GourmetAI Design System & Component Library</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Production atomic UI component library adhering to WCAG AA accessibility, light/dark themes, and responsive design guidelines.
        </p>
      </div>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-foreground">1. Buttons & Action Trigger Variants</h2>
        <div className="flex flex-wrap items-center gap-4 p-6 rounded-2xl bg-card border border-border">
          <Button variant="primary" leftIcon={<Sparkles className="w-4 h-4" />}>
            Primary AI Action
          </Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline" leftIcon={<MapPin className="w-4 h-4" />}>
            Outline Map
          </Button>
          <Button variant="accent">Accent Highlight</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="primary" isLoading>
            Loading State
          </Button>
        </div>
      </section>

      {/* Form Controls */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-foreground">2. Inputs, Selects & Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-card border border-border">
          <Input
            label="Search Restaurant or Cuisine"
            placeholder="e.g. Italian, Sushi, Wood-fired Pizza..."
            leftIcon={<Search className="w-4 h-4" />}
            helperText="Search within 3 km GIS radius"
          />

          <Select
            label="Filter by Cuisine Category"
            options={[
              { value: 'all', label: 'All Cuisines' },
              { value: 'italian', label: 'Italian & Pasta' },
              { value: 'japanese', label: 'Japanese & Sushi' },
              { value: 'indian', label: 'Indian Curries' },
            ]}
          />

          <div className="space-y-4">
            <Switch
              checked={switchChecked}
              onCheckedChange={setSwitchChecked}
              label="Open Now Only (Filter)"
            />

            <Slider
              label="Search Radius"
              value={sliderValue}
              onValueChange={setSliderValue}
              min={0.5}
              max={10}
              step={0.5}
              unit="KM"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tooltip Demonstration
            </span>
            <Tooltip content="Intelligent recommendation score derived from distance, rating & user profile">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 text-accent font-semibold text-xs cursor-help">
                <Sparkles className="w-3.5 h-3.5" /> Hover for AI Match Score Tooltip
              </span>
            </Tooltip>
          </div>
        </div>
      </section>

      {/* Badges & Avatars */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-foreground">3. Badges, Avatars & Status Indicators</h2>
        <div className="flex flex-wrap items-center gap-4 p-6 rounded-2xl bg-card border border-border">
          <Badge variant="default">AI Score 98%</Badge>
          <Badge variant="success">Open Now</Badge>
          <Badge variant="warning">3.0 KM Away</Badge>
          <Badge variant="accent">Top Choice</Badge>
          <Badge variant="destructive">Closed</Badge>
          <Badge variant="secondary">$$$ Price</Badge>

          <div className="flex items-center gap-3 border-l border-border pl-6">
            <Avatar fallback="Anand Raj" size="sm" />
            <Avatar fallback="Gourmet User" size="md" />
            <Avatar fallback="AI Assistant" size="lg" />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-foreground">4. Cards & Containers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hoverable>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Osteria Del Bella</CardTitle>
                  <CardDescription>Wood-fired Italian Pizza & Handmade Pasta</CardDescription>
                </div>
                <Badge variant="success">98% Match</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Authentic Neapolitan wood-fired pizzas and fresh handmade pasta in a cozy warm atmosphere.
              </p>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-xs font-semibold text-primary">0.8 KM Away</span>
              <Button size="sm" variant="primary">View Details</Button>
            </CardFooter>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle>Glassmorphism Panel</CardTitle>
              <CardDescription>Blur backdrop styled card container</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Designed for map floating overlays and overlay control panels.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tabs & Accordions */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-foreground">5. Navigation Tabs & Accordions</h2>
        <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
          <Tabs
            tabs={[
              { id: 'all', label: 'All Restaurants', badge: 24 },
              { id: 'favorites', label: 'Saved Favorites', icon: <Heart className="w-4 h-4" /> },
              { id: 'filters', label: 'Smart Filters', icon: <SlidersHorizontal className="w-4 h-4" /> },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <Accordion
            items={[
              {
                id: '1',
                title: 'How does the 3 KM GIS spatial search work?',
                children: 'The application queries your live GPS location or custom map center point and calculates distance using PostGIS spatial queries bounded strictly within a 3 km radius.',
              },
              {
                id: '2',
                title: 'What factors influence the AI Match Score?',
                children: 'Scores are computed using user cuisine preferences, dietary restrictions, budget matching, distance decay function, and real-time rating analysis.',
              },
            ]}
          />
        </div>
      </section>

      {/* Modals & Drawers */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-foreground">6. Modal Dialogs & Side Drawers</h2>
        <div className="flex gap-4 p-6 rounded-2xl bg-card border border-border">
          <Button onClick={() => setIsDialogOpen(true)}>Open Modal Dialog</Button>
          <Button variant="secondary" onClick={() => setIsDrawerOpen(true)}>Open Filter Drawer</Button>

          <Dialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            title="Restaurant Recommendation Explanation"
            description="Why GourmetAI selected this restaurant for you"
          >
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Osteria Del Bella matches your Italian cuisine preference with a 98% confidence score. It is located 0.8 km from your current GPS pin and is currently open.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => setIsDialogOpen(false)}>Save to Favorites</Button>
            </div>
          </Dialog>

          <Drawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            title="Advanced GIS Filters"
          >
            <div className="space-y-6">
              <Slider
                label="Maximum Radius"
                value={sliderValue}
                onValueChange={setSliderValue}
                min={0.5}
                max={10}
                unit="KM"
              />
              <Switch
                checked={switchChecked}
                onCheckedChange={setSwitchChecked}
                label="Vegetarian Friendly"
              />
            </div>
          </Drawer>
        </div>
      </section>

      {/* Skeletons, Empty & Error States */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-foreground">7. Feedback, Loading Skeletons & Error Handling</h2>
        <div className="space-y-6 p-6 rounded-2xl bg-card border border-border">
          {toastVisible && (
            <Toast
              id="1"
              type="success"
              title="Location Updated"
              message="GIS center updated to 3.0 KM radius near your current GPS position."
              onDismiss={() => setToastVisible(false)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 rounded-xl border border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Skeleton Loading Placeholders</p>
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>

            <EmptyState title="No Nearby Restaurants Found" actionLabel="Reset Search Radius" onAction={() => setSliderValue(5)} />
          </div>

          <ErrorState message="Failed to connect to GIS location service. Please verify location permissions." onRetry={() => console.log('retry')} />
        </div>
      </section>
    </div>
  );
};
