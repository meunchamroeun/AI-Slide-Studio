'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useI18n } from '@/components/i18n-provider';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'destructive',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useI18n();

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border/80 p-6 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-1">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-lg font-serif font-semibold text-foreground tracking-tight">
            {title || t.dialogs?.confirmDeleteTitle || 'Are you sure?'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {description || t.dialogs?.confirmDeleteDesc || 'This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-border/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="text-xs rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {cancelLabel || t.dialogs?.cancel || 'Cancel'}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            size="sm"
            disabled={isLoading}
            onClick={handleConfirm}
            className="text-xs rounded-lg font-semibold gap-1.5 shadow-sm cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>{t.common.loading || 'Loading...'}</span>
              </>
            ) : (
              <>
                {variant === 'destructive' && <Trash2 className="size-3.5" />}
                <span>{confirmLabel || t.dialogs?.confirmDeleteBtn || 'Confirm'}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
