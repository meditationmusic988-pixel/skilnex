import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy, Award, Star, PlayCircle, TrendingUp,
  Brain, ChevronRight, Target, DollarSign,
  BookOpen, CheckCircle2, Zap
} from "lucide-react";
import { useLocation } from "wouter";

interface RoadmapResult {
  skill_level: string;
  skill_score: number;
  confidence_scores: { technical: number; mindset: number; market_awareness: number };
  strengths: string[];
  gaps: string[];
  recommended_courses: string[];
  career_paths: string[];
  expected_income: string;
  timeline: string;
  learning_order: string[];
  motivation: string;
}

interface StatsOverviewProps {
  isPhase2: boolean;
  completedCount: number;
  totalCourses: number;
  hasAssessment: boolean;
  inProgressCount: number;
  onAssessmentClick: () => void;
  roadmapResult?: RoadmapResult | null;
}

// ── Animated score ring (same as SkillTest) ──
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

// ── Thin progress bar ──
function MiniBar({ value, color }: { value: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 300); return () => clearTimeout(t); }, [value]);
  return (
    <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${w}%`, background: color, transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)" }} />
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
  roadmapResult,
}: StatsOverviewProps) {
  const [, setLocation] = useLocation();

  const scoreColor = (s: number) => s < 40 ? "#ef4444" : s < 65 ? "#f59e0b" : "#22c55e";
  const levelBadge = (l: string) =>
    l === "Beginner" ? "bg-amber-500/15 text-amber-300 border-amber-500/25" :
    l === "Advanced" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" :
    "bg-blue-500/15 text-blue-300 border-blue-500/25";

  return (
    <div className="space-y-3">

      {/* ── Skill Test Result Card — same data as SkillTest Phase 4 ── */}
      {hasAssessment && roadmapResult ? (
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-[#0D1626]">
          {/* top accent */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

          {/* Header row */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-white/5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/25 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-white font-bold text-sm">AI Skill Assessment Result</p>
            <button
              onClick={() => setLocation("/skill-test")}
              className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-semibold transition-colors"
            >
              Full View <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 space-y-5">

            {/* Score + Level + Motivation */}
            <div className="flex items-center gap-5">
              <ScoreRing
                score={roadmapResult.skill_score ?? 0}
                color={scoreColor(roadmapResult.skill_score ?? 0)}
              />
              <div className="flex-1 min-w-0">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border mb-2 ${levelBadge(roadmapResult.skill_level ?? "")}`}>
                  <Award className="w-3 h-3" /> {roadmapResult.skill_level}
                </span>
                <p className="text-slate-400 text-xs italic leading-relaxed line-clamp-2">
                  "{roadmapResult.motivation}"
                </p>
              </div>
            </div>

            {/* Skill Breakdown bars */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" /> Skill Breakdown
              </p>
              <div className="space-y-2">
                {[
                  { label: "Technical Skills",  value: roadmapResult.confidence_scores?.technical ?? 50,        color: "#3b82f6" },
                  { label: "Career Mindset",    value: roadmapResult.confidence_scores?.mindset ?? 50,          color: "#22c55e" },
                  { label: "Market Awareness",  value: roadmapResult.confidence_scores?.market_awareness ?? 50, color: "#f59e0b" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="text-xs font-semibold text-white">{value}%</span>
                    </div>
                    <MiniBar value={value} color={color} />
                  </div>
                ))}
              </div>
            </div>

            {/* Career Paths + Income */}
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Career paths */}
              {(roadmapResult.career_paths ?? []).length > 0 && (
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Target className="w-3 h-3" /> Career Paths
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(roadmapResult.career_paths ?? []).map((p, i) => (
                      <span key={i} className="bg-blue-600/15 border border-blue-500/25 text-blue-300 text-[11px] font-medium px-2.5 py-1 rounded-full">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Income */}
              {roadmapResult.expected_income && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-900/10 p-3">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3 h-3" /> Expected Income
                  </p>
                  <p className="text-white font-black text-sm leading-tight">{roadmapResult.expected_income}</p>
                  {roadmapResult.timeline && (
                    <p className="text-emerald-400 text-xs mt-1">{roadmapResult.timeline}</p>
                  )}
                </div>
              )}
            </div>

            {/* Strengths + Gaps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-3">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3" /> Strengths
                </p>
                <div className="space-y-1.5">
                  {(roadmapResult.strengths ?? []).slice(0, 2).map((s, i) => (
                    <p key={i} className="text-xs text-emerald-200/80 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" /> {s}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                  <Target className="w-3 h-3" /> Improve Karo
                </p>
                <div className="space-y-1.5">
                  {(roadmapResult.gaps ?? []).slice(0, 2).map((g, i) => (
                    <p key={i} className="text-xs text-amber-200/80 flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" /> {g}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Courses */}
            {(roadmapResult.recommended_courses ?? []).length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3 h-3" /> Recommended Courses
                </p>
                <div className="space-y-2">
                  {(roadmapResult.recommended_courses ?? []).slice(0, 3).map((course, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
                      <span className="w-5 h-5 rounded-full bg-blue-600/25 text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-xs text-white font-medium leading-snug">{course}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA to retake */}
            <button
              onClick={onAssessmentClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-500/25 text-blue-400 text-xs font-semibold hover:bg-blue-900/20 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" /> Dobara Test Do — Update Karo
            </button>
          </div>
        </div>
      ) : hasAssessment ? (
        /* Assessment done but roadmap not loaded yet — simple placeholder */
        <div className="rounded-2xl border border-blue-500/20 bg-[#0D1626] p-5 text-center">
          <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-white font-bold text-sm mb-1">AI Assessment Complete ✓</p>
          <button onClick={() => setLocation("/skill-test")} className="text-blue-400 text-xs hover:underline">
            Apna result dekho →
          </button>
        </div>
      ) : null}

      {/* ── 4 stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Giveaway */}
        <StatCard
          accentClass={isPhase2 ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-gradient-to-r from-yellow-500 to-orange-500"}
          iconBgClass={isPhase2 ? "bg-purple-600/20" : "bg-yellow-600/20"}
          icon={<Trophy className={`w-4 h-4 ${isPhase2 ? "text-purple-300" : "text-yellow-400"}`} />}
          value={<span className={`text-base font-bold ${isPhase2 ? "text-purple-200" : "text-yellow-300"}`}>{isPhase2 ? "1 Lakh" : "35,000"}</span>}
          label={isPhase2 ? "Mega Giveaway" : "Phase 1 Prize"}
        />
        {/* Completed */}
        <StatCard
          accentClass="bg-gradient-to-r from-emerald-500 to-green-400"
          iconBgClass="bg-emerald-600/20"
          icon={<Award className="w-4 h-4 text-emerald-400" />}
          value={<>{completedCount}<span className="text-slate-500 text-sm font-normal">/{totalCourses}</span></>}
          label="Completed"
        />
        {/* AI Test */}
        <StatCard
          accentClass={hasAssessment ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-yellow-500 to-amber-400"}
          iconBgClass={hasAssessment ? "bg-emerald-600/20" : "bg-yellow-600/20"}
          icon={<Star className={`w-4 h-4 ${hasAssessment ? "text-emerald-400" : "text-yellow-400"}`} />}
          value={hasAssessment ? "✓" : "?"}
          label={hasAssessment ? "AI Done" : "Take Test"}
          onClick={!hasAssessment ? onAssessmentClick : undefined}
        />
        {/* In Progress */}
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
