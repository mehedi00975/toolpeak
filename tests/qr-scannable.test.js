/**
 * End-to-end QR verification with an independent decoder.
 *
 * qr.test.js checks the encoder against the spec's own structural rules, but a
 * matrix can satisfy every internal invariant and still be unreadable. These
 * tests rasterize the SVG that the page actually renders and hand the pixels to
 * jsQR — a completely separate implementation — so a real scanner's result is
 * what gets asserted.
 */

const test = require("node:test");
const assert = require("node:assert");
const jsQR = require("jsqr");

const { loadPage, tick, fire, setValue, skip } = require("./helpers/dom");
const QR = require("../src/lib/qr.js");

const suite = { skip };

/** Renders module coordinates from a QR SVG path into a 1-bit bitmap. */
function rasterize(svg, scale = 4) {
  const viewBox = svg.getAttribute("viewBox").split(" ").map(Number);
  const modules = viewBox[2];
  const dim = modules * scale;
  const data = new Uint8ClampedArray(dim * dim * 4).fill(255);

  const path = svg.querySelector("path").getAttribute("d");
  for (const match of path.matchAll(/M(\d+),(\d+)h1v1h-1z/g)) {
    const mx = Number(match[1]);
    const my = Number(match[2]);
    for (let dy = 0; dy < scale; dy++) {
      for (let dx = 0; dx < scale; dx++) {
        const px = ((my * scale + dy) * dim + (mx * scale + dx)) * 4;
        data[px] = data[px + 1] = data[px + 2] = 0;
      }
    }
  }
  return { data, dim };
}

/** Decodes the QR currently shown on the page; returns the decoded string. */
function decodeStage(document) {
  const svg = document.querySelector("#qr-stage svg");
  assert.ok(svg, "no QR svg on the page to decode");
  const { data, dim } = rasterize(svg);
  const result = jsQR(data, dim, dim);
  assert.ok(result, "jsQR could not read the rendered QR code");
  return result.data;
}

/** Encodes a string with the library directly and decodes it back. */
function roundTrip(value, options) {
  const svgMarkup = QR.toSvg(QR.encode(value, options), { scale: 1, margin: 4 });
  const { JSDOM } = require("jsdom");
  const svg = new JSDOM(svgMarkup).window.document.querySelector("svg");
  const { data, dim } = rasterize(svg);
  const result = jsQR(data, dim, dim);
  assert.ok(result, `jsQR could not read a code for ${JSON.stringify(value.slice(0, 40))}`);
  return result.data;
}

/* ------------------------------------------------------------------ *
 * Rendered page
 * ------------------------------------------------------------------ */

test("qr: the code shown on page load is scannable", suite, async () => {
  const dom = await loadPage("tools/qr-code-generator.html");
  assert.strictEqual(decodeStage(dom.window.document), "https://toolpeak.com");
  dom.window.close();
});

test("qr: a typed URL round-trips through a real decoder", suite, async () => {
  const dom = await loadPage("tools/qr-code-generator.html");
  const d = dom.window.document;

  setValue(d.querySelector("#qr-url"), "https://toolpeak.com/tools/word-counter.html");
  await tick(300);
  assert.strictEqual(decodeStage(d), "https://toolpeak.com/tools/word-counter.html");

  dom.window.close();
});

test("qr: a Wi-Fi code carries a scannable WIFI payload", suite, async () => {
  const dom = await loadPage("tools/qr-code-generator.html");
  const d = dom.window.document;

  const wifi = [...d.querySelectorAll("[name=qr-type]")].find(r => r.value === "wifi");
  wifi.checked = true;
  fire(wifi, "change");
  setValue(d.querySelector("#qr-wifi-ssid"), "Cafe Guest");
  setValue(d.querySelector("#qr-wifi-pass"), "coffee123");
  await tick(300);

  assert.strictEqual(decodeStage(d), "WIFI:T:WPA;S:Cafe Guest;P:coffee123;;");

  dom.window.close();
});

test("qr: every error-correction level still produces a readable code", suite, async () => {
  const dom = await loadPage("tools/qr-code-generator.html");
  const d = dom.window.document;
  const ecl = d.querySelector("#qr-ecl");

  for (const level of ["L", "M", "Q", "H"]) {
    ecl.value = level;
    fire(ecl, "change");
    await tick(300);
    assert.strictEqual(decodeStage(d), "https://toolpeak.com", `level ${level} failed`);
  }

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Library level — content types and sizes
 * ------------------------------------------------------------------ */

test("qr: numeric, alphanumeric and byte modes all decode", suite, () => {
  assert.strictEqual(roundTrip("1234567890"), "1234567890");
  assert.strictEqual(roundTrip("HELLO WORLD 123"), "HELLO WORLD 123");
  assert.strictEqual(roundTrip("Hello, world! (mixed case)"), "Hello, world! (mixed case)");
});

test("qr: UTF-8 content survives the round trip", suite, () => {
  // jsQR reports raw bytes for non-Latin content, so compare decoded bytes.
  const value = "café — naïve";
  const decoded = roundTrip(value);
  const asUtf8 = Buffer.from(decoded.split("").map(c => c.charCodeAt(0) & 0xff)).toString("utf8");
  assert.ok(decoded === value || asUtf8 === value,
    `expected ${JSON.stringify(value)}, got ${JSON.stringify(decoded)}`);
});

test("qr: codes stay readable as the payload grows", suite, () => {
  for (const length of [1, 10, 100, 400, 900]) {
    const value = "A".repeat(length);
    assert.strictEqual(roundTrip(value), value, `length ${length} failed`);
  }
});

test("qr: each error-correction level round-trips at the library level", suite, () => {
  for (const ecl of ["L", "M", "Q", "H"]) {
    assert.strictEqual(roundTrip("https://toolpeak.com/tools", { ecl }),
      "https://toolpeak.com/tools", `level ${ecl} failed`);
  }
});

test("qr: every payload builder produces a scannable code", suite, () => {
  const cases = [
    QR.payload.url("toolpeak.com"),
    QR.payload.wifi("MyNet", "secret123", "WPA"),
    QR.payload.wifi("Guest", "", "nopass"),
    QR.payload.email("hi@toolpeak.com", "Hello", "Body text"),
    QR.payload.phone("+15551234567"),
    QR.payload.sms("+15551234567", "Hi there"),
  ];
  for (const value of cases) {
    assert.strictEqual(roundTrip(value), value, `failed for ${value}`);
  }
});

test("qr: Wi-Fi payloads escape the five reserved characters", suite, () => {
  // Semicolons, commas, colons, backslashes and double quotes are field
  // delimiters in the WIFI: format. An unescaped one truncates the password
  // and the phone joins with the wrong credentials, or not at all.
  const cases = [
    [";", "WIFI:T:WPA;S:Net;P:pa\\;ss;;"],
    [",", "WIFI:T:WPA;S:Net;P:pa\\,ss;;"],
    [":", "WIFI:T:WPA;S:Net;P:pa\\:ss;;"],
    ["\\", "WIFI:T:WPA;S:Net;P:pa\\\\ss;;"],
    ['"', 'WIFI:T:WPA;S:Net;P:pa\\"ss;;'],
  ];

  for (const [char, expected] of cases) {
    const payload = QR.payload.wifi("Net", `pa${char}ss`, "WPA");
    assert.strictEqual(payload, expected, `failed to escape ${JSON.stringify(char)}`);
  }
});

test("qr: reserved characters in the network name are escaped too", suite, () => {
  assert.strictEqual(QR.payload.wifi("My:Net", "pw", "WPA"),
    "WIFI:T:WPA;S:My\\:Net;P:pw;;");
  assert.strictEqual(QR.payload.wifi("A;B", "pw", "WPA"),
    "WIFI:T:WPA;S:A\\;B;P:pw;;");
});

test("qr: an escaped Wi-Fi payload is still scannable", suite, () => {
  const payload = QR.payload.wifi("Cafe;Guest", 'p@ss,w"rd', "WPA");
  assert.strictEqual(roundTrip(payload), payload);
});

test("qr: an explicitly chosen mask still decodes", suite, () => {
  for (let mask = 0; mask < 8; mask++) {
    assert.strictEqual(roundTrip("mask test", { mask }), "mask test", `mask ${mask} failed`);
  }
});
