'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoMark } from '@/components/logo';
import { useAuth, ADMIN_EMAIL } from '@/components/auth/auth-provider';
import { useI18n } from '@/components/i18n-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function AuthCard({ mode }: { mode: 'signin' | 'register' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const { user, login, register, loginDemo, loginAdmin } = useAuth();
  const { t } = useI18n();

  const isSignIn = mode === 'signin';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user && !busy) {
      router.replace(next);
    }
  }, [user, busy, next, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      if (isSignIn) {
        await login(email, password);
      } else {
        await register(name || 'Studio Member', email, password);
      }
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = async () => {
    setBusy(true);
    try {
      await loginDemo();
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in as demo user.');
    } finally {
      setBusy(false);
    }
  };

  const handleAdminLogin = async () => {
    setBusy(true);
    try {
      await loginAdmin();
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in as admin.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[440px] px-4">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 -z-10 h-72 w-72 rounded-full bg-brand/20 blur-[90px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 -z-10 h-52 w-52 rounded-full bg-brand/15 blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl bg-card/90 p-8 sm:p-9 text-center shadow-2xl ring-1 ring-border/80 backdrop-blur-2xl"
      >
        {/* Specular top border highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

        {/* Brand Logo with glowing aura */}
        <div className="relative mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-secondary/80 ring-1 ring-border shadow-md">
          <LogoMark className="size-8" />
        </div>

        {/* Segmented Switcher Tabs */}
        <div className="mx-auto mb-6 flex max-w-xs items-center rounded-full bg-secondary/70 p-1 ring-1 ring-border/60 text-xs font-medium">
          <Link
            href={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
            className={cn(
              'flex-1 rounded-full py-1.5 text-center transition-all',
              isSignIn
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.auth.signIn}
          </Link>
          <Link
            href={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
            className={cn(
              'flex-1 rounded-full py-1.5 text-center transition-all',
              !isSignIn
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.auth.createAccount}
          </Link>
        </div>

        {/* Header Title & Subtitle */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mb-6"
          >
            <h1 className="text-2xl font-serif font-medium tracking-tight text-foreground">
              {isSignIn ? t.auth.welcomeBack : t.auth.createTitle}
            </h1>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {isSignIn
                ? t.auth.signInSubtitle
                : t.auth.createSubtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/15 border border-destructive/30 flex items-start gap-2.5 text-xs text-destructive text-left">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {!isSignIn && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium text-foreground/80">
                {t.auth.fullName}
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t.auth.namePlaceholder}
                  className="pl-10 h-10.5 rounded-xl bg-background/50 border-border/80 focus-visible:bg-background focus-visible:ring-brand/40 text-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-foreground/80">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder={t.auth.emailPlaceholder}
                className="pl-10 h-10.5 rounded-xl bg-background/50 border-border/80 focus-visible:bg-background focus-visible:ring-brand/40 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-foreground/80">
              {t.auth.password}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                required
                placeholder={t.auth.passwordPlaceholder}
                className="pl-10 pr-10 h-10.5 rounded-xl bg-background/50 border-border/80 focus-visible:bg-background focus-visible:ring-brand/40 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-95 shadow-lg transition-all mt-2 cursor-pointer"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="size-4 mr-2" />
            )}
            {isSignIn ? t.auth.signInBtn : t.auth.createBtn}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-muted-foreground font-medium">{t.auth.orInstant}</span>
          </div>
        </div>

        {/* Quick Demo & Super Admin Login Buttons */}
        <div className="space-y-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleAdminLogin}
            disabled={busy}
            className="w-full h-11 rounded-full border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-foreground text-xs font-semibold gap-2 transition-all shadow-sm cursor-pointer"
          >
            <ShieldCheck className="size-4 text-amber-500" />
            <span>Sign in as Super Admin</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            disabled={busy}
            className="w-full h-10 rounded-full border-border/70 bg-secondary/50 hover:bg-secondary text-foreground text-xs font-medium gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="size-3.5 text-brand" />
            <span>{t.auth.demoLoginBtn}</span>
          </Button>
        </div>

        <p className="mt-6 text-[11px] text-muted-foreground leading-relaxed">
          {t.auth.terms}
        </p>
      </motion.div>
    </div>
  );
}
