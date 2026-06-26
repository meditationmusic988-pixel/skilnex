import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Brain, TrendingUp, Trophy, Star, Zap, ChevronRight, BookOpen, ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CareerAnalysisResult {
  share_id: string;
  skill_path: string;
  secondary_path: string;
  personality_type: string;
  income_6m: string;
  income_12m: string;
  recommended_skills: string[];
  roadmap: { month1?: string; month2?: string; month3?: string };
  rarity: string;
}

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";

export default function PublicResult() {
  const { shareId } = useParams<{ shareId: string }>();

  const { data: result, isLoading, isError } = useQuery<CareerAnalysisResult>({
    queryKey: ["/api/career-results/", shareId],
    queryFn: async () => {
      const r = await fetch(`/api/career-results/${shareId}`);
      if (!r.ok) throw new Error("Not found");
      return r.json();
    },
    enabled: !!shareId,
  });

  useEffect(() => {
    if (result) {
      document.title = `AI Skill Test Result: ${result.skill_path} | Byonsoft OS`;
      const setOgMeta = (prop: string, content: string) => {
        let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement;
        if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
        el.content = content;
      };
      const setNameMeta = (name: string, content: string) => {
        let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
        el.content = content;
      };
      setOgMeta("og:title", `AI Skill Test Result: ${result.skill_path}`);
      setOgMeta("og:description", `Only ${result.rarity}% of users get this career path! Estimated income: ${result.income_12m} in 12 months. Take your own free AI skill test now.`);
      setOgMeta("og:url", `${SITE_URL}/result/${shareId}`);
      setOgMeta("og:type", "website");
      setOgMeta("og:image", `${SITE_URL}/result-image/${shareId}`);
      setOgMeta("og:image:width", "1200");
      setOgMeta("og:image:height", "630");
      setNameMeta("twitter:card", "summary_large_image");
      setNameMeta("twitter:image", `${SITE_URL}/result-image/${shareId}`);
    }
  }, [result, shareId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-blue-500/20 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading result...</p>
        </div>
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="min-h-screen bg-[#070D18] flex flex-col items-center justify-center text-white px-4">
        <Brain className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Result Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">This result link may have expired or is invalid.</p>
        <Link href="/signup">
          <Button className="bg-blue-600 hover:bg-blue-500">
            Take Your Own Free Test
          </Button>
        </Link>
      </div>
    );
  }

  const skills: string[] = Array.isArray(result.recommended_skills) ? result.recommended_skills : [];
  const roadmap = result.roadmap || {};
  const rarity = parseInt(result.rarity || "10");

  return (
    <div className="min-h-screen bg-[#070D18] text-white">
      {/* Nav */}
      <nav className="bg-[#070D18]/90 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center justify-between max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-sm">Byonsoft <span className="text-blue-400">OS</span></span>
        </div>
        <Link href="/signup">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs gap-1">
            Take Free Test <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* Hero callout */}
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm mb-2">Someone shared their AI Skill Test result with you</p>
          <div
            data-testid="badge-rarity-public"
            className="inline-flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-sm font-bold px-5 py-2 rounded-full"
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            Only {rarity}% of users get this result!
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>

        {/* ── Result Image Card ── */}
        <div className="rounded-2xl border border-white/8 bg-[#0A1020] overflow-hidden shadow-2xl">
          <img
            src={`/result-image/${shareId}`}
            alt={`${result.skill_path} — Career Result`}
            data-testid="img-public-result-card"
            className="w-full h-auto block"
            style={{ aspectRatio: "1200/630" }}
            loading="lazy"
          />
        </div>

        {/* Result card */}
        <div
          data-testid="card-public-result"
          className="relative rounded-2xl overflow-hidden border border-blue-500/25 bg-gradient-to-br from-blue-900/20 via-[#0D1626] to-purple-900/15 shadow-2xl"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Byonsoft AI Career Analysis</p>
              </div>
            </div>

            {result.personality_type && (
              <div className="mb-3">
                <Badge className="bg-violet-500/15 text-violet-300 border-violet-500/25 text-xs px-3 py-1">
                  🧠 {result.personality_type}
                </Badge>
              </div>
            )}

            <h1 data-testid="text-public-skill-path" className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
              {result.skill_path}
            </h1>
            {result.secondary_path && (
              <p className="text-slate-400 text-sm mb-5">
                Alternate: <span className="text-slate-300 font-medium">{result.secondary_path}</span>
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-900/15 p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <p className="text-emerald-400 text-xs font-bold">6 Months</p>
                </div>
                <p className="text-white font-extrabold text-base">{result.income_6m}</p>
              </div>
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-900/10 p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <p className="text-yellow-400 text-xs font-bold">12 Months</p>
                </div>
                <p className="text-white font-extrabold text-base">{result.income_12m}</p>
              </div>
            </div>

            {skills.length > 0 && (
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Skills to Master</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <Badge key={i} className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs px-2.5 py-1">
                      ✦ {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3-month roadmap */}
        {(roadmap.month1 || roadmap.month2 || roadmap.month3) && (
          <div className="rounded-2xl border border-white/5 bg-[#0D1626]/60 p-5">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <span>📍</span> Their 3-Month Roadmap
            </h2>
            <div className="space-y-3">
              {[
                { label: "Month 1 — Fundamentals", content: roadmap.month1, emoji: "📚" },
                { label: "Month 2 — Portfolio Building", content: roadmap.month2, emoji: "🏗️" },
                { label: "Month 3 — Career Launch", content: roadmap.month3, emoji: "🚀" },
              ].filter(m => m.content).map((m, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  <span className="text-lg shrink-0">{m.emoji}</span>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold mb-0.5">{m.label}</p>
                    <p className="text-slate-300 text-sm">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA section — the whole point */}
        <div className="rounded-2xl border border-yellow-500/25 bg-gradient-to-br from-yellow-900/20 to-[#0D1626] p-7 text-center">
          <div className="text-3xl mb-3">🎯</div>
          <h2 className="text-white font-extrabold text-xl sm:text-2xl mb-2">
            What Career Path Will AI Give YOU?
          </h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Take the free 30-second skill test and discover your personalized career roadmap with income estimates.
          </p>
          <Link href="/signup">
            <button
              data-testid="button-public-take-test"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-95 text-white font-bold text-base sm:text-lg px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-blue-900/50 w-full sm:w-auto"
            >
              <Zap className="w-5 h-5" />
              Take My Free AI Skill Test
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <p className="text-slate-600 text-xs mt-3">Free to start · No credit card needed · Results in 30 seconds</p>
        </div>

        {/* Leaderboard teaser */}
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/20 p-5">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-3">This Week's Top Career Paths</p>
          <div className="space-y-2">
            {[
              { rank: 1, path: "Fiverr Freelancing — Digital Design", users: "34%" },
              { rank: 2, path: "Social Media Marketing & Brand Growth", users: "21%" },
              { rank: 3, path: "AI Tools + Content Creation", users: "18%" },
              { rank: 4, path: "Shopify E-Commerce & Dropshipping", users: "14%" },
            ].map((item) => (
              <div key={item.rank} className="flex items-center gap-3">
                <span className={`text-xs font-black w-5 text-center ${item.rank === 1 ? "text-yellow-400" : item.rank === 2 ? "text-slate-300" : item.rank === 3 ? "text-orange-400" : "text-slate-500"}`}>
                  {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `#${item.rank}`}
                </span>
                <p className="text-slate-300 text-xs flex-1">{item.path}</p>
                <span className="text-slate-500 text-xs">{item.users} of users</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4 text-center mt-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
            <BookOpen className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-white font-bold text-sm">Byonsoft OS</span>
        </div>
        <p className="text-slate-600 text-xs">Pakistan's Premier AI-Powered Learning Platform</p>
      </footer>
    </div>
  );
}
