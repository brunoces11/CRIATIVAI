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

test("keeps the public pages in the client router", async () => {
  const app = await read("src/App.tsx");
  const home = await read("src/pages/Home.tsx");
  const humanResources = await read("src/pages/HumanResources.tsx");
  const style = await read("src/pages/StyleGuide.tsx");
  const talentPreview = await read("src/pages/TalentPreview.tsx");
  const contact = await read("src/pages/Contact.tsx");
  const admin = await read("src/pages/Admin.tsx");
  const privacyTerms = await read("src/pages/PrivacyTerms.tsx");

  assert.match(app, /pathname === "\/human-resources"/);
  assert.match(app, /pathname === "\/style"/);
  assert.match(app, /pathname === "\/talent-preview"/);
  assert.match(app, /pathname === "\/contact"/);
  assert.match(app, /pathname === "\/adm"/);
  assert.match(app, /pathname === "\/privacy" \|\| pathname === "\/terms"/);
  assert.match(home, /Creative Artificial Intelligence|AI SOLUTIONS/i);
  assert.match(humanResources, /AI for recruitment companies/i);
  assert.match(humanResources, /The era of hyper-personalization/i);
  assert.match(humanResources, /Recruitment Intelligence/i);
  assert.match(humanResources, /Digital Operations/i);
  assert.match(humanResources, /Business Discovery & Outbound/i);
  assert.doesNotMatch(humanResources, /What&apos;s included|How it works|Transparency &amp; reliability|Implementation/i);
  assert.match(style, /Style Guide/i);
  assert.match(talentPreview, /Talent[\s\S]*Preview/i);
  assert.match(talentPreview, /<textarea[\s\S]*name="search_criteria_1"/);
  assert.doesNotMatch(talentPreview, /search_criteria_2/);
  assert.doesNotMatch(talentPreview, /search_criteria_3/);
  assert.doesNotMatch(talentPreview, /search_criteria_4/);
  assert.match(contact, /Start a[\s\S]*conversation/i);
  assert.match(home, /href="\/privacy"/);
  assert.match(humanResources, /href="\/privacy"/);
  assert.match(contact, /href="\/privacy"/);
  assert.match(talentPreview, /href="\/privacy"/);
  assert.match(privacyTerms, /CriativAI Privacy &amp; Terms/);
  assert.match(privacyTerms, /Google Calendar/);
  assert.match(privacyTerms, /create, update, or cancel calendar events/);
  assert.match(home, /https:\/\/www\.youtube\.com\/@tutorialmasterbrasil/);
  assert.match(home, /https:\/\/github\.com\/brunoces11/);
  assert.match(home, /https:\/\/www\.linkedin\.com\/in\/brunoalecrim/);
  assert.match(home, /https:\/\/www\.behance\.net\/brunoalecrim/);
  assert.match(home, /target="_blank"/);
  assert.match(humanResources, /https:\/\/www\.youtube\.com\/@tutorialmasterbrasil/);
  assert.match(humanResources, /https:\/\/github\.com\/brunoces11/);
  assert.match(humanResources, /https:\/\/www\.linkedin\.com\/in\/brunoalecrim/);
  assert.match(humanResources, /https:\/\/www\.behance\.net\/brunoalecrim/);
  assert.match(humanResources, /target="_blank"/);
  assert.match(admin, /\/api\/admin\/conversations/);
  assert.match(admin, /\/api\/admin\/prompt/);
  assert.match(admin, /Configure prompt/);
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
  const siteHeader = await read("src/components/SiteHeader.tsx");
  const siteStyles = await read("src/styles.css");
  const chatStream = await read("src/lib/chatStream.ts");
  const viteConfig = await read("vite.config.ts");
  const icons = await readdir(new URL("../public/icons", import.meta.url));

  assert.match(app, /<ChatWidget \/>/);
  assert.match(app, /pathname !== "\/adm"/);
  assert.match(chatWidget, /SESSION_STORAGE_KEY = "chat_session_id"/);
  assert.match(chatWidget, /sendChatMessage/);
  assert.match(chatWidget, /const turnId = crypto\.randomUUID\(\)/);
  assert.match(chatWidget, /<MarkdownText text=\{message\.text\} \/>/);
  assert.match(chatWidget, /function parseMarkdownBlocks/);
  assert.match(chatWidget, /target="_blank" rel="noreferrer noopener"/);
  assert.match(chatWidget, /src="\/icons\/chat-launcher\.svg"/);
  assert.match(chatWidget, /src="\/icons\/chat-collapse\.svg"/);
  assert.match(chatWidget, /src="\/icons\/chat-send\.svg"/);
  assert.match(siteHeader, /src="\/icons\/flag-uk\.svg"/);
  assert.match(siteHeader, /src="\/icons\/flag-brazil\.svg"/);
  assert.match(chatStyles, /width: 110px/);
  assert.match(chatStyles, /\.chat-markdown/);
  assert.match(chatStyles, /\.chat-widget--open \.chat-panel/);
  assert.match(chatStyles, /transform: scaleY\(0\.72\) translateY\(18px\)/);
  assert.match(chatStyles, /\.chat-panel__header[\s\S]*background: var\(--accent\)/);
  assert.match(chatWidget, /className="chat-panel__avatar"/);
  assert.match(chatWidget, /src="\/bruno-portrait\.png"/);
  assert.match(chatStyles, /\.chat-panel__avatar[\s\S]*transform: scaleX\(-1\)/);
  assert.match(chatStyles, /\.chat-panel__messages[\s\S]*background: #fff/);
  assert.match(chatStyles, /\.chat-panel__form[\s\S]*background: #fff/);
  assert.match(chatStyles, /\.chat-panel__feedback[\s\S]*align-items: center/);
  assert.match(siteStyles, /\.language-option__icon/);
  assert.ok(icons.includes("chat-launcher.svg"));
  assert.ok(icons.includes("chat-collapse.svg"));
  assert.ok(icons.includes("chat-send.svg"));
  assert.ok(icons.includes("flag-uk.svg"));
  assert.ok(icons.includes("flag-brazil.svg"));
  assert.match(chatStream, /tool_status"; message: string/);
  assert.match(viteConfig, /proxy/);
  assert.match(viteConfig, /127\.0\.0\.1:8000/);
  assert.match(chatStyles, /min-height: 37px/);
  assert.match(chatStyles, /chat-message--user/);
  assert.match(chatStyles, /chat-message--assistant/);
});
