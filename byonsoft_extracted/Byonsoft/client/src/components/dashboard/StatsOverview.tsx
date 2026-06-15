import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Award, Star, PlayCircle, TrendingUp, Brain, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface StatsOverviewProps {
  isPhase2: boolean;
  completedCount: number;
  totalCourses: number;
  hasAssessment: boolean;
  inProgressCount: number;
  onAssessmentClick: () => void;
  // Skill test result data
  careerPath?: string;
  income6m?: string;
  income12m?: string;
  shareId?: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  accentClass: string;
  iconBgClass: string;
  onClick?: () => void;
}

const StatCard = React.memo(function StatCard({
  icon,
  value,
  label,
  accentClass,
  iconBgClass,
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={`relative overflow-hidden bg-slate-800/60 border-slate-700/60 transition-colors ${
        onClick ? "cursor-pointer hover:border-purple-500/40" : ""
      }`}
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
  careerPath,
  income6m,
  income12m,
  shareId,
}: StatsOverviewProps) {
  return (
    <div className="space-y-3">
      {/* Skill Test Result Banner — sirf tab show karo jab result ho */}
      {hasAssessment && careerPath && (
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/25 bg-gradient-to-r from-blue-900/30 via-[#0D1626] to-indigo-900/20 px-5 py-4">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70" />
          <div className="flex items-center gap-3 flex-wrap">
            {/* Brain icon */}
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-blue-400" />
            </div>

            {/* Career path */}
            <div className="flex-1 min-w-0">
              <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                AI Career Result
              </p>
              <p className="text-white font-bold text-sm leading-tight truncate">{careerPath}</p>
            </div>

            {/* Income chips */}
            {(income6m || income12m) && (
              <div className="flex items-center gap-2 shrink-0">
                {income6m && (
                  <div className="flex items-center gap-1.5 bg-emerald-900/30 border border-emerald-500/25 rounded-lg px-3 py-1.5">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <div>
                      <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest leading-none">
                        6 Mo
                      </p>
                      <p className="text-white font-bold text-xs leading-tight">{income6m}</p>
                    </div>
                  </div>
                )}
                {income12m && (
                  <div className="flex items-center gap-1.5 bg-yellow-900/20 border border-yellow-500/20 rounded-lg px-3 py-1.5">
                    <Trophy className="w-3 h-3 text-yellow-400" />
                    <div>
                      <p className="text-[9px] text-yellow-400 font-bold uppercase tracking-widest leading-none">
                        12 Mo
                      </p>
                      <p className="text-white font-bold text-xs leading-tight">{income12m}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View full result link */}
            {shareId && (
              <Link
                href={`/career-result?id=${shareId}`}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-semibold shrink-0 transition-colors"
              >
                Full Result <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Giveaway */}
        <StatCard
          accentClass={
            isPhase2
              ? "bg-gradient-to-r from-purple-500 to-blue-500"
              : "bg-gradient-to-r from-yellow-500 to-orange-500"
          }
          iconBgClass={isPhase2 ? "bg-purple-600/20" : "bg-yellow-600/20"}
          icon={
            <Trophy
              className={`w-4 h-4 ${isPhase2 ? "text-purple-300" : "text-yellow-400"}`}
            />
          }
          value={
            <span className={`text-base font-bold ${isPhase2 ? "text-purple-200" : "text-yellow-300"}`}>
              {isPhase2 ? "1 Lakh" : "35,000"}
            </span>
          }
          label={isPhase2 ? "Mega Giveaway" : "Phase 1 Prize"}
        />

        {/* Completed */}
        <StatCard
          accentClass="bg-gradient-to-r from-emerald-500 to-green-400"
          iconBgClass="bg-emerald-600/20"
          icon={<Award className="w-4 h-4 text-emerald-400" />}
          value={
            <>
              {completedCount}
              <span className="text-slate-500 text-sm font-normal">/{totalCourses}</span>
            </>
          }
          label="Completed"
        />

        {/* AI Assessment */}
        <StatCard
          accentClass={
            hasAssessment
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : "bg-gradient-to-r from-yellow-500 to-amber-400"
          }
          iconBgClass={hasAssessment ? "bg-emerald-600/20" : "bg-yellow-600/20"}
          icon={
            <Star
              className={`w-4 h-4 ${hasAssessment ? "text-emerald-400" : "text-yellow-400"}`}
            />
          }
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
