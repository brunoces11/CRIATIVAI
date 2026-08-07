import { access, cp, mkdir, readdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = process.cwd();
const distRoot = resolve(root, "dist");
const hostingConfig = resolve(root, ".openai", "hosting.json");

const env = {
  ...process.env,
  VITE_SITES_FRONTEND_ONLY: "1",
};

await rm(distRoot, { force: true, recursive: true });

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

const workerOutput = await findWorkerOutput(distRoot);

await rm(resolve(distRoot, "server"), { force: true, recursive: true });
await rm(resolve(distRoot, ".openai"), { force: true, recursive: true });
await mkdir(resolve(distRoot, "server"), { recursive: true });
await mkdir(resolve(distRoot, ".openai"), { recursive: true });
await cp(resolve(workerOutput, "index.js"), resolve(distRoot, "server", "index.js"));

if (await pathExists(hostingConfig)) {
  await cp(hostingConfig, resolve(distRoot, ".openai", "hosting.json"));
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function findWorkerOutput(distDirectory) {
  const entries = await readdir(distDirectory, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const candidate = resolve(distDirectory, entry.name);
    if (await pathExists(resolve(candidate, "wrangler.json")) && await pathExists(resolve(candidate, "index.js"))) {
      return candidate;
    }
  }

  throw new Error("Unable to locate the Cloudflare worker build output in dist.");
}
