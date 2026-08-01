import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  VITE_SITES_FRONTEND_ONLY: "1",
};

const commands = [
  ["npm", ["exec", "tsc", "--", "--noEmit"]],
  ["npm", ["exec", "vite", "build"]],
];

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
