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

  async exportJson(presentationId: string): Promise<{ filename: string; json: string }> {
    const document = await this.presentationsService.findOne(presentationId);
    const safeTitle = document.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeTitle || 'presentation'}.json`;

    return { filename, json: JSON.stringify(document, null, 2) };
  }

  async importJson(jsonContent: string): Promise<PresentationDocument> {
    try {
      const parsed = JSON.parse(jsonContent);
      // Give it a fresh ID on import
      parsed.id = `pres-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      return await this.presentationsService.create(parsed);
    } catch (err: any) {
      throw new Error(`Invalid presentation JSON: ${err.message || err}`);
    }
  }

  generateStandaloneHtml(doc: PresentationDocument): string {
    const theme: ThemeConfig = THEMES[doc.theme] || THEMES['modern-dark'];
    const slidesHtml = doc.slides.map((slide, idx) => this.renderSlideHtml(slide, idx, doc.slides.length, theme)).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${this.escapeHtml(doc.title)}</title>
<style>
:root {
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
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  color: var(--tx);
  overflow: hidden;
  height: 100vh;
  width: 100vw;
  user-select: none;
}
.deck { position: relative; width: 100%; height: 100%; overflow: hidden; }
.vp { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.stage {
  position: absolute;
  width: 1920px;
  height: 1080px;
  transform-origin: center center;
  overflow: hidden;
  background: radial-gradient(circle at 50% 20%, var(--bg2) 0%, var(--bg) 100%);
}
.stage::before {
  content: "";
  position: absolute;
  top: -200px;
  left: 20%;
  width: 700px;
  height: 700px;
  background: var(--glow);
  filter: blur(140px);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.5;
}
.slide {
  position: absolute;
  inset: 0;
  padding: 80px 110px 140px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
  transform: scale(0.98);
  display: flex;
  flex-direction: column;
}
.slide.on {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: scale(1);
}
/* Typography */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--badge-bg);
  color: var(--badge-tx);
  border: 1px solid var(--pb);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 20px;
  width: fit-content;
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
  line-height: 1.4;
  color: var(--tx2);
  margin-bottom: 40px;
  max-width: 1200px;
}
/* Cards & Grids */
.card {
  background: var(--panel);
  border: 1px solid var(--pb);
  border-radius: 24px;
  padding: 36px;
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
}
.card::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--pri), var(--sec));
  opacity: 0.8;
}
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; width: 100%; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; width: 100%; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; width: 100%; }

/* Statistics */
.stat-val {
  font-size: 84px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #FFFFFF 30%, var(--sec) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
}
.stat-label { font-size: 22px; font-weight: 700; color: var(--tx); margin-bottom: 6px; }
.stat-sub { font-size: 16px; color: var(--mu); line-height: 1.4; }

/* Timeline */
.timeline-list { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 20px; }
.timeline-card { padding: 30px; position: relative; }
.timeline-phase { font-size: 13px; font-weight: 700; color: var(--pri); letter-spacing: 0.1em; margin-bottom: 10px; }

/* Comparison */
.comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; flex: 1; }
.comp-card { padding: 40px; display: flex; flex-direction: column; justify-content: space-between; }
.comp-card.highlight { border-color: var(--pri); box-shadow: 0 0 30px var(--glow); }

/* Bullets & Lists */
.bullet-list { list-style: none; display: flex; flex-direction: column; gap: 20px; font-size: 22px; color: var(--tx2); line-height: 1.5; }
.bullet-item { display: flex; align-items: flex-start; gap: 16px; }
.bullet-icon { flex: none; width: 28px; height: 28px; border-radius: 50%; background: var(--badge-bg); color: var(--pri); display: flex; align-items: center; justify-content: center; margin-top: 3px; }

/* Cover layout */
.cover-layout { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; height: 100%; padding-top: 40px; }
.cover-layout .slide-h { font-size: 88px; line-height: 1.1; max-width: 1400px; margin-bottom: 24px; }
.cover-layout .slide-sub { font-size: 32px; max-width: 1000px; color: var(--tx2); margin-bottom: 48px; }

/* Closing layout */
.closing-layout { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; height: 100%; }
.closing-layout .slide-h { font-size: 96px; margin-bottom: 20px; }
.closing-layout .slide-sub { font-size: 30px; color: var(--tx2); margin-bottom: 40px; }
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 40px;
  border-radius: 40px;
  background: linear-gradient(135deg, var(--pri), var(--sec));
  color: #FFFFFF;
  font-size: 20px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 25px var(--glow);
  cursor: pointer;
  border: none;
}

/* Bottom Presentation Bar */
.bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 72px;
  background: rgba(11, 10, 26, 0.85);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--pb);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 100;
  transition: transform 0.3s var(--ease);
}
.progress-bar-container { position: absolute; top: -2px; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.08); }
.progress-bar { height: 100%; width: 0%; background: linear-gradient(90deg, var(--pri), var(--sec)); transition: width 0.3s ease; }
.bar-left, .bar-right { display: flex; align-items: center; gap: 16px; }
.slide-counter { font-size: 14px; font-weight: 600; color: var(--mu); }
.slide-counter span { color: var(--tx); }
.ctl-btn {
  background: rgba(255,255,255,0.06);
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

/* SVG Icons */
svg.lu { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
</style>
</head>
<body>
<div class="deck" id="deck">
  <div class="vp" id="vp">
    <div class="stage" id="stage">
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
      <button class="ctl-btn" id="autoPlayBtn" title="Toggle Autoplay">
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
  dot.addEventListener('click', () => goToSlide(i));
  dotsNav.appendChild(dot);
});

function animateCounters(slideEl) {
  slideEl.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseFloat(el.getAttribute('data-counter'));
    const suffix = el.getAttribute('data-suffix') || '';
    const startTime = performance.now();
    const duration = 1200;
    function update(now) {
      const elapsed = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - elapsed, 3);
      const val = (target * ease);
      el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
      if (elapsed < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

function goToSlide(index) {
  if (index < 0 || index >= totalSlides) return;
  slides[currentIndex].classList.remove('on');
  currentIndex = index;
  slides[currentIndex].classList.add('on');

  // Update UI
  document.getElementById('curNum').textContent = currentIndex + 1;
  document.getElementById('prog').style.width = ((currentIndex + 1) / totalSlides * 100) + '%';
  document.getElementById('prevBtn').disabled = currentIndex === 0;
  document.getElementById('nextBtn').disabled = currentIndex === totalSlides - 1;

  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentIndex);
  });

  animateCounters(slides[currentIndex]);
}

document.getElementById('prevBtn').addEventListener('click', () => goToSlide(currentIndex - 1));
document.getElementById('nextBtn').addEventListener('click', () => goToSlide(currentIndex + 1));

// Keyboard Navigation
window.addEventListener('keydown', (e) => {
  if (['ArrowRight', 'Space', 'PageDown'].includes(e.code)) {
    e.preventDefault();
    goToSlide(currentIndex + 1);
  } else if (['ArrowLeft', 'PageUp'].includes(e.code)) {
    e.preventDefault();
    goToSlide(currentIndex - 1);
  } else if (e.code === 'Home') {
    goToSlide(0);
  } else if (e.code === 'End') {
    goToSlide(totalSlides - 1);
  } else if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen();
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
document.getElementById('fsBtn').addEventListener('click', toggleFullscreen);

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
document.getElementById('autoPlayBtn').addEventListener('click', toggleAutoplay);

// Canva-style click on left / right half of slide canvas
vp.addEventListener('click', (e) => {
  if (e.target.closest('button, a, input, .bar')) return;
  const rect = vp.getBoundingClientRect();
  if (e.clientX - rect.left < rect.width * 0.3) {
    goToSlide(currentIndex - 1);
  } else if (e.clientX - rect.left > rect.width * 0.7) {
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
            ${content.badge ? `<div class="badge">${this.escapeHtml(content.badge)}</div>` : ''}
            <h1 class="slide-h">${this.escapeHtml(content.title)}</h1>
            ${content.subtitle ? `<div class="slide-sub">${this.escapeHtml(content.subtitle)}</div>` : ''}
          </div>
        `;
        break;

      case 'title-content':
        bodyHtml = `
          ${content.badge ? `<div class="badge">${this.escapeHtml(content.badge)}</div>` : ''}
          <h2 class="slide-h">${this.escapeHtml(content.title)}</h2>
          ${content.subtitle ? `<div class="slide-sub">${this.escapeHtml(content.subtitle)}</div>` : ''}
          <div class="card" style="flex: 1;">
            ${content.body ? `<p style="font-size: 22px; line-height: 1.6; margin-bottom: 24px; color: var(--tx2);">${this.escapeHtml(content.body)}</p>` : ''}
            ${
              content.bulletPoints && content.bulletPoints.length
                ? `<ul class="bullet-list">
                    ${content.bulletPoints
                      .map(
                        (b) => `
                      <li class="bullet-item">
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
          ${content.badge ? `<div class="badge">${this.escapeHtml(content.badge)}</div>` : ''}
          <h2 class="slide-h">${this.escapeHtml(content.title)}</h2>
          ${content.subtitle ? `<div class="slide-sub">${this.escapeHtml(content.subtitle)}</div>` : ''}
          <div class="grid-3" style="flex: 1; align-items: stretch;">
            ${(content.features || [])
              .map(
                (f) => `
              <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="width: 52px; height: 52px; border-radius: 14px; background: var(--badge-bg); color: var(--pri); display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <i data-i="${this.escapeHtml(f.icon || 'zap')}"></i>
                  </div>
                  <h3 style="font-size: 26px; font-weight: 700; color: var(--tx); margin-bottom: 12px;">${this.escapeHtml(f.title)}</h3>
                  <p style="font-size: 18px; line-height: 1.5; color: var(--tx2);">${this.escapeHtml(f.description)}</p>
                </div>
                ${f.badge ? `<div style="margin-top: 24px; font-size: 12px; font-weight: 700; color: var(--pri); letter-spacing: 0.1em;">${this.escapeHtml(f.badge)}</div>` : ''}
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
          ${content.badge ? `<div class="badge">${this.escapeHtml(content.badge)}</div>` : ''}
          <h2 class="slide-h">${this.escapeHtml(content.title)}</h2>
          ${content.subtitle ? `<div class="slide-sub">${this.escapeHtml(content.subtitle)}</div>` : ''}
          <div class="grid-3" style="flex: 1; align-items: stretch;">
            ${(content.statistics || [])
              .map(
                (s) => `
              <div class="card" style="display: flex; flex-direction: column; justify-content: center; text-align: center;">
                <div class="stat-val" data-counter="${s.numericValue || parseFloat(s.value) || 0}" data-suffix="${this.escapeHtml(s.suffix || '')}">${this.escapeHtml(s.value)}</div>
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
          ${content.badge ? `<div class="badge">${this.escapeHtml(content.badge)}</div>` : ''}
          <h2 class="slide-h">${this.escapeHtml(content.title)}</h2>
          ${content.subtitle ? `<div class="slide-sub">${this.escapeHtml(content.subtitle)}</div>` : ''}
          <div class="timeline-list" style="flex: 1; align-items: stretch;">
            ${(content.timeline || [])
              .map(
                (t) => `
              <div class="card timeline-card">
                <div class="timeline-phase">${this.escapeHtml(t.phase)}</div>
                <h3 style="font-size: 22px; font-weight: 700; color: var(--tx); margin-bottom: 10px;">${this.escapeHtml(t.title)}</h3>
                <p style="font-size: 16px; color: var(--tx2); line-height: 1.5; margin-bottom: 16px;">${this.escapeHtml(t.description)}</p>
                ${t.dateRange ? `<div style="font-size: 14px; font-weight: 600; color: var(--mu);">${this.escapeHtml(t.dateRange)}</div>` : ''}
              </div>
            `,
              )
              .join('')}
          </div>
        `;
        break;

      case 'comparison':
        bodyHtml = `
          ${content.badge ? `<div class="badge">${this.escapeHtml(content.badge)}</div>` : ''}
          <h2 class="slide-h">${this.escapeHtml(content.title)}</h2>
          ${content.subtitle ? `<div class="slide-sub">${this.escapeHtml(content.subtitle)}</div>` : ''}
          <div class="comp-grid">
            ${
              content.comparison
                ? `
              <div class="card comp-card">
                <div>
                  <div style="font-size: 14px; font-weight: 700; color: var(--mu); margin-bottom: 8px;">${this.escapeHtml(content.comparison.left.tag || 'BEFORE')}</div>
                  <h3 style="font-size: 28px; font-weight: 700; color: var(--tx); margin-bottom: 24px;">${this.escapeHtml(content.comparison.left.title)}</h3>
                  <ul class="bullet-list">
                    ${content.comparison.left.points
                      .map(
                        (p) => `
                      <li class="bullet-item">
                        <span class="bullet-icon" style="background: rgba(239, 68, 68, 0.15); color: #EF4444;"><i data-i="check"></i></span>
                        <span>${this.escapeHtml(p)}</span>
                      </li>
                    `,
                      )
                      .join('')}
                  </ul>
                </div>
              </div>
              <div class="card comp-card highlight">
                <div>
                  <div style="font-size: 14px; font-weight: 700; color: var(--pri); margin-bottom: 8px;">${this.escapeHtml(content.comparison.right.tag || 'AFTER')}</div>
                  <h3 style="font-size: 28px; font-weight: 700; color: var(--tx); margin-bottom: 24px;">${this.escapeHtml(content.comparison.right.title)}</h3>
                  <ul class="bullet-list">
                    ${content.comparison.right.points
                      .map(
                        (p) => `
                      <li class="bullet-item">
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
          ${content.badge ? `<div class="badge">${this.escapeHtml(content.badge)}</div>` : ''}
          <h2 class="slide-h">${this.escapeHtml(content.title)}</h2>
          ${content.subtitle ? `<div class="slide-sub">${this.escapeHtml(content.subtitle)}</div>` : ''}
          <div class="card" style="flex: 1;">
            <ul class="bullet-list" style="gap: 24px;">
              ${(content.takeaways || [])
                .map(
                  (t) => `
                <li class="bullet-item" style="font-size: 24px;">
                  <span class="bullet-icon" style="width: 34px; height: 34px;"><i data-i="check"></i></span>
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
          ${content.badge ? `<div class="badge">${this.escapeHtml(content.badge)}</div>` : ''}
          <h2 class="slide-h">${this.escapeHtml(content.title)}</h2>
          ${content.subtitle ? `<div class="slide-sub">${this.escapeHtml(content.subtitle)}</div>` : ''}
          <div class="grid-2" style="flex: 1; align-items: stretch;">
            <div class="card">
              <p style="font-size: 22px; line-height: 1.6; color: var(--tx2); white-space: pre-line;">${this.escapeHtml(content.leftColumn || '')}</p>
            </div>
            <div class="card">
              <p style="font-size: 22px; line-height: 1.6; color: var(--tx2); white-space: pre-line;">${this.escapeHtml(content.rightColumn || '')}</p>
            </div>
          </div>
        `;
        break;

      case 'quote':
        bodyHtml = `
          ${content.badge ? `<div class="badge">${this.escapeHtml(content.badge)}</div>` : ''}
          <div class="card" style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 60px 80px;">
            <blockquote style="font-size: 38px; line-height: 1.4; font-weight: 500; color: var(--tx); margin-bottom: 32px; font-style: italic;">
              "${this.escapeHtml(content.quote || '')}"
            </blockquote>
            <div>
              <div style="font-size: 24px; font-weight: 700; color: var(--pri);">${this.escapeHtml(content.author || '')}</div>
              <div style="font-size: 18px; color: var(--mu);">${this.escapeHtml(content.authorRole || '')}</div>
            </div>
          </div>
        `;
        break;

      case 'closing':
      default:
        bodyHtml = `
          <div class="closing-layout">
            ${content.badge ? `<div class="badge">${this.escapeHtml(content.badge)}</div>` : ''}
            <h1 class="slide-h">${this.escapeHtml(content.title)}</h1>
            ${content.subtitle ? `<div class="slide-sub">${this.escapeHtml(content.subtitle)}</div>` : ''}
            ${content.ctaText ? `<a class="cta-btn" href="${this.escapeHtml(content.ctaUrl || '#')}">${this.escapeHtml(content.ctaText)} <i data-i="arrow-right"></i></a>` : ''}
          </div>
        `;
        break;
    }

    return `
      <div class="slide ${activeClass}" id="slide-${slide.id}" data-layout="${slide.layout}">
        ${bodyHtml}
      </div>
    `;
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
