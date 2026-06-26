import { createCanvas, loadImage, registerFont } from "canvas";
import { join } from "path";

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [""];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + word).length > maxChars) {
      lines.push(current.trim());
      current = word + " ";
    } else {
      current += word + " ";
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.length > 2 ? [lines[0], lines[1] + "..."] : lines;
}

export function generateSkillResultCardSVG(opts: {
  skill_level: string;
  skill_score: number;
  career_paths: string[];
  expected_income: string;
  timeline: string;
  technical: number;
  mindset: number;
  market_awareness: number;
  share_url: string;
  learning_order?: string[];
  strengths?: string[];
  gaps?: string[];
}): string {
  const { skill_level, skill_score, career_paths, expected_income, timeline, technical, mindset, market_awareness, share_url, learning_order, strengths, gaps } = opts;
  const S = 1080;

  const scoreColor = skill_score < 40 ? "#EF4444" : skill_score < 65 ? "#F59E0B" : "#22C55E";
  const levelColor = skill_level === "Beginner" ? "#F59E0B" : skill_level === "Advanced" ? "#22C55E" : "#3B82F6";
  const safeLevel = escapeXml(skill_level);
  const safeIncome = escapeXml(expected_income);
  const safeTimeline = escapeXml(timeline);
  const safeUrl = escapeXml(share_url.replace(/^https?:\/\//, ""));

  const path1 = escapeXml(career_paths[0] ?? "");
  const path2 = escapeXml(career_paths[1] ?? "");
  const path3 = escapeXml(career_paths[2] ?? "");

  // Score ring calculations
  const r = 130, cx = S / 2, cy = 340;
  const circ = 2 * Math.PI * r;
  const dash = ((100 - skill_score) / 100) * circ;

  // Bar widths (max 600px)
  const techW = Math.round((technical / 100) * 600);
  const mindW = Math.round((mindset / 100) * 600);
  const mktW  = Math.round((market_awareness / 100) * 600);

  // Learning order lines
  const loLines: string[] = [];
  if (learning_order && learning_order.length > 0) {
    learning_order.forEach((step, i) => {
      const wrapped = wrapText(step, 55);
      loLines.push(`<text x="80" y="${520 + i * 50}" font-family="system-ui,sans-serif" font-size="14" fill="#CBD5E1">• ${escapeXml(wrapped[0])}</text>`);
      if (wrapped[1]) {
        loLines.push(`<text x="100" y="${520 + i * 50 + 18}" font-family="system-ui,sans-serif" font-size="12" fill="#94A3B8">${escapeXml(wrapped[1])}</text>`);
      }
    });
  }

  // Strengths & gaps
  const strengthLines = (strengths || []).slice(0, 2).map((s, i) => 
    `<text x="80" y="${780 + i * 22}" font-family="system-ui,sans-serif" font-size="13" fill="#22C55E">✓ ${escapeXml(s)}</text>`
  ).join("");
  
  const gapLines = (gaps || []).slice(0, 2).map((g, i) => 
    `<text x="400" y="${780 + i * 22}" font-family="system-ui,sans-serif" font-size="13" fill="#EF4444">⚠ ${escapeXml(g)}</text>`
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#06101D"/>
      <stop offset="100%" stop-color="#0E1B32"/>
    </linearGradient>
    <linearGradient id="topbar" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="50%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${S}" height="${S}" fill="url(#bg)"/>
  <rect width="${S}" height="5" fill="url(#topbar)"/>

  <!-- Grid dots -->
  ${Array.from({ length: 11 }, (_, row) =>
    Array.from({ length: 11 }, (_, col) =>
      `<circle cx="${col * 108 + 30}" cy="${row * 108 + 30}" r="1.5" fill="#fff" opacity="0.03"/>`
    ).join("")
  ).join("")}

  <!-- Logo -->
  <rect x="60" y="28" width="44" height="44" rx="10" fill="#2563EB"/>
  <text x="82" y="58" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="900" fill="white">S</text>
  <text x="116" y="47" font-family="system-ui,sans-serif" font-size="20" font-weight="800" fill="white">Skilnex</text>
  <text x="116" y="66" font-family="system-ui,sans-serif" font-size="11" fill="#475569" letter-spacing="3">AI SKILL ASSESSMENT</text>

  <!-- Badge -->
  <rect x="${S - 250}" y="30" width="190" height="34" rx="17" fill="#0F2240" stroke="#2563EB" stroke-width="1.2" stroke-opacity="0.5"/>
  <circle cx="${S - 230}" cy="47" r="5" fill="#34D399"/>
  <text x="${S - 218}" y="52" font-family="system-ui,sans-serif" font-size="12" fill="#94A3B8">Result Ready</text>

  <!-- Divider -->
  <line x1="60" y1="92" x2="${S - 60}" y2="92" stroke="#1E293B" stroke-width="1.2"/>

  <!-- Score Ring -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1E293B" stroke-width="16"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${scoreColor}" stroke-width="16"
    stroke-linecap="round"
    stroke-dasharray="${circ}"
    stroke-dashoffset="${dash}"
    transform="rotate(-90 ${cx} ${cy})"
    filter="url(#glow)"/>
  <text x="${cx}" y="${cy - 15}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="72" font-weight="900" fill="white">${skill_score}</text>
  <text x="${cx}" y="${cy + 22}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="#475569">/ 100</text>
  <rect x="${cx - 90}" y="${cy + 44}" width="180" height="36" rx="18" fill="${levelColor}22" stroke="${levelColor}" stroke-width="1.5" stroke-opacity="0.5"/>
  <text x="${cx}" y="${cy + 68}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="${levelColor}">${safeLevel}</text>

  <!-- Skill Breakdown bars -->
  <text x="60" y="520" font-family="system-ui,sans-serif" font-size="13" fill="#475569" font-weight="700" letter-spacing="2">SKILL BREAKDOWN</text>

  <text x="60" y="555" font-family="system-ui,sans-serif" font-size="14" fill="#94A3B8">Technical Skills</text>
  <rect x="60" y="563" width="600" height="14" rx="7" fill="#1E293B"/>
  <rect x="60" y="563" width="${techW}" height="14" rx="7" fill="#3B82F6"/>
  <text x="675" y="575" font-family="system-ui,sans-serif" font-size="14" fill="#3B82F6" font-weight="700">${technical}%</text>

  <text x="60" y="605" font-family="system-ui,sans-serif" font-size="14" fill="#94A3B8">Career Mindset</text>
  <rect x="60" y="613" width="600" height="14" rx="7" fill="#1E293B"/>
  <rect x="60" y="613" width="${mindW}" height="14" rx="7" fill="#22C55E"/>
  <text x="675" y="625" font-family="system-ui,sans-serif" font-size="14" fill="#22C55E" font-weight="700">${mindset}%</text>

  <text x="60" y="655" font-family="system-ui,sans-serif" font-size="14" fill="#94A3B8">Market Awareness</text>
  <rect x="60" y="663" width="600" height="14" rx="7" fill="#1E293B"/>
  <rect x="60" y="663" width="${mktW}" height="14" rx="7" fill="#F59E0B"/>
  <text x="675" y="675" font-family="system-ui,sans-serif" font-size="14" fill="#F59E0B" font-weight="700">${market_awareness}%</text>

  <!-- Learning Order -->
  <line x1="60" y1="700" x2="${S - 60}" y2="700" stroke="#1E293B" stroke-width="1"/>
  <text x="60" y="730" font-family="system-ui,sans-serif" font-size="13" fill="#475569" font-weight="700" letter-spacing="2">YOUR LEARNING PATH</text>
  ${loLines.join("")}

  <!-- Strengths & Gaps -->
  <line x1="60" y1="860" x2="${S - 60}" y2="860" stroke="#1E293B" stroke-width="1"/>
  <text x="60" y="890" font-family="system-ui,sans-serif" font-size="13" fill="#475569" font-weight="700" letter-spacing="2">STRENGTHS & GAPS</text>
  ${strengthLines}
  ${gapLines}

  <!-- Income -->
  <rect x="60" y="920" width="480" height="100" rx="14" fill="#052213" stroke="#22C55E" stroke-width="1.5" stroke-opacity="0.4"/>
  <text x="90" y="955" font-family="system-ui,sans-serif" font-size="12" fill="#22C55E" font-weight="700" letter-spacing="2">EXPECTED INCOME</text>
  <text x="90" y="995" font-family="system-ui,sans-serif" font-size="24" font-weight="900" fill="white">${safeIncome}</text>

  <rect x="560" y="920" width="460" height="100" rx="14" fill="#1A1203" stroke="#EAB308" stroke-width="1.5" stroke-opacity="0.4"/>
  <text x="590" y="955" font-family="system-ui,sans-serif" font-size="12" fill="#EAB308" font-weight="700" letter-spacing="2">TIMELINE</text>
  <text x="590" y="995" font-family="system-ui,sans-serif" font-size="20" font-weight="700" fill="white">${safeTimeline}</text>

  <!-- Bottom CTA -->
  <line x1="60" y1="1040" x2="${S - 60}" y2="1040" stroke="#1E293B" stroke-width="1"/>
  <text x="${S / 2}" y="1070" text-anchor="middle" font-family="system-ui,sans-serif" font-size="15" fill="#475569">Apna free AI Career Assessment lo →</text>
  <text x="${S / 2}" y="1098" text-anchor="middle" font-family="system-ui,sans-serif" font-size="15" fill="#3B82F6" font-weight="600">${safeUrl}</text>
</svg>`;
}

export async function generateShareImage(opts: {
  skill_level: string;
  skill_score: number;
  career_paths: string[];
  expected_income: string;
  timeline: string;
  technical: number;
  mindset: number;
  market_awareness: number;
  share_url: string;
  learning_order?: string[];
  strengths?: string[];
  gaps?: string[];
}): Promise<Buffer> {
  const svg = generateSkillResultCardSVG(opts);
  // Convert SVG to PNG using canvas or sharp
  // For now, return SVG as buffer
  return Buffer.from(svg, "utf-8");
}
