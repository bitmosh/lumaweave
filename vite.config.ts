import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { spawn } from "child_process";
import { existsSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

function selfGraphWatcherPlugin() {
  return {
    name: "lumaweave-self-graph-watcher",
    apply: "serve" as const,
    configureServer(server: any) {
      // C-hygiene-4: self-heal the self-graph fixture on dev server
      // startup. AppShell.tsx statically imports the generated JSON;
      // if it's missing (fresh clone, or someone rm'd it), the build
      // fails. Generate it synchronously here so Vite has it before
      // parsing any module that depends on it.
      const fixturePath = path.resolve(
        __dirname,
        "src/fixtures/self-graph-generated.json"
      );
      if (!existsSync(fixturePath)) {
        console.log(
          "[LumaWeave] Self-graph fixture missing — generating before server start..."
        );
        try {
          execSync("node scripts/generate-self-graph.mjs", {
            cwd: process.cwd(),
            stdio: "inherit",
          });
          console.log("[LumaWeave] Self-graph generated ✓");
        } catch (err) {
          console.error(
            "[LumaWeave] Failed to generate self-graph at startup:",
            err
          );
          // Don't throw — let Vite continue and surface the import error
          // if the generator failed. Easier to debug than a plugin crash.
        }
      }

      const docsPattern = path.resolve(__dirname, "docs/**/*.md");

      server.watcher.add(docsPattern);

      let isRunning = false;

      server.watcher.on("change", (file: string) => {
        if (!file.endsWith(".md")) return;
        if (!file.includes("/docs/")) return;
        if (isRunning) return;

        isRunning = true;
        console.log(
          `[LumaWeave] .md changed: ${path.relative(process.cwd(), file)}`
        );
        console.log("[LumaWeave] Regenerating self-graph...");

        const child = spawn(
          "node",
          ["scripts/generate-self-graph.mjs"],
          {
            cwd: process.cwd(),
            stdio: "inherit",
          }
        );

        child.on("close", (code: number) => {
          isRunning = false;
          if (code === 0) {
            console.log("[LumaWeave] Self-graph regenerated ✓");
            const jsonPath = path.resolve(
              process.cwd(),
              "src/fixtures/self-graph-generated.json"
            );
            server.watcher.emit("change", jsonPath);
          } else {
            console.error(
              `[LumaWeave] Generate script failed (exit ${code})`
            );
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss(), selfGraphWatcherPlugin()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,

  // Build-time environment variables
  define: {
    __PLAYWRIGHT__: JSON.stringify(
      process.env.PLAYWRIGHT === "true"
    ),
  },

  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
    fs: {
      // Allow importing from docs/ directory
      allow: [".."],
    },
  },
}));