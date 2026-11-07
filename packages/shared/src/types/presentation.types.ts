import { z } from 'zod';
import {
  SlideLayoutEnum,
  ThemeNameEnum,
  AspectRatioEnum,
  AnimationPresetEnum,
  TransitionTypeEnum,
  EasingEnum,
  ElementAnimationSchema,
  SlideTransitionSchema,
  ElementStyleSchema,
  PositionSchema,
  StatisticItemSchema,
  TimelineItemSchema,
  ComparisonColumnSchema,
  FeatureCardSchema,
  SlideContentSchema,
  SlideSchema,
  PresentationMetadataSchema,
  PresentationDocumentSchema,
  GeneratePresentationDtoSchema,
  RegenerateSlideDtoSchema,
  RewriteContentDtoSchema,
} from '../schemas/presentation.schema';

export type SlideLayout = z.infer<typeof SlideLayoutEnum>;
export type ThemeName = z.infer<typeof ThemeNameEnum>;
export type AspectRatio = z.infer<typeof AspectRatioEnum>;
export type AnimationPreset = z.infer<typeof AnimationPresetEnum>;
export type TransitionType = z.infer<typeof TransitionTypeEnum>;
export type EasingFunction = z.infer<typeof EasingEnum>;

export type ElementAnimation = z.infer<typeof ElementAnimationSchema>;
export type SlideTransition = z.infer<typeof SlideTransitionSchema>;
export type ElementStyle = z.infer<typeof ElementStyleSchema>;
export type Position = z.infer<typeof PositionSchema>;

export type StatisticItem = z.infer<typeof StatisticItemSchema>;
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
export type ComparisonColumn = z.infer<typeof ComparisonColumnSchema>;
export type FeatureCard = z.infer<typeof FeatureCardSchema>;

export type SlideContent = z.infer<typeof SlideContentSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type PresentationMetadata = z.infer<typeof PresentationMetadataSchema>;
export type PresentationDocument = z.infer<typeof PresentationDocumentSchema>;

export type GeneratePresentationDto = z.infer<typeof GeneratePresentationDtoSchema>;
export type RegenerateSlideDto = z.infer<typeof RegenerateSlideDtoSchema>;
export type RewriteContentDto = z.infer<typeof RewriteContentDtoSchema>;

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: {
    background: string;
    backgroundSecondary: string;
    cardBackground: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accentPrimary: string;
    accentSecondary: string;
    accentGlow: string;
    badgeBackground: string;
    badgeText: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    monoFont: string;
  };
}

export interface AnimationConfig {
  name: AnimationPreset;
  displayName: string;
  description: string;
  defaultDuration: number;
  defaultEasing: string;
}

export interface GenerationProgressEvent {
  stage: 'preparing-prompt' | 'generating-outline' | 'generating-slides' | 'validating-presentation' | 'preparing-editor';
  message: string;
  progressPercent?: number;
}
