'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { PromptGeneratorHero } from '@/components/dashboard/PromptGeneratorHero';
import { QuickTemplates } from '@/components/dashboard/QuickTemplates';
import { RecentPresentations } from '@/components/dashboard/RecentPresentations';
import { PromptGeneratorModal } from '@/components/generator/PromptGeneratorModal';
import { api } from '@/services/api';
import { PresentationDocument } from '@ai-slide-studio/shared';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
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
    <div className="flex min-h-screen bg-background">
      <Sidebar onOpenCreate={() => handleOpenCreateWithPrompt('')} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Studio Dashboard"
          onOpenCreate={() => handleOpenCreateWithPrompt('')}
        />

        <main className="flex-1 p-6 md:p-8 space-y-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Hero Prompt Input */}
          <PromptGeneratorHero onStartGenerating={handleOpenCreateWithPrompt} />

          {/* Curated Templates */}
          <QuickTemplates onSelectTemplate={handleOpenCreateWithPrompt} />

          {/* Recent Presentations Section */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Loading presentations...</p>
            </div>
          ) : (
            <RecentPresentations
              initialPresentations={presentations}
              onOpenCreate={() => handleOpenCreateWithPrompt('')}
            />
          )}
        </main>
      </div>

      {/* Generator Modal */}
      <PromptGeneratorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialPrompt={selectedPrompt}
      />
    </div>
  );
}
