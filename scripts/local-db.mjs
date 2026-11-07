// Keep the runtime config beside .dev.vars so Wrangler loads secrets locally.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const [action, ...args] = process.argv.slice(2);
if (!["migrate", "serve"].includes(action)) throw Error("Use migrate or serve");
const root = process.cwd(),
  base = path.join(root, "dist/server"),
  cfg = JSON.parse(fs.readFileSync(path.join(base, "wrangler.json"), "utf8"));
cfg.main = path.resolve(base, cfg.main);
cfg.assets.directory = path.resolve(base, cfg.assets.directory);
for (const b of cfg.d1_databases) b.migrations_dir = "drizzle";
const file = ".wrangler-local.json";
fs.writeFileSync(file, JSON.stringify(cfg));
const persist = process.env.LOCAL_DB_DIR || ".wrangler/notebook";
const command =
  action === "serve"
    ? ["dev", "--local", "--ip", "127.0.0.1", "--inspector-port", "0"]
    : ["d1", "migrations", "apply", "DB", "--local"];
const proc = spawnSync(
  process.execPath,
  [
    "./node_modules/wrangler/bin/wrangler.js",
    ...command,
    "--config",
    file,
    "--persist-to",
    persist,
    ...args,
  ],
  { stdio: "inherit" },
);
process.exit(proc.status ?? 1);
