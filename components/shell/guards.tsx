"use client";

import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAuthHydrated, useSession } from "@/features/auth/hooks";

function FullPageSpinner() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading" />
    </div>
  );
}

/** Blocks authenticated content until we know there's a session; else routes to /login. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const hydrated = useAuthHydrated();
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !session) router.replace("/login");
  }, [hydrated, session, router]);

  if (!hydrated || !session) return <FullPageSpinner />;
  return <>{children}</>;
}

/** Restricts a route to platform admins; owners/others are sent to their dashboard. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const hydrated = useAuthHydrated();
  const session = useSession();
  const router = useRouter();
  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    if (!hydrated) return;
    if (!session) router.replace("/login");
    else if (!isAdmin) router.replace("/dashboard");
  }, [hydrated, session, isAdmin, router]);

  if (!hydrated || !session || !isAdmin) return <FullPageSpinner />;
  return <>{children}</>;
}

/** Keeps signed-in users out of the auth pages. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const hydrated = useAuthHydrated();
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && session) router.replace("/dashboard");
  }, [hydrated, session, router]);

  if (hydrated && session) return <FullPageSpinner />;
  return <>{children}</>;
}
