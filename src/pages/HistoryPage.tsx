import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { History, Compass, Trash2, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';

interface HistoryEntry {
  id: string;
  timestamp: string;
  query: string;
  location: string;
  radius_km: number;
  total_results: number;
  top_match: string;
}

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = user?.id || 'demo_user';
        const res = await api.get<{ history: HistoryEntry[] }>(`/recommendations/history?user_id=${userId}`);
        setHistory(res.data.history);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase mb-1">
            <History className="w-3.5 h-3.5" /> Discovery Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
            Recommendation & Search History
          </h1>
          <p className="text-sm text-muted-foreground">
            Chronological activity timeline of past recommendations and searches
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Trash2 className="w-4 h-4 text-destructive" />}
          onClick={() => console.log('clear history')}
        >
          Clear Activity
        </Button>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No history found. Go explore the map!
          </div>
        ) : (
          history.map((entry) => (
            <Card key={entry.id} hoverable className="transition-colors">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-5 h-5 text-accent" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">
                      {entry.query} <span className="text-muted-foreground font-normal">in {entry.location}</span>
                    </h3>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> 
                      {new Date(entry.timestamp).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Found {entry.total_results} results. Top match: {entry.top_match}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      Radius: {entry.radius_km} KM
                    </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary p-0 h-auto hover:bg-transparent"
                    onClick={() => navigate('/dashboard')}
                  >
                    Re-run Discovery
                  </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
