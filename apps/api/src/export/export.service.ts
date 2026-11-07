import { Injectable, NotFoundException } from '@nestjs/common';
import { PresentationsService } from '../presentations/presentations.service';
import { PresentationDocument, THEMES, Slide, ThemeConfig } from '@ai-slide-studio/shared';

@Injectable()
export class ExportService {
  constructor(private readonly presentationsService: PresentationsService) {}

  async exportHtml(presentationId: string): Promise<{ filename: string; html: string }> {
    const document = await this.presentationsService.findOne(presentationId);
    const safeTitle = document.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeTitle || 'presentation'}.html`;
    const html = this.generateStandaloneHtml(document);

    return { filename, html };
  }

  async exportPdf(presentationId: string): Promise<{ filename: string; buffer: Buffer }> {
    const document = await this.presentationsService.findOne(presentationId);
    const safeTitle = document.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeTitle || 'presentation'}.pdf`;
    const html = this.generateStandaloneHtml(document);

    // Locate Playwright Chromium in workspace
    let chromium: any;
    try {
      const path = require('path');
      const candidates = [
        path.resolve(process.cwd(), 'apps/web/node_modules/@playwright/test'),
        path.resolve(process.cwd(), 'node_modules/@playwright/test'),
        path.resolve(__dirname, '../../../../web/node_modules/@playwright/test'),
        path.resolve(__dirname, '../../../../node_modules/@playwright/test'),
      ];
      for (const cand of candidates) {
        try {
          const mod = require(cand);
          if (mod.chromium) {
            chromium = mod.chromium;
            break;
          }
        } catch {}
      }
      if (!chromium) {
        const mod = require('@playwright/test');
        chromium = mod.chromium;
      }
    } catch {
      throw new Error('Chromium/Playwright engine not available for server PDF export');
    }

    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);

      const buffer = await page.pdf({
        printBackground: true,
        width: '1920px',
        height: '1080px',
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      return { filename, buffer };
    } finally {
      await browser.close();
    }
  }

  async exportJson(presentationId: string): Promise<{ filename: string; json: string }> {
    const document = await this.presentationsService.findOne(presentationId);
    const safeTitle = document.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeTitle || 'presentation'}.json`;

    return { filename, json: JSON.stringify(document, null, 2) };
  }

  async importJson(jsonContent: string): Promise<PresentationDocument> {
    try {
      const parsed = JSON.parse(jsonContent);
      parsed.id = `pres-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      return await this.presentationsService.create(parsed);
    } catch (err: any) {
      throw new Error(`Invalid presentation JSON: ${err.message || err}`);
    }
  }

  generateStandaloneHtml(doc: PresentationDocument): string {
    const theme: ThemeConfig = THEMES[doc.theme] || THEMES['modern-dark'];
    const slidesHtml = doc.slides
      .map((slide, idx) => this.renderSlideHtml(slide, idx, doc.slides.length, theme))
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${this.escapeHtml(doc.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,300..700;1,300..700&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&display=swap" rel="stylesheet">
<style>
:root {
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
.deck[data-theme="dark"] {
  --bg: ${theme.colors.background};
  --bg2: ${theme.colors.backgroundSecondary};
  --panel: ${theme.colors.cardBackground};
  --pb: ${theme.colors.cardBorder};
  --tx: ${theme.colors.textPrimary};
  --tx2: ${theme.colors.textSecondary};
  --mu: ${theme.colors.textMuted};
  --pri: ${theme.colors.accentPrimary};
  --sec: ${theme.colors.accentSecondary};
  --glow: ${theme.colors.accentGlow};
  --badge-bg: ${theme.colors.badgeBackground};
  --badge-tx: ${theme.colors.badgeText};
  --bar-bg: rgba(15, 13, 34, 0.88);
  --bar-border: rgba(124, 98, 255, 0.2);
}
.deck[data-theme="light"] {
  --bg: #F8FAFC;
  --bg2: #EEF2F6;
  --panel: #FFFFFF;
  --pb: #E2E8F0;
  --tx: #0F172A;
  --tx2: #334155;
  --mu: #64748B;
  --pri: #4F46E5;
  --sec: #0284C7;
  --glow: rgba(79, 70, 229, 0.18);
  --badge-bg: #EEF2FF;
  --badge-tx: #4338CA;
  --bar-bg: rgba(255, 255, 255, 0.88);
  --bar-border: #E2E8F0;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Roboto', 'Kantumruy Pro', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--bg);
  color: var(--tx);
  overflow: hidden;
  height: 100vh;
  width: 100vw;
  user-select: none;
}
:lang(km), [data-lang="km"], .kh {
  font-family: 'Kantumruy Pro', 'Roboto', sans-serif;
}
.deck {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  transition: background 0.3s var(--ease), color 0.3s var(--ease);
}
.deck.navL .vp { cursor: w-resize; }
.deck.navR .vp { cursor: e-resize; }
.vp { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.stage {
  position: absolute;
  width: 1920px;
  height: 1080px;
  transform-origin: center center;
  overflow: hidden;
  background: radial-gradient(circle at 50% 15%, var(--bg2) 0%, var(--bg) 100%);
  border-radius: 20px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
}

/* Ambient background effect matching ELMS presentation */
.bgfx { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.bgfx .dots {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1.2px, transparent 1.2px);
  background-size: 32px 32px;
  opacity: 0.45;
  mask-image: radial-gradient(ellipse at 70% 40%, #000 0%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at 70% 40%, #000 0%, transparent 75%);
}
.bgfx .blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
}
.bgfx .b1 {
  width: 720px; height: 720px;
  background: var(--glow);
  right: -140px; top: -200px;
  opacity: 0.4;
  animation: drift 18s ease-in-out infinite alternate;
}
.bgfx .b2 {
  width: 540px; height: 540px;
  background: var(--sec);
  opacity: 0.25;
  left: -160px; bottom: -180px;
  animation: drift 22s ease-in-out infinite alternate-reverse;
}
@keyframes drift { to { transform: translate(-70px, 50px) scale(1.1); } }

.slide {
  position: absolute;
  inset: 0;
  padding: 80px 110px 140px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: scale(0.975) translateY(12px);
  filter: blur(6px);
  transition: opacity 0.5s var(--ease), transform 0.5s var(--ease), filter 0.5s var(--ease), visibility 0s 0.5s;
  display: flex;
  flex-direction: column;
}
.slide.on {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: scale(1) translateY(0);
  filter: blur(0px);
  transition: opacity 0.5s var(--ease), transform 0.5s var(--ease), filter 0.5s var(--ease);
}

/* Entrance animations: Apple Keynote 65ms staggers, micro-motion, and soft blur */
.slide.on .a { animation: up 0.65s var(--ease) both; animation-delay: calc(var(--d,0)*65ms + 60ms); }
.slide.on .a-l { animation: fromL 0.7s var(--ease) both; animation-delay: calc(var(--d,0)*65ms + 60ms); }
.slide.on .a-r { animation: fromR 0.7s var(--ease) both; animation-delay: calc(var(--d,0)*65ms + 60ms); }
.slide.on .a-z { animation: zoom 0.7s var(--ease) both; animation-delay: calc(var(--d,0)*65ms + 60ms); }

@keyframes up {
  from { opacity: 0; transform: translateY(18px) scale(0.985); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
}
@keyframes fromL {
  from { opacity: 0; transform: translateX(-24px) scale(0.985); filter: blur(4px); }
  to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
}
@keyframes fromR {
  from { opacity: 0; transform: translateX(24px) scale(0.985); filter: blur(4px); }
  to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
}
@keyframes zoom {
  from { opacity: 0; transform: scale(0.95); filter: blur(6px); }
  to { opacity: 1; transform: scale(1); filter: blur(0px); }
}

/* Typography & Badges */
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pri);
  margin-bottom: 20px;
}
.eyebrow::before {
  content: "";
  width: 32px;
  height: 2px;
  background: linear-gradient(90deg, var(--pri), var(--sec));
  border-radius: 2px;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 9999px;
  background: var(--badge-bg);
  color: var(--badge-tx);
  border: 1px solid var(--pb);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 24px;
  width: fit-content;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.slide-h {
  font-size: 56px;
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--tx);
  margin-bottom: 14px;
}
.slide-sub {
  font-size: 24px;
  line-height: 1.45;
  color: var(--tx2);
  margin-bottom: 38px;
  max-width: 1200px;
}

/* Luxury Cards & Specular Sheen */
.card {
  background: var(--panel);
  border: 1px solid var(--pb);
  border-radius: 24px;
  padding: 36px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  transition: transform 0.25s var(--ease), border-color 0.25s ease, box-shadow 0.25s ease;
}
.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 45%);
}
.card:hover {
  transform: translateY(-2px);
  border-color: var(--pri);
  box-shadow: 0 24px 60px var(--glow), inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.ic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: linear-gradient(140deg, var(--pri), var(--sec));
  color: #fff;
  box-shadow: 0 10px 24px var(--glow);
  position: relative;
  margin-bottom: 20px;
}
.ic svg { width: 28px; height: 28px; }

.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; width: 100%; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; width: 100%; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; width: 100%; }

/* Statistics */
.stat-val {
  font-size: 82px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #FFFFFF 40%, var(--sec) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  font-family: 'JetBrains Mono', monospace;
}
.stat-label { font-size: 22px; font-weight: 700; color: var(--tx); margin-bottom: 6px; }
.stat-sub { font-size: 16px; color: var(--mu); line-height: 1.4; }

/* Timeline */
.timeline-list { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 10px; }
.timeline-card { padding: 32px; position: relative; }
.timeline-phase { font-size: 13px; font-weight: 700; color: var(--pri); letter-spacing: 0.12em; margin-bottom: 12px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }

/* Comparison */
.comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; flex: 1; }
.comp-card { padding: 40px; display: flex; flex-direction: column; justify-content: space-between; }
.comp-card.highlight { border-color: var(--pri); box-shadow: 0 0 35px var(--glow); }

/* Bullets & Lists */
.bullet-list { list-style: none; display: flex; flex-direction: column; gap: 20px; font-size: 22px; color: var(--tx2); line-height: 1.5; }
.bullet-item { display: flex; align-items: flex-start; gap: 16px; }
.bullet-icon { flex: none; width: 28px; height: 28px; border-radius: 50%; background: var(--badge-bg); color: var(--pri); display: flex; align-items: center; justify-content: center; margin-top: 3px; border: 1px solid var(--pb); }

/* Cover layout */
.cover-layout { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; height: 100%; padding-top: 40px; }
.cover-layout .slide-h { font-size: 88px; line-height: 1.1; max-width: 1400px; margin-bottom: 24px; }
.cover-layout .slide-sub { font-size: 30px; max-width: 1000px; color: var(--tx2); margin-bottom: 48px; }

/* Closing layout */
.closing-layout { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; height: 100%; }
.closing-layout .slide-h { font-size: 96px; margin-bottom: 20px; }
.closing-layout .slide-sub { font-size: 30px; color: var(--tx2); margin-bottom: 40px; }
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 42px;
  border-radius: 40px;
  background: linear-gradient(135deg, var(--pri), var(--sec));
  color: #FFFFFF;
  font-size: 20px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 25px var(--glow);
  cursor: pointer;
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.cta-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 36px var(--glow); }

/* Bottom Presentation Bar */
.bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 72px;
  background: var(--bar-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--bar-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 100;
  transition: transform 0.3s var(--ease), background 0.3s var(--ease), border-color 0.3s var(--ease);
}
.progress-bar-container { position: absolute; top: -2px; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.08); }
.progress-bar { height: 100%; width: 0%; background: linear-gradient(90deg, var(--pri), var(--sec)); transition: width 0.3s ease; }
.bar-left, .bar-right { display: flex; align-items: center; gap: 16px; }
.slide-counter { font-size: 14px; font-weight: 600; color: var(--mu); }
.slide-counter span { color: var(--tx); }
.ctl-btn {
  background: rgba(125, 125, 125, 0.08);
  border: 1px solid var(--pb);
  color: var(--tx);
  height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.ctl-btn:hover:not(:disabled) { background: rgba(124, 92, 252, 0.2); border-color: var(--pri); }
.ctl-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.dots-nav { display: flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--mu); opacity: 0.3; border: none; cursor: pointer; transition: all 0.3s; padding: 0; }
.dot.active { opacity: 1; background: var(--pri); transform: scale(1.4); }

/* Watermark slide number */
.slide-num {
  position: absolute;
  right: 60px;
  bottom: 40px;
  font-size: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.1em;
  opacity: 0.35;
  color: var(--mu);
}

/* SVG Icons */
svg.lu { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

/* Print & PDF Export (Matching ELMS sample file) */
@media print {
  @page {
    size: 1920px 1080px;
    margin: 0;
  }
  html, body {
    height: auto !important;
    overflow: visible !important;
    background: #000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .deck { position: static !important; width: 1920px !important; height: auto !important; }
  .vp { position: static !important; display: block !important; }
  .stage {
    position: static !important;
    width: 1920px !important;
    height: auto !important;
    transform: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
  }
  .bar, .progress-bar-container, .ctl-btn, .slide-counter, .dots-nav {
    display: none !important;
  }
  .slide {
    position: relative !important;
    inset: auto !important;
    width: 1920px !important;
    height: 1080px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    overflow: hidden !important;
    break-after: page !important;
    page-break-after: always !important;
    background: radial-gradient(circle at 50% 15%, var(--bg2) 0%, var(--bg) 100%) !important;
  }
  .slide:last-child {
    break-after: auto !important;
    page-break-after: auto !important;
  }
  .bgfx .blob { display: none !important; }
  .slide * {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    animation: none !important;
    transition: none !important;
  }
  .slide .a {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}
</style>
</head>
<body>
<div class="deck" id="deck" data-theme="dark">
  <div class="vp" id="vp" title="Click right side for Next, left side for Previous">
    <div class="stage" id="stage">
      <!-- Ambient background matching ELMS presentation -->
      <div class="bgfx">
        <div class="dots"></div>
        <div class="blob b1"></div>
        <div class="blob b2"></div>
      </div>
      ${slidesHtml}
    </div>
  </div>

  <div class="bar" id="bar">
    <div class="progress-bar-container">
      <div class="progress-bar" id="prog"></div>
    </div>
    <div class="bar-left">
      <button class="ctl-btn" id="prevBtn" title="Previous Slide (Left Arrow)">
        <i data-i="arrow-left"></i> Previous
      </button>
      <button class="ctl-btn" id="nextBtn" title="Next Slide (Right Arrow or Space)">
        Next <i data-i="arrow-right"></i>
      </button>
      <div class="slide-counter" id="slideCounter">Slide <span id="curNum">1</span> of ${doc.slides.length}</div>
    </div>
    <div class="dots-nav" id="dotsNav"></div>
    <div class="bar-right">
      <button class="ctl-btn" id="themeBtn" title="Toggle Theme (T)">
        <i data-i="sun" id="themeIcon"></i> <span id="themeText">Light</span>
      </button>
      <button class="ctl-btn" id="printBtn" title="Print / Save as PDF (Ctrl+P or Cmd+P)">
        <i data-i="printer"></i> <span>Print / PDF</span>
      </button>
      <button class="ctl-btn" id="autoPlayBtn" title="Toggle Autoplay (P)">
        <i data-i="play" id="playIcon"></i> <span id="autoPlayText">Autoplay</span>
      </button>
      <button class="ctl-btn" id="fsBtn" title="Toggle Fullscreen (F)">
        <i data-i="maximize"></i> Fullscreen
      </button>
    </div>
  </div>
</div>

<script>
(()=>{
// Embedded SVG Icons registry (NO emojis)
const ICONS = {
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'play': '<polygon points="5 3 19 12 5 21 5 3"/>',
  'pause': '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  'maximize': '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  'activity': '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
  'cpu': '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
  'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  'layers': '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5"/>',
  'calendar': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  'printer': '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'
};

document.querySelectorAll('i[data-i]').forEach(el => {
  const name = el.getAttribute('data-i');
  if (ICONS[name]) {
    el.innerHTML = '<svg class="lu" viewBox="0 0 24 24">' + ICONS[name] + '</svg>';
  }
});

// Presentation Player & Responsive Scale
const stage = document.getElementById('stage');
const vp = document.getElementById('vp');
const deck = document.getElementById('deck');
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
let currentIndex = 0;
let autoplayTimer = null;
let isAutoplaying = false;

function fitStage() {
  const w = vp.clientWidth;
  const h = vp.clientHeight;
  const scale = Math.min(w / 1920, h / 1080);
  stage.style.transform = 'scale(' + scale + ')';
}
window.addEventListener('resize', fitStage);
fitStage();

// Setup Dots
const dotsNav = document.getElementById('dotsNav');
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    goToSlide(i);
  });
  dotsNav.appendChild(dot);
});

// Counter count-up with cubic ease-out matching ELMS presentation
function animateCounters(slideEl) {
  slideEl.querySelectorAll('[data-counter]').forEach(el => {
    const rawTarget = el.getAttribute('data-counter');
    const target = parseFloat(rawTarget);
    if (isNaN(target)) return;
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    el.textContent = prefix + '0' + suffix;
    const startTime = performance.now();
    const duration = 1200;
    function update(now) {
      const elapsed = Math.min(1, Math.max(0, (now - startTime) / duration));
      const ease = 1 - Math.pow(1 - elapsed, 3);
      const val = (target * ease);
      el.textContent = prefix + (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
      if (elapsed < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

function goToSlide(index) {
  if (index < 0 || index >= totalSlides) return;
  slides.forEach((s, idx) => {
    if (idx !== index) s.classList.remove('on');
  });
  currentIndex = index;
  const activeSlide = slides[currentIndex];
  activeSlide.classList.remove('on');
  void activeSlide.offsetWidth; // Force CSS animation reflow to replay Keynote animations
  activeSlide.classList.add('on');

  // Update UI
  document.getElementById('curNum').textContent = currentIndex + 1;
  document.getElementById('prog').style.width = ((currentIndex + 1) / totalSlides * 100) + '%';
  document.getElementById('prevBtn').disabled = currentIndex === 0;
  document.getElementById('nextBtn').disabled = currentIndex === totalSlides - 1;

  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentIndex);
  });

  animateCounters(activeSlide);
}

document.getElementById('prevBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  goToSlide(currentIndex - 1);
});
document.getElementById('nextBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  goToSlide(currentIndex + 1);
});

// Theme switcher
let currentTheme = 'dark';
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  deck.setAttribute('data-theme', currentTheme);
  if (themeText) themeText.textContent = currentTheme === 'dark' ? 'Light' : 'Dark';
  if (themeIcon) {
    const iconName = currentTheme === 'dark' ? 'sun' : 'moon';
    themeIcon.setAttribute('data-i', iconName);
    themeIcon.innerHTML = '<svg class="lu" viewBox="0 0 24 24">' + ICONS[iconName] + '</svg>';
  }
}

if (themeBtn) {
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTheme();
  });
}

// Keyboard Navigation
window.addEventListener('keydown', (e) => {
  if (['ArrowRight', 'Space', 'PageDown'].includes(e.code)) {
    e.preventDefault();
    goToSlide(currentIndex + 1);
  } else if (['ArrowLeft', 'PageUp'].includes(e.code)) {
    e.preventDefault();
    goToSlide(currentIndex - 1);
  } else if (e.code === 'Home') {
    e.preventDefault();
    goToSlide(0);
  } else if (e.code === 'End') {
    e.preventDefault();
    goToSlide(totalSlides - 1);
  } else if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen();
  } else if (e.key === 'p' || e.key === 'P') {
    toggleAutoplay();
  } else if (e.key === 't' || e.key === 'T') {
    toggleTheme();
  }
});

// Fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}
document.getElementById('fsBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  toggleFullscreen();
});

// Print & PDF Export
const printBtn = document.getElementById('printBtn');
if (printBtn) {
  printBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.print();
  });
}

// Autoplay
function toggleAutoplay() {
  isAutoplaying = !isAutoplaying;
  const playIcon = document.getElementById('playIcon');
  const autoPlayText = document.getElementById('autoPlayText');
  if (isAutoplaying) {
    playIcon.setAttribute('data-i', 'pause');
    playIcon.innerHTML = '<svg class="lu" viewBox="0 0 24 24">' + ICONS['pause'] + '</svg>';
    autoPlayText.textContent = 'Pause';
    autoplayTimer = setInterval(() => {
      if (currentIndex < totalSlides - 1) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(0);
      }
    }, 4500);
  } else {
    playIcon.setAttribute('data-i', 'play');
    playIcon.innerHTML = '<svg class="lu" viewBox="0 0 24 24">' + ICONS['play'] + '</svg>';
    autoPlayText.textContent = 'Autoplay';
    clearInterval(autoplayTimer);
  }
}
document.getElementById('autoPlayBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  toggleAutoplay();
});

// Canva-style click and mouse hints on left / right half of slide canvas matching ELMS presentation
vp.addEventListener('mousemove', (e) => {
  if (e.target.closest('button, a, input, select, textarea, .bar')) {
    deck.classList.remove('navL', 'navR');
    return;
  }
  const rect = vp.getBoundingClientRect();
  const isLeft = (e.clientX - rect.left) < rect.width * 0.3;
  deck.classList.toggle('navL', isLeft && currentIndex > 0);
  deck.classList.toggle('navR', !isLeft && currentIndex < totalSlides - 1);
});
vp.addEventListener('mouseleave', () => {
  deck.classList.remove('navL', 'navR');
});

vp.addEventListener('click', (e) => {
  if (e.target.closest('button, a, input, select, textarea, .bar')) return;
  const rect = vp.getBoundingClientRect();
  if (e.clientX - rect.left < rect.width * 0.3) {
    goToSlide(currentIndex - 1);
  } else {
    goToSlide(currentIndex + 1);
  }
});

goToSlide(0);
})();
</script>
</body>
</html>`;
  }

  private renderSlideHtml(slide: Slide, index: number, total: number, theme: ThemeConfig): string {
    const activeClass = index === 0 ? 'on' : '';
    const content = slide.content;

    let bodyHtml = '';

    switch (slide.layout) {
      case 'cover':
        bodyHtml = `
          <div class="cover-layout">
            ${content.badge ? `<div class="badge a" style="--d: 0;">${this.escapeHtml(content.badge)}</div>` : ''}
            <h1 class="slide-h a" style="--d: 1;">${this.escapeHtml(content.title)}</h1>
            ${content.subtitle ? `<div class="slide-sub a" style="--d: 2;">${this.escapeHtml(content.subtitle)}</div>` : ''}
          </div>
        `;
        break;

      case 'title-content':
        bodyHtml = `
          <div>
            ${content.badge ? `<div class="eyebrow a" style="--d: 0;">${this.escapeHtml(content.badge)}</div>` : ''}
            <h2 class="slide-h a" style="--d: 1;">${this.escapeHtml(content.title)}</h2>
            ${content.subtitle ? `<div class="slide-sub a" style="--d: 2;">${this.escapeHtml(content.subtitle)}</div>` : ''}
          </div>
          <div class="card a" style="flex: 1; --d: 3;">
            ${content.body ? `<p style="font-size: 22px; line-height: 1.6; margin-bottom: 24px; color: var(--tx2);">${this.escapeHtml(content.body)}</p>` : ''}
            ${
              content.bulletPoints && content.bulletPoints.length
                ? `<ul class="bullet-list">
                    ${content.bulletPoints
                      .map(
                        (b, idx) => `
                      <li class="bullet-item a" style="--d: ${idx + 4};">
                        <span class="bullet-icon"><i data-i="check"></i></span>
                        <span>${this.escapeHtml(b)}</span>
                      </li>
                    `,
                      )
                      .join('')}
                  </ul>`
                : ''
            }
          </div>
        `;
        break;

      case 'feature-grid':
        bodyHtml = `
          <div>
            ${content.badge ? `<div class="eyebrow a" style="--d: 0;">${this.escapeHtml(content.badge)}</div>` : ''}
            <h2 class="slide-h a" style="--d: 1;">${this.escapeHtml(content.title)}</h2>
            ${content.subtitle ? `<div class="slide-sub a" style="--d: 2;">${this.escapeHtml(content.subtitle)}</div>` : ''}
          </div>
          <div class="grid-3" style="flex: 1; align-items: stretch;">
            ${(content.features || [])
              .map(
                (f, idx) => `
              <div class="card a" style="display: flex; flex-direction: column; justify-content: space-between; --d: ${idx + 3};">
                <div>
                  <div class="ic">
                    <i data-i="${this.escapeHtml(f.icon || 'zap')}"></i>
                  </div>
                  <h3 style="font-size: 26px; font-weight: 700; color: var(--tx); margin-bottom: 12px;">${this.escapeHtml(f.title)}</h3>
                  <p style="font-size: 18px; line-height: 1.55; color: var(--tx2);">${this.escapeHtml(f.description)}</p>
                </div>
                ${f.badge ? `<div style="margin-top: 24px; font-size: 13px; font-weight: 700; color: var(--pri); letter-spacing: 0.1em; font-family: 'JetBrains Mono', monospace;">${this.escapeHtml(f.badge)}</div>` : ''}
              </div>
            `,
              )
              .join('')}
          </div>
        `;
        break;

      case 'statistics':
      case 'metric-highlight':
        bodyHtml = `
          <div>
            ${content.badge ? `<div class="eyebrow a" style="--d: 0;">${this.escapeHtml(content.badge)}</div>` : ''}
            <h2 class="slide-h a" style="--d: 1;">${this.escapeHtml(content.title)}</h2>
            ${content.subtitle ? `<div class="slide-sub a" style="--d: 2;">${this.escapeHtml(content.subtitle)}</div>` : ''}
          </div>
          <div class="grid-3" style="flex: 1; align-items: stretch;">
            ${(content.statistics || [])
              .map(
                (s, idx) => `
              <div class="card a" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; --d: ${idx + 3};">
                <div class="ic">
                  <i data-i="${this.escapeHtml(s.icon || 'activity')}"></i>
                </div>
                <div class="stat-val" data-counter="${this.extractNumber(s.value)}" data-suffix="${this.escapeHtml(s.suffix || '')}">
                  ${this.escapeHtml(s.value)}
                </div>
                <div class="stat-label">${this.escapeHtml(s.label)}</div>
                ${s.subtext ? `<div class="stat-sub">${this.escapeHtml(s.subtext)}</div>` : ''}
              </div>
            `,
              )
              .join('')}
          </div>
        `;
        break;

      case 'timeline':
        bodyHtml = `
          <div>
            ${content.badge ? `<div class="eyebrow a" style="--d: 0;">${this.escapeHtml(content.badge)}</div>` : ''}
            <h2 class="slide-h a" style="--d: 1;">${this.escapeHtml(content.title)}</h2>
            ${content.subtitle ? `<div class="slide-sub a" style="--d: 2;">${this.escapeHtml(content.subtitle)}</div>` : ''}
          </div>
          <div class="timeline-list" style="flex: 1; align-items: stretch;">
            ${(content.timeline || [])
              .map(
                (step, idx) => `
              <div class="card timeline-card a" style="--d: ${idx + 3};">
                <div class="timeline-phase">${this.escapeHtml(step.phase)}</div>
                <h3 style="font-size: 22px; font-weight: 700; color: var(--tx); margin-bottom: 12px;">${this.escapeHtml(step.title)}</h3>
                <p style="font-size: 16px; line-height: 1.5; color: var(--tx2);">${this.escapeHtml(step.description)}</p>
                ${step.dateRange ? `<div style="margin-top: 20px; font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--mu);">${this.escapeHtml(step.dateRange)}</div>` : ''}
              </div>
            `,
              )
              .join('')}
          </div>
        `;
        break;

      case 'comparison':
        bodyHtml = `
          <div>
            ${content.badge ? `<div class="eyebrow a" style="--d: 0;">${this.escapeHtml(content.badge)}</div>` : ''}
            <h2 class="slide-h a" style="--d: 1;">${this.escapeHtml(content.title)}</h2>
            ${content.subtitle ? `<div class="slide-sub a" style="--d: 2;">${this.escapeHtml(content.subtitle)}</div>` : ''}
          </div>
          <div class="comp-grid">
            ${
              content.comparison
                ? `
              <div class="card comp-card a-l" style="--d: 3;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #EF4444; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace;">${this.escapeHtml(content.comparison.left.tag || 'CONVENTIONAL')}</div>
                  <h3 style="font-size: 28px; font-weight: 700; color: var(--tx); margin-bottom: 24px;">${this.escapeHtml(content.comparison.left.title)}</h3>
                  <ul class="bullet-list">
                    ${content.comparison.left.points
                      .map(
                        (p, idx) => `
                      <li class="bullet-item a" style="--d: ${idx + 4};">
                        <span class="bullet-icon" style="background: rgba(239, 68, 68, 0.15); color: #EF4444;"><i data-i="check"></i></span>
                        <span>${this.escapeHtml(p)}</span>
                      </li>
                    `,
                      )
                      .join('')}
                  </ul>
                </div>
              </div>
              <div class="card comp-card highlight a-r" style="--d: 3;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: var(--pri); margin-bottom: 8px; font-family: 'JetBrains Mono', monospace;">${this.escapeHtml(content.comparison.right.tag || 'AI SLIDE STUDIO SOLUTION')}</div>
                  <h3 style="font-size: 28px; font-weight: 700; color: var(--tx); margin-bottom: 24px;">${this.escapeHtml(content.comparison.right.title)}</h3>
                  <ul class="bullet-list">
                    ${content.comparison.right.points
                      .map(
                        (p, idx) => `
                      <li class="bullet-item a" style="--d: ${idx + 4};">
                        <span class="bullet-icon"><i data-i="check"></i></span>
                        <span>${this.escapeHtml(p)}</span>
                      </li>
                    `,
                      )
                      .join('')}
                  </ul>
                </div>
              </div>
            `
                : ''
            }
          </div>
        `;
        break;

      case 'key-takeaways':
        bodyHtml = `
          <div>
            ${content.badge ? `<div class="eyebrow a" style="--d: 0;">${this.escapeHtml(content.badge)}</div>` : ''}
            <h2 class="slide-h a" style="--d: 1;">${this.escapeHtml(content.title)}</h2>
            ${content.subtitle ? `<div class="slide-sub a" style="--d: 2;">${this.escapeHtml(content.subtitle)}</div>` : ''}
          </div>
          <div class="card a" style="flex: 1; padding: 48px; --d: 3;">
            <ul class="bullet-list" style="gap: 26px;">
              ${(content.takeaways || [])
                .map(
                  (t, idx) => `
                <li class="bullet-item a" style="font-size: 24px; --d: ${idx + 4};">
                  <span class="bullet-icon" style="width: 36px; height: 36px;"><i data-i="check"></i></span>
                  <span>${this.escapeHtml(t)}</span>
                </li>
              `,
                )
                .join('')}
            </ul>
          </div>
        `;
        break;

      case 'two-columns':
        bodyHtml = `
          <div>
            ${content.badge ? `<div class="eyebrow a" style="--d: 0;">${this.escapeHtml(content.badge)}</div>` : ''}
            <h2 class="slide-h a" style="--d: 1;">${this.escapeHtml(content.title)}</h2>
            ${content.subtitle ? `<div class="slide-sub a" style="--d: 2;">${this.escapeHtml(content.subtitle)}</div>` : ''}
          </div>
          <div class="grid-2" style="flex: 1; align-items: stretch;">
            <div class="card a-l" style="--d: 3;">
              <p style="font-size: 22px; line-height: 1.6; color: var(--tx2); white-space: pre-line;">${this.escapeHtml(content.leftColumn || '')}</p>
            </div>
            <div class="card a-r" style="--d: 3;">
              <p style="font-size: 22px; line-height: 1.6; color: var(--tx2); white-space: pre-line;">${this.escapeHtml(content.rightColumn || '')}</p>
            </div>
          </div>
        `;
        break;

      case 'quote':
        bodyHtml = `
          ${content.badge ? `<div class="eyebrow a" style="--d: 0;">${this.escapeHtml(content.badge)}</div>` : ''}
          <div class="card a-z" style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 60px 80px; --d: 1;">
            <blockquote style="font-size: 38px; line-height: 1.4; font-weight: 500; color: var(--tx); margin-bottom: 32px; font-style: italic;">
              "${this.escapeHtml(content.quote || '')}"
            </blockquote>
            <div class="a" style="--d: 2;">
              <div style="font-size: 26px; font-weight: 700; color: var(--pri);">${this.escapeHtml(content.author || '')}</div>
              <div style="font-size: 18px; color: var(--mu);">${this.escapeHtml(content.authorRole || '')}</div>
            </div>
          </div>
        `;
        break;

      case 'closing':
      default:
        bodyHtml = `
          <div class="closing-layout">
            ${content.badge ? `<div class="badge a" style="--d: 0;">${this.escapeHtml(content.badge)}</div>` : ''}
            <h1 class="slide-h a" style="--d: 1;">${this.escapeHtml(content.title)}</h1>
            ${content.subtitle ? `<div class="slide-sub a" style="--d: 2;">${this.escapeHtml(content.subtitle)}</div>` : ''}
            ${content.ctaText ? `<a class="cta-btn a" style="--d: 3;" href="${this.escapeHtml(content.ctaUrl || '#')}">${this.escapeHtml(content.ctaText)} <i data-i="arrow-right"></i></a>` : ''}
          </div>
        `;
        break;
    }

    return `
      <div class="slide ${activeClass}" id="slide-${slide.id}" data-layout="${slide.layout}">
        ${bodyHtml}
        <div class="slide-num">${index + 1 < 10 ? '0' + (index + 1) : index + 1}</div>
      </div>
    `;
  }

  private extractNumber(val: string): number {
    const match = val.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
