import { z } from 'zod';

export const SlideLayoutEnum = z.enum([
  'cover',
  'title-content',
  'two-columns',
  'image-text',
  'quote',
  'statistics',
  'timeline',
  'comparison',
  'key-takeaways',
  'closing',
  'feature-grid',
  'metric-highlight',
]);

export const ThemeNameEnum = z.enum([
  'modern-dark',
  'minimal-light',
  'corporate-blue',
  'editorial',
  'technology-gradient',
  'elegant-monochrome',
]);

export const AspectRatioEnum = z.enum(['16:9', '4:3']);

export const AnimationPresetEnum = z.enum([
  'fade-in',
  'fade-out',
  'slide-in-left',
  'slide-in-right',
  'slide-in-up',
  'slide-in-down',
  'zoom-in',
  'zoom-out',
  'rotate',
  'blur-in',
  'typewriter',
  'stagger-text',
  'reveal',
  'parallax',
]);

export const TransitionTypeEnum = z.enum(['fade', 'slide', 'zoom', 'none']);

export const EasingEnum = z.enum([
  'power1.out',
  'power2.out',
  'power3.out',
  'power4.out',
  'back.out(1.7)',
  'elastic.out(1, 0.3)',
  'sine.inOut',
  'linear',
]);

export const ElementAnimationSchema = z.object({
  preset: AnimationPresetEnum.default('fade-in'),
  duration: z.number().min(0.1).max(5).default(0.8),
  delay: z.number().min(0).max(10).default(0),
  easing: EasingEnum.default('power2.out'),
  direction: z.enum(['up', 'down', 'left', 'right', 'none']).default('none'),
});

export const SlideTransitionSchema = z.object({
  type: TransitionTypeEnum.default('fade'),
  duration: z.number().min(0.2).max(3).default(0.6),
  easing: EasingEnum.default('power2.out'),
});

export const ElementStyleSchema = z.object({
  fontFamily: z.string().default('Inter'),
  fontSize: z.number().min(8).max(140).optional(),
  fontWeight: z.enum(['300', '400', '500', '600', '700', '800']).default('400'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$|^rgba?\(.*\)$/).default('#FFFFFF'),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  backgroundColor: z.string().optional(),
  borderRadius: z.number().optional(),
  opacity: z.number().min(0).max(1).default(1),
  accentColor: z.string().optional(),
});

export const PositionSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const StatisticItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  value: z.string().min(1),
  numericValue: z.number().optional(),
  suffix: z.string().optional(),
  label: z.string().min(1),
  subtext: z.string().optional(),
  trend: z.enum(['up', 'down', 'neutral']).optional(),
  icon: z.string().default('activity'),
});

export const TimelineItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  phase: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  dateRange: z.string().optional(),
  status: z.enum(['completed', 'in-progress', 'upcoming']).optional(),
});

export const ComparisonColumnSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  tag: z.string().optional(),
  points: z.array(z.string()).min(1),
  isHighlighted: z.boolean().default(false),
  badge: z.string().optional(),
});

export const FeatureCardSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().default('zap'),
  badge: z.string().optional(),
});

export const SlideContentSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  badge: z.string().max(80).optional(),
  body: z.string().max(2000).optional(),
  bulletPoints: z.array(z.string().max(500)).optional(),
  leftColumn: z.string().max(2000).optional(),
  rightColumn: z.string().max(2000).optional(),
  quote: z.string().max(1000).optional(),
  author: z.string().max(150).optional(),
  authorRole: z.string().max(150).optional(),
  imagePrompt: z.string().max(500).optional(),
  imageUrl: z.string().url().or(z.string().startsWith('data:image/')).optional(),
  imageCaption: z.string().max(200).optional(),
  statistics: z.array(StatisticItemSchema).optional(),
  timeline: z.array(TimelineItemSchema).optional(),
  comparison: z.object({
    left: ComparisonColumnSchema,
    right: ComparisonColumnSchema,
  }).optional(),
  features: z.array(FeatureCardSchema).optional(),
  takeaways: z.array(z.string().max(300)).optional(),
  ctaText: z.string().max(100).optional(),
  ctaUrl: z.string().max(500).optional(),
});

export const SlideSchema = z.object({
  id: z.string(),
  slideNumber: z.number().int().min(1),
  layout: SlideLayoutEnum.default('title-content'),
  content: SlideContentSchema,
  notes: z.string().max(3000).optional().default(''),
  animation: ElementAnimationSchema.default({
    preset: 'fade-in',
    duration: 0.8,
    delay: 0,
    easing: 'power2.out',
    direction: 'none',
  }),
  transition: SlideTransitionSchema.default({
    type: 'fade',
    duration: 0.6,
    easing: 'power2.out',
  }),
  customStyle: z.object({
    backgroundColor: z.string().optional(),
    gradient: z.string().optional(),
    textColor: z.string().optional(),
  }).optional(),
});

export const PresentationMetadataSchema = z.object({
  topic: z.string().min(1),
  language: z.string().default('English'),
  audience: z.string().default('Professional & Business'),
  tone: z.string().default('Professional and Inspiring'),
  style: z.string().default('Modern SaaS Dark'),
  theme: ThemeNameEnum.default('modern-dark'),
  aspectRatio: AspectRatioEnum.default('16:9'),
  animationStyle: z.enum(['subtle', 'dynamic', 'cinematic', 'minimal']).default('dynamic'),
  visualAssetPreference: z.enum(['illustrations', 'geometric', 'charts', 'mixed']).default('mixed'),
  generatedAt: z.string().datetime().optional(),
  version: z.string().default('1.0.0'),
});

export const PresentationDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(250),
  description: z.string().max(1000).optional(),
  theme: ThemeNameEnum.default('modern-dark'),
  aspectRatio: AspectRatioEnum.default('16:9'),
  slides: z.array(SlideSchema).min(1),
  metadata: PresentationMetadataSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const GeneratePresentationDtoSchema = z.object({
  prompt: z.string().min(3).max(50000),
  slideCount: z.number().int().min(3).max(30).default(8),
  language: z.string().default('English'),
  audience: z.string().default('General Business'),
  tone: z.string().default('Professional & Persuasive'),
  style: z.string().default('Modern SaaS Dark'),
  theme: ThemeNameEnum.default('modern-dark'),
  aspectRatio: AspectRatioEnum.default('16:9'),
  animationStyle: z.enum(['subtle', 'dynamic', 'cinematic', 'minimal']).default('dynamic'),
  visualAssetPreference: z.enum(['illustrations', 'geometric', 'charts', 'mixed']).default('mixed'),
  apiKey: z.string().optional(),
  attachedFileName: z.string().optional(),
});

export const RegenerateSlideDtoSchema = z.object({
  prompt: z.string().min(3).max(2000).optional(),
  layout: SlideLayoutEnum.optional(),
  preserveNotes: z.boolean().default(true),
});

export const RewriteContentDtoSchema = z.object({
  text: z.string().min(1).max(2000),
  instruction: z.enum(['shorten', 'expand', 'more-professional', 'bullet-points', 'punchy']),
});
