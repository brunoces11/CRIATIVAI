import fs from "node:fs/promises";
import opentype from "opentype.js";

const fontUrl = "https://raw.githubusercontent.com/google/fonts/main/ofl/robotocondensed/RobotoCondensed%5Bwght%5D.ttf";
const fontFile = "scripts/neon/RobotoCondensed.ttf";
const outputFile = "src/data/creative-neon-outline.json";

await fs.mkdir("scripts/neon", { recursive: true });
await fs.mkdir("src/data", { recursive: true });
try { await fs.access(fontFile); } catch {
  const response = await fetch(fontUrl);
  if (!response.ok) throw new Error(`Unable to download font: ${response.status}`);
  await fs.writeFile(fontFile, Buffer.from(await response.arrayBuffer()));
}
const fontBuffer = await fs.readFile(fontFile);
const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));
const fontSize = 112;
const scale = fontSize / font.unitsPerEm;
let cursor = 0;
const commands = [];
for (const character of "CREATIVE") {
  const glyph = font.charToGlyph(character);
  const glyphPath = glyph.getPath(cursor, fontSize, fontSize);
  commands.push(glyphPath.toPathData(2));
  cursor += (glyph.advanceWidth || font.unitsPerEm) * scale;
}
const outline = commands.join(" ");
const paths = outline.split(/(?=M)/g).map((segment) => segment.trim()).filter(Boolean);
await fs.writeFile(outputFile, JSON.stringify({ text: "CREATIVE", font: "Roboto Condensed", weight: 300, paths }, null, 2));
console.log(`Generated ${outputFile}`);
