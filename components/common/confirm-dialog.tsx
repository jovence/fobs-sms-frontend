"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/** Reusable confirmation dialog for destructive / sensitive actions. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  isPending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  isPending?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  const tCommon = useTranslations("common");
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);
  const busy = isPending || running;

  // The dialog owns the async lifecycle: it awaits onConfirm, closes on success,
  // and stays open on failure so the user can retry or cancel. On failure it also
  // shows a persistent, announced in-dialog error — the modal traps focus, so an
  // out-of-modal toast alone is easy to miss (especially for low-vision / low-
  // literacy users); the failed action must explain itself in place.
  async function handleConfirm() {
    if (busy) return;
    setRunning(true);
    setFailed(false);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      setFailed(true);
    } finally {
      setRunning(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        if (!next) setFailed(false);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {failed && (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
          >
            <AlertCircle className="size-4 shrink-0" />
            {tCommon("actionFailed")}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            disabled={busy}
            className={cn(
              destructive &&
                "bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/30 text-white",
            )}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
