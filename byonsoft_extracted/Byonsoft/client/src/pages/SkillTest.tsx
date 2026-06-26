import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ArrowRight, Zap, RotateCcw, BookOpen,
  Briefcase, DollarSign, ListOrdered, CheckCircle2,
  Smartphone, Laptop, Monitor, Layers,
  TrendingUp, Target, Award, Star, ChevronRight,
  Palette, PenTool, Megaphone, Video, Code2, Globe, Camera, MessageSquare
} from "lucide-react";
import type { SkillScore, Course } from "@shared/schema";

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

interface SkillRating {
  id: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  value: number;
}

const DEVICE_OPTIONS = [
  { label: "Sirf Mobile", value: "Mobile only", icon: Smartphone },
  { label: "Laptop", value: "Laptop", icon: Laptop },
  { label: "Desktop PC", value: "Desktop PC", icon: Monitor },
  { label: "Dono hain", value: "Laptop + Mobile", icon: Layers },
];

const LOADING_MSGS = [
  "AI aapki skills analyze kar raha hai...",
  "Career paths scan ho rahi hain...",
  "Income projections calculate ho rahi hain...",
  "Aapka roadmap tayyar ho raha hai...",
];

const SKILL_LEVELS = ["Bilkul Nahi", "Thoda Thoda", "Theek Hai", "Acha Hoon", "Expert"];

const INITIAL_SKILLS: SkillRating[] = [
  { id: "design",    label: "Graphic Design",     description: "Canva, Photoshop, posters",    icon: Palette,       color: "#a855f7", value: 0 },
  { id: "writing",   label: "Content Writing",    description: "Blogs, captions, copywriting", icon: PenTool,       color: "#3b82f6", value: 0 },
  { id: "marketing", label: "Digital Marketing",  description: "SEO, ads, social media",       icon: Megaphone,     color: "#f59e0b", value: 0 },
  { id: "video",     label: "Video Editing",      description: "Reels, YouTube, TikTok",       icon: Video,         color: "#ef4444", value: 0 },
  { id: "coding",    label: "Programming",        description: "Web, apps, automation",        icon: Code2,         color: "#22c55e", value: 0 },
  { id: "ecom",      label: "E-Commerce",         description: "Daraz, Amazon, dropshipping",  icon: Globe,         color: "#06b6d4", value: 0 },
  { id: "photo",     label: "Photography",        description: "Product, portrait, editing",   icon: Camera,        color: "#f97316", value: 0 },
  { id: "sales",     label: "Sales & CRM",        description: "Client handling, proposals",   icon: MessageSquare, color: "#ec4899", value: 0 },
];

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
        <div className="h-full rounded-full" style={{ width: `${width}%`, background: color, transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
    </div>
  );
}

function StepDot({ n, state }: { n: number; state: "done" | "active" | "idle" }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300
      ${state === "done" ? "bg-blue-600 text-white" : state === "active" ? "bg-blue-600 text-white ring-4 ring-blue-600/20" : "bg-slate-800 text-slate-500 border border-slate-700"}`}>
      {state === "done" ? <CheckCircle2 className="w-4 h-4" /> : n}
    </div>
  );
}

function SkillSliderCard({ skill, onChange }: { skill: SkillRating; onChange: (id: string, val: number) => void }) {
  const Icon = skill.icon;
  const levelLabel = SKILL_LEVELS[skill.value];
  const pct = (skill.value / 4) * 100;
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 transition-all hover:border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: skill.color + "20", border: `1px solid ${skill.color}40` }}>
          <Icon className="w-4 h-4" style={{ color: skill.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{skill.label}</p>
          <p className="text-xs text-slate-500 truncate">{skill.description}</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: skill.color + "20", color: skill.color }}>
          {levelLabel}
        </span>
      </div>
      <div className="relative px-1">
        <input
          type="range" min={0} max={4} step={1} value={skill.value}
          onChange={e => onChange(skill.id, Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
          style={{ background: `linear-gradient(to right, ${skill.color} 0%, ${skill.color} ${pct}%, #1e293b ${pct}%, #1e293b 100%)` }}
        />
        <div className="flex justify-between mt-1.5 px-0.5">
          {SKILL_LEVELS.map((lbl, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className="w-0.5 h-1.5 rounded-full" style={{ background: i <= skill.value ? skill.color : "#334155" }} />
              <span className="text-[9px] text-slate-600 hidden sm:block">{i === 0 ? "0" : i === 4 ? "Pro" : ""}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SkillTest() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const isNewTest = new URLSearchParams(search).get("new") === "1";

  const phase = useRef<number>(0);
  const [, setRender] = useState(0);
  const tick = () => setRender(r => r + 1);

  const [goal, setGoal] = useState("");
  const [existingSkill, setExistingSkill] = useState("");
  const [device, setDevice] = useState("");
  const [incomeTarget, setIncomeTarget] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [currentSituation, setCurrentSituation] = useState("");
  const [biggestChallenge, setBiggestChallenge] = useState("");
  const [skills, setSkills] = useState<SkillRating[]>(INITIAL_SKILLS);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [meterVals, setMeterVals] = useState([0, 0, 0]);
  const [result, setResult] = useState<RoadmapResult | null>(null);

  // ── Fetch actual app courses ──
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: skillScore, isLoading: loadingSkills } = useQuery<SkillScore | null>({
    queryKey: ["/api/skills"],
  });

  useEffect(() => {
    if (isNewTest) return;
    if (!skillScore?.roadmap_result) return;
    try {
      const parsed = JSON.parse(skillScore.roadmap_result) as RoadmapResult;
      if (parsed?.recommended_courses) {
        if (skillScore.goal) setGoal(skillScore.goal);
        if (skillScore.existing_skill) setExistingSkill(skillScore.existing_skill);
        setResult(parsed);
        phase.current = 4;
        tick();
      }
    } catch {}
  }, [skillScore, isNewTest]);

  const goPhase = (n: number) => { phase.current = n; tick(); };

  const handleSkillChange = (id: string, val: number) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, value: val } : s));
  };

  const avgSkillScore = Math.round((skills.reduce((acc, s) => acc + s.value, 0) / (skills.length * 4)) * 100);
  const ratedSkillsSummary = skills.map(s => `${s.label}: ${SKILL_LEVELS[s.value]}`).join(", ");

  const startLoading = () => {
    goPhase(3);
    setMeterVals([0, 0, 0]);
    setLoadingMsgIdx(0);
    let mi = 0;
    const msgInt = setInterval(() => {
      mi = (mi + 1) % LOADING_MSGS.length;
      setLoadingMsgIdx(mi);
    }, 1400);
    setTimeout(() => setMeterVals([85, 72, 90]), 300);
    callAI(msgInt);
  };

  const callAI = async (msgInt?: ReturnType<typeof setInterval>) => {
    // ── Build course list from actual app courses ──
    const courseList = courses.length > 0
      ? courses.map((c, i) => `${i + 1}. ${c.title} (${c.category})`).join("\n")
      : "No courses available";

    const prompt = `You are a career advisor for Pakistan. A user rated their skills on a scale of 0-4.

IMPORTANT: You MUST recommend courses ONLY from this exact list. Use the EXACT title as written:
${courseList}

User profile:
- Goal: ${goal}
- Background: ${existingSkill}
- Current Situation: ${currentSituation}
- Monthly Income Target: ${incomeTarget}
- Time Available per Day: ${timeAvailable}
- Biggest Challenge: ${biggestChallenge}
- Device: ${device}
- Skill ratings (0=None, 1=Basic, 2=Okay, 3=Good, 4=Expert): ${ratedSkillsSummary}
- Overall skill score: ${avgSkillScore}/100

Instructions:
1. Pick 3-4 courses from the list above that best match the user's goal and highest-rated skills.
2. Use the EXACT course title from the list — do not modify or invent names.
3. If no course matches perfectly, pick the closest ones.
4. career_paths should match the user's goal (e.g. if goal is shop owner, suggest shop/business paths).
5. learning_order should describe steps using skill names, NOT course names.

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "skill_level": "Beginner|Intermediate|Advanced",
  "skill_score": ${avgSkillScore},
  "confidence_scores": {"technical": 40, "mindset": 65, "market_awareness": 50},
  "strengths": ["strength based on high-rated skills", "another strength"],
  "gaps": ["gap based on low-rated skills", "another gap"],
  "recommended_courses": ["Exact Course Title From List Above", "Exact Course Title From List Above", "Exact Course Title From List Above"],
  "career_paths": ["Path matching user goal", "Path 2", "Path 3"],
  "expected_income": "PKR 40,000 – 120,000/month",
  "timeline": "3–6 months to first earning",
  "learning_order": ["Step 1: learn this skill", "Step 2: practice this", "Step 3: apply here", "Step 4: grow by doing this"],
  "motivation": "One powerful motivating sentence in Urdu or English"
}`;

    try {
      const res = await apiRequest("POST", "/api/ai/roadmap", {
        goal: goal.trim(),
        existing_skill: existingSkill.trim(),
        available_tool: device,
        prompt_override: prompt,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (msgInt) clearInterval(msgInt);
      setResult(parsed);
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      goPhase(4);
    } catch {
      if (msgInt) clearInterval(msgInt);
      // ── Fallback: use first 4 actual courses if available ──
      const fallbackCourses = courses.length > 0
        ? courses.slice(0, 4).map(c => c.title)
        : ["Digital Marketing Course", "Freelancing Basics", "E-Commerce Setup", "Content Creation"];

      const topSkills = [...skills].sort((a, b) => b.value - a.value).slice(0, 2).map(s => s.label);
      setResult({
        skill_level: avgSkillScore < 35 ? "Beginner" : avgSkillScore < 65 ? "Intermediate" : "Advanced",
        skill_score: avgSkillScore || 30,
        confidence_scores: {
          technical: avgSkillScore,
          mindset: Math.min(avgSkillScore + 15, 100),
          market_awareness: Math.max(avgSkillScore - 10, 10),
        },
        strengths: topSkills.length
          ? [`${topSkills[0]} mein acha base hai`, "Seekhne ki lagan zahir hai"]
          : ["Seekhne ki lagan hai", "Goal clear hai"],
        gaps: ["Practical client-facing experience", "Portfolio banana abhi baki hai"],
        recommended_courses: fallbackCourses,
        career_paths: ["Freelancer", "Online Business Owner", "Content Creator"],
        expected_income: "PKR 30,000 – 80,000/month",
        timeline: "2–4 months to first earning",
        learning_order: [
          "Step 1: Apni top skill polish karein",
          "Step 2: Portfolio ke 3 sample projects banayein",
          "Step 3: Online profile setup karein",
          "Step 4: Pehla client ya order lein",
        ],
        motivation: "Aap ke paas skills hain — bas inhe duniya ko dikhane ka waqt aa gaya hai!",
      });
      goPhase(4);
    }
  };

  const handleRetake = () => {
    setGoal(""); setExistingSkill(""); setDevice(""); setIncomeTarget(""); setTimeAvailable(""); setCurrentSituation(""); setBiggestChallenge("");
    setSkills(INITIAL_SKILLS.map(s => ({ ...s, value: 0 })));
    setResult(null); setLoadingMsgIdx(0); setMeterVals([0, 0, 0]);
    goPhase(0);
  };

  const scoreColor = (s: number) => s < 40 ? "#ef4444" : s < 65 ? "#f59e0b" : "#22c55e";
  const levelColor = (l: string) =>
    l === "Beginner" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
    l === "Advanced" ? "bg-green-500/20 text-green-300 border-green-500/30" :
    "bg-blue-500/20 text-blue-300 border-blue-500/30";

  if (loadingSkills) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-blue-900/40 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <header className="border-b border-slate-800/80 bg-[#0D1425]/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => setLocation("/dashboard")} className="text-slate-400 hover:text-white h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-white text-sm">AI Career Assessment</h1>
            <p className="text-slate-500 text-xs">Powered by Skilnex AI</p>
          </div>
          {phase.current > 0 && phase.current < 4 && (
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(n => (
                <div key={n} className={`h-1.5 rounded-full transition-all duration-500 ${phase.current >= n ? "w-8 bg-blue-500" : "w-4 bg-slate-700"}`} />
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* PHASE 0: INTRO */}
        {phase.current === 0 && (
          <div className="space-y-5 animate-in fade-in duration-500">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3 py-1 text-xs font-medium mb-3">
                  <Zap className="w-3 h-3" /> AI-Powered · Free · 5 Minutes
                </div>
                <h2 className="text-2xl font-black mb-2 leading-tight">Apna Career IQ<br />Discover Karo</h2>
                <p className="text-blue-100 text-sm leading-relaxed mb-5">Apni skills rate karo — AI aapki strengths dekh kar ek personalized career roadmap banayega.</p>
                <div className="grid grid-cols-3 gap-3">
                  {[["3", "Phases"], ["5 min", "Total time"], ["100%", "Free"]].map(([val, lbl]) => (
                    <div key={lbl} className="bg-white/10 rounded-xl p-3 text-center">
                      <div className="text-lg font-black">{val}</div>
                      <div className="text-blue-200 text-xs">{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Aapko milega</p>
              <div className="space-y-3">
                {[
                  [Target,      "Skill Score + Level",    "Aapki current ability ka honest rating"],
                  [TrendingUp,  "Career Paths",           "Aapke goal ke mutabiq top opportunities"],
                  [BookOpen,    "Course Recommendations", "Kahan se aur kya seekhna hai — ranked"],
                  [DollarSign,  "Income Projection",      "Pakistan market mein realistic earning range"],
                  [ListOrdered, "Step-by-Step Plan",      "Kya seekhna hai, kis order mein"],
                ].map(([Icon, title, desc]) => (
                  <div key={title as string} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{title as string}</p>
                      <p className="text-xs text-slate-500">{desc as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => goPhase(1)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
              <Zap className="w-4 h-4" /> Assessment Shuru Karo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PHASE 1: BACKGROUND */}
        {phase.current === 1 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
              <StepDot n={1} state="active" />
              <div className="flex-1 h-px bg-slate-800" />
              <StepDot n={2} state="idle" />
              <div className="flex-1 h-px bg-slate-800" />
              <StepDot n={3} state="idle" />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Q1</span>
                <span className="text-xs text-slate-600">Goal</span>
              </div>
              <p className="text-sm font-semibold text-white mb-3">Aapka primary goal kya hai?</p>
              <textarea
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-600 p-3 resize-none focus:outline-none focus:border-blue-500 transition-colors"
                rows={3}
                placeholder="e.g. Online earning seekhna hai, freelancing start karni hai, apna business grow karna hai..."
                value={goal}
                onChange={e => setGoal(e.target.value)}
              />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Q2</span>
                <span className="text-xs text-slate-600">Background</span>
              </div>
              <p className="text-sm font-semibold text-white mb-3">Aapka educational ya work background kya hai?</p>
              <textarea
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-600 p-3 resize-none focus:outline-none focus:border-blue-500 transition-colors"
                rows={3}
                placeholder="e.g. Student hoon, matriculation ki hai, 2 saal ki job experience hai..."
                value={existingSkill}
                onChange={e => setExistingSkill(e.target.value)}
              />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Q3</span>
                <span className="text-xs text-slate-600">Current Situation</span>
              </div>
              <p className="text-sm font-semibold text-white mb-3">Aap abhi kya kar rahe hain?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "🎓 Student", value: "Student" },
                  { label: "💼 Job kar raha/rahi hoon", value: "Employed" },
                  { label: "🏪 Business owner hoon", value: "Business Owner" },
                  { label: "🔍 Berozgaar hoon", value: "Unemployed" },
                  { label: "🏠 Ghar pe hoon", value: "Homemaker" },
                  { label: "💻 Already freelancing", value: "Freelancer" },
                ].map(({ label, value }) => (
                  <button key={value} onClick={() => setCurrentSituation(value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left
                      ${currentSituation === value ? "bg-blue-600/20 border-blue-500 text-blue-300" : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Q4</span>
                <span className="text-xs text-slate-600">Income Target</span>
              </div>
              <p className="text-sm font-semibold text-white mb-3">Aap monthly kitna kamana chahte hain?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Rs. 20,000 – 40,000", value: "PKR 20,000-40,000/month" },
                  { label: "Rs. 40,000 – 80,000", value: "PKR 40,000-80,000/month" },
                  { label: "Rs. 80,000 – 1,50,000", value: "PKR 80,000-150,000/month" },
                  { label: "Rs. 1,50,000+", value: "PKR 150,000+/month" },
                ].map(({ label, value }) => (
                  <button key={value} onClick={() => setIncomeTarget(value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all
                      ${incomeTarget === value ? "bg-emerald-600/20 border-emerald-500 text-emerald-300" : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Q5</span>
                <span className="text-xs text-slate-600">Time Available</span>
              </div>
              <p className="text-sm font-semibold text-white mb-3">Din mein kitne ghante de sakte hain learning ko?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "⏱ 1–2 ghante", value: "1-2 hours/day" },
                  { label: "⏱ 3–4 ghante", value: "3-4 hours/day" },
                  { label: "⏱ 5–6 ghante", value: "5-6 hours/day" },
                  { label: "⏱ Full time (7+)", value: "7+ hours/day (full time)" },
                ].map(({ label, value }) => (
                  <button key={value} onClick={() => setTimeAvailable(value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all
                      ${timeAvailable === value ? "bg-purple-600/20 border-purple-500 text-purple-300" : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Q6</span>
                <span className="text-xs text-slate-600">Biggest Challenge</span>
              </div>
              <p className="text-sm font-semibold text-white mb-3">Aapka sabse bada masla kya hai abhi?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "💸 Paise nahi hain", value: "No money to invest" },
                  { label: "⏰ Time nahi milta", value: "Not enough time" },
                  { label: "📚 Skills nahi hain", value: "Lack of skills" },
                  { label: "🧭 Guidance nahi", value: "No proper guidance" },
                  { label: "😟 Confidence nahi", value: "Lack of confidence" },
                  { label: "🌐 Internet / Device", value: "Limited internet or device access" },
                ].map(({ label, value }) => (
                  <button key={value} onClick={() => setBiggestChallenge(value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left
                      ${biggestChallenge === value ? "bg-orange-600/20 border-orange-500 text-orange-300" : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Q7</span>
                <span className="text-xs text-slate-600">Device</span>
              </div>
              <p className="text-sm font-semibold text-white mb-3">Aapke paas kaunsa device hai?</p>
              <div className="grid grid-cols-2 gap-2">
                {DEVICE_OPTIONS.map(({ label, value, icon: Icon }) => (
                  <button key={value} onClick={() => setDevice(value)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all
                      ${device === value ? "bg-blue-600/20 border-blue-500 text-blue-300" : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => goPhase(2)}
              disabled={goal.trim().length < 5 || existingSkill.trim().length < 3 || !device || !incomeTarget || !timeAvailable || !currentSituation || !biggestChallenge}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
              Skills Rate Karo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PHASE 2: SKILL SLIDERS */}
        {phase.current === 2 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-2">
              <StepDot n={1} state="done" />
              <div className="flex-1 h-px bg-blue-600" />
              <StepDot n={2} state="active" />
              <div className="flex-1 h-px bg-slate-800" />
              <StepDot n={3} state="idle" />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white mb-1">Apni Skills Rate Karo</h2>
              <p className="text-xs text-slate-500 mb-4">Har skill par slider drag karo — bilkul honest raho, AI usi ke hisaab se plan banayega.</p>
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">Overall Skill Score</p>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${avgSkillScore}%` }} />
                  </div>
                </div>
                <span className="text-xl font-black text-white w-12 text-right">{avgSkillScore}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {skills.map(skill => (
                <SkillSliderCard key={skill.id} skill={skill} onChange={handleSkillChange} />
              ))}
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl">
              <Star className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300">Agar koi skill aapko pata hi nahi hai toh slider zero par chhodein — AI aapko wahan se hi start karna sikhayega.</p>
            </div>

            <button onClick={startLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
              <Zap className="w-4 h-4" /> AI Se Roadmap Generate Karo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PHASE 3: LOADING */}
        {phase.current === 3 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-blue-900/50 border-t-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-7 h-7 text-blue-400" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-bold text-lg">{LOADING_MSGS[loadingMsgIdx]}</p>
              <p className="text-slate-500 text-sm">Aapki skill ratings se personalized roadmap ban raha hai</p>
            </div>
            <div className="w-full max-w-xs space-y-3">
              {[
                ["Career paths scanning", meterVals[0], "#3b82f6"],
                ["Skill gap analysis",    meterVals[1], "#22c55e"],
                ["Income projection",     meterVals[2], "#f59e0b"],
              ].map(([lbl, val, col]) => (
                <div key={lbl as string}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{lbl as string}</span><span>{val as number}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${val}%`, background: col as string, transition: "width 1.5s cubic-bezier(0.16,1,0.3,1)" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* PHASE 4: RESULTS */}
        {phase.current === 4 && result && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-black text-white">Aapka Career Report</h2>
                <p className="text-slate-500 text-xs mt-0.5">Personalized by Skilnex AI</p>
              </div>
              <button onClick={handleRetake} className="flex items-center gap-1.5 text-xs text-slate-400 border border-slate-700 rounded-lg px-3 py-2 hover:border-slate-500 transition-colors">
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

            {/* Rated skills */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Aapki Rated Skills</p>
              <div className="grid grid-cols-2 gap-2">
                {skills.map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: s.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 truncate">{s.label}</p>
                        <div className="h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(s.value / 4) * 100}%`, background: s.color }} />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold shrink-0" style={{ color: s.color }}>{SKILL_LEVELS[s.value]}</span>
                    </div>
                  );
                })}
              </div>
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

            {/* Recommended courses — actual app courses */}
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
                {(Array.isArray(result.learning_order) ? result.learning_order : [result.learning_order]).filter(Boolean).map((step, i) => {
                  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{ borderColor: colors[i % colors.length], color: colors[i % colors.length] }}>
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed pt-0.5">{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-center">
              <p className="text-white font-bold mb-1">Ready to start? 🚀</p>
              <p className="text-blue-200 text-xs mb-4">Apne courses explore karo aur pehla qadam uthao!</p>
              <button onClick={() => setLocation("/dashboard")}
                className="w-full bg-white text-blue-700 font-bold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                Dashboard par Jao →
              </button>
            </div>
          </div>
        )}

        {phase.current === 4 && !result && (
          <div className="text-center py-16 space-y-4">
            <p className="text-slate-400">Kuch masla hua. Dobara try karo.</p>
            <button onClick={handleRetake} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold">
              Retake Assessment
            </button>
          </div>
        )}

      </main>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
          transition: box-shadow 0.2s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 6px rgba(59,130,246,0.25);
        }
        input[type=range]::-moz-range-thumb {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #3b82f6;
          cursor: pointer;
        }
        input[type=range] { -webkit-appearance: none; appearance: none; }
      `}</style>
    </div>
  );
}
