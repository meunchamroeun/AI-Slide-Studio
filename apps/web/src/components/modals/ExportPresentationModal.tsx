'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/components/i18n-provider';
import { api } from '@/services/api';
import { PresentationDocument } from '@ai-slide-studio/shared';
import {
  FileText,
  FileCode,
  FileJson,
  Printer,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportPresentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presentationId: string;
  presentationTitle: string;
  slideCount?: number;
  themeName?: string;
  documentData?: PresentationDocument;
}

export function ExportPresentationModal({
  open,
  onOpenChange,
  presentationId,
  presentationTitle,
  slideCount,
  themeName,
  documentData,
}: ExportPresentationModalProps) {
  const { t, locale } = useI18n();
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const safeFilename = (presentationTitle || 'presentation')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');

  const handleExportPdf = async () => {
    try {
      setErrorMessage(null);
      setDownloadingFormat('pdf');
      const blob = await api.exportPdf(presentationId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeFilename}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t.exportModal?.success || 'PDF downloaded successfully');
    } catch (err: any) {
      console.error('PDF export error:', err);
      setErrorMessage(err.message || 'Failed to generate PDF');
      toast.error(err.message || 'PDF export failed');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleExportHtml = async () => {
    try {
      setErrorMessage(null);
      setDownloadingFormat('html');
      const html = await api.exportHtml(presentationId);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeFilename}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t.exportModal?.success || 'HTML downloaded successfully');
    } catch (err: any) {
      console.error('HTML export error:', err);
      setErrorMessage(err.message || 'Failed to export HTML');
      toast.error(err.message || 'HTML export failed');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleExportJson = async () => {
    try {
      setErrorMessage(null);
      setDownloadingFormat('json');
      let dataStr: string;
      if (documentData) {
        dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(documentData, null, 2));
      } else {
        const fullPres = await api.getPresentation(presentationId);
        dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify((fullPres as any).document || fullPres, null, 2));
      }
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `${safeFilename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(t.exportModal?.success || 'JSON downloaded successfully');
    } catch (err: any) {
      console.error('JSON export error:', err);
      setErrorMessage(err.message || 'Failed to export JSON');
      toast.error(err.message || 'JSON export failed');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handlePrint = () => {
    try {
      setErrorMessage(null);
      // In editor or presentation page, invoke browser print
      window.print();
    } catch (err: any) {
      setErrorMessage(err.message || 'Print dialog could not be opened');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border/80 p-6 sm:p-7 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-brand/40 text-brand bg-brand/10 px-2.5 py-0.5">
              <Sparkles className="size-3 mr-1" />
              {t.exportModal?.badge || 'Export Studio'}
            </Badge>
            {slideCount && (
              <span className="text-xs text-muted-foreground font-mono">
                {slideCount} {locale === 'kh' ? 'ស្លាយ' : 'Slides'}
              </span>
            )}
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-foreground tracking-tight">
            {t.exportModal?.title || 'Export Presentation'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-1">
            {presentationTitle} &bull; {t.exportModal?.subtitle || 'Download or print your presentation deck in high-definition formats.'}
          </DialogDescription>
        </DialogHeader>

        {/* Error message banner if any */}
        {errorMessage && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="size-4 shrink-0" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* 4 Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {/* 1. PDF Document */}
          <div className="rounded-xl border border-border/80 bg-secondary/40 p-4 flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <FileText className="size-4" />
                </div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground bg-card/80 px-2 py-0.5 rounded border border-border/60">
                  .PDF
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                {t.exportModal?.pdfTitle || 'Executive PDF Document'}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.exportModal?.pdfDesc || 'Multi-page vector presentation PDF with custom theme styling.'}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleExportPdf}
              disabled={Boolean(downloadingFormat)}
              size="sm"
              className="w-full h-9 rounded-lg bg-primary hover:opacity-95 text-primary-foreground text-xs font-semibold gap-1.5 shadow-sm cursor-pointer"
            >
              {downloadingFormat === 'pdf' ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{t.exportModal?.downloading || 'Downloading...'}</span>
                </>
              ) : (
                <>
                  <Download className="size-3.5 text-brand" />
                  <span>{t.exportModal?.pdfBtn || 'Download PDF (.pdf)'}</span>
                </>
              )}
            </Button>
          </div>

          {/* 2. Standalone HTML */}
          <div className="rounded-xl border border-border/80 bg-secondary/40 p-4 flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FileCode className="size-4" />
                </div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground bg-card/80 px-2 py-0.5 rounded border border-border/60">
                  .HTML
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                {t.exportModal?.htmlTitle || 'Interactive Standalone HTML'}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.exportModal?.htmlDesc || '100% offline self-contained deck with GSAP animations.'}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleExportHtml}
              disabled={Boolean(downloadingFormat)}
              size="sm"
              className="w-full h-9 rounded-lg bg-primary hover:opacity-95 text-primary-foreground text-xs font-semibold gap-1.5 shadow-sm cursor-pointer"
            >
              {downloadingFormat === 'html' ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{t.exportModal?.downloading || 'Downloading...'}</span>
                </>
              ) : (
                <>
                  <Download className="size-3.5 text-brand" />
                  <span>{t.exportModal?.htmlBtn || 'Download HTML (.html)'}</span>
                </>
              )}
            </Button>
          </div>

          {/* 3. JSON Model */}
          <div className="rounded-xl border border-border/80 bg-secondary/40 p-4 flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <FileJson className="size-4" />
                </div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground bg-card/80 px-2 py-0.5 rounded border border-border/60">
                  .JSON
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                {t.exportModal?.jsonTitle || 'Structured JSON Model'}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.exportModal?.jsonDesc || 'Raw AST presentation document schema for backups.'}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleExportJson}
              disabled={Boolean(downloadingFormat)}
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-lg border-border/80 hover:border-brand/50 text-foreground text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
            >
              {downloadingFormat === 'json' ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{t.exportModal?.downloading || 'Downloading...'}</span>
                </>
              ) : (
                <>
                  <Download className="size-3.5 text-brand" />
                  <span>{t.exportModal?.jsonBtn || 'Download JSON (.json)'}</span>
                </>
              )}
            </Button>
          </div>

          {/* 4. High-Res Browser Print */}
          <div className="rounded-xl border border-border/80 bg-secondary/40 p-4 flex flex-col justify-between space-y-3 hover:border-brand/40 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Printer className="size-4" />
                </div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground bg-card/80 px-2 py-0.5 rounded border border-border/60">
                  PRINT
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                {t.exportModal?.printTitle || 'Print & Browser PDF'}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.exportModal?.printDesc || 'Open browser print engine formatted for 16:9 slides.'}
              </p>
            </div>
            <Button
              type="button"
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-lg border-border/80 hover:border-brand/50 text-foreground text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="size-3.5 text-brand" />
              <span>{t.exportModal?.printBtn || 'Open Print Dialog'}</span>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {t.exportModal?.close || 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
