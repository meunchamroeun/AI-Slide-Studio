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
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          title="Back to Presentations"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        <div className="h-4 w-px bg-border/60" />

        {/* Editable Title */}
        <Input
          value={document.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="h-8 w-60 sm:w-80 font-semibold text-sm bg-transparent border-transparent hover:border-border/60 focus:border-primary px-2"
          placeholder="Presentation Title"
        />

        {/* Save Status Badge */}
        <div
          onClick={onSaveNow}
          className="cursor-pointer"
          title="Click to save now"
        >
          {saveStatus === 'saved' && (
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 gap-1 bg-emerald-500/5">
              <CheckCircle2 className="h-3 w-3" />
              Saved
            </Badge>
          )}
          {saveStatus === 'saving' && (
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30 gap-1 bg-primary/5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          )}
          {saveStatus === 'unsaved' && (
            <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30 gap-1 bg-amber-500/5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Unsaved
            </Badge>
          )}
          {saveStatus === 'error' && (
            <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30 gap-1 bg-destructive/5">
              <AlertCircle className="h-3 w-3" />
              Save Error
            </Badge>
          )}
        </div>
      </div>

      {/* Center: Undo / Redo / Replay */}
      <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-lg border border-border/40">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-40"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-40"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </Button>
        <div className="h-3.5 w-px bg-border/60 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onReplayAnimation}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          title="Replay slide animations"
        >
          <RotateCcw className="h-3 w-3" />
          Replay
        </Button>
      </div>

      {/* Right: Present & Export actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/presentations/${document.id}/present`)}
          className="h-8 text-xs border-border/70 hover:border-primary/50 text-foreground gap-1.5"
        >
          <Play className="h-3.5 w-3.5 text-primary" />
          Present
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              disabled={isExporting}
              className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium gap-1.5 shadow-md shadow-primary/20"
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs">
            <DropdownMenuItem onClick={handleExportHtml} className="cursor-pointer">
              <FileCode className="mr-2 h-4 w-4 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Standalone HTML</p>
                <p className="text-[10px] text-muted-foreground">Self-contained offline presentation</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJson} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">Project JSON</p>
                <p className="text-[10px] text-muted-foreground">Raw slide document backup</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer"
            >
              <FileUp className="mr-2 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">Import JSON</p>
                <p className="text-[10px] text-muted-foreground">Restore from presentation JSON</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
