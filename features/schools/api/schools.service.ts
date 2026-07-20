import type { School } from "@/types";
import type { SchoolInput } from "../types";
import { httpSchoolsService } from "./schools.http";

export interface SchoolsService {
  list(): Promise<School[]>;
  create(input: SchoolInput): Promise<School>;
  update(id: string, input: SchoolInput): Promise<School>;
  remove(id: string): Promise<void>;
}

export const schoolsService: SchoolsService = httpSchoolsService;
