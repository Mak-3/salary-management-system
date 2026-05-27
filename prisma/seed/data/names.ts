import { readFileSync } from "node:fs";
import { join } from "node:path";

const EXPECTED_COUNT = 100;
const DATA_DIR = __dirname;

function loadNameList(filename: string): string[] {
  const names = readFileSync(join(DATA_DIR, filename), "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (names.length !== EXPECTED_COUNT) {
    throw new Error(
      `${filename}: expected ${EXPECTED_COUNT} names, got ${names.length}`,
    );
  }

  return names;
}

export const firstNames = loadNameList("first-names.txt");
export const lastNames = loadNameList("last-names.txt");
export const FIRST_NAME_COUNT = firstNames.length;
export const LAST_NAME_COUNT = lastNames.length;
