import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import type { AppType, AppUpdateInput, AppUpdatesMap } from "../types";

export interface AppControlService {
  getAll(): Promise<AppUpdatesMap>;
  setSettings(appType: AppType, input: AppUpdateInput): Promise<AppUpdatesMap>;
  toggle(appType: AppType): Promise<AppUpdatesMap>;
}

const seed: AppUpdatesMap = {
  teacher: {
    appType: "teacher",
    updateAvailable: false,
    version: "2.4.1",
    message: "Bug fixes and performance improvements.",
    downloadUrl: "https://play.google.com/store/apps/details?id=cm.fobs.teacher",
  },
  parent: {
    appType: "parent",
    updateAvailable: true,
    version: "1.8.0",
    message: "New: view your child's report cards in-app.",
    downloadUrl: "https://play.google.com/store/apps/details?id=cm.fobs.parent",
  },
};

let cache: AppUpdatesMap | null = null;
function db() {
  if (!cache) cache = mockStore.get<AppUpdatesMap>("adminAppControl", seed);
  return cache;
}
function commit(next: AppUpdatesMap) {
  cache = next;
  mockStore.set("adminAppControl", next);
}

const mock: AppControlService = {
  async getAll() {
    return withLatency({ ...db() }, 350);
  },
  async setSettings(appType, input) {
    const current = db();
    const next = { ...current, [appType]: { ...current[appType], ...input } };
    commit(next);
    return withLatency({ ...next }, 450);
  },
  async toggle(appType) {
    const current = db();
    const next = {
      ...current,
      [appType]: { ...current[appType], updateAvailable: !current[appType].updateAvailable },
    };
    commit(next);
    return withLatency({ ...next }, 300);
  },
};

export const appControlService: AppControlService =
  API_MODE === "live" ? mock : mock;
