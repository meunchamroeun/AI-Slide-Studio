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

interface RecentPresentationsProps {
  initialPresentations: PresentationDocument[];
  onOpenCreate?: () => void;
}

export function RecentPresentations({
  initialPresentations,
  onOpenCreate,
}: RecentPresentationsProps) {
  const router = useRouter();
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

  return (
    <div className="space-y-5">
      {/* Search and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PresentationIcon className="h-5 w-5 text-primary" />
            Recent Presentations
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage, edit, present, and download your animated presentations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search presentations..."
              className="pl-9 h-9 text-xs bg-card/60 border-border/70"
            />
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/30 p-12 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
            <PresentationIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-semibold text-foreground">
              {searchQuery ? 'No matching presentations' : 'No presentations yet'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? 'Try searching with different keywords or clear the filter.'
                : 'Create your first presentation using our AI Generator or quick templates.'}
            </p>
          </div>
          {onOpenCreate && !searchQuery && (
            <Button
              size="sm"
              onClick={onOpenCreate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Create with AI
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
                className="group relative rounded-xl border border-border/70 bg-card/60 hover:bg-card/90 hover:border-primary/50 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl cursor-pointer"
              >
                {/* Visual Thumbnail / Card Top */}
                <div className="relative h-40 w-full bg-gradient-to-br from-card via-secondary/40 to-background border-b border-border/40 p-4 flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between z-10">
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase font-mono tracking-wider border-border/80 bg-background/60 backdrop-blur-sm"
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
                        className="h-7 w-7 text-muted-foreground hover:text-foreground bg-background/50 hover:bg-background backdrop-blur-sm"
                        title="Present Fullscreen"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="z-10 space-y-1">
                    <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.description || firstSlide?.content?.title || 'Structured slide presentation.'}
                    </p>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/30 via-indigo-500/40 to-accent/30 group-hover:h-1.5 transition-all" />
                </div>

                {/* Card Bottom Meta & Actions */}
                <div className="p-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 bg-card/30">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      {slideCount} slides
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleExportHtml(item.id, item.title, e)}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      title="Download Offline HTML"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Export
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        <DropdownMenuItem
                          onClick={() => router.push(`/presentations/${item.id}`)}
                        >
                          <ExternalLink className="mr-2 h-3.5 w-3.5" />
                          Open Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/presentations/${item.id}/present`)}
                        >
                          <Play className="mr-2 h-3.5 w-3.5" />
                          Present Mode
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDuplicate(item.id, e as any)}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleExportHtml(item.id, item.title, e as any)}
                        >
                          <Download className="mr-2 h-3.5 w-3.5" />
                          Download HTML
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(item.id, e as any)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
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
