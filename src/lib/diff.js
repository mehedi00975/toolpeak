/**
 * diff.js — Myers O(ND) diff, plus word-level and character-level refinement.
 *
 * Dependency-free and pure, so tests/diff.test.js can hit it in Node and the
 * Text Compare tool can inline it in the browser.
 *
 * Reference: Eugene W. Myers, "An O(ND) Difference Algorithm and Its
 * Variations" (1986) — the same algorithm Git uses by default.
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.TextDiff = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /**
   * Core sequence diff. Returns ops: {type: "equal"|"insert"|"delete", value: [...]}
   * `a` and `b` are arrays; equality is by === after optional normalization.
   */
  function diffArrays(a, b, isEqual) {
    var eq = isEqual || function (x, y) { return x === y; };
    var n = a.length, m = b.length;

    // Trim the common prefix and suffix first — cheap and hugely effective on
    // real edits, where usually only the middle changed.
    var prefix = 0;
    while (prefix < n && prefix < m && eq(a[prefix], b[prefix])) prefix++;
    var suffix = 0;
    while (suffix < n - prefix && suffix < m - prefix &&
           eq(a[n - 1 - suffix], b[m - 1 - suffix])) suffix++;

    var aMid = a.slice(prefix, n - suffix);
    var bMid = b.slice(prefix, m - suffix);

    var ops = [];
    if (prefix) ops.push({ type: "equal", value: a.slice(0, prefix) });

    if (aMid.length && bMid.length) {
      ops = ops.concat(myers(aMid, bMid, eq));
    } else if (aMid.length) {
      ops.push({ type: "delete", value: aMid });
    } else if (bMid.length) {
      ops.push({ type: "insert", value: bMid });
    }

    if (suffix) ops.push({ type: "equal", value: a.slice(n - suffix) });
    return merge(ops);
  }

  function myers(a, b, eq) {
    var n = a.length, m = b.length;
    var max = n + m;

    // Guard rail: a 2000x2000 diff is ~4M steps, still fast; beyond that we bail
    // to a coarse "replace" so the browser tab never freezes on a pasted book.
    if (n * m > 8000000) {
      return [{ type: "delete", value: a }, { type: "insert", value: b }];
    }

    var v = new Int32Array(2 * max + 1);
    var offset = max;
    var trace = [];

    for (var d = 0; d <= max; d++) {
      trace.push(v.slice());
      for (var k = -d; k <= d; k += 2) {
        var x;
        if (k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])) {
          x = v[offset + k + 1];
        } else {
          x = v[offset + k - 1] + 1;
        }
        var y = x - k;
        while (x < n && y < m && eq(a[x], b[y])) { x++; y++; }
        v[offset + k] = x;
        if (x >= n && y >= m) return backtrack(trace, a, b, offset, d);
      }
    }
    return [{ type: "delete", value: a }, { type: "insert", value: b }];
  }

  function backtrack(trace, a, b, offset, d) {
    var ops = [];
    var x = a.length, y = b.length;

    for (var step = d; step > 0; step--) {
      var v = trace[step];
      var k = x - y;
      var prevK;
      if (k === -step || (k !== step && v[offset + k - 1] < v[offset + k + 1])) {
        prevK = k + 1;
      } else {
        prevK = k - 1;
      }
      var prevX = v[offset + prevK];
      var prevY = prevX - prevK;

      while (x > prevX && y > prevY) {
        ops.unshift({ type: "equal", value: [a[x - 1]] });
        x--; y--;
      }
      if (step > 0) {
        if (x === prevX) { ops.unshift({ type: "insert", value: [b[y - 1]] }); y--; }
        else { ops.unshift({ type: "delete", value: [a[x - 1]] }); x--; }
      }
    }
    while (x > 0 && y > 0) {
      ops.unshift({ type: "equal", value: [a[x - 1]] });
      x--; y--;
    }
    while (x > 0) { ops.unshift({ type: "delete", value: [a[--x]] }); }
    while (y > 0) { ops.unshift({ type: "insert", value: [b[--y]] }); }
    return ops;
  }

  function merge(ops) {
    var out = [];
    for (var i = 0; i < ops.length; i++) {
      if (!ops[i].value.length) continue;
      var last = out[out.length - 1];
      if (last && last.type === ops[i].type) {
        last.value = last.value.concat(ops[i].value);
      } else {
        out.push({ type: ops[i].type, value: ops[i].value.slice() });
      }
    }
    return out;
  }

  /* ------------------------------------------------------------------ *
   * Text-level helpers
   * ------------------------------------------------------------------ */

  function normalizeLine(line, opts) {
    var s = line;
    if (opts.ignoreCase) s = s.toLowerCase();
    if (opts.ignoreWhitespace) s = s.replace(/\s+/g, " ").trim();
    if (opts.ignorePunctuation) s = s.replace(/[^\p{L}\p{N}\s]/gu, "");
    return s;
  }

  function splitLines(text) {
    return String(text == null ? "" : text).replace(/\r\n?/g, "\n").split("\n");
  }

  /** Splits into words while keeping the whitespace as its own tokens. */
  function splitWords(text) {
    return String(text == null ? "" : text).split(/(\s+)/).filter(function (t) { return t !== ""; });
  }

  /**
   * diffLines(a, b, opts) -> array of rows for a side-by-side or unified view.
   * Each row: { type, left, right, leftNumber, rightNumber, words? }
   */
  function diffLines(aText, bText, opts) {
    opts = opts || {};
    var a = splitLines(aText);
    var b = splitLines(bText);

    var normA = a.map(function (l) { return normalizeLine(l, opts); });
    var normB = b.map(function (l) { return normalizeLine(l, opts); });

    // Diff over the normalized forms but emit the original text.
    var indexA = normA.map(function (v, i) { return { key: v, i: i }; });
    var indexB = normB.map(function (v, i) { return { key: v, i: i }; });
    var ops = diffArrays(indexA, indexB, function (x, y) { return x.key === y.key; });

    var rows = [];
    var ln = 1, rn = 1;

    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      if (op.type === "equal") {
        op.value.forEach(function (item) {
          rows.push({
            type: "equal",
            left: a[item.i], right: b[item.i] !== undefined ? b[item.i] : a[item.i],
            leftNumber: ln++, rightNumber: rn++
          });
        });
      } else if (op.type === "delete") {
        // Pair a delete run with the insert run that follows it: those are edits.
        var next = ops[i + 1];
        if (next && next.type === "insert") {
          var dels = op.value, ins = next.value;
          var pairs = Math.max(dels.length, ins.length);
          for (var p = 0; p < pairs; p++) {
            var lIdx = dels[p], rIdx = ins[p];
            if (lIdx !== undefined && rIdx !== undefined) {
              rows.push({
                type: "modify",
                left: a[lIdx.i], right: b[rIdx.i],
                leftNumber: ln++, rightNumber: rn++,
                words: diffWords(a[lIdx.i], b[rIdx.i], opts)
              });
            } else if (lIdx !== undefined) {
              rows.push({ type: "delete", left: a[lIdx.i], right: null, leftNumber: ln++, rightNumber: null });
            } else {
              rows.push({ type: "insert", left: null, right: b[rIdx.i], leftNumber: null, rightNumber: rn++ });
            }
          }
          i++; // consume the paired insert
        } else {
          op.value.forEach(function (item) {
            rows.push({ type: "delete", left: a[item.i], right: null, leftNumber: ln++, rightNumber: null });
          });
        }
      } else if (op.type === "insert") {
        op.value.forEach(function (item) {
          rows.push({ type: "insert", left: null, right: b[item.i], leftNumber: null, rightNumber: rn++ });
        });
      }
    }

    return rows;
  }

  /** Word-level diff of two single lines. */
  function diffWords(aLine, bLine, opts) {
    opts = opts || {};
    var a = splitWords(aLine);
    var b = splitWords(bLine);
    var eq = function (x, y) {
      if (opts.ignoreCase) return x.toLowerCase() === y.toLowerCase();
      return x === y;
    };
    return diffArrays(a, b, eq).map(function (op) {
      return { type: op.type, value: op.value.join("") };
    });
  }

  /** Character-level diff — used for very short inputs. */
  function diffChars(aText, bText, opts) {
    opts = opts || {};
    var a = String(aText == null ? "" : aText).split("");
    var b = String(bText == null ? "" : bText).split("");
    var eq = function (x, y) {
      return opts.ignoreCase ? x.toLowerCase() === y.toLowerCase() : x === y;
    };
    return diffArrays(a, b, eq).map(function (op) {
      return { type: op.type, value: op.value.join("") };
    });
  }

  /** Counts for the summary bar above the diff. */
  function summarize(rows) {
    var s = { added: 0, removed: 0, modified: 0, unchanged: 0, total: rows.length };
    rows.forEach(function (r) {
      if (r.type === "insert") s.added++;
      else if (r.type === "delete") s.removed++;
      else if (r.type === "modify") s.modified++;
      else s.unchanged++;
    });
    s.changed = s.added + s.removed + s.modified;
    s.identical = s.changed === 0;
    // Similarity as the share of lines that survived unchanged.
    s.similarity = s.total ? Math.round((s.unchanged / s.total) * 1000) / 10 : 100;
    return s;
  }

  /** Standard unified diff text, so the result can be pasted into a ticket. */
  function toUnified(rows, opts) {
    opts = opts || {};
    var context = opts.context === undefined ? 3 : opts.context;
    var out = [];
    out.push("--- " + (opts.leftName || "Original"));
    out.push("+++ " + (opts.rightName || "Changed"));

    // Expand modify rows into a delete + insert pair, the way diff(1) does.
    var flat = [];
    rows.forEach(function (r) {
      if (r.type === "modify") {
        flat.push({ type: "delete", left: r.left, leftNumber: r.leftNumber });
        flat.push({ type: "insert", right: r.right, rightNumber: r.rightNumber });
      } else flat.push(r);
    });

    var i = 0;
    while (i < flat.length) {
      if (flat[i].type === "equal") { i++; continue; }
      var start = Math.max(0, i - context);
      var end = i;
      while (end < flat.length) {
        if (flat[end].type !== "equal") { end++; continue; }
        var run = 0;
        while (end + run < flat.length && flat[end + run].type === "equal") run++;
        if (run > context * 2 || end + run >= flat.length) break;
        end += run;
      }
      var hunkEnd = Math.min(flat.length, end + context);
      var slice = flat.slice(start, hunkEnd);
      var lStart = null, rStart = null, lCount = 0, rCount = 0;
      slice.forEach(function (r) {
        if (r.leftNumber != null) { if (lStart === null) lStart = r.leftNumber; lCount++; }
        if (r.rightNumber != null) { if (rStart === null) rStart = r.rightNumber; rCount++; }
      });
      out.push("@@ -" + (lStart || 0) + "," + lCount + " +" + (rStart || 0) + "," + rCount + " @@");
      slice.forEach(function (r) {
        if (r.type === "equal") out.push(" " + r.left);
        else if (r.type === "delete") out.push("-" + r.left);
        else if (r.type === "insert") out.push("+" + r.right);
      });
      i = hunkEnd;
    }

    if (out.length === 2) out.push("(the two texts are identical)");
    return out.join("\n");
  }

  return {
    diffArrays: diffArrays,
    diffLines: diffLines,
    diffWords: diffWords,
    diffChars: diffChars,
    summarize: summarize,
    toUnified: toUnified,
    splitLines: splitLines
  };
});
