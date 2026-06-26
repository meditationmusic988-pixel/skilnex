import React from "react";
import { ParsedRoadmap } from "@/types";
import { Course } from "@/types";
import { TrendingUp, DollarSign, Clock, BookOpen, Star, Zap, Target, Award } from "lucide-react";

interface AIRoadmapSectionProps {
  roadmap: ParsedRoadmap;
  matchedCourses: Course[];
  onImprove: () => void;
  onGetRoadmap: () => void;
}

/* ── Score card ── */
const SkillScoreCard = React.memo(function SkillScoreCard({
  roadmap,
}: {
  roadmap: ParsedRoadmap;
}) {
  if (!roadmap.skill_score && !roadmap.skill_level) return null;
  
  const score = roadmap.skill_score ?? 0;
  const scoreColor = score < 40 ? "text-red-400" : score < 65 ? "text-amber-400" : "text-emerald-400";
  const ringColor = score < 40 ? "stroke-red-500" : score < 65 ? "stroke-amber-500" : "stroke-emerald-500";
  
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="56" fill="none" stroke="#1E293B" strokeWidth="8" />
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            className={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>
      
      {roadmap.skill_level && (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
          roadmap.skill_level === "Beginner" 
            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
            : roadmap.skill_level === "Advanced"
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
        }`}>
          {roadmap.skill_level}
        </span>
      )}
      
      {roadmap.motivation && (
        <p className="text-slate-400 text-sm mt-3 italic">"{roadmap.motivation}"</p>
      )}
    </div>
  );
});

/* ── Skill Breakdown ── */
const SkillBreakdown = React.memo(function SkillBreakdown({
  roadmap,
}: {
  roadmap: ParsedRoadmap;
}) {
  const scores = roadmap.confidence_scores ?? { technical: 50, mindset: 50, market_awareness: 50 };
  
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4" />
        Skill Breakdown
      </h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Technical Skills</span>
            <span className="text-blue-400 font-bold">{scores.technical}%</span>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${scores.technical}%` }} />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Career Mindset</span>
            <span className="text-emerald-400 font-bold">{scores.mindset}%</span>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${scores.mindset}%` }} />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Market Awareness</span>
            <span className="text-amber-400 font-bold">{scores.market_awareness}%</span>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${scores.market_awareness}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
});

/* ── Learning Order ── */
const LearningOrder = React.memo(function LearningOrder({
  learning_order,
}: {
  learning_order: string[];
}) {
  if (!learning_order || learning_order.length === 0) return null;
  
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Your Learning Path
        <span className="text-xs text-slate-500 font-normal normal-case">({learning_order.length} steps)</span>
      </h3>
      
      <div className="space-y-3">
        {learning_order.map((step, i) => (
          <div key={i} className="flex gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
              {i + 1}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
      
      <p className="text-slate-500 text-xs mt-4 text-center">
        Ek step complete karo, phir agli — consistency hi success hai!
      </p>
    </div>
  );
});

/* ── Strengths & Gaps ── */
const StrengthsGaps = React.memo(function StrengthsGaps({
  roadmap,
}: {
  roadmap: ParsedRoadmap;
}) {
  const strengths = roadmap.strengths ?? [];
  const gaps = roadmap.gaps ?? [];
  
  if (strengths.length === 0 && gaps.length === 0) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {strengths.length > 0 && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <h4 className="text-emerald-400 text-sm font-bold mb-2 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Your Strengths
          </h4>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {gaps.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <h4 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Areas to Improve
          </h4>
          <ul className="space-y-1">
            {gaps.map((g, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                <span className="text-amber-400 mt-1">→</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export const AIRoadmapSection = React.memo(function AIRoadmapSection({
  roadmap,
  matchedCourses,
  onImprove,
  onGetRoadmap,
}: AIRoadmapSectionProps) {
  const hasRoadmap =
    roadmap &&
    ((roadmap.skill_score ?? 0) > 0 ||
    (roadmap.recommended_courses?.length ?? 0) > 0 ||
    (roadmap.career_paths?.length ?? 0) > 0);

  if (!hasRoadmap) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center">
        <p className="text-slate-400 mb-4">No AI roadmap generated yet.</p>
        <button
          onClick={onGetRoadmap}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-lg transition-colors"
        >
          Generate My Roadmap
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            AI Career Roadmap
          </h2>
          <p className="text-slate-400 text-sm">Personalized by Skilnex AI</p>
        </div>
        <button
          onClick={onImprove}
          className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 px-3 py-1 rounded-lg transition-colors"
        >
          Retake Test
        </button>
      </div>

      {/* Score + Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkillScoreCard roadmap={roadmap} />
        <SkillBreakdown roadmap={roadmap} />
      </div>

      {/* Career paths + Income */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(roadmap.career_paths?.length ?? 0) > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Career Paths
            </h3>
            <div className="space-y-2">
              {roadmap.career_paths!.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  {p}
                </div>
              ))}
            </div>
          </div>
        )}

        {roadmap.expected_income && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Expected Income
            </h3>
            <p className="text-2xl font-bold text-emerald-400 mb-1">
              {roadmap.expected_income.split("\n")[0].trim()}
            </p>
            {roadmap.timeline && (
              <p className="text-slate-400 text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {roadmap.timeline}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recommended Courses */}
      {matchedCourses.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Recommended Courses
            <span className="text-xs text-slate-500 font-normal normal-case">
              {matchedCourses.length} course{matchedCourses.length > 1 ? "s" : ""}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {matchedCourses.map((course, i) => (
              <div
                key={course.id}
                className="bg-slate-700/30 border border-amber-500/20 rounded-lg p-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{course.title}</p>
                  <p className="text-slate-400 text-xs">{course.category}</p>
                </div>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Order */}
      <LearningOrder learning_order={roadmap.learning_order ?? []} />

      {/* Strengths & Gaps */}
      <StrengthsGaps roadmap={roadmap} />
    </div>
  );
});
