import fs from "node:fs/promises";
import opentype from "opentype.js";
const url = "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf";
const file = "scripts/neon/Inter.ttf";
const out = "src/data/criativas-neon-outline.json";
try { await fs.access(file); } catch { const r = await fetch(url); if (!r.ok) throw new Error(`Font download failed: ${r.status}`); await fs.writeFile(file, Buffer.from(await r.arrayBuffer())); }
const b = await fs.readFile(file); const font = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
const size = 112; const scale = size / font.unitsPerEm; let x = 0; const chunks = [];
for (const ch of "CRIATIVAS") { const g = font.charToGlyph(ch); chunks.push(g.getPath(x, size, size).toPathData(2)); x += (g.advanceWidth || font.unitsPerEm) * scale; }
await fs.mkdir("src/data", { recursive: true }); await fs.writeFile(out, JSON.stringify({ text: "CRIATIVAS", font: "Inter", weight: 200, paths: chunks.flatMap((p) => p.split(/(?=M)/g).filter(Boolean)) }, null, 2));
console.log(`Generated ${out}`);
