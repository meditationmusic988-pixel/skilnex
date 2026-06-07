import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation, useSearch } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Zap, TrendingUp, Star, ArrowRight, Copy, CheckCircle,
  ChevronRight, BookOpen, Gift, Trophy, Target, Award, Share2,
  MessageCircle, RotateCcw, Users, Download, ExternalLink
} from "lucide-react";

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
  result_image_url: string;
  created_at: string;
}

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";

export default function CareerResult() {
  const { user } = useAuth();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [copiedImg, setCopiedImg] = useState(false);
  const [analysisPending, setAnalysisPending] = useState(false);

  const shareIdFromUrl = new URLSearchParams(search).get("id");

  const { data: resultFromId, isLoading: loadingById } = useQuery<CareerAnalysisResult>({
    queryKey: ["/api/career-results/", shareIdFromUrl],
    queryFn: async () => {
      const r = await fetch(`/api/career-results/${shareIdFromUrl}`);
      if (!r.ok) throw new Error("Not found");
      return r.json();
    },
    enabled: !!shareIdFromUrl,
  });

  const { data: latestResult, isLoading: loadingLatest } = useQuery<CareerAnalysisResult>({
    queryKey: ["/api/career-results/me/latest"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const r = await fetch("/api/career-results/me/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("Not found");
      return r.json();
    },
    enabled: !shareIdFromUrl,
  });

  const analysisMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/career-analysis", {});
      return res.json();
    },
    onSuccess: (data: CareerAnalysisResult) => {
      setLocation(`/career-result?id=${data.share_id}`);
    },
  });

  const result = shareIdFromUrl ? resultFromId : latestResult;
  const isLoading = shareIdFromUrl ? loadingById : loadingLatest;

  const shareUrl = result ? `${SITE_URL}/result/${result.share_id}` : "";
  const imageUrl = result ? `${SITE_URL}/result-image/${result.share_id}` : "";
  const waText = result
    ? `ðŸš€ AI ne mujhe ye career path recommend kiya!\n\nðŸŽ¯ *${result.skill_path}*\nðŸ’° 6-month income: ${result.income_6m}\nâ­ Sirf ${result.rarity}% users ko ye result milta hai!\n\nðŸ“Š Mera result card dekho aur apna free test do:\nðŸ‘‰ ${shareUrl}`
    : "";
  const waShare = `https://wa.me/?text=${encodeURIComponent(waText)}`;
  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyImageLink = async () => {
    try { await navigator.clipboard.writeText(imageUrl); } catch {}
    setCopiedImg(true);
    setTimeout(() => setCopiedImg(false), 2500);
  };

  const downloadImage = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `byonsoft-career-${result?.share_id ?? "result"}.svg`;
    a.target = "_blank";
    a.click();
  };

  const downloadAsFormat = async (shareId: string, format: "png" | "jpg") => {
    try {
      const resp = await fetch(`/result-image/${shareId}/square`);
      const svgText = await resp.text();
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext("2d")!;
        if (format === "jpg") {
          ctx.fillStyle = "#07101E";
          ctx.fillRect(0, 0, 1080, 1080);
        }
        ctx.drawImage(img, 0, 0, 1080, 1080);
        URL.revokeObjectURL(svgUrl);
        const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
        canvas.toBlob((b) => {
          if (!b) return;
          const dlUrl = URL.createObjectURL(b);
          const a = document.createElement("a");
          a.href = dlUrl;
          a.download = `byonsoft-career-result.${format}`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(dlUrl), 1000);
        }, mimeType, 0.95);
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        window.open(`/result-image/${shareId}/square`, "_blank");
      };
      img.src = svgUrl;
    } catch {
      window.open(`/result-image/${shareId}/square`, "_blank");
    }
  };

  if (isLoading || analysisMutation.isPending) {
    return (
      <div className="min-h-screen bg-[#070D18] flex flex-col items-center justify-center text-white px-4">
        <div className="text-center max-w-sm">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-blue-500/20 animate-spin" />
            <Brain className="absolute inset-0 m-auto w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">AI Career Analyzer Running</h2>
          <p className="text-slate-400 text-sm">Analyzing your profile and building your personalized career roadmap...</p>
          <div className="mt-6 space-y-2 text-xs text-slate-500">
            <p>âœ“ Processing skill scores</p>
            <p>âœ“ Matching career paths</p>
            <p className="animate-pulse text-blue-400">âŸ³ Generating income projections...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#070D18] flex flex-col items-center justify-center text-white px-4">
        <div className="text-center max-w-sm">
          <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Career Analysis Found</h2>
          <p className="text-slate-400 text-sm mb-6">Complete your skill test first, then get your AI career analysis.</p>
          <Button
            onClick={() => setLocation("/skill-test")}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            Take Skill Test
          </Button>
        </div>
      </div>
    );
  }

  const skills: string[] = Array.isArray(result.recommended_skills) ? result.recommended_skills : [];
  const roadmap = result.roadmap || {};
  const rarity = parseInt(result.rarity || "10");

  return (
    <div className="min-h-screen bg-[#070D18] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#070D18]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">Byonsoft <span className="text-blue-400">OS</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => analysisMutation.mutate()}
              disabled={analysisMutation.isPending}
              data-testid="button-retake"
              className="text-slate-400 hover:text-white text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake
            </Button>
            {user && (
              <Link href="/dashboard">
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white text-xs">
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* Rarity badge */}
        <div className="text-center">
          <div
            data-testid="badge-rarity"
            className="inline-flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-sm font-bold px-5 py-2 rounded-full"
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            Only {rarity}% of users get this result!
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>

        {/* Main result card */}
        <div
          data-testid="card-result"
          className="relative rounded-2xl overflow-hidden border border-blue-500/25 bg-gradient-to-br from-blue-900/20 via-[#0D1626] to-purple-900/15 shadow-2xl"
          style={{ boxShadow: "0 0 60px -10px rgba(59,130,246,0.15)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70" />

          <div className="p-6 sm:p-8">
            {/* AI header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">AI Career Analysis</p>
                <p className="text-slate-500 text-xs">by Byonsoft AI Architect</p>
              </div>
              <div className="ml-auto">
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" /> Analysis Complete
                </Badge>
              </div>
            </div>

            {/* Personality type */}
            {result.personality_type && (
              <div className="mb-3">
                <Badge className="bg-violet-500/15 text-violet-300 border-violet-500/25 text-xs px-3 py-1">
                  ðŸ§  {result.personality_type}
                </Badge>
              </div>
            )}

            {/* Primary path */}
            <h1 data-testid="text-skill-path" className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
              {result.skill_path}
            </h1>

            {result.secondary_path && (
              <p className="text-slate-400 text-sm mb-6">
                Alternate path: <span className="text-slate-300 font-medium">{result.secondary_path}</span>
              </p>
            )}

            {/* Income estimates */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-900/15 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">6 Months</p>
                </div>
                <p data-testid="text-income-6m" className="text-white font-extrabold text-lg leading-tight">{result.income_6m}</p>
                <p className="text-slate-500 text-xs mt-0.5">Estimated earning</p>
              </div>
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-900/10 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest">12 Months</p>
                </div>
                <p data-testid="text-income-12m" className="text-white font-extrabold text-lg leading-tight">{result.income_12m}</p>
                <p className="text-slate-500 text-xs mt-0.5">Full potential</p>
              </div>
            </div>

            {/* Recommended skills */}
            {skills.length > 0 && (
              <div className="mb-6">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Skills to Master</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <Badge
                      key={i}
                      data-testid={`badge-skill-${i}`}
                      className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs px-3 py-1.5"
                    >
                      âœ¦ {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3-Month Roadmap */}
        {(roadmap.month1 || roadmap.month2 || roadmap.month3) && (
          <div className="rounded-2xl border border-white/5 bg-[#0D1626]/60 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-5 h-5 text-cyan-400" />
              <h2 className="text-white font-bold text-lg">Your 3-Month Roadmap</h2>
            </div>
            <div className="space-y-4">
              {[
                { month: "Month 1", content: roadmap.month1, color: "blue", icon: "ðŸ“š" },
                { month: "Month 2", content: roadmap.month2, color: "cyan", icon: "ðŸ—ï¸" },
                { month: "Month 3", content: roadmap.month3, color: "emerald", icon: "ðŸš€" },
              ].filter(m => m.content).map((m, i) => (
                <div
                  key={i}
                  data-testid={`roadmap-month-${i + 1}`}
                  className={`flex gap-4 p-4 rounded-xl border
                    ${m.color === "blue" ? "border-blue-500/20 bg-blue-900/10" : ""}
                    ${m.color === "cyan" ? "border-cyan-500/20 bg-cyan-900/10" : ""}
                    ${m.color === "emerald" ? "border-emerald-500/20 bg-emerald-900/10" : ""}
                  `}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg
                    ${m.color === "blue" ? "bg-blue-600/20" : ""}
                    ${m.color === "cyan" ? "bg-cyan-600/20" : ""}
                    ${m.color === "emerald" ? "bg-emerald-600/20" : ""}
                  `}>
                    {m.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest mb-1
                      ${m.color === "blue" ? "text-blue-400" : ""}
                      ${m.color === "cyan" ? "text-cyan-400" : ""}
                      ${m.color === "emerald" ? "text-emerald-400" : ""}
                    `}>{m.month}</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* â”€â”€ RESULT IMAGE CARD â”€â”€ */}
        <div className="rounded-2xl border border-white/8 bg-[#0A1020] overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-5 pt-5 pb-3">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-white font-bold text-sm">Your Shareable Result Card</h2>
            <Badge className="ml-auto bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-xs">
              Ready to Share
            </Badge>
          </div>

          {/* Image Preview */}
          <div
            data-testid="container-result-image"
            className="mx-4 mb-4 rounded-xl overflow-hidden border border-white/8 bg-[#07101E] relative group cursor-pointer"
            onClick={() => window.open(imageUrl, "_blank")}
          >
            <img
              src={`/result-image/${result.share_id}`}
              alt={`${result.skill_path} â€” Career Result Card`}
              data-testid="img-result-card"
              className="w-full h-auto block"
              style={{ aspectRatio: "1200/630" }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-4 pb-4 space-y-3">
            {/* Primary share buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={waShare}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-share-wa"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-sm py-3 px-3 rounded-xl transition-all"
              >
                <svg viewBox="0 0 32 32" className="w-4 h-4 fill-white shrink-0">
                  <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.47.644 4.887 1.87 7.01L2 30l7.19-1.888A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.538a11.51 11.51 0 0 1-5.88-1.612l-.42-.25-4.27 1.12 1.14-4.15-.274-.428A11.503 11.503 0 0 1 4.46 16.003c0-6.367 5.178-11.544 11.543-11.544 6.366 0 11.543 5.177 11.543 11.544 0 6.366-5.177 11.535-11.543 11.535zm6.326-8.642c-.347-.174-2.054-1.015-2.374-1.13-.318-.116-.55-.174-.78.174-.23.347-.895 1.13-1.098 1.362-.202.23-.405.26-.752.087-.347-.174-1.466-.54-2.793-1.724-1.033-.92-1.73-2.057-1.932-2.404-.203-.347-.022-.535.152-.708.158-.155.347-.405.52-.607.174-.202.232-.347.347-.578.116-.232.058-.434-.029-.607-.087-.174-.78-1.88-1.07-2.575-.28-.676-.566-.584-.78-.595l-.664-.01c-.23 0-.607.086-.924.434-.318.347-1.214 1.187-1.214 2.893 0 1.707 1.243 3.356 1.416 3.588.174.232 2.446 3.732 5.927 5.235.828.357 1.474.57 1.978.73.83.264 1.587.227 2.183.137.666-.1 2.054-.84 2.345-1.652.29-.81.29-1.506.203-1.652-.086-.145-.318-.23-.665-.404z" />
                </svg>
                WhatsApp
              </a>
              <a
                href={fbShare}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-share-fb"
                className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#1468d8] active:scale-95 text-white font-semibold text-sm py-3 px-3 rounded-xl transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
            </div>

            {/* Download format buttons */}
            <div className="grid grid-cols-4 gap-2">
              {/* Download PNG */}
              <button
                onClick={() => downloadAsFormat(result.share_id, "png")}
                data-testid="button-download-png"
                className="flex flex-col items-center justify-center gap-1 bg-blue-700 hover:bg-blue-600 active:scale-95 border border-blue-600/50 text-white font-semibold text-xs py-3 px-2 rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                PNG
              </button>

              {/* Download JPG */}
              <button
                onClick={() => downloadAsFormat(result.share_id, "jpg")}
                data-testid="button-download-jpg"
                className="flex flex-col items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 active:scale-95 border border-slate-600 text-white font-semibold text-xs py-3 px-2 rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                JPG
              </button>

              {/* Instagram: download PNG for story */}
              <button
                onClick={() => downloadAsFormat(result.share_id, "png")}
                data-testid="button-download-image"
                className="flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 active:scale-95 text-white font-semibold text-xs py-3 px-2 rounded-xl transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
                Insta
              </button>

              {/* Copy link */}
              <button
                onClick={copyLink}
                data-testid="button-copy-share"
                className={`flex flex-col items-center justify-center gap-1 font-semibold text-xs py-3 px-2 rounded-xl transition-all ${
                  copied ? "bg-green-600 text-white" : "bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white"
                }`}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Link"}
              </button>
            </div>

            {/* Instagram helper tip */}
            <div className="flex items-start gap-2 bg-purple-900/20 border border-purple-500/20 rounded-lg px-3 py-2.5">
              <span className="text-purple-400 text-xs mt-0.5 shrink-0">ðŸ“¸</span>
              <p className="text-purple-300 text-xs leading-relaxed">
                <strong>Instagram ke liye:</strong> "Instagram" button click karo, image save karo, phir Stories mein upload karo. Results page link caption mein add karo!
              </p>
            </div>

            {/* URL display */}
            <div className="text-xs text-slate-500 bg-slate-800/40 border border-slate-700/40 rounded-lg px-3 py-2 font-mono truncate">
              {shareUrl}
            </div>
          </div>
        </div>

        {/* Challenge CTA */}
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/15 to-[#0D1626] p-6 text-center">
          <div className="text-2xl mb-2">ðŸ†</div>
          <h3 className="text-white font-bold text-lg mb-2">Challenge Your Friends!</h3>
          <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
            See which of your friends gets a rarer career path. Share your result and invite them to take the AI test. If 2 of them subscribe, you get an extra giveaway ticket!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={waShare}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-challenge-wa"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Challenge on WhatsApp
            </a>
            {!user && (
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all">
                Take Your Own Test
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Subscription CTA */}
        {user && !user.subscription_status && (
          <div className="rounded-2xl border border-yellow-500/25 bg-gradient-to-br from-yellow-900/15 to-[#0D1626] p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold mb-0.5">Unlock Your Full Learning Path</p>
              <p className="text-slate-400 text-xs">Get full access to all courses matching your analysis. Only Rs. 750/month.</p>
            </div>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold shrink-0" size="sm">
                Upgrade <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Referral reward reminder */}
        {user && (
          <div className="rounded-xl border border-blue-500/15 bg-blue-900/10 p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-slate-400 text-sm">
              Share this result and if <strong className="text-white">2 friends subscribe</strong>, you earn an extra <strong className="text-yellow-300">giveaway ticket ðŸŽŸï¸</strong>. 
              <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 ml-1">Check your referral stats â†’</Link>
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
