'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Layout,
  FileCode,
  Languages,
  Moon,
} from 'lucide-react';
import { useI18n } from '@/components/i18n-provider';

export function MarketingFeatures() {
  const { locale } = useI18n();

  const features = [
    {
      icon: Sparkles,
      title: locale === 'kh' ? 'Google Gemini AI ផ្លូវការ' : 'Official Google Gemini AI',
      desc:
        locale === 'kh'
          ? 'ប្រើប្រាស់ SDK ផ្លូវការ @google/genai ជាមួយការបញ្ចេញទិន្នន័យ Structured JSON ដោយសុវត្ថិភាព។'
          : 'Integrated via server-side @google/genai SDK with strict JSON validation and deterministic offline fallback.',
    },
    {
      icon: Zap,
      title: locale === 'kh' ? 'ម៉ាស៊ីនចលនា GSAP 3.12' : 'GSAP 3.12 Motion Engine',
      desc:
        locale === 'kh'
          ? 'ចលនាអក្សរវាយអង្គុលីលេខ រាប់លេខទិន្នន័យ និងរំកិលស្លាយយ៉ាងរលូន ដោយគ្មានការលេចធ្លាយអង្គចងចាំ។'
          : 'High-performance typewriter reveals, metric count-ups, and staggered element entrances with automatic timeline cleanup.',
    },
    {
      icon: Layout,
      title: locale === 'kh' ? '១០ ទម្រង់ប្លង់កម្រិតខ្ពស់' : '10 Executive Layouts',
      desc:
        locale === 'kh'
          ? 'គាំទ្រស្លាយក្របមុខ មាតិកាពីរជួរ ស្ថិតិលេខ ការប្រៀបធៀប និងសម្រង់សម្តីយ៉ាងមានរបៀប។'
          : 'Pre-engineered Cover, Statistics, Comparison, Timeline, Quote, and Key Takeaway layouts built for high-stakes presentations.',
    },
    {
      icon: FileCode,
      title: locale === 'kh' ? 'ទាញយក HTML ប្រើក្រៅបណ្តាញ' : '100% Offline HTML Export',
      desc:
        locale === 'kh'
          ? 'ទាញយកជាឯកសារ HTML តែមួយ រួមបញ្ចូល CSS និង JavaScript ដោយមិនចាំបាច់មានអ៊ីនធឺណិត។'
          : 'Generates single-file standalone HTML decks with embedded styles, responsive fit-scale, and offline presentation controls.',
    },
    {
      icon: Languages,
      title: locale === 'kh' ? 'គាំទ្រភាសាខ្មែរ & អង់គ្លេស' : 'Bilingual EN & Khmer',
      desc:
        locale === 'kh'
          ? 'រចនាឡើងជាមួយពុម្ពអក្សរ Noto Sans Khmer ផ្តល់ភាពស្រស់ស្អាតលើគ្រប់ឧបករណ៍។'
          : 'First-class Khmer and English typography using Noto Sans Khmer with instant runtime locale switching.',
    },
    {
      icon: Moon,
      title: locale === 'kh' ? 'ទម្រង់ពន្លឺ & ងងឹត' : 'Stone Dark & Light Themes',
      desc:
        locale === 'kh'
          ? 'រចនាបទស្អាតបាតកម្រិត SaaS ជាមួយពណ៌ Stone #0f0d0c និង #fafaf9 ដោយគ្មាន Emoji។'
          : 'Precision dark charcoal and warm stone light palettes with subtle specular gradients and guaranteed zero emojis.',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 border-t border-border/50 relative overflow-hidden">
      {/* Subtle ambient light */}
      <div className="pointer-events-none absolute -top-40 right-10 size-80 bg-brand/10 rounded-full blur-[100px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto space-y-3 mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/25 shadow-xs">
            <Sparkles className="size-3.5" />
            <span>{locale === 'kh' ? 'សមត្ថភាពស្នូល' : 'Core Capabilities'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground">
            {locale === 'kh'
              ? 'រចនាឡើងសម្រាប់បទបង្ហាញកម្រិតវិជ្ជាជីវៈ'
              : 'Engineered for executive presentations'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {locale === 'kh'
              ? 'បច្ចេកវិទ្យា AI ទំនើប រួមបញ្ចូលជាមួយម៉ាស៊ីនចលនា GSAP និងប្រព័ន្ធនាំចេញឯករាជ្យ។'
              : 'Combining structured generative AI intelligence with browser-native GSAP timeline motion and zero-dependency exports.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2, ease: 'easeOut' },
                }}
                className="group relative rounded-2xl border border-border/60 bg-card/45 p-7 backdrop-blur-md transition-all duration-300 hover:border-brand/50 hover:bg-card/75 hover:shadow-2xl hover:shadow-brand/5 cursor-default overflow-hidden"
              >
                {/* Top specular shimmer */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="size-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-5 border border-brand/20 group-hover:scale-110 group-hover:bg-brand/20 transition-all duration-300 shadow-sm">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2.5 tracking-tight group-hover:text-brand transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
