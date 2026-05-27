import { describe, expect, it } from "vitest";

import {
  employeeSeed,
  pickOne,
  randomBetween,
  randomFloat,
  seededRandom,
  slugify,
} from "./utils";

describe("seededRandom", () => {
  it("returns the same value for the same seed", () => {
    expect(seededRandom(42)).toBe(seededRandom(42));
    expect(seededRandom(999)).toBe(seededRandom(999));
  });

  it("returns values in [0, 1)", () => {
    for (let seed = 0; seed < 200; seed++) {
      const value = seededRandom(seed);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("randomBetween", () => {
  it("returns integers within [min, max] inclusive", () => {
    for (let seed = 0; seed < 100; seed++) {
      const value = randomBetween(10, 20, seed);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(20);
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});

describe("randomFloat", () => {
  it("returns values within [min, max]", () => {
    for (let seed = 0; seed < 100; seed++) {
      const value = randomFloat(1.2, 1.6, seed);
      expect(value).toBeGreaterThanOrEqual(1.2);
      expect(value).toBeLessThanOrEqual(1.6);
    }
  });
});

describe("pickOne", () => {
  it("picks from the provided list", () => {
    const items = ["a", "b", "c"] as const;
    for (let seed = 0; seed < 50; seed++) {
      expect(items).toContain(pickOne(items, seed));
    }
  });
});

describe("slugify", () => {
  it("lowercases and replaces non-alphanumeric runs with dots", () => {
    expect(slugify("O'Brien")).toBe("o.brien");
    expect(slugify("Mary-Jane")).toBe("mary.jane");
    expect(slugify("  Alice  ")).toBe("alice");
  });
});

describe("employeeSeed", () => {
  it("combines indices into a stable seed", () => {
    expect(employeeSeed(3, 7)).toBe(3 * 10_000 + 7 * 100);
    expect(employeeSeed(0, 0, 5)).toBe(5);
  });
});
