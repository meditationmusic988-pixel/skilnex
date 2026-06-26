import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GiveawayTrackerProps {
  premiumCount: number;
  nextMilestone: number;
  prevMilestone: number;
  isPhase2: boolean;
}

export const GiveawayTracker = React.memo(function GiveawayTracker({
  premiumCount,
  nextMilestone,
  prevMilestone,
  isPhase2,
}: GiveawayTrackerProps) {
  const range = nextMilestone - prevMilestone;
  const within = premiumCount - prevMilestone;
  const pct = range > 0 ? Math.min(100, Math.round((within / range) * 100)) : 100;
  const remaining = Math.max(0, nextMilestone - premiumCount);

  return (
    <Card
      className={`overflow-hidden border ${
        isPhase2
          ? "bg-gradient-to-br from-purple-900/30 to-slate-800/60 border-purple-600/25"
          : "bg-gradient-to-br from-yellow-900/20 to-slate-800/60 border-yellow-600/20"
      }`}
    >
      <div
        className={`h-0.5 ${
          isPhase2
            ? "bg-gradient-to-r from-purple-500 to-blue-400"
            : "bg-gradient-to-r from-yellow-500 to-orange-400"
        }`}
      />
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isPhase2 ? "bg-purple-600/20" : "bg-yellow-600/15"
            }`}
          >
            <Trophy
              className={`w-4 h-4 ${isPhase2 ? "text-purple-300" : "text-yellow-400"}`}
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm">
              {isPhase2 ? "Rs. 1 Lakh Mega Giveaway" : "Rs. 35,000 Phase 1 Giveaway"}
            </p>
            <p className="text-slate-500 text-xs">Community milestone tracker</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Users className="w-3.5 h-3.5" />
              <span>{premiumCount.toLocaleString()} members</span>
            </div>
            <span
              className={`font-semibold ${isPhase2 ? "text-purple-300" : "text-yellow-400"}`}
            >
              {pct}%
            </span>
          </div>
          <Progress
            value={pct}
            className={`h-2 bg-slate-700 ${
              isPhase2 ? "[&>div]:bg-purple-500" : "[&>div]:bg-yellow-500"
            }`}
          />
          {remaining > 0 && (
            <p className="text-slate-500 text-xs">
              {remaining.toLocaleString()} more members to unlock next milestone
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});