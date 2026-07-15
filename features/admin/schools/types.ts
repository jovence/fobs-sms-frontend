import type { SubscriptionTier } from "@/types";

export type { SubscriptionTier };

export interface AdminSchool {
  id: string;
  name: string;
  acronym: string;
  code: string;
  ownerName: string;
  subscription: SubscriptionTier;
  isDemo: boolean;
  studentCount: number;
  teacherCount: number;
  createdAt: string;
}

export interface AdminSchoolQuery {
  page: number;
  perPage: number;
  search?: string;
  subscription?: SubscriptionTier;
  sortBy?: keyof AdminSchool;
  sortDir?: "asc" | "desc";
}
