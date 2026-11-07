'use client';

import React, { useState } from 'react';
import { AppShell, AppPage } from '@/components/app/app-shell';
import { PromptGeneratorModal } from '@/components/generator/PromptGeneratorModal';
import { QuickTemplates } from '@/components/dashboard/QuickTemplates';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n-provider';

export default function TemplatesPage() {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const handleSelectTemplate = (promptText: string) => {
    setSelectedPrompt(promptText);
    setIsModalOpen(true);
  };

  return (
    <AppShell onOpenCreate={() => handleSelectTemplate('')}>
      <AppPage
        title={t.nav.templates}
        actions={
          <Button
            size="sm"
            onClick={() => handleSelectTemplate('')}
            className="rounded-full bg-primary text-primary-foreground text-xs font-medium px-3.5 h-8 gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
          >
            <Sparkles className="size-3.5 text-brand" />
            <span className="hidden sm:inline">{t.templates.customPrompt}</span>
            <span className="sm:hidden">{t.common.create}</span>
          </Button>
        }
      >
        <div className="space-y-8 pb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-brand border-brand/30 text-xs rounded-full bg-brand/5">
                {t.templates.preEngineered}
              </Badge>
            </div>
            <h2 className="text-2xl font-serif font-medium tracking-tight text-foreground">
              {t.templates.galleryTitle}
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              {t.templates.gallerySubtitle}
            </p>
          </div>

          <QuickTemplates onSelectTemplate={handleSelectTemplate} />
        </div>
      </AppPage>

      <PromptGeneratorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialPrompt={selectedPrompt}
      />
    </AppShell>
  );
}
