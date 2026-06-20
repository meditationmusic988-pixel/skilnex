import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useToast } from "@/hooks/use-toast";
import { MegaLaunchBanner, ReferralCard, ReferralRewards } from "@/components/GiveawayBanner";
import { PWAInstallButton } from "@/components/PWAInstallButton";

// ── Dashboard Components ──
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { AIRoadmapSection } from "@/components/dashboard/AIRoadmapSection";
import { FirstClientGuide } from "@/components/dashboard/FirstClientGuide";
import { CoursesGrid } from "@/components/dashboard/CoursesGrid";
import { PricingSection } from "@/components/dashboard/PricingSection";
import { GiveawayTracker } from "@/components/dashboard/GiveawayTracker";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";

// ── Utils ──
import { isPremium as checkPremium } from "@/utils/premium";
import { countCompleted, countInProgress } from "@/utils/progress";
import {
  parseRoadmap,
  extractRoadmapSkills,
  isTagMatch,
  matchRoadmapCourses,
  getSkillLabel,
  buildFirstClientSteps,
} from "@/utils/roadmap";

import type { Course, Progress as ProgressType, SkillScore } from "@shared/schema";

// ── Certificate generator ──
function generateCertificateHTML(userName: string, course: Course): string {
  const dateStr = new Date().toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Certificate — ${course.title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;background:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .cert{width:900px;min-height:640px;background:linear-gradient(135deg,#1e293b 0%,#0f172a 50%,#1e293b 100%);border:3px solid #3b82f6;border-radius:24px;padding:60px 80px;text-align:center;color:white;position:relative;box-shadow:0 0 80px rgba(59,130,246,.3)}
  .corner{position:absolute;width:80px;height:80px;border-color:#3b82f6;border-style:solid}
  .tl{top:20px;left:20px;border-width:3px 0 0 3px;border-radius:8px 0 0 0}
  .tr{top:20px;right:20px;border-width:3px 3px 0 0;border-radius:0 8px 0 0}
  .bl{bottom:20px;left:20px;border-width:0 0 3px 3px;border-radius:0 0 0 8px}
  .br{bottom:20px;right:20px;border-width:0 3px 3px 0;border-radius:0 0 8px 0}
  .logo{font-size:13px;color:#94a3b8;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px}
  .title{font-family:'Playfair Display',serif;font-size:48px;color:#f8fafc;margin-bottom:4px}
  .subtitle{font-size:14px;color:#64748b;letter-spacing:4px;text-transform:uppercase;margin-bottom:40px}
  .divider{width:200px;height:2px;background:linear-gradient(90deg,transparent,#3b82f6,transparent);margin:0 auto 40px}
  .presented{font-size:14px;color:#64748b;margin-bottom:12px}
  .name{font-family:'Playfair Display',serif;font-size:36px;color:#60a5fa;margin-bottom:24px}
  .course-label{font-size:14px;color:#64748b;margin-bottom:8px}
  .course{font-size:22px;font-weight:600;color:#f1f5f9;margin-bottom:8px}
  .category{display:inline-block;background:rgba(59,130,246,.2);border:1px solid rgba(59,130,246,.4);color:#93c5fd;padding:4px 16px;border-radius:100px;font-size:12px;margin-bottom:40px}
  .divider2{width:100%;height:1px;background:rgba(59,130,246,.2);margin-bottom:30px}
  .footer{display:flex;justify-content:space-between;align-items:flex-end}
  .sig-name{font-size:16px;font-weight:600;color:#f1f5f9}
  .sig-role{font-size:12px;color:#64748b}
  .stamp{width:80px;height:80px;border:2px solid #3b82f6;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column}
  .stamp-text{font-size:8px;color:#3b82f6;font-weight:600;text-align:center;letter-spacing:1px}
  .date-label{font-size:12px;color:#64748b}
  .date-val{font-size:14px;color:#f1f5f9;font-weight:600}
</style></head>
<body><div class="cert">
  <div class="corner tl"></div><div class="corner tr"></div>
  <div class="corner bl"></div><div class="corner br"></div>
  <div class="logo">Skilnex — Pakistan's #1 Skill Platform</div>
  <div class="title">Certificate</div>
  <div class="subtitle">of Course Completion</div>
  <div class="divider"></div>
  <div class="presented">This is to certify that</div>
  <div class="name">${userName}</div>
  <div class="course-label">has successfully completed</div>
  <div class="course">${course.title}</div>
  <div class="category">${course.category}</div>
  <div class="divider2"></div>
  <div class="footer">
    <div><div class="sig-name">Skilnex Team</div><div class="sig-role">Course Instructor</div></div>
    <div class="stamp"><div class="stamp-text">SKILNEX<br/>CERTIFIED<br/>✓</div></div>
    <div style="text-align:right">
      <div class="date-label">Date of Completion</div>
      <div class="date-val">${dateStr}</div>
    </div>
  </div>
</div></body></html>`;
}

// ── Dashboard ──
export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // ── Data fetching ──
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
  const { data: giveawayStats } = useQuery<{
    activeUsers: number;
    nextMilestone: number;
    prevMilestone: number;
  }>({
    queryKey: ["/api/giveaway/stats"],
    staleTime: 1000 * 60 * 5,
  });


  // ── Derived state ──
  const price = priceSetting?.subscription_price ?? 750;
  const premium = checkPremium(user);
  const hasAssessment = !!(skillScore?.goal);
  const completedCount = useMemo(() => countCompleted(progressList), [progressList]);
  const inProgressCount = useMemo(() => countInProgress(progressList), [progressList]);
  const totalCourses = courses.length;

  const premiumCount = giveawayStats?.activeUsers ?? 0;
  const isPhase2 = premiumCount >= 300;

  // ── Roadmap + parsed result for StatsOverview ──
  const roadmap = useMemo(() => parseRoadmap(skillScore), [skillScore]);
  const roadmapResult = useMemo(() => {
    if (!skillScore?.roadmap_result) return null;
    try { return JSON.parse(skillScore.roadmap_result); } catch { return null; }
  }, [skillScore]);
  const roadmapSkills = useMemo(() => extractRoadmapSkills(skillScore), [skillScore]);

  // ── Matched courses: AI recommended names → actual app courses ──
  const matchedCourses = useMemo(
    () => matchRoadmapCourses(courses, roadmap?.recommended_courses ?? []),
    [courses, roadmap]
  );

  // ── Sort: matched courses top pe, baaki neeche ──
  const sortedCourses = useMemo(() => {
    const matchedIds = new Set(matchedCourses.map((c) => c.id));
    const rest = courses.filter((c) => !matchedIds.has(c.id));
    return [...matchedCourses, ...rest];
  }, [courses, matchedCourses]);

  const tagMatchFn = useCallback(
    (course: Course) => isTagMatch(course, roadmapSkills),
    [roadmapSkills]
  );

  const hasRoadmapMatches = matchedCourses.length > 0;
  const skillLabel = useMemo(() => getSkillLabel(roadmapSkills), [roadmapSkills]);

  // ── First client steps — goal ke basis pe alag ──
  const firstClientSteps = useMemo(
    () => buildFirstClientSteps(skillLabel, skillScore?.goal ?? ""),
    [skillLabel, skillScore?.goal]
  );

  // ── Handlers ──
  const handleRefreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("byonsoft_token")}`,
        },
      });
      const u = await res.json();
      if (u.id) updateUser(u);
    } catch {
      toast({ title: "Refresh failed", variant: "destructive" });
    }
  }, [updateUser, toast]);

  const handleOpenCourse = useCallback(
    (course: Course) => {
      if (!premium) {
        setUpgradeOpen(true);
      } else {
        setLocation(`/course/${course.id}`);
      }
    },
    [premium, setLocation]
  );

  const handleDownloadCert = useCallback(
    (course: Course) => {
      const html = generateCertificateHTML(user?.name || "Student", course);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 800);
      }
    },
    [user?.name]
  );

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/";
  }, [logout]);

  const openUpgrade = useCallback(() => setUpgradeOpen(true), []);
  const closeUpgrade = useCallback(() => setUpgradeOpen(false), []);

  // ── Render ──
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* Header */}
      <DashboardHeader
        userName={user?.name ?? ""}
        isPremium={premium}
        onUpgrade={openUpgrade}
        onAIMentor={() => setLocation("/course/1")}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* PWA install */}
        <PWAInstallButton variant="banner" />

        {/* Welcome */}
        <WelcomeHero
          userName={user?.name ?? ""}
          isPremium={premium}
          price={price}
          totalCourses={totalCourses}
          completedCount={completedCount}
          onUpgrade={openUpgrade}
          onRefresh={handleRefreshUser}
        />

        {/* Stats row — career result bhi dikhao */}
        <StatsOverview
          isPhase2={isPhase2}
          completedCount={completedCount}
          totalCourses={totalCourses}
          hasAssessment={hasAssessment}
          inProgressCount={inProgressCount}
          onAssessmentClick={() => setLocation("/skill-test?new=1")}
          result={roadmapResult}
        />

        {/* AI Roadmap — matched courses pass karo */}
        <AIRoadmapSection
          roadmap={roadmap}
          matchedCourses={matchedCourses}
          onImprove={() => setLocation("/skill-test?new=1")}
          onGetRoadmap={() => setLocation("/skill-test?new=1")}
        />

        {/* First Client Guide — goal ke basis pe personalized */}
        <FirstClientGuide
          steps={firstClientSteps}
          skillLabel={skillLabel}
          isPremium={premium}
          price={price}
          onUpgrade={openUpgrade}
        />

        {/* Giveaway banner */}
        <MegaLaunchBanner isPremium={premium} onUpgrade={openUpgrade} />

        {/* Referral + Rewards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ReferralCard />
          <ReferralRewards />
        </div>

        {/* Giveaway tracker */}
        {giveawayStats && (
          <GiveawayTracker
            premiumCount={premiumCount}
            nextMilestone={giveawayStats.nextMilestone}
            prevMilestone={giveawayStats.prevMilestone}
            isPhase2={isPhase2}
          />
        )}

        {/* Pricing (free users only) */}
        {!premium && (
          <PricingSection
            price={price}
            totalCourses={totalCourses}
            onUpgrade={openUpgrade}
          />
        )}

        {/* Courses — sorted with matched on top */}
        <CoursesGrid
          courses={sortedCourses}
          progressList={progressList}
          isLoading={coursesLoading}
          isPremium={premium}
          price={price}
          completedCount={completedCount}
          totalCourses={totalCourses}
          hasRoadmapMatches={hasRoadmapMatches}
          isTagMatch={tagMatchFn}
          onOpen={handleOpenCourse}
          onDownloadCert={handleDownloadCert}
          onUpgrade={openUpgrade}
        />
      </main>

      {/* Footer */}
      <DashboardFooter />

      {/* Upgrade modal */}
      <UpgradeModal open={upgradeOpen} onClose={closeUpgrade} />
    </div>
  );
}

