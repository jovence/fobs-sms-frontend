"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useRequestUpgrade } from "../hooks";
import type { Plan } from "../types";

export function UpgradeDialog({
  plan,
  open,
  onOpenChange,
}: {
  plan: Plan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("billing");
  const td = useTranslations("billing.upgradeDialog");
  const locale = useLocale();
  const requestUpgrade = useRequestUpgrade();

  const planName = plan ? t(`plans.tiers.${plan.tier}.name`) : "";

  async function onConfirm() {
    if (!plan) return;
    try {
      await requestUpgrade.mutateAsync(plan.tier);
      toast.success(td("successToast", { plan: planName }));
      onOpenChange(false);
    } catch {
      toast.error(td("errorToast"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </span>
          <DialogTitle>{td("title", { plan: planName })}</DialogTitle>
          <DialogDescription>{td("description", { plan: planName })}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">{planName}</span>
            <span className="text-sm font-semibold tabular-nums">
              {plan ? formatCurrency(plan.priceYearly, locale) : ""}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {t("perYear")}
              </span>
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{td("note")}</p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={requestUpgrade.isPending}
          >
            {td("cancel")}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={requestUpgrade.isPending}>
            {requestUpgrade.isPending && <Loader2 className="size-4 animate-spin" />}
            {td("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
