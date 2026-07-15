import { defineConfig, devices } from "@playwright/test";

const PORT = 3210;
const baseURL = `http://localhost:${PORT}`;

/**
 * E2E config. Runs against the production build in mock mode (default), so the
 * critical journeys are validated exactly as users experience them.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    locale: "en-US",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Firefox/WebKit are part of the cross-browser gate; enable once their
    // system deps are provisioned in CI (`playwright install --with-deps`).
    // { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
