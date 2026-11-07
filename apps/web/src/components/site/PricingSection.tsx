'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n-provider';

const easeQuint = [0.16, 1, 0.3, 1] as const;

export function PricingSection() {
  const { locale } = useI18n();

  return (
    <section id="pricing" className="py-20 sm:py-28 border-t border-border/50 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: easeQuint }}
          className="text-center max-w-2xl mx-auto space-y-3 mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/25">
            <Sparkles className="size-3.5" />
            <span>{locale === 'kh' ? 'គម្រោងតម្លៃ' : 'Transparent Pricing'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground">
            {locale === 'kh' ? 'សាកល្បងឥតគិតថ្លៃ គ្មានលាក់កំបាំង' : 'Start free. Upgrade as you scale.'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {locale === 'kh'
              ? 'គាំទ្រ Google Gemini Free Tier ពេញលេញ ជាមួយការទាញយក HTML មិនគិតថ្លៃបន្ថែម។'
              : 'Built to support the Google Gemini Free Tier with zero runtime licensing fees.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Starter Plan */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5, ease: easeQuint }}
            className="rounded-3xl border border-border/70 bg-card/50 p-8 backdrop-blur-md space-y-6 flex flex-col justify-between hover:border-border transition-colors shadow-lg"
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  {locale === 'kh' ? 'គម្រោងឥតគិតថ្លៃ' : 'Community Studio'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {locale === 'kh'
                    ? 'សម្រាប់បុគ្គល និងសហគ្រិនដែលត្រូវការបទបង្ហាញរហ័ស'
                    : 'For engineers, consultants, and founders building high-impact decks.'}
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
                  $0
                </span>
                <span className="text-xs text-muted-foreground">/ forever</span>
              </div>

              <ul className="space-y-2.5 pt-4 text-xs text-muted-foreground border-t border-border/50">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>Google Gemini Free Tier (@google/genai)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>10 Executive Presentation Layouts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>GSAP 3.12 Animation Timelines & Transitions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>100% Offline Single-File HTML Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>Bilingual EN & Khmer (Noto Sans Khmer)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>Guaranteed Zero Emojis Executive Standard</span>
                </li>
              </ul>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                className="w-full rounded-full bg-primary hover:opacity-95 text-primary-foreground font-semibold text-xs h-10 shadow-md cursor-pointer"
              >
                <Link href="/login">
                  <span>{locale === 'kh' ? 'ចាប់ផ្តើមឥឡូវនេះ' : 'Get Started Free'}</span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Pro Studio Plan */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5, delay: 0.1, ease: easeQuint }}
            className="relative rounded-3xl border-2 border-brand/60 bg-card/80 p-8 shadow-2xl backdrop-blur-md space-y-6 flex flex-col justify-between"
          >
            <div className="absolute -top-3.5 right-6">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono uppercase bg-brand text-stone-950 shadow-md">
                RECOMMENDED
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                  <span>{locale === 'kh' ? 'គម្រោងអាជីវកម្ម Pro' : 'Enterprise Studio'}</span>
                  <Sparkles className="size-4 text-brand" />
                </h3>
                <p className="text-xs text-muted-foreground">
                  {locale === 'kh'
                    ? 'សម្រាប់ស្ថាប័នធំៗដែលត្រូវការល្បឿន និងសមត្ថភាពគ្មានដែនកំណត់'
                    : 'For teams, executives, and organizations delivering mission-critical keynotes.'}
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
                  $29
                </span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>

              <ul className="space-y-2.5 pt-4 text-xs text-foreground/90 border-t border-border/50">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>Everything in Community Studio, plus:</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>Unlimited AI Presentations & Slide Regeneration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>Custom Corporate Brand Kits & Typography</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>Bulk Project JSON Import & Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>High-Resolution Vector SVG Asset Extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-brand shrink-0" />
                  <span>Dedicated Low-Latency Gemini Enterprise Endpoints</span>
                </li>
              </ul>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                className="w-full rounded-full bg-brand hover:opacity-95 text-stone-950 font-semibold text-xs h-10 shadow-lg shadow-brand/20 cursor-pointer"
              >
                <Link href="/login">
                  <span>{locale === 'kh' ? 'សាកល្បង Pro រយៈពេល ១៤ ថ្ងៃ' : 'Start 14-Day Pro Trial'}</span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
