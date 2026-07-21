import type { AppType, AppUpdateInput, AppUpdatesMap } from "../types";
import { httpAppControlService } from "./app-control.http";

export interface AppControlService {
  getAll(): Promise<AppUpdatesMap>;
  setSettings(appType: AppType, input: AppUpdateInput): Promise<AppUpdatesMap>;
  toggle(appType: AppType): Promise<AppUpdatesMap>;
}

export const appControlService: AppControlService = httpAppControlService;
