import { access, cp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { findVenvPython } from "./scripts/runtime.mjs";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const isSitesFrontendOnlyBuild = process.env.VITE_SITES_FRONTEND_ONLY === "1";
let backendProcess: ReturnType<typeof spawn> | null = null;
let backendStartup: Promise<void> | null = null;

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function isBackendReady() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/health", { signal: AbortSignal.timeout(800) });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureBackendStarted() {
  if (process.env.CRIATIVAI_DISABLE_VITE_BACKEND_AUTOSTART === "1") return;
  if (await isBackendReady()) return;
  if (backendStartup) return backendStartup;

  backendStartup = new Promise((resolveStartup) => {
    const python = process.env.PYTHON ?? findVenvPython(root);
    backendProcess = spawn(
      python,
      ["-m", "uvicorn", "backend.app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
      {
        cwd: root,
        env: process.env,
        shell: process.platform === "win32",
        stdio: "inherit",
      },
    );

    const poll = setInterval(async () => {
      if (await isBackendReady()) {
        clearInterval(poll);
        resolveStartup();
      }
    }, 500);

    backendProcess.once("exit", () => {
      clearInterval(poll);
      backendProcess = null;
      backendStartup = null;
      resolveStartup();
    });
  });

  return backendStartup;
}

function emitSitesArtifacts(): Plugin {
  let configRoot = root;

  return {
    name: "criativai-sites-artifacts",
    apply: "build",
    configResolved(config) {
      configRoot = config.root;
    },
    async closeBundle() {
      const distRoot = resolve(configRoot, "dist");
      const outputDirectory = resolve(distRoot, ".openai");
      const workerOutput = resolve(distRoot, "server", "index.js");
      const workerSource = resolve(configRoot, "worker", "sites-static-entry.js");
      const hostingConfig = resolve(configRoot, ".openai", "hosting.json");

      await rm(outputDirectory, { force: true, recursive: true });
      await mkdir(resolve(distRoot, "server"), { recursive: true });
      await mkdir(outputDirectory, { recursive: true });
      await cp(workerSource, workerOutput);

      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      }
    },
  };
}

process.once("exit", () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});

export default defineConfig({
  plugins: [
    react(),
    !isSitesFrontendOnlyBuild
      ? {
          name: "criativai-auto-backend",
          configureServer() {
            void ensureBackendStarted();
          },
        }
      : null,
    isSitesFrontendOnlyBuild ? emitSitesArtifacts() : null,
  ],
  server: !isSitesFrontendOnlyBuild
    ? {
        proxy: {
          "/api": {
            target: "http://127.0.0.1:8000",
            changeOrigin: true,
          },
        },
      }
    : undefined,
});
