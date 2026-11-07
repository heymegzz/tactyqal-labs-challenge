import { cloudflare } from "@cloudflare/vite-plugin";
import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      inspectorPort: false,
      config: {
        name: "tactyqal-notebook",
        main: "./worker/index.ts",
        compatibility_date: "2026-05-15",
        compatibility_flags: ["nodejs_compat"],
        d1_databases: [{
          binding: "DB",
          database_name: "tactyqal-notebook",
          database_id: process.env.D1_DATABASE_ID || "00000000-0000-4000-8000-000000000000",
        }],
      },
    }),
  ],
});
