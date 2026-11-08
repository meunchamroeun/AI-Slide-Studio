'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Presentation as PresentationIcon,
  Search,
  MoreVertical,
  Copy,
  Trash2,
  ExternalLink,
  Layers,
  Calendar,
  Sparkles,
  Download,
  FileCode,
  FileText,
  Play,
} from 'lucide-react';
import { PresentationDocument } from '@ai-slide-studio/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/services/api';
import { useI18n } from '@/components/i18n-provider';

interface RecentPresentationsProps {
  initialPresentations: PresentationDocument[];
  onOpenCreate?: () => void;
}

export function RecentPresentations({
  initialPresentations,
  onOpenCreate,
}: RecentPresentationsProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [presentations, setPresentations] = useState<PresentationDocument[]>(initialPresentations);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state if initialPresentations changes
  React.useEffect(() => {
    setPresentations(initialPresentations);
  }, [initialPresentations]);

  const filtered = presentations.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.theme && p.theme.toLowerCase().includes(query))
    );
  });

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const duplicated = await api.duplicatePresentation(id);
      setPresentations([duplicated, ...presentations]);
    } catch (err: any) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this presentation?')) return;
    try {
      await api.deletePresentation(id);
      setPresentations(presentations.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleExportHtml = async (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const html = await api.exportHtml(id);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_presentation.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleExportPdf = async (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const blob = await api.exportPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_presentation.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`PDF Export failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-medium tracking-tight text-foreground flex items-center gap-2">
            <PresentationIcon className="size-5 text-brand" />
            {t.presentations.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t.presentations.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.presentations.searchPlaceholder}
              className="pl-9 h-9 text-xs bg-card border-border/80 text-foreground placeholder:text-muted-foreground dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-400 rounded-full focus-visible:ring-brand/40"
            />
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
          <div className="mx-auto size-12 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground ring-1 ring-border/60">
            <PresentationIcon className="size-6 text-brand/80" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-semibold text-foreground">
              {searchQuery ? t.presentations.noMatching : t.presentations.noPresentations}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {searchQuery
                ? t.presentations.emptySearchDesc
                : t.presentations.emptyDesc}
            </p>
          </div>
          {onOpenCreate && !searchQuery && (
            <Button
              size="sm"
              onClick={onOpenCreate}
              className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-4 h-8 gap-1.5 shadow-md hover:opacity-95 cursor-pointer"
            >
              <Sparkles className="size-3.5 text-brand" />
              {t.presentations.createWithAI}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const firstSlide = item.slides?.[0];
            const slideCount = item.slides?.length || 0;
            const formattedDate = new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString(
              undefined,
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }
            );

            return (
              <div
                key={item.id}
                onClick={() => router.push(`/presentations/${item.id}`)}
                className="group relative rounded-2xl border border-border/80 bg-card shadow-md ring-1 ring-border/50 hover:ring-brand/40 hover:border-brand/40 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer select-none hover:shadow-xl"
              >
                {/* Specular top highlight */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

                {/* Visual Thumbnail / Card Top */}
                <div className="relative h-40 w-full bg-gradient-to-br from-card via-sidebar/50 to-background border-b border-border/40 p-4 flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between z-10">
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase font-mono tracking-wider border-border/80 bg-background/70 backdrop-blur-sm rounded-full px-2.5"
                    >
                      {item.theme} &bull; {item.aspectRatio}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/presentations/${item.id}/present`);
                        }}
                        className="size-7 text-muted-foreground hover:text-foreground bg-background/60 hover:bg-background backdrop-blur-sm rounded-full"
                        title="Present Fullscreen"
                      >
                        <Play className="size-3.5 text-brand" />
                      </Button>
                    </div>
                  </div>

                  <div className="z-10 space-y-1">
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-brand transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.description || firstSlide?.content?.title || 'Structured slide presentation.'}
                    </p>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand/40 via-sky-400/40 to-indigo-500/40 group-hover:h-1.5 transition-all" />
                </div>

                {/* Card Bottom Meta & Actions */}
                <div className="p-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 bg-card/30">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Layers className="size-3.5 text-brand" />
                      {slideCount} {t.presentations.slidesCount}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleExportHtml(item.id, item.title, e)}
                      className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-full hover:bg-accent cursor-pointer"
                      title="Download Offline HTML"
                    >
                      <Download className="size-3 mr-1" />
                      {t.common.export}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent cursor-pointer"
                        >
                          <MoreVertical className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs bg-card border-border/80">
                        <DropdownMenuItem
                          onClick={() => router.push(`/presentations/${item.id}`)}
                          className="cursor-pointer"
                        >
                          <ExternalLink className="mr-2 size-3.5" />
                          {t.presentations.openEditor}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/presentations/${item.id}/present`)}
                          className="cursor-pointer"
                        >
                          <Play className="mr-2 size-3.5" />
                          {t.presentations.presentMode}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDuplicate(item.id, e as any)}
                          className="cursor-pointer"
                        >
                          <Copy className="mr-2 size-3.5" />
                          {t.common.duplicate}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleExportHtml(item.id, item.title, e as any)}
                          className="cursor-pointer"
                        >
                          <FileCode className="mr-2 size-3.5 text-brand" />
                          {t.presentations.downloadHtml}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleExportPdf(item.id, item.title, e as any)}
                          className="cursor-pointer"
                        >
                          <FileText className="mr-2 size-3.5 text-rose-400" />
                          {t.presentations.downloadPdf}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(item.id, e as any)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-3.5" />
                          {t.common.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
