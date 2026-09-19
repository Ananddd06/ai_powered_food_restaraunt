import React from "react";
import { ScoreBreakdown } from "../../services/recommendationService";

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdown;
}

export const ScoreBreakdownBadge: React.FC<ScoreBreakdownProps> = ({ breakdown }) => {
  return (
    <div className="bg-slate-900/90 text-slate-100 border border-slate-700/60 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2 mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
          Match Breakdown
        </span>
        <span className="text-lg font-bold text-emerald-400">
          {breakdown.total_score}% Match
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between items-center bg-slate-800/60 rounded-lg px-2.5 py-1.5 border border-slate-700/30">
          <span className="text-slate-400">Semantic Sim (40%)</span>
          <span className="font-medium text-cyan-300">{breakdown.semantic_similarity}%</span>
        </div>
        <div className="flex justify-between items-center bg-slate-800/60 rounded-lg px-2.5 py-1.5 border border-slate-700/30">
          <span className="text-slate-400">GIS Distance (25%)</span>
          <span className="font-medium text-indigo-300">{breakdown.distance_score}%</span>
        </div>
        <div className="flex justify-between items-center bg-slate-800/60 rounded-lg px-2.5 py-1.5 border border-slate-700/30">
          <span className="text-slate-400">Rating (20%)</span>
          <span className="font-medium text-amber-300">{breakdown.rating_score}%</span>
        </div>
        <div className="flex justify-between items-center bg-slate-800/60 rounded-lg px-2.5 py-1.5 border border-slate-700/30">
          <span className="text-slate-400">Price Match (10%)</span>
          <span className="font-medium text-emerald-300">{breakdown.price_score}%</span>
        </div>
      </div>

      <div className="mt-2 text-right">
        <span className="text-[10px] text-slate-400">
          Popularity Factor (5%): {breakdown.popularity_score}%
        </span>
      </div>
    </div>
  );
};
