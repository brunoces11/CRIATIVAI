import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function flattenCatalog(value, path = "", result = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenCatalog(item, `${path}[${index}]`, result));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      flattenCatalog(item, path ? `${path}.${key}` : key, result);
    }
  } else {
    result.set(path, typeof value);
  }
  return result;
}

function assertNonEmptyText(value, path) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNonEmptyText(item, `${path}[${index}]`));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) assertNonEmptyText(item, `${path}.${key}`);
  } else {
    assert.equal(typeof value, "string", `${path} must be text`);
    assert.ok(value.trim().length > 0, `${path} must not be empty`);
  }
}

test("welcome catalogs have identical CTA keys", async () => {
  const pt = JSON.parse(await read("Chat-Welcome-Messages-br.json"));
  const en = JSON.parse(await read("Chat-Welcome-Messages-en.json"));
  assert.deepEqual(Object.keys(pt).sort(), Object.keys(en).sort());
  assert.ok(Object.keys(pt).length > 0);
});

test("site catalogs have identical key paths and value types", async () => {
  const pt = flattenCatalog(JSON.parse(await read("src/locales/pt.json")));
  const en = flattenCatalog(JSON.parse(await read("src/locales/en.json")));

  assert.deepEqual([...pt.keys()], [...en.keys()]);
  assert.deepEqual([...pt.values()], [...en.values()]);
  assert.ok(pt.size > 0);
});

test("all literal translation keys used by public UI exist in both catalogs", async () => {
  const publicFiles = [
    "src/App.tsx",
    "src/components/ChatWidget.tsx",
    "src/components/RecruitmentAiConsole.tsx",
    "src/components/ServiceCatalogCard.tsx",
    "src/components/SiteHeader.tsx",
    "src/pages/AboutMe.tsx",
    "src/pages/Awards.tsx",
    "src/pages/Contact.tsx",
    "src/pages/FoundingSdr.tsx",
    "src/pages/HireMe.tsx",
    "src/pages/Home.tsx",
    "src/pages/HumanResources.tsx",
    "src/pages/Lab.tsx",
    "src/pages/PrivacyTerms.tsx",
    "src/pages/PromptApp.tsx",
    "src/pages/Research.tsx",
    "src/pages/Services.tsx",
    "src/pages/TalentPreview.tsx",
    "src/pages/ConcatenatedPromptTechnique.tsx",
    "src/pages/UxPromptDesign.tsx",
    "src/pages/Video.tsx",
  ];
  const pt = flattenCatalog(JSON.parse(await read("src/locales/pt.json")));
  const en = flattenCatalog(JSON.parse(await read("src/locales/en.json")));
  const missing = [];

  for (const file of publicFiles) {
    const source = await read(file);
    for (const match of source.matchAll(/\bt\(\s*["']([^"']+)["']/g)) {
      const key = match[1];
      if (!pt.has(key) || !en.has(key)) missing.push(`${file}: ${key}`);
    }
  }

  assert.deepEqual(missing, []);
});

test("research and lab routes have complete localized content sets", async () => {
  const pt = JSON.parse(await read("src/locales/pt.json"));
  const en = JSON.parse(await read("src/locales/en.json"));
  for (const catalog of [pt, en]) {
    assert.equal(Object.keys(catalog.lab.builds).length, 10);
    assert.equal(Object.keys(catalog.research.topics).length, 6);
    assert.equal(Object.keys(catalog.cpt.useCases).length, 9);
    assert.equal(Object.keys(catalog.uxPrompt.examples).length, 4);
    assert.equal(Object.keys(catalog.promptApp.advantages).length, 7);
  }
});

test("about and awards routes have complete localized content sets", async () => {
  const pt = JSON.parse(await read("src/locales/pt.json"));
  const en = JSON.parse(await read("src/locales/en.json"));
  for (const catalog of [pt, en]) {
    assert.equal(catalog.about.heroBioMore.length, 4);
    assert.equal(Object.keys(catalog.about.careerStory).length, 5);
    assert.equal(Object.keys(catalog.awards.items).length, 8);
    assertNonEmptyText(catalog.about.heroBioLead, "about.heroBioLead");
    assertNonEmptyText(catalog.about.heroBioMore, "about.heroBioMore");
    assertNonEmptyText(catalog.about.careerStory, "about.careerStory");
    assertNonEmptyText(catalog.awards, "awards");
  }
});

test("i18n configuration exposes the required languages and fallback", async () => {
  const constants = await read("src/i18n/constants.ts");
  const config = await read("src/i18n/config.ts");
  const main = await read("src/main.tsx");
  assert.match(constants, /\["pt", "en"\]/);
  assert.match(constants, /DEFAULT_LANGUAGE[^\n]*"pt"/);
  assert.match(constants, /FALLBACK_LANGUAGE[^\n]*"en"/);
  assert.match(config, /fallbackLng:\s*FALLBACK_LANGUAGE/);
  assert.match(config, /supportedLngs:\s*SUPPORTED_LANGUAGES/);
  assert.match(config, /useSuspense:\s*false/);
  assert.match(config, /export async function initializeI18n\(language: Language\)/);
  assert.match(config, /lng:\s*language/);
  assert.match(main, /await initializeI18n\(currentLanguage\)/);
  assert.match(main, /currentLanguage === "pt" \? "pt-BR" : "en-US"/);
  assert.doesNotMatch(main, /void i18n\.changeLanguage/);
});

test("localized route helper strips and restores only the en prefix", async () => {
  const helper = await read("src/i18n/getCurrentLanguage.ts");
  assert.match(helper, /startsWith\("\/en\/"\)/);
  assert.match(helper, /replace\(\/\^\\\/en\(\?=\\\/\|\$\)\//);
  assert.match(helper, /url\.search/);
  assert.match(helper, /url\.hash/);
  assert.match(helper, /return getLanguageFromPathname\(window\.location\.pathname\)/);
  assert.doesNotMatch(helper, /localStorage|LANGUAGE_STORAGE_KEY/);
});

test("route is the only language authority", async () => {
  const constants = await read("src/i18n/constants.ts");
  const header = await read("src/components/SiteHeader.tsx");

  assert.doesNotMatch(constants, /LANGUAGE_STORAGE_KEY/);
  assert.doesNotMatch(header, /LANGUAGE_STORAGE_KEY|localStorage/);
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
