// Emits .d.ts for client/src/components/ui and a barrel dist-ds/index.es.d.ts (design-sync library entry).
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "../..");
execSync("npx tsc -p .design-sync/lib-build/tsconfig.dts.json", { cwd: root, stdio: "inherit" });
const ui = path.join(root, "client/src/components/ui");
const lines = fs.readdirSync(ui).filter(f => f.endsWith(".tsx")).map(f => `export * from "./types/client/src/components/ui/${f.replace(/\.tsx$/, "")}";`);
fs.writeFileSync(path.join(root, "dist-ds/index.es.d.ts"), lines.join("\n") + "\n");
// Package the output so the converter finds module/types, and link it into node_modules (gitignored).
fs.writeFileSync(path.join(root, "dist-ds/package.json"), JSON.stringify({ name: "minetrans-ui", version: "1.0.0", type: "module", module: "./index.es.js", main: "./index.es.js", types: "./index.es.d.ts" }, null, 2));
const link = path.join(root, "node_modules/minetrans-ui");
fs.rmSync(link, { recursive: true, force: true });
fs.symlinkSync(path.join(root, "dist-ds"), link);
