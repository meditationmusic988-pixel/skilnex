import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import {
  BookOpen, Zap, Gift, Star, ArrowRight, ChevronRight,
  Trophy, Shield, Sparkles, TrendingUp, MessageCircle,
  Brain, Target, Users, Check, Copy, CheckCircle,
  Play, Award, Lock, ChevronDown
} from "lucide-react";

interface GiveawayStats {
  activeUsers: number;
  nextMilestone: number;
  prevMilestone: number;
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function CountdownTimer() {
  const [time, setTime] = useState({ hours: 23, minutes: 59, seconds: 59 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-2 justify-center">
      {[
        { val: time.hours, label: "HRS" },
        { val: time.minutes, label: "MIN" },
        { val: time.seconds, label: "SEC" },
      ].map((t, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="bg-red-900/40 border border-red-500/40 rounded-lg px-3 py-2 text-center min-w-[56px]">
            <div className="text-2xl font-black text-white tabular-nums">{String(t.val).padStart(2, "0")}</div>
            <div className="text-red-400 text-xs font-bold">{t.label}</div>
          </div>
          {i < 2 && <span className="text-red-400 font-black text-xl">:</span>}
        </div>
      ))}
    </div>
  );
}

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://skilnex-production-d029.up.railway.app";
const WA_SHARE = `https://wa.me/?text=${encodeURIComponent(`🚀 Abba ne kaha degree lo... Degree ne kaha job nahi... Skilnex ne kaha — Ao!\n\n50,000/month kamana sikhaun — FREE mein check karo!\n\n👉 ${SITE_URL}/signup`)}`;
const FB_SHARE = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE_URL}/signup`)}`;
const TW_SHARE = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚀 Pakistan ki #1 AI Skill Platform!\n\nAbba ne kaha degree lo... Degree ne kaha job nahi... Skilnex ne kaha — Ao!\n\n${SITE_URL}/signup`)}`;

export default function Landing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const { data: stats } = useQuery<GiveawayStats>({
    queryKey: ["/api/giveaway/stats"],
    refetchInterval: 60_000,
  });

  const activeUsers = stats?.activeUsers ?? 0;
  const m1Total = 300;
  const m1Pct = Math.min(100, Math.round((activeUsers / m1Total) * 100));
  const m2Total = 1000;
  const m2Pct = Math.min(100, Math.round((activeUsers / m2Total) * 100));
  const spotsLeft = Math.max(0, 300 - activeUsers);

  useEffect(() => {
    if (user) setLocation(user.role === "admin" ? "/admin" : "/dashboard");
  }, [user]);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(`${SITE_URL}/signup`); }
    catch { }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-white overflow-x-hidden">

      {/* ─── TOP URGENCY BAR ─── */}
      <div className="bg-gradient-to-r from-red-900/80 via-red-800/80 to-red-900/80 border-b border-red-500/30 py-2 px-4 text-center">
        <p className="text-red-200 text-xs sm:text-sm font-bold">
          ⚡ Sirf <span className="text-white font-black">{spotsLeft}</span> spots baqi hain 300 prize draw mein! Abhi join karo →
          <Link href="/signup" className="ml-2 underline text-yellow-300 hover:text-yellow-200">Free Test Do</Link>
        </p>
      </div>

      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 bg-[#070D18]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight">Skil<span className="text-blue-400">nex</span></span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => scrollTo("how-it-works")}
              className="text-slate-400 hover:text-white text-xs sm:text-sm font-medium transition-colors hidden sm:block"
            >
              Kaise Kaam Karta Hai
            </button>
            <Link href="/login" className="text-slate-400 hover:text-white text-xs sm:text-sm font-medium transition-colors hidden sm:block">
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/40"
            >
              Free Test Do <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HOOK SECTION ─── */}
      <section className="py-10 px-4 bg-gradient-to-b from-[#0D0A00] to-[#070D18] border-b border-yellow-500/10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-2xl sm:text-3xl font-black leading-snug mb-6">
            <p className="text-slate-400 font-normal text-lg mb-1">Abba ne kaha...</p>
            <p className="text-white">"Degree lo, job milegi" 🎓</p>
            <p className="text-slate-400 font-normal text-lg mt-3 mb-1">Degree ne kaha...</p>
            <p className="text-white">"Experience chahiye" 😔</p>
            <p className="text-slate-400 font-normal text-lg mt-3 mb-1">Skilnex ne kaha —</p>
            <p className="text-green-400 text-3xl sm:text-4xl">"Ao! 50,000/month<br />kamana sikhaun!" 🚀</p>
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 active:scale-95 text-white font-black text-base px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-green-900/40"
          >
            <Zap className="w-5 h-5" />
            FREE mein check karo ✅
          </Link>
          <p className="text-slate-500 text-xs mt-3">Koi credit card nahi chahiye — bilkul free</p>
        </div>
      </section>

      {/* ─── HERO ─── */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-blue-700/20 blur-[130px]" />
          <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-cyan-600/10 blur-[80px]" />
          <div className="absolute top-20 -right-20 w-72 h-72 rounded-full bg-violet-700/10 blur-[80px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "50px 50px" }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
            </span>
            🇵🇰 Pakistan Ki #1 AI Skill Learning Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5">
            30 Second Mein{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">Apni Skill Discover Karo</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 8" fill="none">
                <path d="M2 6C50 2 150 2 298 6" stroke="url(#u)" strokeWidth="3" strokeLinecap="round"/>
                <defs><linearGradient id="u" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="0.5" stopColor="#67E8F9"/><stop offset="1" stopColor="#34D399"/></linearGradient></defs>
              </svg>
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-6">
            AI tumhara <strong className="text-white">personal career advisor</strong> hai — tumhare jawab dekh ke <strong className="text-white">best courses recommend</strong> karega aur ghar baith ke <strong className="text-white">50,000+ PKR/month</strong> kamana sikhayega.
          </p>

          {/* Urgency countdown */}
          <div className="mb-8 inline-block bg-red-900/20 border border-red-500/30 rounded-2xl px-6 py-4">
            <p className="text-red-300 text-xs font-bold uppercase tracking-widest mb-3">⏳ Early Bird Offer Khatam Hone Mein:</p>
            <CountdownTimer />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.97] text-white font-bold text-base sm:text-lg px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-blue-900/50 hover:shadow-blue-800/60"
            >
              <Zap className="w-5 h-5" />
              Free Skill Test Shuru Karo
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="group flex items-center justify-center gap-2 w-full sm:w-auto border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold text-base px-7 py-4 rounded-2xl transition-all"
            >
              <Play className="w-4 h-4" />
              Kaise Kaam Karta Hai
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              "✅ Bilkul Free Start",
              "🔒 Secure Platform",
              "🤖 AI Powered",
              "💰 750 PKR/Month",
              "🏆 35,000 PKR Prize",
            ].map((badge) => (
              <span key={badge} className="text-slate-400 text-xs font-medium bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                {badge}
              </span>
            ))}
          </div>

          {/* Animated quiz visual */}
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-blue-600/20 blur-xl" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0D1626]/90 backdrop-blur-sm p-5 text-left shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500 ml-2">Skilnex AI Skill Test</span>
                <span className="ml-auto text-xs font-mono text-cyan-400 animate-pulse">⏱ 0:24</span>
              </div>
              <p className="text-white font-semibold text-sm mb-3">Pehle kaunsi skill seekhna chahte ho?</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: "Freelancing", sel: true },
                  { label: "Shopify", sel: false },
                  { label: "AI Tools", sel: false },
                  { label: "Digital Marketing", sel: false },
                ].map((o) => (
                  <div key={o.label} className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${o.sel ? "border-blue-500 bg-blue-600/20 text-blue-300" : "border-slate-700 bg-slate-800/60 text-slate-400"}`}>
                    {o.sel && <span className="mr-1">✓</span>}{o.label}
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/20 p-3 flex items-start gap-2.5">
                <Brain className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-emerald-300 text-xs font-bold">AI Analysis Complete ✅</p>
                  <p className="text-slate-400 text-xs mt-0.5">Best match: <span className="text-white font-medium">Fiverr Freelancing Masterclass</span> · 94% fit · 50,000 PKR/month possible</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button onClick={() => scrollTo("how-it-works")} className="animate-bounce text-slate-600 hover:text-slate-400 transition-colors">
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="py-16 px-4 bg-[#0A1020]">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Kya Tumhara Bhi Yeh Haal Hai? 😔</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { emoji: "😩", text: "Degree hai lekin job nahi" },
              { emoji: "💸", text: "Online earning karna chahte ho lekin kahan se shuru karein?" },
              { emoji: "😕", text: "Courses dekhte ho lekin confused rehte ho" },
              { emoji: "⏰", text: "Time waste hota hai galat cheezein seekh ke" },
              { emoji: "🤷", text: "Kaunsi skill mein career banana chahiye pata nahi" },
              { emoji: "😰", text: "Ghar wale pressure dete hain" },
            ].map((p, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="rounded-xl border border-red-500/20 bg-red-900/10 p-4 flex items-center gap-3">
                  <span className="text-2xl">{p.emoji}</span>
                  <p className="text-slate-300 text-sm">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center">
            <p className="text-2xl font-black text-white mb-2">Skilnex ka AI iska hal hai! 🎯</p>
            <p className="text-slate-400 text-base">30 second mein tumhara best career path discover karo</p>
          </Reveal>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Kaise Kaam Karta Hai?</h2>
            <p className="text-slate-400 mt-3 text-base max-w-lg mx-auto">Zero se AI mentor tak — 1 minute mein!</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-blue-500/40 via-cyan-500/40 to-emerald-500/40" />
            {[
              { step: "01", icon: Target, color: "blue", label: "Test Do", desc: "5 sawal ka jawab do — 30 second lagte hain. Koi signup nahi chahiye shuru mein." },
              { step: "02", icon: Brain, color: "cyan", label: "AI Analyze Karega", desc: "Tumhara AI tumhare jawab dekh ke best career path aur courses recommend karega." },
              { step: "03", icon: Sparkles, color: "emerald", label: "Roadmap Pao", desc: "Personalized course list, earning potential, aur step-by-step first client guide." },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 120} className="relative">
                <div className={`rounded-2xl border bg-gradient-to-br p-7 text-center h-full
                  ${s.color === "blue" ? "border-blue-500/25 from-blue-900/20 to-[#0A1020]" : ""}
                  ${s.color === "cyan" ? "border-cyan-500/25 from-cyan-900/20 to-[#0A1020]" : ""}
                  ${s.color === "emerald" ? "border-emerald-500/25 from-emerald-900/20 to-[#0A1020]" : ""}
                `}>
                  <div className={`mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center
                    ${s.color === "blue" ? "bg-blue-600/20 text-blue-400" : ""}
                    ${s.color === "cyan" ? "bg-cyan-600/20 text-cyan-400" : ""}
                    ${s.color === "emerald" ? "bg-emerald-600/20 text-emerald-400" : ""}
                  `}>
                    <s.icon className="w-7 h-7" />
                  </div>
                  <div className={`text-5xl font-black opacity-10 absolute top-5 right-6 leading-none
                    ${s.color === "blue" ? "text-blue-400" : ""}
                    ${s.color === "cyan" ? "text-cyan-400" : ""}
                    ${s.color === "emerald" ? "text-emerald-400" : ""}
                  `}>{s.step}</div>
                  <p className={`text-xs font-black uppercase tracking-widest mb-2
                    ${s.color === "blue" ? "text-blue-400" : ""}
                    ${s.color === "cyan" ? "text-cyan-400" : ""}
                    ${s.color === "emerald" ? "text-emerald-400" : ""}
                  `}>Step {s.step}</p>
                  <h3 className="text-white font-bold text-xl mb-3">{s.label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EARNING POTENTIAL ─── */}
      <section className="py-16 px-4 bg-[#0A1020]">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-10">
            <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-3">Real Earning Potential</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Ghar Baith Ke Kitna Kama Sakte Ho?</h2>
            <p className="text-slate-400">Pakistan mein yeh log already kama rahe hain 👇</p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { skill: "Graphic Design", earn: "30,000 - 80,000", icon: "🎨" },
              { skill: "Web Development", earn: "50,000 - 2,00,000", icon: "💻" },
              { skill: "Digital Marketing", earn: "40,000 - 1,50,000", icon: "📱" },
              { skill: "Video Editing", earn: "25,000 - 70,000", icon: "🎬" },
              { skill: "Freelancing", earn: "50,000 - 3,00,000", icon: "💼" },
              { skill: "AI Tools", earn: "60,000 - 2,50,000", icon: "🤖" },
            ].map((e, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-900/10 p-4 text-center">
                  <div className="text-3xl mb-2">{e.icon}</div>
                  <p className="text-white font-bold text-sm mb-1">{e.skill}</p>
                  <p className="text-emerald-400 font-black text-xs">Rs. {e.earn}</p>
                  <p className="text-slate-500 text-xs">per month</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center mt-8">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-900/30">
              <Zap className="w-5 h-5" />
              Main Bhi Kamana Chahta/Chahti Hoon!
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ─── WHY JOIN ─── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-3">Platform Benefits</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Skilnex Kyun Join Karein?</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Zap, color: "blue", title: "30-Second Skill Test", desc: "Apna best skill area instantly discover karo — time waste nahi." },
              { icon: Brain, color: "cyan", title: "AI Course Recommendation", desc: "AI tumhare liye best courses choose karega — confused mat raho." },
              { icon: Sparkles, color: "violet", title: "Personal AI Mentor", desc: "24/7 mentor — koi bhi sawal poochho — instant jawab milega." },
              { icon: TrendingUp, color: "emerald", title: "50+ Premium Courses", desc: "Freelancing, Web Dev, AI, Digital Marketing — sab kuch ek jagah." },
              { icon: Gift, color: "yellow", title: "35,000 PKR Cash Prize", desc: "Early members ke liye massive cash giveaway — sirf join karo!" },
              { icon: Users, color: "orange", title: "Referral Bonuses", desc: "Dost lao — extra prize tickets jeeto — milke karo!" },
            ].map((b, i) => (
              <Reveal key={b.title} delay={i * 60}>
                <div className={`rounded-2xl border p-6 h-full flex gap-4 transition-all hover:-translate-y-0.5
                  ${b.color === "blue" ? "border-blue-500/20 bg-blue-900/10 hover:border-blue-500/40" : ""}
                  ${b.color === "cyan" ? "border-cyan-500/20 bg-cyan-900/10 hover:border-cyan-500/40" : ""}
                  ${b.color === "violet" ? "border-violet-500/20 bg-violet-900/10 hover:border-violet-500/40" : ""}
                  ${b.color === "emerald" ? "border-emerald-500/20 bg-emerald-900/10 hover:border-emerald-500/40" : ""}
                  ${b.color === "yellow" ? "border-yellow-500/20 bg-yellow-900/10 hover:border-yellow-500/40" : ""}
                  ${b.color === "orange" ? "border-orange-500/20 bg-orange-900/10 hover:border-orange-500/40" : ""}
                `}>
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center
                    ${b.color === "blue" ? "bg-blue-600/20 text-blue-400" : ""}
                    ${b.color === "cyan" ? "bg-cyan-600/20 text-cyan-400" : ""}
                    ${b.color === "violet" ? "bg-violet-600/20 text-violet-400" : ""}
                    ${b.color === "emerald" ? "bg-emerald-600/20 text-emerald-400" : ""}
                    ${b.color === "yellow" ? "bg-yellow-600/20 text-yellow-400" : ""}
                    ${b.color === "orange" ? "bg-orange-600/20 text-orange-400" : ""}
                  `}>
                    <b.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{b.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MILESTONE REWARDS ─── */}
      <section id="rewards" className="py-20 px-4 bg-[#0A1020] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-yellow-500/5 blur-[100px]" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full mb-5 tracking-wider uppercase animate-pulse">
              🏆 Live Giveaway — Real Paise
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Early Users Jeetu Bade Prizes!</h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">Abhi join karo — automatically cash giveaway mein entry ho jaayegi!</p>
          </Reveal>

          <Reveal>
            <div className="flex items-center justify-center mb-8">
              <div className="inline-flex items-center gap-4 bg-[#111927] border border-yellow-500/20 rounded-2xl px-6 py-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-50" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400" />
                  </span>
                  <span className="text-slate-400 text-sm font-medium">Abhi tak join kiye:</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-white tabular-nums">{activeUsers.toLocaleString()}</span>
                  <span className="text-slate-500 text-xl font-bold">/ 300</span>
                </div>
                <div className="text-yellow-400 font-bold text-sm hidden sm:block">Phase 1</div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Reveal delay={60}>
              <div className="rounded-2xl border border-yellow-500/35 bg-gradient-to-br from-yellow-900/20 via-[#0d1120] to-orange-900/10 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-yellow-300 font-black text-base leading-tight">Phase 1</p>
                      <p className="text-slate-500 text-xs">Pehle 300 Members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/30 rounded-full px-3 py-1">
                    <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-400" /></span>
                    <span className="text-yellow-300 text-xs font-bold">LIVE NOW</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-white mb-1">Rs. 35,000</p>
                <p className="text-slate-400 text-xs mb-5">Total Prize Pool · 3 Winners</p>
                <div className="space-y-2 mb-5">
                  {[
                    { rank: "🥇 1st Place", prize: "Rs. 20,000", color: "text-yellow-300" },
                    { rank: "🥈 2nd Place", prize: "Rs. 10,000", color: "text-slate-300" },
                    { rank: "🥉 3rd Place", prize: "Rs.  5,000", color: "text-orange-300" },
                  ].map((w) => (
                    <div key={w.rank} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                      <span className="text-xs">{w.rank}</span>
                      <span className={`text-sm font-black tabular-nums ${w.color}`}>{w.prize}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-yellow-400 font-bold">{activeUsers} / 300 members</span>
                  </div>
                  <div className="h-3 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-400 transition-all duration-1000" style={{ width: `${m1Pct}%` }} />
                  </div>
                  <p className="text-yellow-500/70 text-xs text-right">{m1Pct}% complete · {spotsLeft} spots baqi</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/15 via-[#0d1120] to-blue-900/10 p-6 shadow-xl relative overflow-hidden">
                {activeUsers < 300 && (
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm font-semibold">300 Members Pe Unlock Hoga</p>
                      <p className="text-slate-600 text-xs mt-1">Phase 1 pehle complete karo</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-purple-300 font-black text-base leading-tight">Mega Phase</p>
                      <p className="text-slate-500 text-xs">1,000 Members Milestone</p>
                    </div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/25 rounded-full px-3 py-1">
                    <span className="text-purple-300 text-xs font-bold">UPCOMING 🔥</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-white mb-1">Rs. 1,00,000</p>
                <p className="text-slate-400 text-xs mb-5">Mega Prize Pool · 6 Winners</p>
                <div className="space-y-2 mb-5">
                  {[
                    { rank: "🥇 Grand Prize", prize: "Rs. 50,000" },
                    { rank: "🥈 2nd Place", prize: "Rs. 25,000" },
                    { rank: "🏅 3–6 Runners", prize: "Rs. 6,250 each" },
                  ].map((w) => (
                    <div key={w.rank} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                      <span className="text-xs">{w.rank}</span>
                      <span className="text-sm font-black tabular-nums text-purple-300">{w.prize}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-purple-400 font-bold">{activeUsers} / 1,000 members</span>
                  </div>
                  <div className="h-3 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-400 transition-all duration-1000" style={{ width: `${m2Pct}%` }} />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-8 text-center">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 active:scale-95 text-black font-extrabold text-base px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-orange-900/30">
              <Gift className="w-5 h-5" />
              Meri Seat Reserve Karo — Prize Draw Mein Entry!
              <ChevronRight className="w-5 h-5" />
            </Link>
            <p className="text-slate-600 text-xs mt-3">Sirf Rs. 750/month · Cancel anytime</p>
          </Reveal>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-yellow-400 font-bold text-xs uppercase tracking-widest mb-3">Real User Stories</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Real Log — Real Results 🔥</h2>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { value: `${activeUsers}+`, label: "Active Members", color: "text-blue-400" },
                { value: "98%", label: "Positive Feedback", color: "text-emerald-400" },
                { value: "50+", label: "Premium Courses", color: "text-cyan-400" },
                { value: "24/7", label: "AI Mentor Online", color: "text-violet-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/5 bg-white/2 p-5 text-center">
                  <div className={`text-3xl font-black ${s.color} mb-1`}>{s.value}</div>
                  <p className="text-slate-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: "Ahmed K.", city: "Lahore", text: "Degree ke baad 6 mahine tak job nahi mili. Skilnex ne mujhe Fiverr pe pehla client dilwaya — sirf 3 mahine mein!", init: "A" },
              { name: "Sara M.", city: "Karachi", text: "AI mentor ne raat 3 baje mera Shopify error fix karwaya. Yeh platform sach mein game changer hai!", init: "S" },
              { name: "Usman T.", city: "Islamabad", text: "4 dost refer kiye — extra prize tickets mile! Cash contest ka idea genius hai yaar!", init: "U" },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-6">
                  <div className="flex items-center gap-0.5 mb-3">
                    {[1,2,3,4,5].map((s) => <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-xs font-bold text-blue-300">{t.init}</div>
                    <div>
                      <p className="text-white text-sm font-semibold">{t.name}</p>
                      <p className="text-slate-500 text-xs">{t.city}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-20 px-4 bg-[#070D18]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">Simple Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Free Shuru Karo — Premium Baad Mein!</h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto">Koi hidden fees nahi — cancel anytime.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-slate-700/60 bg-[#0D1626]/80 p-7">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Free</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-white">Rs. 0</span>
              </div>
              <p className="text-slate-500 text-sm mb-6">Hamesha free</p>
              <ul className="space-y-3 mb-7">
                {[
                  { text: "AI Career Roadmap (Basic)", ok: true },
                  { text: "Dashboard Access", ok: true },
                  { text: "Skill Assessment Test", ok: true },
                  { text: "AI Mentor Chat", ok: false },
                  { text: "Premium Courses", ok: false },
                  { text: "Giveaway Entry", ok: false },
                ].map((f) => (
                  <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.ok ? "text-slate-300" : "text-slate-600"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${f.ok ? "bg-green-600/30 text-green-400" : "bg-slate-700 text-slate-600"}`}>
                      {f.ok ? "✓" : "✕"}
                    </span>
                    <span className={f.ok ? "" : "line-through"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="flex items-center justify-center gap-2 w-full border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 font-semibold py-3 rounded-xl transition-colors text-sm">
                Free Shuru Karo
              </Link>
            </div>

            <div className="rounded-2xl border border-blue-500/50 bg-gradient-to-br from-blue-900/25 via-[#0D1626]/80 to-purple-900/20 p-7 relative overflow-hidden" style={{ boxShadow: "0 0 60px -12px rgba(59,130,246,0.3)" }}>
              <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-black px-3 py-1 rounded-full tracking-wide">
                MOST POPULAR
              </div>
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">Premium</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-white">Rs. 750</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">Ek chai ka kharcha — lifetime skills!</p>
              <ul className="space-y-3 mb-7">
                {[
                  "Unlimited AI Mentor Chat",
                  "Saare 50+ Premium Courses",
                  "AI Career Roadmap Saved",
                  "Giveaway Entry (Rs. 35,000+ jeeto!)",
                  "Course Completion Certificate",
                  "WhatsApp Priority Support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 flex items-center justify-center shrink-0 text-xs font-bold text-blue-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-xl shadow-blue-900/40 text-sm">
                <Zap className="w-4 h-4" /> Premium Lo — Prize Jeeto!
              </Link>
              <p className="text-center text-slate-600 text-xs mt-3">Free test pehle · Phir decide karo</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#070D18] to-cyan-900/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-blue-700/15 blur-[100px]" />
        </div>
        <Reveal className="relative max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider">
            ⏳ Sirf {spotsLeft} spots baqi hain!
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Abba ne kaha degree lo...
          </h2>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-400 mb-2">
            Degree ne kaha job nahi...
          </h2>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-green-400 mb-6">
            Skilnex keh raha hai — Ao! 🚀
          </h2>
          <p className="text-slate-400 text-base mb-8 max-w-sm mx-auto">
            30 second mein free test do — AI tumhara career decide karega!
          </p>
          <Link href="/signup" className="group flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 active:scale-[0.97] text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all shadow-2xl shadow-green-900/60 w-full sm:w-auto mx-auto">
            <Zap className="w-5 h-5" />
            FREE mein check karo ✅
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-slate-600 text-xs mt-4">Rs. 750/month · Cancel anytime · Koi risk nahi</p>
        </Reveal>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 bg-[#04080F] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Skilnex</p>
                <p className="text-slate-600 text-xs">Pakistan's #1 AI Skill Platform</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <Link href="/signup" className="text-slate-400 hover:text-white transition-colors">Sign Up</Link>
              <Link href="/login" className="text-slate-400 hover:text-white transition-colors">Login</Link>
              <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/5">
            <p className="text-slate-700 text-xs">© {new Date().getFullYear()} Skilnex. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs">
              <a href="mailto:skilnex@gmail.com" className="text-slate-600 hover:text-slate-400 transition-colors">skilnex@gmail.com</a>
              <a href="https://wa.me/923124494267?text=Hi%20Skilnex%20Support!" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-400 transition-colors font-medium">
                <MessageCircle className="w-3 h-3" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── WHATSAPP FLOAT BUTTON ─── */}
      <a
        href="https://wa.me/923124494267?text=Hi%20Skilnex!%20Mujhe%20more%20info%20chahiye!"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] rounded-full flex items-center justify-center shadow-2xl shadow-green-900/50 transition-all hover:scale-110 active:scale-95"
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.47.644 4.887 1.87 7.01L2 30l7.19-1.888A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.538a11.51 11.51 0 0 1-5.88-1.612l-.42-.25-4.27 1.12 1.14-4.15-.274-.428A11.503 11.503 0 0 1 4.46 16.003c0-6.367 5.178-11.544 11.543-11.544 6.366 0 11.543 5.177 11.543 11.544 0 6.366-5.177 11.535-11.543 11.535zm6.326-8.642c-.347-.174-2.054-1.015-2.374-1.13-.318-.116-.55-.174-.78.174-.23.347-.895 1.13-1.098 1.362-.202.23-.405.26-.752.087-.347-.174-1.466-.54-2.793-1.724-1.033-.92-1.73-2.057-1.932-2.404-.203-.347-.022-.535.152-.708.158-.155.347-.405.52-.607.174-.202.232-.347.347-.578.116-.232.058-.434-.029-.607-.087-.174-.78-1.88-1.07-2.575-.28-.676-.566-.584-.78-.595l-.664-.01c-.23 0-.607.086-.924.434-.318.347-1.214 1.187-1.214 2.893 0 1.707 1.243 3.356 1.416 3.588.174.232 2.446 3.732 5.927 5.235.828.357 1.474.57 1.978.73.83.264 1.587.227 2.183.137.666-.1 2.054-.84 2.345-1.652.29-.81.29-1.506.203-1.652-.086-.145-.318-.23-.665-.404z" />
        </svg>
      </a>

    </div>
  );
}
