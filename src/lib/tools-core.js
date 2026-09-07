/**
 * tools-core.js — every calculation on ToolPeak, as pure functions.
 *
 * No DOM, no globals, no dependencies. That means:
 *   - Node can unit-test it (tests/tools-core.test.js)
 *   - the browser can inline it and run every tool offline
 *
 * Style rule: a function returns `null` when the input cannot produce an answer,
 * never NaN and never a thrown error. The UI decides how to say "—".
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ToolsCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * helpers
   * ------------------------------------------------------------------ */

  function round(n, places) {
    if (!isFinite(n)) return n;
    var f = Math.pow(10, places === undefined ? 6 : places);
    // The +Number.EPSILON nudge fixes 1.005 -> 1.0 style float surprises.
    return Math.round((n + (n >= 0 ? 1 : -1) * Number.EPSILON * Math.abs(n)) * f) / f;
  }

  function num(v) {
    if (v === "" || v === null || v === undefined) return null;
    var n = typeof v === "number" ? v : Number(String(v).trim().replace(/,/g, ""));
    return isFinite(n) ? n : null;
  }

  /* ------------------------------------------------------------------ *
   * 1. Word counter
   * ------------------------------------------------------------------ */

  /**
   * Counts words the way a word processor does: runs of non-whitespace.
   * Reading speed defaults to 238 wpm (Brysbaert 2019 meta-analysis of adult
   * silent reading), speaking speed to 130 wpm (unhurried presentation pace).
   */
  function countWords(text, opts) {
    opts = opts || {};
    var wpm = opts.wordsPerMinute || 238;
    var spm = opts.speakingWordsPerMinute || 130;
    var raw = String(text == null ? "" : text);
    var trimmed = raw.trim();

    if (!trimmed) {
      return {
        words: 0, characters: 0, charactersNoSpaces: 0,
        sentences: 0, paragraphs: 0, lines: 0,
        uniqueWords: 0, longestWord: "", averageWordLength: 0,
        readingSeconds: 0, speakingSeconds: 0,
        pagesSingleSpaced: 0, pagesDoubleSpaced: 0
      };
    }

    var wordList = trimmed.split(/\s+/).filter(Boolean);
    var words = wordList.length;
    var characters = raw.length;
    var charactersNoSpaces = raw.replace(/\s/g, "").length;

    // A sentence ends at . ! ? … or their CJK equivalents, allowing "Dr." style
    // abbreviations to merge into the following sentence rather than split it.
    var sentences = (trimmed.match(/[^.!?…。！？]+[.!?…。！？]*/g) || []).filter(function (s) {
      return s.trim().length > 0;
    }).length;

    var paragraphs = trimmed.split(/\n\s*\n/).filter(function (p) {
      return p.trim().length > 0;
    }).length;

    var lines = trimmed.split(/\n/).length;

    var seen = Object.create(null);
    var longest = "";
    var letterTotal = 0;
    for (var i = 0; i < wordList.length; i++) {
      var clean = wordList[i].replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      if (!clean) continue;
      letterTotal += clean.length;
      if (clean.length > longest.length) longest = clean;
      seen[clean.toLowerCase()] = 1;
    }

    return {
      words: words,
      characters: characters,
      charactersNoSpaces: charactersNoSpaces,
      sentences: sentences || 1,
      paragraphs: paragraphs || 1,
      lines: lines,
      uniqueWords: Object.keys(seen).length,
      longestWord: longest,
      averageWordLength: words ? round(letterTotal / words, 1) : 0,
      readingSeconds: Math.round((words / wpm) * 60),
      speakingSeconds: Math.round((words / spm) * 60),
      // 12pt Times New Roman, 1in margins: ~500 words single-spaced, ~250 double.
      pagesSingleSpaced: round(words / 500, 2),
      pagesDoubleSpaced: round(words / 250, 2)
    };
  }

  /** "95" -> "1m 35s" — used for reading/speaking time. */
  function formatDuration(totalSeconds) {
    var s = Math.max(0, Math.round(Number(totalSeconds) || 0));
    if (s < 60) return s + " sec";
    var m = Math.floor(s / 60);
    var rest = s % 60;
    if (m < 60) return m + " min" + (rest ? " " + rest + " sec" : "");
    var h = Math.floor(m / 60);
    return h + " hr" + (m % 60 ? " " + (m % 60) + " min" : "");
  }

  /* ------------------------------------------------------------------ *
   * 2. Text case converter
   * ------------------------------------------------------------------ */

  // Words that stay lowercase inside a title (AP / Chicago overlap).
  var TITLE_MINOR = {
    a: 1, an: 1, and: 1, as: 1, at: 1, but: 1, by: 1, en: 1, for: 1, if: 1,
    in: 1, nor: 1, of: 1, on: 1, or: 1, per: 1, so: 1, the: 1, to: 1, v: 1,
    vs: 1, via: 1, yet: 1
  };

  function upperFirst(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /** Splits "hello_world-again XML" into ["hello","world","again","XML"]. */
  function tokenize(text) {
    return String(text == null ? "" : text)
      .replace(/([a-z\d])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean);
  }

  function convertCase(text, mode) {
    var t = String(text == null ? "" : text);
    if (!t) return "";

    switch (mode) {
      case "upper":
        return t.toUpperCase();

      case "lower":
        return t.toLowerCase();

      case "title":
        // Capitalize every word except minor words that are not first or last.
        return t.replace(/[^\n]+/g, function (line) {
          var parts = line.split(/(\s+)/);
          var wordIndexes = [];
          parts.forEach(function (p, i) { if (p.trim()) wordIndexes.push(i); });
          return parts.map(function (part, i) {
            if (!part.trim()) return part;
            var lower = part.toLowerCase();
            var bare = lower.replace(/[^\p{L}\p{N}]/gu, "");
            var isFirst = i === wordIndexes[0];
            var isLast = i === wordIndexes[wordIndexes.length - 1];
            if (!isFirst && !isLast && TITLE_MINOR[bare]) return lower;
            // Handle leading punctuation such as ("hello  or  'quoted.
            return lower.replace(/\p{L}/u, function (c) { return c.toUpperCase(); });
          }).join("");
        });

      case "sentence":
        return t.toLowerCase().replace(
          /(^\s*\p{L})|([.!?…]\s+\p{L})|(\n\s*\p{L})/gu,
          function (m) { return m.toUpperCase(); }
        );

      case "camel": {
        var camel = tokenize(t);
        return camel.map(function (w, i) {
          return i === 0 ? w.toLowerCase() : upperFirst(w.toLowerCase());
        }).join("");
      }

      case "pascal":
        return tokenize(t).map(function (w) { return upperFirst(w.toLowerCase()); }).join("");

      case "snake":
        return tokenize(t).map(function (w) { return w.toLowerCase(); }).join("_");

      case "constant":
        return tokenize(t).map(function (w) { return w.toUpperCase(); }).join("_");

      case "kebab":
        return tokenize(t).map(function (w) { return w.toLowerCase(); }).join("-");

      case "dot":
        return tokenize(t).map(function (w) { return w.toLowerCase(); }).join(".");

      case "alternating":
        var flip = 0;
        return t.replace(/\p{L}/gu, function (c) {
          return (flip++ % 2 === 0) ? c.toLowerCase() : c.toUpperCase();
        });

      case "inverse":
        return t.replace(/\p{L}/gu, function (c) {
          return c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase();
        });

      default:
        return t;
    }
  }

  /* ------------------------------------------------------------------ *
   * 3. Percentage calculator
   * ------------------------------------------------------------------ */

  /**
   * mode:
   *   "of"        -> a% of b            (20% of 150 = 30)
   *   "isWhatPct" -> a is what % of b   (30 is what % of 150 = 20)
   *   "change"    -> % change a -> b    (150 -> 180 = +20%)
   *   "fromPct"   -> a is b% of what    (30 is 20% of 150)
   */
  function percentage(a, b, mode) {
    var x = num(a), y = num(b);
    if (x === null || y === null) return null;
    switch (mode) {
      case "of":        return round((x / 100) * y, 10);
      case "isWhatPct": return y === 0 ? null : round((x / y) * 100, 10);
      case "change":    return x === 0 ? null : round(((y - x) / Math.abs(x)) * 100, 10);
      case "fromPct":   return y === 0 ? null : round((x / y) * 100, 10);
      default:          return null;
    }
  }

  /** Adds or removes a percentage: discount, tip, sales tax, markup. */
  function applyPercent(value, percent, direction) {
    var v = num(value), p = num(percent);
    if (v === null || p === null) return null;
    var delta = (v * p) / 100;
    var result = direction === "decrease" ? v - delta : v + delta;
    return { amount: round(delta, 6), result: round(result, 6) };
  }

  /* ------------------------------------------------------------------ *
   * 4. Age calculator
   * ------------------------------------------------------------------ */

  function toDate(value) {
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value !== "string" || !value) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    // Build at local noon so a timezone shift can never move the calendar day.
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
    var d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  var MS_DAY = 86400000;

  /**
   * Adds whole months to a date, clamping to the end of the target month.
   * 31 January + 1 month = 28 February (or 29th in a leap year), which is the
   * convention every calendar application uses.
   */
  function addMonths(date, count) {
    var y = date.getFullYear();
    var m = date.getMonth() + count;
    var d = date.getDate();
    var lastDay = new Date(y, m + 1, 0).getDate();
    return new Date(y, m, Math.min(d, lastDay), 12, 0, 0, 0);
  }

  function age(birth, on) {
    var from = toDate(birth);
    var to = on ? toDate(on) : new Date();
    if (!from || !to) return null;
    if (to.getTime() < from.getTime()) return null;

    // Count whole elapsed months first, then measure the day remainder from
    // the resulting anniversary. Doing it this way keeps the day count correct
    // when the borrowed month is shorter than the day-of-month difference
    // (for example 31 January to 1 March, where naive borrowing goes negative).
    var wholeMonths = (to.getFullYear() - from.getFullYear()) * 12 +
                      (to.getMonth() - from.getMonth());
    if (to.getDate() < from.getDate()) wholeMonths -= 1;
    if (wholeMonths < 0) wholeMonths = 0;

    var anniversary = addMonths(from, wholeMonths);
    var days = Math.round(
      (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
       Date.UTC(anniversary.getFullYear(), anniversary.getMonth(), anniversary.getDate())) / MS_DAY
    );

    var years = Math.floor(wholeMonths / 12);
    var months = wholeMonths % 12;

    var startUTC = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    var endUTC = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
    var totalDays = Math.round((endUTC - startUTC) / MS_DAY);

    // Next birthday, handling Feb 29 by rolling to Mar 1 in common years.
    // A birthday falling on the reference date counts as today, not next year.
    var bMonth = from.getMonth(), bDay = from.getDate();
    var nextYear = to.getFullYear();
    var next = new Date(nextYear, bMonth, bDay, 12, 0, 0, 0);
    if (next.getMonth() !== bMonth) next = new Date(nextYear, bMonth + 1, 1, 12, 0, 0, 0);
    if (next.getTime() < to.getTime()) {
      nextYear += 1;
      next = new Date(nextYear, bMonth, bDay, 12, 0, 0, 0);
      if (next.getMonth() !== bMonth) next = new Date(nextYear, bMonth + 1, 1, 12, 0, 0, 0);
    }
    var daysToBirthday = Math.round(
      (Date.UTC(next.getFullYear(), next.getMonth(), next.getDate()) - endUTC) / MS_DAY
    );

    var DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return {
      years: years,
      months: months,
      days: days,
      totalMonths: years * 12 + months,
      totalWeeks: Math.floor(totalDays / 7),
      totalDays: totalDays,
      totalHours: totalDays * 24,
      totalMinutes: totalDays * 24 * 60,
      bornOn: DOW[from.getDay()],
      nextBirthdayIn: daysToBirthday,
      nextBirthdayOn: next.getFullYear() + "-" +
        String(next.getMonth() + 1).padStart(2, "0") + "-" +
        String(next.getDate()).padStart(2, "0"),
      // On the birthday itself they are turning the age they just reached.
      turning: daysToBirthday === 0 ? years : years + 1
    };
  }

  /* ------------------------------------------------------------------ *
   * 5. BMI calculator
   * ------------------------------------------------------------------ */

  var LB_PER_KG = 2.2046226218487757;
  var CM_PER_IN = 2.54;

  /**
   * bmi(weightKg, heightCm) — metric in, everything out.
   * Categories are the WHO adult cut-offs. Also returns the Asian-Pacific
   * cut-offs, which many clinicians use for South Asian and East Asian adults.
   */
  function bmi(weightKg, heightCm) {
    var w = num(weightKg), h = num(heightCm);
    if (w === null || h === null || w <= 0 || h <= 0) return null;
    if (w > 700 || h > 300) return null;

    var m = h / 100;
    var value = round(w / (m * m), 1);

    // The six categories documented on the BMI page. WHO also subdivides
    // "underweight" into severe/moderate thinness, but that detail is not
    // actionable for a general-purpose screening tool.
    var category;
    if (value < 18.5) category = "Underweight";
    else if (value < 25) category = "Healthy weight";
    else if (value < 30) category = "Overweight";
    else if (value < 35) category = "Obesity class I";
    else if (value < 40) category = "Obesity class II";
    else category = "Obesity class III";

    var asian;
    if (value < 18.5) asian = "Underweight";
    else if (value < 23) asian = "Healthy weight";
    else if (value < 27.5) asian = "Increased risk";
    else asian = "High risk";

    var minKg = round(18.5 * m * m, 1);
    var maxKg = round(24.9 * m * m, 1);

    return {
      value: value,
      category: category,
      asianCategory: asian,
      healthyKg: { min: minKg, max: maxKg },
      healthyLb: { min: round(minKg * LB_PER_KG, 1), max: round(maxKg * LB_PER_KG, 1) },
      // Negative = below the healthy band, positive = above it, 0 = inside.
      differenceKg: value < 18.5 ? round(w - minKg, 1) : (value > 24.9 ? round(w - maxKg, 1) : 0),
      // BMI Prime: your BMI divided by the upper healthy limit.
      prime: round(value / 25, 2),
      // Ponderal index copes better with very tall and very short adults.
      ponderalIndex: round(w / (m * m * m), 1)
    };
  }

  /** Feet+inches -> cm. bmiFromImperial(154, 5, 9) */
  function bmiFromImperial(weightLb, feet, inches) {
    var lb = num(weightLb), ft = num(feet) || 0, inch = num(inches) || 0;
    if (lb === null || lb <= 0) return null;
    var totalIn = ft * 12 + inch;
    if (totalIn <= 0) return null;
    return bmi(lb / LB_PER_KG, totalIn * CM_PER_IN);
  }

  /* ------------------------------------------------------------------ *
   * 6. Unit converter
   * ------------------------------------------------------------------ */

  var UNITS = {
    length: {
      label: "Length",
      base: "m",
      units: {
        mm: { name: "Millimeter", factor: 0.001 },
        cm: { name: "Centimeter", factor: 0.01 },
        m: { name: "Meter", factor: 1 },
        km: { name: "Kilometer", factor: 1000 },
        in: { name: "Inch", factor: 0.0254 },
        ft: { name: "Foot", factor: 0.3048 },
        yd: { name: "Yard", factor: 0.9144 },
        mi: { name: "Mile", factor: 1609.344 },
        nmi: { name: "Nautical mile", factor: 1852 }
      },
      common: [["in", "cm"], ["cm", "in"], ["mm", "in"], ["ft", "m"], ["mi", "km"]]
    },
    mass: {
      label: "Weight",
      base: "kg",
      units: {
        mg: { name: "Milligram", factor: 0.000001 },
        g: { name: "Gram", factor: 0.001 },
        kg: { name: "Kilogram", factor: 1 },
        t: { name: "Metric ton", factor: 1000 },
        oz: { name: "Ounce", factor: 0.028349523125 },
        lb: { name: "Pound", factor: 0.45359237 },
        st: { name: "Stone", factor: 6.35029318 }
      },
      common: [["kg", "lb"], ["lb", "kg"], ["g", "oz"], ["st", "kg"]]
    },
    temperature: {
      label: "Temperature",
      base: "C",
      units: {
        C: { name: "Celsius" },
        F: { name: "Fahrenheit" },
        K: { name: "Kelvin" }
      },
      common: [["C", "F"], ["F", "C"]]
    },
    data: {
      label: "Digital storage",
      base: "B",
      units: {
        B: { name: "Byte", factor: 1 },
        KB: { name: "Kilobyte (1024 B)", factor: 1024 },
        MB: { name: "Megabyte (1024 KB)", factor: 1048576 },
        GB: { name: "Gigabyte (1024 MB)", factor: 1073741824 },
        TB: { name: "Terabyte (1024 GB)", factor: 1099511627776 }
      },
      common: [["MB", "GB"], ["GB", "MB"], ["KB", "MB"]]
    },
    volume: {
      label: "Volume",
      base: "l",
      units: {
        ml: { name: "Milliliter", factor: 0.001 },
        l: { name: "Liter", factor: 1 },
        tsp: { name: "Teaspoon (US)", factor: 0.00492892159375 },
        tbsp: { name: "Tablespoon (US)", factor: 0.01478676478125 },
        "fl-oz": { name: "Fluid ounce (US)", factor: 0.0295735295625 },
        cup: { name: "Cup (US)", factor: 0.2365882365 },
        pt: { name: "Pint (US)", factor: 0.473176473 },
        qt: { name: "Quart (US)", factor: 0.946352946 },
        gal: { name: "Gallon (US)", factor: 3.785411784 },
        "gal-uk": { name: "Gallon (imperial)", factor: 4.54609 }
      },
      common: [["ml", "fl-oz"], ["cup", "ml"], ["gal", "l"]]
    },
    area: {
      label: "Area",
      base: "m2",
      units: {
        cm2: { name: "Square centimeter", factor: 0.0001 },
        m2: { name: "Square meter", factor: 1 },
        km2: { name: "Square kilometer", factor: 1000000 },
        in2: { name: "Square inch", factor: 0.00064516 },
        ft2: { name: "Square foot", factor: 0.09290304 },
        yd2: { name: "Square yard", factor: 0.83612736 },
        ac: { name: "Acre", factor: 4046.8564224 },
        ha: { name: "Hectare", factor: 10000 }
      },
      common: [["ft2", "m2"], ["m2", "ft2"], ["ac", "ha"]]
    },
    speed: {
      label: "Speed",
      base: "m/s",
      units: {
        "m/s": { name: "Meters/second", factor: 1 },
        "km/h": { name: "Kilometers/hour", factor: 0.2777777777777778 },
        mph: { name: "Miles/hour", factor: 0.44704 },
        knot: { name: "Knot", factor: 0.5144444444444445 },
        "ft/s": { name: "Feet/second", factor: 0.3048 }
      },
      common: [["mph", "km/h"], ["km/h", "mph"]]
    },
    time: {
      label: "Time",
      base: "s",
      units: {
        ms: { name: "Millisecond", factor: 0.001 },
        s: { name: "Second", factor: 1 },
        min: { name: "Minute", factor: 60 },
        h: { name: "Hour", factor: 3600 },
        d: { name: "Day", factor: 86400 },
        wk: { name: "Week", factor: 604800 },
        mo: { name: "Month (30.44 d)", factor: 2629746 },
        yr: { name: "Year (365.25 d)", factor: 31557600 }
      },
      common: [["h", "min"], ["d", "h"], ["wk", "d"]]
    }
  };

  function temperature(value, from, to) {
    var v = num(value);
    if (v === null) return null;
    var c;
    if (from === "C") c = v;
    else if (from === "F") c = (v - 32) * 5 / 9;
    else if (from === "K") c = v - 273.15;
    else return null;
    if (to === "C") return round(c, 10);
    if (to === "F") return round(c * 9 / 5 + 32, 10);
    if (to === "K") return round(c + 273.15, 10);
    return null;
  }

  function convert(value, from, to, group) {
    if (group === "temperature") return temperature(value, from, to);
    var v = num(value);
    var table = UNITS[group];
    if (v === null || !table) return null;
    var f = table.units[from], t = table.units[to];
    if (!f || !t) return null;
    return round((v * f.factor) / t.factor, 10);
  }

  /* ------------------------------------------------------------------ *
   * 7. Password generator
   * ------------------------------------------------------------------ */

  var CHARSETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digits: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~"
  };
  var AMBIGUOUS = /[lI1O0o5S2Z8B]/g;

  /**
   * Cryptographically secure by default. `opts.random(n)` is injectable so the
   * tests can pin a sequence; in the browser it is crypto.getRandomValues with
   * rejection sampling (modulo bias would quietly weaken short alphabets).
   */
  function secureRandomInt(max) {
    if (max <= 0) return 0;
    var g = (typeof globalThis !== "undefined" && globalThis.crypto) ||
            (typeof self !== "undefined" && self.crypto) || null;
    if (g && typeof g.getRandomValues === "function") {
      var limit = Math.floor(4294967296 / max) * max;
      var arr = new Uint32Array(1);
      var v;
      do { g.getRandomValues(arr); v = arr[0]; } while (v >= limit);
      return v % max;
    }
    // Node without WebCrypto (very old): fall back to the crypto module.
    if (typeof require === "function") {
      try {
        var nodeCrypto = require("crypto");
        return nodeCrypto.randomInt(max);
      } catch (e) { /* fall through */ }
    }
    return Math.floor(Math.random() * max);
  }

  function generatePassword(opts) {
    opts = opts || {};
    var length = Math.max(4, Math.min(128, parseInt(opts.length, 10) || 16));
    var rnd = typeof opts.random === "function" ? opts.random : secureRandomInt;

    var pools = [];
    if (opts.lower !== false) pools.push(CHARSETS.lower);
    if (opts.upper !== false) pools.push(CHARSETS.upper);
    if (opts.digits !== false) pools.push(CHARSETS.digits);
    if (opts.symbols) pools.push(CHARSETS.symbols);
    if (!pools.length) pools.push(CHARSETS.lower);

    if (opts.noAmbiguous) {
      pools = pools.map(function (p) { return p.replace(AMBIGUOUS, ""); })
                   .filter(function (p) { return p.length > 0; });
      if (!pools.length) pools.push(CHARSETS.lower);
    }

    var all = pools.join("");
    var chars = [];

    // Guarantee at least one character from each selected pool, then fill.
    for (var p = 0; p < pools.length && p < length; p++) {
      chars.push(pools[p].charAt(rnd(pools[p].length)));
    }
    while (chars.length < length) chars.push(all.charAt(rnd(all.length)));

    // Fisher-Yates so the guaranteed characters are not stuck at the front.
    for (var i = chars.length - 1; i > 0; i--) {
      var j = rnd(i + 1);
      var tmp = chars[i]; chars[i] = chars[j]; chars[j] = tmp;
    }

    var value = chars.join("");
    return Object.assign({ value: value, length: value.length, poolSize: all.length },
      passwordStrength(value, all.length));
  }

  /**
   * Strength as entropy in bits, plus a plain-English crack estimate.
   * Assumes an offline attacker at 1e11 guesses/second (a rented GPU rig
   * against a fast hash). Halved because the average find is half the space.
   */
  function passwordStrength(password, knownPoolSize) {
    var pw = String(password == null ? "" : password);
    if (!pw) return { entropyBits: 0, label: "Empty", score: 0, crackTime: "instantly" };

    var pool = knownPoolSize;
    if (!pool) {
      pool = 0;
      if (/[a-z]/.test(pw)) pool += 26;
      if (/[A-Z]/.test(pw)) pool += 26;
      if (/\d/.test(pw)) pool += 10;
      if (/[^A-Za-z0-9]/.test(pw)) pool += 27;
    }

    var bits = pw.length * (Math.log(pool || 1) / Math.LN2);

    // Penalize the patterns real attackers try first.
    var unique = Object.keys(pw.split("").reduce(function (m, c) { m[c] = 1; return m; }, {})).length;
    if (unique <= 2) bits *= 0.4;
    else if (unique / pw.length < 0.5) bits *= 0.75;
    if (/^(.)\1+$/.test(pw)) bits = Math.min(bits, 8);
    if (/^\d+$/.test(pw) && pw.length <= 8) bits = Math.min(bits, 20);

    bits = round(bits, 1);

    var label, score;
    if (bits < 28) { label = "Very weak"; score = 0; }
    else if (bits < 40) { label = "Weak"; score = 1; }
    else if (bits < 60) { label = "Fair"; score = 2; }
    else if (bits < 80) { label = "Strong"; score = 3; }
    else { label = "Very strong"; score = 4; }

    return { entropyBits: bits, label: label, score: score, crackTime: crackTime(bits) };
  }

  function crackTime(bits) {
    var guessesPerSecond = 1e11;
    var seconds = Math.pow(2, bits) / 2 / guessesPerSecond;
    if (!isFinite(seconds) || seconds > 3.15e18) return "longer than the age of the universe";
    if (seconds < 1) return "instantly";
    var units = [
      [1, "second"], [60, "minute"], [3600, "hour"], [86400, "day"],
      [2629746, "month"], [31557600, "year"], [31557600e3, "thousand years"],
      [31557600e6, "million years"], [31557600e9, "billion years"]
    ];
    var chosen = units[0];
    for (var i = 0; i < units.length; i++) if (seconds >= units[i][0]) chosen = units[i];
    var n = seconds / chosen[0];
    var display = n >= 100 ? Math.round(n) : round(n, 1);
    return display.toLocaleString("en-US") + " " + chosen[1] +
      (display === 1 || /years$/.test(chosen[1]) ? "" : "s");
  }

  /** Memorable passphrase: 4-6 short words + a separator + digits. */
  function generatePassphrase(opts) {
    opts = opts || {};
    var wordCount = Math.max(3, Math.min(10, parseInt(opts.words, 10) || 4));
    var sep = opts.separator === undefined ? "-" : String(opts.separator);
    var rnd = typeof opts.random === "function" ? opts.random : secureRandomInt;
    var list = opts.wordlist && opts.wordlist.length ? opts.wordlist : WORDLIST;
    var picked = [];
    for (var i = 0; i < wordCount; i++) {
      var w = list[rnd(list.length)];
      picked.push(opts.capitalize ? upperFirst(w) : w);
    }
    if (opts.number !== false) picked.push(String(rnd(90) + 10));
    var value = picked.join(sep);
    // Entropy of the *choices*, not the characters.
    var bits = round(wordCount * (Math.log(list.length) / Math.LN2) +
      (opts.number !== false ? Math.log(90) / Math.LN2 : 0), 1);
    return {
      value: value,
      length: value.length,
      entropyBits: bits,
      label: bits < 40 ? "Weak" : bits < 60 ? "Fair" : bits < 80 ? "Strong" : "Very strong",
      score: bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4,
      crackTime: crackTime(bits)
    };
  }

  // 256 short, unambiguous English words = 8 bits of entropy per word.
  var WORDLIST = ("able,acid,acre,aged,aide,ally,aqua,arch,army,atom,aunt,aura,auto,away,axis,baby," +
    "back,bake,bald,ball,band,bank,barn,base,bath,beam,bean,bear,beat,beef,bell,belt,bend,best,bike," +
    "bill,bird,bite,blue,boat,body,boil,bold,bolt,bond,bone,book,boot,born,boss,both,bowl,brew,brick," +
    "bulb,bulk,bush,busy,cabin,cage,cake,calm,camp,cane,cape,card,care,cart,case,cash,cast,cave,cell," +
    "chef,chip,city,clay,clip,club,coal,coat,code,coil,coin,cold,colt,comb,cook,cool,cord,core,corn," +
    "cost,cove,crab,crew,crop,crow,cube,cup,curl,dart,dash,dawn,deal,dear,deck,deep,deer,desk,dial," +
    "dice,dime,dish,dive,dock,dome,door,dose,dove,down,drum,dual,dune,dusk,dust,duty,each,earn,ease," +
    "east,easy,echo,edge,exit,face,fact,fade,fair,fall,farm,fast,fern,file,film,find,fine,fire,firm," +
    "fish,five,flag,flat,flax,flew,flip,flow,foam,fold,folk,font,food,foot,fork,form,fort,four,free," +
    "frog,fuel,full,fund,gain,game,gate,gear,gift,girl,give,glad,glow,glue,goal,goat,gold,golf,good," +
    "gray,grid,grin,grow,gulf,hail,hair,half,hall,halt,hand,hang,harp,haul,hawk,haze,head,heal,heat," +
    "herb,herd,hero,hide,high,hill,hint,hive,hold,hole,home,hood,hoop,hope,horn,host,hour,huge,hunt," +
    "idea,inch,iron,item,jade,jazz,jump,jury,keen,keep,kelp,kept,kind,king,kite,knee,knot,lace,lake," +
    "lamb,lamp,land,lane,late,lawn,lead,leaf,leap,left,lend,lens,life,lift,lime,line,link,lion,list," +
    "load,loaf,loan,lock,loft,long,look,loop,lord,loud,love,luck,lung").split(",");

  /* ------------------------------------------------------------------ *
   * 8. Image compressor — pure part
   * ------------------------------------------------------------------ */

  /** Bytes -> "196 KB". Uses 1024, the number every upload form means. */
  function formatBytes(bytes, decimals) {
    var b = Number(bytes);
    if (!isFinite(b) || b < 0) return "—";
    if (b < 1024) return b + " B";
    var units = ["KB", "MB", "GB", "TB"];
    var i = -1;
    do { b /= 1024; i++; } while (b >= 1024 && i < units.length - 1);
    var d = decimals === undefined ? (b < 10 ? 1 : 0) : decimals;
    return b.toFixed(d) + " " + units[i];
  }

  /** "200 KB" / "0.5mb" / "200000" -> bytes. Bare numbers are read as KB. */
  function parseSize(input) {
    if (input === null || input === undefined) return null;
    var s = String(input).trim().toLowerCase().replace(/,/g, "");
    var m = /^([\d.]+)\s*(b|kb|k|mb|m|gb|g)?$/.exec(s);
    if (!m) return null;
    var n = parseFloat(m[1]);
    if (!isFinite(n) || n <= 0) return null;
    switch (m[2]) {
      case "b": return Math.round(n);
      case "mb": case "m": return Math.round(n * 1048576);
      case "gb": case "g": return Math.round(n * 1073741824);
      default: return Math.round(n * 1024); // kb, k, or no unit
    }
  }

  /**
   * Plans the binary search the browser runs against canvas.toBlob().
   * Kept pure so the search strategy itself is testable.
   */
  function nextQuality(state, lastBytes, targetBytes) {
    var lo = state.lo === undefined ? 0.2 : state.lo;
    var hi = state.hi === undefined ? 0.95 : state.hi;
    var q = state.q === undefined ? 0.8 : state.q;
    if (lastBytes > targetBytes) hi = q; else lo = q;
    var next = round((lo + hi) / 2, 4);
    return { lo: lo, hi: hi, q: next, done: hi - lo < 0.02 };
  }

  /** Fit width/height inside a box without distorting the aspect ratio. */
  function scaleToFit(width, height, maxWidth, maxHeight) {
    var w = num(width), h = num(height);
    if (w === null || h === null || w <= 0 || h <= 0) return null;
    var mw = num(maxWidth) || Infinity;
    var mh = num(maxHeight) || Infinity;
    var ratio = Math.min(1, mw / w, mh / h);
    return {
      width: Math.max(1, Math.round(w * ratio)),
      height: Math.max(1, Math.round(h * ratio)),
      ratio: round(ratio, 6)
    };
  }

  /* ------------------------------------------------------------------ *
   * 9. Misc
   * ------------------------------------------------------------------ */

  /** Reasonably strict, deliberately simple URL / text classifier for QR. */
  function detectQrType(text) {
    var t = String(text == null ? "" : text).trim();
    if (!t) return "empty";
    if (/^(https?:)?\/\//i.test(t) || /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(t)) return "url";
    if (/^mailto:/i.test(t) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "email";
    if (/^tel:/i.test(t) || /^\+?[\d\s().-]{7,}$/.test(t)) return "phone";
    if (/^WIFI:/i.test(t)) return "wifi";
    if (/^BEGIN:VCARD/i.test(t)) return "vcard";
    return "text";
  }

  return {
    // shared
    round: round,
    formatDuration: formatDuration,
    formatBytes: formatBytes,
    parseSize: parseSize,
    // tools
    countWords: countWords,
    convertCase: convertCase,
    percentage: percentage,
    applyPercent: applyPercent,
    age: age,
    bmi: bmi,
    bmiFromImperial: bmiFromImperial,
    convert: convert,
    temperature: temperature,
    generatePassword: generatePassword,
    generatePassphrase: generatePassphrase,
    passwordStrength: passwordStrength,
    crackTime: crackTime,
    nextQuality: nextQuality,
    scaleToFit: scaleToFit,
    detectQrType: detectQrType,
    // data
    UNITS: UNITS,
    CHARSETS: CHARSETS,
    WORDLIST: WORDLIST,
    LB_PER_KG: LB_PER_KG,
    CM_PER_IN: CM_PER_IN
  };
});
