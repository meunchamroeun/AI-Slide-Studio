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
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/components/i18n-provider';

interface AlertDialogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  type?: 'error' | 'info' | 'success';
  buttonLabel?: string;
}

export function AlertDialogModal({
  open,
  onOpenChange,
  title,
  message,
  type = 'error',
  buttonLabel,
}: AlertDialogModalProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border/80 p-6 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div
            className={`size-10 rounded-full flex items-center justify-center mb-1 ${
              type === 'error'
                ? 'bg-destructive/10 text-destructive'
                : type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-brand/10 text-brand'
            }`}
          >
            {type === 'error' ? (
              <AlertCircle className="size-5" />
            ) : type === 'success' ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <Info className="size-5" />
            )}
          </div>
          <DialogTitle className="text-lg font-serif font-semibold text-foreground tracking-tight">
            {title || (type === 'error' ? 'Error' : t.dialogs?.alertTitle || 'Studio Notice')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 border-t border-border/40">
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs rounded-lg font-semibold cursor-pointer"
          >
            {buttonLabel || t.dialogs?.close || 'OK'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
