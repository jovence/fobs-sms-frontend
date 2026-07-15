import type { Page } from "@playwright/test";

/** CDP network condition presets (Chromium only). */
export const NETWORK = {
  fast: null,
  averageMobile: {
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  },
  slow3g: {
    downloadThroughput: (400 * 1024) / 8,
    uploadThroughput: (400 * 1024) / 8,
    latency: 400,
  },
} as const;

export type NetworkKey = keyof typeof NETWORK;

/** Throttle the page's network to a profile (no-op for `fast`). */
export async function applyNetwork(page: Page, key: NetworkKey): Promise<void> {
  const cond = NETWORK[key];
  if (!cond) return;
  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", { offline: false, ...cond });
}

/** Toggle offline to simulate an unstable connection. */
export async function setOffline(page: Page, offline: boolean): Promise<void> {
  await page.context().setOffline(offline);
}
