import type { MockGceIndex } from "../types";
import { httpMockGceService } from "./mock-gce.http";

export interface MockGceService {
  /** Eligible GCE classes for the active school + sequence-6 context. */
  index(): Promise<MockGceIndex>;
  /** Download the combined per-candidate result-slips PDF for a class. */
  downloadSlips(classId: string, className: string): Promise<void>;
  /** Download the class-wide summary PDF for a class. */
  downloadSummary(classId: string, className: string): Promise<void>;
}

export const mockGceService: MockGceService = httpMockGceService;
