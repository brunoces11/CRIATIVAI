import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const python = process.env.PYTHON ?? findVenvPython();

function findVenvPython() {
  const candidates = [
    join(root, ".venv", "Scripts", "python.exe"),
    join(root, ".venv", "bin", "python"),
  ];
  const match = candidates.find((candidate) => existsSync(candidate));
  if (!match) {
    throw new Error("Python virtual environment not found. Create .venv and install backend/requirements-dev.txt first.");
  }
  return match;
}

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
