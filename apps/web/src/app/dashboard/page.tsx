'use client';

import React, { useState, useEffect } from 'react';
import { AppShell, AppPage } from '@/components/app/app-shell';
import { PromptGeneratorHero } from '@/components/dashboard/PromptGeneratorHero';
import { QuickTemplates } from '@/components/dashboard/QuickTemplates';
import { RecentPresentations } from '@/components/dashboard/RecentPresentations';
import { PromptGeneratorModal } from '@/components/generator/PromptGeneratorModal';
import { api } from '@/services/api';
import { PresentationDocument } from '@ai-slide-studio/shared';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n-provider';

export default function DashboardPage() {
  const { t } = useI18n();
  const [presentations, setPresentations] = useState<PresentationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const fetchPresentations = async () => {
    try {
      setLoading(true);
      const res = await api.getPresentations();
      setPresentations(res);
    } catch (err) {
      console.error('Failed to load presentations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  const handleOpenCreateWithPrompt = (promptText: string) => {
    setSelectedPrompt(promptText);
    setIsModalOpen(true);
  };

  return (
    <AppShell onOpenCreate={() => handleOpenCreateWithPrompt('')}>
      <AppPage
        title={t.nav.dashboard}
        actions={
          <Button
            size="sm"
            onClick={() => handleOpenCreateWithPrompt('')}
            className="rounded-full bg-primary text-primary-foreground text-xs font-medium px-3.5 h-8 gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
          >
            <Sparkles className="size-3.5 text-brand" />
            <span className="hidden sm:inline">{t.nav.newPresentation}</span>
            <span className="sm:hidden">{t.common.create}</span>
          </Button>
        }
      >
        <div className="space-y-10 pb-12">
          {/* Hero Prompt Input */}
          <PromptGeneratorHero onStartGenerating={handleOpenCreateWithPrompt} />

          {/* Curated Templates Gallery */}
          <QuickTemplates onSelectTemplate={handleOpenCreateWithPrompt} />

          {/* User Presentations List */}
          <RecentPresentations
            initialPresentations={presentations}
            onOpenCreate={() => handleOpenCreateWithPrompt('')}
          />
        </div>

        {/* Modal Dialog for Configuration & Generation */}
        <PromptGeneratorModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          initialPrompt={selectedPrompt}
        />
      </AppPage>
    </AppShell>
  );
}
