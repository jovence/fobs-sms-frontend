import type { Metadata } from "next";
import { GuestOnly } from "@/components/shell/guards";

// Auth pages are private surfaces — keep them out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <GuestOnly>{children}</GuestOnly>;
}
