/** Helpers that make mock services feel like a real network — for honest loading/error states. */

export function delay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Deterministic-ish latency so the UI shows real spinners without being annoying. */
export async function withLatency<T>(value: T, ms = 500): Promise<T> {
  await delay(ms);
  return value;
}

const STORAGE_PREFIX = "fobs.mock.";

/** Persist mock mutations across reloads so the app behaves like it has a backend. */
export const mockStore = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      /* ignore quota errors in mock mode */
    }
  },
  remove(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_PREFIX + key);
  },
};
