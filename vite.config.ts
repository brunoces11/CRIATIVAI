import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { findVenvPython } from "./scripts/runtime.mjs";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const isSitesFrontendOnlyBuild = process.env.VITE_SITES_FRONTEND_ONLY === "1";
let backendProcess: ReturnType<typeof spawn> | null = null;
let backendStartup: Promise<void> | null = null;

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

process.once("exit", () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});

export default defineConfig(async () => {
  const cloudflarePlugin = isSitesFrontendOnlyBuild
    ? (await import("@cloudflare/vite-plugin")).cloudflare()
    : null;

  return {
    plugins: [
      react(),
      cloudflarePlugin,
      !isSitesFrontendOnlyBuild
        ? {
            name: "criativai-auto-backend",
            configureServer() {
            void ensureBackendStarted();
          },
        }
        : null,
    ],
    build: isSitesFrontendOnlyBuild
      ? {
          outDir: "dist",
        }
      : undefined,
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
  };
});
