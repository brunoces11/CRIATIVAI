import { spawnSync } from "node:child_process";
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

const result = spawnSync(python, ["-m", "pytest", "backend/tests"], {
  cwd: root,
  env: {
    PATH: process.env.PATH,
    Path: process.env.Path,
    PATHEXT: process.env.PATHEXT,
    SYSTEMROOT: process.env.SYSTEMROOT,
    SystemRoot: process.env.SystemRoot,
    COMSPEC: process.env.COMSPEC,
    TEMP: process.env.TEMP,
    TMP: process.env.TMP,
    PYTHONPATH: root,
    APP_ENV: "test",
    CRIATIVAI_LOAD_DOTENV: "0",
  },
  stdio: "inherit",
});

process.exitCode = result.status ?? 1;
