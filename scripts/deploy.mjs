import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const action = process.argv[2];
const id = process.env.D1_DATABASE_ID;
if (!id || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id) || id === "00000000-0000-4000-8000-000000000000") {
  throw Error("Set D1_DATABASE_ID to the ID of your Cloudflare D1 database.");
}
const base = path.resolve("dist/server");
const cfg = JSON.parse(fs.readFileSync(path.join(base, "wrangler.json"), "utf8"));
cfg.main = path.resolve(base, cfg.main);
cfg.base_dir = base;
cfg.assets.directory = path.resolve(base, cfg.assets.directory);
cfg.d1_databases = [{binding:"DB",database_name:"tactyqal-notebook",database_id:id,migrations_dir:path.resolve("drizzle")}];
cfg.workers_dev = true;
fs.mkdirSync(".build-cache",{recursive:true});
const out = ".build-cache/worker.json";
fs.writeFileSync(out,JSON.stringify(cfg));
const commands = {migrate:["d1","migrations","apply","DB","--remote"],deploy:["deploy"],secret:["secret","put","ADMIN_KEY"]};
if (!(action in commands)) throw Error("Choose migrate, deploy or secret.");
const r = spawnSync(process.execPath, ["node_modules/wrangler/bin/wrangler.js",...commands[action],"--config",out], {stdio:"inherit"});
process.exit(r.status ?? 1);
