import fs from "node:fs/promises";
import opentype from "opentype.js";
const b = await fs.readFile("scripts/neon/RobotoCondensed.ttf");
const font = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
const text = "HYPER-PERSONALIZATION"; const size = 112; const scale = size / font.unitsPerEm; let x = 0; const paths = [];
for (const ch of text) { const g = font.charToGlyph(ch); paths.push(g.getPath(x, size, size).toPathData(2)); x += (g.advanceWidth || font.unitsPerEm) * scale; }
await fs.writeFile("src/data/hyper-personalization-neon-outline.json", JSON.stringify({ text, font: "Roboto Condensed", weight: 500, paths: paths.flatMap((p) => p.split(/(?=M)/g).filter(Boolean)) }, null, 2));
console.log("Generated hyper-personalization outline");
