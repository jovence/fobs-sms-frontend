import type { Paginated } from "@/types";
import type {
  Parent,
  ParentDetail,
  ParentInput,
  ParentQuery,
  ParentStats,
} from "../types";
import { httpParentsService } from "./parents.http";

export interface ParentsService {
  list(query: ParentQuery): Promise<Paginated<Parent>>;
  get(id: string): Promise<ParentDetail>;
  stats(): Promise<ParentStats>;
  create(input: ParentInput): Promise<Parent>;
  update(id: string, input: ParentInput): Promise<Parent>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
  exportUnattached(): Promise<void>;
}

export const parentsService: ParentsService = httpParentsService;
