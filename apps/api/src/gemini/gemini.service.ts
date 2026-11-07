import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import {
  GeneratePresentationDto,
  PresentationDocument,
  Slide,
  SlideLayout,
  PresentationDocumentSchema,
  SlideSchema,
} from '@ai-slide-studio/shared';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private aiClient: GoogleGenAI | null = null;
  private modelName: string;
  private apiKey: string;

  constructor(private readonly configService?: ConfigService) {
    this.apiKey = this.configService?.get<string>('geminiApiKey') || process.env.GEMINI_API_KEY || '';
    this.modelName = this.configService?.get<string>('geminiModel') || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (this.apiKey && this.apiKey.trim().length > 0 && this.apiKey !== 'YOUR_GEMINI_API_KEY') {
      try {
        this.aiClient = new GoogleGenAI({ apiKey: this.apiKey });
        this.logger.log(`Google Gen AI SDK initialized with model: ${this.modelName}`);
      } catch (err) {
        this.logger.warn(`Failed to initialize Google Gen AI SDK: ${err}`);
      }
    } else {
      this.logger.log('Gemini API key not configured or set to placeholder. Operating in deterministic offline generator mode.');
    }
  }

  isLiveApiConfigured(): boolean {
    return this.aiClient !== null;
  }

  getModelName(): string {
    return this.modelName;
  }

  getServerConfig() {
    return {
      hasApiKey: Boolean(this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY'),
      model: this.modelName,
      isLive: this.aiClient !== null,
    };
  }

  updateServerConfig(newApiKey?: string, newModel?: string) {
    if (newApiKey !== undefined && newApiKey.trim().length > 0) {
      this.apiKey = newApiKey.trim();
      try {
        this.aiClient = new GoogleGenAI({ apiKey: this.apiKey });
        this.logger.log(`Server default Gemini API key updated. Live API active with model: ${this.modelName}`);
      } catch (err) {
        this.logger.warn(`Failed to initialize with new API key: ${err}`);
      }
    }
    if (newModel) {
      this.modelName = newModel;
      this.logger.log(`Server default Gemini model updated to: ${newModel}`);
    }
    return this.getServerConfig();
  }

  async testApiKey(keyToTest?: string): Promise<{ success: boolean; message: string; model: string }> {
    const key = (keyToTest && keyToTest.trim().length > 0) ? keyToTest.trim() : this.apiKey;
    if (!key || key === 'YOUR_GEMINI_API_KEY') {
      return {
        success: false,
        message: 'No API key provided or configured on server.',
        model: this.modelName,
      };
    }
    try {
      const client = new GoogleGenAI({ apiKey: key });
      const res = await client.models.generateContent({
        model: this.modelName,
        contents: 'Test connection: reply with OK.',
      });
      return {
        success: true,
        message: `Successfully connected to Google Gemini API (${this.modelName}). Response: ${res.text?.slice(0, 40) || 'OK'}`,
        model: this.modelName,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Connection failed or invalid API key.',
        model: this.modelName,
      };
    }
  }

  /**
   * Generates a complete presentation with structured JSON output
   */
  async generatePresentation(dto: GeneratePresentationDto): Promise<PresentationDocument> {
    const startTime = Date.now();
    this.logger.log(`Generating presentation for topic: "${dto.prompt}" (${dto.slideCount} slides, theme: ${dto.theme})`);

    // Check if user provided their own custom API key (BYOK)
    let clientToUse = this.aiClient;
    const customKey = dto.apiKey?.trim();

    if (customKey && customKey !== 'YOUR_GEMINI_API_KEY') {
      try {
        this.logger.log('Using user-provided custom Gemini API key for this request.');
        clientToUse = new GoogleGenAI({ apiKey: customKey });
      } catch (err) {
        this.logger.warn(`Failed to initialize with custom key, falling back to server default: ${err}`);
      }
    } else {
      this.logger.log('Using server admin default Gemini API configuration.');
    }

    if (clientToUse) {
      try {
        return await this.generateWithLiveGemini(dto, clientToUse);
      } catch (error) {
        this.logger.error(`Live Gemini generation failed or rate limited, falling back to deterministic generation engine: ${error}`);
        return this.generateDeterministicPresentation(dto);
      }
    } else {
      // Deterministic generation
      return this.generateDeterministicPresentation(dto);
    }
  }

  /**
   * Regenerates a single slide with optional custom instructions
   */
  async regenerateSlide(slideNumber: number, existingSlide: Slide, prompt?: string, targetLayout?: SlideLayout): Promise<Slide> {
    const layout = targetLayout || existingSlide.layout;
    const topic = prompt || existingSlide.content.title;

    if (this.aiClient) {
      try {
        const systemPrompt = `You are an expert presentation designer. Generate a single slide in JSON format matching the schema for layout: "${layout}". Topic: "${topic}".
STRICT REQUIREMENT: Output MUST be valid JSON only, without any markdown backticks or explanation. NO EMOJIS!`;

        const response = await this.aiClient.models.generateContent({
          model: this.modelName,
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const rawJson = response.text || '';
        const parsed = JSON.parse(this.cleanJsonString(rawJson));
        return SlideSchema.parse({
          ...existingSlide,
          layout,
          content: parsed.content || parsed,
        });
      } catch (err) {
        this.logger.warn(`Live slide regeneration failed, using deterministic slide engine: ${err}`);
      }
    }

    return this.buildDeterministicSlide(slideNumber, layout, topic);
  }

  /**
   * Rewrites text based on instruction (shorten, expand, professional, bullet-points, punchy)
   */
  async rewriteText(text: string, instruction: 'shorten' | 'expand' | 'more-professional' | 'bullet-points' | 'punchy'): Promise<string> {
    if (this.aiClient) {
      try {
        const prompt = `Rewrite the following presentation text according to this instruction: "${instruction}".
Original text: "${text}"
Requirements: Keep it concise, impactful, professional. NO EMOJIS! Output only the rewritten text without commentary.`;

        const response = await this.aiClient.models.generateContent({
          model: this.modelName,
          contents: prompt,
        });

        const rewritten = response.text?.trim();
        if (rewritten && rewritten.length > 0) {
          return rewritten;
        }
      } catch (err) {
        this.logger.warn(`Live text rewrite failed: ${err}`);
      }
    }

    // Deterministic rewrite
    switch (instruction) {
      case 'shorten':
        return text.split('.').slice(0, 2).join('. ').trim() + (text.includes('.') ? '.' : '');
      case 'expand':
        return `${text} This delivers measurable strategic advantage, streamlining operations and accelerating overall performance.`;
      case 'more-professional':
        return `Strategic initiative: ${text.replace(/really|very|good|stuff/gi, 'optimal')}`;
      case 'bullet-points':
        return text.split(/[,.]+/).filter((s) => s.trim().length > 3).map((s) => `• ${s.trim()}`).join('\n');
      case 'punchy':
        return `${text.split(' ')[0].toUpperCase()}: ${text}`;
      default:
        return text;
    }
  }

  private async generateWithLiveGemini(dto: GeneratePresentationDto, client: GoogleGenAI = this.aiClient!): Promise<PresentationDocument> {
    const prompt = this.buildPrompt(dto);

    // Exponential retry with backoff for rate limits
    let lastError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        this.logger.log(`Calling Gemini API (attempt ${attempt}/3)...`);
        const response = await client.models.generateContent({
          model: this.modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const rawText = response.text || '';
        const cleaned = this.cleanJsonString(rawText);
        const parsed = JSON.parse(cleaned);

        // Validate and normalize
        return PresentationDocumentSchema.parse({
          id: `pres-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: parsed.title || dto.prompt.slice(0, 50),
          description: parsed.description || `Generated presentation on ${dto.prompt}`,
          theme: dto.theme,
          aspectRatio: dto.aspectRatio,
          slides: parsed.slides.map((s: any, idx: number) => ({
            ...s,
            id: s.id || `slide-${idx + 1}`,
            slideNumber: idx + 1,
            animation: s.animation || {
              preset: this.selectAnimationForLayout(s.layout),
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
            theme: dto.theme,
            aspectRatio: dto.aspectRatio,
            animationStyle: dto.animationStyle,
            visualAssetPreference: dto.visualAssetPreference,
            generatedAt: new Date().toISOString(),
            version: '1.0.0',
          },
        });
      } catch (err: any) {
        lastError = err;
        this.logger.warn(`Gemini attempt ${attempt} failed: ${err.message || err}`);
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private buildPrompt(dto: GeneratePresentationDto): string {
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

  private cleanJsonString(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return clean.trim();
  }

  private selectAnimationForLayout(layout?: SlideLayout): string {
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

  /**
   * Deterministic presentation generator for offline testing or instant fallback
   */
  generateDeterministicPresentation(dto: GeneratePresentationDto): PresentationDocument {
    const title = dto.prompt.length > 50 ? `${dto.prompt.slice(0, 47)}...` : dto.prompt;
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

      slides.push(this.buildDeterministicSlide(i, layout, dto.prompt));
    }

    return PresentationDocumentSchema.parse({
      id: `pres-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      description: `Comprehensive strategy and execution deck for ${dto.prompt}`,
      theme: dto.theme,
      aspectRatio: dto.aspectRatio,
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

  private buildDeterministicSlide(slideNumber: number, layout: SlideLayout, topic: string): Slide {
    const id = `slide-${slideNumber}`;
    const animationPreset = this.selectAnimationForLayout(layout);

    switch (layout) {
      case 'cover':
        return {
          id,
          slideNumber,
          layout: 'cover',
          content: {
            title: topic,
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
}
