/**
 * qr.js — a self-contained QR Code encoder (ISO/IEC 18004).
 *
 * Written from the specification rather than pulled from npm: the whole file is
 * ~9 KB minified, has no dependencies, and runs identically in Node (for tests)
 * and in the browser (for the tool page).
 *
 * Supports versions 1-40, EC levels L/M/Q/H, and numeric / alphanumeric / byte
 * (UTF-8) modes with automatic mode and version selection.
 *
 * Usage:
 *   const m = QR.encode("https://toolpeak.com", { ecl: "M" });
 *   m.size        -> 25
 *   m.get(x, y)   -> true when the module is dark
 *   QR.toSvg(m, { scale: 8, margin: 4 })
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.QR = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Static tables
   * ------------------------------------------------------------------ */

  var ECL = { L: 0, M: 1, Q: 2, H: 3 };
  var ECL_FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 };

  // Error-correction codewords per block, indexed [ecl][version].
  var ECC_PER_BLOCK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  ];

  // Number of error-correction blocks, indexed [ecl][version].
  var NUM_BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
  ];

  var ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

  /* ------------------------------------------------------------------ *
   * Galois field GF(256) arithmetic for Reed-Solomon
   * ------------------------------------------------------------------ */

  function gfMultiply(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xff;
  }

  function rsDivisor(degree) {
    var result = new Uint8Array(degree);
    result[degree - 1] = 1;
    var root = 1;
    for (var i = 0; i < degree; i++) {
      for (var j = 0; j < result.length; j++) {
        result[j] = gfMultiply(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = gfMultiply(root, 0x02);
    }
    return result;
  }

  function rsRemainder(data, divisor) {
    var result = new Uint8Array(divisor.length);
    for (var i = 0; i < data.length; i++) {
      var factor = data[i] ^ result[0];
      result.copyWithin(0, 1);
      result[result.length - 1] = 0;
      for (var j = 0; j < divisor.length; j++) {
        result[j] ^= gfMultiply(divisor[j], factor);
      }
    }
    return result;
  }

  /* ------------------------------------------------------------------ *
   * Bit buffer
   * ------------------------------------------------------------------ */

  function BitBuffer() { this.bits = []; }
  BitBuffer.prototype.append = function (value, length) {
    for (var i = length - 1; i >= 0; i--) this.bits.push((value >>> i) & 1);
  };
  BitBuffer.prototype.length = function () { return this.bits.length; };

  /* ------------------------------------------------------------------ *
   * Segment building
   * ------------------------------------------------------------------ */

  function toUtf8(str) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(str);
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      else if (c >= 0xd800 && c < 0xdc00 && i + 1 < str.length) {
        var cp = 0x10000 + ((c - 0xd800) << 10) + (str.charCodeAt(++i) - 0xdc00);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
      } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
    return new Uint8Array(out);
  }

  function pickMode(text) {
    if (/^\d*$/.test(text)) return "numeric";
    for (var i = 0; i < text.length; i++) {
      if (ALPHANUMERIC.indexOf(text.charAt(i)) < 0) return "byte";
    }
    return "alphanumeric";
  }

  var MODE_BITS = { numeric: 1, alphanumeric: 2, byte: 4 };

  function charCountBits(mode, version) {
    var i = version <= 9 ? 0 : version <= 26 ? 1 : 2;
    if (mode === "numeric") return [10, 12, 14][i];
    if (mode === "alphanumeric") return [9, 11, 13][i];
    return [8, 16, 16][i];
  }

  /** Number of data bits a segment needs at a given version. */
  function segmentBitLength(mode, text, bytes, version) {
    var header = 4 + charCountBits(mode, version);
    if (mode === "numeric") {
      var groups = Math.floor(text.length / 3);
      var rest = text.length % 3;
      return header + groups * 10 + (rest === 1 ? 4 : rest === 2 ? 7 : 0);
    }
    if (mode === "alphanumeric") {
      return header + Math.floor(text.length / 2) * 11 + (text.length % 2) * 6;
    }
    return header + bytes.length * 8;
  }

  function writeSegment(bb, mode, text, bytes, version) {
    bb.append(MODE_BITS[mode], 4);
    var count = mode === "byte" ? bytes.length : text.length;
    bb.append(count, charCountBits(mode, version));

    if (mode === "numeric") {
      for (var i = 0; i < text.length;) {
        var n = Math.min(3, text.length - i);
        bb.append(parseInt(text.substr(i, n), 10), n * 3 + 1);
        i += n;
      }
    } else if (mode === "alphanumeric") {
      for (var j = 0; j + 1 < text.length; j += 2) {
        bb.append(ALPHANUMERIC.indexOf(text.charAt(j)) * 45 + ALPHANUMERIC.indexOf(text.charAt(j + 1)), 11);
      }
      if (text.length % 2) bb.append(ALPHANUMERIC.indexOf(text.charAt(text.length - 1)), 6);
    } else {
      for (var k = 0; k < bytes.length; k++) bb.append(bytes[k], 8);
    }
  }

  /* ------------------------------------------------------------------ *
   * Capacity helpers
   * ------------------------------------------------------------------ */

  function rawDataModules(version) {
    var result = (16 * version + 128) * version + 64;
    if (version >= 2) {
      var numAlign = Math.floor(version / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (version >= 7) result -= 36;
    }
    return result;
  }

  function dataCodewords(version, ecl) {
    return Math.floor(rawDataModules(version) / 8) -
      ECC_PER_BLOCK[ECL[ecl]][version] * NUM_BLOCKS[ECL[ecl]][version];
  }

  function alignmentPositions(version) {
    if (version === 1) return [];
    var numAlign = Math.floor(version / 7) + 2;
    var step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
    var result = [6];
    for (var pos = version * 4 + 10; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  /* ------------------------------------------------------------------ *
   * Matrix
   * ------------------------------------------------------------------ */

  function Matrix(size) {
    this.size = size;
    this.modules = [];
    this.reserved = [];
    for (var y = 0; y < size; y++) {
      this.modules.push(new Uint8Array(size));
      this.reserved.push(new Uint8Array(size));
    }
  }
  Matrix.prototype.get = function (x, y) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return false;
    return this.modules[y][x] === 1;
  };
  Matrix.prototype.set = function (x, y, dark, reserve) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return;
    this.modules[y][x] = dark ? 1 : 0;
    if (reserve) this.reserved[y][x] = 1;
  };

  function drawFunctionPatterns(m, version) {
    var size = m.size, i;

    // Timing patterns
    for (i = 0; i < size; i++) {
      m.set(6, i, i % 2 === 0, true);
      m.set(i, 6, i % 2 === 0, true);
    }

    // Three finder patterns with separators
    [[0, 0], [size - 7, 0], [0, size - 7]].forEach(function (p) {
      drawFinder(m, p[0], p[1]);
    });

    // Alignment patterns, skipping the three finder corners
    var pos = alignmentPositions(version);
    for (i = 0; i < pos.length; i++) {
      for (var j = 0; j < pos.length; j++) {
        var skip = (i === 0 && j === 0) ||
                   (i === 0 && j === pos.length - 1) ||
                   (i === pos.length - 1 && j === 0);
        if (!skip) drawAlignment(m, pos[i], pos[j]);
      }
    }

    // Reserve the format-information areas
    for (i = 0; i <= 8; i++) {
      if (i !== 6) { m.set(i, 8, false, true); m.set(8, i, false, true); }
    }
    for (i = 0; i < 8; i++) {
      m.set(size - 1 - i, 8, false, true);
      m.set(8, size - 1 - i, false, true);
    }
    m.set(8, size - 8, true, true); // always-dark module

    // Version information for version 7 and up
    if (version >= 7) {
      var rem = version;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      var bits = (version << 12) | rem;
      for (i = 0; i < 18; i++) {
        var dark = ((bits >>> i) & 1) === 1;
        var a = size - 11 + (i % 3), b = Math.floor(i / 3);
        m.set(a, b, dark, true);
        m.set(b, a, dark, true);
      }
    }
  }

  function drawFinder(m, ox, oy) {
    for (var dy = -1; dy <= 7; dy++) {
      for (var dx = -1; dx <= 7; dx++) {
        var x = ox + dx, y = oy + dy;
        if (x < 0 || y < 0 || x >= m.size || y >= m.size) continue;
        var d = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        m.set(x, y, d !== 2 && d <= 3, true);
      }
    }
  }

  function drawAlignment(m, cx, cy) {
    for (var dy = -2; dy <= 2; dy++) {
      for (var dx = -2; dx <= 2; dx++) {
        m.set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1, true);
      }
    }
  }

  function drawFormatBits(m, ecl, mask) {
    var data = (ECL_FORMAT_BITS[ecl] << 3) | mask;
    var rem = data;
    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    var bits = ((data << 10) | rem) ^ 0x5412;
    var size = m.size;

    for (i = 0; i <= 5; i++) m.set(8, i, ((bits >>> i) & 1) === 1, true);
    m.set(8, 7, ((bits >>> 6) & 1) === 1, true);
    m.set(8, 8, ((bits >>> 7) & 1) === 1, true);
    m.set(7, 8, ((bits >>> 8) & 1) === 1, true);
    for (i = 9; i < 15; i++) m.set(14 - i, 8, ((bits >>> i) & 1) === 1, true);

    for (i = 0; i < 8; i++) m.set(size - 1 - i, 8, ((bits >>> i) & 1) === 1, true);
    for (i = 8; i < 15; i++) m.set(8, size - 15 + i, ((bits >>> i) & 1) === 1, true);
    m.set(8, size - 8, true, true);
  }

  /** Split codewords into blocks, add EC, and interleave per the spec. */
  function addEccAndInterleave(data, version, ecl) {
    var numBlocks = NUM_BLOCKS[ECL[ecl]][version];
    var eccLen = ECC_PER_BLOCK[ECL[ecl]][version];
    var rawCodewords = Math.floor(rawDataModules(version) / 8);
    var numShort = numBlocks - (rawCodewords % numBlocks);
    var shortLen = Math.floor(rawCodewords / numBlocks);

    // Every block is padded to the same length (shortLen + 1) so the interleave
    // loop below can index them uniformly; the padding slot is then skipped.
    var blocks = [];
    var divisor = rsDivisor(eccLen);
    for (var i = 0, k = 0; i < numBlocks; i++) {
      var dataLen = shortLen - eccLen + (i < numShort ? 0 : 1);
      var dat = data.slice(k, k + dataLen);
      k += dataLen;
      var ecc = rsRemainder(dat, divisor);
      var block = new Uint8Array(shortLen + 1);
      block.set(dat, 0);
      // Short blocks leave one unused slot right after their data run.
      block.set(ecc, dat.length + (i < numShort ? 1 : 0));
      blocks.push(block);
    }

    var result = new Uint8Array(rawCodewords);
    var idx = 0;
    for (var col = 0; col < shortLen + 1; col++) {
      for (var b = 0; b < blocks.length; b++) {
        // Skip the padding slot that short blocks do not really have.
        if (col !== shortLen - eccLen || b >= numShort) {
          result[idx++] = blocks[b][col];
        }
      }
    }
    return result;
  }

  function drawCodewords(m, data) {
    var size = m.size;
    var i = 0; // bit index

    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5; // the vertical timing pattern column
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var x = right - j;
          var upward = ((right + 1) & 2) === 0;
          var y = upward ? size - 1 - vert : vert;
          if (m.reserved[y][x]) continue;
          var dark = i < data.length * 8 && ((data[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
          m.modules[y][x] = dark ? 1 : 0;
          i++;
        }
      }
    }
  }

  function applyMask(m, mask) {
    for (var y = 0; y < m.size; y++) {
      for (var x = 0; x < m.size; x++) {
        if (m.reserved[y][x]) continue;
        var invert;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          case 7: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          default: invert = false;
        }
        if (invert) m.modules[y][x] ^= 1;
      }
    }
  }

  /** The four penalty rules from the spec; lower total is a better mask. */
  function penalty(m) {
    var size = m.size, score = 0, x, y, i;

    // Rule 1: runs of 5+ same-color modules in a row or column.
    for (y = 0; y < size; y++) {
      var runColor = m.modules[y][0], runLen = 1;
      for (x = 1; x < size; x++) {
        if (m.modules[y][x] === runColor) { runLen++; }
        else { if (runLen >= 5) score += runLen - 2; runColor = m.modules[y][x]; runLen = 1; }
      }
      if (runLen >= 5) score += runLen - 2;
    }
    for (x = 0; x < size; x++) {
      var rc = m.modules[0][x], rl = 1;
      for (y = 1; y < size; y++) {
        if (m.modules[y][x] === rc) { rl++; }
        else { if (rl >= 5) score += rl - 2; rc = m.modules[y][x]; rl = 1; }
      }
      if (rl >= 5) score += rl - 2;
    }

    // Rule 2: 2x2 blocks of the same color.
    for (y = 0; y < size - 1; y++) {
      for (x = 0; x < size - 1; x++) {
        var c = m.modules[y][x];
        if (c === m.modules[y][x + 1] && c === m.modules[y + 1][x] && c === m.modules[y + 1][x + 1]) {
          score += 3;
        }
      }
    }

    // Rule 3: finder-like 1:1:3:1:1 patterns with 4 light modules on one side.
    var p1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    var p2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    function matches(get, len, pattern) {
      var hits = 0;
      for (var s = 0; s + pattern.length <= len; s++) {
        var ok = true;
        for (var k = 0; k < pattern.length; k++) {
          if (get(s + k) !== pattern[k]) { ok = false; break; }
        }
        if (ok) hits++;
      }
      return hits;
    }
    for (y = 0; y < size; y++) {
      (function (row) {
        var get = function (k) { return m.modules[row][k]; };
        score += 40 * (matches(get, size, p1) + matches(get, size, p2));
      })(y);
    }
    for (x = 0; x < size; x++) {
      (function (col) {
        var get = function (k) { return m.modules[k][col]; };
        score += 40 * (matches(get, size, p1) + matches(get, size, p2));
      })(x);
    }

    // Rule 4: deviation from a 50/50 dark/light balance.
    var dark = 0;
    for (y = 0; y < size; y++) for (x = 0; x < size; x++) dark += m.modules[y][x];
    var total = size * size;
    var k5 = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    score += Math.max(0, k5) * 10;

    return score;
  }

  /* ------------------------------------------------------------------ *
   * Public encode
   * ------------------------------------------------------------------ */

  /**
   * encode(text, { ecl, minVersion, maxVersion, mask, boostEcl })
   * Throws a plain Error when the text cannot fit in version 40.
   */
  function encode(text, opts) {
    opts = opts || {};
    var str = String(text == null ? "" : text);
    if (!str) throw new Error("Nothing to encode — enter some text or a link.");

    var ecl = (opts.ecl || "M").toUpperCase();
    if (!(ecl in ECL)) ecl = "M";
    var minVersion = Math.max(1, Math.min(40, opts.minVersion || 1));
    var maxVersion = Math.max(minVersion, Math.min(40, opts.maxVersion || 40));

    var mode = pickMode(str);
    var bytes = mode === "byte" ? toUtf8(str) : new Uint8Array(0);

    // Smallest version that fits.
    var version = 0, capacityBits = 0, needed = 0;
    for (var v = minVersion; v <= maxVersion; v++) {
      capacityBits = dataCodewords(v, ecl) * 8;
      needed = segmentBitLength(mode, str, bytes, v);
      if (needed <= capacityBits) { version = v; break; }
    }
    if (!version) {
      throw new Error(
        "That is too long for a QR code at error-correction level " + ecl +
        ". Shorten the text, or switch to level L."
      );
    }

    // Free upgrade: use the strongest EC level the same version still fits.
    if (opts.boostEcl !== false) {
      ["M", "Q", "H"].forEach(function (candidate) {
        if (ECL[candidate] > ECL[ecl] &&
            segmentBitLength(mode, str, bytes, version) <= dataCodewords(version, candidate) * 8) {
          ecl = candidate;
        }
      });
    }

    var capacity = dataCodewords(version, ecl) * 8;
    var bb = new BitBuffer();
    writeSegment(bb, mode, str, bytes, version);

    // Terminator, byte alignment, then the alternating pad bytes.
    bb.append(0, Math.min(4, capacity - bb.length()));
    bb.append(0, (8 - (bb.length() % 8)) % 8);
    for (var pad = 0xec; bb.length() < capacity; pad ^= 0xec ^ 0x11) bb.append(pad, 8);

    var dataBytes = new Uint8Array(bb.length() / 8);
    for (var i = 0; i < bb.bits.length; i++) {
      dataBytes[i >>> 3] |= bb.bits[i] << (7 - (i & 7));
    }

    var allCodewords = addEccAndInterleave(dataBytes, version, ecl);

    var size = version * 4 + 17;
    var matrix = new Matrix(size);
    drawFunctionPatterns(matrix, version);
    drawCodewords(matrix, allCodewords);

    // Choose the mask with the lowest penalty (or honor an explicit one).
    var bestMask = opts.mask;
    if (bestMask === undefined || bestMask === null || bestMask < 0 || bestMask > 7) {
      var bestScore = Infinity;
      for (var mk = 0; mk < 8; mk++) {
        applyMask(matrix, mk);
        drawFormatBits(matrix, ecl, mk);
        var s = penalty(matrix);
        if (s < bestScore) { bestScore = s; bestMask = mk; }
        applyMask(matrix, mk); // XOR again to undo
      }
    }
    applyMask(matrix, bestMask);
    drawFormatBits(matrix, ecl, bestMask);

    matrix.version = version;
    matrix.ecl = ecl;
    matrix.mask = bestMask;
    matrix.mode = mode;
    return matrix;
  }

  /* ------------------------------------------------------------------ *
   * Renderers
   * ------------------------------------------------------------------ */

  /** Compact single-path SVG — typically 1-3 KB, scales to any size. */
  function toSvg(matrix, opts) {
    opts = opts || {};
    var scale = opts.scale || 8;
    var margin = opts.margin === undefined ? 4 : opts.margin;
    var dark = opts.dark || "#000000";
    var light = opts.light || "#ffffff";
    var dim = (matrix.size + margin * 2) * scale;

    var parts = [];
    for (var y = 0; y < matrix.size; y++) {
      for (var x = 0; x < matrix.size; x++) {
        if (matrix.modules[y][x]) {
          parts.push("M" + (x + margin) + "," + (y + margin) + "h1v1h-1z");
        }
      }
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + dim + '" height="' + dim +
      '" viewBox="0 0 ' + (matrix.size + margin * 2) + " " + (matrix.size + margin * 2) +
      '" shape-rendering="crispEdges" role="img" aria-label="QR code">' +
      (light === "transparent" ? "" : '<rect width="100%" height="100%" fill="' + light + '"/>') +
      '<path fill="' + dark + '" d="' + parts.join("") + '"/></svg>';
  }

  /** Draws onto a 2D canvas context — used for the PNG download. */
  function toCanvas(matrix, canvas, opts) {
    opts = opts || {};
    var scale = opts.scale || 8;
    var margin = opts.margin === undefined ? 4 : opts.margin;
    var dim = (matrix.size + margin * 2) * scale;
    canvas.width = dim;
    canvas.height = dim;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = opts.light || "#ffffff";
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = opts.dark || "#000000";
    for (var y = 0; y < matrix.size; y++) {
      for (var x = 0; x < matrix.size; x++) {
        if (matrix.modules[y][x]) {
          ctx.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale);
        }
      }
    }
    return canvas;
  }

  /* ------------------------------------------------------------------ *
   * Payload builders for the common QR types
   * ------------------------------------------------------------------ */

  function escapeWifi(s) {
    return String(s == null ? "" : s).replace(/([\\;,:"])/g, "\\$1");
  }

  var payload = {
    url: function (v) {
      var s = String(v || "").trim();
      if (!s) return "";
      return /^[a-z][a-z\d+.-]*:/i.test(s) ? s : "https://" + s;
    },
    email: function (to, subject, body) {
      var q = [];
      if (subject) q.push("subject=" + encodeURIComponent(subject));
      if (body) q.push("body=" + encodeURIComponent(body));
      return "mailto:" + String(to || "").trim() + (q.length ? "?" + q.join("&") : "");
    },
    phone: function (n) { return "tel:" + String(n || "").replace(/[^\d+]/g, ""); },
    sms: function (n, msg) {
      return "SMSTO:" + String(n || "").replace(/[^\d+]/g, "") + (msg ? ":" + msg : "");
    },
    wifi: function (ssid, password, encryption, hidden) {
      var enc = String(encryption == null ? "WPA" : encryption).toUpperCase();
      // An open network carries no password field at all. Accept every spelling
      // the UI or a caller might use for "no security".
      if (enc === "NONE" || enc === "NOPASS" || enc === "OPEN" || enc === "" || !password) {
        if (enc === "NONE" || enc === "NOPASS" || enc === "OPEN" || enc === "") {
          return "WIFI:T:nopass;S:" + escapeWifi(ssid) + ";" + (hidden ? "H:true;" : "") + ";";
        }
      }
      return "WIFI:T:" + enc + ";S:" + escapeWifi(ssid) + ";P:" + escapeWifi(password) +
        (hidden ? ";H:true" : "") + ";;";
    },
    vcard: function (f) {
      f = f || {};
      var lines = ["BEGIN:VCARD", "VERSION:3.0"];
      var name = [f.lastName || "", f.firstName || "", "", "", ""].join(";");
      lines.push("N:" + name);
      lines.push("FN:" + [f.firstName, f.lastName].filter(Boolean).join(" "));
      if (f.org) lines.push("ORG:" + f.org);
      if (f.title) lines.push("TITLE:" + f.title);
      if (f.phone) lines.push("TEL;TYPE=CELL:" + f.phone);
      if (f.email) lines.push("EMAIL:" + f.email);
      if (f.url) lines.push("URL:" + f.url);
      if (f.address) lines.push("ADR;TYPE=WORK:;;" + f.address);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
  };

  return {
    encode: encode,
    toSvg: toSvg,
    toCanvas: toCanvas,
    payload: payload,
    dataCodewords: dataCodewords,
    ECL: ECL
  };
});
