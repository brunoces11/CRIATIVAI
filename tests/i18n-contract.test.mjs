import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("welcome catalogs have identical CTA keys", async () => {
  const pt = JSON.parse(await read("Chat-Welcome-Messages-br.json"));
  const en = JSON.parse(await read("Chat-Welcome-Messages-en.json"));
  assert.deepEqual(Object.keys(pt).sort(), Object.keys(en).sort());
  assert.ok(Object.keys(pt).length > 0);
});

test("i18n configuration exposes the required languages and fallback", async () => {
  const constants = await read("src/i18n/constants.ts");
  const config = await read("src/i18n/config.ts");
  assert.match(constants, /\["pt", "en"\]/);
  assert.match(constants, /DEFAULT_LANGUAGE[^\n]*"pt"/);
  assert.match(constants, /FALLBACK_LANGUAGE[^\n]*"en"/);
  assert.match(config, /fallbackLng:\s*FALLBACK_LANGUAGE/);
  assert.match(config, /supportedLngs:\s*\["pt", "en"\]/);
  assert.match(config, /useSuspense:\s*false/);
});

test("localized route helper strips and restores only the en prefix", async () => {
  const helper = await read("src/i18n/getCurrentLanguage.ts");
  assert.match(helper, /startsWith\("\/en\/"\)/);
  assert.match(helper, /replace\(\/\^\\\/en\(\?=\\\/\|\$\)\//);
  assert.match(helper, /url\.search/);
  assert.match(helper, /url\.hash/);
});

test("header and chat use the planned language contracts", async () => {
  const header = await read("src/components/SiteHeader.tsx");
  const stream = await read("src/lib/chatStream.ts");
  const app = await read("src/App.tsx");
  assert.match(header, /flag-brazil\.svg/);
  assert.match(header, /flag-usa\.svg/);
  assert.match(header, /languageSelector\("desktop"\)/);
  assert.match(header, /languageSelector\("mobile"\)/);
  assert.match(header, /getLocalizedPath/);
  assert.match(stream, /language,\n/);
  assert.match(stream, /welcome_key: welcomeKey, language/);
  assert.match(app, /replace\(\/\^\\\/en\(\?=\\\/\|\$\)\//);
  assert.match(app, /pathname === "\/"\) return <VideoPageLazy \/>/);
  assert.match(app, /pathname === "\/video"\) return <Home \/>/);
});

test("home services cards use the localized catalog", async () => {
  const video = await read("src/pages/Video.tsx");
  const pt = JSON.parse(await read("src/locales/pt.json"));
  const en = JSON.parse(await read("src/locales/en.json"));

  assert.match(video, /videoServices\.\$\{service\.index\}\.title/);
  assert.match(video, /videoServices\.\$\{service\.index\}\.text/);
  assert.doesNotMatch(video, /title:\s*"Product Design"/);
  assert.equal(Object.keys(pt.videoServices).length, 8);
  assert.deepEqual(Object.keys(pt.videoServices), Object.keys(en.videoServices));
});
