import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Zap, Activity } from "lucide-react";

interface WelcomeHeroProps {
  userName: string;
  isPremium: boolean;
  price: number;
  totalCourses: number;
  completedCount: number;
  onUpgrade: () => void;
  onRefresh: () => void;
}

export const WelcomeHero = React.memo(function WelcomeHero({
  userName,
  isPremium,
  price,
  totalCourses,
  completedCount,
  onUpgrade,
  onRefresh,
}: WelcomeHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-blue-900/20 p-6 sm:p-8">
      {/* Subtle glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-slate-400 text-sm mb-1">Welcome back</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight truncate">
            {userName} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Continue your high-income skill journey
          </p>
          {totalCourses > 0 && (
            <div className="flex items-center gap-2 mt-3 bg-blue-900/20 border border-blue-800/30 rounded-lg px-3 py-1.5 w-fit">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-300 text-xs font-medium">
                {completedCount}/{totalCourses} courses completed
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isPremium && (
            <Button
              size="sm"
              onClick={onUpgrade}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 h-9 shadow-lg shadow-blue-900/30"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Upgrade — Rs. {price}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            className="border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 h-9 px-3 text-xs gap-1.5"
            title="Refresh status"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Upgrade nudge for free users */}
      {!isPremium && (
        <div className="relative mt-5 pt-5 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-yellow-300 text-sm font-semibold">
                🔓 Unlock {totalCourses} Premium Courses — Rs. {price}/month
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                AI Mentor + All Courses + Giveaway Entry + Certificate
              </p>
            </div>
            <Button
              onClick={onUpgrade}
              size="sm"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-xs px-4 h-8 shrink-0"
            >
              Upgrade Now →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
