import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Trophy, Zap, Users, Lock, Ticket, CheckCircle, RefreshCw, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

interface GiveawayStats {
  activeUsers: number;
  nextMilestone: number;
  prevMilestone: number;
}

interface MegaBannerProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

export function MegaLaunchBanner({ isPremium, onUpgrade }: MegaBannerProps) {
  const { data: stats } = useQuery<GiveawayStats>({
    queryKey: ["/api/giveaway/stats"],
    refetchInterval: 60_000,
  });

  const activeUsers = stats?.activeUsers ?? 0;

  const m1Total = 300;
  const m1Done = activeUsers >= m1Total;
  const m1Pct = Math.min(100, Math.round((activeUsers / m1Total) * 100));

  const m2Total = 1000;
  const m2Pct = Math.min(100, Math.round((activeUsers / m2Total) * 100));

  return (
    <div className="relative rounded-2xl overflow-hidden border border-yellow-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-black/40">
      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Animated shimmer top strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-70" />

      <div className="relative p-6 sm:p-8 space-y-7">
        {/* Headline */}
        <div className="text-center space-y-2">
          <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">Byonsoft OS</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            🚀 THE BYONSOFT MEGA LAUNCH ROADMAP 🚀
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Join Pakistan's fastest-growing Ed-Tech platform. Enroll as a Premium member and enter our growing giveaway pool!
          </p>
        </div>

        {/* Milestones */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Milestone 1 */}
          <div className={`relative rounded-xl border p-5 space-y-4 transition-all ${m1Done ? "border-green-500/50 bg-green-900/10" : "border-yellow-500/40 bg-yellow-900/10"}`}>
            {/* Active badge */}
            <div className="flex items-center justify-between">
              <Badge className={`text-xs font-bold px-2.5 py-1 ${m1Done ? "bg-green-600/30 text-green-300 border-green-500/40" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 animate-pulse"}`}>
                {m1Done ? "✅ COMPLETED" : "🔴 LIVE NOW"}
              </Badge>
              <span className="text-white font-bold tabular-nums text-sm">{activeUsers.toLocaleString()} / {m1Total.toLocaleString()}</span>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-0.5">🎯 Target: 300 Premium Members</h3>
              <p className="text-yellow-300 font-semibold text-base">🏆 Rs. 35,000 Giveaway</p>
              <div className="flex gap-3 mt-2 flex-wrap">
                <span className="text-slate-300 text-xs bg-slate-700/60 px-2.5 py-1 rounded-full border border-slate-600/60">🥇 1st: Rs. 20,000</span>
                <span className="text-slate-300 text-xs bg-slate-700/60 px-2.5 py-1 rounded-full border border-slate-600/60">🥈 2nd: Rs. 10,000</span>
                <span className="text-slate-300 text-xs bg-slate-700/60 px-2.5 py-1 rounded-full border border-slate-600/60">🥉 3rd: Rs. 5,000</span>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${m1Done ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-400"}`}
                  style={{ width: `${m1Pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">0</span>
                <span className={`font-bold ${m1Done ? "text-green-400" : "text-yellow-400"}`}>{m1Pct}%</span>
                <span className="text-slate-500">300</span>
              </div>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className={`relative rounded-xl border p-5 space-y-4 ${activeUsers >= 300 ? "border-purple-500/40 bg-purple-900/10" : "border-slate-600/40 bg-slate-800/30"}`}>
            {!m1Done && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <div className="text-center space-y-2">
                  <Lock className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-slate-400 text-sm font-medium">Unlocks at 300 Members</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Badge className="text-xs font-bold px-2.5 py-1 bg-purple-600/20 text-purple-300 border-purple-500/40">
                🔥 UPCOMING
              </Badge>
              <span className="text-white font-bold tabular-nums text-sm">{activeUsers.toLocaleString()} / {m2Total.toLocaleString()}</span>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-0.5">🔥 Target: 1,000 Premium Members</h3>
              <p className="text-purple-300 font-semibold text-base">💰 Rs. 100,000 Mega Giveaway</p>
              <p className="text-slate-400 text-sm mt-2">6 Lucky Winners selected from all Premium members &amp; their referrals!</p>
            </div>

            <div className="space-y-1.5">
              <div className="w-full h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-400"
                  style={{ width: `${m2Pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">0</span>
                <span className="font-bold text-purple-400">{m2Pct}%</span>
                <span className="text-slate-500">1,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300 text-sm">
              <span className="text-white font-bold text-lg">{activeUsers.toLocaleString()}</span> Premium Members Enrolled
            </span>
          </div>
          {isPremium ? (
            <div data-testid="badge-enrolled" className="flex items-center gap-2 bg-green-900/40 border border-green-500/40 rounded-xl px-5 py-2.5">
              <Ticket className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-bold">You are Enrolled! 🎟️</span>
            </div>
          ) : (
            <Button
              data-testid="button-upgrade-giveaway"
              onClick={onUpgrade}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-black font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-yellow-900/30 hover:shadow-yellow-800/50 transition-all"
            >
              <Zap className="w-4 h-4 mr-2" />
              Unlock Premium (Rs. 750) &amp; Enter Draw
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReferralStats {
  referral_code: string;
  successful_referrals: number;
  total_tickets: number;
}

export function ReferralCard() {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ["/api/referral/stats"],
    staleTime: 30_000,
  });

  const referralCode = user?.referral_code || stats?.referral_code || "";
  const referralLink = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : "";

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = referralLink;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 via-slate-800/60 to-slate-900/80 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

      <div className="p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">🚀 Refer Friends, Double Your Chances!</h3>
            <p className="text-slate-400 text-xs">Every successful invite earns you extra giveaway tickets</p>
          </div>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-xl bg-slate-700/40 animate-pulse" />
            <div className="h-20 rounded-xl bg-slate-700/40 animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/40 border border-slate-600/40 rounded-xl p-4 text-center">
              <p data-testid="text-successful-referrals" className="text-3xl font-bold text-white tabular-nums">{stats?.successful_referrals ?? 0}</p>
              <p className="text-slate-400 text-xs mt-1">Successful Invites</p>
              <p className="text-green-400 text-xs font-medium">(Premium Members)</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border border-yellow-500/30 rounded-xl p-4 text-center">
              <p data-testid="text-total-tickets" className="text-3xl font-bold text-yellow-300 tabular-nums">{stats?.total_tickets ?? 0}</p>
              <p className="text-slate-400 text-xs mt-1">Your Total Tickets</p>
              <p className="text-yellow-400 text-xs font-medium">🎟️ Giveaway Entries</p>
            </div>
          </div>
        )}

        {/* Ticket Math explainer */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-900/20 border border-blue-700/30">
          <Ticket className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-slate-300 text-xs leading-relaxed">
            <span className="text-blue-300 font-semibold">Ticket Math:</span> Every Premium member gets <span className="text-white font-medium">1 base ticket</span>. Invite 2 friends who upgrade to Premium, and get <span className="text-yellow-300 font-medium">1 extra ticket</span> per 2 successful referrals!
          </p>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-slate-400 text-xs font-medium">Your Unique Referral Link</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-700/60 border border-slate-600/60 rounded-lg px-3 py-2.5 text-slate-300 text-xs font-mono truncate select-all" data-testid="text-referral-link">
              {referralLink || "Generating your link..."}
            </div>
            <Button
              data-testid="button-copy-referral"
              size="sm"
              onClick={copyLink}
              disabled={isLoading || !referralLink}
              className={`shrink-0 font-semibold transition-all ${copied ? "bg-green-600 hover:bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
            >
              {copied ? (
                <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Copied!</>
              ) : (
                "Copy Link"
              )}
            </Button>
          </div>
          <p className="text-slate-500 text-xs">Share this link — friends who signup via your link and upgrade to Premium count as your referrals.</p>
        </div>
      </div>
    </div>
  );
}

export function GiveawayBanner() {
  const { data: stats } = useQuery<GiveawayStats>({
    queryKey: ["/api/giveaway/stats"],
    refetchInterval: 60_000,
  });

  if (!stats) return null;

  const { activeUsers, nextMilestone, prevMilestone } = stats;
  const range = nextMilestone - prevMilestone;
  const current = activeUsers - prevMilestone;
  const pct = Math.min(100, Math.round((current / range) * 100));
  const remaining = nextMilestone - activeUsers;
  const isMega = nextMilestone === 1000;

  return (
    <div className={`relative rounded-xl overflow-hidden border ${
      isMega
        ? "border-yellow-500/40 bg-gradient-to-r from-yellow-900/30 via-orange-900/20 to-yellow-900/30"
        : "border-purple-500/40 bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-purple-900/30"
    }`}>
      <div className="relative p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMega ? "bg-yellow-500/20" : "bg-purple-500/20"}`}>
              {isMega ? <Trophy className="w-5 h-5 text-yellow-400" /> : <Gift className="w-5 h-5 text-purple-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-bold text-base leading-tight">{isMega ? "MEGA " : ""}Giveaway Milestone</p>
                <Badge className={`text-xs animate-pulse ${isMega ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : "bg-purple-500/20 text-purple-300 border-purple-500/30"}`}>
                  <Zap className="w-3 h-3 mr-1" /> LIVE
                </Badge>
              </div>
              <p className="text-slate-400 text-sm">Next Milestone: <span className={`font-bold ${isMega ? "text-yellow-400" : "text-purple-400"}`}>{nextMilestone.toLocaleString()} Members</span></p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-2 justify-end">
              <Users className={`w-4 h-4 ${isMega ? "text-yellow-400" : "text-purple-400"}`} />
              <span className="text-2xl font-bold text-white tabular-nums">{activeUsers.toLocaleString()}</span>
              <span className="text-slate-400 text-sm font-medium">/ {nextMilestone.toLocaleString()}</span>
            </div>
            <p className={`text-xs font-medium mt-0.5 ${isMega ? "text-yellow-400" : "text-purple-400"}`}>{remaining.toLocaleString()} more to unlock!</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative w-full h-4 bg-slate-700/60 rounded-full overflow-hidden">
            <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${isMega ? "bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-400" : "bg-gradient-to-r from-purple-600 via-blue-500 to-purple-400"}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">{prevMilestone.toLocaleString()} members</span>
            <span className={`font-bold ${isMega ? "text-yellow-400" : "text-purple-400"}`}>{pct}% Complete</span>
            <span className="text-slate-500">{nextMilestone.toLocaleString()} members</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RewardTier { threshold: number; label: string; icon: string; achieved: boolean; }
interface ReferralRewardsData {
  tiers: RewardTier[];
  count: number;
  nextTier: RewardTier | null;
}

export function ReferralRewards() {
  const { data, isLoading } = useQuery<ReferralRewardsData>({
    queryKey: ["/api/referral/rewards"],
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-5 space-y-3 animate-pulse">
        <div className="h-4 w-40 bg-slate-700 rounded" />
        <div className="h-12 bg-slate-700 rounded-xl" />
        <div className="h-12 bg-slate-700 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const { tiers, count, nextTier } = data;
  const nextThreshold = nextTier?.threshold ?? tiers[tiers.length - 1]?.threshold ?? 10;
  const progress = Math.min(100, Math.round((count / nextThreshold) * 100));

  return (
    <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-900/15 via-slate-900/60 to-slate-900">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-tight">Referral Reward Tiers</h3>
            <p className="text-slate-400 text-xs">Invite friends → unlock rewards</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-black text-white tabular-nums">{count}</p>
            <p className="text-slate-500 text-xs">referrals</p>
          </div>
        </div>

        {/* Progress toward next tier */}
        {nextTier && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">
                {count}/{nextThreshold} referrals to unlock <span className="text-emerald-300 font-semibold">{nextTier.icon} {nextTier.label}</span>
              </span>
              <span className="text-emerald-400 font-bold">{progress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-700/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Tier list */}
        <div className="grid grid-cols-2 gap-2">
          {tiers.map((tier) => (
            <div
              key={tier.threshold}
              data-testid={`reward-tier-${tier.threshold}`}
              className={`flex items-center gap-2.5 rounded-xl p-3 border transition-all ${
                tier.achieved
                  ? "border-emerald-500/40 bg-emerald-900/20"
                  : "border-slate-700/40 bg-slate-800/30 opacity-60"
              }`}
            >
              <span className="text-xl shrink-0">{tier.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight truncate">{tier.label}</p>
                <p className="text-xs text-slate-500">{tier.threshold} friend{tier.threshold !== 1 ? "s" : ""}</p>
              </div>
              {tier.achieved && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-auto" />}
            </div>
          ))}
        </div>

        {!nextTier && (
          <div className="text-center p-2 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-300 text-sm font-bold">🎉 All rewards unlocked!</p>
          </div>
        )}

        <div className="text-center">
          <Link href="/career-result">
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              View your AI Career Analysis →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function GiveawayManagerWidget() {
  const { data: stats, refetch } = useQuery<GiveawayStats>({
    queryKey: ["/api/giveaway/stats"],
    refetchInterval: 30_000,
  });

  if (!stats) return null;

  const { activeUsers, nextMilestone, prevMilestone } = stats;
  const range = nextMilestone - prevMilestone;
  const current = activeUsers - prevMilestone;
  const pct = Math.min(100, Math.round((current / range) * 100));
  const remaining = nextMilestone - activeUsers;
  const isMega = nextMilestone === 1000;

  return (
    <div className={`rounded-xl border p-5 ${isMega ? "border-yellow-500/40 bg-gradient-to-br from-yellow-900/20 to-orange-900/10" : "border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-blue-900/10"}`}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className={`w-5 h-5 ${isMega ? "text-yellow-400" : "text-purple-400"}`} />
        <h3 className="text-white font-bold">Giveaway Manager</h3>
        <Badge className={`ml-auto text-xs ${isMega ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : "bg-purple-500/20 text-purple-300 border-purple-500/30"}`}>{isMega ? "Mega Goal" : "First Goal"}</Badge>
        <Button size="sm" variant="ghost" onClick={() => refetch()} className="text-slate-400 h-7 w-7 p-0">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-700/40 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white tabular-nums">{activeUsers}</p>
          <p className="text-slate-400 text-xs mt-0.5">Paid Users</p>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-3 text-center">
          <p className={`text-2xl font-bold tabular-nums ${isMega ? "text-yellow-400" : "text-purple-400"}`}>{nextMilestone}</p>
          <p className="text-slate-400 text-xs mt-0.5">Next Milestone</p>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-400 tabular-nums">{remaining}</p>
          <p className="text-slate-400 text-xs mt-0.5">Still Needed</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Progress toward {nextMilestone} milestone</span>
          <span className={`font-bold ${isMega ? "text-yellow-400" : "text-purple-400"}`}>{pct}%</span>
        </div>
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${isMega ? "bg-gradient-to-r from-yellow-600 to-orange-400" : "bg-gradient-to-r from-purple-600 to-blue-400"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      {remaining <= 50 && remaining > 0 && (
        <div className="mt-3 p-2 rounded-md bg-green-900/30 border border-green-600/30 text-center">
          <p className="text-green-400 text-xs font-bold animate-pulse">Almost there! Only {remaining} more paid users to trigger the giveaway!</p>
        </div>
      )}
      {remaining === 0 && (
        <div className="mt-3 p-2 rounded-md bg-yellow-900/30 border border-yellow-500/40 text-center">
          <p className="text-yellow-400 text-xs font-bold">Milestone reached! Time to announce the giveaway winner!</p>
        </div>
      )}
    </div>
  );
}
