'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquareText, Cpu, Download } from 'lucide-react';
import { useI18n } from '@/components/i18n-provider';

export function HowItWorks() {
  const { locale } = useI18n();

  const steps = [
    {
      step: '01',
      icon: MessageSquareText,
      title: locale === 'kh' ? 'បញ្ចូលប្រធានបទ ឬគ្រោង' : 'Input Topic or Prompt',
      desc:
        locale === 'kh'
          ? 'គ្រាន់តែសរសេរប្រធានបទ ជ្រើសរើសចំនួនស្លាយ (៣-៣០) សំនៀង និងទម្រង់ពណ៌ដែលអ្នកចង់បាន។'
          : 'Describe your presentation topic, select slide counts (3-30), target audience profile, and color theme.',
    },
    {
      step: '02',
      icon: Cpu,
      title: locale === 'kh' ? 'AI បង្កើតប្លង់ និងចលនា' : 'AI Synthesizes Slides & Motion',
      desc:
        locale === 'kh'
          ? 'Gemini AI វិភាគ និងរៀបចំរចនាសម្ព័ន្ធទិន្នន័យ JSON ជាមួយចលនា GSAP យ៉ាងត្រឹមត្រូវ។'
          : 'Gemini AI crafts structured slide JSON, balanced typography, and synchronized GSAP timeline animations.',
    },
    {
      step: '03',
      icon: Download,
      title: locale === 'kh' ? 'កែសម្រួល & ទាញយក HTML' : 'Live Edit & Standalone Export',
      desc:
        locale === 'kh'
          ? 'កែប្រែក្នុងស្ទូឌីយោ ៣ ផ្ទាំង បង្ហាញពេញអេក្រង់ ឬទាញយកឯកសារ HTML ប្រើក្រៅបណ្តាញ។'
          : 'Fine-tune in the 3-panel studio, present fullscreen with keyboard controls, or download a 100% offline HTML deck.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-t border-border/50 bg-secondary/15 relative overflow-hidden">
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
            <span>{locale === 'kh' ? 'ដំណើរការងាយស្រួល' : 'Workflow'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground">
            {locale === 'kh' ? 'បង្កើតស្លាយដោយស្វ័យប្រវត្តិក្នុង ៣ ជំហាន' : 'How SlideStudio works'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {locale === 'kh'
              ? 'ពីគំនិតសាមញ្ញទៅជាបទបង្ហាញមានចលនាកម្រិតខ្ពស់ ដោយមិនបាច់ចំណាយពេលរៀបចំប្លង់រាប់ម៉ោង។'
              : 'From a simple text brief to an executive animated deck in under 15 seconds.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Subtle connecting line between steps on desktop */}
          <div className="hidden md:block absolute top-1/2 left-12 right-12 h-px -translate-y-6 bg-gradient-to-r from-brand/20 via-brand/40 to-brand/20 pointer-events-none" />

          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <motion.div
                key={st.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2, ease: 'easeOut' },
                }}
                className="group relative rounded-2xl border border-border/70 bg-card/60 p-8 backdrop-blur-md space-y-4 hover:border-brand/50 hover:bg-card/85 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 group-hover:scale-110 group-hover:bg-brand/20 transition-all duration-300 shadow-sm">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-mono text-3xl font-extrabold text-muted-foreground/25 group-hover:text-brand/40 transition-colors">
                    {st.step}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground tracking-tight group-hover:text-brand transition-colors">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {st.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
