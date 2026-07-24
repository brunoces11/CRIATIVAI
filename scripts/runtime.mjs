import { existsSync } from "node:fs";
import { join } from "node:path";

export function findVenvPython(root) {
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
