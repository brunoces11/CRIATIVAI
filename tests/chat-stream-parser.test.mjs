import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import test from "node:test";

async function loadChatStreamModule() {
  const source = await readFile(new URL("../src/lib/chatStream.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

function streamFromChunks(chunks) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

test("parses JSON split across chunks", async () => {
  const { parseNdjsonStream } = await loadChatStreamModule();
  const stream = streamFromChunks(['{"event":"delta","te', 'xt":"hello"}\n']);

  const events = [];
  for await (const event of parseNdjsonStream(stream)) events.push(event);

  assert.deepEqual(events, [{ event: "delta", text: "hello" }]);
});

test("parses multiple lines in one chunk and preserves unicode", async () => {
  const { parseNdjsonStream } = await loadChatStreamModule();
  const stream = streamFromChunks([
    '{"event":"session_start","session_id":"abc_1234567890123"}\n{"event":"delta","text":"ola mundo"}\n{"event":"delta","text":" cafe"}\n{"event":"done"}\n',
  ]);

  const events = [];
  for await (const event of parseNdjsonStream(stream)) events.push(event);

  assert.deepEqual(events, [
    { event: "session_start", session_id: "abc_1234567890123" },
    { event: "delta", text: "ola mundo" },
    { event: "delta", text: " cafe" },
    { event: "done" },
  ]);
});

test("rejects unsupported stream events", async () => {
  const { parseNdjsonStream } = await loadChatStreamModule();
  const stream = streamFromChunks(['{"event":"unknown"}\n']);

  await assert.rejects(async () => {
    for await (const _event of parseNdjsonStream(stream)) {
      // Consume the stream until the parser raises.
    }
  }, /Unsupported stream event/);
});
