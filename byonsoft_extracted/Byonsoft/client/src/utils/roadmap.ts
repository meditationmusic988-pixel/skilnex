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

export function getSkillLabel(roadmapSkills: string[]): string {
  const primary = roadmapSkills[0] || "";
  return primary
    ? primary
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Your Skill";
}

export function buildFirstClientSteps(skillLabel: string) {
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