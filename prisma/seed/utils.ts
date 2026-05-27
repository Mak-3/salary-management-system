/** Mulberry32 — deterministic PRNG from a numeric seed. */
export function seededRandom(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randomBetween(min: number, max: number, seed: number): number {
  const r = seededRandom(seed);
  return Math.floor(min + r * (max - min + 1));
}

export function randomFloat(min: number, max: number, seed: number): number {
  const r = seededRandom(seed);
  return min + r * (max - min);
}

export function pickOne<T>(items: readonly T[], seed: number): T {
  const index = Math.floor(seededRandom(seed) * items.length);
  return items[index]!;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

/** Combines loop indices into a stable integer seed for salary / title picks. */
export function employeeSeed(
  firstIndex: number,
  lastIndex: number,
  salt = 0,
): number {
  return firstIndex * 10_000 + lastIndex * 100 + salt;
}
