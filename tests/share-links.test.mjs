import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("built post pages only expose X and email share links", async () => {
  const html = await readFile(
    new URL("../dist/posts/zh/ai-coding/index.html", import.meta.url),
    "utf8"
  );

  assert.match(html, /https:\/\/x\.com\/intent\/post\?url=/);
  assert.match(html, /mailto:\?subject=See%20this%20post&#38;body=/);

  assert.doesNotMatch(html, /https:\/\/wa\.me\/\?text=/);
  assert.doesNotMatch(html, /https:\/\/www\.facebook\.com\/sharer\.php\?u=/);
  assert.doesNotMatch(html, /https:\/\/t\.me\/share\/url\?url=/);
  assert.doesNotMatch(
    html,
    /https:\/\/pinterest\.com\/pin\/create\/button\/\?url=/
  );
});
