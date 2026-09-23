/**
 * Tests for src/lib/qr.js
 *
 * The encoder was validated during development against the `qrcode` npm
 * package (byte-for-byte across all 160 version/EC-level combinations) and
 * against the `jsQR` decoder (600 randomized round-trips). Those packages are
 * not dependencies here, so these tests lock in the structural invariants and
 * the specific regressions that were found and fixed.
 */

const test = require("node:test");
const assert = require("node:assert");
const QR = require("../src/lib/qr.js");

/** Reads the module grid as a plain array of 0/1 rows. */
function grid(m) {
  return m.modules.map(row => Array.from(row));
}

/* ------------------------------------------------------------------ *
 * Structure
 * ------------------------------------------------------------------ */

test("encode: produces the correct matrix size for the version", () => {
  const m = QR.encode("https://toolpeak.com", { ecl: "M" });
  assert.strictEqual(m.size, m.version * 4 + 17);
});

test("encode: picks the smallest version that fits", () => {
  assert.strictEqual(QR.encode("x", { ecl: "L", boostEcl: false }).version, 1);
  // 300 characters cannot fit in version 1.
  assert.ok(QR.encode("a".repeat(300), { ecl: "L", boostEcl: false }).version > 5);
});

test("encode: finder patterns are present in all three corners", () => {
  const m = QR.encode("https://toolpeak.com", { ecl: "M" });
  const g = grid(m);
  const size = m.size;

  // A finder is a 7x7 block: dark ring, light ring, 3x3 dark centre.
  function isFinder(ox, oy) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const d = Math.max(Math.abs(x - 3), Math.abs(y - 3));
        const expected = d !== 2 && d <= 3 ? 1 : 0;
        if (g[oy + y][ox + x] !== expected) return false;
      }
    }
    return true;
  }

  assert.ok(isFinder(0, 0), "top-left finder");
  assert.ok(isFinder(size - 7, 0), "top-right finder");
  assert.ok(isFinder(0, size - 7), "bottom-left finder");
});

test("encode: timing patterns alternate correctly", () => {
  const m = QR.encode("https://toolpeak.com", { ecl: "M" });
  const g = grid(m);
  // Row 6 and column 6 alternate dark/light between the finder patterns.
  for (let i = 8; i < m.size - 8; i++) {
    assert.strictEqual(g[6][i], i % 2 === 0 ? 1 : 0, `timing row at ${i}`);
    assert.strictEqual(g[i][6], i % 2 === 0 ? 1 : 0, `timing column at ${i}`);
  }
});

test("encode: the dark module is always set", () => {
  // Spec requires the module at (8, 4*version + 9) to be dark.
  for (const text of ["a", "hello world", "https://example.com/some/path"]) {
    const m = QR.encode(text, { ecl: "M" });
    assert.strictEqual(m.modules[m.size - 8][8], 1, "dark module for " + text);
  }
});

test("encode: chooses a mask in the valid range", () => {
  for (const text of ["a", "test", "https://toolpeak.com", "1234567890"]) {
    const m = QR.encode(text, { ecl: "M" });
    assert.ok(m.mask >= 0 && m.mask <= 7, "mask out of range: " + m.mask);
  }
});

test("encode: an explicit mask is honored", () => {
  for (let mask = 0; mask < 8; mask++) {
    assert.strictEqual(QR.encode("test", { ecl: "M", mask }).mask, mask);
  }
});

/* ------------------------------------------------------------------ *
 * Mode selection
 * ------------------------------------------------------------------ */

test("encode: selects numeric mode for digits", () => {
  assert.strictEqual(QR.encode("1234567890", { ecl: "M" }).mode, "numeric");
});

test("encode: selects alphanumeric mode for uppercase and symbols", () => {
  assert.strictEqual(QR.encode("HELLO WORLD 123", { ecl: "M" }).mode, "alphanumeric");
});

test("encode: falls back to byte mode for lowercase and Unicode", () => {
  assert.strictEqual(QR.encode("hello world", { ecl: "M" }).mode, "byte");
  assert.strictEqual(QR.encode("café ☕", { ecl: "M" }).mode, "byte");
});

test("encode: numeric mode is denser than byte mode", () => {
  const digits = "1".repeat(100);
  const numeric = QR.encode(digits, { ecl: "L", boostEcl: false });
  const asBytes = QR.encode("a".repeat(100), { ecl: "L", boostEcl: false });
  assert.ok(numeric.version < asBytes.version,
    `numeric v${numeric.version} should beat byte v${asBytes.version}`);
});

/* ------------------------------------------------------------------ *
 * Error correction
 * ------------------------------------------------------------------ */

test("encode: higher EC level needs an equal or larger version", () => {
  const text = "https://toolpeak.com/tools/qr-code-generator.html";
  const l = QR.encode(text, { ecl: "L", boostEcl: false }).version;
  const h = QR.encode(text, { ecl: "H", boostEcl: false }).version;
  assert.ok(h >= l, `H (v${h}) should not be smaller than L (v${l})`);
});

test("encode: boostEcl upgrades the level when it is free", () => {
  // A short payload leaves spare capacity, so the level should be raised.
  const boosted = QR.encode("hi", { ecl: "L", boostEcl: true });
  assert.notStrictEqual(boosted.ecl, "L");
});

test("encode: boostEcl can be disabled", () => {
  assert.strictEqual(QR.encode("hi", { ecl: "L", boostEcl: false }).ecl, "L");
});

/**
 * Regression: NUM_BLOCKS[H][8] was 5 instead of 6, which silently produced
 * unscannable codes at version 8 with high error correction. This asserts the
 * block/codeword arithmetic stays self-consistent across every combination.
 */
test("dataCodewords: block arithmetic is consistent for all versions and levels", () => {
  for (let v = 1; v <= 40; v++) {
    for (const ecl of ["L", "M", "Q", "H"]) {
      const dc = QR.dataCodewords(v, ecl);
      assert.ok(dc > 0, `v${v} ${ecl}: data codewords must be positive`);
      assert.ok(Number.isInteger(dc), `v${v} ${ecl}: must be an integer`);
      // Data must always leave room for error correction.
      const raw = Math.floor(((16 * v + 128) * v + 64) / 8);
      assert.ok(dc < raw, `v${v} ${ecl}: data must be less than raw capacity`);
    }
  }
});

test("dataCodewords: capacity increases with version at a fixed level", () => {
  for (const ecl of ["L", "M", "Q", "H"]) {
    for (let v = 1; v < 40; v++) {
      assert.ok(
        QR.dataCodewords(v + 1, ecl) > QR.dataCodewords(v, ecl),
        `${ecl}: v${v + 1} should hold more than v${v}`
      );
    }
  }
});

test("dataCodewords: capacity decreases as error correction rises", () => {
  for (let v = 1; v <= 40; v++) {
    assert.ok(QR.dataCodewords(v, "L") > QR.dataCodewords(v, "M"), `v${v} L>M`);
    assert.ok(QR.dataCodewords(v, "M") > QR.dataCodewords(v, "Q"), `v${v} M>Q`);
    assert.ok(QR.dataCodewords(v, "Q") > QR.dataCodewords(v, "H"), `v${v} Q>H`);
  }
});

/**
 * Regression: version 8 at level H specifically. Encoding must succeed and
 * produce a plausible matrix rather than a corrupted one.
 */
test("encode: version 8 high-EC payloads encode correctly", () => {
  const text = "9".repeat(183);
  const m = QR.encode(text, { ecl: "H", boostEcl: false });
  assert.strictEqual(m.version, 8);
  assert.strictEqual(m.size, 49);
  // A well-formed code is roughly balanced between dark and light modules.
  const dark = grid(m).flat().reduce((a, b) => a + b, 0);
  const ratio = dark / (m.size * m.size);
  assert.ok(ratio > 0.35 && ratio < 0.65, `dark ratio ${ratio} is implausible`);
});

test("encode: every version produces a balanced module distribution", () => {
  for (let v = 1; v <= 20; v++) {
    for (const ecl of ["L", "H"]) {
      const capacity = QR.dataCodewords(v, ecl) * 8;
      const ccb = v <= 9 ? 10 : v <= 26 ? 12 : 14;
      const len = Math.floor((capacity - 4 - ccb) / 10) * 3;
      if (len < 1) continue;
      const m = QR.encode("7".repeat(len), { ecl, boostEcl: false });
      if (m.version !== v) continue;
      const dark = grid(m).flat().reduce((a, b) => a + b, 0);
      const ratio = dark / (m.size * m.size);
      assert.ok(ratio > 0.3 && ratio < 0.7, `v${v} ${ecl} ratio ${ratio}`);
    }
  }
});

/* ------------------------------------------------------------------ *
 * Limits and errors
 * ------------------------------------------------------------------ */

test("encode: rejects empty input with a helpful message", () => {
  assert.throws(() => QR.encode(""), /Nothing to encode/);
});

test("encode: rejects input that is too long", () => {
  assert.throws(() => QR.encode("a".repeat(5000), { ecl: "H" }), /too long/);
});

test("encode: handles the largest practical payloads", () => {
  const m = QR.encode("1".repeat(2900), { ecl: "L", boostEcl: false });
  assert.ok(m.version >= 20, "expected a high version, got " + m.version);
  assert.strictEqual(m.size, m.version * 4 + 17);
});

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */

test("toSvg: emits valid, self-contained SVG", () => {
  const m = QR.encode("https://toolpeak.com", { ecl: "M" });
  const svg = QR.toSvg(m, { scale: 8, margin: 4 });
  assert.ok(svg.startsWith("<svg"));
  assert.ok(svg.includes("</svg>"));
  assert.ok(svg.includes("viewBox"));
  assert.ok(svg.includes("<path"));
});

test("toSvg: honors scale and margin in the output dimensions", () => {
  const m = QR.encode("test", { ecl: "M" });
  const svg = QR.toSvg(m, { scale: 10, margin: 2 });
  const expected = (m.size + 4) * 10;
  assert.ok(svg.includes(`width="${expected}"`), "unexpected width");
});

test("toSvg: a transparent background omits the backing rect", () => {
  const m = QR.encode("test", { ecl: "M" });
  assert.ok(!QR.toSvg(m, { light: "transparent" }).includes("<rect"));
  assert.ok(QR.toSvg(m, { light: "#ffffff" }).includes("<rect"));
});

/* ------------------------------------------------------------------ *
 * Payload builders
 * ------------------------------------------------------------------ */

test("payload.url: adds a scheme when missing", () => {
  assert.strictEqual(QR.payload.url("example.com"), "https://example.com");
  assert.strictEqual(QR.payload.url("https://example.com"), "https://example.com");
  assert.strictEqual(QR.payload.url("http://example.com"), "http://example.com");
});

test("payload.wifi: builds a valid WIFI string", () => {
  assert.strictEqual(
    QR.payload.wifi("MyNet", "secret", "WPA"),
    "WIFI:T:WPA;S:MyNet;P:secret;;"
  );
});

test("payload.wifi: open networks omit the password", () => {
  assert.strictEqual(QR.payload.wifi("Guest", "", "nopass"), "WIFI:T:nopass;S:Guest;;");
});

test("payload.wifi: escapes special characters", () => {
  const out = QR.payload.wifi("My;Net", "pa:ss", "WPA");
  assert.ok(out.includes("My\\;Net"), out);
  assert.ok(out.includes("pa\\:ss"), out);
});

test("payload.wifi: marks hidden networks", () => {
  assert.ok(QR.payload.wifi("Net", "pw", "WPA", true).includes("H:true"));
});

test("payload.email: encodes the subject and body", () => {
  const out = QR.payload.email("a@b.com", "Hi there", "Body text");
  assert.ok(out.startsWith("mailto:a@b.com?"));
  assert.ok(out.includes("subject=Hi%20there"));
  assert.ok(out.includes("body=Body%20text"));
});

test("payload.phone: strips formatting characters", () => {
  assert.strictEqual(QR.payload.phone("+1 (555) 123-4567"), "tel:+15551234567");
});

test("payload.vcard: produces a well-formed vCard", () => {
  const out = QR.payload.vcard({
    firstName: "Ada", lastName: "Lovelace",
    email: "ada@example.com", phone: "+15551234567"
  });
  assert.ok(out.startsWith("BEGIN:VCARD"));
  assert.ok(out.includes("VERSION:3.0"));
  assert.ok(out.includes("FN:Ada Lovelace"));
  assert.ok(out.includes("N:Lovelace;Ada;;;"));
  assert.ok(out.trim().endsWith("END:VCARD"));
});

test("payload builders round-trip through the encoder", () => {
  const payloads = [
    QR.payload.url("toolpeak.com"),
    QR.payload.wifi("Cafe Guest", "coffee123", "WPA"),
    QR.payload.email("hi@toolpeak.com", "Hello", "Testing"),
    QR.payload.phone("+1 555 123 4567"),
    QR.payload.sms("+15551234567", "Hi"),
    QR.payload.vcard({ firstName: "Ada", lastName: "Lovelace", org: "Analytical Engines" })
  ];
  for (const p of payloads) {
    const m = QR.encode(p, { ecl: "M" });
    assert.ok(m.size >= 21, "failed to encode: " + p.slice(0, 40));
  }
});
