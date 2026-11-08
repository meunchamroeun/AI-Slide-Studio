import { GoogleGenAI } from '@google/genai';
import {
  GeneratePresentationDto,
  PresentationDocument,
  Slide,
  SlideLayout,
  PresentationDocumentSchema,
  SlideSchema,
} from '@ai-slide-studio/shared';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const API_KEY = process.env.GEMINI_API_KEY || '';

function cleanJsonString(raw: string): string {
  let clean = raw.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return clean.trim();
}

function extractCleanTitle(topic: string, attachedFileName?: string): string {
  if (attachedFileName) {
    return attachedFileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim();
  }
  if (!topic) return 'Executive Overview';
  const firstLine = topic.split('\n')[0].trim();
  const cleaned = firstLine.replace(/^(create|generate|make|build|presentation on|slides about)\s+/i, '').trim();
  if (cleaned.length > 60) {
    return cleaned.slice(0, 57) + '...';
  }
  return cleaned || 'Executive Overview';
}

function sanitizeSlideContent(content: any): any {
  if (!content || typeof content !== 'object') {
    return { title: 'Overview' };
  }

  const c = { ...content };

  if (!c.title || typeof c.title !== 'string') {
    c.title = typeof c.title === 'number' ? String(c.title) : 'Overview';
  }
  if (c.title.length > 180) {
    c.title = c.title.slice(0, 177) + '...';
  }

  if (c.subtitle && typeof c.subtitle === 'string' && c.subtitle.length > 250) {
    c.subtitle = c.subtitle.slice(0, 247) + '...';
  }

  if (c.badge && typeof c.badge === 'string' && c.badge.length > 60) {
    c.badge = c.badge.slice(0, 57) + '...';
  }

  if (Array.isArray(c.takeaways)) {
    c.takeaways = c.takeaways
      .map((item: any) => {
        if (typeof item === 'string') return item.slice(0, 300);
        if (item && typeof item === 'object') {
          return (item.point || item.title || item.text || item.takeaway || item.description || JSON.stringify(item)).slice(0, 300);
        }
        return String(item || '').slice(0, 300);
      })
      .filter((t: string) => t.length > 0);
  }

  if (Array.isArray(c.bulletPoints)) {
    c.bulletPoints = c.bulletPoints
      .map((item: any) => {
        if (typeof item === 'string') return item.slice(0, 500);
        if (item && typeof item === 'object') {
          return (item.point || item.title || item.text || item.bullet || item.description || JSON.stringify(item)).slice(0, 500);
        }
        return String(item || '').slice(0, 500);
      })
      .filter((b: string) => b.length > 0);
  }

  if (c.comparison && typeof c.comparison === 'object') {
    if (c.comparison.left && Array.isArray(c.comparison.left.points)) {
      c.comparison.left.points = c.comparison.left.points.map((p: any) =>
        typeof p === 'string' ? p : p.point || p.title || p.text || String(p)
      );
    }
    if (c.comparison.right && Array.isArray(c.comparison.right.points)) {
      c.comparison.right.points = c.comparison.right.points.map((p: any) =>
        typeof p === 'string' ? p : p.point || p.title || p.text || String(p)
      );
    }
  }

  if (Array.isArray(c.statistics)) {
    c.statistics = c.statistics.map((s: any, i: number) => ({
      id: s.id || `stat-${i + 1}`,
      value: String(s.value ?? s.number ?? '0'),
      numericValue: typeof s.numericValue === 'number' ? s.numericValue : undefined,
      suffix: s.suffix ? String(s.suffix) : undefined,
      label: String(s.label || s.title || s.name || 'Metric'),
      subtext: s.subtext ? String(s.subtext) : undefined,
      trend: ['up', 'down', 'neutral'].includes(s.trend) ? s.trend : undefined,
      icon: s.icon ? String(s.icon) : 'activity',
    }));
  }

  if (Array.isArray(c.features)) {
    c.features = c.features.map((f: any, i: number) => ({
      id: f.id || `feat-${i + 1}`,
      title: String(f.title || f.name || `Feature ${i + 1}`),
      description: String(f.description || f.details || f.text || ''),
      icon: f.icon ? String(f.icon) : 'zap',
      badge: f.badge ? String(f.badge) : undefined,
    }));
  }

  if (Array.isArray(c.timeline)) {
    c.timeline = c.timeline.map((t: any, i: number) => ({
      id: t.id || `time-${i + 1}`,
      phase: String(t.phase || `Phase ${i + 1}`),
      title: String(t.title || `Milestone ${i + 1}`),
      description: String(t.description || t.details || ''),
      dateRange: t.dateRange ? String(t.dateRange) : undefined,
      status: ['completed', 'in-progress', 'upcoming'].includes(t.status) ? t.status : undefined,
    }));
  }

  return c;
}

function selectAnimationForLayout(layout?: SlideLayout): string {
  switch (layout) {
    case 'cover':
      return 'zoom-in';
    case 'statistics':
    case 'metric-highlight':
      return 'reveal';
    case 'timeline':
      return 'slide-in-right';
    case 'comparison':
      return 'slide-in-up';
    case 'feature-grid':
      return 'stagger-text';
    default:
      return 'fade-in';
  }
}

export function buildDeterministicSlide(slideNumber: number, layout: SlideLayout, topic: string): Slide {
  const id = `slide-${slideNumber}`;

  switch (layout) {
    case 'cover':
      return {
        id,
        slideNumber,
        layout: 'cover',
        content: {
          title: extractCleanTitle(topic),
          subtitle: 'Strategic Evolution, Practical Applications, and Future Architecture',
          badge: 'STRATEGIC MASTERCLASS 2026',
        },
        notes: 'Welcome the audience. Introduce the core premise and overarching narrative of this presentation.',
        animation: { preset: 'zoom-in', duration: 0.9, delay: 0.1, easing: 'power2.out', direction: 'none' },
        transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
      };

    case 'title-content':
      return {
        id,
        slideNumber,
        layout: 'title-content',
        content: {
          title: 'Current Landscape & Core Challenges',
          subtitle: 'Understanding the friction points in conventional workflows',
          badge: 'EXECUTIVE OVERVIEW',
          body: 'Modern enterprises face compounding complexity when scaling digital capabilities. Disconnected systems and manual interventions create operational drag that limits agility and impacts velocity.',
          bulletPoints: [
            'Data silos limit cross-functional visibility and timely decision-making.',
            'Legacy architectures lack native automation and intelligent orchestration.',
            'Resource constraints demand higher leverage through modern AI capabilities.',
            'High infrastructure overhead prevents rapid iteration and deployment.',
          ],
        },
        notes: 'Highlight the friction points that modern organizations experience before modernizing.',
        animation: { preset: 'fade-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
        transition: { type: 'slide', duration: 0.6, easing: 'power2.out' },
      };

    case 'feature-grid':
      return {
        id,
        slideNumber,
        layout: 'feature-grid',
        content: {
          title: 'Core Architectural Pillars',
          subtitle: 'Foundational components designed for high performance and scale',
          badge: 'SYSTEM ARCHITECTURE',
          features: [
            {
              id: 'f-1',
              title: 'Intelligent Orchestration',
              description: 'Autonomous decision pipelines that adapt in real time to shifting business variables.',
              icon: 'cpu',
              badge: 'PILLAR 1',
            },
            {
              id: 'f-2',
              title: 'High-Resiliency Data Layer',
              description: 'Distributed persistence guaranteeing continuous integrity and sub-second retrieval.',
              icon: 'database',
              badge: 'PILLAR 2',
            },
            {
              id: 'f-3',
              title: 'Adaptive Interface Engine',
              description: 'Dynamic visual feedback with GSAP-driven hardware-accelerated animations.',
              icon: 'layers',
              badge: 'PILLAR 3',
            },
          ],
        },
        notes: 'Walk through each architectural pillar, emphasizing how they integrate into a cohesive whole.',
        animation: { preset: 'stagger-text', duration: 0.85, delay: 0, easing: 'power2.out', direction: 'up' },
        transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
      };

    case 'statistics':
      return {
        id,
        slideNumber,
        layout: 'statistics',
        content: {
          title: 'Measurable Impact & Key Results',
          subtitle: 'Quantifiable gains observed across deployment benchmarks',
          badge: 'PERFORMANCE METRICS',
          statistics: [
            {
              id: 'stat-1',
              value: '4.8x',
              numericValue: 4.8,
              suffix: 'x',
              label: 'Velocity Increase',
              subtext: 'Generation to publication turnaround',
              trend: 'up',
              icon: 'zap',
            },
            {
              id: 'stat-2',
              value: '68%',
              numericValue: 68,
              suffix: '%',
              label: 'Cost Reduction',
              subtext: 'Operational resource allocation',
              trend: 'down',
              icon: 'activity',
            },
            {
              id: 'stat-3',
              value: '99.9%',
              numericValue: 99.9,
              suffix: '%',
              label: 'Reliability Rate',
              subtext: 'High-availability uptime guarantee',
              trend: 'up',
              icon: 'shield',
            },
          ],
        },
        notes: 'Focus on the concrete numbers and explain the methodology behind each metric calculation.',
        animation: { preset: 'reveal', duration: 0.8, delay: 0.1, easing: 'power3.out', direction: 'none' },
        transition: { type: 'zoom', duration: 0.6, easing: 'power2.out' },
      };

    case 'timeline':
      return {
        id,
        slideNumber,
        layout: 'timeline',
        content: {
          title: 'Implementation Roadmap',
          subtitle: 'Structured progression from discovery to enterprise deployment',
          badge: 'EXECUTION PLAN',
          timeline: [
            {
              id: 't-1',
              phase: 'PHASE 01',
              title: 'Discovery & Schema Mapping',
              description: 'Align business requirements, data structures, and animation primitives.',
              dateRange: 'Month 1 - 2',
              status: 'completed',
            },
            {
              id: 't-2',
              phase: 'PHASE 02',
              title: 'Engine Integration & Prototyping',
              description: 'Deploy Gemini intelligence pipeline, persistence models, and editor panels.',
              dateRange: 'Month 3 - 5',
              status: 'in-progress',
            },
            {
              id: 't-3',
              phase: 'PHASE 03',
              title: 'Validation & End-to-End Testing',
              description: 'Rigorous automated testing, browser compatibility, and HTML export audits.',
              dateRange: 'Month 6 - 7',
              status: 'upcoming',
            },
            {
              id: 't-4',
              phase: 'PHASE 04',
              title: 'Global Rollout & Scaling',
              description: 'Production release, team onboarding, and performance telemetry tracking.',
              dateRange: 'Month 8 - 10',
              status: 'upcoming',
            },
          ],
        },
        notes: 'Outline the timeline stages. Highlight that Phase 1 is completed and Phase 2 is currently underway.',
        animation: { preset: 'slide-in-right', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'right' },
        transition: { type: 'slide', duration: 0.6, easing: 'power2.out' },
      };

    case 'comparison':
      return {
        id,
        slideNumber,
        layout: 'comparison',
        content: {
          title: 'Traditional Workflow vs. AI Studio',
          subtitle: 'Clear operational contrast between legacy and modern approaches',
          badge: 'STRATEGIC COMPARISON',
          comparison: {
            left: {
              title: 'Traditional Workflow',
              subtitle: 'Manual, fragmented, slow',
              tag: 'LEGACY',
              isHighlighted: false,
              points: [
                'Hours spent manually formatting slides and layouts',
                'Inconsistent typography, alignment, and styling',
                'Static presentation files that cannot animate fluidly',
                'High friction for sharing and browser-based playback',
              ],
            },
            right: {
              title: 'AI Slide Studio',
              subtitle: 'Automated, unified, responsive',
              tag: 'MODERN',
              isHighlighted: true,
              badge: 'RECOMMENDED',
              points: [
                'Instant structured generation from a single prompt',
                'Harmonized design system with curated dark themes',
                'Hardware-accelerated GSAP animations built-in',
                'Single standalone HTML export with zero server dependencies',
              ],
            },
          },
        },
        notes: 'Draw a sharp contrast between how work was previously done and how our modern platform transforms it.',
        animation: { preset: 'slide-in-up', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'up' },
        transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
      };

    case 'key-takeaways':
      return {
        id,
        slideNumber,
        layout: 'key-takeaways',
        content: {
          title: 'Strategic Takeaways',
          subtitle: 'Essential principles for immediate execution',
          badge: 'KEY LESSONS',
          takeaways: [
            'AI generation is most powerful when constrained to structured, typed schemas rather than arbitrary code.',
            'Predefined animation registries eliminate fragile runtime scripts while preserving cinematic motion.',
            'Standalone HTML export gives users true ownership of their decks without vendor lock-in.',
            'Strict design discipline (no emojis, premium dark palettes) produces boardroom-ready results.',
          ],
        },
        notes: 'Reinforce the core principles before transitioning into the closing slide.',
        animation: { preset: 'reveal', duration: 0.8, delay: 0.1, easing: 'power2.out', direction: 'none' },
        transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
      };

    case 'metric-highlight':
      return {
        id,
        slideNumber,
        layout: 'metric-highlight',
        content: {
          title: 'Operational Excellence Benchmark',
          subtitle: 'Demonstrated throughput and efficiency gains',
          badge: 'SPOTLIGHT',
          statistics: [
            {
              id: 'm-1',
              value: '10x',
              numericValue: 10,
              suffix: 'x',
              label: 'Production Speed',
              subtext: 'Idea to final interactive deck',
              trend: 'up',
              icon: 'rocket',
            },
            {
              id: 'm-2',
              value: '100%',
              numericValue: 100,
              suffix: '%',
              label: 'Zero Server Lock-in',
              subtext: 'Runs anywhere as standalone HTML',
              trend: 'up',
              icon: 'globe',
            },
          ],
        },
        notes: 'Spotlight the 10x multiplier effect on team productivity.',
        animation: { preset: 'zoom-in', duration: 0.85, delay: 0, easing: 'power2.out', direction: 'none' },
        transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
      };

    case 'two-columns':
      return {
        id,
        slideNumber,
        layout: 'two-columns',
        content: {
          title: 'Dual Perspectives on Scale',
          subtitle: 'Balancing algorithmic speed with human editorial control',
          badge: 'DUAL FOCUS',
          leftColumn: 'Algorithmic Speed:\nAutomated generation produces complete presentation outlines, layouts, and data points in seconds. This eliminates the blank canvas problem and establishes an immediate baseline.',
          rightColumn: 'Human Creative Control:\nFull three-panel editor allows real-time manipulation of typography, positioning, animation timing, and speaker notes. The human remains firmly in command of the final voice.',
        },
        notes: 'Explain how machine speed and human refinement complement each other.',
        animation: { preset: 'fade-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
        transition: { type: 'slide', duration: 0.6, easing: 'power2.out' },
      };

    case 'image-text':
      return {
        id,
        slideNumber,
        layout: 'image-text',
        content: {
          title: 'Visual Hierarchy in Action',
          subtitle: 'Architected balance between typography and visual structure',
          badge: 'DESIGN SYSTEM',
          body: 'Every slide is built on a responsive 1920x1080 stage that scales smoothly to any viewport. Visual accents, borders, and typography maintain strict mathematical proportions.',
          imageCaption: 'Responsive slide rendering canvas with hardware-accelerated GSAP timelines.',
          bulletPoints: [
            'Automatic stage scale fitting to 16:9 or 4:3 viewports.',
            'Strict Lucide React icon integration with zero emoji pollution.',
            'Deep contrast dark palette engineered for clarity and visual comfort.',
          ],
        },
        notes: 'Emphasize the design engineering behind the slide presentation canvas.',
        animation: { preset: 'slide-in-left', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'left' },
        transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
      };

    case 'quote':
      return {
        id,
        slideNumber,
        layout: 'quote',
        content: {
          title: 'Visionary Perspective',
          badge: 'INSPIRATION',
          quote: 'Simplicity and speed are the ultimate competitive advantages in software engineering. When complexity is mastered behind clean interfaces, extraordinary results follow.',
          author: 'Chief Technology Architect',
          authorRole: 'Enterprise Innovation & Systems Design',
        },
        notes: 'Deliver this quote with deliberate pacing and conviction.',
        animation: { preset: 'blur-in', duration: 0.9, delay: 0.1, easing: 'power2.out', direction: 'none' },
        transition: { type: 'zoom', duration: 0.6, easing: 'power2.out' },
      };

    case 'closing':
    default:
      return {
        id,
        slideNumber,
        layout: 'closing',
        content: {
          title: 'Thank You',
          subtitle: 'Questions, Discussion, and Immediate Next Steps',
          badge: 'CONCLUSION',
          ctaText: 'Start Presenting Now',
          ctaUrl: '#',
        },
        notes: 'Conclude the presentation. Thank the audience for their time and open the floor for questions and discussion.',
        animation: { preset: 'fade-in', duration: 0.9, delay: 0, easing: 'power2.out', direction: 'none' },
        transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
      };
  }
}

export function generateDeterministicPresentation(dto: GeneratePresentationDto): PresentationDocument {
  const cleanTitle = extractCleanTitle(dto.prompt, dto.attachedFileName);
  const title = cleanTitle.length > 60 ? `${cleanTitle.slice(0, 57)}...` : cleanTitle;
  const slides: Slide[] = [];

  const layoutOrder: SlideLayout[] = [
    'cover',
    'title-content',
    'feature-grid',
    'statistics',
    'timeline',
    'comparison',
    'key-takeaways',
    'metric-highlight',
    'two-columns',
    'image-text',
    'quote',
    'closing',
  ];

  for (let i = 1; i <= dto.slideCount; i++) {
    let layout: SlideLayout;
    if (i === 1) layout = 'cover';
    else if (i === dto.slideCount) layout = 'closing';
    else {
      layout = layoutOrder[(i - 1) % layoutOrder.length];
    }

    slides.push(buildDeterministicSlide(i, layout, cleanTitle));
  }

  return PresentationDocumentSchema.parse({
    id: `pres-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    description: `Comprehensive presentation on ${cleanTitle}`,
    theme: dto.theme || 'modern-dark',
    aspectRatio: dto.aspectRatio || '16:9',
    slides,
    metadata: {
      topic: dto.prompt,
      language: dto.language,
      audience: dto.audience,
      tone: dto.tone,
      style: dto.style,
      theme: dto.theme,
      aspectRatio: dto.aspectRatio,
      animationStyle: dto.animationStyle,
      visualAssetPreference: dto.visualAssetPreference,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    },
  });
}

function buildPrompt(dto: GeneratePresentationDto): string {
  return `You are a world-class executive presentation designer and AI content architect.
Generate a structured JSON document for a high-impact, professional ${dto.slideCount}-slide presentation.

TOPIC / PROMPT: "${dto.prompt}"
NUMBER OF SLIDES: ${dto.slideCount}
LANGUAGE: ${dto.language}
AUDIENCE: ${dto.audience}
TONE: ${dto.tone}
STYLE: ${dto.style}
THEME: ${dto.theme}
ASPECT RATIO: ${dto.aspectRatio}
ANIMATION STYLE: ${dto.animationStyle}

STRICT DESIGN RULES:
1. NO EMOJIS! Never include emoji characters anywhere in titles, descriptions, bullets, or notes.
2. Provide varied, well-structured slide layouts. Use an intelligent progression:
   - Slide 1: 'cover' (Title, subtitle, badge)
   - Slide 2: 'title-content' or 'key-takeaways' (Context / Problem statement)
   - Slide 3: 'feature-grid' or 'two-columns' (Core pillars or architecture)
   - Slide 4: 'statistics' (3-4 impactful quantitative metrics)
   - Slide 5: 'timeline' (3-4 strategic phases or milestone roadmap)
   - Slide 6: 'comparison' (Before vs After, or Traditional vs Modern)
   - Slide 7: 'metric-highlight' or 'image-text' (Deep dive or spotlight)
   - Slide 8 (or final): 'closing' (Summary, call-to-action, thank you)
3. For icons, use Lucide icon names like: 'zap', 'activity', 'layers', 'shield', 'target', 'cpu', 'network', 'gauge', 'server', 'database', 'check', 'rocket'.
4. Ensure every slide has informative speaker notes.
5. Return ONLY valid JSON adhering to this schema:

{
  "title": "Presentation Title",
  "description": "Short summary",
  "slides": [
    {
      "id": "slide-1",
      "slideNumber": 1,
      "layout": "cover",
      "content": {
        "title": "Primary Title",
        "subtitle": "Clear, compelling subtitle",
        "badge": "INDUSTRY BRIEFING 2026"
      },
      "notes": "Speaker notes for this slide..."
    }
  ]
}`;
}

export async function generatePresentationDocument(dto: GeneratePresentationDto): Promise<PresentationDocument> {
  const apiKey = (dto.apiKey?.trim() && dto.apiKey !== 'YOUR_GEMINI_API_KEY') ? dto.apiKey.trim() : API_KEY;

  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
    try {
      const client = new GoogleGenAI({ apiKey });
      const prompt = buildPrompt(dto);
      const modelName = DEFAULT_MODEL;

      let response;
      try {
        response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
      } catch (err: any) {
        console.warn(`Primary model ${modelName} failed, trying gemini-3.5-flash-lite: ${err.message}`);
        response = await client.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
      }

      const rawText = response.text || '';
      const cleaned = cleanJsonString(rawText);
      const parsed = JSON.parse(cleaned);

      const validThemes = ['modern-dark', 'minimal-light', 'corporate-blue', 'editorial', 'technology-gradient', 'elegant-monochrome'];
      const safeTheme = validThemes.includes(dto.theme) ? dto.theme : 'modern-dark';

      return PresentationDocumentSchema.parse({
        id: `pres-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: parsed.title || dto.prompt.slice(0, 50),
        description: parsed.description || `Generated presentation on ${dto.prompt}`,
        theme: safeTheme,
        aspectRatio: dto.aspectRatio || '16:9',
        slides: parsed.slides.map((s: any, idx: number) => ({
          ...s,
          id: s.id || `slide-${idx + 1}`,
          slideNumber: idx + 1,
          content: sanitizeSlideContent(s.content),
          animation: s.animation || {
            preset: selectAnimationForLayout(s.layout),
            duration: 0.8,
            delay: 0,
            easing: 'power2.out',
            direction: 'none',
          },
          transition: s.transition || {
            type: 'fade',
            duration: 0.6,
            easing: 'power2.out',
          },
        })),
        metadata: {
          topic: dto.prompt,
          language: dto.language,
          audience: dto.audience,
          tone: dto.tone,
          style: dto.style,
          theme: safeTheme,
          aspectRatio: dto.aspectRatio || '16:9',
          animationStyle: dto.animationStyle,
          visualAssetPreference: dto.visualAssetPreference,
          generatedAt: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    } catch (err: any) {
      console.error(`Live Gemini generation failed, falling back to deterministic engine: ${err.message || err}`);
    }
  }

  return generateDeterministicPresentation(dto);
}

export async function regenerateSlideWithGemini(
  existingSlide: Slide,
  userPrompt: string,
  targetLayout?: SlideLayout,
  apiKeyParam?: string,
): Promise<Slide> {
  const apiKey = (apiKeyParam?.trim() && apiKeyParam !== 'YOUR_GEMINI_API_KEY') ? apiKeyParam.trim() : API_KEY;
  const layout = targetLayout || existingSlide.layout;

  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
    try {
      const client = new GoogleGenAI({ apiKey });
      const prompt = `You are an elite executive presentation designer and copywriter.
Update the following presentation slide according to the user's specific prompt instructions.

USER PROMPT / INSTRUCTIONS:
"${userPrompt}"

CURRENT SLIDE DATA:
${JSON.stringify(existingSlide, null, 2)}

DESIRED SLIDE LAYOUT:
"${layout}"

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON adhering strictly to the Slide format.
2. ZERO EMOJIS anywhere in the text.
3. If layout is 'feature-grid', ensure 3 or 4 feature cards with id, title, description, and icon (one of: zap, cpu, shield, database, activity, layers, lock, check, spark, bar-chart, users, globe, server, workflow, terminal).
4. If layout is 'timeline', ensure 3 to 4 milestones with phase, title, description, dateRange, status ('completed'|'in-progress'|'pending').
5. If layout is 'comparison', ensure left and right columns with title, subtitle, points array, isHighlighted boolean.
6. If layout is 'statistics', ensure 2 to 4 statistics with value, label, trend ('up'|'down'|'neutral').
7. Keep professional, punchy, C-level presentation tone.
8. Support English or Khmer depending on the prompt and current slide language.

JSON SCHEMA:
{
  "id": "${existingSlide.id}",
  "slideNumber": ${existingSlide.slideNumber},
  "layout": "${layout}",
  "content": {
    "badge": "OPTIONAL CATEGORY EYEBROW",
    "title": "Slide Title",
    "subtitle": "Subtitle or lead description",
    "bulletPoints": ["Point 1", "Point 2"],
    "features": [{"id": "f1", "title": "Card Title", "description": "Card description", "icon": "shield"}],
    "timeline": [{"id": "t1", "phase": "Phase 1", "title": "Milestone", "description": "Details", "dateRange": "Q1", "status": "completed"}],
    "comparison": {
      "left": {"title": "Legacy", "subtitle": "Manual", "points": ["Point A"], "isHighlighted": false},
      "right": {"title": "Modern", "subtitle": "Automated", "points": ["Point B"], "isHighlighted": true}
    },
    "statistics": [{"id": "s1", "value": "99.9%", "label": "Reliability", "trend": "up"}],
    "body": "Optional body text",
    "takeaways": ["Key takeaway"]
  },
  "notes": "Speaker notes"
}`;

      let response;
      try {
        response = await client.models.generateContent({
          model: DEFAULT_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
      } catch (err: any) {
        response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
      }

      const raw = response.text || '';
      const cleaned = cleanJsonString(raw);
      const parsed = JSON.parse(cleaned);

      return {
        id: existingSlide.id,
        slideNumber: existingSlide.slideNumber,
        layout,
        content: sanitizeSlideContent(parsed.content || parsed),
        notes: parsed.notes || existingSlide.notes || '',
        animation: existingSlide.animation || {
          preset: selectAnimationForLayout(layout),
          duration: 0.8,
          delay: 0,
          easing: 'power2.out',
          direction: 'none',
        },
        transition: existingSlide.transition || {
          type: 'fade',
          duration: 0.6,
          easing: 'power2.out',
        },
      };
    } catch (err: any) {
      console.warn('Gemini slide regeneration failed, falling back to deterministic:', err.message);
    }
  }

  // Fallback to deterministic slide generator
  const fallback = buildDeterministicSlide(
    existingSlide.slideNumber,
    layout,
    userPrompt || existingSlide.content?.title || 'Slide'
  );
  fallback.id = existingSlide.id;
  if (existingSlide.notes) {
    fallback.notes = existingSlide.notes;
  }
  return fallback;
}
