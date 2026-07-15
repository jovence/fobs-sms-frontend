export type AppType = "teacher" | "parent";

export interface AppUpdateSettings {
  appType: AppType;
  updateAvailable: boolean;
  version: string;
  message: string;
  downloadUrl: string;
}

export type AppUpdatesMap = Record<AppType, AppUpdateSettings>;

export interface AppUpdateInput {
  version: string;
  message: string;
  downloadUrl: string;
}
