import React from "react";
import { motion } from "framer-motion";
import {
  Navigation,
  Database,
  Combine,
  Sparkles,
  Award,
  Cpu,
  Layers,
  CheckCircle,
  Clock,
  MapPin
} from "lucide-react";
import { PipelineTelemetry } from "../../services/recommendationService";

interface PipelineInspectorProps {
  telemetry?: PipelineTelemetry;
  userLocationName?: string;
  isGpsActive?: boolean;
}

export const PipelineInspector: React.FC<PipelineInspectorProps> = ({
  telemetry,
  userLocationName = "Chennai",
  isGpsActive = false,
}) => {
  const steps = [
    {
      id: "user_location",
      title: "User Location",
      desc: isGpsActive ? "Live GPS Coordinates Enabled" : `Selected Locality: ${userLocationName}`,
      icon: MapPin,
      badge: isGpsActive ? "GPS Active" : "Neighborhood",
      color: "from-blue-500 to-indigo-500",
    },
    {
      id: "browser_geolocation",
      title: "Browser Geolocation",
      desc: "HTML5 Navigator API (Lat / Lon)",
      icon: Navigation,
      badge: "HTML5 API",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "postgis_query",
      title: "PostGIS Query",
      desc: "ST_DWithin Spatial Radius Filter",
      icon: Database,
      badge: telemetry ? `${telemetry.postgis_local_count} Candidates` : "PostGIS SQL",
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "sources_split",
      title: "Dual-Source Discovery",
      desc: "Local Kaggle DB + Live OpenStreetMap Overpass",
      icon: Layers,
      badge: "Parallel",
      color: "from-cyan-500 to-blue-600",
      subItems: [
        { label: "Local Restaurant DB (Kaggle)", count: telemetry?.postgis_local_count ?? 40 },
        { label: "Live Discovery (OpenStreetMap / Overpass)", count: telemetry?.live_osm_count ?? 20 },
      ],
    },
    {
      id: "normalization",
      title: "Data Normalization",
      desc: "Schema & Attribute Standardization",
      icon: Combine,
      badge: "Cleaned",
      color: "from-amber-500 to-orange-500",
    },
    {
      id: "duplicate_detection",
      title: "Duplicate Detection & Merge",
      desc: "Spatial Proximity (<120m) & Name Matching",
      icon: Combine,
      badge: telemetry ? `${telemetry.duplicates_merged} Merged` : "Deduplicated",
      color: "from-rose-500 to-pink-500",
    },
    {
      id: "unified_candidates",
      title: "Unified Restaurant Candidates",
      desc: "Merged Candidate Pool Ready for AI",
      icon: Layers,
      badge: telemetry ? `${telemetry.unified_candidates} Candidates` : "Unified Pool",
      color: "from-emerald-400 to-green-500",
    },
    {
      id: "ai_recommendation_engine",
      title: "AI Recommendation Engine",
      desc: "Sentence Transformers / BGE Embeddings",
      icon: Cpu,
      badge: "FAISS Vector",
      color: "from-purple-600 to-pink-600",
    },
    {
      id: "recommendation_ranking",
      title: "Recommendation Ranking",
      desc: "5-Factor Hybrid Scoring (Semantic, Distance, Rating, Price, Popularity)",
      icon: Award,
      badge: "Top 5 Ranked",
      color: "from-amber-400 to-yellow-500",
    },
    {
      id: "hf_llm_explanation",
      title: "Hugging Face LLM Explanation",
      desc: "Qwen 72B Instruct Natural Language Rationales",
      icon: Sparkles,
      badge: "Qwen 72B",
      color: "from-teal-400 to-emerald-500",
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle className="w-3.5 h-3.5" /> End-to-End Architectural Pipeline Active
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            10-Step AI Discovery & PostGIS Workflow
          </h2>
        </div>

        {telemetry && (
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Total Execution:</span>
            <span className="font-bold text-emerald-400">{telemetry.execution_time_ms} ms</span>
          </div>
        )}
      </div>

      {/* Vertical Interactive Flow Diagram */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-purple-500 before:to-amber-500">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative flex items-start gap-4 group"
            >
              {/* Step indicator node */}
              <div className="absolute -left-6 top-1 w-7 h-7 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                <span className="text-[10px] font-black text-emerald-400">{idx + 1}</span>
              </div>

              {/* Step Content Card */}
              <div className="flex-1 bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition-all shadow-md">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${step.color} text-slate-950 font-bold`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-white">{step.title}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                    {step.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>

                {/* Optional Dual Source breakdown pill */}
                {step.subItems && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                    {step.subItems.map((sub, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-300 font-medium text-[11px]">{sub.label}</span>
                        <span className="font-bold text-amber-400">{sub.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
