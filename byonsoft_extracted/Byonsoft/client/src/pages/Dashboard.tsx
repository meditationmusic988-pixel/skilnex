import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Lock, Zap, TrendingUp, Star, Award, ChevronRight,
  Brain, Activity, LogOut, CheckCircle, Download, User, Phone, FileText, Shield as ShieldIcon,
  Trophy, Briefcase, DollarSign, ListOrdered, MessageCircle, X as XIcon, Target, Users, Rocket
} from "lucide-react";
import { MegaLaunchBanner, ReferralCard, ReferralRewards } from "@/components/GiveawayBanner";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import type { Course, Progress as ProgressType, SkillScore } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: progressList = [] } = useQuery<ProgressType[]>({
    queryKey: ["/api/progress"],
  });

  const { data: skillScore } = useQuery<SkillScore | null>({
    queryKey: ["/api/skills"],
  });

  const { data: priceSetting } = useQuery<{ subscription_price: number }>({
    queryKey: ["/api/settings/price"],
  });
  const price = priceSetting?.subscription_price ?? 750;

  const { data: giveawayStats } = useQuery<{ activeUsers: number; nextMilestone: number; prevMilestone: number }>({
    queryKey: ["/api/giveaway/stats"],
    staleTime: 1000 * 60 * 5,
  });
  const premiumCount = giveawayStats?.activeUsers ?? 0;
  const isPhase2 = premiumCount >= 300;

  const hasAssessment = !!(skillScore?.goal);

  const getProgress = (courseId: number) => {
    return progressList.find((p) => p.course_id === courseId);
  };

  const roadmapSkills = useMemo(() => {
    const raw: string[] = [];
    if (skillScore?.roadmap_result) {
      try {
        const parsed = JSON.parse(skillScore.roadmap_result);
        if (Array.isArray(parsed.recommended_courses)) raw.push(...parsed.recommended_courses);
        if (Array.isArray(parsed.career_paths)) raw.push(...parsed.career_paths);
      } catch {}
    }
    return raw
      .map((s) => s.trim().toLowerCase())
      .filter((v) => v.length > 0)
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [skillScore]);

  const isTagMatch = useMemo(() => {
    return (course: Course): boolean => {
      if (!roadmapSkills.length) return false;
      const courseTags = (course.tags || "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
      if (!courseTags.length) return false;
      return roadmapSkills.some((skill) =>
        courseTags.some((tag) => tag.includes(skill) || skill.includes(tag))
      );
    };
  }, [roadmapSkills]);

  const sortedCourses = useMemo(() => {
    if (!roadmapSkills.length) return courses;
    const matched = courses.filter((c) => isTagMatch(c));
    const rest = courses.filter((c) => !isTagMatch(c));
    return [...matched, ...rest];
  }, [courses, roadmapSkills, isTagMatch]);

  const hasRoadmapMatches = roadmapSkills.length > 0 && courses.some((c) => isTagMatch(c));

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("byonsoft_token")}` },
      });
      const u = await res.json();
      if (u.id) updateUser(u);
    } catch {}
  };

  const downloadCertificate = (course: Course) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Certificate - ${course.title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .cert { width: 900px; min-height: 640px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%); border: 3px solid #3b82f6; border-radius: 24px; padding: 60px 80px; text-align: center; color: white; position: relative; box-shadow: 0 0 80px rgba(59,130,246,0.3); }
  .corner { position: absolute; width: 80px; height: 80px; border-color: #3b82f6; border-style: solid; }
  .tl { top: 20px; left: 20px; border-width: 3px 0 0 3px; border-radius: 8px 0 0 0; }
  .tr { top: 20px; right: 20px; border-width: 3px 3px 0 0; border-radius: 0 8px 0 0; }
  .bl { bottom: 20px; left: 20px; border-width: 0 0 3px 3px; border-radius: 0 0 0 8px; }
  .br { bottom: 20px; right: 20px; border-width: 0 3px 3px 0; border-radius: 0 0 8px 0; }
  .logo { font-size: 13px; color: #94a3b8; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; }
  .title { font-family: 'Playfair Display', serif; font-size: 48px; color: #f8fafc; margin-bottom: 4px; }
  .subtitle { font-size: 14px; color: #64748b; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 40px; }
  .divider { width: 200px; height: 2px; background: linear-gradient(90deg, transparent, #3b82f6, transparent); margin: 0 auto 40px; }
  .presented { font-size: 14px; color: #64748b; margin-bottom: 12px; }
  .name { font-family: 'Playfair Display', serif; font-size: 36px; color: #60a5fa; margin-bottom: 24px; }
  .course-label { font-size: 14px; color: #64748b; margin-bottom: 8px; }
  .course { font-size: 22px; font-weight: 600; color: #f1f5f9; margin-bottom: 8px; }
  .category { display: inline-block; background: rgba(59,130,246,0.2); border: 1px solid rgba(59,130,246,0.4); color: #93c5fd; padding: 4px 16px; border-radius: 100px; font-size: 12px; margin-bottom: 40px; }
  .divider2 { width: 100%; height: 1px; background: rgba(59,130,246,0.2); margin-bottom: 30px; }
  .footer { display: flex; justify-content: space-between; align-items: flex-end; }
  .sig { text-align: left; }
  .sig-name { font-size: 16px; font-weight: 600; color: #f1f5f9; }
  .sig-role { font-size: 12px; color: #64748b; }
  .stamp { width: 80px; height: 80px; border: 2px solid #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; }
  .stamp-text { font-size: 8px; color: #3b82f6; font-weight: 600; text-align: center; letter-spacing: 1px; }
  .date-section { text-align: right; }
  .date-label { font-size: 12px; color: #64748b; }
  .date-val { font-size: 14px; color: #f1f5f9; font-weight: 600; }
  @media print { body { background: white; } }
</style></head>
<body><div class="cert">
  <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
  <div class="logo">Byonsoft OS — Master Database</div>
  <div class="title">Certificate</div>
  <div class="subtitle">of Course Completion</div>
  <div class="divider"></div>
  <div class="presented">This is to certify that</div>
  <div class="name">${user?.name || "Student"}</div>
  <div class="course-label">has successfully completed</div>
  <div class="course">${course.title}</div>
  <div class="category">${course.category}</div>
  <div class="divider2"></div>
  <div class="footer">
    <div class="sig"><div class="sig-name">Byonsoft OS Team</div><div class="sig-role">Course Instructor</div></div>
    <div class="stamp"><div class="stamp-text">BYONSOFT<br/>CERTIFIED<br/>✓</div></div>
    <div class="date-section"><div class="date-label">Date of Completion</div><div class="date-val">${dateStr}</div></div>
  </div>
</div></body></html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 800);
    }
  };

  const categoryColors: Record<string, string> = {
    Programming: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Business: "bg-green-500/20 text-green-300 border-green-500/30",
    Marketing: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Design: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "AI/ML": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  };

  const completedCount = progressList.filter((p) => p.is_completed).length;

  const primarySkill = roadmapSkills[0] || "";
  const skillLabel = primarySkill
    ? primarySkill.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Your Skill";

  const firstClientSteps = [
    {
      step: "01",
      title: `${skillLabel} Portfolio Banao`,
      body: `${skillLabel} ke 2-3 sample projects banao — real clients na hon to fictional ya self-initiated projects bhi chalte hain. Ek clean PDF ya website pe showcase karo. Yeh tumhara pehla social proof hai.`,
      color: "from-blue-600 to-blue-700",
      icon: "🗂️",
    },
    {
      step: "02",
      title: "Fiverr / Upwork Gig Launch Karo",
      body: `${skillLabel} service ka ek strong gig banao. Apni specialty clearly likho, shuru mein competitive rate rakho, aur pehle 1-2 free ya discounted orders se 5-star reviews collect karo.`,
      color: "from-purple-600 to-purple-700",
      icon: "🚀",
    },
    {
      step: "03",
      title: "Local Businesses Ko Approach Karo",
      body: `Apne sheher ke businesses ko WhatsApp ya direct message karo. Batao ke tum unki ${skillLabel} problems solve kar sakte ho. Ek free audit ya sample offer karo — rejection se mat daro.`,
      color: "from-emerald-600 to-emerald-700",
      icon: "🏪",
    },
    {
      step: "04",
      title: "Facebook Groups & LinkedIn Use Karo",
      body: `${skillLabel} se related Facebook groups join karo. Roz ek helpful post ya answer daalo. Jab log tumhari expertise dekhein ge, woh khud DM karein ge. LinkedIn pe bhi daily activity rakho.`,
      color: "from-orange-600 to-orange-700",
      icon: "📱",
    },
    {
      step: "05",
      title: "Cold Outreach Script",
      body: `"Hi [Name], maine aapki [profile/website] dekhi — aapko ${skillLabel} mein [specific problem] hai. Main is mein expert hoon aur help kar sakta/sakti hoon. Kya 10 min call ho sakti hai?" Short aur specific rakho.`,
      color: "from-pink-600 to-pink-700",
      icon: "✉️",
    },
    {
      step: "06",
      title: "Referrals Maango",
      body: `Jab pehla ${skillLabel} client mil jaye aur kaam achha ho, poochho: 'Kya aap mujhe kisi aur ke saath refer kar sakte hain?' Word-of-mouth fastest aur free growth hack hai.`,
      color: "from-cyan-600 to-cyan-700",
      icon: "🤝",
    },
  ];

  let savedRoadmap: {
    recommended_courses?: string[];
    career_paths?: string[];
    expected_income?: string;
    learning_order?: string;
  } | null = null;
  if (skillScore?.roadmap_result) {
    try { savedRoadmap = JSON.parse(skillScore.roadmap_result); } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">

      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-900/40">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white leading-none">Byonsoft OS</p>
              <p className="text-slate-500 text-xs">Master Database</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge data-testid="status-subscription" className={user?.subscription_status ? "bg-green-900/40 text-green-300 border-green-600/30" : "bg-red-900/40 text-red-300 border-red-600/30"}>
              {user?.subscription_status ? "Premium Active" : "Free Account"}
            </Badge>
            <a
              href="https://wa.me/923124494267?text=Hi%20Byonsoft%20Support!"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-whatsapp-support"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            {user?.subscription_status ? (
              <Button
                size="sm"
                data-testid="button-ai-mentor-header"
                onClick={() => setLocation("/course/1")}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3"
              >
                <Brain className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">AI Mentor</span>
                <span className="sm:hidden">AI</span>
              </Button>
            ) : (
              <Button
                size="sm"
                data-testid="button-ai-mentor-locked"
                onClick={() => setUpgradeOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-3 border border-slate-600"
              >
                <Lock className="w-3 h-3 mr-1" />
                <Brain className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">AI Mentor</span>
              </Button>
            )}
            <Link href="/profile">
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" data-testid="button-profile">
                <User className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={() => { logout(); window.location.href = "/"; }} className="text-slate-400 hover:text-white" data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        <PWAInstallButton variant="banner" />

        <div className="bg-gradient-to-r from-blue-900/50 to-slate-800/50 rounded-2xl p-5 sm:p-7 border border-blue-800/30">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                Welcome back, <span className="text-blue-400">{user?.name}</span> 👋
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Continue your high-income skill journey</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!user?.subscription_status && (
                <Button
                  data-testid="button-upgrade"
                  size="sm"
                  onClick={() => setUpgradeOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xs px-3"
                >
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Upgrade </span>Rs. {price}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={refreshUser}
                className="border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 px-2.5"
                title="Refresh Status"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5 text-xs">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card
            data-testid="card-giveaway-tracker"
            className={`relative overflow-hidden backdrop-blur-sm transition-all duration-200 ${
              isPhase2
                ? "bg-gradient-to-br from-purple-900/40 to-slate-800/50 border-purple-600/50"
                : "bg-gradient-to-br from-yellow-900/30 to-slate-800/50 border-yellow-600/50"
            }`}
          >
            <div className={`absolute inset-x-0 top-0 h-0.5 ${isPhase2 ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-gradient-to-r from-yellow-500 to-orange-500"}`} />
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${isPhase2 ? "bg-purple-600/30" : "bg-yellow-600/20"}`}>
                  <Trophy className={`w-4 h-4 sm:w-5 sm:h-5 ${isPhase2 ? "text-purple-300" : "text-yellow-400"}`} />
                </div>
                <div className="min-w-0 overflow-hidden">
                  <p className={`text-xs sm:text-sm font-bold leading-tight truncate ${isPhase2 ? "text-purple-200" : "text-yellow-300"}`}>
                    {isPhase2 ? "Rs. 1 Lakh" : "Rs. 35,000"}
                  </p>
                  <p className={`text-xs truncate ${isPhase2 ? "text-purple-400" : "text-yellow-600"}`}>
                    {isPhase2 ? "Mega Giveaway" : "Phase 1 Giveaway"}
                  </p>
                  <p className="text-slate-500 text-[10px] truncate">
                    {isPhase2 ? "1000 Members" : "300 Members"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {[
            { label: "Completed", value: completedCount, icon: Award, color: "text-green-400" },
            { label: "AI Assessment", value: hasAssessment ? "Done ✓" : "Pending", icon: Star, color: hasAssessment ? "text-green-400" : "text-yellow-400" },
            { label: "In Progress", value: progressList.length - completedCount, icon: TrendingUp, color: "text-purple-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-800/50 border-slate-700/60 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-700/60 flex items-center justify-center shrink-0">
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <p className="text-xl sm:text-2xl font-bold text-white leading-none">{stat.value}</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5 truncate">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {savedRoadmap && savedRoadmap.recommended_courses ? (
          <div data-testid="panel-saved-roadmap" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/30 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-300" />
                </div>
                <h2 className="text-lg font-bold text-white">Your AI Career Roadmap</h2>
              </div>
              <Button
                data-testid="button-update-roadmap"
                size="sm"
                variant="outline"
                onClick={() => setLocation("/skill-test?new=1")}
                className="border-purple-500/40 text-purple-300 hover:bg-purple-900/30 text-xs"
              >
                🔄 Update
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {savedRoadmap.recommended_courses?.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700/60 overflow-hidden" data-testid="dash-card-courses">
                  <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <p className="text-white font-bold text-sm">Recommended Courses</p>
                    </div>
                    <div className="space-y-2">
                      {savedRoadmap.recommended_courses!.slice(0, 4).map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="text-slate-300 truncate">{c}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {savedRoadmap.career_paths?.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700/60" data-testid="dash-card-careers">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-green-400" />
                      <p className="text-white font-bold text-sm">Career Paths</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {savedRoadmap.career_paths!.map((p, i) => (
                        <Badge key={i} className="bg-green-900/30 border-green-600/30 text-green-300 text-xs px-2.5 py-1">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {savedRoadmap.expected_income && (
                <Card className="bg-gradient-to-r from-emerald-900/40 to-teal-900/30 border-emerald-600/30" data-testid="dash-card-income">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest">Expected Income</p>
                    </div>
                    <p className="text-white text-base font-bold line-clamp-2 break-words">
                      {savedRoadmap.expected_income.split("\n")[0].trim()}
                    </p>
                  </CardContent>
                </Card>
              )}

              {savedRoadmap.learning_order && (
                <Card className="bg-slate-800/50 border-slate-700/60 overflow-hidden" data-testid="dash-card-learning">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ListOrdered className="w-4 h-4 text-cyan-400" />
                      <p className="text-white font-bold text-sm">Learning Order</p>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      {savedRoadmap.learning_order.split("\n").slice(0, 3).map((l: string) => l.trim()).filter(Boolean).join(" → ")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div
            data-testid="banner-ai-roadmap"
            className="relative overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-900/60 via-blue-900/50 to-slate-900/80 p-8 text-center"
          >
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl" />
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/40 border border-purple-500/50 flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-purple-300" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">AI Skill Test & Career Roadmap</h2>
              <p className="text-slate-300 text-base max-w-xl mx-auto">
                Apna background batao — AI tumhare liye personalized career roadmap banaye ga with recommended courses, career paths, aur income estimates!
              </p>
              <Button
                data-testid="button-get-roadmap"
                size="lg"
                onClick={() => setLocation("/skill-test?new=1")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-base px-8 py-6 rounded-xl shadow-lg shadow-purple-900/40"
              >
                <Brain className="w-5 h-5 mr-2" />
                Get My Roadmap
              </Button>
              <div className="flex items-center justify-center gap-6 pt-1 text-slate-400 text-sm">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> Sirf 2 minute</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> 100% Free</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> AI Powered</span>
              </div>
            </div>
          </div>
        )}

        <div data-testid="section-first-client-guide">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                🚀 How to Get Your First Client
              </h2>
              {primarySkill && (
                <p className="text-emerald-400 text-xs font-medium mt-0.5">
                  Personalized for: {skillLabel}
                </p>
              )}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-emerald-700/30 bg-slate-800/50">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
            <div
              data-testid="guide-content"
              className={`p-6 space-y-4 transition-all duration-300 ${!user?.subscription_status ? "blur-[10px] select-none pointer-events-none" : ""}`}
            >
              {firstClientSteps.map((item) => (
                <div key={item.step} className="flex gap-4 p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 text-lg shadow-lg`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-500">STEP {item.step}</span>
                    </div>
                    <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {!user?.subscription_status && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/50 backdrop-blur-sm">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-white font-bold text-lg">Premium Content</p>
                  <p className="text-slate-400 text-sm">Personalized client guide — unlock karo premium mein</p>
                </div>
                <Button
                  data-testid="button-unlock-guide"
                  onClick={() => setUpgradeOpen(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-5 text-base shadow-lg shadow-emerald-900/40"
                >
                  🔓 Unlock for Rs. {price} PKR
                </Button>
              </div>
            )}
          </div>
        </div>

        <MegaLaunchBanner
          isPremium={!!user?.subscription_status}
          onUpgrade={() => setUpgradeOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ReferralCard />
          <ReferralRewards />
        </div>

        {!user?.subscription_status && (
          <div data-testid="section-pricing-cards">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Choose Your Plan
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-5">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Free</p>
                <p className="text-3xl font-black text-white mb-0.5">Rs. 0</p>
                <p className="text-slate-500 text-xs mb-4">Always free to explore</p>
                <ul className="space-y-2 mb-4 text-sm">
                  {[
                    { text: "Basic AI Career Roadmap", ok: true },
                    { text: "Dashboard Access", ok: true },
                    { text: "AI Mentor Chat", ok: false },
                    { text: "Premium Courses", ok: false },
                    { text: "Giveaway Tickets", ok: false },
                  ].map((f) => (
                    <li key={f.text} className={`flex items-center gap-2 ${f.ok ? "text-slate-300" : "text-slate-600 line-through"}`}>
                      {f.ok ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> : <XIcon className="w-4 h-4 text-slate-600 shrink-0" />}
                      {f.text}
                    </li>
                  ))}
                </ul>
                <div className="text-center text-slate-500 text-xs font-medium py-2">Current Plan</div>
              </div>

              <div
                className="rounded-2xl border border-blue-500/50 bg-gradient-to-br from-blue-900/30 via-slate-800/50 to-purple-900/20 p-5 relative overflow-hidden"
                style={{ boxShadow: "0 0 40px -10px rgba(59,130,246,0.25)" }}
              >
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">BEST VALUE</div>
                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Premium</p>
                <p className="text-3xl font-black text-white mb-0.5">Rs. {price}<span className="text-slate-400 text-sm font-normal">/mo</span></p>
                <p className="text-slate-400 text-xs mb-4">Unlock everything + giveaway entry</p>
                <ul className="space-y-2 mb-5 text-sm">
                  {[
                    "Unlimited AI Mentor Chat",
                    "All Premium Courses",
                    "Saved AI Career Roadmap",
                    "Giveaway Ticket (Win Rs. 35,000+)",
                    "Certificate on Completion",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  data-testid="button-upgrade-pricing"
                  onClick={() => setUpgradeOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold"
                >
                  <Zap className="w-4 h-4 mr-2" /> Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              All Courses
              {hasRoadmapMatches && (
                <span className="text-xs font-normal text-purple-400 bg-purple-900/30 border border-purple-700/40 px-2 py-0.5 rounded-full ml-1">
                  ⭐ Sorted by your roadmap
                </span>
              )}
            </h2>
          </div>

          {hasRoadmapMatches && (
            <div className="mb-5 flex items-center gap-2.5 p-3 rounded-xl bg-purple-900/20 border border-purple-700/30">
              <span className="text-lg">⭐</span>
              <p className="text-purple-200 text-sm font-medium">
                Courses matching your AI roadmap are shown first.
              </p>
            </div>
          )}

          {!user?.subscription_status && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/30 flex items-center gap-3">
              <Lock className="w-5 h-5 text-yellow-400 shrink-0" />
              <p className="text-yellow-300 text-sm">
                Upgrade to Premium (Rs. {price}/month) to unlock all courses and AI features
              </p>
              <Button size="sm" onClick={() => setUpgradeOpen(true)} className="ml-auto bg-yellow-600 text-white shrink-0">
                Upgrade
              </Button>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coursesLoading
              ? Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-5 space-y-3">
                      <Skeleton className="h-4 w-3/4 bg-slate-700" />
                      <Skeleton className="h-3 w-1/2 bg-slate-700" />
                      <Skeleton className="h-2 w-full bg-slate-700" />
                    </CardContent>
                  </Card>
                ))
              : sortedCourses.map((course) => {
                  const prog = getProgress(course.id);
                  const isLocked = !user?.subscription_status;
                  const isCompleted = prog?.is_completed === true;
                  const progressPct = prog ? Math.min(100, (prog.lessons_completed / 10) * 100) : 0;
                  const isRecommended = isTagMatch(course);

                  return (
                    <Card
                      key={course.id}
                      data-testid={`card-course-${course.id}`}
                      className={`
                        relative group transition-all duration-300 cursor-pointer overflow-hidden
                        ${isRecommended
                          ? "bg-gradient-to-br from-purple-900/20 via-slate-800/60 to-slate-800/50 border-purple-500/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/30"
                          : isLocked
                          ? "bg-slate-800/50 border-slate-700/60 opacity-70 hover:border-yellow-600/30"
                          : isCompleted
                          ? "bg-slate-800/50 border-green-600/40 hover:border-green-500/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/20"
                          : "bg-slate-800/50 border-slate-700/60 hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20"
                        }
                      `}
                      onClick={() => {
                        if (isLocked) setUpgradeOpen(true);
                        else setLocation(`/course/${course.id}`);
                      }}
                    >
                      {isRecommended && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-blue-400 to-purple-500" />
                      )}
                      {!isRecommended && isCompleted && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-400" />
                      )}

                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex flex-col gap-1.5">
                            <Badge className={`text-xs w-fit ${categoryColors[course.category] || "bg-slate-700 text-slate-300"}`}>
                              {course.category}
                            </Badge>
                            {isRecommended && (
                              <span
                                data-testid={`badge-recommended-${course.id}`}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-200 bg-purple-900/40 border border-purple-500/40 px-2 py-0.5 rounded-full w-fit"
                              >
                                ⭐ Recommended
                              </span>
                            )}
                          </div>
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                          ) : isCompleted ? (
                            <Award className="w-4 h-4 text-green-400 shrink-0" />
                          ) : (
                            <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isRecommended ? "text-purple-400 group-hover:text-purple-300" : "text-slate-500 group-hover:text-blue-400"}`} />
                          )}
                        </div>
                        <h3 className={`font-semibold mb-1 leading-snug transition-colors ${isRecommended ? "text-white group-hover:text-purple-100" : "text-white group-hover:text-blue-100"}`}>
                          {course.title}
                        </h3>
                        <p className="text-slate-400 text-xs mb-4 line-clamp-2">{course.description}</p>

                        <div className="space-y-1.5 mb-3">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Progress</span>
                            <span className={isCompleted ? "text-green-400 font-medium" : ""}>
                              {isCompleted ? "Completed!" : `${prog?.lessons_completed ?? 0}/10 lessons`}
                            </span>
                          </div>
                          <Progress value={isCompleted ? 100 : progressPct} className={`h-1.5 ${isCompleted ? "bg-slate-700 [&>div]:bg-green-500" : "bg-slate-700"}`} />
                        </div>

                        {isCompleted && !isLocked && (
                          <Button
                            data-testid={`button-certificate-${course.id}`}
                            size="sm"
                            className="w-full bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 text-white font-medium text-xs gap-1.5 mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadCertificate(course);
                            }}
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Certificate
                          </Button>
                        )}

                        {isLocked && (
                          <div className="mt-3 text-center">
                            <span className="text-xs text-yellow-400 font-medium flex items-center justify-center gap-1">
                              <Lock className="w-3 h-3" /> Unlock with Premium
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/60 bg-slate-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Byonsoft OS</p>
                <p className="text-slate-500 text-xs">Master Database Platform</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-slate-400 text-sm">
              <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Contact Us
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors flex items-center gap-1.5">
                <ShieldIcon className="w-3.5 h-3.5" /> Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Terms & Conditions
              </Link>
            </div>
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Byonsoft OS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
