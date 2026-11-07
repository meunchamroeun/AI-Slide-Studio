'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { RecentPresentations } from '@/components/dashboard/RecentPresentations';
import { PromptGeneratorModal } from '@/components/generator/PromptGeneratorModal';
import { api } from '@/services/api';
import { PresentationDocument } from '@ai-slide-studio/shared';
import { Loader2 } from 'lucide-react';

export default function PresentationsPage() {
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
    <div className="flex min-h-screen bg-background">
      <Sidebar onOpenCreate={() => setIsModalOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="My Presentations"
          onOpenCreate={() => setIsModalOpen(true)}
        />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Loading presentation catalog...</p>
            </div>
          ) : (
            <RecentPresentations
              initialPresentations={presentations}
              onOpenCreate={() => setIsModalOpen(true)}
            />
          )}
        </main>
      </div>

      <PromptGeneratorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
