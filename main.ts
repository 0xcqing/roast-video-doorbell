import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROAST =
  "My video doorbell only rings after the driver has left, which makes it less a security system than a highlight reel of my slowest decisions.";

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

const GADGETS = [
  "doorbell",
  "toaster",
  "kettle",
  "robot vacuum",
  "smart bulb",
  "air fryer",
  "fridge",
  "thermostat",
  "printer",
];

type RoastFacts = {
  target: string;
  characters: number;
  bytes: number;
};

function roastFacts(text: string): RoastFacts {
  const lower = text.toLowerCase();
  const target = GADGETS.find((gadget) => lower.includes(gadget)) ?? "unknown";
  return {
    target,
    characters: Array.from(text).length,
    bytes: Buffer.byteLength(text, "utf-8"),
  };
}

function fail(message: string): never {
  process.stderr.write(message + "\n");
  process.exit(1);
}

function validate(text: string, facts: RoastFacts): void {
  if (text.trim().length === 0) {
    fail("roast is empty after trimming whitespace");
  }
  if (/[\r\n]/.test(text)) {
    fail("roast must be a single line with no newlines");
  }
  if (!text.includes("doorbell")) {
    fail('roast must mention "doorbell"');
  }
  if (!text.includes("than")) {
    fail('roast must contain "than"');
  }
  if (!text.trimEnd().endsWith(".")) {
    fail("roast must end with a period");
  }
  if (facts.characters < 1 || facts.characters > 200) {
    fail(`roast has ${facts.characters} characters, expected 1..200`);
  }
  if (facts.bytes < 1 || facts.bytes > 200) {
    fail(`roast has ${facts.bytes} bytes, expected 1..200`);
  }
}

const facts = roastFacts(ROAST);
validate(ROAST, facts);

mkdirSync(OUTPUT_DIR, { recursive: true });
const payload = ROAST + "\n";
writeFileSync(OUTPUT_FILE, payload, { encoding: "utf-8" });

const readBack = readFileSync(OUTPUT_FILE);
const expected = Buffer.from(payload, "utf-8");
if (!readBack.equals(expected)) {
  fail("read-back bytes do not match what was written");
}

process.stdout.write(`path: ${OUTPUT_FILE}\n`);
process.stdout.write(`text: ${ROAST}\n`);
process.stdout.write(`target: ${facts.target}\n`);
process.stdout.write(`characters: ${facts.characters}\n`);
process.stdout.write(`bytes: ${facts.bytes}\n`);
