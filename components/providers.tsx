"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { makeQueryClient } from "@/lib/query-client";
import { mutationErrorKey } from "@/lib/mutation-error";

export function Providers({ children }: { children: ReactNode }) {
  // Localized message for the global mutation-error toast, so a failed write is
  // reported in the user's language rather than the backend's raw English string.
  const tErrors = useTranslations("common.errors");
  // One client per browser session; created lazily so it isn't shared across requests.
  const [queryClient] = useState(() =>
    makeQueryClient((error) => tErrors(mutationErrorKey(error))),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
