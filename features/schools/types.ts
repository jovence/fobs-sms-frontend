import type { School, SubscriptionTier } from "@/types";

export type { School, SubscriptionTier };

export interface SchoolInput {
  name: string;
  acronym: string;
  email?: string;
  phone?: string;
  address?: string;
}
