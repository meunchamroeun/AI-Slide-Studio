'use client';

import React, { useState, useEffect } from 'react';
import { AppShell, AppPage } from '@/components/app/app-shell';
import { RecentPresentations } from '@/components/dashboard/RecentPresentations';
import { PromptGeneratorModal } from '@/components/generator/PromptGeneratorModal';
import { api } from '@/services/api';
import { PresentationDocument } from '@ai-slide-studio/shared';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n-provider';

export default function PresentationsPage() {
  const { t } = useI18n();
  const [presentations, setPresentations] = useState<PresentationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <AppShell onOpenCreate={() => setIsModalOpen(true)}>
      <AppPage
        title={t.nav.presentations}
        actions={
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-primary text-primary-foreground text-xs font-medium px-3.5 h-8 gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
          >
            <Sparkles className="size-3.5 text-brand" />
            <span className="hidden sm:inline">{t.nav.newPresentation}</span>
            <span className="sm:hidden">{t.common.create}</span>
          </Button>
        }
      >
        <div className="space-y-6 pb-12">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-6 w-6 text-brand animate-spin" />
              <p className="text-xs text-muted-foreground">Loading presentation catalog...</p>
            </div>
          ) : (
            <RecentPresentations
              initialPresentations={presentations}
              onOpenCreate={() => setIsModalOpen(true)}
            />
          )}
        </div>
      </AppPage>

      <PromptGeneratorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </AppShell>
  );
}
