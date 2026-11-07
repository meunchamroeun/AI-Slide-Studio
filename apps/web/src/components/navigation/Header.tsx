'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Terminal, Globe, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title?: string;
  onOpenCreate?: () => void;
}

export function Header({ title, onOpenCreate }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border/50 bg-card/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-foreground tracking-tight">
          {title || 'AI Slide Studio'}
        </h1>
        <Badge variant="outline" className="text-[11px] font-mono border-primary/30 text-primary">
          v1.0.0 Pro
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/40 border border-border/50 text-xs text-muted-foreground">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span>PostgreSQL &bull; NestJS &bull; Next.js &bull; GSAP</span>
        </div>

        {onOpenCreate && (
          <Button
            size="sm"
            onClick={onOpenCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-md shadow-primary/20"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Presentation
          </Button>
        )}
      </div>
    </header>
  );
}
