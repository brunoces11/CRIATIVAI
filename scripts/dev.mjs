import { spawn } from "node:child_process";

const backend = spawn("npm", ["run", "backend"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

const frontend = spawn("npm", ["run", "dev:frontend"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

const children = [backend, frontend];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(code);
}

for (const child of children) {
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const exitCode = code ?? (signal ? 1 : 0);
    shutdown(exitCode);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
