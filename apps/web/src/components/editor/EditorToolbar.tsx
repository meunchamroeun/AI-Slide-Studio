'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Undo2,
  Redo2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Play,
  Download,
  FileCode,
  FileText,
  FileUp,
  RotateCcw,
  ChevronLeft,
  Sparkles,
  Sliders,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SaveStatus } from '@/hooks/useEditorStore';
import { PresentationDocument } from '@ai-slide-studio/shared';
import { api } from '@/services/api';
import { useI18n } from '@/components/i18n-provider';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';

interface EditorToolbarProps {
  document: PresentationDocument;
  saveStatus: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSaveNow: () => void;
  onTitleChange: (title: string) => void;
  onReplayAnimation: () => void;
  onImportDocument: (doc: PresentationDocument) => void;
}

export function EditorToolbar({
  document,
  saveStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSaveNow,
  onTitleChange,
  onReplayAnimation,
  onImportDocument,
}: EditorToolbarProps) {
  const router = useRouter();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportHtml = async () => {
    try {
      setIsExporting(true);
      const html = await api.exportHtml(document.id);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_presentation.html`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const blob = await api.exportPdf(document.id);
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_presentation.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`PDF Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(document, null, 2));
    const downloadAnchor = window.document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${document.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
    window.document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.slides && Array.isArray(parsed.slides)) {
          onImportDocument(parsed);
        } else {
          alert('Invalid presentation JSON structure');
        }
      } catch (err) {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    // Reset file input so re-selecting same file triggers change
    e.target.value = '';
  };

  return (
    <header className="h-14 border-b border-border/60 bg-card/70 backdrop-blur-md px-4 flex items-center justify-between z-40 shrink-0">
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* Left: Back + Title + Save indicator */}
      <div className="flex items-center gap-3">
        <Link
          href="/presentations"
          className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title={t.editor.backToPres}
        >
          <ChevronLeft className="size-4" />
        </Link>

        <div className="h-4 w-px bg-border/60" />

        {/* Editable Title */}
        <Input
          value={document.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="h-8 w-60 sm:w-80 font-serif font-medium text-sm bg-transparent border-transparent hover:border-border/60 focus:border-brand/70 rounded-lg px-2"
          placeholder={t.editor.titleField}
        />

        {/* Save Status Badge */}
        <div
          onClick={onSaveNow}
          className="cursor-pointer"
          title="Click to save now"
        >
          {saveStatus === 'saved' && (
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 gap-1 bg-emerald-500/5 rounded-full px-2.5">
              <CheckCircle2 className="size-3" />
              {t.editor.saved}
            </Badge>
          )}
          {saveStatus === 'saving' && (
            <Badge variant="outline" className="text-[10px] text-brand border-brand/30 gap-1 bg-brand/5 rounded-full px-2.5">
              <Loader2 className="size-3 animate-spin" />
              {t.editor.saving}
            </Badge>
          )}
          {saveStatus === 'unsaved' && (
            <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30 gap-1 bg-amber-500/5 rounded-full px-2.5">
              <span className="size-1.5 rounded-full bg-amber-400" />
              {t.editor.unsaved}
            </Badge>
          )}
          {saveStatus === 'error' && (
            <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30 gap-1 bg-destructive/5 rounded-full px-2.5">
              <AlertCircle className="size-3" />
              {t.editor.saveError}
            </Badge>
          )}
        </div>
      </div>

      {/* Center: Undo / Redo / Replay */}
      <div className="flex items-center gap-1 bg-secondary/40 p-1 rounded-full border border-border/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          className="size-7 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-40"
          title={t.editor.undo}
        >
          <Undo2 className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          className="size-7 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-40"
          title={t.editor.redo}
        >
          <Redo2 className="size-3.5" />
        </Button>
        <div className="h-3.5 w-px bg-border/60 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onReplayAnimation}
          className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1 rounded-full cursor-pointer"
          title="Replay slide animations"
        >
          <RotateCcw className="size-3 text-brand" />
          {t.editor.replay}
        </Button>
      </div>

      {/* Right: Toggles + Present & Export actions */}
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />

        <div className="h-4 w-px bg-border/60 mx-0.5" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/presentations/${document.id}/present`)}
          className="h-8 text-xs border-border/80 hover:border-brand/50 text-foreground gap-1.5 rounded-full px-3.5 cursor-pointer"
        >
          <Play className="size-3.5 text-brand" />
          {t.editor.present}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              disabled={isExporting}
              className="h-8 bg-primary hover:opacity-95 text-primary-foreground text-xs font-medium gap-1.5 shadow-md rounded-full px-4 cursor-pointer"
            >
              {isExporting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              {t.editor.export}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 text-xs bg-card border-border/80 p-1.5 shadow-xl rounded-xl">
            <DropdownMenuItem onClick={handleExportHtml} className="cursor-pointer py-2 px-2.5 rounded-lg">
              <FileCode className="mr-2.5 size-4 text-brand shrink-0" />
              <div>
                <p className="font-semibold text-foreground">{t.editor.standaloneHtml}</p>
                <p className="text-[10px] text-muted-foreground">{t.editor.standaloneDesc}</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPdf} className="cursor-pointer py-2 px-2.5 rounded-lg">
              <FileText className="mr-2.5 size-4 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">{t.editor.exportPdf}</p>
                <p className="text-[10px] text-muted-foreground">{t.editor.exportPdfDesc}</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
