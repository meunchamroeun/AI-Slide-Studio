'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { PromptGeneratorModal } from '@/components/generator/PromptGeneratorModal';
import { QuickTemplates } from '@/components/dashboard/QuickTemplates';
import { LayoutTemplate, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TemplatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const handleSelectTemplate = (promptText: string) => {
    setSelectedPrompt(promptText);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onOpenCreate={() => handleSelectTemplate('')} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Presentation Templates"
          onOpenCreate={() => handleSelectTemplate('')}
        />

        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                Pre-engineered Prompts
              </Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Production Template Gallery
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Select a template below to automatically configure optimal slide counts, themes,
              and executive messaging structures.
            </p>
          </div>

          <QuickTemplates onSelectTemplate={handleSelectTemplate} />
        </main>
      </div>

      <PromptGeneratorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialPrompt={selectedPrompt}
      />
    </div>
  );
}
