import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Sparkles,
  Award,
  Briefcase,
  DollarSign,
  BookOpen,
  ListOrdered,
  Target,
  Clock,
  CheckCircle,
} from "lucide-react";
import type { Course } from "@shared/schema";
import type { ParsedRoadmap } from "../../utils/roadmap";
import { STEP_COLORS } from "../../utils/roadmap";

interface AIRoadmapSectionProps {
  roadmap: ParsedRoadmap | null;
  matchedCourses: Course[];
  onImprove: () => void;
  onGetRoadmap: () => void;
}

/* ── Empty state ── */
const RoadmapEmpty = React.memo(function RoadmapEmpty({
  onGetRoadmap,
}: {
  onGetRoadmap: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 via-slate-800/60 to-slate-900 p-8 sm:p-12 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 rounded-2xl" />
      <div className="relative space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto">
          <Brain className="w-8 h-8 text-indigo-300" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            AI Career Roadmap
          </h2>
          <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
            Apna background batao — AI tumhare liye personalized career roadmap
            banaye ga with courses, paths, aur income estimates.
          </p>
        </div>
        <Button
          size="lg"
          onClick={onGetRoadmap}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-indigo-900/40"
        >
          <Brain className="w-5 h-5 mr-2" /> Get My Free Roadmap
        </Button>
        <div className="flex items-center justify-center gap-6 text-slate-500 text-sm">
          {["Sirf 2 minute", "100% Free", "AI Powered"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

/* ── Score card ── */
const SkillScoreCard = React.memo(function SkillScoreCard({
  roadmap,
}: {
  roadmap: ParsedRoadmap;
}) {
  if (!roadmap.skill_score && !roadmap.skill_level) return null;
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-900/40 via-blue-900/30 to-slate-800/50 border border-indigo-500/20 p-5">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 via-blue-400 to-cyan-400" />
      <div className="flex items-center gap-5">
        {roadmap.skill_score && (
          <div className="w-16 h-16 rounded-xl bg-slate-900/60 border border-indigo-500/30 flex flex-col items-center justify-center shrink-0">
            <span className="text-2xl font-black text-white leading-none">
              {roadmap.skill_score}
            </span>
            <span className="text-[10px] text-slate-500">/100</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {roadmap.skill_level && (
            <Badge
              className={`text-xs font-semibold px-2.5 py-0.5 mb-2 w-fit border ${
                roadmap.skill_level === "Beginner"
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/25"
                  : roadmap.skill_level === "Advanced"
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                  : "bg-blue-500/15 text-blue-300 border-blue-500/25"
              }`}
            >
              <Award className="w-3 h-3 mr-1" />
              {roadmap.skill_level}
            </Badge>
          )}
          {roadmap.motivation && (
            <p className="text-slate-300 text-sm italic leading-relaxed line-clamp-2">
              "{roadmap.motivation}"
            </p>
          )}
        </div>
      </div>
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
    return <RoadmapEmpty onGetRoadmap={onGetRoadmap} />;
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/30">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Career Roadmap</h2>
            <p className="text-slate-500 text-xs">Personalized by Skilnex AI</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onImprove}
          className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/20 text-xs gap-1.5 h-8"
        >
          <Sparkles className="w-3.5 h-3.5" /> Update
        </Button>
      </div>

      {/* Score */}
      <SkillScoreCard roadmap={roadmap!} />

      {/* Career paths + Income */}
      <div className="grid sm:grid-cols-2 gap-4">
        {(roadmap!.career_paths?.length ?? 0) > 0 && (
          <Card className="bg-slate-800/60 border-slate-700/60 overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-white font-semibold text-sm">Career Paths</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {roadmap!.career_paths!.map((p, i) => (
                  <Badge
                    key={i}
                    className="bg-emerald-900/25 border-emerald-600/25 text-emerald-300 text-xs px-2.5 py-1"
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {roadmap!.expected_income && (
          <Card className="bg-gradient-to-br from-teal-900/30 to-slate-800/60 border-teal-600/25 overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-teal-500 to-cyan-400" />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600/20 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <p className="text-teal-300 text-[10px] font-bold uppercase tracking-widest">
                  Expected Income
                </p>
              </div>
              <p className="text-white text-lg font-black leading-snug">
                {roadmap!.expected_income.split("\n")[0].trim()}
              </p>
              {roadmap!.timeline && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Clock className="w-3 h-3 text-teal-400" />
                  <p className="text-teal-300 text-xs">{roadmap!.timeline}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommended Courses — actual app courses */}
      {matchedCourses.length > 0 && (
        <Card className="bg-slate-800/60 border-slate-700/60 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-white font-semibold text-sm">Recommended Courses</p>
              <span className="ml-auto text-xs text-slate-500">
                {matchedCourses.length} course{matchedCourses.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {matchedCourses.map((course, i) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/40 border border-slate-600/30 hover:border-blue-500/25 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-600/25 text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-slate-200 text-sm leading-snug truncate">
                      {course.title}
                    </p>
                    <p className="text-slate-500 text-xs">{course.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Order */}
      {(roadmap!.learning_order?.length ?? 0) > 0 && (
        <Card className="bg-slate-800/60 border-slate-700/60 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-cyan-600/20 flex items-center justify-center">
                <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-white font-semibold text-sm">Learning Order</p>
              <span className="ml-auto text-xs text-slate-500">
                {roadmap!.learning_order!.length} steps
              </span>
            </div>
            <div className="space-y-2.5">
              {roadmap!.learning_order!.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/20 hover:bg-slate-700/50 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border-2"
                    style={{
                      borderColor: STEP_COLORS[i % STEP_COLORS.length],
                      color: STEP_COLORS[i % STEP_COLORS.length],
                    }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-blue-600/8 border border-blue-500/15">
              <Target className="w-4 h-4 text-blue-400 shrink-0" />
              <p className="text-blue-300 text-xs">
                Ek step complete karo, phir agli — consistency hi success hai!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
});
