'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { PresentationDocument } from '@ai-slide-studio/shared';
import { useEditorStore } from '@/hooks/useEditorStore';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { ThumbnailList } from '@/components/editor/ThumbnailList';
import { SlideCanvas } from '@/components/editor/SlideCanvas';
import { PropertyPanel } from '@/components/editor/PropertyPanel';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PresentationEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [initialDoc, setInitialDoc] = useState<PresentationDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getPresentation(id);
        if (isMounted) {
          setInitialDoc(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load presentation');
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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading presentation editor...</p>
      </div>
    );
  }

  if (error || !initialDoc) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-6 space-y-4">
        <div className="h-12 w-12 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-foreground">Could not open presentation</h2>
          <p className="text-xs text-muted-foreground max-w-sm">{error || 'Presentation document not found'}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/presentations')}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Presentations
        </Button>
      </div>
    );
  }

  return <EditorMain initialDoc={initialDoc} />;
}

function EditorMain({ initialDoc }: { initialDoc: PresentationDocument }) {
  const router = useRouter();
  const [animationKey, setAnimationKey] = useState(0);
  const [showPropertyPanel, setShowPropertyPanel] = useState(true);

  const editor = useEditorStore(initialDoc);

  const handleReplayAnimation = () => {
    setAnimationKey((prev) => prev + 1);
  };

  const handlePresent = () => {
    router.push(`/presentations/${editor.document.id}/present`);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background select-none">
      {/* Top Toolbar */}
      <EditorToolbar
        document={editor.document}
        saveStatus={editor.saveStatus}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onSaveNow={editor.saveNow}
        onTitleChange={editor.setTitle}
        onReplayAnimation={handleReplayAnimation}
        onImportDocument={(imported) => editor.setDocument(imported)}
        showPropertyPanel={showPropertyPanel}
        onTogglePropertyPanel={() => setShowPropertyPanel((prev) => !prev)}
      />

      {/* Main 3-Panel Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Thumbnails */}
        <ThumbnailList
          slides={editor.document.slides}
          activeSlideIndex={editor.activeSlideIndex}
          onSelectSlide={editor.setActiveSlideIndex}
          onAddSlide={editor.addSlide}
          onDuplicateSlide={editor.duplicateSlide}
          onDeleteSlide={editor.deleteSlide}
          onMoveSlide={editor.moveSlide}
        />

        {/* Center Panel: Slide Canvas */}
        {editor.activeSlide && (
          <SlideCanvas
            key={`${editor.activeSlide.id}-${animationKey}`}
            slide={editor.activeSlide}
            theme={editor.document.theme}
            aspectRatio={editor.document.aspectRatio}
            currentIndex={editor.activeSlideIndex}
            totalSlides={editor.document.slides.length}
            onPrevSlide={() =>
              editor.setActiveSlideIndex(Math.max(0, editor.activeSlideIndex - 1))
            }
            onNextSlide={() =>
              editor.setActiveSlideIndex(
                Math.min(editor.document.slides.length - 1, editor.activeSlideIndex + 1)
              )
            }
            onReplayAnimation={handleReplayAnimation}
            onPresent={handlePresent}
            onSelectAspectRatio={editor.setAspectRatio}
          />
        )}

        {/* Right Panel: Properties */}
        {showPropertyPanel && editor.activeSlide && (
          <PropertyPanel
            slide={editor.activeSlide}
            theme={editor.document.theme}
            presentationId={editor.document.id}
            onUpdateContent={editor.updateSlideContent}
            onReplaceSlide={(newSlide) => editor.replaceSlide(editor.activeSlide!.id, newSlide)}
            onSetLayout={editor.setSlideLayout}
            onSetTheme={editor.setTheme}
            onSetAnimation={editor.setSlideAnimation}
            onSetTransition={editor.setSlideTransition}
            onSetNotes={editor.setSlideNotes}
          />
        )}
      </div>
    </div>
  );
}
