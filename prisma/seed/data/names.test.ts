import { describe, expect, it } from "vitest";

import {
  FIRST_NAME_COUNT,
  LAST_NAME_COUNT,
  firstNames,
  lastNames,
} from "./names";

describe("name lists", () => {
  it("loads exactly 100 first and last names", () => {
    expect(FIRST_NAME_COUNT).toBe(100);
    expect(LAST_NAME_COUNT).toBe(100);
    expect(firstNames).toHaveLength(100);
    expect(lastNames).toHaveLength(100);
  });

  it("has no blank or duplicate names", () => {
    for (const list of [firstNames, lastNames]) {
      expect(list.every((name) => name.length > 0)).toBe(true);
      expect(new Set(list).size).toBe(100);
    }
  });
});
