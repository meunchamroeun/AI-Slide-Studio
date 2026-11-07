'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Presentation,
  LayoutTemplate,
  Settings,
  PanelLeft,
  X,
  ChevronsUpDown,
  LogOut,
  UserRound,
  Shield,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  Zap,
  Globe,
  Bell,
  Check,
  ChevronRight,
} from 'lucide-react';
import { LogoMark } from '@/components/logo';
import { useAuth, User } from '@/components/auth/auth-provider';
import { useI18n } from '@/components/i18n-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type ShellState = {
  collapsed: boolean;
  toggle: () => void;
  openCreateModal: () => void;
};

const ShellContext = createContext<ShellState | null>(null);
const COLLAPSED_KEY = 'slidestudio:sidebar-collapsed';

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used inside <AppShell>');
  return ctx;
}

interface AppShellProps {
  children: React.ReactNode;
  onOpenCreate?: () => void;
}

export function AppShell({ children, onOpenCreate }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1');
    } catch {}
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggle = useCallback(() => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      return setMobileOpen((o) => !o);
    }
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, c ? '0' : '1');
      } catch {}
      return !c;
    });
  }, []);

  const openCreateModal = useCallback(() => {
    if (onOpenCreate) onOpenCreate();
  }, [onOpenCreate]);

  return (
    <ShellContext.Provider value={{ collapsed, toggle, openCreateModal }}>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar border-r border-border/70 transition-[width] duration-200 md:flex z-30',
            collapsed ? 'w-[64px]' : 'w-[230px]'
          )}
        >
          <SidebarContent collapsed={collapsed} onOpenCreate={openCreateModal} />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              aria-label="Close"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 flex w-[264px] flex-col bg-sidebar border-r border-border/80 shadow-2xl z-50">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="absolute top-3.5 right-3.5 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
              <SidebarContent collapsed={false} onOpenCreate={openCreateModal} />
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </ShellContext.Provider>
  );
}

function SidebarContent({
  collapsed,
  onOpenCreate,
}: {
  collapsed: boolean;
  onOpenCreate: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useI18n();

  const sections = [
    {
      label: t.nav.studio,
      items: [
        { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
        { href: '/presentations', label: t.nav.presentations, icon: Presentation },
        { href: '/templates', label: t.nav.templates, icon: LayoutTemplate },
      ],
    },
    {
      label: t.nav.platform,
      items: [
        { href: '/settings', label: t.nav.settings, icon: Settings },
      ],
    },
    ...(user?.role === 'admin'
      ? [
          {
            label: 'Administration',
            items: [
              { href: '/admin', label: 'Admin Console', icon: ShieldCheck },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col justify-between h-full overflow-hidden select-none">
      <div>
        {/* Brand Header */}
        <Link
          href="/"
          className={cn(
            'flex h-14 shrink-0 items-center gap-2.5 font-serif text-base font-medium border-b border-border/50 transition-colors',
            collapsed ? 'justify-center' : 'px-4'
          )}
        >
          <LogoMark className="size-6 text-brand" />
          {!collapsed && (
            <span className="truncate">
              SlideStudio<span className="text-brand">.ai</span>
            </span>
          )}
        </Link>

        {/* Create Presentation Action Button */}
        <div className="p-3">
          <Button
            onClick={onOpenCreate}
            title={collapsed ? t.nav.createPresentation : undefined}
            className={cn(
              'rounded-full bg-primary text-primary-foreground font-medium text-xs shadow-md transition-all duration-200 cursor-pointer',
              collapsed ? 'w-10 h-10 p-0 justify-center mx-auto flex' : 'w-full h-9 justify-start px-3'
            )}
          >
            <PlusCircle className={cn('size-4 shrink-0', !collapsed && 'mr-2 text-brand')} />
            {!collapsed && t.nav.createPresentation}
          </Button>
        </div>

        {/* Navigation Sections */}
        <nav className="overflow-y-auto px-2 space-y-4 pt-1">
          {sections.map((sec) => (
            <div key={sec.label}>
              {!collapsed && (
                <p className="px-3 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {sec.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {sec.items.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        title={collapsed ? label : undefined}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-colors',
                          collapsed && 'justify-center px-0',
                          active
                            ? 'bg-accent font-medium text-foreground ring-1 ring-border/70'
                            : 'text-foreground/80 hover:bg-accent/60 hover:text-foreground'
                        )}
                      >
                        <Icon className={cn('size-4 shrink-0', active ? 'text-brand' : 'text-muted-foreground')} />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Area: Credits & User Card */}
      <div className="space-y-2 p-2.5 border-t border-border/50 bg-sidebar/50">
        <CreditsPill compact={collapsed} />
        <UserCard collapsed={collapsed} />
      </div>
    </div>
  );
}

/** Credit ring displaying usage quota */
function CreditRing() {
  const r = 6;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0 -rotate-90 text-brand" aria-hidden>
      <circle
        cx="8"
        cy="8"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2.5"
      />
      <circle
        cx="8"
        cy="8"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray={c}
        strokeDashoffset={c * 0.15}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CreditsPill({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const label = t.nav.unlimitedPro;
  return (
    <div
      title={label}
      className={cn(
        'flex items-center gap-2 rounded-full bg-accent/60 px-3 py-1.5 text-xs text-muted-foreground border border-border/40',
        compact && 'justify-center px-0'
      )}
    >
      <CreditRing />
      {!compact && <span className="truncate text-[11px] font-medium text-foreground">{label}</span>}
    </div>
  );
}

function Avatar({
  name,
  url,
  className,
}: {
  name: string;
  url: string | null;
  className?: string;
}) {
  const initials = name
    .split(' ')
    .map((s) => [...s][0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/20 text-brand text-xs font-semibold ring-1 ring-border',
        className
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="size-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        initials || 'U'
      )}
    </span>
  );
}

function UserCard({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          'flex w-full items-center gap-2 rounded-xl p-2 text-xs font-medium text-brand bg-brand/10 hover:bg-brand/20 transition-colors',
          collapsed ? 'justify-center' : 'px-3'
        )}
      >
        <UserRound className="size-4 shrink-0" />
        {!collapsed && <span>{t.common.signIn}</span>}
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left outline-none hover:bg-accent/60 transition-colors focus-visible:ring-1 focus-visible:ring-ring cursor-pointer',
            collapsed && 'justify-center'
          )}
        >
          <Avatar name={user.name} url={user.avatar_url} className="size-7" />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 truncate text-xs font-medium text-foreground">
                  <span className="truncate">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      ADMIN
                    </span>
                  )}
                </span>
                {user.email && (
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {user.email}
                  </span>
                )}
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={8} className="w-56 text-xs bg-card border-border/80">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar name={user.name} url={user.avatar_url} className="size-8" />
          <div className="min-w-0">
            <span className="block truncate text-xs font-medium text-foreground">{user.name}</span>
            {user.email && (
              <span className="block truncate text-[11px] text-muted-foreground">{user.email}</span>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        {user.role === 'admin' && (
          <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer text-amber-400 focus:text-amber-300">
            <ShieldCheck className="mr-2 size-3.5 text-amber-500" />
            <span>Admin Console</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
          <Settings className="mr-2 size-3.5 text-muted-foreground" />
          {t.settings.title}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/presentations')} className="cursor-pointer">
          <Presentation className="mr-2 size-3.5 text-muted-foreground" />
          {t.nav.presentations}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-3.5" />
          {t.common.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Top page header component for studio views.
 */
export function AppPage({
  title,
  actions,
  children,
  className,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const { toggle } = useShell();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-md">
        <button
          onClick={toggle}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground cursor-pointer"
        >
          <PanelLeft className="size-4" />
        </button>
        <span className="h-4 w-px bg-border/60" />
        <h1 className="min-w-0 flex-1 truncate font-serif text-base font-medium text-foreground tracking-tight">
          {title}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <div className="flex items-center gap-1 pl-1 border-l border-border/60">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className={cn('w-full flex-1 px-4 py-5 sm:px-6 max-w-7xl mx-auto', className)}>
        {children}
      </main>
    </>
  );
}
