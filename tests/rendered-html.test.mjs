import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readRoute(path) {
  return readFile(new URL(`../out/${path}`, import.meta.url), "utf8");
}

test("exports the complete English landing page", async () => {
  const html = await readRoute("index.html");

  assert.match(html, /<html lang="en">/i);
  assert.match(html, /Creative Artificial Intelligence/i);
  assert.match(html, /Featured Projects/i);
  assert.match(html, /Knowledge Grounding/i);
  assert.match(html, /Human Resources Automations/i);
  assert.match(html, /AI-First Trading Platform/i);
  assert.match(html, /Dante/i);
  assert.match(html, /Ready to Build Your Next/i);
  assert.match(html, /\/bruno-portrait\.png/i);
  assert.match(html, /https:\/\/criativai\.site\/og\.png/i);
});

test("exports the Human Resources page and Style page", async () => {
  const humanResources = await readRoute("human-resources.html");
  const style = await readRoute("style.html");

  assert.match(humanResources, /Executive search intelligence/i);
  assert.match(humanResources, /Find the right professionals/i);
  assert.match(style, /Style Guide/i);
  assert.match(style, /Color system/i);
});

test("ships accessible navigation and no starter preview markers", async () => {
  const html = await readRoute("index.html");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(html, /aria-label="Primary navigation"/i);
  assert.match(html, /aria-label="Language selector"/i);
  assert.match(html, /Portuguese \u2014 coming soon/i);
  assert.match(css, /prefers-reduced-motion/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});
