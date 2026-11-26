import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const OLD_ORIGIN = "https://tayyipminsin.com.tr";
const NEW_ORIGIN = "https://tayyipminsin.com.tr";

const allowedExtensions = new Set([
  ".html",
  ".xml",
  ".txt",
  ".json",
  ".yml",
  ".yaml",
  ".js",
  ".mjs",
  ".css",
  ".md",
  ".toml"
]);

const excludedDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  ".wrangler"
]);

const changedFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) {
        walk(fullPath);
      }
      continue;
    }

    if (!allowedExtensions.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }

    const original = fs.readFileSync(fullPath, "utf8");

    if (!original.includes(OLD_ORIGIN)) {
      continue;
    }

    const updated = original.replaceAll(OLD_ORIGIN, NEW_ORIGIN);
    fs.writeFileSync(fullPath, updated, "utf8");

    changedFiles.push(path.relative(root, fullPath));
  }
}

walk(root);

console.log(`Domain migration complete: ${changedFiles.length} file(s) updated.`);

for (const file of changedFiles) {
  console.log(`- ${file}`);
}