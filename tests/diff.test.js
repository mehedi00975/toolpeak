/**
 * Tests for src/lib/diff.js — the Myers diff engine behind the Text Compare tool.
 */

const test = require("node:test");
const assert = require("node:assert");
const D = require("../src/lib/diff.js");

/* ------------------------------------------------------------------ *
 * Core sequence diff
 * ------------------------------------------------------------------ */

test("diffArrays: identical sequences produce a single equal run", () => {
  const ops = D.diffArrays([1, 2, 3], [1, 2, 3]);
  assert.strictEqual(ops.length, 1);
  assert.strictEqual(ops[0].type, "equal");
});

test("diffArrays: pure insertion", () => {
  const ops = D.diffArrays(["a"], ["a", "b"]);
  assert.deepStrictEqual(ops.map(o => o.type), ["equal", "insert"]);
  assert.deepStrictEqual(ops[1].value, ["b"]);
});

test("diffArrays: pure deletion", () => {
  const ops = D.diffArrays(["a", "b"], ["a"]);
  assert.deepStrictEqual(ops.map(o => o.type), ["equal", "delete"]);
  assert.deepStrictEqual(ops[1].value, ["b"]);
});

test("diffArrays: empty inputs are handled", () => {
  assert.deepStrictEqual(D.diffArrays([], []), []);
  assert.deepStrictEqual(D.diffArrays([], ["a"]).map(o => o.type), ["insert"]);
  assert.deepStrictEqual(D.diffArrays(["a"], []).map(o => o.type), ["delete"]);
});

test("diffArrays: completely different sequences", () => {
  const ops = D.diffArrays(["a", "b"], ["x", "y"]);
  const types = ops.map(o => o.type).sort();
  assert.deepStrictEqual(types, ["delete", "insert"]);
});

test("diffArrays: reconstructing from ops yields both originals", () => {
  const a = "the quick brown fox jumps".split(" ");
  const b = "the slow brown cat jumps high".split(" ");
  const ops = D.diffArrays(a, b);

  const left = [], right = [];
  for (const op of ops) {
    if (op.type === "equal") { left.push(...op.value); right.push(...op.value); }
    else if (op.type === "delete") left.push(...op.value);
    else right.push(...op.value);
  }
  assert.deepStrictEqual(left, a);
  assert.deepStrictEqual(right, b);
});

/* ------------------------------------------------------------------ *
 * Line diff
 * ------------------------------------------------------------------ */

test("diffLines: identical text reports every line unchanged", () => {
  const rows = D.diffLines("one\ntwo\nthree", "one\ntwo\nthree");
  assert.ok(rows.every(r => r.type === "equal"));
  assert.strictEqual(D.summarize(rows).similarity, 100);
});

test("diffLines: a changed line is reported as a modification", () => {
  const rows = D.diffLines("hello world", "hello there");
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].type, "modify");
  assert.ok(Array.isArray(rows[0].words));
});

test("diffLines: an inserted line does not shift everything after it", () => {
  const rows = D.diffLines("a\nb\nc", "a\nNEW\nb\nc");
  const inserts = rows.filter(r => r.type === "insert");
  assert.strictEqual(inserts.length, 1);
  assert.strictEqual(inserts[0].right, "NEW");
  // The three original lines must still be recognized as unchanged.
  assert.strictEqual(rows.filter(r => r.type === "equal").length, 3);
});

test("diffLines: a deleted line is detected", () => {
  const rows = D.diffLines("a\nb\nc", "a\nc");
  const deletes = rows.filter(r => r.type === "delete");
  assert.strictEqual(deletes.length, 1);
  assert.strictEqual(deletes[0].left, "b");
});

test("diffLines: line numbers on both sides are correct", () => {
  const rows = D.diffLines("a\nb\nc", "a\nx\nc");
  assert.strictEqual(rows[0].leftNumber, 1);
  assert.strictEqual(rows[0].rightNumber, 1);
  assert.strictEqual(rows[2].leftNumber, 3);
  assert.strictEqual(rows[2].rightNumber, 3);
});

test("diffLines: normalizes CRLF line endings", () => {
  const rows = D.diffLines("a\r\nb", "a\nb");
  assert.ok(rows.every(r => r.type === "equal"));
});

test("diffLines: ignoreCase option", () => {
  assert.strictEqual(D.diffLines("Hello", "hello")[0].type, "modify");
  assert.strictEqual(D.diffLines("Hello", "hello", { ignoreCase: true })[0].type, "equal");
});

test("diffLines: ignoreWhitespace option", () => {
  assert.strictEqual(D.diffLines("a  b", "a b")[0].type, "modify");
  assert.strictEqual(D.diffLines("a  b", "a b", { ignoreWhitespace: true })[0].type, "equal");
});

test("diffLines: ignorePunctuation option", () => {
  assert.strictEqual(
    D.diffLines("hello, world!", "hello world", { ignorePunctuation: true })[0].type,
    "equal"
  );
});

test("diffLines: ignore options never alter the displayed text", () => {
  const rows = D.diffLines("Hello   World", "hello world", {
    ignoreCase: true, ignoreWhitespace: true
  });
  assert.strictEqual(rows[0].left, "Hello   World");
  assert.strictEqual(rows[0].right, "hello world");
});

/* ------------------------------------------------------------------ *
 * Word diff
 * ------------------------------------------------------------------ */

test("diffWords: isolates the single changed word", () => {
  const parts = D.diffWords("the quick brown fox", "the quick red fox");
  const del = parts.filter(p => p.type === "delete").map(p => p.value).join("");
  const ins = parts.filter(p => p.type === "insert").map(p => p.value).join("");
  assert.ok(del.includes("brown"), del);
  assert.ok(ins.includes("red"), ins);
});

test("diffWords: identical lines produce only equal parts", () => {
  assert.ok(D.diffWords("same text", "same text").every(p => p.type === "equal"));
});

test("diffChars: character-level differences", () => {
  const parts = D.diffChars("cat", "cot");
  assert.ok(parts.some(p => p.type === "delete" && p.value === "a"));
  assert.ok(parts.some(p => p.type === "insert" && p.value === "o"));
});

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

test("summarize: counts each change type", () => {
  const rows = D.diffLines("a\nb\nc\nd", "a\nB\nc\ne\nf");
  const s = D.summarize(rows);
  assert.strictEqual(s.unchanged, 2);   // a and c
  assert.ok(s.modified >= 1);
  assert.ok(s.changed >= 1);
  assert.strictEqual(s.identical, false);
});

test("summarize: identical text scores 100 percent", () => {
  const s = D.summarize(D.diffLines("same\nlines", "same\nlines"));
  assert.strictEqual(s.similarity, 100);
  assert.strictEqual(s.identical, true);
  assert.strictEqual(s.changed, 0);
});

test("summarize: empty input is treated as identical", () => {
  assert.strictEqual(D.summarize(D.diffLines("", "")).identical, true);
});

/* ------------------------------------------------------------------ *
 * Unified output
 * ------------------------------------------------------------------ */

test("toUnified: produces standard diff markers", () => {
  const out = D.toUnified(D.diffLines("a\nb\nc", "a\nx\nc"), {});
  assert.ok(out.includes("--- Original"));
  assert.ok(out.includes("+++ Changed"));
  assert.ok(out.includes("@@"));
  assert.ok(out.includes("-b"));
  assert.ok(out.includes("+x"));
});

test("toUnified: says so when the texts are identical", () => {
  const out = D.toUnified(D.diffLines("same", "same"), {});
  assert.ok(/identical/.test(out), out);
});

test("toUnified: honors custom file labels", () => {
  const out = D.toUnified(D.diffLines("a", "b"), { leftName: "v1.txt", rightName: "v2.txt" });
  assert.ok(out.includes("--- v1.txt"));
  assert.ok(out.includes("+++ v2.txt"));
});

/* ------------------------------------------------------------------ *
 * Performance and robustness
 * ------------------------------------------------------------------ */

test("diffLines: handles a large document quickly", () => {
  const a = Array.from({ length: 2000 }, (_, i) => `line ${i}`).join("\n");
  const b = Array.from({ length: 2000 }, (_, i) => (i === 1000 ? "CHANGED" : `line ${i}`)).join("\n");
  const started = Date.now();
  const rows = D.diffLines(a, b);
  const elapsed = Date.now() - started;
  assert.ok(elapsed < 3000, `took ${elapsed}ms, expected under 3000ms`);
  assert.strictEqual(D.summarize(rows).unchanged, 1999);
});

test("diffLines: pathological input does not hang", () => {
  // Two long sequences with nothing in common is the worst case for Myers.
  const a = Array.from({ length: 3000 }, (_, i) => `a${i}`).join("\n");
  const b = Array.from({ length: 3000 }, (_, i) => `b${i}`).join("\n");
  const started = Date.now();
  D.diffLines(a, b);
  assert.ok(Date.now() - started < 5000, "pathological diff took too long");
});

test("splitLines: trailing newline produces a trailing empty line", () => {
  assert.deepStrictEqual(D.splitLines("a\nb\n"), ["a", "b", ""]);
});
