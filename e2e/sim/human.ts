import { expect, type Page } from "@playwright/test";
import { DEMO } from "../helpers";
import { makeRng, type Rng, chance, int } from "./rng";
import { applyNetwork } from "./profiles";
import type { Persona } from "./personas";

export interface Metric {
  label: string;
  ms: number;
}

/**
 * A human-like actor. Wraps a Playwright page with a persona's think-time,
 * mistake-proneness, latency profile, and simple friction metrics.
 */
export class Human {
  readonly rng: Rng;
  readonly metrics: Metric[] = [];
  readonly journal: string[] = [];
  clicks = 0;

  constructor(
    readonly page: Page,
    readonly persona: Persona,
  ) {
    this.rng = makeRng(persona.seed);
  }

  /** Apply the persona's network profile (call once per session). */
  async arrive(): Promise<void> {
    await applyNetwork(this.page, this.persona.network);
    this.log(`arrives (${this.persona.label}, net=${this.persona.network})`);
  }

  log(msg: string) {
    this.journal.push(msg);
  }

  /** Hesitate like a human — scaled by patience and a seeded jitter. */
  async think(baseMs = 500): Promise<void> {
    const jitter = 0.6 + this.rng() * 0.9;
    await this.page.waitForTimeout(Math.round(baseMs * this.persona.patience * jitter));
  }

  /** Time an action and record it as a friction metric. */
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    const out = await fn();
    const ms = Date.now() - start;
    this.metrics.push({ label, ms });
    this.log(`${label}: ${ms}ms`);
    return out;
  }

  /** Does this persona misclick on this decision? (seeded) */
  misclicks(): boolean {
    return chance(this.rng, this.persona.mistakeRate);
  }

  async signIn(): Promise<void> {
    const creds = DEMO[this.persona.role];
    await this.page.goto("/login");
    await this.think(400);
    await this.page.getByLabel("Email address").fill(creds.email);
    await this.page.getByLabel("Password", { exact: true }).fill(creds.password);
    await this.think(300);
    await this.page.getByRole("button", { name: "Sign in" }).click();
    this.clicks++;
    await expect(this.page).toHaveURL(/\/dashboard$/);
  }

  /** Fail if the page scrolls horizontally (responsive defect) — small tolerance for scrollbars. */
  async expectNoHorizontalScroll(): Promise<void> {
    const overflow = await this.page.evaluate(() => {
      const el = document.documentElement;
      return el.scrollWidth - el.clientWidth;
    });
    expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(2);
  }

  /** Exploratory: click a random visible, enabled link/button (controlled randomness). */
  async exploreClick(): Promise<void> {
    const candidates = this.page.locator(
      "a:visible, button:visible:not([disabled])",
    );
    const n = await candidates.count();
    if (n === 0) return;
    const idx = int(this.rng, 0, Math.min(n, 12) - 1);
    await candidates.nth(idx).click({ trial: false }).catch(() => {});
    this.clicks++;
    await this.think(300);
  }

  summary() {
    const slowest = [...this.metrics].sort((a, b) => b.ms - a.ms)[0];
    return {
      persona: this.persona.id,
      clicks: this.clicks,
      steps: this.metrics.length,
      slowest,
      metrics: this.metrics,
    };
  }
}
