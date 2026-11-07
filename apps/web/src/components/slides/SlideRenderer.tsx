'use client';

import React from 'react';
import {
  Slide,
  ThemeConfig,
  THEMES,
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

interface SlideRendererProps {
  slide: Slide;
  themeName?: string;
  className?: string;
  isInteractive?: boolean;
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

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  themeName = 'modern-dark',
  className = '',
}) => {
  const theme: ThemeConfig = THEMES[themeName as keyof typeof THEMES] || THEMES['modern-dark'];
  const content = slide.content;

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
      style={styleVariables}
      className={`w-full h-full p-[80px_110px_120px] flex flex-col justify-between select-none relative overflow-hidden bg-[var(--bg)] text-[var(--tx)] ${className}`}
    >
      {/* Decorative ambient glow */}
      <div
        className="absolute -top-[160px] left-[20%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-40"
        style={{ background: theme.colors.accentGlow }}
      />

      {/* Slide Layouts */}
      {renderLayoutContent(slide, theme)}

      {/* Slide Number Watermark */}
      <div className="absolute right-12 bottom-8 text-xs font-mono font-medium tracking-widest uppercase opacity-40 text-[var(--mu)]">
        {slide.slideNumber < 10 ? `0${slide.slideNumber}` : slide.slideNumber}
      </div>
    </div>
  );
};

function renderLayoutContent(slide: Slide, theme: ThemeConfig) {
  const content = slide.content;
  const isDark = theme.name !== 'minimal-light';

  switch (slide.layout) {
    case 'cover':
      return (
        <div className="flex flex-col items-center justify-center text-center h-full my-auto z-10">
          {content.badge && (
            <div data-animate="badge" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              {content.badge}
            </div>
          )}
          <h1
            data-animate="title"
            className={`text-[84px] font-extrabold leading-[1.08] tracking-tight max-w-[1400px] mb-6 ${
              isDark
                ? 'bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent'
                : 'text-[var(--tx)]'
            }`}
          >
            {content.title}
          </h1>
          {content.subtitle && (
            <p data-animate="subtitle" className="text-[28px] leading-relaxed text-[var(--tx2)] max-w-[1000px] font-normal">
              {content.subtitle}
            </p>
          )}
        </div>
      );

    case 'title-content':
      return (
        <div className="flex flex-col h-full z-10">
          <div>
            {content.badge && (
              <div data-animate="badge" className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-4">
                {content.badge}
              </div>
            )}
            <h2 data-animate="title" className="text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3">
              {content.title}
            </h2>
            {content.subtitle && (
              <p data-animate="subtitle" className="text-[22px] text-[var(--tx2)] mb-8 max-w-[1200px]">
                {content.subtitle}
              </p>
            )}
          </div>
          <div data-animate="card" className="flex-1 rounded-2xl border border-[var(--pb)] bg-[var(--panel)] p-10 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
            {content.body && (
              <p className="text-[22px] leading-relaxed text-[var(--tx2)] mb-8 font-normal">
                {content.body}
              </p>
            )}
            {content.bulletPoints && content.bulletPoints.length > 0 && (
              <ul className="flex flex-col gap-5 text-[21px] text-[var(--tx2)]">
                {content.bulletPoints.map((point, idx) => (
                  <li key={idx} data-animate="bullet" className="flex items-start gap-4">
                    <span className="flex-none w-7 h-7 rounded-full bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center mt-0.5 border border-[var(--pb)]">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </span>
                    <span>{point}</span>
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
            {content.badge && (
              <div data-animate="badge" className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-4">
                {content.badge}
              </div>
            )}
            <h2 data-animate="title" className="text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3">
              {content.title}
            </h2>
            {content.subtitle && (
              <p data-animate="subtitle" className="text-[22px] text-[var(--tx2)] mb-8">
                {content.subtitle}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-7 flex-1 items-stretch">
            {(content.features || []).map((feat, idx) => (
              <div
                key={feat.id || idx}
                data-animate="card"
                className="rounded-2xl border border-[var(--pb)] bg-[var(--panel)] p-9 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-[var(--pri)] transition-all"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
                <div>
                  <div className="w-14 h-14 rounded-xl bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center mb-6 border border-[var(--pb)]">
                    {getLucideIcon(feat.icon, 'w-7 h-7')}
                  </div>
                  <h3 className="text-[26px] font-bold text-[var(--tx)] mb-3 leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-[18px] leading-relaxed text-[var(--tx2)]">
                    {feat.description}
                  </p>
                </div>
                {feat.badge && (
                  <div className="mt-6 text-xs font-mono font-bold tracking-widest text-[var(--pri)]">
                    {feat.badge}
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
            {content.badge && (
              <div data-animate="badge" className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-4">
                {content.badge}
              </div>
            )}
            <h2 data-animate="title" className="text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3">
              {content.title}
            </h2>
            {content.subtitle && (
              <p data-animate="subtitle" className="text-[22px] text-[var(--tx2)] mb-8">
                {content.subtitle}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-8 flex-1 items-stretch">
            {(content.statistics || []).map((stat, idx) => (
              <div
                key={stat.id || idx}
                data-animate="card"
                className="rounded-2xl border border-[var(--pb)] bg-[var(--panel)] p-10 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
                <div className="w-14 h-14 rounded-full bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center mb-6 border border-[var(--pb)]">
                  {getLucideIcon(stat.icon, 'w-7 h-7')}
                </div>
                <div
                  data-animate="counter"
                  data-value={stat.value}
                  data-suffix={stat.suffix || ''}
                  className={`text-[82px] font-extrabold leading-none tracking-tight mb-3 font-mono ${
                    isDark
                      ? 'bg-gradient-to-br from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent'
                      : 'text-[var(--pri)]'
                  }`}
                >
                  {stat.value}
                </div>
                <div className="text-[22px] font-bold text-[var(--tx)] mb-2">
                  {stat.label}
                </div>
                {stat.subtext && (
                  <div className="text-[16px] text-[var(--mu)] leading-snug">
                    {stat.subtext}
                  </div>
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
            {content.badge && (
              <div data-animate="badge" className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-4">
                {content.badge}
              </div>
            )}
            <h2 data-animate="title" className="text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3">
              {content.title}
            </h2>
            {content.subtitle && (
              <p data-animate="subtitle" className="text-[22px] text-[var(--tx2)] mb-8">
                {content.subtitle}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 gap-6 flex-1 items-stretch">
            {(content.timeline || []).map((step, idx) => (
              <div
                key={step.id || idx}
                data-animate="card"
                className="rounded-2xl border border-[var(--pb)] bg-[var(--panel)] p-8 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
                <div>
                  <div className="text-xs font-mono font-bold tracking-widest text-[var(--pri)] mb-3">
                    {step.phase}
                  </div>
                  <h3 className="text-[22px] font-bold text-[var(--tx)] mb-3 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[16px] leading-relaxed text-[var(--tx2)]">
                    {step.description}
                  </p>
                </div>
                {step.dateRange && (
                  <div className="mt-6 flex items-center gap-2 text-xs font-mono text-[var(--mu)] border-t border-[var(--pb)] pt-4">
                    <Calendar className="w-3.5 h-3.5 text-[var(--pri)]" />
                    <span>{step.dateRange}</span>
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
            {content.badge && (
              <div data-animate="badge" className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-4">
                {content.badge}
              </div>
            )}
            <h2 data-animate="title" className="text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3">
              {content.title}
            </h2>
            {content.subtitle && (
              <p data-animate="subtitle" className="text-[22px] text-[var(--tx2)] mb-8">
                {content.subtitle}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-8 flex-1 items-stretch">
            {content.comparison && (
              <>
                <div data-animate="card" className="rounded-2xl border border-[var(--pb)] bg-[var(--panel)] p-10 backdrop-blur-md shadow-xl flex flex-col justify-between relative">
                  <div>
                    <div className="text-xs font-mono font-bold tracking-widest text-red-400 mb-2 uppercase">
                      {content.comparison.left.tag || 'CONVENTIONAL APPROACH'}
                    </div>
                    <h3 className="text-[30px] font-bold text-[var(--tx)] mb-6">
                      {content.comparison.left.title}
                    </h3>
                    <ul className="flex flex-col gap-4 text-[19px] text-[var(--tx2)]">
                      {content.comparison.left.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center flex-none mt-0.5">
                            <TrendingDown className="w-3.5 h-3.5" />
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div data-animate="card" className="rounded-2xl border border-[var(--pri)] bg-[var(--panel)] p-10 backdrop-blur-md shadow-2xl flex flex-col justify-between relative glow-border">
                  <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono font-bold tracking-widest text-[var(--sec)] uppercase">
                        {content.comparison.right.tag || 'AI SLIDE STUDIO SOLUTION'}
                      </div>
                      {content.comparison.right.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--badge-bg)] text-[var(--pri)] border border-[var(--pri)]">
                          {content.comparison.right.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[30px] font-bold text-[var(--tx)] mb-6">
                      {content.comparison.right.title}
                    </h3>
                    <ul className="flex flex-col gap-4 text-[19px] text-[var(--tx2)]">
                      {content.comparison.right.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center flex-none mt-0.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                          </span>
                          <span>{pt}</span>
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
            {content.badge && (
              <div data-animate="badge" className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-4">
                {content.badge}
              </div>
            )}
            <h2 data-animate="title" className="text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3">
              {content.title}
            </h2>
            {content.subtitle && (
              <p data-animate="subtitle" className="text-[22px] text-[var(--tx2)] mb-8">
                {content.subtitle}
              </p>
            )}
          </div>
          <div data-animate="card" className="flex-1 rounded-2xl border border-[var(--pb)] bg-[var(--panel)] p-12 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
            <ul className="flex flex-col gap-7 text-[23px] text-[var(--tx2)]">
              {(content.takeaways || []).map((item, idx) => (
                <li key={idx} data-animate="bullet" className="flex items-start gap-5">
                  <span className="w-9 h-9 rounded-full bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center flex-none mt-0.5 border border-[var(--pb)]">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </span>
                  <span className="leading-snug">{item}</span>
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
            {content.badge && (
              <div data-animate="badge" className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-4">
                {content.badge}
              </div>
            )}
            <h2 data-animate="title" className="text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3">
              {content.title}
            </h2>
            {content.subtitle && (
              <p data-animate="subtitle" className="text-[22px] text-[var(--tx2)] mb-8">
                {content.subtitle}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-8 flex-1 items-stretch">
            <div data-animate="card" className="rounded-2xl border border-[var(--pb)] bg-[var(--panel)] p-10 backdrop-blur-md shadow-xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--pri)] to-[var(--sec)]" />
              <p className="text-[21px] leading-relaxed text-[var(--tx2)] whitespace-pre-line">
                {content.leftColumn}
              </p>
            </div>
            <div data-animate="card" className="rounded-2xl border border-[var(--pb)] bg-[var(--panel)] p-10 backdrop-blur-md shadow-xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--sec)] to-[var(--pri)]" />
              <p className="text-[21px] leading-relaxed text-[var(--tx2)] whitespace-pre-line">
                {content.rightColumn}
              </p>
            </div>
          </div>
        </div>
      );

    case 'image-text':
      return (
        <div className="flex flex-col h-full z-10">
          <div>
            {content.badge && (
              <div data-animate="badge" className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-4">
                {content.badge}
              </div>
            )}
            <h2 data-animate="title" className="text-[52px] font-bold leading-tight tracking-tight text-[var(--tx)] mb-3">
              {content.title}
            </h2>
            {content.subtitle && (
              <p data-animate="subtitle" className="text-[22px] text-[var(--tx2)] mb-8">
                {content.subtitle}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-8 flex-1 items-stretch">
            <div data-animate="card" className="rounded-2xl border border-[var(--pb)] bg-[var(--panel)] p-10 backdrop-blur-md shadow-xl flex flex-col justify-center">
              {content.body && (
                <p className="text-[21px] leading-relaxed text-[var(--tx2)] mb-6">
                  {content.body}
                </p>
              )}
              {content.bulletPoints && content.bulletPoints.length > 0 && (
                <ul className="flex flex-col gap-4 text-[19px] text-[var(--tx2)]">
                  {content.bulletPoints.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center flex-none mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div data-animate="card" className="rounded-2xl border border-[var(--pb)] bg-[var(--panel)] p-8 backdrop-blur-md shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="w-full h-full min-h-[300px] rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-[var(--pb)] flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-[var(--badge-bg)] text-[var(--pri)] flex items-center justify-center mb-6 border border-[var(--pb)] shadow-xl">
                  <Layers className="w-10 h-10" />
                </div>
                <div className="text-sm font-mono text-[var(--mu)] max-w-sm">
                  {content.imageCaption || 'High-fidelity visual architecture canvas'}
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'quote':
      return (
        <div className="flex flex-col h-full justify-center z-10 max-w-[1500px] mx-auto w-full">
          {content.badge && (
            <div data-animate="badge" className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-8 w-fit">
              {content.badge}
            </div>
          )}
          <div data-animate="card" className="rounded-3xl border border-[var(--pb)] bg-[var(--panel)] p-16 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <QuoteIcon className="w-16 h-16 text-[var(--pri)] opacity-30 mb-6" />
            <blockquote data-animate="title" className="text-[40px] leading-snug font-medium italic text-[var(--tx)] mb-8">
              "{content.quote}"
            </blockquote>
            <div data-animate="subtitle">
              <div className="text-[26px] font-bold text-[var(--pri)]">
                {content.author}
              </div>
              <div className="text-[19px] text-[var(--mu)]">
                {content.authorRole}
              </div>
            </div>
          </div>
        </div>
      );

    case 'closing':
    default:
      return (
        <div className="flex flex-col items-center justify-center text-center h-full my-auto z-10">
          {content.badge && (
            <div data-animate="badge" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold tracking-widest uppercase bg-[var(--badge-bg)] text-[var(--badge-tx)] border border-[var(--pb)] mb-8">
              {content.badge}
            </div>
          )}
          <h1
            data-animate="title"
            className={`text-[96px] font-extrabold leading-tight tracking-tight mb-6 ${
              isDark
                ? 'bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent'
                : 'text-[var(--tx)]'
            }`}
          >
            {content.title}
          </h1>
          {content.subtitle && (
            <p data-animate="subtitle" className="text-[30px] text-[var(--tx2)] max-w-[900px] mb-12">
              {content.subtitle}
            </p>
          )}
          {content.ctaText && (
            <div data-animate="card">
              <button className="px-10 py-5 rounded-full bg-gradient-to-r from-[var(--pri)] to-[var(--sec)] text-white font-bold text-xl shadow-2xl shadow-[var(--glow)] hover:opacity-95 transition-all flex items-center gap-3 cursor-pointer">
                <span>{content.ctaText}</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      );
  }
}
