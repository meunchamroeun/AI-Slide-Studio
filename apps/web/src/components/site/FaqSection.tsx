'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useI18n } from '@/components/i18n-provider';
import { cn } from '@/lib/utils';

const easeQuint = [0.16, 1, 0.3, 1] as const;

export function FaqSection() {
  const { locale } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q:
        locale === 'kh'
          ? 'តើឯកសារ HTML ដែលទាញយកអាចបើកបានដោយគ្មានអ៊ីនធឺណិតដែរឬទេ?'
          : 'Can exported HTML presentations run completely offline?',
      a:
        locale === 'kh'
          ? 'បាទ/ចាស! ឯកសារ HTML ដែលនាំចេញរួមបញ្ចូលទាំង CSS, JavaScript, ពុម្ពអក្សរ និងចលនា GSAP ក្នុងឯកសារតែមួយ។ អ្នកអាចផ្ញើតាម Email ឬដាក់ Flash Drive បើកលើកុំព្យូទ័រណាផ្សេងបានដោយមិនបាច់មាន Internet។'
          : 'Yes, 100%. When you download your presentation, SlideStudio produces a single, self-contained HTML file embedding all CSS styles, slide geometries, SVG icons, and GSAP timeline controllers. It requires zero backend servers and opens in any standard modern web browser offline.',
    },
    {
      q:
        locale === 'kh'
          ? 'ហេតុអ្វីបានជាគ្មានការប្រើប្រាស់ Emoji ក្នុងគម្រោងនេះ?'
          : 'Why does SlideStudio enforce a strict zero-emoji policy?',
      a:
        locale === 'kh'
          ? 'SlideStudio ត្រូវបានរចនាឡើងសម្រាប់បទបង្ហាញកម្រិតប្រតិបត្តិ និងសន្និសីទផ្លូវការ។ យើងប្រើតែរូបតំណាង SVG វិជ្ជាជីវៈ និងរចនាបថធរណីមាត្រស្អាតបាត ដើម្បីធានាបាននូវកិត្យានុភាពខ្ពស់បំផុត។'
          : 'Executive keynotes, investor pitch decks, and technical architecture reviews demand pristine visual hierarchy and credibility. Emojis render inconsistently across operating systems and degrade professional aesthetic. We exclusively use Lucide SVG vectors and refined typography.',
    },
    {
      q:
        locale === 'kh'
          ? 'តើមានការគាំទ្រភាសាខ្មែរពេញលេញដែរឬទេ?'
          : 'How does Khmer language support work?',
      a:
        locale === 'kh'
          ? 'យើងបានភ្ជាប់ពុម្ពអក្សរ Noto Sans Khmer ផ្លូវការរបស់ Google Font ធានាការបង្ហាញស្រៈ និងព្យញ្ជនៈត្រឹមត្រូវ ១០០% ដោយគ្មានបញ្ហាជាន់បន្ទាត់។'
          : 'SlideStudio integrates Google Font Noto Sans Khmer alongside Figtree and Merriweather. Complex Khmer diacritics, subscripts, and ligatures render with correct vertical metrics across all slide layouts and fullscreen presentation modes.',
    },
    {
      q:
        locale === 'kh'
          ? 'តើប្រព័ន្ធដំណើរការលើ Google Gemini Free Tier បានទេ?'
          : 'Does SlideStudio work with the Google Gemini Free Tier?',
      a:
        locale === 'kh'
          ? 'ដំណើរការបានយ៉ាងរលូន! NestJS backend ប្រើប្រាស់ SDK ផ្លូវការ @google/genai ជាមួយការកំណត់កូតា និងប្រព័ន្ធជំនួសឆ្លាតវៃ ទោះបីជាគ្មាន API Key ក៏នៅតែអាចបង្កើតស្លាយគំរូបានដែរ។'
          : 'Yes. NestJS utilizes the official @google/genai SDK with optimized token counts and structured schemas that comfortably fit within Google Gemini Free Tier rate limits. If an API key is omitted, it seamlessly provides deterministic high-quality offline presentations.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-t border-border/50 bg-secondary/10 relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeQuint }}
          className="text-center space-y-3 mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/25">
            <Sparkles className="size-3.5" />
            <span>{locale === 'kh' ? 'សំណួរដែលសួរញឹកញាប់' : 'Frequently Asked Questions'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            {locale === 'kh' ? 'អ្វីៗដែលអ្នកគួរដឹងអំពី SlideStudio' : 'Everything you need to know'}
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05, ease: easeQuint }}
                className={cn(
                  'rounded-2xl border transition-colors duration-200 overflow-hidden backdrop-blur-sm',
                  isOpen
                    ? 'border-brand/40 bg-card/80 shadow-md ring-1 ring-brand/10'
                    : 'border-border/60 bg-card/40 hover:border-border hover:bg-card/60'
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-sm sm:text-base font-serif font-medium text-foreground p-5 cursor-pointer select-none"
                >
                  <span>{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: easeQuint }}
                    className="shrink-0 ml-4"
                  >
                    <ChevronDown
                      className={cn(
                        'size-4 text-muted-foreground transition-colors',
                        isOpen && 'text-brand'
                      )}
                    />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: easeQuint }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
