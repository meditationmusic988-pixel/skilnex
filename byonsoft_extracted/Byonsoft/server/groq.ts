import Groq from "groq-sdk";

const GROQ_MODEL = "llama-3.3-70b-versatile";

const keys: string[] = (process.env.GROQ_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

if (keys.length === 0) {
  console.warn("[groq] WARNING: GROQ_KEYS secret is not set. AI features will fail.");
}

let currentKeyIndex = 0;

function getClient(): Groq {
  const key = keys[currentKeyIndex % keys.length];
  return new Groq({ apiKey: key });
}

function rotateKey(): void {
  currentKeyIndex = (currentKeyIndex + 1) % Math.max(keys.length, 1);
}

export async function groqChat(
  messages: Groq.Chat.ChatCompletionMessageParam[],
  overrides: { max_tokens?: number; temperature?: number } = {}
): Promise<string> {
  const maxAttempts = keys.length || 1;
  let lastError: any;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const client = getClient();
    try {
      const completion = await client.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        temperature: overrides.temperature ?? 0.7,
        max_tokens: overrides.max_tokens ?? 2048,
      });
      return completion.choices[0]?.message?.content ?? "";
    } catch (err: any) {
      lastError = err;
      const status = err?.status ?? err?.statusCode ?? err?.error?.status;
      if (status === 429 || status === 503) {
        rotateKey();
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * For plain-text endpoints (e.g. /api/ai/mentor).
 * Premium mentor — no marketing, deep practical answers.
 */
export const BYONSOFT_SYSTEM_PROMPT = `ROLE: You are the Byonsoft OS Premium AI Mentor. Your audience consists of paid students who expect expert-level, practical advice.
TRAINING GUIDELINES:
1. NO MARKETING: Never mention 750 PKR, promo codes, or 'subscribing'. The user is already a premium member.
2. DEPTH OVER BREADTH: If a user asks a question about a lesson, don't give a 2-line answer. Give a detailed, step-by-step technical explanation.
3. PRACTICAL EXAMPLES: Always include a real-world example of how they can use that specific skill to make money.
4. LANGUAGE: Use a professional yet brotherly tone in Roman Urdu mixed with English. Avoid robotic or dry language.
STRICT OUTPUT RULE:
Do not include any headers or footers about Byonsoft. Just answer the student's question directly and deeply.`;

/**
 * For the old /api/ai/recommend endpoint (kept for backward compatibility).
 */
export const BYONSOFT_RECOMMEND_PROMPT = `ROLE: You are the Byonsoft OS AI Career Mentor.
CRITICAL RULE: Read the user's input and pick ONLY ONE logical niche (e.g., ONLY Digital Marketing, or ONLY AutoCAD, or ONLY E-commerce). DO NOT mix multiple unrelated fields.
OUTPUT FORMAT: You MUST respond ONLY with a valid JSON object. Do not include any extra text, and do not use markdown code blocks like \`\`\`json. The JSON must exactly match this structure:
{
  "recommended_courses": ["Course 1", "Course 2", "Course 3"],
  "career_paths": ["Job Role 1", "Job Role 2"],
  "expected_income": "e.g., Rs. 40,000 - 90,000 / month",
  "learning_order": "Write a short, friendly 3-step guide in Roman Urdu mixed with English explaining which course to do first and why."
}`;

/**
 * For the /api/ai/roadmap endpoint.
 * Strict Career Mapping API — one niche, strict JSON.
 */
export const CAREER_MAPPING_PROMPT = `ROLE: You are a Career Advisor for Pakistan. Analyze the user's profile and provide a personalized career roadmap.

RULES:
1. Select EXACTLY ONE specific niche based on the user's goal and highest-rated skills.
2. Respond ONLY with valid JSON. No markdown, no extra text, no \`\`\`json fences.
3. Use friendly Roman Urdu mixed with English tone.
4. skill_score must NEVER be 0. If all skills are low, give 10-25. Calculate honestly based on skill ratings.
5. confidence_scores must reflect actual skill ratings — do NOT use same value for all three.

REQUIRED JSON FORMAT (return ALL fields):
{
  "skill_level": "Beginner OR Intermediate OR Advanced",
  "skill_score": <number 1-100, based on skill ratings, NEVER 0>,
  "confidence_scores": {
    "technical": <number 0-100, based on design/coding/video/photo ratings>,
    "mindset": <number 0-100, based on sales/marketing/goal clarity>,
    "market_awareness": <number 0-100, based on ecom/marketing/digital skills>
  },
  "strengths": ["specific strength 1 based on high-rated skills", "strength 2"],
  "gaps": ["specific gap 1 based on low-rated skills", "gap 2"],
  "recommended_courses": ["Exact Course Title 1", "Exact Course Title 2", "Exact Course Title 3"],
  "career_paths": ["Career Path 1", "Career Path 2", "Career Path 3"],
  "expected_income": "PKR 40,000 - 90,000 / month",
  "timeline": "3-6 months to first earning",
  "learning_order": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ..."],
  "motivation": "One powerful motivating sentence in Roman Urdu or English"
}`;

/**
 * For JSON-returning endpoints (progress-report, career-analysis).
 * The AI must output ONLY valid JSON — no markdown, no extra text.
 */
export const BYONSOFT_JSON_SYSTEM_PROMPT = `ROLE: You are the Byonsoft OS AI Career Architect. Analyze ANY user globally (from any field like HVAC, IT, Medical, Student, Housewife), provide a mind-blowing actionable roadmap.
OUTPUT FORMAT (CRITICAL):
- Output ONLY valid JSON. No markdown, no \`\`\`json fences, no introductory text, no text after the closing brace.
- Every string value in the JSON may be written in Roman Urdu or English.`;
