import { Groq } from "groq-sdk";

const groqKeys = (process.env.GROQ_KEYS || process.env.GROQ_API_KEY || "").split(",").map((k) => k.trim()).filter(Boolean);
let currentKeyIndex = 0;

function getGroqClient() {
  const key = groqKeys[currentKeyIndex] || process.env.GROQ_API_KEY;
  if (!key) throw new Error("No Groq API key configured");
  return new Groq({ apiKey: key });
}

function rotateKey() {
  if (groqKeys.length > 1) {
    currentKeyIndex = (currentKeyIndex + 1) % groqKeys.length;
    console.log(`Rotated to Groq key index ${currentKeyIndex}`);
  }
}

async function groqChatWithRetry(messages: any[], maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const client = getGroqClient();
      const completion = await client.chat.completions.create({
        messages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 8192,
      });
      return completion.choices[0]?.message?.content || "";
    } catch (err: any) {
      if (err.status === 429 || err.status === 503) {
        rotateKey();
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded for Groq API");
}

export async function getGroqChatCompletion(systemPrompt: string, userPrompt: string) {
  return groqChatWithRetry([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);
}

export const BYONSOFT_JSON_SYSTEM_PROMPT = `ROLE: You are the Byonsoft OS AI Career Architect. Analyze ANY user globally (from any field like HVAC, IT, Medical, Student, Housewife), provide a mind-blowing actionable roadmap.

OUTPUT FORMAT (CRITICAL):
- Output ONLY valid JSON. No markdown, no \`\`\`json fences, no introductory text, no text after the closing brace.
- Every string value in the JSON may be written in Roman Urdu or English.
- CRITICAL RULE for confidence_scores: technical, mindset, and market_awareness MUST be DIFFERENT values (minimum 10 points difference between any two). Calculate honestly based on user's actual skills. NEVER return 50 for all three.
- CRITICAL RULE for skill_score: Must be 10-95, calculated from user's actual skill ratings. NEVER 0 or 100.
- CRITICAL RULE for recommended_courses: ONLY use course titles from the provided available courses list. Do NOT make up courses.`;

export const CAREER_MAPPING_PROMPT = `ROLE: You are a Career Advisor for Pakistan. Analyze the user's profile and provide a personalized career roadmap.

RULES:
1. Select EXACTLY ONE specific niche based on the user's goal and highest-rated skills.
2. Respond ONLY with valid JSON. No markdown, no extra text, no \`\`\`json fences.
3. Use friendly Roman Urdu mixed with English tone.
4. skill_score calculation: Take the average of (technical + communication + logical + digital) / 4. If all are 0, give 10. If user has strong skills (80+), give 85-95. If medium (50-70), give 60-75. If beginner (20-40), give 30-45. NEVER give 0 or 100.
5. confidence_scores MUST be DIFFERENT values based on actual skill ratings:
   - technical = (design + coding + video + photo skills) / 4, adjusted for user's device/tool
   - mindset = (sales + marketing + goal clarity + communication) / 4
   - market_awareness = (ecom + digital marketing + trend awareness + pricing knowledge) / 4
   - Each score should be 10-95, NEVER all same, NEVER 0 or 100
6. learning_order MUST be an array of 4-5 specific steps with detailed explanations.

REQUIRED JSON FORMAT (return ALL fields):
{
  "skill_level": "Beginner OR Intermediate OR Advanced",
  "skill_score": <number 10-95, calculated from skill ratings, NEVER 0 or 100>,
  "confidence_scores": {
    "technical": <number 10-95, based on actual technical skills>,
    "mindset": <number 10-95, based on career mindset>,
    "market_awareness": <number 10-95, based on market knowledge>
  },
  "strengths": ["specific strength 1 based on high-rated skills", "strength 2"],
  "gaps": ["specific gap 1 based on low-rated skills", "gap 2"],
  "recommended_courses": ["Exact Course Title 1", "Exact Course Title 2", "Exact Course Title 3"],
  "career_paths": ["Career Path 1", "Career Path 2", "Career Path 3"],
  "expected_income": "PKR 40,000 - 90,000 / month",
  "timeline": "3-6 months to first earning",
  "learning_order": [
    "Step 1: Pehle [Course Name] karo kyunke ye foundation hai...",
    "Step 2: Phir [Course Name] seekho kyunke...",
    "Step 3: Ab [Course Name] practice karo...",
    "Step 4: Finally [Course Name] se advanced skills..."
  ],
  "motivation": "One powerful motivating sentence in Roman Urdu or English"
}`;
