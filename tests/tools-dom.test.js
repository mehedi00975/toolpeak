/**
 * Integration tests: the ten tools, driven through their real built pages.
 *
 * tools-core.test.js proves the math is right. This file proves the math is
 * actually wired to the inputs and outputs a visitor sees — the layer where
 * a renamed element id or a missing event listener silently breaks a tool.
 */

const test = require("node:test");
const assert = require("node:assert");
const { loadPage, tick, fire, setValue, text, skip } = require("./helpers/dom");

const suite = { skip };

/* ------------------------------------------------------------------ *
 * Word counter
 * ------------------------------------------------------------------ */

test("word counter: counts words, characters and sentences as you type", suite, async () => {
  const dom = await loadPage("tools/word-counter.html");
  const d = dom.window.document;

  setValue(d.querySelector("#wc-input"), "Hello world. This is a test of the counter!");
  assert.strictEqual(text(d, "#wc-words"), "9");
  assert.strictEqual(text(d, "#wc-chars"), "43");
  assert.strictEqual(text(d, "#wc-sentences"), "2");

  dom.window.close();
});

test("word counter: an empty box reads zero, not NaN", suite, async () => {
  const dom = await loadPage("tools/word-counter.html");
  const d = dom.window.document;

  setValue(d.querySelector("#wc-input"), "text");
  setValue(d.querySelector("#wc-input"), "");
  assert.strictEqual(text(d, "#wc-words"), "0");
  assert.strictEqual(text(d, "#wc-chars"), "0");

  dom.window.close();
});

test("word counter: reports reading time", suite, async () => {
  const dom = await loadPage("tools/word-counter.html");
  const d = dom.window.document;

  setValue(d.querySelector("#wc-input"), "word ".repeat(450).trim());
  assert.match(text(d, "#wc-reading"), /\d/);

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Case converter
 * ------------------------------------------------------------------ */

test("case converter: all case modes transform correctly", suite, async () => {
  const dom = await loadPage("tools/case-converter.html");
  const d = dom.window.document;
  const out = () => d.querySelector("#cc-output").value;

  setValue(d.querySelector("#cc-input"), "the lord of the rings");

  d.querySelector("[data-case=upper]").click();
  assert.strictEqual(out(), "THE LORD OF THE RINGS");

  d.querySelector("[data-case=lower]").click();
  assert.strictEqual(out(), "the lord of the rings");

  // Title Case must keep minor words lowercase but capitalize the first word.
  d.querySelector("[data-case=title]").click();
  assert.strictEqual(out(), "The Lord of the Rings");

  d.querySelector("[data-case=camel]").click();
  assert.strictEqual(out(), "theLordOfTheRings");

  d.querySelector("[data-case=kebab]").click();
  assert.strictEqual(out(), "the-lord-of-the-rings");

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Percentage calculator
 * ------------------------------------------------------------------ */

test("percentage calculator: all four modes compute from the default values", suite, async () => {
  const dom = await loadPage("tools/percentage-calculator.html");
  const d = dom.window.document;

  assert.strictEqual(text(d, "#pc-of-out"), "30");        // 20% of 150
  assert.strictEqual(text(d, "#pc-what-out"), "20%");     // 30 is what % of 150
  assert.match(text(d, "#pc-ch-out"), /\+20% increase/);  // 150 -> 180
  assert.strictEqual(text(d, "#pc-adj-out"), "60");       // 80 minus 25%

  dom.window.close();
});

test("percentage calculator: handles fractional percentages", suite, async () => {
  const dom = await loadPage("tools/percentage-calculator.html");
  const d = dom.window.document;

  setValue(d.querySelector("#pc-of-a"), "7.5");
  assert.strictEqual(text(d, "#pc-of-out"), "11.25");

  dom.window.close();
});

test("percentage calculator: a decrease is labeled as a decrease", suite, async () => {
  const dom = await loadPage("tools/percentage-calculator.html");
  const d = dom.window.document;

  setValue(d.querySelector("#pc-ch-b"), "120");
  assert.match(text(d, "#pc-ch-out"), /-20% decrease/);

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Age calculator
 * ------------------------------------------------------------------ */

test("age calculator: exact age in years, months and days", suite, async () => {
  const dom = await loadPage("tools/age-calculator.html");
  const d = dom.window.document;

  d.querySelector("#age-on").value = "2026-09-07";
  setValue(d.querySelector("#age-dob"), "1990-05-15");

  assert.strictEqual(text(d, "#age-y"), "36");
  assert.strictEqual(text(d, "#age-m"), "3");
  assert.strictEqual(text(d, "#age-d"), "23");
  assert.strictEqual(text(d, "#age-dow"), "Tuesday");

  dom.window.close();
});

test("age calculator: a future date of birth does not produce a negative age", suite, async () => {
  const dom = await loadPage("tools/age-calculator.html");
  const d = dom.window.document;

  d.querySelector("#age-on").value = "2026-09-07";
  setValue(d.querySelector("#age-dob"), "2030-01-01");

  assert.ok(!/^-/.test(text(d, "#age-y")), "years should not be negative");

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * BMI calculator
 * ------------------------------------------------------------------ */

test("bmi calculator: metric input gives value, category and healthy range", suite, async () => {
  const dom = await loadPage("tools/bmi-calculator.html");
  const d = dom.window.document;

  assert.strictEqual(text(d, "#bmi-value"), "22.9");           // 70 kg / 175 cm
  assert.strictEqual(text(d, "#bmi-category"), "Healthy weight");
  assert.match(text(d, "#bmi-range"), /56\.7.*76\.3 kg/);

  dom.window.close();
});

test("bmi calculator: category updates with weight", suite, async () => {
  const dom = await loadPage("tools/bmi-calculator.html");
  const d = dom.window.document;

  setValue(d.querySelector("#bmi-kg"), "95");
  assert.strictEqual(text(d, "#bmi-category"), "Obesity class I");

  setValue(d.querySelector("#bmi-kg"), "50");
  assert.strictEqual(text(d, "#bmi-category"), "Underweight");

  dom.window.close();
});

test("bmi calculator: imperial mode works and reports the range in pounds", suite, async () => {
  const dom = await loadPage("tools/bmi-calculator.html");
  const d = dom.window.document;

  const imperial = [...d.querySelectorAll("[name=bmi-unit]")].find(r => r.value === "imperial");
  imperial.checked = true;
  fire(imperial, "change");

  assert.strictEqual(text(d, "#bmi-value"), "22.7");  // 154 lb, 5 ft 9 in
  assert.match(text(d, "#bmi-range"), /lb/);

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Unit converter
 * ------------------------------------------------------------------ */

test("unit converter: length, temperature and data conversions", suite, async () => {
  const dom = await loadPage("tools/unit-converter.html");
  const d = dom.window.document;
  const group = d.querySelector("#uc-group");
  const from = d.querySelector("#uc-from");
  const to = d.querySelector("#uc-to");
  const value = d.querySelector("#uc-value");

  assert.ok(from.options.length > 3, "unit dropdowns should be populated");

  group.value = "length"; fire(group, "change");
  from.value = "in"; to.value = "cm"; setValue(value, "1");
  assert.strictEqual(text(d, "#uc-out"), "2.54 cm");

  group.value = "temperature"; fire(group, "change");
  from.value = "C"; to.value = "F"; setValue(value, "100");
  assert.strictEqual(text(d, "#uc-out"), "212 F");

  group.value = "data"; fire(group, "change");
  from.value = "MB"; to.value = "GB"; setValue(value, "2048");
  assert.strictEqual(text(d, "#uc-out"), "2 GB");

  dom.window.close();
});

test("unit converter: switching group repopulates the unit lists", suite, async () => {
  const dom = await loadPage("tools/unit-converter.html");
  const d = dom.window.document;
  const group = d.querySelector("#uc-group");

  group.value = "mass"; fire(group, "change");
  const units = [...d.querySelector("#uc-from").options].map(o => o.value);
  assert.ok(units.includes("kg") && units.includes("lb"),
    `mass units should include kg and lb, got ${units.join(",")}`);

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Password generator
 * ------------------------------------------------------------------ */

test("password generator: produces a password on load and regenerates on demand", suite, async () => {
  const dom = await loadPage("tools/password-generator.html");
  const d = dom.window.document;
  const out = d.querySelector("#pw-out");

  assert.strictEqual(out.value.length, 20, "default length should be 20");
  const first = out.value;

  d.querySelector("[data-pw=generate]").click();
  assert.notStrictEqual(out.value, first, "regenerate should produce a new password");
  assert.match(text(d, "#pw-entropy"), /bits/);
  assert.ok(text(d, "#pw-label").length > 2);

  dom.window.close();
});

test("password generator: passphrase mode returns hyphenated words", suite, async () => {
  const dom = await loadPage("tools/password-generator.html");
  const d = dom.window.document;

  const mode = [...d.querySelectorAll("[name=pw-type]")].find(r => r.value === "passphrase");
  mode.checked = true;
  fire(mode, "change");

  assert.ok(d.querySelector("#pw-out").value.includes("-"));

  dom.window.close();
});

test("password generator: the strength checker flags a weak password", suite, async () => {
  const dom = await loadPage("tools/password-generator.html");
  const d = dom.window.document;

  setValue(d.querySelector("#pw-check"), "password");
  assert.match(text(d, "#pw-check-label"), /Weak|Very weak/);

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * QR code generator
 * ------------------------------------------------------------------ */

test("qr generator: renders an SVG with version metadata on load", suite, async () => {
  const dom = await loadPage("tools/qr-code-generator.html");
  const d = dom.window.document;

  assert.ok(d.querySelector("#qr-stage svg"), "no QR svg rendered");
  assert.match(text(d, "#qr-meta"), /Version \d+/);
  assert.ok(!d.querySelector("[data-qr=download-svg]").disabled);

  dom.window.close();
});

test("qr generator: switching to Wi-Fi reveals the Wi-Fi panel", suite, async () => {
  const dom = await loadPage("tools/qr-code-generator.html");
  const d = dom.window.document;

  const wifi = [...d.querySelectorAll("[name=qr-type]")].find(r => r.value === "wifi");
  wifi.checked = true;
  fire(wifi, "change");

  assert.ok(!d.querySelector("[data-qr-panel=wifi]").hidden);
  setValue(d.querySelector("#qr-wifi-ssid"), "MyNet");
  setValue(d.querySelector("#qr-wifi-pass"), "secret123");
  assert.ok(d.querySelector("#qr-stage svg"), "QR should re-render for Wi-Fi input");

  dom.window.close();
});

test("qr generator: input that cannot fit shows an error instead of crashing", suite, async () => {
  const dom = await loadPage("tools/qr-code-generator.html");
  const d = dom.window.document;

  const textMode = [...d.querySelectorAll("[name=qr-type]")].find(r => r.value === "text");
  textMode.checked = true;
  fire(textMode, "change");
  setValue(d.querySelector("#qr-text"), "x".repeat(4000));
  await tick(400); // QR rendering is debounced

  const error = d.querySelector("#qr-error");
  assert.ok(!error.hidden, "error message should be visible");
  assert.match(error.textContent, /too long/i);
  assert.ok(d.querySelector("[data-qr=download-svg]").disabled,
    "download should be disabled while the input is invalid");

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Text diff
 * ------------------------------------------------------------------ */

test("text diff: renders a diff with counts and word-level markup on load", suite, async () => {
  const dom = await loadPage("tools/text-diff.html");
  const d = dom.window.document;

  assert.ok(d.querySelector("#df-output").innerHTML.length > 100);
  assert.match(text(d, "#df-similarity"), /%/);
  assert.ok(Number(text(d, "#df-added")) >= 1);
  assert.ok(Number(text(d, "#df-modified")) >= 1);
  assert.match(d.querySelector("#df-output").innerHTML, /<ins>|<del>/);

  dom.window.close();
});

test("text diff: identical texts report 100 percent similarity", suite, async () => {
  const dom = await loadPage("tools/text-diff.html");
  const d = dom.window.document;

  d.querySelector("#df-right").value = "same\ntext";
  setValue(d.querySelector("#df-left"), "same\ntext");
  await tick(400); // input is debounced by 200 ms

  assert.strictEqual(text(d, "#df-similarity"), "100%");

  dom.window.close();
});

/* ------------------------------------------------------------------ *
 * Image compressor — the parts that work without a canvas encoder
 * ------------------------------------------------------------------ */

test("image compressor: exposes a file input that never posts anywhere", suite, async () => {
  const dom = await loadPage("tools/image-compressor.html");
  const d = dom.window.document;

  const input = d.querySelector('input[type=file]');
  assert.ok(input, "no file input found");
  assert.ok(input.accept.includes("image"), "file input should accept images");
  assert.strictEqual(d.querySelectorAll("form[action]").length, 0,
    "there must be no form that could upload the image");

  dom.window.close();
});

test("image compressor: offers a target size control defaulting to 200 KB", suite, async () => {
  const dom = await loadPage("tools/image-compressor.html");
  const d = dom.window.document;

  const target = d.querySelector("#ic-target");
  assert.ok(target, "no target size control");
  assert.match(String(target.value), /200/);

  dom.window.close();
});
