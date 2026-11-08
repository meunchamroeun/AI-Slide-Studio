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
  Send,
  X,
  Phone,
  AtSign,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoMark } from '@/components/logo';
import { useAuth, ADMIN_EMAIL } from '@/components/auth/auth-provider';
import { useI18n } from '@/components/i18n-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { GoogleIcon, TelegramIcon } from '@/components/auth/social-icons';
import { cn } from '@/lib/utils';

export function AuthCard({ mode }: { mode: 'signin' | 'register' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const { user, login, register, loginDemo, loginAdmin, loginGoogle, loginTelegram } = useAuth();
  const { t, locale } = useI18n();

  const isSignIn = mode === 'signin';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals for Google and Telegram login
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const telegramContainerRef = React.useRef<HTMLDivElement>(null);

  // Initialize official Telegram Login Widget when modal opens
  React.useEffect(() => {
    if (!telegramModalOpen) return;

    // Register global Telegram auth callback
    (window as any).onTelegramAuth = (telegramUser: any) => {
      if (telegramUser && telegramUser.id) {
        setBusy(true);
        loginTelegram({
          id: telegramUser.id,
          first_name: telegramUser.first_name || '',
          last_name: telegramUser.last_name || '',
          username: telegramUser.username || '',
          photo_url: telegramUser.photo_url || '',
        })
          .then(() => {
            setTelegramModalOpen(false);
            router.replace(next);
          })
          .catch((err: any) => {
            setError(err?.message || 'Telegram auth failed.');
          })
          .finally(() => {
            setBusy(false);
          });
      }
    };

    // Dynamically inject Telegram widget script for @slide_animationBot
    const timer = setTimeout(() => {
      if (telegramContainerRef.current) {
        telegramContainerRef.current.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', 'slide_animationBot');
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '12');
        script.setAttribute('data-request-access', 'write');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.async = true;
        telegramContainerRef.current.appendChild(script);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      delete (window as any).onTelegramAuth;
    };
  }, [telegramModalOpen, loginTelegram, next, router]);

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

  // Google Sign In Handler
  const handleGoogleSelect = async (account?: { email?: string; name?: string }) => {
    setBusy(true);
    setError(null);
    try {
      await loginGoogle(account);
      setGoogleModalOpen(false);
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Google.');
    } finally {
      setBusy(false);
    }
  };

  // Telegram Sign In Handler
  const handleTelegramAuth = async (usernameInput?: string) => {
    setBusy(true);
    setError(null);
    const chosenUsername = (usernameInput || telegramUsername || 'chamroeun').replace('@', '').trim();

    try {
      await loginTelegram({
        id: Math.floor(100000000 + Math.random() * 900000000),
        first_name: chosenUsername === 'chamroeun' ? 'Chamroeun' : chosenUsername,
        last_name: chosenUsername === 'chamroeun' ? 'Meun' : '',
        username: chosenUsername,
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
      setTelegramModalOpen(false);
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Telegram.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[460px] px-4">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 -z-10 h-72 w-72 rounded-full bg-brand/20 blur-[90px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 -z-10 h-52 w-52 rounded-full bg-brand/15 blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl bg-card/90 p-7 sm:p-9 text-center shadow-2xl ring-1 ring-border/80 backdrop-blur-2xl"
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
            className="mb-5"
          >
            <h1 className="text-2xl font-serif font-medium tracking-tight text-foreground">
              {isSignIn ? t.auth.welcomeBack : t.auth.createTitle}
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {isSignIn ? t.auth.signInSubtitle : t.auth.createSubtitle}
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

        {/* Social Logins: Google & Telegram */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setGoogleModalOpen(true)}
            disabled={busy}
            className="h-11 rounded-2xl border-border/80 bg-background/60 hover:bg-secondary/70 text-foreground text-xs font-semibold gap-2 transition-all shadow-xs cursor-pointer hover:border-brand/40"
          >
            <GoogleIcon className="size-4 shrink-0" />
            <span>Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setTelegramModalOpen(true)}
            disabled={busy}
            className="h-11 rounded-2xl border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-foreground text-xs font-semibold gap-2 transition-all shadow-xs cursor-pointer hover:border-sky-500/60"
          >
            <TelegramIcon className="size-4 shrink-0 text-sky-400" />
            <span>Telegram</span>
          </Button>
        </div>

        {/* Divider with text */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="bg-card px-3 text-muted-foreground font-medium">
              {t.auth.orEmail || 'or continue with email'}
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
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
                  className="pl-10 h-10.5 rounded-xl bg-stone-900 border-border/80 focus-visible:bg-stone-900 focus-visible:ring-brand/40 text-xs text-stone-100 placeholder:text-stone-400"
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
                className="pl-10 h-10.5 rounded-xl bg-stone-900 border-border/80 focus-visible:bg-stone-900 focus-visible:ring-brand/40 text-xs text-stone-100 placeholder:text-stone-400"
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
                className="pl-10 pr-10 h-10.5 rounded-xl bg-stone-900 border-border/80 focus-visible:bg-stone-900 focus-visible:ring-brand/40 text-xs text-stone-100 placeholder:text-stone-400"
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

      {/* Google Sign In Modal */}
      <Dialog open={googleModalOpen} onOpenChange={setGoogleModalOpen}>
        <DialogContent className="max-w-md bg-card border-border/80 text-foreground p-6 rounded-2xl shadow-2xl">
          <DialogHeader className="text-left space-y-1.5 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-secondary/80 border border-border/70 flex items-center justify-center">
                <GoogleIcon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-serif font-medium">
                  {t.auth.googleModalTitle || 'Sign in with Google'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {t.auth.googleModalDesc || 'Select your Google Account to continue to AI Slide Studio'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-3">
            {/* Account Option 1: Chamroeun Meun (Super Admin) */}
            <div
              onClick={() => handleGoogleSelect({ email: ADMIN_EMAIL, name: 'Chamroeun Meun' })}
              className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-background/50 hover:bg-secondary/60 hover:border-brand/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-brand/15 text-brand font-semibold text-xs flex items-center justify-center border border-brand/20">
                  CM
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground group-hover:text-brand transition-colors">
                      Chamroeun Meun
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                      Super Admin
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {ADMIN_EMAIL}
                  </span>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Account Option 2: Alex Morgan */}
            <div
              onClick={() => handleGoogleSelect({ email: 'alex.morgan@gmail.com', name: 'Alex Morgan' })}
              className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-background/50 hover:bg-secondary/60 hover:border-brand/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-secondary text-foreground font-semibold text-xs flex items-center justify-center border border-border">
                  AM
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold text-foreground block group-hover:text-brand transition-colors">
                    Alex Morgan
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    alex.morgan@gmail.com
                  </span>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Custom Google Account Input */}
            <div className="pt-2 border-t border-border/50 space-y-2.5">
              <label className="text-xs font-medium text-foreground block text-left">
                {locale === 'kh' ? 'ឬប្រើគណនី Google ផ្សេងទៀត' : 'Or enter another Google account:'}
              </label>
              <Input
                type="email"
                value={customGoogleEmail}
                onChange={(e) => setCustomGoogleEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="h-9.5 text-xs bg-stone-900 border-border/80 text-stone-100 placeholder:text-stone-400 rounded-xl"
              />
              <Button
                type="button"
                disabled={!customGoogleEmail.trim()}
                onClick={() =>
                  handleGoogleSelect({
                    email: customGoogleEmail.trim(),
                    name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
                  })
                }
                className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <span>{locale === 'kh' ? 'បន្តជាមួយគណនីនេះ' : 'Continue with this Google account'}</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Telegram Sign In Modal */}
      <Dialog open={telegramModalOpen} onOpenChange={setTelegramModalOpen}>
        <DialogContent className="max-w-md bg-card border-border/80 text-foreground p-6 rounded-2xl shadow-2xl">
          <DialogHeader className="text-left space-y-1.5 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <TelegramIcon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-serif font-medium">
                  {t.auth.telegramModalTitle || 'Sign in with Telegram'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {t.auth.telegramModalDesc || 'Connect and authorize securely with @slide_animationBot'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-3">
            {/* Official Bot Info Card & Direct Launch Link */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 text-left">
                <div className="size-8.5 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <TelegramIcon className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">
                      @slide_animationBot
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-sky-500/15 text-sky-400 border-sky-500/30">
                      Official
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {t.auth.telegramBotLabel || 'Official Authentication Bot'}
                  </span>
                </div>
              </div>
              <a
                href="https://t.me/slide_animationBot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>{locale === 'kh' ? 'បើក Bot' : 'Open Bot'}</span>
                <ExternalLink className="size-3" />
              </a>
            </div>

            {/* Quick 1-Click Telegram Profile */}
            <div
              onClick={() => handleTelegramAuth('chamroeun')}
              className="flex items-center justify-between p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/15 hover:border-sky-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-sky-500/20 text-sky-400 font-semibold text-xs flex items-center justify-center border border-sky-500/30">
                  <TelegramIcon className="size-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground group-hover:text-sky-400 transition-colors">
                      Chamroeun Meun
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/30">
                      Super Admin
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    @chamroeun
                  </span>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Custom Telegram Username / Phone Input */}
            <div className="pt-2 border-t border-border/50 space-y-2">
              <label className="text-xs font-medium text-foreground block text-left">
                {locale === 'kh' ? 'ឬបញ្ចូលឈ្មោះគណនី Telegram របស់អ្នក' : 'Or enter your Telegram @username:'}
              </label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
                <Input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  placeholder={t.auth.telegramUsernamePlaceholder || 'e.g. chamroeun or phone number'}
                  className="pl-9 h-9.5 text-xs bg-stone-900 border-border/80 text-stone-100 placeholder:text-stone-400 rounded-xl"
                />
              </div>

              <Button
                type="button"
                disabled={!telegramUsername.trim()}
                onClick={() => handleTelegramAuth()}
                className="w-full h-9 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-md shadow-sky-500/20"
              >
                <Send className="size-3.5" />
                <span>{t.auth.telegramAuthorizeBtn || 'Authorize with Telegram'}</span>
              </Button>
            </div>

            {/* Telegram Official Widget Container (Optional Web Widget) */}
            <div className="pt-2 border-t border-border/40 text-center">
              <div ref={telegramContainerRef} className="min-h-[40px] flex items-center justify-center overflow-hidden" />
              <p className="text-[10px] text-muted-foreground/80 mt-1">
                {locale === 'kh'
                  ? 'ភ្ជាប់ domain តាមរយៈ @BotFather ដោយប្រើពាក្យបញ្ជា /setdomain ទៅកាន់ slide.ice-tea.me'
                  : 'Link domain in @BotFather via /setdomain to slide.ice-tea.me'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
