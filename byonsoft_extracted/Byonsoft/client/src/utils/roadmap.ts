import type { Course, SkillScore } from "@shared/schema";

export interface ParsedRoadmap {
  title?: string;
  recommended_courses: string[];
  career_paths: string[];
  learning_order: string[];
  expected_income?: string;
  timeline?: string;
  skill_level?: string;
  skill_score?: number;
  confidence_scores?: {
    technical: number;
    mindset: number;
    market_awareness: number;
  };
}

// Clean AI text (Remove "1.", "2.", "-", etc.)
export function cleanText(text: string): string {
  return text.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*]\s*/, '').trim();
}

export function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(v => cleanText(String(v)));
  if (val && typeof val === "object") return Object.values(val as object).map(v => cleanText(String(v)));
  if (typeof val === "string" && val.trim()) {
    // Split by new line, arrows, or bullets
    const lines = val
      .split(/\n|→|•/)
      .map((s) => cleanText(s))
      .filter(Boolean);
    return lines;
  }
  return [];
}

export function parseRoadmap(skillScore: SkillScore | null | undefined): ParsedRoadmap | null {
  if (!skillScore?.roadmap_result) return null;
  try {
    const raw = typeof skillScore.roadmap_result === 'string' 
      ? JSON.parse(skillScore.roadmap_result) 
      : skillScore.roadmap_result;

    return {
      ...raw,
      recommended_courses: toArray(raw.recommended_courses || raw.recommendedCourses),
      career_paths: toArray(raw.career_paths || raw.careerPaths || raw.career_path),
      learning_order: toArray(raw.learning_order || raw.learningOrder || raw.learning_path),
      expected_income: raw.expected_income || raw.expectedIncome || ""
    };
  } catch {
    return null;
  }
}

/**
 * ── CAREER ANALYSIS → ROADMAP MAPPER ──
 * Maps the `/api/career-results/me/latest` response (career_analyses table)
 * into the same ParsedRoadmap shape the Dashboard UI expects.
 * This is now the SINGLE SOURCE OF TRUTH used by both the results page
 * and the Dashboard, so the numbers never disagree again.
 */
export function mapCareerAnalysisToRoadmap(analysis: any): ParsedRoadmap | null {
  if (!analysis) return null;

  const careerPaths = [analysis.skill_path, analysis.secondary_path].filter(Boolean);

  const recommendedSkills: string[] = Array.isArray(analysis.recommended_skills)
    ? analysis.recommended_skills
    : toArray(analysis.recommended_skills);

  const roadmapObj = analysis.roadmap || {};
  const learningOrderParts = [roadmapObj.month1, roadmapObj.month2, roadmapObj.month3].filter(Boolean);
  const learningOrder = learningOrderParts.map((step: string, i: number) => `Month ${i + 1}: ${step}`);

  return {
    title: analysis.skill_path || "Career Path",
    career_paths: careerPaths,
    recommended_courses: recommendedSkills,
    learning_order: learningOrder,
    expected_income: analysis.income_6m
      ? `${analysis.income_6m} (6 months) → ${analysis.income_12m || ""} (12 months)`.trim()
      : analysis.income_12m || "",
  };
}

export function extractRoadmapSkills(roadmap: ParsedRoadmap | null | undefined): string[] {
  if (!roadmap) return [];

  const raw: string[] = [...(roadmap.recommended_courses || []), ...(roadmap.career_paths || [])];
  return raw
    .map((s) => s.toLowerCase())
    .filter((v) => v.length > 2)
    .filter((v, i, a) => a.indexOf(v) === i);
}

export function isTagMatch(course: Course, roadmapSkills: string[]): boolean {
  if (!roadmapSkills.length) return false;
  const courseTags = (course.tags || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
  
  const titleLower = course.title.toLowerCase();
  
  return roadmapSkills.some((skill) => {
    const s = skill.toLowerCase();
    // Match by tags OR if course title is mentioned in the roadmap
    return courseTags.some((tag) => tag.includes(s) || s.includes(tag)) || 
           titleLower.includes(s) || s.includes(titleLower);
  });
}

export function matchRoadmapCourses(
  courses: Course[],
  recommendedNames: string[]
): Course[] {
  if (!recommendedNames.length || !courses.length) return [];

  return recommendedNames
    .map((name) => {
      const nameLower = name.toLowerCase().trim();
      return courses.find((c) => {
        const titleLower = c.title.toLowerCase();
        // Exact or partial title match
        if (titleLower.includes(nameLower) || nameLower.includes(titleLower)) return true;
        // Match key words (ignoring small words like 'for', 'the', 'and')
        const keywords = nameLower.split(" ").filter(w => w.length > 3);
        return keywords.some(kw => titleLower.includes(kw));
      });
    })
    .filter((c): c is Course => !!c)
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);
}

export function getSkillLabel(roadmapSkills: string[]): string {
  const primary = roadmapSkills[0] || "";
  return primary
    ? primary.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Your Skill";
}

export function detectGoalType(goal: string): "freelancer" | "business" | "job" | "general" {
  if (!goal) return "general";
  const g = goal.toLowerCase();
  if (g.includes("business") || g.includes("online grow") || g.includes("shop") || g.includes("store")) return "business";
  if (g.includes("job") || g.includes("naukri") || g.includes("company")) return "job";
  if (g.includes("freelanc") || g.includes("fiverr") || g.includes("client") || g.includes("income")) return "freelancer";
  return "general";
}

export interface FirstClientStep {
  step: string;
  title: string;
  body: string;
  color: string;
  icon: string;
}

export function buildFirstClientSteps(skillLabel: string, goal?: string): FirstClientStep[] {
  const goalType = detectGoalType(goal || "");
  const skill = skillLabel && skillLabel !== "Your Skill" ? skillLabel : "your skill";

  if (goalType === "business") {
    return [
      {
        step: "1",
        title: "Define Your Offer",
        body: `Write down exactly what you'll sell using ${skill} — one clear product or service, not five vague ideas.`,
        color: "from-emerald-500 to-teal-500",
        icon: "🎯",
      },
      {
        step: "2",
        title: "Set Up Your Storefront",
        body: "Create a simple Facebook Page or Instagram business profile. Add 3-5 clear photos and your pricing.",
        color: "from-teal-500 to-cyan-500",
        icon: "🏪",
      },
      {
        step: "3",
        title: "Get Your First 10 Followers",
        body: "Share your page in 3-4 relevant Facebook groups and with your WhatsApp contacts. Ask friends to share too.",
        color: "from-cyan-500 to-blue-500",
        icon: "📣",
      },
      {
        step: "4",
        title: "Run a Launch Offer",
        body: "Offer a small discount or bonus for your first 5 customers — this builds reviews and word-of-mouth fast.",
        color: "from-blue-500 to-indigo-500",
        icon: "🎁",
      },
      {
        step: "5",
        title: "Collect & Showcase Reviews",
        body: "Ask every happy customer for a short review or photo. Post these — social proof sells more than ads.",
        color: "from-indigo-500 to-purple-500",
        icon: "⭐",
      },
    ];
  }

  if (goalType === "job") {
    return [
      {
        step: "1",
        title: "Build a Focused Resume",
        body: `Update your resume to highlight ${skill} skills and any projects, even small or personal ones.`,
        color: "from-emerald-500 to-teal-500",
        icon: "📄",
      },
      {
        step: "2",
        title: "Create a LinkedIn Profile",
        body: "Set up a professional LinkedIn with a clear headline mentioning your skill and what you're looking for.",
        color: "from-teal-500 to-cyan-500",
        icon: "💼",
      },
      {
        step: "3",
        title: "Apply to 5 Jobs Daily",
        body: "Use Rozee.pk, LinkedIn, and Indeed. Apply consistently rather than waiting for the 'perfect' listing.",
        color: "from-cyan-500 to-blue-500",
        icon: "📬",
      },
      {
        step: "4",
        title: "Practice Interview Answers",
        body: "Prepare 3-4 stories about your skills and achievements you can use in almost any interview question.",
        color: "from-blue-500 to-indigo-500",
        icon: "🎤",
      },
      {
        step: "5",
        title: "Follow Up Professionally",
        body: "Send a polite follow-up email a week after applying or interviewing — it keeps you on the recruiter's radar.",
        color: "from-indigo-500 to-purple-500",
        icon: "✉️",
      },
    ];
  }

  // Default: freelancer path
  return [
    {
      step: "1",
      title: "Build a Mini Portfolio",
      body: `Create 2-3 sample pieces showing your ${skill} ability — even practice projects work if you have no clients yet.`,
      color: "from-emerald-500 to-teal-500",
      icon: "🎨",
    },
    {
      step: "2",
      title: "Set Up Your Profile",
      body: "Create a Fiverr or Upwork profile with a clear title, your portfolio, and a friendly, specific bio.",
      color: "from-teal-500 to-cyan-500",
      icon: "👤",
    },
    {
      step: "3",
      title: "Price to Win Your First Review",
      body: "Price slightly below market for your first 2-3 gigs. Reviews matter more than profit at the start.",
      color: "from-cyan-500 to-blue-500",
      icon: "🏷️",
    },
    {
      step: "4",
      title: "Send Personalized Proposals",
      body: "Apply to 5 relevant gigs daily with a short, specific message — mention their exact project, not a copy-paste pitch.",
      color: "from-blue-500 to-indigo-500",
      icon: "📨",
    },
    {
      step: "5",
      title: "Over-Deliver & Ask for Reviews",
      body: "Deliver a little more than promised on your first orders, then politely ask for a 5-star review.",
      color: "from-indigo-500 to-purple-500",
      icon: "⭐",
    },
  ];
}
