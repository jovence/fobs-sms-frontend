import { api } from "@/lib/api-client";
import type { AppType, AppUpdateSettings, AppUpdatesMap } from "../types";
import type { AppControlService } from "./app-control.service";

/**
 * Live implementation of {@link AppControlService} against the Laravel backend
 * (`/api/dashboard/admin/app-update/*`, SuperAdmin-scoped). Maps the backend's
 * snake_case `AppUpdateResource` payload onto the UI's camelCase {@link AppUpdateSettings}.
 */

/** Shape of the backend `AppUpdateResource` (snake_case, `id` numeric). */
interface AppUpdatePayload {
  id: number | string;
  app_type: string;
  update_status: boolean;
  version: string | null;
  update_message: string | null;
  download_url: string | null;
  updated_at: string | null;
}

/** Fallback used when the backend has no row for an app type yet. */
function emptySettings(appType: AppType): AppUpdateSettings {
  return { appType, updateAvailable: false, version: "", message: "", downloadUrl: "" };
}

function isAppType(value: string): value is AppType {
  return value === "teacher" || value === "parent";
}

function mapSettings(p: AppUpdatePayload): AppUpdateSettings {
  return {
    appType: isAppType(p.app_type) ? p.app_type : "teacher",
    updateAvailable: p.update_status,
    version: p.version ?? "",
    message: p.update_message ?? "",
    downloadUrl: p.download_url ?? "",
  };
}

/** Build a complete {@link AppUpdatesMap} from the all-statuses array, defaulting gaps. */
function toMap(items: AppUpdatePayload[]): AppUpdatesMap {
  const map: AppUpdatesMap = {
    teacher: emptySettings("teacher"),
    parent: emptySettings("parent"),
  };
  for (const item of items) {
    const settings = mapSettings(item);
    map[settings.appType] = settings;
  }
  return map;
}

async function fetchAll(): Promise<AppUpdatesMap> {
  const items = await api.get<AppUpdatePayload[]>("/dashboard/admin/app-update/all-statuses");
  return toMap(items);
}

export const httpAppControlService: AppControlService = {
  async getAll() {
    return fetchAll();
  },
  async setSettings(appType, input) {
    // The write endpoint requires `update_status`, which `setSettings` doesn't carry;
    // preserve the app type's current flag (fetch it first) so this only edits the copy.
    const map = await fetchAll();
    const updated = await api.post<AppUpdatePayload>("/dashboard/admin/app-update/update", {
      app_type: appType,
      update_status: map[appType].updateAvailable,
      version: input.version,
      update_message: input.message,
      download_url: input.downloadUrl,
    });
    const settings = mapSettings(updated);
    return { ...map, [settings.appType]: settings };
  },
  async toggle(appType) {
    // Toggle returns only the mutated app type; re-read the other via the current map.
    const map = await fetchAll();
    const updated = await api.post<AppUpdatePayload>("/dashboard/admin/app-update/toggle", {
      app_type: appType,
    });
    const settings = mapSettings(updated);
    return { ...map, [settings.appType]: settings };
  },
};
