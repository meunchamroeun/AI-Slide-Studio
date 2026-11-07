'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Layers,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Play,
  Monitor,
  LayoutTemplate,
} from 'lucide-react';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { FirstTimeVisitorGuide } from '@/components/site/FirstTimeVisitorGuide';
import { HeroPromptSection } from '@/components/site/HeroPromptSection';
import { SlideShowcaseDemo } from '@/components/site/SlideShowcaseDemo';
import { MarketingFeatures } from '@/components/site/MarketingFeatures';
import { HowItWorks } from '@/components/site/HowItWorks';
import { PricingSection } from '@/components/site/PricingSection';
import { FaqSection } from '@/components/site/FaqSection';
import { QuickTemplates } from '@/components/dashboard/QuickTemplates';
import { PromptGeneratorModal } from '@/components/generator/PromptGeneratorModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { useI18n } from '@/components/i18n-provider';

export default function HomePage() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [heroPrompt, setHeroPrompt] = useState('');

  const handleOpenCreateWithPrompt = (promptText: string = '') => {
    setSelectedPrompt(promptText);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-brand/30 selection:text-brand">
      {/* Public Navigation Header */}
      <SiteHeader onOpenCreate={() => handleOpenCreateWithPrompt('')} />

      <main className="flex-1 pt-14">
        {/* First-time visitor onboarding guide: visible before login on top of the website */}
        {!user && (
          <FirstTimeVisitorGuide
            onSelectSamplePrompt={(sample) => setHeroPrompt(sample)}
            onOpenCreate={handleOpenCreateWithPrompt}
          />
        )}

        {/* Logged in notification banner */}
        {user && (
          <div className="bg-secondary/70 border-b border-border/50 py-2 px-4 text-xs flex items-center justify-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-400" />
            <span className="text-muted-foreground">
              {locale === 'kh' ? 'បានចូលប្រើដោយ' : 'Logged in as'}{' '}
              <strong className="text-foreground font-semibold">{user.name}</strong>
            </span>
            <span className="text-muted-foreground/50">·</span>
            <Link
              href="/dashboard"
              className="text-brand font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>{locale === 'kh' ? 'ចូលទៅស្ទូឌីយោរបស់អ្នក' : 'Go to Studio Dashboard'}</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        )}

        {/* Hero Section with Framer Motion, Specular Spotlight & Prompt Box */}
        <section className="relative pt-10 sm:pt-16 pb-16 overflow-hidden">
          <HeroPromptSection
            onConfigureAndGenerate={handleOpenCreateWithPrompt}
            externalPrompt={heroPrompt}
          />

          {/* Quick Actions / Telemetry Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full text-xs border-border/70 hover:border-brand/50 px-4 h-9 gap-1.5 shadow-sm"
            >
              <Link href="/templates">
                <LayoutTemplate className="size-3.5 text-brand" />
                <span>{t.templates.galleryTitle}</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full text-xs border-border/70 hover:border-brand/50 px-4 h-9 gap-1.5 shadow-sm"
            >
              <Link href="/dashboard">
                <Monitor className="size-3.5 text-brand" />
                <span>{locale === 'kh' ? 'បើកស្ទូឌីយោ Dashboard' : 'Open Studio Dashboard'}</span>
              </Link>
            </Button>
          </div>

          {/* Interactive Slide Stage Demo */}
          <div className="pt-14 sm:pt-16">
            <SlideShowcaseDemo />
          </div>
        </section>

        {/* Feature Grid */}
        <MarketingFeatures />

        {/* Curated Templates Section */}
        <section className="py-20 sm:py-28 border-t border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <QuickTemplates onSelectTemplate={handleOpenCreateWithPrompt} />
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <FaqSection />

        {/* Bottom Call to Action Banner */}
        <section className="py-20 sm:py-24 border-t border-border/50 bg-gradient-to-b from-card/30 to-card/70 relative overflow-hidden text-center">
          <div className="pointer-events-none absolute inset-0 bg-brand/5" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
            className="relative mx-auto max-w-3xl px-4 space-y-6"
          >
            <div className="size-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto border border-brand/20">
              <Sparkles className="size-6" />
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-foreground">
              {locale === 'kh'
                ? 'ត្រៀមខ្លួនបង្កើតបទបង្ហាញបន្ទាប់របស់អ្នក?'
                : 'Ready to build your next presentation?'}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {locale === 'kh'
                ? 'ចាប់ផ្តើមឥឡូវនេះដោយឥតគិតថ្លៃ។ គ្មានកាតឥណទាន។ ទាញយក HTML ប្រើក្រៅបណ្តាញ ១០០%។'
                : 'Generate your first executive keynote deck in seconds. 100% free with the Google Gemini Free Tier.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => handleOpenCreateWithPrompt('')}
                  size="lg"
                  className="rounded-full bg-primary hover:opacity-95 text-primary-foreground font-semibold text-xs sm:text-sm px-6 h-11 shadow-lg gap-2 cursor-pointer"
                >
                  <Sparkles className="size-4 text-brand" />
                  <span>{locale === 'kh' ? 'ចាប់ផ្តើមបង្កើតឥឡូវនេះ' : 'Launch Studio Now'}</span>
                  <ArrowRight className="size-4" />
                </Button>
              </motion.div>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full text-xs sm:text-sm px-6 h-11 border-border/80 hover:bg-accent cursor-pointer"
              >
                <Link href="/login">
                  <span>{locale === 'kh' ? 'ចូលប្រើប្រព័ន្ធ' : 'Sign In with Demo'}</span>
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Public Footer */}
      <SiteFooter />

      {/* Generator Modal */}
      <PromptGeneratorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialPrompt={selectedPrompt}
      />
    </div>
  );
}
