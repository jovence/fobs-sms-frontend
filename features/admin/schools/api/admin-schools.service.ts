import type { Paginated } from "@/types";
import type { AdminSchool, AdminSchoolQuery, SubscriptionTier } from "../types";
import { httpAdminSchoolsService } from "./admin-schools.http";

export interface AdminSchoolsService {
  list(query: AdminSchoolQuery): Promise<Paginated<AdminSchool>>;
  setTier(id: string, tier: SubscriptionTier): Promise<AdminSchool>;
  toggleDemo(id: string): Promise<AdminSchool>;
}

export const adminSchoolsService: AdminSchoolsService = httpAdminSchoolsService;
