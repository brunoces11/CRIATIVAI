import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const python = process.env.PYTHON ?? findVenvPython();
const port = 8010;
const baseUrl = `http://127.0.0.1:${port}`;
const databasePath = join(root, "data", "vertical-test.db");
const databaseUrl = `sqlite:///${databasePath.replaceAll("\\", "/")}`;

function findVenvPython() {
  const candidates = [
    join(root, ".venv", "Scripts", "python.exe"),
    join(root, ".venv", "bin", "python"),
  ];
  const match = candidates.find((candidate) => existsSync(candidate));
  if (!match) {
    throw new Error("Python virtual environment not found. Create .venv and install backend/requirements.txt first.");
  }
  return match;
}

function backendEnv() {
  return {
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
    OPENAI_MOCK_RESPONSE: "Vertical test online. The backend received your message, stored it in SQLite, and streamed this response from FastAPI.",
    DATABASE_URL: databaseUrl,
    FRONTEND_DIST_DIR: join(root, "dist"),
  };
}

function runPython(args) {
  const result = spawnSync(python, args, {
    cwd: root,
    env: backendEnv(),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

async function waitForHealth(getLogs) {
  let lastError = "";
  for (let attempt = 0; attempt < 720; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
      lastError = `HTTP ${response.status}`;
    } catch {
      lastError = "connection refused";
      await new Promise((resolveWait) => setTimeout(resolveWait, 250));
    }
  }
  throw new Error(`FastAPI vertical server did not become ready: ${lastError}\n${getLogs()}`);
}

test("FastAPI serves the Vite build, API routes, streaming, and SQLite persistence", async () => {
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(`${databasePath}${suffix}`, { force: true });
  }

  runPython(["-m", "alembic", "-c", "backend/alembic.ini", "upgrade", "head"]);

  const serverLogs = [];
  const server = spawn(
    python,
    ["-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: root,
      env: backendEnv(),
      stdio: "pipe",
    },
  );
  server.stdout.on("data", (chunk) => serverLogs.push(chunk.toString()));
  server.stderr.on("data", (chunk) => serverLogs.push(chunk.toString()));

  try {
    await waitForHealth(() => serverLogs.join(""));

    const health = await fetch(`${baseUrl}/api/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { ok: true, database: true, frontend: true });

    for (const path of ["/", "/human-resources", "/style", "/talent-preview", "/contact"]) {
      const response = await fetch(`${baseUrl}${path}`);
      assert.equal(response.status, 200);
      assert.match(await response.text(), /<div id="root"><\/div>/);
    }

    const missingApi = await fetch(`${baseUrl}/api/not-found`);
    assert.equal(missingApi.status, 404);

    const chat = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Hello vertical test" }),
    });
    assert.equal(chat.status, 200);

    const events = (await chat.text())
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    const session = events.find((event) => event.event === "session_start");
    assert.ok(session?.session_id);
    assert.ok(events.some((event) => event.event === "delta"));
    assert.ok(events.some((event) => event.event === "done"));

    const current = await fetch(`${baseUrl}/api/conversations/current?session_id=${session.session_id}`);
    assert.equal(current.status, 200);
    const conversation = await current.json();
    assert.equal(conversation.session_id, session.session_id);
    assert.equal(conversation.messages.length, 2);
    assert.equal(conversation.messages[0].role, "user");
    assert.equal(conversation.messages[1].role, "assistant");

    const adminList = await fetch(`${baseUrl}/api/admin/conversations`);
    assert.equal(adminList.status, 200);
    const adminConversations = await adminList.json();
    assert.equal(adminConversations.length, 1);
    assert.equal(adminConversations[0].visitor_label, "Anonymous visitor");
    assert.equal("messages" in adminConversations[0], false);
    assert.equal("session_id" in adminConversations[0], false);

    const adminDetail = await fetch(`${baseUrl}/api/admin/conversations/${adminConversations[0].id}`);
    assert.equal(adminDetail.status, 200);
    const adminConversation = await adminDetail.json();
    assert.equal(adminConversation.messages.length, 2);
    assert.equal("session_id" in adminConversation, false);

    const googleStatus = await fetch(`${baseUrl}/api/admin/google/status`);
    assert.equal(googleStatus.status, 200);
    const googlePayload = await googleStatus.json();
    assert.equal(googlePayload.status, "disconnected");
    assert.equal("token" in googlePayload, false);

    const googleConnect = await fetch(`${baseUrl}/api/admin/google/connect`, { redirect: "manual" });
    assert.equal(googleConnect.status, 503);

    const adminPage = await fetch(`${baseUrl}/adm`);
    assert.equal(adminPage.status, 200);
    assert.match(await adminPage.text(), /<div id="root"><\/div>/);

    const invalidSession = await fetch(`${baseUrl}/api/conversations/current?session_id=invalid session`);
    assert.equal(invalidSession.status, 422);

    const talentPreview = await fetch(`${baseUrl}/api/forms/talent-preview`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        requester_name: "Taylor Recruiter",
        requester_email: "taylor@example.com",
        job_title: "VP of AI Product",
        search_criteria_1: "B2B SaaS leadership with AI product strategy",
        started_at_ms: Date.now() - 5000,
        honeypot: "",
      }),
    });
    assert.equal(talentPreview.status, 201);
    const talentPreviewPayload = await talentPreview.json();
    assert.equal(talentPreviewPayload.ok, true);
    assert.ok(talentPreviewPayload.reference_id >= 1);

    const contact = await fetch(`${baseUrl}/api/forms/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Jordan Builder",
        email: "jordan@example.com",
        subject: "Automation project",
        message: "We want to discuss a custom workflow automation project for our team.",
        started_at_ms: Date.now() - 5000,
        honeypot: "",
      }),
    });
    assert.equal(contact.status, 201);
    const contactPayload = await contact.json();
    assert.equal(contactPayload.ok, true);
    assert.ok(contactPayload.reference_id >= 1);
  } finally {
    server.kill();
  }
});
