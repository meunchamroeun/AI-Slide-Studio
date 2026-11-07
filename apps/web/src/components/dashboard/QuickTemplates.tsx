'use client';

import React from 'react';
import {
  TrendingUp,
  Cpu,
  Rocket,
  Users,
  LineChart,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n-provider';

interface QuickTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
}

export function QuickTemplates({ onSelectTemplate }: QuickTemplatesProps) {
  const { t } = useI18n();
  const templates = [
    {
      id: 'executive-pitch',
      title: 'Executive Pitch Deck',
      category: 'Business & VC',
      icon: TrendingUp,
      slides: '8 slides',
      theme: 'Corporate Blue',
      prompt:
        'Create an 8-slide executive investor pitch deck for an Enterprise AI automation platform, covering problem, market size, solution architecture, revenue model, and growth traction.',
    },
    {
      id: 'technical-arch',
      title: 'Technical Architecture',
      category: 'Engineering',
      icon: Cpu,
      slides: '10 slides',
      theme: 'Tech Gradient',
      prompt:
        'Build a 10-slide in-depth technical architecture keynote detailing microservices design, real-time event streaming, database sharding, latency benchmarks, and disaster recovery.',
    },
    {
      id: 'product-launch',
      title: 'Product Launch Keynote',
      category: 'Product & Marketing',
      icon: Rocket,
      slides: '7 slides',
      theme: 'Modern Dark',
      prompt:
        'Generate a 7-slide bold product launch presentation introducing our new AI Slide Studio product with hero features, customer testimonials, competitive advantages, and launch roadmap.',
    },
    {
      id: 'all-hands',
      title: 'Company All-Hands',
      category: 'Internal & Ops',
      icon: Users,
      slides: '6 slides',
      theme: 'Minimal Light',
      prompt:
        'Create a 6-slide quarterly company all-hands deck highlighting team milestones, product releases, financial performance, and key strategic priorities for next quarter.',
    },
    {
      id: 'financial-review',
      title: 'Financial & Metrics Review',
      category: 'Finance',
      icon: LineChart,
      slides: '8 slides',
      theme: 'Editorial',
      prompt:
        'Create an 8-slide financial review presentation detailing gross margin trends, customer acquisition cost metrics, annual recurring revenue milestones, and capital allocation.',
    },
    {
      id: 'loss-management',
      title: 'Loss Management & Audit',
      category: 'Enterprise Risk',
      icon: Shield,
      slides: '8 slides',
      theme: 'Modern Dark',
      prompt:
        'Create an 8-slide executive presentation on Enterprise Loss Management and AI Audit Intelligence detailing system architecture, loss taxonomy, automated verification, and ROI.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif font-medium tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-brand" />
            {t.templates.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t.templates.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl.prompt)}
              className="group relative rounded-2xl bg-card border border-border/80 shadow-md ring-1 ring-border/50 hover:ring-brand/40 hover:border-brand/40 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden p-4 select-none hover:shadow-xl"
            >
              {/* Specular top highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="size-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center group-hover:scale-105 group-hover:bg-brand/20 transition-all">
                    <Icon className="size-4" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono rounded-full bg-secondary/80 border border-border/50 px-2.5">
                    {tpl.slides}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-brand/80 font-semibold uppercase tracking-wider block">
                    {tpl.category}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {tpl.prompt}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground">
                <span className="text-[11px] font-medium text-muted-foreground">{tpl.theme}</span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-brand">
                  {t.templates.useTemplate}
                  <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
