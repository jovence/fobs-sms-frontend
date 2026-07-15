/** Deterministic seeded RNG (mulberry32) so any human-sim failure replays exactly. */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = ReturnType<typeof makeRng>;

export const chance = (rng: Rng, p: number) => rng() < p;
export const int = (rng: Rng, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;
export const pick = <T>(rng: Rng, arr: readonly T[]): T => arr[int(rng, 0, arr.length - 1)];
