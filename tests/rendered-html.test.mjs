import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("builds a static Vite app shell", async () => {
  const html = await read("dist/index.html");
  const assets = await readdir(new URL("../dist/assets", import.meta.url));

  assert.match(html, /<div id="root"><\/div>/i);
  assert.match(html, /CriativAI — Creative Artificial Intelligence/i);
  assert.match(html, /https:\/\/criativai\.site\/og\.png/i);
  assert.ok(assets.some((asset) => asset.endsWith(".js")));
  assert.ok(assets.some((asset) => asset.endsWith(".css")));
});

test("keeps the three public pages in the client router", async () => {
  const app = await read("src/App.tsx");
  const home = await read("src/pages/Home.tsx");
  const humanResources = await read("src/pages/HumanResources.tsx");
  const style = await read("src/pages/StyleGuide.tsx");

  assert.match(app, /pathname === "\/human-resources"/);
  assert.match(app, /pathname === "\/style"/);
  assert.match(home, /Creative Artificial Intelligence|AI SOLUTIONS/i);
  assert.match(humanResources, /Executive search intelligence/i);
  assert.match(style, /Style Guide/i);
});

test("ships Target Mode and no starter scaffold markers", async () => {
  const app = await read("src/App.tsx");
  const targetMode = await read("src/components/target-mode/TargetMode.tsx");

  assert.match(app, /<TargetMode \/>/);
  assert.match(targetMode, /TargetMode/);
  assert.doesNotMatch(app + targetMode, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});

test("ships the chat widget wired to the backend stream", async () => {
  const app = await read("src/App.tsx");
  const chatWidget = await read("src/components/ChatWidget.tsx");
  const chatStyles = await read("src/components/ChatWidget.css");

  assert.match(app, /<ChatWidget \/>/);
  assert.match(app, /pathname !== "\/adm"/);
  assert.match(chatWidget, /SESSION_STORAGE_KEY = "chat_session_id"/);
  assert.match(chatWidget, /sendChatMessage/);
  assert.match(chatStyles, /width: 110px/);
  assert.match(chatStyles, /chat-message--user/);
  assert.match(chatStyles, /chat-message--assistant/);
});
