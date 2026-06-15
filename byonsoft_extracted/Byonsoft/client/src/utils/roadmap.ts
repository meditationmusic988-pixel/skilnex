import type { Course, SkillScore } from "@shared/schema";

export interface ParsedRoadmap {
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

export function extractRoadmapSkills(skillScore: SkillScore | null | undefined): string[] {
  const parsed = parseRoadmap(skillScore);
  if (!parsed) return [];
  
  const raw: string[] = [...parsed.recommended_courses, ...parsed.career_paths];
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

// ... (detectGoalType and buildFirstClientSteps stay the same as your code)
export function detectGoalType(goal: string): "freelancer" | "business" | "job" | "general" {
    if (!goal) return "general";
    const g = goal.toLowerCase();
    if (g.includes("business") || g.includes("online grow") || g.includes("shop") || g.includes("store")) return "business";
    if (g.includes("job") || g.includes("naukri") || g.includes("company")) return "job";
    if (g.includes("freelanc") || g.includes("fiverr") || g.includes("client") || g.includes("income")) return "freelancer";
    return "general";
}

export function buildFirstClientSteps(skillLabel: string, goal?: string) {
    const goalType = detectGoalType(goal || "");
    // (Keep your existing switch logic for business/job/freelancer)
    if (goalType === "business") return [/* your business steps */];
    if (goalType === "job") return [/* your job steps */];
    return [/* your freelancer steps */];
}
