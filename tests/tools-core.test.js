/**
 * Unit tests for src/lib/tools-core.js
 * Run with: npm test   (uses the built-in node:test runner, no dependencies)
 */

const test = require("node:test");
const assert = require("node:assert");
const C = require("../src/lib/tools-core.js");

/* ------------------------------------------------------------------ *
 * Word counter
 * ------------------------------------------------------------------ */

test("countWords: empty input returns all zeros", () => {
  const r = C.countWords("");
  assert.strictEqual(r.words, 0);
  assert.strictEqual(r.characters, 0);
  assert.strictEqual(r.sentences, 0);
});

test("countWords: whitespace-only input counts as empty", () => {
  assert.strictEqual(C.countWords("   \n\t  ").words, 0);
});

test("countWords: basic sentence", () => {
  const r = C.countWords("Hello world. This is a test!");
  assert.strictEqual(r.words, 6);
  assert.strictEqual(r.characters, 28);
  assert.strictEqual(r.charactersNoSpaces, 23);
  assert.strictEqual(r.sentences, 2);
});

test("countWords: hyphenated words count once, like Word", () => {
  assert.strictEqual(C.countWords("state-of-the-art design").words, 2);
});

test("countWords: paragraphs split on blank lines", () => {
  assert.strictEqual(C.countWords("First para.\n\nSecond para.").paragraphs, 2);
});

test("countWords: unique words are case-insensitive", () => {
  assert.strictEqual(C.countWords("The the THE cat").uniqueWords, 2);
});

test("countWords: reading time uses 238 wpm", () => {
  const r = C.countWords(Array(238).fill("word").join(" "));
  assert.strictEqual(r.readingSeconds, 60);
});

test("countWords: page estimates", () => {
  const r = C.countWords(Array(500).fill("word").join(" "));
  assert.strictEqual(r.pagesSingleSpaced, 1);
  assert.strictEqual(r.pagesDoubleSpaced, 2);
});

/* ------------------------------------------------------------------ *
 * Case converter
 * ------------------------------------------------------------------ */

test("convertCase: upper and lower", () => {
  assert.strictEqual(C.convertCase("Hello World", "upper"), "HELLO WORLD");
  assert.strictEqual(C.convertCase("Hello World", "lower"), "hello world");
});

test("convertCase: title case keeps minor words lowercase", () => {
  assert.strictEqual(C.convertCase("the lord of the rings", "title"), "The Lord of the Rings");
});

test("convertCase: title case capitalizes the last word even if minor", () => {
  assert.strictEqual(C.convertCase("what are you waiting for", "title"), "What Are You Waiting For");
});

test("convertCase: sentence case restores sentence starts", () => {
  assert.strictEqual(
    C.convertCase("HELLO THERE. HOW ARE YOU?", "sentence"),
    "Hello there. How are you?"
  );
});

test("convertCase: programming cases", () => {
  assert.strictEqual(C.convertCase("hello world again", "camel"), "helloWorldAgain");
  assert.strictEqual(C.convertCase("hello world again", "pascal"), "HelloWorldAgain");
  assert.strictEqual(C.convertCase("hello world again", "snake"), "hello_world_again");
  assert.strictEqual(C.convertCase("hello world again", "kebab"), "hello-world-again");
  assert.strictEqual(C.convertCase("hello world again", "constant"), "HELLO_WORLD_AGAIN");
  assert.strictEqual(C.convertCase("hello world again", "dot"), "hello.world.again");
});

test("convertCase: splits existing camelCase correctly", () => {
  assert.strictEqual(C.convertCase("getUserID", "snake"), "get_user_id");
  assert.strictEqual(C.convertCase("XMLHttpRequest", "kebab"), "xml-http-request");
});

test("convertCase: round-trips between conventions", () => {
  assert.strictEqual(C.convertCase("get_user_name", "camel"), "getUserName");
  assert.strictEqual(C.convertCase("GET_USER_NAME", "kebab"), "get-user-name");
});

test("convertCase: preserves accented characters", () => {
  assert.strictEqual(C.convertCase("café zürich", "upper"), "CAFÉ ZÜRICH");
});

test("convertCase: preserves line breaks in writing cases", () => {
  assert.strictEqual(C.convertCase("line one\nline two", "upper"), "LINE ONE\nLINE TWO");
});

/* ------------------------------------------------------------------ *
 * Percentage
 * ------------------------------------------------------------------ */

test("percentage: X% of Y", () => {
  assert.strictEqual(C.percentage(20, 150, "of"), 30);
  assert.strictEqual(C.percentage(7.5, 150, "of"), 11.25);
  assert.strictEqual(C.percentage(100, 42, "of"), 42);
});

test("percentage: A is what percent of B", () => {
  assert.strictEqual(C.percentage(30, 150, "isWhatPct"), 20);
  assert.strictEqual(C.percentage(1, 3, "isWhatPct"), 33.3333333333);
});

test("percentage: change between two values", () => {
  assert.strictEqual(C.percentage(150, 180, "change"), 20);
  assert.strictEqual(C.percentage(180, 150, "change"), -16.6666666667);
  assert.strictEqual(C.percentage(100, 200, "change"), 100);
});

test("percentage: division by zero returns null, not NaN", () => {
  assert.strictEqual(C.percentage(30, 0, "isWhatPct"), null);
  assert.strictEqual(C.percentage(0, 100, "change"), null);
});

test("percentage: non-numeric input returns null", () => {
  assert.strictEqual(C.percentage("abc", 150, "of"), null);
  assert.strictEqual(C.percentage("", 150, "of"), null);
});

test("applyPercent: discount and markup", () => {
  assert.deepStrictEqual(C.applyPercent(80, 25, "decrease"), { amount: 20, result: 60 });
  assert.deepStrictEqual(C.applyPercent(25, 8, "increase"), { amount: 2, result: 27 });
});

test("percentage: commutative property holds", () => {
  assert.strictEqual(C.percentage(4, 25, "of"), C.percentage(25, 4, "of"));
});

/* ------------------------------------------------------------------ *
 * Age
 * ------------------------------------------------------------------ */

test("age: exact years, months, days", () => {
  const r = C.age("1990-05-15", "2026-09-07");
  assert.strictEqual(r.years, 36);
  assert.strictEqual(r.months, 3);
  assert.strictEqual(r.days, 23);
});

test("age: day before a birthday", () => {
  const r = C.age("2000-01-15", "2026-01-14");
  assert.strictEqual(r.years, 25);
  assert.strictEqual(r.nextBirthdayIn, 1);
  assert.strictEqual(r.turning, 26);
});

test("age: exactly on a birthday", () => {
  const r = C.age("2000-06-10", "2026-06-10");
  assert.strictEqual(r.years, 26);
  assert.strictEqual(r.months, 0);
  assert.strictEqual(r.days, 0);
  assert.strictEqual(r.nextBirthdayIn, 0);
});

test("age: borrowing across month boundaries uses real month lengths", () => {
  // 31 Jan -> 1 Mar in a non-leap year: February has 28 days.
  const r = C.age("2025-01-31", "2025-03-01");
  assert.strictEqual(r.months, 1);
  assert.strictEqual(r.days, 1);
});

test("age: leap day birthday rolls to 1 March in common years", () => {
  // 2025 is not a leap year, so the birthday is observed on 1 March.
  // Asked on 28 February, the next birthday is the very next day.
  const eve = C.age("2000-02-29", "2025-02-28");
  assert.strictEqual(eve.nextBirthdayOn, "2025-03-01");
  assert.strictEqual(eve.nextBirthdayIn, 1);

  // Asked on 1 March itself, that is the birthday — zero days away.
  const onDay = C.age("2000-02-29", "2025-03-01");
  assert.strictEqual(onDay.years, 25);
  assert.strictEqual(onDay.nextBirthdayIn, 0);
  assert.strictEqual(onDay.nextBirthdayOn, "2025-03-01");
});

test("age: leap day birthday lands on 29 Feb in a leap year", () => {
  const r = C.age("2000-02-29", "2028-01-01");
  assert.strictEqual(r.nextBirthdayOn, "2028-02-29");
});

test("age: total day count includes leap days", () => {
  // 2024 is a leap year, so this span is 366 days.
  assert.strictEqual(C.age("2024-01-01", "2025-01-01").totalDays, 366);
  assert.strictEqual(C.age("2025-01-01", "2026-01-01").totalDays, 365);
});

test("age: future birth date returns null", () => {
  assert.strictEqual(C.age("2030-01-01", "2026-01-01"), null);
});

test("age: invalid date returns null", () => {
  assert.strictEqual(C.age("not-a-date", "2026-01-01"), null);
});

test("age: reports the correct weekday of birth", () => {
  assert.strictEqual(C.age("2000-01-01", "2026-01-01").bornOn, "Saturday");
});

/* ------------------------------------------------------------------ *
 * BMI
 * ------------------------------------------------------------------ */

test("bmi: standard metric case", () => {
  const r = C.bmi(70, 175);
  assert.strictEqual(r.value, 22.9);
  assert.strictEqual(r.category, "Healthy weight");
});

test("bmi: healthy weight range for the given height", () => {
  const r = C.bmi(70, 175);
  assert.strictEqual(r.healthyKg.min, 56.7);
  assert.strictEqual(r.healthyKg.max, 76.3);
});

test("bmi: WHO category boundaries", () => {
  assert.strictEqual(C.bmi(50, 175).category, "Underweight");
  assert.strictEqual(C.bmi(80, 175).category, "Overweight");
  assert.strictEqual(C.bmi(95, 175).category, "Obesity class I");
  assert.strictEqual(C.bmi(110, 175).category, "Obesity class II");
  assert.strictEqual(C.bmi(130, 175).category, "Obesity class III");
});

test("bmi: Asian-Pacific cut-offs differ from WHO", () => {
  const r = C.bmi(74, 175); // BMI 24.2
  assert.strictEqual(r.category, "Healthy weight");
  assert.strictEqual(r.asianCategory, "Increased risk");
});

test("bmi: imperial matches metric within rounding", () => {
  const metric = C.bmi(69.85, 175.26); // 154 lb, 5 ft 9 in
  const imperial = C.bmiFromImperial(154, 5, 9);
  assert.ok(Math.abs(metric.value - imperial.value) <= 0.1);
});

test("bmi: rejects nonsense input", () => {
  assert.strictEqual(C.bmi(0, 175), null);
  assert.strictEqual(C.bmi(70, 0), null);
  assert.strictEqual(C.bmi(-5, 175), null);
  assert.strictEqual(C.bmi("abc", 175), null);
  assert.strictEqual(C.bmi(1000, 175), null);
});

test("bmi: difference from the healthy range", () => {
  assert.strictEqual(C.bmi(70, 175).differenceKg, 0);
  assert.ok(C.bmi(90, 175).differenceKg > 0);
  assert.ok(C.bmi(50, 175).differenceKg < 0);
});

/* ------------------------------------------------------------------ *
 * Unit conversion
 * ------------------------------------------------------------------ */

test("convert: length uses exact definitions", () => {
  assert.strictEqual(C.convert(1, "in", "cm", "length"), 2.54);
  assert.strictEqual(C.convert(1, "mi", "km", "length"), 1.609344);
  assert.strictEqual(C.convert(1, "ft", "m", "length"), 0.3048);
});

test("convert: mass", () => {
  assert.strictEqual(C.convert(1, "lb", "kg", "mass"), 0.45359237);
  assert.ok(Math.abs(C.convert(1, "kg", "lb", "mass") - 2.2046226218) < 1e-8);
});

test("convert: digital storage uses 1024", () => {
  assert.strictEqual(C.convert(1, "GB", "MB", "data"), 1024);
  assert.strictEqual(C.convert(2048, "MB", "GB", "data"), 2);
  assert.strictEqual(C.convert(1, "TB", "GB", "data"), 1024);
});

test("convert: round-trip returns the original value", () => {
  const there = C.convert(123.456, "m", "ft", "length");
  const back = C.convert(there, "ft", "m", "length");
  assert.ok(Math.abs(back - 123.456) < 1e-6);
});

test("temperature: known anchor points", () => {
  assert.strictEqual(C.temperature(0, "C", "F"), 32);
  assert.strictEqual(C.temperature(100, "C", "F"), 212);
  assert.strictEqual(C.temperature(-40, "C", "F"), -40);
  assert.strictEqual(C.temperature(37, "C", "F"), 98.6);
  assert.strictEqual(C.temperature(0, "C", "K"), 273.15);
});

test("temperature: reverse conversions", () => {
  assert.strictEqual(C.temperature(212, "F", "C"), 100);
  assert.strictEqual(C.temperature(273.15, "K", "C"), 0);
});

test("convert: unknown unit or category returns null", () => {
  assert.strictEqual(C.convert(1, "xx", "cm", "length"), null);
  assert.strictEqual(C.convert(1, "in", "cm", "nope"), null);
});

test("convert: US and imperial gallons differ", () => {
  const us = C.convert(1, "gal", "l", "volume");
  const uk = C.convert(1, "gal-uk", "l", "volume");
  assert.strictEqual(us, 3.785411784);
  assert.strictEqual(uk, 4.54609);
});

/* ------------------------------------------------------------------ *
 * Password
 * ------------------------------------------------------------------ */

test("generatePassword: respects the requested length", () => {
  for (const len of [8, 16, 20, 32, 64]) {
    assert.strictEqual(C.generatePassword({ length: len }).value.length, len);
  }
});

test("generatePassword: clamps out-of-range lengths", () => {
  assert.strictEqual(C.generatePassword({ length: 2 }).value.length, 4);
  assert.strictEqual(C.generatePassword({ length: 500 }).value.length, 128);
});

test("generatePassword: includes at least one character from each set", () => {
  for (let i = 0; i < 50; i++) {
    const pw = C.generatePassword({
      length: 12, lower: true, upper: true, digits: true, symbols: true
    }).value;
    assert.ok(/[a-z]/.test(pw), "missing lowercase: " + pw);
    assert.ok(/[A-Z]/.test(pw), "missing uppercase: " + pw);
    assert.ok(/\d/.test(pw), "missing digit: " + pw);
    assert.ok(/[^A-Za-z0-9]/.test(pw), "missing symbol: " + pw);
  }
});

test("generatePassword: honors disabled character sets", () => {
  const pw = C.generatePassword({
    length: 30, lower: true, upper: false, digits: false, symbols: false
  }).value;
  assert.ok(/^[a-z]+$/.test(pw), pw);
});

test("generatePassword: avoids ambiguous characters when asked", () => {
  for (let i = 0; i < 30; i++) {
    const pw = C.generatePassword({ length: 40, noAmbiguous: true, symbols: false }).value;
    assert.ok(!/[lI1O0o5S2Z8B]/.test(pw), pw);
  }
});

test("generatePassword: produces different values each call", () => {
  const seen = new Set();
  for (let i = 0; i < 100; i++) seen.add(C.generatePassword({ length: 16 }).value);
  assert.strictEqual(seen.size, 100);
});

test("generatePassword: accepts an injected random source for determinism", () => {
  const seq = [0, 1, 2, 3, 4, 5, 6, 7];
  let i = 0;
  const random = n => seq[i++ % seq.length] % n;
  const a = C.generatePassword({ length: 10, random });
  i = 0;
  const b = C.generatePassword({ length: 10, random });
  assert.strictEqual(a.value, b.value);
});

test("passwordStrength: entropy rises with length", () => {
  const short = C.passwordStrength("Abc1!");
  const long = C.passwordStrength("Abc1!Abc1!Abc1!Abc1!");
  assert.ok(long.entropyBits > short.entropyBits);
});

test("passwordStrength: penalizes repeated characters", () => {
  assert.ok(C.passwordStrength("aaaaaaaaaaaaaaaa").entropyBits < 20);
});

test("passwordStrength: labels a strong password correctly", () => {
  const r = C.passwordStrength("kJ8#mQ2$vX9!pL4@wR7&");
  assert.strictEqual(r.label, "Very strong");
  assert.strictEqual(r.score, 4);
});

test("passwordStrength: empty password is handled", () => {
  assert.strictEqual(C.passwordStrength("").entropyBits, 0);
});

test("generatePassphrase: word count and separator", () => {
  const r = C.generatePassphrase({ words: 4, separator: "-", number: false });
  assert.strictEqual(r.value.split("-").length, 4);
});

test("generatePassphrase: appends digits when requested", () => {
  const r = C.generatePassphrase({ words: 3, number: true });
  assert.ok(/\d{2}$/.test(r.value), r.value);
});

test("crackTime: scales sensibly with entropy", () => {
  assert.strictEqual(C.crackTime(0), "instantly");
  assert.ok(/universe/.test(C.crackTime(200)));
});

/* ------------------------------------------------------------------ *
 * Size helpers
 * ------------------------------------------------------------------ */

test("parseSize: understands common notations", () => {
  assert.strictEqual(C.parseSize("200 KB"), 204800);
  assert.strictEqual(C.parseSize("200kb"), 204800);
  assert.strictEqual(C.parseSize("200"), 204800); // bare numbers read as KB
  assert.strictEqual(C.parseSize("0.5 MB"), 524288);
  assert.strictEqual(C.parseSize("1MB"), 1048576);
  assert.strictEqual(C.parseSize("500 B"), 500);
});

test("parseSize: rejects invalid input", () => {
  assert.strictEqual(C.parseSize("abc"), null);
  assert.strictEqual(C.parseSize(""), null);
  assert.strictEqual(C.parseSize("-5 KB"), null);
  assert.strictEqual(C.parseSize("0"), null);
});

test("formatBytes: human-readable output", () => {
  assert.strictEqual(C.formatBytes(500), "500 B");
  assert.strictEqual(C.formatBytes(204800), "200 KB");
  assert.strictEqual(C.formatBytes(1048576), "1.0 MB");
});

test("scaleToFit: preserves the aspect ratio", () => {
  const r = C.scaleToFit(4000, 3000, 1600, 1600);
  assert.strictEqual(r.width, 1600);
  assert.strictEqual(r.height, 1200);
});

test("scaleToFit: never upscales a small image", () => {
  const r = C.scaleToFit(800, 600, 1600, 1600);
  assert.strictEqual(r.width, 800);
  assert.strictEqual(r.height, 600);
  assert.strictEqual(r.ratio, 1);
});

test("nextQuality: binary search narrows toward the target", () => {
  let state = { lo: 0.15, hi: 0.96, q: 0.8 };
  const first = C.nextQuality(state, 500000, 204800); // too big -> lower quality
  assert.ok(first.q < 0.8);
  const second = C.nextQuality(first, 100000, 204800); // now too small -> raise
  assert.ok(second.q > first.q);
});

test("formatDuration: seconds, minutes and hours", () => {
  assert.strictEqual(C.formatDuration(45), "45 sec");
  assert.strictEqual(C.formatDuration(60), "1 min");
  assert.strictEqual(C.formatDuration(95), "1 min 35 sec");
  assert.strictEqual(C.formatDuration(3600), "1 hr");
});

test("detectQrType: classifies common payloads", () => {
  assert.strictEqual(C.detectQrType("https://example.com"), "url");
  assert.strictEqual(C.detectQrType("example.com"), "url");
  assert.strictEqual(C.detectQrType("hi@example.com"), "email");
  assert.strictEqual(C.detectQrType("+1 555 123 4567"), "phone");
  assert.strictEqual(C.detectQrType("just some words"), "text");
  assert.strictEqual(C.detectQrType(""), "empty");
});
