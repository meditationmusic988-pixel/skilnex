import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  RotateCcw, TrendingUp, Award, Star, CheckCircle2,
  Target, ChevronRight, Briefcase, DollarSign,
  BookOpen, ListOrdered
} from "lucide-react";

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

interface SkillResultCardProps {
  skillScore: { roadmap_result?: string } | null | undefined;
  onRetake: () => void;
}

// ── Exact same as SkillTest ──
function AnimatedNumber({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = Math.ceil(target / 60);
    const id = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(cur);
      if (cur >= target) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [target]);
  return <>{val}</>;
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 54, circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setOffset(((100 - score) / 100) * circ), 100);
    return () => clearTimeout(t);
  }, [score, circ]);
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="-rotate-90 w-full h-full" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white leading-none"><AnimatedNumber target={score} /></span>
        <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function ResultBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 200); return () => clearTimeout(t); }, [value]);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
        <div className="h-full rounded-full"
          style={{ width: `${width}%`, background: color, transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
    </div>
  );
}

const scoreColor = (s: number) => s < 40 ? "#ef4444" : s < 65 ? "#f59e0b" : "#22c55e";
const levelColor = (l: string) =>
  l === "Beginner" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
  l === "Advanced" ? "bg-green-500/20 text-green-300 border-green-500/30" :
  "bg-blue-500/20 text-blue-300 border-blue-500/30";

export function SkillResultCard({ skillScore, onRetake }: SkillResultCardProps) {
  const [, setLocation] = useLocation();

  if (!skillScore?.roadmap_result) return null;

  let result: RoadmapResult | null = null;
  try {
    let parsed = JSON.parse(skillScore.roadmap_result);
    if (typeof parsed === "string") parsed = JSON.parse(parsed); // double-stringify safe
    if (parsed?.skill_score) result = parsed;
  } catch { return null; }

  if (!result) return null;

  const STEP_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-black text-white">Aapka Career Report</h2>
          <p className="text-slate-500 text-xs mt-0.5">Personalized by Skilnex AI</p>
        </div>
        <button onClick={onRetake}
          className="flex items-center gap-1.5 text-xs text-slate-400 border border-slate-700 rounded-lg px-3 py-2 hover:border-slate-500 transition-colors">
          <RotateCcw className="w-3.5 h-3.5" /> Retake
        </button>
      </div>

      {/* Score ring */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-5">
        <ScoreRing score={result.skill_score ?? 0} color={scoreColor(result.skill_score ?? 0)} />
        <div className="flex-1 min-w-0">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border mb-2 ${levelColor(result.skill_level ?? "")}`}>
            <Award className="w-3 h-3" /> {result.skill_level}
          </span>
          <p className="text-sm text-slate-300 italic leading-relaxed">"{result.motivation}"</p>
        </div>
      </div>

      {/* Skill breakdown */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" /> Skill Breakdown
        </p>
        <ResultBar label="Technical Skills"  value={result.confidence_scores?.technical        ?? 50} color="#3b82f6" />
        <ResultBar label="Career Mindset"    value={result.confidence_scores?.mindset          ?? 50} color="#22c55e" />
        <ResultBar label="Market Awareness"  value={result.confidence_scores?.market_awareness ?? 50} color="#f59e0b" />
      </div>

      {/* Strengths + Gaps */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Star className="w-3 h-3" /> Strengths
          </p>
          <div className="space-y-2">
            {(result.strengths ?? []).map((s, i) => (
              <p key={i} className="text-xs text-green-200/80 flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-green-400" /> {s}
              </p>
            ))}
          </div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Target className="w-3 h-3" /> Improve Karo
          </p>
          <div className="space-y-2">
            {(result.gaps ?? []).map((g, i) => (
              <p key={i} className="text-xs text-amber-200/80 flex items-start gap-1.5">
                <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" /> {g}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Career paths + income */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5" /> Career Paths
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {(result.career_paths ?? []).map((p, i) => (
            <span key={i} className="bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full">{p}</span>
          ))}
        </div>
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> Expected Income</p>
          <p className="text-xl font-black text-white">{result.expected_income}</p>
          <p className="text-xs text-blue-400 mt-1">{result.timeline}</p>
        </div>
      </div>

      {/* Recommended courses */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5" /> Recommended Courses
        </p>
        <div className="space-y-2.5">
          {(result.recommended_courses ?? []).map((course, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="text-sm text-white font-medium leading-snug">{course}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Learning order */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ListOrdered className="w-3.5 h-3.5" /> Learning Order
        </p>
        <div className="space-y-3">
          {(Array.isArray(result.learning_order) ? result.learning_order : [result.learning_order]).filter(Boolean).map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ borderColor: STEP_COLORS[i % STEP_COLORS.length], color: STEP_COLORS[i % STEP_COLORS.length] }}>
                {i + 1}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed pt-0.5">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
