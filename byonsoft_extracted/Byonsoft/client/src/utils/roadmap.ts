import type { Course, SkillScore } from "@shared/schema";

export interface ParsedRoadmap {
  recommended_courses: string[];
  career_paths: string[];
  learning_order: string[];
  expected_income?: string;
  timeline?: string;
  skill_level?: string;
  skill_score?: number;
  motivation?: string;
  confidence_scores?: {
    technical: number;
    mindset: number;
    market_awareness: number;
  };
}

export function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (val && typeof val === "object") return Object.values(val as object) as string[];
  if (typeof val === "string" && val.trim()) {
    const lines = val
      .split(/\n|→/)
      .map((s) => s.trim())
      .filter(Boolean);
    return lines.length > 1 ? lines : [val.trim()];
  }
  return [];
}

export function parseRoadmap(skillScore: SkillScore | null | undefined): ParsedRoadmap | null {
  if (!skillScore?.roadmap_result) return null;
  try {
    const raw = JSON.parse(skillScore.roadmap_result);
    return {
      ...raw,
      recommended_courses: toArray(raw.recommended_courses),
      career_paths: toArray(raw.career_paths),
      learning_order: toArray(raw.learning_order),
    };
  } catch {
    return null;
  }
}

export function extractRoadmapSkills(skillScore: SkillScore | null | undefined): string[] {
  if (!skillScore?.roadmap_result) return [];
  try {
    const parsed = JSON.parse(skillScore.roadmap_result);
    const raw: string[] = [];
    if (Array.isArray(parsed.recommended_courses)) raw.push(...parsed.recommended_courses);
    if (Array.isArray(parsed.career_paths)) raw.push(...parsed.career_paths);
    return raw
      .map((s) => s.trim().toLowerCase())
      .filter((v) => v.length > 0)
      .filter((v, i, a) => a.indexOf(v) === i);
  } catch {
    return [];
  }
}

export function isTagMatch(course: Course, roadmapSkills: string[]): boolean {
  if (!roadmapSkills.length) return false;
  const courseTags = (course.tags || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
  if (!courseTags.length) return false;
  return roadmapSkills.some((skill) =>
    courseTags.some((tag) => tag.includes(skill) || skill.includes(tag))
  );
}

export function sortCoursesByRoadmap(courses: Course[], roadmapSkills: string[]): Course[] {
  if (!roadmapSkills.length) return courses;
  const matched = courses.filter((c) => isTagMatch(c, roadmapSkills));
  const rest = courses.filter((c) => !isTagMatch(c, roadmapSkills));
  return [...matched, ...rest];
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
        if (titleLower === nameLower) return true;
        if (titleLower.includes(nameLower) || nameLower.includes(titleLower)) return true;
        return nameLower
          .split(" ")
          .filter((w) => w.length > 3)
          .some((word) => titleLower.includes(word));
      });
    })
    .filter((c): c is Course => !!c)
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);
}

export function getSkillLabel(roadmapSkills: string[]): string {
  const primary = roadmapSkills[0] || "";
  return primary
    ? primary
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Your Skill";
}

// ── Goal type detector ──
// goal field mein user ne kya bhara hai usse type detect karo
export function detectGoalType(goal: string): "freelancer" | "business" | "job" | "general" {
  if (!goal) return "general";
  const g = goal.toLowerCase();

  // Business / online grow keywords
  if (
    g.includes("business") ||
    g.includes("online grow") ||
    g.includes("online business") ||
    g.includes("apna business") ||
    g.includes("khud ka business") ||
    g.includes("shop") ||
    g.includes("store") ||
    g.includes("sell") ||
    g.includes("product") ||
    g.includes("e-commerce") ||
    g.includes("ecommerce") ||
    g.includes("brand") ||
    g.includes("social media grow") ||
    g.includes("grow karna")
  ) {
    return "business";
  }

  // Job seeker keywords
  if (
    g.includes("job") ||
    g.includes("naukri") ||
    g.includes("employ") ||
    g.includes("company") ||
    g.includes("office") ||
    g.includes("salary") ||
    g.includes("career") ||
    g.includes("hire")
  ) {
    return "job";
  }

  // Freelancer keywords
  if (
    g.includes("freelanc") ||
    g.includes("fiverr") ||
    g.includes("upwork") ||
    g.includes("client") ||
    g.includes("gig") ||
    g.includes("remote") ||
    g.includes("online earn") ||
    g.includes("paise") ||
    g.includes("income") ||
    g.includes("gharsay") ||
    g.includes("ghar say") ||
    g.includes("ghar se")
  ) {
    return "freelancer";
  }

  return "general"; // default = freelancer steps
}

export function buildFirstClientSteps(skillLabel: string, goal?: string) {
  const goalType = detectGoalType(goal || "");

  // ── BUSINESS OWNER ──
  if (goalType === "business") {
    return [
      {
        step: "01",
        title: `${skillLabel} se apni Online Presence Banao`,
        body: `Facebook Page aur Instagram Business account banao. Profile complete karo — logo, bio, aur ${skillLabel} service clearly mention karo. Yahi tumhara digital shop front hai.`,
        color: "from-blue-600 to-blue-700",
        icon: "🏪",
      },
      {
        step: "02",
        title: "Pehle 5 Customers Free Ya Discounted Deno",
        body: `Apne circles (family, friends, mohalla) mein announce karo ke tum launch ho rahe ho. Pehle 5 customers ko discount ya free service do — taaki reviews aur word-of-mouth start ho.`,
        color: "from-emerald-600 to-emerald-700",
        icon: "🎁",
      },
      {
        step: "03",
        title: "WhatsApp Business + Broadcast List",
        body: `WhatsApp Business setup karo. Catalog mein apni services/products add karo. Broadcast list banao — roz ek helpful message ya offer bhejo existing contacts ko.`,
        color: "from-green-600 to-green-700",
        icon: "📱",
      },
      {
        step: "04",
        title: `Facebook Ads — Rs. 200/day se Shuru Karo`,
        body: `Apni city mein targeted Facebook ad chalao — budget sirf Rs. 200/day. ${skillLabel} ki service ya offer ka ek clear ad banao. Pehle 3 din test karo, jo ad chalti hai usy scale karo.`,
        color: "from-indigo-600 to-indigo-700",
        icon: "📢",
      },
      {
        step: "05",
        title: "Reviews Collect Karo",
        body: `Har khush customer se Google Review ya Facebook Review maango. Ek simple message: "Aapka experience kaisa raha? Review dein ge toh bohot meharbani hogi." Social proof = more customers.`,
        color: "from-yellow-600 to-yellow-700",
        icon: "⭐",
      },
      {
        step: "06",
        title: "Referral System Shuru Karo",
        body: `Customers ko batao: "Ek dost refer karo, aapko 10% discount milega." Yeh system automatically new customers laata rehta hai bina advertising ke.`,
        color: "from-pink-600 to-pink-700",
        icon: "🤝",
      },
    ];
  }

  // ── JOB SEEKER ──
  if (goalType === "job") {
    return [
      {
        step: "01",
        title: `${skillLabel} Portfolio / GitHub Banao`,
        body: `2-3 real ya practice projects banao aur GitHub pe upload karo ya PDF portfolio tayyar karo. Employers ko proof chahiye hota hai — CV nahi, kaam dekhtay hain.`,
        color: "from-blue-600 to-blue-700",
        icon: "💼",
      },
      {
        step: "02",
        title: "LinkedIn Profile Update Karo",
        body: `Professional photo, ${skillLabel} headline, aur skills section fill karo. Rozana 3-5 relevant connections add karo. Hiring managers LinkedIn pe actively search kartay hain.`,
        color: "from-indigo-600 to-indigo-700",
        icon: "🔗",
      },
      {
        step: "03",
        title: "Pakistan Job Boards Apply Karo",
        body: `Rozana Rozee.pk, Mustakbil, aur LinkedIn Jobs pe apply karo. ${skillLabel} keyword se filter karo. Cover letter personalize karo — generic letter mat bhejo.`,
        color: "from-purple-600 to-purple-700",
        icon: "📋",
      },
      {
        step: "04",
        title: "Remote Jobs Bhi Explore Karo",
        body: `Remote.co, We Work Remotely, aur AngelList pe ${skillLabel} ki remote positions dhundo. Pakistan se internationally kaam karna ab possible hai — dollar income ghar baithe.`,
        color: "from-cyan-600 to-cyan-700",
        icon: "🌍",
      },
      {
        step: "05",
        title: "Mock Interviews Practice Karo",
        body: `Glassdoor pe company-specific interview questions dhundo. AI tools ya kisi dost ke saath mock interview karo. ${skillLabel} ke technical questions prepare karo.`,
        color: "from-orange-600 to-orange-700",
        icon: "🎯",
      },
      {
        step: "06",
        title: "Referral Maango — Network Use Karo",
        body: `LinkedIn pe un logon se connect karo jo aapki target company mein kaam kar rahay hain. Politely poochho ke koi opening hai ya referral de saktay hain. 70% jobs referral se milti hain.`,
        color: "from-emerald-600 to-emerald-700",
        icon: "🤝",
      },
    ];
  }

  // ── FREELANCER (default) ──
  return [
    {
      step: "01",
      title: `${skillLabel} Portfolio Banao`,
      body: `${skillLabel} ke 2-3 sample projects banao — real clients na hon to fictional ya self-initiated projects bhi chalte hain. Ek clean PDF ya website pe showcase karo.`,
      color: "from-blue-600 to-blue-700",
      icon: "🗂️",
    },
    {
      step: "02",
      title: "Fiverr / Upwork Gig Launch Karo",
      body: `${skillLabel} service ka ek strong gig banao. Shuru mein competitive rate rakho, aur pehle 1-2 free ya discounted orders se 5-star reviews collect karo.`,
      color: "from-purple-600 to-purple-700",
      icon: "🚀",
    },
    {
      step: "03",
      title: "Local Businesses Ko Approach Karo",
      body: `Apne sheher ke businesses ko WhatsApp ya direct message karo. Batao ke tum unki ${skillLabel} problems solve kar sakte ho. Ek free audit ya sample offer karo.`,
      color: "from-emerald-600 to-emerald-700",
      icon: "🏪",
    },
    {
      step: "04",
      title: "Facebook Groups & LinkedIn Use Karo",
      body: `${skillLabel} se related Facebook groups join karo. Roz ek helpful post ya answer daalo. Jab log tumhari expertise dekhein ge, woh khud DM karein ge.`,
      color: "from-orange-600 to-orange-700",
      icon: "📱",
    },
    {
      step: "05",
      title: "Cold Outreach Script",
      body: `"Hi [Name], maine aapki [profile/website] dekhi — aapko ${skillLabel} mein [specific problem] hai. Main help kar sakta/sakti hoon. Kya 10 min call ho sakti hai?" Short aur specific rakho.`,
      color: "from-pink-600 to-pink-700",
      icon: "✉️",
    },
    {
      step: "06",
      title: "Referrals Maango",
      body: `Jab pehla client mil jaye aur kaam achha ho, poochho: 'Kya aap mujhe kisi aur ke saath refer kar sakte hain?' Word-of-mouth fastest aur free growth hack hai.`,
      color: "from-cyan-600 to-cyan-700",
      icon: "🤝",
    },
  ];
}

export const STEP_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];
