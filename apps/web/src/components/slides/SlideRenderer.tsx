'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Slide,
  ThemeConfig,
  THEMES,
  FeatureCard,
  TimelineItem,
  StatisticItem,
} from '@ai-slide-studio/shared';
import {
  Zap,
  Activity,
  Layers,
  Shield,
  Cpu,
  Network,
  Gauge,
  Database,
  Calendar,
  Rocket,
  Globe,
  Check,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Quote as QuoteIcon,
  Server,
  Sliders,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation';

interface SlideRendererProps {
  slide: Slide;
  themeName?: string;
  className?: string;
  isInteractive?: boolean;
  isEditable?: boolean;
  onUpdateContent?: (contentUpdates: Partial<Slide['content']>) => void;
  replayTrigger?: number;
}

// Icon mapper for Lucide React
export function getLucideIcon(iconName: string, className = 'w-6 h-6') {
  switch (iconName.toLowerCase()) {
    case 'zap':
      return <Zap className={className} />;
    case 'activity':
      return <Activity className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'cpu':
      return <Cpu className={className} />;
    case 'network':
      return <Network className={className} />;
    case 'gauge':
      return <Gauge className={className} />;
    case 'database':
      return <Database className={className} />;
    case 'calendar':
      return <Calendar className={className} />;
    case 'rocket':
      return <Rocket className={className} />;
    case 'globe':
      return <Globe className={className} />;
    case 'server':
      return <Server className={className} />;
    case 'sliders':
      return <Sliders className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'check':
    default:
      return <Check className={className} />;
  }
}

// Inline On-Canvas WYSIWYG Editable Text Component
interface EditableTextProps {
  value?: string;
  onSave?: (newValue: string) => void;
  className?: string;
  multiline?: boolean;
  isEditable?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'blockquote';
  placeholder?: string;
  dataAnimate?: string;
  style?: React.CSSProperties;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value = '',
  onSave,
  className = '',
  multiline = false,
  isEditable = false,
  as: Component = 'div',
  placeholder = 'Click to edit...',
  dataAnimate,
  style,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const originalRef = useRef<string>(value);

  useEffect(() => {
    if (!isEditing && elementRef.current) {
      if (elementRef.current.innerText !== value) {
        elementRef.current.innerText = value || '';
      }
      originalRef.current = value || '';
    }
  }, [value, isEditing]);

  if (!isEditable || !onSave) {
    return (
      <Component
        data-animate={dataAnimate}
        style={style}
        className={className}
      >
        {value}
      </Component>
    );
  }

  const handleFocus = () => {
    setIsEditing(true);
    if (elementRef.current) {
      originalRef.current = elementRef.current.innerText;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    setIsEditing(false);
    const newText = (e.currentTarget.innerText || '').trim();
    if (newText !== value) {
      onSave(newText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (elementRef.current) {
        elementRef.current.innerText = originalRef.current;
      }
      e.currentTarget.blur();
    }
  };

  return (
    <Component
      ref={elementRef as any}
      contentEditable
      suppressContentEditableWarning
      tabIndex={0}
      role="textbox"
      spellCheck={false}
      data-animate={dataAnimate}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      style={style}
      title="Click to edit text directly on slide"
      className={`${className} select-text cursor-text transition-all duration-150 outline-none hover:outline-dashed hover:outline-1 hover:outline-amber-400/80 hover:rounded-sm focus:outline-solid focus:outline-2 focus:outline-amber-400 focus:rounded-md focus:bg-black/30 focus:text-white focus:bg-none empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--mu)] empty:before:opacity-60`}
      data-placeholder={placeholder}
    >
      {value}
    </Component>
  );
};

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  themeName = 'modern-dark',
  className = '',
  isEditable = false,
  onUpdateContent,
  replayTrigger = 0,
}) => {
  const theme: ThemeConfig = THEMES[themeName as keyof typeof THEMES] || THEMES['modern-dark'];
  const { containerRef } = useGSAPAnimation(slide.id, slide.animation, replayTrigger);

  const styleVariables = {
    '--bg': theme.colors.background,
    '--bg2': theme.colors.backgroundSecondary,
    '--panel': theme.colors.cardBackground,
    '--pb': theme.colors.cardBorder,
    '--tx': theme.colors.textPrimary,
    '--tx2': theme.colors.textSecondary,
    '--mu': theme.colors.textMuted,
    '--pri': theme.colors.accentPrimary,
    '--sec': theme.colors.accentSecondary,
    '--glow': theme.colors.accentGlow,
    '--badge-bg': theme.colors.badgeBackground,
    '--badge-tx': theme.colors.badgeText,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      style={styleVariables}
      className={`slide on w-full h-full p-[80px_110px_120px] flex flex-col justify-between select-none relative overflow-hidden bg-[var(--bg)] text-[var(--tx)] ${className}`}
    >
      {/* Ambient background with dots and drifting glowing blobs matching Keynote presentation */}
      <div className="bgfx absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="dots absolute inset-0 opacity-45" />
        <div
          className="blob b1 absolute -top-[180px] -right-[120px] w-[700px] h-[700px] rounded-full blur-[130px] opacity-35 pointer-events-none"
          style={{ background: theme.colors.accentGlow }}
        />
        <div
          className="blob b2 absolute -bottom-[160px] -left-[120px] w-[520px] h-[520px] rounded-full blur-[120px] opacity-25 pointer-events-none"
          style={{ background: theme.colors.accentSecondary }}
        />
      </div>

      {/* Slide Layout Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {renderLayoutContent(slide, theme, isEditable, onUpdateContent)}
      </div>

      {/* Slide Number Watermark */}
      <div className="absolute right-12 bottom-8 text-xs font-mono font-medium tracking-widest uppercase opacity-40 text-[var(--mu)] z-20">
        {slide.slideNumber < 10 ? `0${slide.slideNumber}` : slide.slideNumber}
      </div>
    </div>
  );
};

function renderLayoutContent(
  slide: Slide,
  theme: ThemeConfig,
  isEditable = false,
  onUpdateContent?: (contentUpdates: Partial<Slide['content']>) => void,
) {
  const content = slide.content;
  const isDark = theme.name !== 'minimal-light';

  // State update helpers for canvas inline edits
  const updateBadge = (val: string) => onUpdateContent?.({ badge: val });
  const updateTitle = (val: string) => onUpdateContent?.({ title: val });
  const updateSubtitle = (val: string) => onUpdateContent?.({ subtitle: val });
  const updateBody = (val: string) => onUpdateContent?.({ body: val });

  const updateBullet = (idx: number, val: string) => {
    const current = [...(content.bulletPoints || [])];
    current[idx] = val;
    onUpdateContent?.({ bulletPoints: current });
  };

  const updateFeature = (idx: number, field: keyof FeatureCard, val: string) => {
    const current = [...(content.features || [])];
    if (current[idx]) {
      current[idx] = { ...current[idx], [field]: val };
      onUpdateContent?.({ features: current });
    }
  };

  const updateStat = (idx: number, field: keyof StatisticItem, val: string) => {
    const current = [...(content.statistics || [])];
    if (current[idx]) {
      current[idx] = { ...current[idx], [field]: val };
      onUpdateContent?.({ statistics: current });
    }
  };

  const updateTimeline = (idx: number, field: keyof TimelineItem, val: string) => {
    const current = [...(content.timeline || [])];
    if (current[idx]) {
      current[idx] = { ...current[idx], [field]: val };
      onUpdateContent?.({ timeline: current });
    }
  };

  const updateComparisonSide = (side: 'left' | 'right', field: 'title' | 'tag' | 'badge', val: string) => {
    if (!content.comparison) return;
    onUpdateContent?.({
      comparison: {
        ...content.comparison,
        [side]: {
          ...content.comparison[side],
          [field]: val,
        },
      },
    });
  };

  const updateComparisonPoint = (side: 'left' | 'right', pointIdx: number, val: string) => {
    if (!content.comparison) return;
    const pts = [...(content.comparison[side].points || [])];
    pts[pointIdx] = val;
    onUpdateContent?.({
      comparison: {
        ...content.comparison,
        [side]: {
          ...content.comparison[side],
          points: pts,
        },
      },
    });
  };

  const updateTakeaway = (idx: number, val: string) => {
    const current = [...(content.takeaways || [])];
    current[idx] = val;
    onUpdateContent?.({ takeaways: current });
  };

  const updateLeftCol = (val: string) => onUpdateContent?.({ leftColumn: val });
  const updateRightCol = (val: string) => onUpdateContent?.({ rightColumn: val });
  const updateQuote = (val: string) => onUpdateContent?.({ quote: val });
  const updateAuthor = (val: string) => onUpdateContent?.({ author: val });
  const updateAuthorRole = (val: string) => onUpdateContent?.({ authorRole: val });
  const updateCtaText = (val: string) => onUpdateContent?.({ ctaText: val });
  const updateImageCaption = (val: string) => onUpdateContent?.({ imageCaption: val });

  switch (slide.layout) {
    case 'cover':
      return (
        <div className="flex flex-col items-center justify-center text-center h-full my-auto z-10">
          {(content.badge || isEditable) && (
            <div
              data-animate="badge"
              style={{ '--d': 0 } as any}
              className="slide-elem inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-8 shadow-lg backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--pri)]" />
              <EditableText
                value={content.badge || ''}
                onSave={updateBadge}
                isEditable={isEditable}
                as="span"
                placeholder="CATEGORY BADGE"
              />
            </div>
          )}
          <EditableText
            value={content.title}
            onSave={updateTitle}
            isEditable={isEditable}
            as="h1"
            dataAnimate="title"
            style={{ '--d': 1 } as any}
            className={`slide-elem text-[84px] font-extrabold leading-[1.08] tracking-tight max-w-[1400px] mb-6 ${
              isDark
                ? 'bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent'
                : 'text-[var(--tx)]'
            }`}
            placeholder="Slide Presentation Title..."
          />
          {(content.subtitle || isEditable) && (
            <EditableText
              value={content.subtitle || ''}
              onSave={updateSubtitle}
              isEditable={isEditable}
              multiline
              as="p"
              dataAnimate="subtitle"
              style={{ '--d': 2 } as any}
              className="slide-elem text-[28px] leading-relaxed text-[var(--tx2)] max-w-[1000px] font-normal"
              placeholder="Add an executive subtitle or summary statement..."
            />
          )}
        </div>
      );

    case 'title-content':
      return (
        <div className="flex flex-col h-full z-10">
          <div>
            {(content.badge || isEditable) && (
              <div
                data-animate="badge"
                style={{ '--d': 0 } as any}
                className="slide-elem slide-eyebrow mb-4 inline-flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--pri)]" />
                <EditableText
                  value={content.badge || ''}
                  onSave={updateBadge}
                  isEditable={isEditable}
                  as="span"
                  placeholder="EYEBROW / CATEGORY"
                />
              </div>
            )}
            <EditableText
              value={content.title}
              onSave={updateTitle}
              isEditable={isEditable}
              as="h2"
              dataAnimate="title"
              style={{ '--d': 1 } as any}
              className="slide-elem text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3"
              placeholder="Slide Title..."
            />
            {(content.subtitle || isEditable) && (
              <EditableText
                value={content.subtitle || ''}
                onSave={updateSubtitle}
                isEditable={isEditable}
                as="p"
                dataAnimate="subtitle"
                style={{ '--d': 2 } as any}
                className="slide-elem text-[22px] text-[var(--tx2)] mb-8 max-w-[1200px]"
                placeholder="Slide subtitle or lead description..."
              />
            )}
          </div>
          <div
            data-animate="card"
            style={{ '--d': 3 } as any}
            className="slide-elem slide-card flex-1 p-10 flex flex-col justify-center"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
            {(content.body || isEditable) && (
              <EditableText
                value={content.body || ''}
                onSave={updateBody}
                isEditable={isEditable}
                multiline
                as="p"
                className="text-[22px] leading-relaxed text-[var(--tx2)] mb-8 font-normal"
                placeholder="Click to add detailed narrative or operational context paragraph..."
              />
            )}
            {content.bulletPoints && content.bulletPoints.length > 0 && (
              <ul className="flex flex-col gap-5 text-[21px] text-[var(--tx2)]">
                {content.bulletPoints.map((point, idx) => (
                  <li
                    key={idx}
                    data-animate="bullet"
                    style={{ '--d': idx + 4 } as any}
                    className="slide-elem flex items-start gap-4"
                  >
                    <span className="flex-none w-7 h-7 rounded-full bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center mt-0.5 border border-[var(--pb)]">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </span>
                    <EditableText
                      value={point}
                      onSave={(val) => updateBullet(idx, val)}
                      isEditable={isEditable}
                      as="span"
                      className="flex-1"
                      placeholder="Bullet point item..."
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );

    case 'feature-grid':
      return (
        <div className="flex flex-col h-full z-10">
          <div>
            {(content.badge || isEditable) && (
              <div
                data-animate="badge"
                style={{ '--d': 0 } as any}
                className="slide-elem slide-eyebrow mb-4 inline-flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--pri)]" />
                <EditableText
                  value={content.badge || ''}
                  onSave={updateBadge}
                  isEditable={isEditable}
                  as="span"
                  placeholder="EYEBROW / CATEGORY"
                />
              </div>
            )}
            <EditableText
              value={content.title}
              onSave={updateTitle}
              isEditable={isEditable}
              as="h2"
              dataAnimate="title"
              style={{ '--d': 1 } as any}
              className="slide-elem text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3"
              placeholder="Slide Title..."
            />
            {(content.subtitle || isEditable) && (
              <EditableText
                value={content.subtitle || ''}
                onSave={updateSubtitle}
                isEditable={isEditable}
                as="p"
                dataAnimate="subtitle"
                style={{ '--d': 2 } as any}
                className="slide-elem text-[22px] text-[var(--tx2)] mb-8"
                placeholder="Slide subtitle or feature overview..."
              />
            )}
          </div>
          <div className="grid grid-cols-3 gap-7 flex-1 items-stretch">
            {(content.features || []).map((feat, idx) => (
              <div
                key={feat.id || idx}
                data-animate="card"
                style={{ '--d': idx + 3 } as any}
                className="slide-elem slide-card p-9 flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center mb-6 border border-[var(--pb)] shadow-lg">
                    {getLucideIcon(feat.icon, 'w-7 h-7')}
                  </div>
                  <EditableText
                    value={feat.title}
                    onSave={(val) => updateFeature(idx, 'title', val)}
                    isEditable={isEditable}
                    as="h3"
                    className="text-[26px] font-bold text-[var(--tx)] mb-3 leading-snug"
                    placeholder="Feature Card Title..."
                  />
                  <EditableText
                    value={feat.description}
                    onSave={(val) => updateFeature(idx, 'description', val)}
                    isEditable={isEditable}
                    multiline
                    as="p"
                    className="text-[18px] leading-relaxed text-[var(--tx2)]"
                    placeholder="Describe this core capability or workflow..."
                  />
                </div>
                {(feat.badge || isEditable) && (
                  <div className="mt-6 text-xs font-mono font-bold tracking-widest text-[var(--pri)]">
                    <EditableText
                      value={feat.badge || ''}
                      onSave={(val) => updateFeature(idx, 'badge', val)}
                      isEditable={isEditable}
                      as="span"
                      placeholder="FEATURE TAG"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'statistics':
    case 'metric-highlight':
      return (
        <div className="flex flex-col h-full z-10">
          <div>
            {(content.badge || isEditable) && (
              <div
                data-animate="badge"
                style={{ '--d': 0 } as any}
                className="slide-elem slide-eyebrow mb-4 inline-flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--pri)]" />
                <EditableText
                  value={content.badge || ''}
                  onSave={updateBadge}
                  isEditable={isEditable}
                  as="span"
                  placeholder="KEY METRICS"
                />
              </div>
            )}
            <EditableText
              value={content.title}
              onSave={updateTitle}
              isEditable={isEditable}
              as="h2"
              dataAnimate="title"
              style={{ '--d': 1 } as any}
              className="slide-elem text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3"
              placeholder="Slide Title..."
            />
            {(content.subtitle || isEditable) && (
              <EditableText
                value={content.subtitle || ''}
                onSave={updateSubtitle}
                isEditable={isEditable}
                as="p"
                dataAnimate="subtitle"
                style={{ '--d': 2 } as any}
                className="slide-elem text-[22px] text-[var(--tx2)] mb-8"
                placeholder="Metrics summary and performance impact..."
              />
            )}
          </div>
          <div className="grid grid-cols-3 gap-8 flex-1 items-stretch">
            {(content.statistics || []).map((stat, idx) => (
              <div
                key={stat.id || idx}
                data-animate="card"
                style={{ '--d': idx + 3 } as any}
                className="slide-elem slide-card p-10 flex flex-col items-center justify-center text-center"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
                <div className="w-16 h-16 rounded-2xl bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center mb-6 border border-[var(--pb)] shadow-lg">
                  {getLucideIcon(stat.icon, 'w-8 h-8')}
                </div>
                <EditableText
                  value={stat.value}
                  onSave={(val) => updateStat(idx, 'value', val)}
                  isEditable={isEditable}
                  dataAnimate="counter"
                  as="div"
                  className={`text-[82px] font-extrabold leading-none tracking-tight mb-3 font-mono ${
                    isDark
                      ? 'bg-gradient-to-br from-white via-slate-100 to-amber-300 bg-clip-text text-transparent'
                      : 'text-[var(--pri)]'
                  }`}
                  placeholder="+45%"
                />
                <EditableText
                  value={stat.label}
                  onSave={(val) => updateStat(idx, 'label', val)}
                  isEditable={isEditable}
                  as="div"
                  className="text-[22px] font-bold text-[var(--tx)] mb-2"
                  placeholder="Metric Label"
                />
                {(stat.subtext || isEditable) && (
                  <EditableText
                    value={stat.subtext || ''}
                    onSave={(val) => updateStat(idx, 'subtext', val)}
                    isEditable={isEditable}
                    as="div"
                    className="text-[16px] text-[var(--mu)] leading-snug"
                    placeholder="Year-over-Year"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div className="flex flex-col h-full z-10">
          <div>
            {(content.badge || isEditable) && (
              <div
                data-animate="badge"
                style={{ '--d': 0 } as any}
                className="slide-elem slide-eyebrow mb-4 inline-flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--pri)]" />
                <EditableText
                  value={content.badge || ''}
                  onSave={updateBadge}
                  isEditable={isEditable}
                  as="span"
                  placeholder="ROADMAP"
                />
              </div>
            )}
            <EditableText
              value={content.title}
              onSave={updateTitle}
              isEditable={isEditable}
              as="h2"
              dataAnimate="title"
              style={{ '--d': 1 } as any}
              className="slide-elem text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3"
              placeholder="Roadmap / Timeline Title..."
            />
            {(content.subtitle || isEditable) && (
              <EditableText
                value={content.subtitle || ''}
                onSave={updateSubtitle}
                isEditable={isEditable}
                as="p"
                dataAnimate="subtitle"
                style={{ '--d': 2 } as any}
                className="slide-elem text-[22px] text-[var(--tx2)] mb-8"
                placeholder="Implementation milestones and delivery horizons..."
              />
            )}
          </div>
          <div className="grid grid-cols-4 gap-6 flex-1 items-stretch">
            {(content.timeline || []).map((step, idx) => (
              <div
                key={step.id || idx}
                data-animate="card"
                style={{ '--d': idx + 3 } as any}
                className="slide-elem slide-card p-8 flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
                <div>
                  <EditableText
                    value={step.phase}
                    onSave={(val) => updateTimeline(idx, 'phase', val)}
                    isEditable={isEditable}
                    as="div"
                    className="text-xs font-mono font-bold tracking-widest text-[var(--pri)] mb-3"
                    placeholder="PHASE 01"
                  />
                  <EditableText
                    value={step.title}
                    onSave={(val) => updateTimeline(idx, 'title', val)}
                    isEditable={isEditable}
                    as="h3"
                    className="text-[22px] font-bold text-[var(--tx)] mb-3 leading-snug"
                    placeholder="Milestone Title"
                  />
                  <EditableText
                    value={step.description}
                    onSave={(val) => updateTimeline(idx, 'description', val)}
                    isEditable={isEditable}
                    multiline
                    as="p"
                    className="text-[16px] leading-relaxed text-[var(--tx2)]"
                    placeholder="Describe deliverable..."
                  />
                </div>
                {(step.dateRange || isEditable) && (
                  <div className="mt-6 flex items-center gap-2 text-xs font-mono text-[var(--mu)] border-t border-[var(--pb)] pt-4">
                    <Calendar className="w-3.5 h-3.5 text-[var(--pri)] shrink-0" />
                    <EditableText
                      value={step.dateRange || ''}
                      onSave={(val) => updateTimeline(idx, 'dateRange', val)}
                      isEditable={isEditable}
                      as="span"
                      className="flex-1"
                      placeholder="Q1 2026"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'comparison':
      return (
        <div className="flex flex-col h-full z-10">
          <div>
            {(content.badge || isEditable) && (
              <div
                data-animate="badge"
                style={{ '--d': 0 } as any}
                className="slide-elem slide-eyebrow mb-4 inline-flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--pri)]" />
                <EditableText
                  value={content.badge || ''}
                  onSave={updateBadge}
                  isEditable={isEditable}
                  as="span"
                  placeholder="STRATEGIC COMPARISON"
                />
              </div>
            )}
            <EditableText
              value={content.title}
              onSave={updateTitle}
              isEditable={isEditable}
              as="h2"
              dataAnimate="title"
              style={{ '--d': 1 } as any}
              className="slide-elem text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3"
              placeholder="Comparison Title..."
            />
            {(content.subtitle || isEditable) && (
              <EditableText
                value={content.subtitle || ''}
                onSave={updateSubtitle}
                isEditable={isEditable}
                as="p"
                dataAnimate="subtitle"
                style={{ '--d': 2 } as any}
                className="slide-elem text-[22px] text-[var(--tx2)] mb-8"
                placeholder="Key distinctions and competitive advantages..."
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-8 flex-1 items-stretch">
            {content.comparison && (
              <>
                <div
                  data-animate="card"
                  style={{ '--d': 3 } as any}
                  className="slide-elem slide-card p-10 flex flex-col justify-between"
                >
                  <div>
                    <EditableText
                      value={content.comparison.left.tag || 'CONVENTIONAL APPROACH'}
                      onSave={(val) => updateComparisonSide('left', 'tag', val)}
                      isEditable={isEditable}
                      as="div"
                      className="text-xs font-mono font-bold tracking-widest text-red-400 mb-2 uppercase"
                      placeholder="CONVENTIONAL"
                    />
                    <EditableText
                      value={content.comparison.left.title}
                      onSave={(val) => updateComparisonSide('left', 'title', val)}
                      isEditable={isEditable}
                      as="h3"
                      className="text-[30px] font-bold text-[var(--tx)] mb-6"
                      placeholder="Legacy Workflow"
                    />
                    <ul className="flex flex-col gap-4 text-[19px] text-[var(--tx2)]">
                      {content.comparison.left.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center flex-none mt-0.5">
                            <TrendingDown className="w-3.5 h-3.5" />
                          </span>
                          <EditableText
                            value={pt}
                            onSave={(val) => updateComparisonPoint('left', i, val)}
                            isEditable={isEditable}
                            as="span"
                            className="flex-1"
                            placeholder="Pain point or bottleneck..."
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div
                  data-animate="card"
                  style={{ '--d': 4 } as any}
                  className="slide-elem slide-card p-10 flex flex-col justify-between border-[var(--pri)] shadow-2xl"
                >
                  <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <EditableText
                        value={content.comparison.right.tag || 'AI SLIDE STUDIO SOLUTION'}
                        onSave={(val) => updateComparisonSide('right', 'tag', val)}
                        isEditable={isEditable}
                        as="div"
                        className="text-xs font-mono font-bold tracking-widest text-[var(--sec)] uppercase"
                        placeholder="MODERN SOLUTION"
                      />
                      {(content.comparison.right.badge || isEditable) && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--badge-bg)] text-[var(--pri)] border border-[var(--pri)]">
                          <EditableText
                            value={content.comparison.right.badge || ''}
                            onSave={(val) => updateComparisonSide('right', 'badge', val)}
                            isEditable={isEditable}
                            as="span"
                            placeholder="ADVANTAGE"
                          />
                        </span>
                      )}
                    </div>
                    <EditableText
                      value={content.comparison.right.title}
                      onSave={(val) => updateComparisonSide('right', 'title', val)}
                      isEditable={isEditable}
                      as="h3"
                      className="text-[30px] font-bold text-[var(--tx)] mb-6"
                      placeholder="Automated Architecture"
                    />
                    <ul className="flex flex-col gap-4 text-[19px] text-[var(--tx2)]">
                      {content.comparison.right.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center flex-none mt-0.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                          </span>
                          <EditableText
                            value={pt}
                            onSave={(val) => updateComparisonPoint('right', i, val)}
                            isEditable={isEditable}
                            as="span"
                            className="flex-1"
                            placeholder="Operational benefit..."
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      );

    case 'key-takeaways':
      return (
        <div className="flex flex-col h-full z-10">
          <div>
            {(content.badge || isEditable) && (
              <div
                data-animate="badge"
                style={{ '--d': 0 } as any}
                className="slide-elem slide-eyebrow mb-4 inline-flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--pri)]" />
                <EditableText
                  value={content.badge || ''}
                  onSave={updateBadge}
                  isEditable={isEditable}
                  as="span"
                  placeholder="EXECUTIVE SUMMARY"
                />
              </div>
            )}
            <EditableText
              value={content.title}
              onSave={updateTitle}
              isEditable={isEditable}
              as="h2"
              dataAnimate="title"
              style={{ '--d': 1 } as any}
              className="slide-elem text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3"
              placeholder="Takeaways Title..."
            />
            {(content.subtitle || isEditable) && (
              <EditableText
                value={content.subtitle || ''}
                onSave={updateSubtitle}
                isEditable={isEditable}
                as="p"
                dataAnimate="subtitle"
                style={{ '--d': 2 } as any}
                className="slide-elem text-[22px] text-[var(--tx2)] mb-8"
                placeholder="Core conclusions and principles..."
              />
            )}
          </div>
          <div
            data-animate="card"
            style={{ '--d': 3 } as any}
            className="slide-elem slide-card flex-1 p-12 flex flex-col justify-center"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
            <ul className="flex flex-col gap-7 text-[23px] text-[var(--tx2)]">
              {(content.takeaways || []).map((item, idx) => (
                <li
                  key={idx}
                  data-animate="bullet"
                  style={{ '--d': idx + 4 } as any}
                  className="slide-elem flex items-start gap-5"
                >
                  <span className="w-9 h-9 rounded-full bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center flex-none mt-0.5 border border-[var(--pb)] shadow-md">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </span>
                  <EditableText
                    value={item}
                    onSave={(val) => updateTakeaway(idx, val)}
                    isEditable={isEditable}
                    as="span"
                    className="flex-1 leading-snug"
                    placeholder="Key strategic takeaway..."
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case 'two-columns':
      return (
        <div className="flex flex-col h-full z-10">
          <div>
            {(content.badge || isEditable) && (
              <div
                data-animate="badge"
                style={{ '--d': 0 } as any}
                className="slide-elem slide-eyebrow mb-4 inline-flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--pri)]" />
                <EditableText
                  value={content.badge || ''}
                  onSave={updateBadge}
                  isEditable={isEditable}
                  as="span"
                  placeholder="TWO PERSPECTIVES"
                />
              </div>
            )}
            <EditableText
              value={content.title}
              onSave={updateTitle}
              isEditable={isEditable}
              as="h2"
              dataAnimate="title"
              style={{ '--d': 1 } as any}
              className="slide-elem text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3"
              placeholder="Two Columns Title..."
            />
            {(content.subtitle || isEditable) && (
              <EditableText
                value={content.subtitle || ''}
                onSave={updateSubtitle}
                isEditable={isEditable}
                as="p"
                dataAnimate="subtitle"
                style={{ '--d': 2 } as any}
                className="slide-elem text-[22px] text-[var(--tx2)] mb-8"
                placeholder="Dual-perspective analysis..."
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-8 flex-1 items-stretch">
            <div
              data-animate="card"
              style={{ '--d': 3 } as any}
              className="slide-elem slide-card p-10 flex flex-col justify-center"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--pri)]" />
              <EditableText
                value={content.leftColumn || ''}
                onSave={updateLeftCol}
                isEditable={isEditable}
                multiline
                as="p"
                className="text-[21px] leading-relaxed text-[var(--tx2)] whitespace-pre-line font-normal"
                placeholder="Left column content narrative..."
              />
            </div>
            <div
              data-animate="card"
              style={{ '--d': 4 } as any}
              className="slide-elem slide-card p-10 flex flex-col justify-center"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--sec)]" />
              <EditableText
                value={content.rightColumn || ''}
                onSave={updateRightCol}
                isEditable={isEditable}
                multiline
                as="p"
                className="text-[21px] leading-relaxed text-[var(--tx2)] whitespace-pre-line font-normal"
                placeholder="Right column content narrative..."
              />
            </div>
          </div>
        </div>
      );

    case 'image-text':
      return (
        <div className="flex flex-col h-full z-10">
          <div>
            {(content.badge || isEditable) && (
              <div
                data-animate="badge"
                style={{ '--d': 0 } as any}
                className="slide-elem slide-eyebrow mb-4 inline-flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--pri)]" />
                <EditableText
                  value={content.badge || ''}
                  onSave={updateBadge}
                  isEditable={isEditable}
                  as="span"
                  placeholder="VISUAL ARCHITECTURE"
                />
              </div>
            )}
            <EditableText
              value={content.title}
              onSave={updateTitle}
              isEditable={isEditable}
              as="h2"
              dataAnimate="title"
              style={{ '--d': 1 } as any}
              className="slide-elem text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3"
              placeholder="Visual Architecture Title..."
            />
            {(content.subtitle || isEditable) && (
              <EditableText
                value={content.subtitle || ''}
                onSave={updateSubtitle}
                isEditable={isEditable}
                as="p"
                dataAnimate="subtitle"
                style={{ '--d': 2 } as any}
                className="slide-elem text-[22px] text-[var(--tx2)] mb-8"
                placeholder="Visual model and system interaction..."
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-8 flex-1 items-stretch">
            <div
              data-animate="card"
              style={{ '--d': 3 } as any}
              className="slide-elem slide-card p-10 flex flex-col justify-center"
            >
              {(content.body || isEditable) && (
                <EditableText
                  value={content.body || ''}
                  onSave={updateBody}
                  isEditable={isEditable}
                  multiline
                  as="p"
                  className="text-[21px] leading-relaxed text-[var(--tx2)] mb-6 font-normal"
                  placeholder="Narrative description..."
                />
              )}
              {content.bulletPoints && content.bulletPoints.length > 0 && (
                <ul className="flex flex-col gap-4 text-[19px] text-[var(--tx2)]">
                  {content.bulletPoints.map((b, i) => (
                    <li
                      key={i}
                      data-animate="bullet"
                      style={{ '--d': i + 4 } as any}
                      className="slide-elem flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center flex-none mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <EditableText
                        value={b}
                        onSave={(val) => updateBullet(i, val)}
                        isEditable={isEditable}
                        as="span"
                        className="flex-1"
                        placeholder="Key point..."
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div
              data-animate="card"
              style={{ '--d': 4 } as any}
              className="slide-elem slide-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
            >
              <div className="w-full h-full min-h-[300px] rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-[var(--pb)] flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center mb-6 border border-[var(--pb)] shadow-xl">
                  <Layers className="w-10 h-10" />
                </div>
                <EditableText
                  value={content.imageCaption || 'High-fidelity visual architecture canvas'}
                  onSave={updateImageCaption}
                  isEditable={isEditable}
                  as="div"
                  className="text-sm font-mono text-[var(--mu)] max-w-sm"
                  placeholder="Image Caption..."
                />
              </div>
            </div>
          </div>
        </div>
      );

    case 'quote':
      return (
        <div className="flex flex-col h-full justify-center z-10 max-w-[1500px] mx-auto w-full">
          {(content.badge || isEditable) && (
            <div
              data-animate="badge"
              style={{ '--d': 0 } as any}
              className="slide-elem slide-eyebrow mb-8 w-fit inline-flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--pri)]" />
              <EditableText
                value={content.badge || ''}
                onSave={updateBadge}
                isEditable={isEditable}
                as="span"
                placeholder="LEADERSHIP PERSPECTIVE"
              />
            </div>
          )}
          <div
            data-animate="card"
            style={{ '--d': 1 } as any}
            className="slide-elem slide-card p-16"
          >
            <QuoteIcon className="w-16 h-16 text-[var(--pri)] opacity-30 mb-6" />
            <EditableText
              value={content.quote || ''}
              onSave={updateQuote}
              isEditable={isEditable}
              multiline
              as="blockquote"
              dataAnimate="title"
              style={{ '--d': 2 } as any}
              className="slide-elem text-[40px] leading-snug font-medium italic text-[var(--tx)] mb-8"
              placeholder="Enter inspiring quote text here..."
            />
            <div
              data-animate="subtitle"
              style={{ '--d': 3 } as any}
              className="slide-elem"
            >
              <EditableText
                value={content.author || ''}
                onSave={updateAuthor}
                isEditable={isEditable}
                as="div"
                className="text-[26px] font-bold text-[var(--pri)]"
                placeholder="Author Name"
              />
              <EditableText
                value={content.authorRole || ''}
                onSave={updateAuthorRole}
                isEditable={isEditable}
                as="div"
                className="text-[19px] text-[var(--mu)]"
                placeholder="Author Title & Organization"
              />
            </div>
          </div>
        </div>
      );

    case 'closing':
    default:
      return (
        <div className="flex flex-col items-center justify-center text-center h-full my-auto z-10">
          {(content.badge || isEditable) && (
            <div
              data-animate="badge"
              style={{ '--d': 0 } as any}
              className="slide-elem inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-8 shadow-lg backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--pri)]" />
              <EditableText
                value={content.badge || ''}
                onSave={updateBadge}
                isEditable={isEditable}
                as="span"
                placeholder="GET IN TOUCH"
              />
            </div>
          )}
          <EditableText
            value={content.title}
            onSave={updateTitle}
            isEditable={isEditable}
            as="h1"
            dataAnimate="title"
            style={{ '--d': 1 } as any}
            className={`slide-elem text-[96px] font-extrabold leading-tight tracking-tight mb-6 ${
              isDark
                ? 'bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent'
                : 'text-[var(--tx)]'
            }`}
            placeholder="Closing Slide Title..."
          />
          {(content.subtitle || isEditable) && (
            <EditableText
              value={content.subtitle || ''}
              onSave={updateSubtitle}
              isEditable={isEditable}
              multiline
              as="p"
              dataAnimate="subtitle"
              style={{ '--d': 2 } as any}
              className="slide-elem text-[30px] text-[var(--tx2)] max-w-[900px] mb-12"
              placeholder="Call to action summary or parting takeaway..."
            />
          )}
          {(content.ctaText || isEditable) && (
            <div
              data-animate="card"
              style={{ '--d': 3 } as any}
              className="slide-elem"
            >
              <button
                type="button"
                className="px-10 py-5 rounded-full bg-gradient-to-r from-[var(--pri)] to-[var(--sec)] text-white font-bold text-xl shadow-2xl shadow-[var(--glow)] hover:opacity-95 transition-all flex items-center gap-3 cursor-pointer"
              >
                <EditableText
                  value={content.ctaText || 'Get Started'}
                  onSave={updateCtaText}
                  isEditable={isEditable}
                  as="span"
                  placeholder="Button Label"
                />
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      );
  }
}
