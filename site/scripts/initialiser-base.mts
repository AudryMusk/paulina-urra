import { readFileSync } from "node:fs";
import { join } from "node:path";
import { query } from "../src/lib/backoffice/db";

const schema = readFileSync(join(import.meta.dirname, "../src/lib/backoffice/schema.sql"), "utf8");
const instructions = schema
  .split(";")
  .map((instruction) => instruction.trim())
  .filter(Boolean);

for (const instruction of instructions) await query(instruction);
console.log(`Base prête : ${instructions.length} instructions appliquées.`);
