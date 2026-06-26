function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length <= maxChars) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ── 1200×630 landscape (OG / link preview) ──────────────────────────────────
export function generateResultCardSVG(opts: {
  skill_path: string;
  income_6m: string;
  income_12m: string;
  rarity: string;
  share_url: string;
}): string {
  const { skill_path, income_6m, income_12m, rarity, share_url } = opts;
  const w = 1200;
  const h = 630;

  const pathParts = skill_path.includes(" — ")
    ? skill_path.split(" — ")
    : wrapText(skill_path, 38);
  const pathLine1 = escapeXml(pathParts[0] || skill_path);
  const pathLine2 = escapeXml(pathParts.slice(1).join(" — "));

  const safeIncome6m = escapeXml(income_6m);
  const safeIncome12m = escapeXml(income_12m);
  const safeRarity = escapeXml(rarity);
  const safeShareUrl = escapeXml(share_url.replace(/^https?:\/\//, ""));

  const primaryFontSize = pathLine2 ? 46 : 54;
  const primaryY = pathLine2 ? 282 : 296;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#07101E"/>
      <stop offset="60%" stop-color="#0D1626"/>
      <stop offset="100%" stop-color="#111B30"/>
    </linearGradient>
    <linearGradient id="stripe" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0"/>
      <stop offset="40%" stop-color="#3B82F6"/>
      <stop offset="60%" stop-color="#22D3EE"/>
      <stop offset="100%" stop-color="#22D3EE" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="income1" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#0D2E1A"/>
      <stop offset="100%" stop-color="#071A10"/>
    </linearGradient>
    <linearGradient id="income2" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#2D2005"/>
      <stop offset="100%" stop-color="#1A1203"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <ellipse cx="180" cy="100" rx="220" ry="160" fill="#3B82F6" opacity="0.06"/>
  <ellipse cx="${w - 100}" cy="${h - 80}" rx="280" ry="180" fill="#8B5CF6" opacity="0.05"/>
  ${Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 16 }, (_, col) =>
      `<circle cx="${col * 80 + 20}" cy="${row * 90 + 20}" r="1.2" fill="#fff" opacity="0.04"/>`
    ).join("")
  ).join("")}
  <rect y="0" width="${w}" height="3" fill="url(#stripe)" opacity="0.9"/>
  <rect x="60" y="70" width="4" height="80" rx="2" fill="#3B82F6" opacity="0.8"/>
  <rect x="76" y="70" width="36" height="36" rx="8" fill="#2563EB"/>
  <text x="94" y="94" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="900" fill="white">B</text>
  <text x="122" y="89" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="white">Byonsoft <tspan fill="#60A5FA">OS</tspan></text>
  <text x="122" y="107" font-family="system-ui,sans-serif" font-size="11" fill="#64748B" letter-spacing="2">AI CAREER ANALYZER</text>
  <rect x="${w - 280}" y="72" width="218" height="34" rx="17" fill="#1E3A5F" stroke="#3B82F6" stroke-width="1.2" stroke-opacity="0.6"/>
  <circle cx="${w - 258}" cy="89" r="5" fill="#34D399"/>
  <text x="${w - 248}" y="94" font-family="system-ui,sans-serif" font-size="12" fill="#94A3B8">Analysis Complete</text>
  <line x1="60" y1="130" x2="${w - 60}" y2="130" stroke="#1E293B" stroke-width="1"/>
  <text x="64" y="176" font-family="system-ui,sans-serif" font-size="16" fill="#64748B">🚀  AI ne mujhe ye career path recommend kiya!</text>
  <text x="64" y="${primaryY}" font-family="system-ui,sans-serif" font-size="${primaryFontSize}" font-weight="900" fill="white" letter-spacing="-1">${pathLine1}</text>
  ${pathLine2 ? `<text x="64" y="${primaryY + primaryFontSize + 6}" font-family="system-ui,sans-serif" font-size="${primaryFontSize}" font-weight="900" fill="#60A5FA" letter-spacing="-1">${pathLine2}</text>` : ""}
  <rect x="64" y="${h - 190}" width="260" height="120" rx="14" fill="url(#income1)" stroke="#22C55E" stroke-width="1.2" stroke-opacity="0.5"/>
  <text x="90" y="${h - 162}" font-family="system-ui,sans-serif" font-size="11" fill="#22C55E" font-weight="700" letter-spacing="2">6 MONTHS</text>
  <text x="90" y="${h - 138}" font-family="system-ui,sans-serif" font-size="11" fill="#64748B">Estimated earning</text>
  <text x="90" y="${h - 108}" font-family="system-ui,sans-serif" font-size="20" font-weight="900" fill="white">${safeIncome6m}</text>
  <rect x="350" y="${h - 190}" width="310" height="120" rx="14" fill="url(#income2)" stroke="#EAB308" stroke-width="1.2" stroke-opacity="0.5"/>
  <text x="376" y="${h - 162}" font-family="system-ui,sans-serif" font-size="11" fill="#EAB308" font-weight="700" letter-spacing="2">12 MONTHS</text>
  <text x="376" y="${h - 138}" font-family="system-ui,sans-serif" font-size="11" fill="#64748B">Full potential</text>
  <text x="376" y="${h - 108}" font-family="system-ui,sans-serif" font-size="20" font-weight="900" fill="white">${safeIncome12m}</text>
  <rect x="${w - 350}" y="${h - 190}" width="290" height="120" rx="14" fill="#1C1A09" stroke="#EAB308" stroke-width="1.5" stroke-opacity="0.6"/>
  <text x="${w - 235}" y="${h - 162}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#EAB308" font-weight="700" letter-spacing="2">⭐  RARITY</text>
  <text x="${w - 235}" y="${h - 126}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="900" fill="#FDE047">Only ${safeRarity}%</text>
  <text x="${w - 235}" y="${h - 100}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#92400E">users get this result!</text>
  <line x1="60" y1="${h - 52}" x2="${w - 60}" y2="${h - 52}" stroke="#1E293B" stroke-width="1"/>
  <text x="64" y="${h - 24}" font-family="system-ui,sans-serif" font-size="14" fill="#475569">Take your free AI Skill Test →</text>
  <text x="350" y="${h - 24}" font-family="system-ui,sans-serif" font-size="14" fill="#3B82F6" font-weight="600">${safeShareUrl}</text>
  <text x="${w - 64}" y="${h - 24}" text-anchor="end" font-family="system-ui,sans-serif" font-size="12" fill="#334155">byonsoft.com</text>
</svg>`;
}

// ── 1080×1080 square (Instagram / WhatsApp / PNG download) ──────────────────
export function generateSquareCardSVG(opts: {
  skill_path: string;
  income_6m: string;
  income_12m: string;
  rarity: string;
  share_url: string;
}): string {
  const { skill_path, income_6m, income_12m, rarity, share_url } = opts;
  const S = 1080;

  const pathParts = skill_path.includes(" — ")
    ? skill_path.split(" — ")
    : wrapText(skill_path, 28);
  const line1 = escapeXml(pathParts[0] ?? skill_path);
  const line2 = escapeXml(pathParts.slice(1).join(" — "));
  const line3 = "";

  const safeIncome6m = escapeXml(income_6m);
  const safeIncome12m = escapeXml(income_12m);
  const safeRarity = escapeXml(rarity);
  const safeShareUrl = escapeXml(share_url.replace(/^https?:\/\//, ""));

  const titleSize = line2 ? 58 : 68;
  const titleY = 440;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#06101D"/>
      <stop offset="100%" stop-color="#0E1B32"/>
    </linearGradient>
    <linearGradient id="halo" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#2563EB" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#7C3AED" stop-opacity="0.12"/>
    </linearGradient>
    <linearGradient id="topbar" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="50%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
    <linearGradient id="g6m" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#052213"/>
      <stop offset="100%" stop-color="#041A0E"/>
    </linearGradient>
    <linearGradient id="g12m" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#231A04"/>
      <stop offset="100%" stop-color="#18130A"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${S}" height="${S}" fill="url(#bg)"/>

  <!-- Decorative glow circles -->
  <circle cx="200" cy="220" r="320" fill="url(#halo)"/>
  <circle cx="${S - 160}" cy="${S - 200}" r="260" fill="#7C3AED" opacity="0.07"/>

  <!-- Grid dots -->
  ${Array.from({ length: 12 }, (_, row) =>
    Array.from({ length: 12 }, (_, col) =>
      `<circle cx="${col * 100 + 30}" cy="${row * 100 + 30}" r="1.5" fill="#fff" opacity="0.04"/>`
    ).join("")
  ).join("")}

  <!-- Top bar -->
  <rect width="${S}" height="5" fill="url(#topbar)"/>

  <!-- Logo row -->
  <rect x="60" y="56" width="48" height="48" rx="12" fill="#2563EB"/>
  <text x="84" y="88" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" font-weight="900" fill="white">B</text>
  <text x="122" y="76" font-family="system-ui,sans-serif" font-size="22" font-weight="800" fill="white">Byonsoft <tspan fill="#60A5FA">OS</tspan></text>
  <text x="122" y="97" font-family="system-ui,sans-serif" font-size="12" fill="#475569" letter-spacing="3">AI CAREER ANALYZER</text>

  <!-- "Analysis Complete" badge -->
  <rect x="${S - 270}" y="58" width="208" height="36" rx="18" fill="#0F2240" stroke="#2563EB" stroke-width="1.3" stroke-opacity="0.5"/>
  <circle cx="${S - 248}" cy="76" r="6" fill="#34D399"/>
  <text x="${S - 237}" y="81" font-family="system-ui,sans-serif" font-size="13" fill="#94A3B8">Analysis Complete</text>

  <!-- Divider -->
  <line x1="60" y1="132" x2="${S - 60}" y2="132" stroke="#1E293B" stroke-width="1.2"/>

  <!-- Headline sub text -->
  <text x="${S / 2}" y="200" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="#475569">🚀  AI Career Result</text>

  <!-- AI CAREER RESULT big badge -->
  <rect x="${S / 2 - 180}" y="224" width="360" height="56" rx="28" fill="#0F172A" stroke="#3B82F6" stroke-width="1.5" stroke-opacity="0.4"/>
  <text x="${S / 2}" y="260" text-anchor="middle" font-family="system-ui,sans-serif" font-size="15" font-weight="700" fill="#60A5FA" letter-spacing="2">YOUR RECOMMENDED PATH</text>

  <!-- Main career path title -->
  <text x="${S / 2}" y="${titleY}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${titleSize}" font-weight="900" fill="white" letter-spacing="-1">${line1}</text>
  ${line2 ? `<text x="${S / 2}" y="${titleY + titleSize + 8}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${titleSize}" font-weight="900" fill="#60A5FA" letter-spacing="-1">${line2}</text>` : ""}

  <!-- Divider 2 -->
  <line x1="60" y1="${titleY + (line2 ? titleSize * 2 + 36 : titleSize + 36)}" x2="${S - 60}" y2="${titleY + (line2 ? titleSize * 2 + 36 : titleSize + 36)}" stroke="#1E293B" stroke-width="1.2"/>

  <!-- Income cards -->
  <rect x="60" y="740" width="450" height="138" rx="16" fill="url(#g6m)" stroke="#22C55E" stroke-width="1.5" stroke-opacity="0.45"/>
  <text x="100" y="774" font-family="system-ui,sans-serif" font-size="12" fill="#22C55E" font-weight="700" letter-spacing="3">6-MONTH INCOME</text>
  <text x="100" y="800" font-family="system-ui,sans-serif" font-size="13" fill="#475569">Estimated earning</text>
  <text x="100" y="845" font-family="system-ui,sans-serif" font-size="26" font-weight="900" fill="white">${safeIncome6m}</text>

  <rect x="${S - 510}" y="740" width="450" height="138" rx="16" fill="#1C1A09" stroke="#EAB308" stroke-width="1.5" stroke-opacity="0.5"/>
  <text x="${S - 470}" y="774" font-family="system-ui,sans-serif" font-size="12" fill="#EAB308" font-weight="700" letter-spacing="3">12-MONTH POTENTIAL</text>
  <text x="${S - 470}" y="800" font-family="system-ui,sans-serif" font-size="13" fill="#475569">Full potential</text>
  <text x="${S - 470}" y="845" font-family="system-ui,sans-serif" font-size="26" font-weight="900" fill="white">${safeIncome12m}</text>

  <!-- Rarity strip -->
  <rect x="60" y="905" width="${S - 120}" height="60" rx="12" fill="#1C1A03" stroke="#EAB308" stroke-width="1.2" stroke-opacity="0.4"/>
  <text x="${S / 2}" y="942" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="800" fill="#FDE047">⭐  Only ${safeRarity}% users get this result!</text>

  <!-- Bottom CTA -->
  <line x1="60" y1="990" x2="${S - 60}" y2="990" stroke="#1E293B" stroke-width="1"/>
  <text x="${S / 2}" y="1025" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="#475569">Take your free AI Skill Test →</text>
  <text x="${S / 2}" y="1052" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="#3B82F6" font-weight="600">${safeShareUrl}</text>
</svg>`;
}
