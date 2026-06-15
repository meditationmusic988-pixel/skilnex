import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy, Award, Star, PlayCircle,
  TrendingUp, Brain, Zap
} from "lucide-react";
import { useLocation } from "wouter";
import type { ParsedRoadmap } from "@/utils/roadmap";

interface StatsOverviewProps {
  isPhase2: boolean;
  completedCount: number;
  totalCourses: number;
  hasAssessment: boolean;
  inProgressCount: number;
  onAssessmentClick: () => void;
  roadmap?: ParsedRoadmap | null; // already parsed by Dashboard
}

// Animated score ring — same as SkillTest
function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 36, circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setOffset(((100 - score) / 100) * circ), 200);
    return () => clearTimeout(t);
  }, [score, circ]);
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="-rotate-90 w-full h-full" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{score}</span>
        <span className="text-[10px] text-slate-500">/100</span>
      </div>
    </div>
  );
}

function MiniBar({ value, color, label }: { value: number; color: string; label: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 300); return () => clearTimeout(t); }, [value]);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-semibold text-white">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
        <div className="h-full rounded-full"
          style={{ width: `${w}%`, background: color, transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  accentClass: string;
  iconBgClass: string;
  onClick?: () => void;
}

const StatCard = React.memo(function StatCard({ icon, value, label, accentClass, iconBgClass, onClick }: StatCardProps) {
  return (
    <Card
      className={`relative overflow-hidden bg-slate-800/60 border-slate-700/60 transition-colors ${onClick ? "cursor-pointer hover:border-purple-500/40" : ""}`}
      onClick={onClick}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${accentClass}`} />
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-white leading-none">{value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export const StatsOverview = React.memo(function StatsOverview({
  isPhase2,
  completedCount,
  totalCourses,
  hasAssessment,
  inProgressCount,
  onAssessmentClick,
  roadmap,
}: StatsOverviewProps) {
  const [, setLocation] = useLocation();

  const score = roadmap?.skill_score ?? 0;
  const scoreColor = score < 40 ? "#ef4444" : score < 65 ? "#f59e0b" : "#22c55e";

  const levelBadgeClass = (l: string) =>
    l === "Beginner" ? "bg-amber-500/15 text-amber-300 border-amber-500/25" :
    l === "Advanced" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" :
    "bg-blue-500/15 text-blue-300 border-blue-500/25";

  return (
    <div className="space-y-3">

      {/* Skill Test Result — Score + Breakdown only (career/income/courses in AIRoadmapSection) */}
      {hasAssessment && roadmap && score > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-[#0D1626]">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

          {/* Header */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-white/5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/25 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-white font-bold text-sm">AI Skill Score</p>
            <button
              onClick={onAssessmentClick}
              className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-semibold transition-colors"
            >
              <Zap className="w-3 h-3" /> Update
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Score Ring + Level + Motivation */}
            <div className="flex items-center gap-5">
              <ScoreRing score={score} color={scoreColor} />
              <div className="flex-1 min-w-0">
                {roadmap.skill_level && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border mb-2 ${levelBadgeClass(roadmap.skill_level)}`}>
                    <Award className="w-3 h-3" /> {roadmap.skill_level}
                  </span>
                )}
                {roadmap.motivation && (
                  <p className="text-slate-400 text-xs italic leading-relaxed line-clamp-2">
                    "{roadmap.motivation}"
                  </p>
                )}
              </div>
            </div>

            {/* Skill Breakdown bars */}
            {roadmap.confidence_scores && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Skill Breakdown
                </p>
                <MiniBar label="Technical Skills"  value={roadmap.confidence_scores.technical        ?? 0} color="#3b82f6" />
                <MiniBar label="Career Mindset"    value={roadmap.confidence_scores.mindset          ?? 0} color="#22c55e" />
                <MiniBar label="Market Awareness"  value={roadmap.confidence_scores.market_awareness ?? 0} color="#f59e0b" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          accentClass={isPhase2 ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-gradient-to-r from-yellow-500 to-orange-500"}
          iconBgClass={isPhase2 ? "bg-purple-600/20" : "bg-yellow-600/20"}
          icon={<Trophy className={`w-4 h-4 ${isPhase2 ? "text-purple-300" : "text-yellow-400"}`} />}
          value={<span className={`text-base font-bold ${isPhase2 ? "text-purple-200" : "text-yellow-300"}`}>{isPhase2 ? "1 Lakh" : "35,000"}</span>}
          label={isPhase2 ? "Mega Giveaway" : "Phase 1 Prize"}
        />
        <StatCard
          accentClass="bg-gradient-to-r from-emerald-500 to-green-400"
          iconBgClass="bg-emerald-600/20"
          icon={<Award className="w-4 h-4 text-emerald-400" />}
          value={<>{completedCount}<span className="text-slate-500 text-sm font-normal">/{totalCourses}</span></>}
          label="Completed"
        />
        <StatCard
          accentClass={hasAssessment ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-yellow-500 to-amber-400"}
          iconBgClass={hasAssessment ? "bg-emerald-600/20" : "bg-yellow-600/20"}
          icon={<Star className={`w-4 h-4 ${hasAssessment ? "text-emerald-400" : "text-yellow-400"}`} />}
          value={hasAssessment ? "✓" : "?"}
          label={hasAssessment ? "AI Done" : "Take Test"}
          onClick={!hasAssessment ? onAssessmentClick : undefined}
        />
        <StatCard
          accentClass="bg-gradient-to-r from-indigo-500 to-purple-500"
          iconBgClass="bg-indigo-600/20"
          icon={<PlayCircle className="w-4 h-4 text-indigo-400" />}
          value={inProgressCount}
          label="In Progress"
        />
      </div>
    </div>
  );
});
