'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Presentation,
  LayoutTemplate,
  Settings,
  PlusCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onOpenCreate?: () => void;
}

export function Sidebar({ onOpenCreate }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'My Presentations', href: '/presentations', icon: Presentation },
    { name: 'Templates', href: '/templates', icon: LayoutTemplate },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-card/60 backdrop-blur-xl border-r border-border flex flex-col justify-between shrink-0 sticky top-0">
      <div>
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-border/50">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-foreground block text-sm">
              SlideStudio<span className="text-primary">.ai</span>
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Pro Studio
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <Button
            onClick={onOpenCreate}
            className="w-full bg-gradient-to-r from-primary via-indigo-500 to-accent hover:opacity-95 text-primary-foreground shadow-lg shadow-primary/25 font-medium transition-all duration-200"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Presentation
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/50">
        <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Gemini GenAI Engine</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Fast structured generation with GSAP dynamic timeline orchestration.
          </p>
        </div>
      </div>
    </aside>
  );
}
