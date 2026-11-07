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

interface QuickTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
}

export function QuickTemplates({ onSelectTemplate }: QuickTemplatesProps) {
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
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Curated Templates
          </h3>
          <p className="text-xs text-muted-foreground">
            Kickstart your slides with production-tested outlines and layout hierarchies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <Card
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl.prompt)}
              className="group p-4 bg-card/60 hover:bg-card/90 border-border/70 hover:border-primary/40 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {tpl.slides}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                    {tpl.category}
                  </span>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {tpl.prompt}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground">
                <span className="text-[11px] font-medium">{tpl.theme}</span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                  Use Template
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
