'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, AppPage } from '@/components/app/app-shell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GenerateTabContent } from '@/components/dashboard/GenerateTabContent';
import { QuickTemplates } from '@/components/dashboard/QuickTemplates';
import { RecentPresentations } from '@/components/dashboard/RecentPresentations';
import { PromptGeneratorModal } from '@/components/generator/PromptGeneratorModal';
import { api } from '@/services/api';
import { PresentationDocument } from '@ai-slide-studio/shared';
import { Sparkles, Layers, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n-provider';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [presentations, setPresentations] = useState<PresentationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'generate' | 'presentations' | 'templates'>('generate');
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
    setActiveTab('generate');
  };

  return (
    <AppShell onOpenCreate={() => handleOpenCreateWithPrompt('')}>
      <AppPage
        title={t.nav.dashboard}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleOpenCreateWithPrompt('')}
              className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-4 h-8 gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
            >
              <Sparkles className="size-3.5 text-brand" />
              <span>{t.dashboardTabs?.generateTab || 'Generate AI Presentation'}</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-6 pb-12">
          {/* Main Dashboard Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val: any) => setActiveTab(val)}
            className="w-full space-y-6"
          >
            {/* Tab Navigation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
              <TabsList className="h-11 bg-secondary/60 p-1 rounded-2xl border border-border/70 w-full sm:w-auto">
                <TabsTrigger
                  value="generate"
                  className="rounded-xl px-4 py-2 text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md cursor-pointer flex-1 sm:flex-initial"
                >
                  <Sparkles className="size-3.5 text-brand" />
                  <span>{t.dashboardTabs?.generateTab || 'Generate AI Presentation'}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="presentations"
                  className="rounded-xl px-4 py-2 text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md cursor-pointer flex-1 sm:flex-initial"
                >
                  <Layers className="size-3.5 text-brand" />
                  <span>{t.dashboardTabs?.presentationsTab || 'My Presentations'}</span>
                  {presentations.length > 0 && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-background/50 font-mono">
                      {presentations.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="templates"
                  className="rounded-xl px-4 py-2 text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md cursor-pointer flex-1 sm:flex-initial"
                >
                  <LayoutTemplate className="size-3.5 text-brand" />
                  <span>{t.dashboardTabs?.templatesTab || 'Templates'}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Generate AI Presentation */}
            <TabsContent value="generate" className="mt-0 focus-visible:outline-none">
              <GenerateTabContent
                initialPrompt={selectedPrompt}
                onPresentationCreated={(id) => {
                  fetchPresentations();
                  router.push(`/presentations/${id}`);
                }}
              />
            </TabsContent>

            {/* Tab 2: User Presentations List */}
            <TabsContent value="presentations" className="mt-0 focus-visible:outline-none">
              <RecentPresentations
                initialPresentations={presentations}
                onOpenCreate={() => setActiveTab('generate')}
              />
            </TabsContent>

            {/* Tab 3: Curated Templates Gallery */}
            <TabsContent value="templates" className="mt-0 focus-visible:outline-none">
              <QuickTemplates
                onSelectTemplate={(promptText) => {
                  setSelectedPrompt(promptText);
                  setActiveTab('generate');
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Dialog for Auxiliary Trigger */}
        <PromptGeneratorModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          initialPrompt={selectedPrompt}
        />
      </AppPage>
    </AppShell>
  );
}
