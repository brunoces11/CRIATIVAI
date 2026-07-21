import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://criativai.example/", {
      headers: { accept: "text/html", host: "criativai.example" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete English landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="en">/i);
  assert.match(html, /Creative Artificial Intelligence/i);
  assert.match(html, /Featured Projects/i);
  assert.match(html, /Knowledge Grounding/i);
  assert.match(html, /Human Resources Automations/i);
  assert.match(html, /AI-First Trading Platform/i);
  assert.match(html, /Dante/i);
  assert.match(html, /Ready to Build Your Next/i);
  assert.match(html, /\/bruno-portrait\.png/i);
  assert.match(html, /https:\/\/criativai\.example\/og\.png/i);
});

test("ships accessible navigation and no starter preview markers", async () => {
  const response = await render();
  const html = await response.text();
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(html, /aria-label="Primary navigation"/i);
  assert.match(html, /aria-label="Language selector"/i);
  assert.match(html, /Portuguese — coming soon/i);
  assert.match(css, /prefers-reduced-motion/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});
