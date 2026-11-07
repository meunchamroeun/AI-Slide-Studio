'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { PresentationDocument } from '@ai-slide-studio/shared';
import { PresentationPlayer } from '@/components/player/PresentationPlayer';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PresentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [document, setDocument] = useState<PresentationDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getPresentation(id);
        if (isMounted) {
          setDocument(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load presentation for player');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs text-white/60 font-mono tracking-wider">Loading Presentation Player...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white p-6 space-y-4">
        <div className="h-12 w-12 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold">Failed to Launch Player</h2>
          <p className="text-xs text-white/60 max-w-sm">{error || 'Presentation document not found'}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/presentations/${id}`)}
          className="text-xs gap-1.5 border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Editor
        </Button>
      </div>
    );
  }

  return (
    <PresentationPlayer
      document={document}
      onClose={() => router.push(`/presentations/${id}`)}
    />
  );
}
