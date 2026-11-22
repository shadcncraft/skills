#!/usr/bin/env node
// Finds the installed shadcncraft JSON Render package for the project in the
// current directory (or the directory given as the first argument) and prints
// JSON: which tier to use, where its SKILL.md and CLI are, and whether a
// licence key is set. Never prints the key itself.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const PRO = "@shadcncraft/json-render-pro";
const FREE = "@shadcncraft/json-render";
const SKILL = "skills/shadcncraft-json-render/SKILL.md";

function find(pkg, from) {
  for (let dir = resolve(from); ; dir = dirname(dir)) {
    const manifest = join(dir, "node_modules", pkg, "package.json");
    if (existsSync(manifest)) {
      const json = JSON.parse(readFileSync(manifest, "utf8"));
      const root = dirname(manifest);
      const bins = typeof json.bin === "string" ? { [json.name.split("/").pop()]: json.bin } : json.bin ?? {};
      const [binName, binPath] = Object.entries(bins)[0] ?? [];
      const skill = join(root, SKILL);
      return {
        package: pkg,
        version: json.version,
        dir: root,
        skill: existsSync(skill) ? skill : null,
        cli: binPath ? { name: binName, run: `node ${JSON.stringify(join(root, binPath))}` } : null,
      };
    }
    if (dirname(dir) === dir) return null;
  }
}

const cwd = process.argv[2] ?? process.cwd();
const pro = find(PRO, cwd);
const free = find(FREE, cwd);
const licenseKeySet = Boolean(process.env.SHADCNCRAFT_LICENSE_KEY);
const installed = pro ?? free;

let tier;
let next;
if (pro) {
  tier = "pro";
  next = `Read ${pro.skill ?? "the package README"} and follow it.`;
} else if (licenseKeySet) {
  tier = "pro-not-installed";
  next = `SHADCNCRAFT_LICENSE_KEY is set but ${PRO} is not installed. Install it (see the plugin README), then run this again.`;
} else if (free) {
  tier = "free";
  next = `Read ${free.skill ?? "the package README"} and follow it.`;
} else {
  tier = "none";
  next = `Neither package is installed. Install ${FREE} and its peers (see the plugin README), then run this again.`;
}

console.log(JSON.stringify({ tier, licenseKeySet, installed, both: Boolean(pro && free), next }, null, 2));
