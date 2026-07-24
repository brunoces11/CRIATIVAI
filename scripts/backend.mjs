import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { findVenvPython } from "./runtime.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const python = process.env.PYTHON ?? findVenvPython(root);

const child = spawn(
  python,
  ["-m", "uvicorn", "backend.app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
  {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

function shutdown(code = 0) {
  if (!child.killed) {
    child.kill();
  }
  process.exit(code);
}

child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
