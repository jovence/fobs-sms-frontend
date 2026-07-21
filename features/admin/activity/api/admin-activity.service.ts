import type { Paginated } from "@/types";
import type { ActivityEntry, ActivityQuery } from "../types";
import { httpAdminActivityService } from "./admin-activity.http";

export interface AdminActivityService {
  list(query: ActivityQuery): Promise<Paginated<ActivityEntry>>;
}

export const adminActivityService: AdminActivityService = httpAdminActivityService;
