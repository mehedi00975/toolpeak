/**
 * app.js — wires the DOM for every tool page.
 *
 * Each tool is inside its own IIFE that bails immediately if its anchor element
 * is missing, so the one shared bundle is safe to inline on every page.
 * All maths lives in tools-core.js; this file only moves values around.
 */
(function () {
  "use strict";

  var C = window.ToolsCore;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function setText(sel, value, ctx) {
    var el = typeof sel === "string" ? $(sel, ctx) : sel;
    if (el) el.textContent = value;
  }
  function nf(n, maxDigits) {
    if (n === null || n === undefined || !isFinite(n)) return "—";
    return Number(n).toLocaleString("en-US", {
      maximumFractionDigits: maxDigits === undefined ? 4 : maxDigits
    });
  }
  function escapeHtml(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  /** Copy-to-clipboard with a visible confirmation and a legacy fallback. */
  function copy(text, btn) {
    function done() {
      if (!btn) return;
      var original = btn.getAttribute("data-label") || btn.textContent;
      btn.setAttribute("data-label", original);
      btn.textContent = "Copied";
      btn.classList.add("is-done");
      clearTimeout(btn._t);
      btn._t = setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("is-done");
      }, 1500);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { }
      document.body.removeChild(ta);
    }
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  function download(blobOrUrl, filename) {
    var url = typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof blobOrUrl !== "string") setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ------------------------------------------------------------------ *
   * Mobile navigation
   * ------------------------------------------------------------------ */
  (function () {
    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close after following a link on mobile.
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  })();

  /* ------------------------------------------------------------------ *
   * 1. Word counter
   * ------------------------------------------------------------------ */
  (function () {
    var input = $("#wc-input");
    if (!input) return;

    function render() {
      var r = C.countWords(input.value);
      setText("#wc-words", r.words.toLocaleString("en-US"));
      setText("#wc-chars", r.characters.toLocaleString("en-US"));
      setText("#wc-chars-ns", r.charactersNoSpaces.toLocaleString("en-US"));
      setText("#wc-sentences", r.sentences.toLocaleString("en-US"));
      setText("#wc-paragraphs", r.paragraphs.toLocaleString("en-US"));
      setText("#wc-reading", C.formatDuration(r.readingSeconds));
      setText("#wc-speaking", C.formatDuration(r.speakingSeconds));
      setText("#wc-unique", r.uniqueWords.toLocaleString("en-US"));
      setText("#wc-avg", r.averageWordLength);
      setText("#wc-longest", r.longestWord || "—");
      setText("#wc-pages", r.pagesSingleSpaced.toFixed(2));
      setText("#wc-pages-double", r.pagesDoubleSpaced.toFixed(2));
    }

    input.addEventListener("input", render);

    $$("[data-wc]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-wc");
        if (action === "clear") {
          input.value = "";
          render();
          input.focus();
        } else if (action === "copy") {
          var r = C.countWords(input.value);
          copy(
            "Words: " + r.words +
            "\nCharacters: " + r.characters +
            "\nCharacters (no spaces): " + r.charactersNoSpaces +
            "\nSentences: " + r.sentences +
            "\nParagraphs: " + r.paragraphs +
            "\nReading time: " + C.formatDuration(r.readingSeconds),
            btn
          );
        } else if (action === "copy-text") {
          copy(input.value, btn);
        }
      });
    });

    render();
  })();

  /* ------------------------------------------------------------------ *
   * 2. Case converter
   * ------------------------------------------------------------------ */
  (function () {
    var input = $("#cc-input");
    var output = $("#cc-output");
    if (!input || !output) return;

    var mode = "upper";

    function render() {
      output.value = C.convertCase(input.value, mode);
      var r = C.countWords(input.value);
      setText("#cc-stats", r.words.toLocaleString("en-US") + " words · " +
        r.characters.toLocaleString("en-US") + " characters");
    }

    $$("[data-case]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        mode = btn.getAttribute("data-case");
        $$("[data-case]").forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        render();
      });
    });

    input.addEventListener("input", render);

    $$("[data-cc]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-cc");
        if (action === "copy") copy(output.value, btn);
        else if (action === "clear") { input.value = ""; render(); input.focus(); }
        else if (action === "swap") { input.value = output.value; render(); }
        else if (action === "download") {
          download(new Blob([output.value], { type: "text/plain;charset=utf-8" }), "converted-text.txt");
        }
      });
    });

    render();
  })();

  /* ------------------------------------------------------------------ *
   * 3. Percentage calculator
   * ------------------------------------------------------------------ */
  (function () {
    if (!$("#pc-of-a")) return;

    function wire(aSel, bSel, outSel, mode, format) {
      var a = $(aSel), b = $(bSel), out = $(outSel);
      if (!a || !b || !out) return;
      function run() {
        if (a.value === "" || b.value === "") { out.textContent = "—"; return; }
        var v = C.percentage(a.value, b.value, mode);
        if (v === null) { out.textContent = "Cannot divide by zero"; return; }
        out.textContent = format ? format(v, a.value, b.value) : nf(v);
      }
      a.addEventListener("input", run);
      b.addEventListener("input", run);
      run();
    }

    wire("#pc-of-a", "#pc-of-b", "#pc-of-out", "of");
    wire("#pc-what-a", "#pc-what-b", "#pc-what-out", "isWhatPct", function (v) {
      return nf(v) + "%";
    });
    wire("#pc-ch-a", "#pc-ch-b", "#pc-ch-out", "change", function (v) {
      var word = v > 0 ? "increase" : v < 0 ? "decrease" : "no change";
      return (v > 0 ? "+" : "") + nf(v) + "%" + (v === 0 ? "" : " " + word);
    });

    // Discount / tip / tax panel
    (function () {
      var base = $("#pc-adj-base"), pct = $("#pc-adj-pct"), dir = $("#pc-adj-dir");
      if (!base || !pct || !dir) return;
      function run() {
        if (base.value === "" || pct.value === "") {
          setText("#pc-adj-out", "—");
          setText("#pc-adj-detail", "");
          return;
        }
        var r = C.applyPercent(base.value, pct.value, dir.value);
        if (!r) { setText("#pc-adj-out", "—"); return; }
        setText("#pc-adj-out", nf(r.result, 2));
        setText("#pc-adj-detail",
          (dir.value === "decrease" ? "You save " : "Added ") + nf(r.amount, 2) +
          " · from " + nf(Number(base.value), 2) + " to " + nf(r.result, 2));
      }
      [base, pct].forEach(function (el) { el.addEventListener("input", run); });
      dir.addEventListener("change", run);
      run();
    })();
  })();

  /* ------------------------------------------------------------------ *
   * 4. Age calculator
   * ------------------------------------------------------------------ */
  (function () {
    var dob = $("#age-dob");
    if (!dob) return;
    var on = $("#age-on");

    var today = new Date();
    var iso = today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");
    if (on && !on.value) on.value = iso;
    dob.max = iso;

    function run() {
      var msg = $("#age-msg");
      var ids = ["#age-y", "#age-m", "#age-d", "#age-months", "#age-weeks",
                 "#age-days", "#age-hours", "#age-minutes", "#age-dow",
                 "#age-next", "#age-next-date", "#age-turning"];

      if (!dob.value) {
        ids.forEach(function (id) { setText(id, "—"); });
        if (msg) msg.textContent = "Pick a date of birth to see the result.";
        return;
      }

      var r = C.age(dob.value, on ? on.value : iso);
      if (!r) {
        ids.forEach(function (id) { setText(id, "—"); });
        if (msg) msg.textContent = "The second date must be on or after the date of birth.";
        return;
      }

      setText("#age-y", r.years);
      setText("#age-m", r.months);
      setText("#age-d", r.days);
      setText("#age-months", r.totalMonths.toLocaleString("en-US"));
      setText("#age-weeks", r.totalWeeks.toLocaleString("en-US"));
      setText("#age-days", r.totalDays.toLocaleString("en-US"));
      setText("#age-hours", r.totalHours.toLocaleString("en-US"));
      setText("#age-minutes", r.totalMinutes.toLocaleString("en-US"));
      setText("#age-dow", r.bornOn);
      setText("#age-next", r.nextBirthdayIn === 0 ? "Today" :
        r.nextBirthdayIn + (r.nextBirthdayIn === 1 ? " day" : " days"));
      setText("#age-next-date", r.nextBirthdayOn);
      setText("#age-turning", r.turning);

      if (msg) {
        msg.textContent = r.nextBirthdayIn === 0
          ? "Happy birthday. Age shown as of " + (on ? on.value : iso) + "."
          : "Age as of " + (on ? on.value : iso) + ".";
      }
    }

    dob.addEventListener("input", run);
    if (on) on.addEventListener("input", run);
    run();
  })();

  /* ------------------------------------------------------------------ *
   * 5. BMI calculator
   * ------------------------------------------------------------------ */
  (function () {
    var wrap = $("#bmi-tool");
    if (!wrap) return;

    var unitInputs = $$("[name=bmi-unit]");
    var metric = $("#bmi-metric"), imperial = $("#bmi-imperial");
    var kg = $("#bmi-kg"), cm = $("#bmi-cm");
    var lb = $("#bmi-lb"), ft = $("#bmi-ft"), inch = $("#bmi-in");

    function currentUnit() {
      var checked = unitInputs.filter(function (i) { return i.checked; })[0];
      return checked ? checked.value : "metric";
    }

    function run() {
      var unit = currentUnit();
      var r = unit === "metric"
        ? C.bmi(kg && kg.value, cm && cm.value)
        : C.bmiFromImperial(lb && lb.value, ft && ft.value, inch && inch.value);

      var bar = $("#bmi-bar");

      if (!r) {
        setText("#bmi-value", "—");
        setText("#bmi-category", "Enter height and weight");
        setText("#bmi-range", "—");
        setText("#bmi-asian", "—");
        setText("#bmi-advice", "");
        setText("#bmi-prime", "—");
        if (bar) bar.style.width = "0%";
        return;
      }

      setText("#bmi-value", r.value.toFixed(1));
      setText("#bmi-category", r.category);
      setText("#bmi-prime", r.prime.toFixed(2));
      setText("#bmi-asian", r.asianCategory);

      setText("#bmi-range", unit === "metric"
        ? r.healthyKg.min + "–" + r.healthyKg.max + " kg"
        : r.healthyLb.min + "–" + r.healthyLb.max + " lb");

      var badge = $("#bmi-category");
      if (badge) {
        badge.className = "badge " + (
          r.category === "Healthy weight" ? "ok" :
          /Obesity/.test(r.category) ? "err" : "warn"
        );
      }

      if (bar) {
        // Map BMI 12–42 onto 0–100% of the bar.
        var pct = Math.max(0, Math.min(100, ((r.value - 12) / 30) * 100));
        bar.style.width = pct + "%";
        bar.className = r.category === "Healthy weight" ? "s4"
          : /Obesity/.test(r.category) ? "s0"
          : r.category === "Overweight" ? "s2" : "s1";
      }

      var advice;
      if (r.differenceKg === 0) {
        advice = "Your weight is inside the healthy range for your height.";
      } else if (r.differenceKg < 0) {
        var gainKg = Math.abs(r.differenceKg);
        advice = "About " + (unit === "metric"
          ? gainKg + " kg"
          : (gainKg * C.LB_PER_KG).toFixed(1) + " lb") + " below the healthy range.";
      } else {
        advice = "About " + (unit === "metric"
          ? r.differenceKg + " kg"
          : (r.differenceKg * C.LB_PER_KG).toFixed(1) + " lb") + " above the healthy range.";
      }
      setText("#bmi-advice", advice);
    }

    unitInputs.forEach(function (radio) {
      radio.addEventListener("change", function () {
        var isMetric = currentUnit() === "metric";
        if (metric) metric.hidden = !isMetric;
        if (imperial) imperial.hidden = isMetric;
        run();
      });
    });

    [kg, cm, lb, ft, inch].forEach(function (el) {
      if (el) el.addEventListener("input", run);
    });

    run();
  })();

  /* ------------------------------------------------------------------ *
   * 6. Unit converter
   * ------------------------------------------------------------------ */
  (function () {
    var group = $("#uc-group");
    if (!group) return;
    var from = $("#uc-from"), to = $("#uc-to"), value = $("#uc-value");

    function optionsFor(g) {
      var table = C.UNITS[g];
      return Object.keys(table.units).map(function (key) {
        return { value: key, label: table.units[key].name + " (" + key + ")" };
      });
    }

    function fill(select, g, preferred) {
      select.innerHTML = "";
      optionsFor(g).forEach(function (o) {
        var opt = document.createElement("option");
        opt.value = o.value;
        opt.textContent = o.label;
        select.appendChild(opt);
      });
      if (preferred) select.value = preferred;
    }

    function run() {
      var g = group.value;
      if (value.value === "") {
        setText("#uc-out", "—");
        setText("#uc-formula", "");
        return;
      }
      var result = C.convert(value.value, from.value, to.value, g);
      if (result === null) {
        setText("#uc-out", "—");
        setText("#uc-formula", "");
        return;
      }
      setText("#uc-out", nf(result, 6) + " " + to.value);
      var one = C.convert(1, from.value, to.value, g);
      setText("#uc-formula", one === null ? "" :
        "1 " + from.value + " = " + nf(one, 8) + " " + to.value);
    }

    function reset(g) {
      var common = C.UNITS[g].common[0];
      fill(from, g, common[0]);
      fill(to, g, common[1]);
      run();
    }

    group.addEventListener("change", function () { reset(group.value); });
    [from, to, value].forEach(function (el) {
      el.addEventListener("input", run);
      el.addEventListener("change", run);
    });

    var swap = $("[data-uc=swap]");
    if (swap) {
      swap.addEventListener("click", function () {
        var t = from.value;
        from.value = to.value;
        to.value = t;
        run();
      });
    }

    // Quick-pick chips, e.g. "inch to cm"
    $$("[data-uc-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var parts = btn.getAttribute("data-uc-preset").split(":");
        group.value = parts[0];
        fill(from, parts[0], parts[1]);
        fill(to, parts[0], parts[2]);
        if (!value.value) value.value = "1";
        run();
      });
    });

    reset(group.value);
  })();

  /* ------------------------------------------------------------------ *
   * 7. Image compressor
   * ------------------------------------------------------------------ */
  (function () {
    var input = $("#ic-file");
    if (!input || typeof FileReader === "undefined") return;

    var drop = $("#ic-drop");
    var preview = $("#ic-preview");
    var dlBtn = $("#ic-download");
    var targetInput = $("#ic-target");
    var maxDim = $("#ic-maxdim");
    var format = $("#ic-format");
    var modeInputs = $$("[name=ic-mode]");
    var qualityWrap = $("#ic-quality-wrap");
    var quality = $("#ic-quality");

    var sourceImage = null;
    var sourceFile = null;
    var resultBlob = null;
    var resultUrl = null;
    var canvas = document.createElement("canvas");

    function mode() {
      var checked = modeInputs.filter(function (i) { return i.checked; })[0];
      return checked ? checked.value : "target";
    }

    function status(text, kind) {
      var el = $("#ic-status");
      if (!el) return;
      el.textContent = text;
      el.className = "note " + (kind || "info");
      el.hidden = !text;
    }

    function encode(q, cb) {
      var type = format.value;
      var limit = Number(maxDim.value) || 1600;
      var fit = C.scaleToFit(sourceImage.naturalWidth, sourceImage.naturalHeight, limit, limit);
      canvas.width = fit.width;
      canvas.height = fit.height;
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, fit.width, fit.height);
      // JPEG has no alpha channel: fill white or transparency turns black.
      if (type === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, fit.width, fit.height);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(sourceImage, 0, 0, fit.width, fit.height);
      canvas.toBlob(function (blob) { cb(blob, fit); }, type, q);
    }

    /**
     * Binary-searches JPEG/WebP quality until the file lands just under the
     * requested size. Shrinks dimensions only if quality alone cannot get there.
     */
    function compressToTarget(targetBytes, done) {
      var state = { lo: 0.15, hi: 0.96, q: 0.8 };
      var best = null;
      var attempts = 0;

      function step() {
        encode(state.q, function (blob, fit) {
          attempts++;
          if (!blob) { done(null, null, attempts); return; }
          if (blob.size <= targetBytes && (!best || blob.size > best.blob.size)) {
            best = { blob: blob, fit: fit, q: state.q };
          }
          var next = C.nextQuality(state, blob.size, targetBytes);
          state = next;
          if (attempts >= 8 || next.done) {
            if (best) { done(best.blob, best.fit, attempts, best.q); return; }
            // Quality floor was not enough — step the dimensions down and retry.
            var currentMax = Number(maxDim.value) || 1600;
            if (currentMax > 400) {
              maxDim.value = Math.round(currentMax * 0.75);
              var label = $("#ic-maxdim-v");
              if (label) label.textContent = maxDim.value;
              state = { lo: 0.15, hi: 0.96, q: 0.8 };
              attempts = 0;
              step();
              return;
            }
            done(blob, fit, attempts, state.q);
            return;
          }
          step();
        });
      }
      step();
    }

    function show(blob, fit, note) {
      resultBlob = blob;
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      resultUrl = URL.createObjectURL(blob);
      preview.src = resultUrl;
      preview.hidden = false;
      dlBtn.disabled = false;

      setText("#ic-new-size", C.formatBytes(blob.size));
      setText("#ic-new-dim", fit.width + " × " + fit.height + " px");
      var saved = sourceFile.size ? (1 - blob.size / sourceFile.size) * 100 : 0;
      setText("#ic-saved", (saved >= 0 ? "−" : "+") + Math.abs(Math.round(saved)) + "%");

      var target = C.parseSize(targetInput.value);
      if (mode() === "target" && target) {
        if (blob.size <= target) {
          status("Done — " + C.formatBytes(blob.size) + ", under your " +
            C.formatBytes(target) + " limit." + (note || ""), "ok");
        } else {
          status("Smallest achievable here is " + C.formatBytes(blob.size) +
            ". Lower the max dimension, or switch the format to JPG.", "");
        }
      } else {
        status("Compressed to " + C.formatBytes(blob.size) + ".", "ok");
      }
    }

    function process() {
      if (!sourceImage || !sourceFile) return;
      status("Compressing…", "info");

      if (mode() === "target") {
        var target = C.parseSize(targetInput.value);
        if (!target) { status("Enter a target size, for example 200 KB.", "err"); return; }
        if (format.value === "image/png") {
          status("PNG has no quality dial. Switch to JPG or WebP to hit a size target.", "");
          encode(1, function (blob, fit) { if (blob) show(blob, fit); });
          return;
        }
        compressToTarget(target, function (blob, fit, attempts, q) {
          if (!blob) { status("This browser could not encode that format. Try JPG.", "err"); return; }
          show(blob, fit, q ? " (quality " + Math.round(q * 100) + "%)" : "");
        });
      } else {
        encode(Number(quality.value), function (blob, fit) {
          if (!blob) { status("This browser could not encode that format. Try JPG.", "err"); return; }
          show(blob, fit);
        });
      }
    }

    var reprocess = debounce(process, 220);

    function load(file) {
      if (!file) return;
      if (!/^image\//.test(file.type)) {
        status("That is not an image file. Choose a JPG, PNG, WebP or GIF.", "err");
        return;
      }
      sourceFile = file;
      setText("#ic-orig-size", C.formatBytes(file.size));
      setText("#ic-orig-name", file.name);

      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        sourceImage = img;
        setText("#ic-orig-dim", img.naturalWidth + " × " + img.naturalHeight + " px");
        var info = $("#ic-info");
        if (info) info.hidden = false;
        // Default the ceiling to the image's own longest edge, capped at 1600.
        var longest = Math.max(img.naturalWidth, img.naturalHeight);
        if (Number(maxDim.value) > longest) {
          maxDim.value = Math.min(longest, 1600);
          var label = $("#ic-maxdim-v");
          if (label) label.textContent = maxDim.value;
        }
        process();
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        status("That image could not be decoded. Try re-saving it as JPG or PNG.", "err");
      };
      img.src = url;
    }

    input.addEventListener("change", function () {
      if (input.files && input.files[0]) load(input.files[0]);
    });

    if (drop) {
      ["dragenter", "dragover"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) {
          e.preventDefault();
          drop.classList.add("dragover");
        });
      });
      ["dragleave", "drop"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) {
          e.preventDefault();
          drop.classList.remove("dragover");
        });
      });
      drop.addEventListener("drop", function (e) {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          load(e.dataTransfer.files[0]);
        }
      });
      drop.addEventListener("click", function () { input.click(); });
      drop.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
      });
    }

    // Paste an image straight from the clipboard.
    document.addEventListener("paste", function (e) {
      if (!e.clipboardData || !e.clipboardData.items) return;
      var items = e.clipboardData.items;
      for (var i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf("image/") === 0) {
          var f = items[i].getAsFile();
          if (f) { load(f); e.preventDefault(); }
          return;
        }
      }
    });

    modeInputs.forEach(function (radio) {
      radio.addEventListener("change", function () {
        var isTarget = mode() === "target";
        var targetWrap = $("#ic-target-wrap");
        if (targetWrap) targetWrap.hidden = !isTarget;
        if (qualityWrap) qualityWrap.hidden = isTarget;
        reprocess();
      });
    });

    [targetInput, format].forEach(function (el) {
      if (el) el.addEventListener("change", reprocess);
    });
    if (targetInput) targetInput.addEventListener("input", reprocess);

    if (maxDim) {
      maxDim.addEventListener("input", function () {
        var label = $("#ic-maxdim-v");
        if (label) label.textContent = maxDim.value;
        reprocess();
      });
    }
    if (quality) {
      quality.addEventListener("input", function () {
        var label = $("#ic-quality-v");
        if (label) label.textContent = Math.round(Number(quality.value) * 100) + "%";
        reprocess();
      });
    }

    // Preset chips: 100 KB / 200 KB / 500 KB / 1 MB
    $$("[data-ic-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        targetInput.value = btn.getAttribute("data-ic-preset");
        var targetRadio = modeInputs.filter(function (i) { return i.value === "target"; })[0];
        if (targetRadio && !targetRadio.checked) {
          targetRadio.checked = true;
          targetRadio.dispatchEvent(new Event("change"));
        } else {
          reprocess();
        }
      });
    });

    if (dlBtn) {
      dlBtn.addEventListener("click", function () {
        if (!resultBlob || !sourceFile) return;
        var ext = format.value === "image/png" ? ".png" :
                  format.value === "image/webp" ? ".webp" : ".jpg";
        var base = sourceFile.name.replace(/\.[^.]+$/, "") || "image";
        download(resultBlob, base + "-compressed" + ext);
      });
    }
  })();

  /* ------------------------------------------------------------------ *
   * 8. Password generator
   * ------------------------------------------------------------------ */
  (function () {
    var out = $("#pw-out");
    if (!out) return;

    var length = $("#pw-length");
    var typeInputs = $$("[name=pw-type]");
    var wordsInput = $("#pw-words");

    function type() {
      var checked = typeInputs.filter(function (i) { return i.checked; })[0];
      return checked ? checked.value : "random";
    }

    function render(result) {
      out.value = result.value;
      setText("#pw-entropy", result.entropyBits + " bits");
      setText("#pw-label", result.label);
      setText("#pw-crack", result.crackTime);
      setText("#pw-length-out", result.value.length);

      var bar = $("#pw-bar");
      if (bar) {
        bar.style.width = Math.min(100, (result.entropyBits / 100) * 100) + "%";
        bar.className = "s" + result.score;
      }
      var badge = $("#pw-label");
      if (badge) {
        badge.className = "badge " + (
          result.score >= 3 ? "ok" : result.score === 2 ? "warn" : "err"
        );
      }
    }

    function generate() {
      if (type() === "passphrase") {
        render(C.generatePassphrase({
          words: wordsInput ? Number(wordsInput.value) : 4,
          capitalize: $("#pw-caps") ? $("#pw-caps").checked : true,
          number: $("#pw-num") ? $("#pw-num").checked : true,
          separator: $("#pw-sep") ? $("#pw-sep").value : "-"
        }));
      } else {
        render(C.generatePassword({
          length: length ? Number(length.value) : 16,
          upper: $("#pw-upper").checked,
          lower: $("#pw-lower").checked,
          digits: $("#pw-digits").checked,
          symbols: $("#pw-symbols").checked,
          noAmbiguous: $("#pw-noamb").checked
        }));
      }
    }

    typeInputs.forEach(function (radio) {
      radio.addEventListener("change", function () {
        var isPhrase = type() === "passphrase";
        var rw = $("#pw-random-opts"), pw = $("#pw-phrase-opts");
        if (rw) rw.hidden = isPhrase;
        if (pw) pw.hidden = !isPhrase;
        generate();
      });
    });

    if (length) {
      length.addEventListener("input", function () {
        var label = $("#pw-length-v");
        if (label) label.textContent = length.value;
        generate();
      });
    }
    if (wordsInput) {
      wordsInput.addEventListener("input", function () {
        var label = $("#pw-words-v");
        if (label) label.textContent = wordsInput.value;
        generate();
      });
    }

    ["#pw-upper", "#pw-lower", "#pw-digits", "#pw-symbols", "#pw-noamb",
     "#pw-caps", "#pw-num", "#pw-sep"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.addEventListener("change", generate);
    });

    $$("[data-pw]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-pw");
        if (action === "generate") generate();
        else if (action === "copy") copy(out.value, btn);
      });
    });

    // Independent strength checker on the same page
    (function () {
      var check = $("#pw-check");
      if (!check) return;
      check.addEventListener("input", function () {
        if (!check.value) {
          setText("#pw-check-label", "—");
          setText("#pw-check-crack", "");
          setText("#pw-check-entropy", "—");
          var b0 = $("#pw-check-bar");
          if (b0) { b0.style.width = "0%"; b0.className = ""; }
          return;
        }
        var r = C.passwordStrength(check.value);
        setText("#pw-check-label", r.label);
        setText("#pw-check-entropy", r.entropyBits + " bits");
        setText("#pw-check-crack", "Offline attack estimate: " + r.crackTime);
        var bar = $("#pw-check-bar");
        if (bar) {
          bar.style.width = Math.min(100, (r.entropyBits / 100) * 100) + "%";
          bar.className = "s" + r.score;
        }
        var badge = $("#pw-check-label");
        if (badge) {
          badge.className = "badge " + (r.score >= 3 ? "ok" : r.score === 2 ? "warn" : "err");
        }
      });
    })();

    generate();
  })();

  /* ------------------------------------------------------------------ *
   * 9. QR code generator
   * ------------------------------------------------------------------ */
  (function () {
    var stage = $("#qr-stage");
    if (!stage || !window.QR) return;

    var typeInputs = $$("[name=qr-type]");
    var ecl = $("#qr-ecl");
    var size = $("#qr-size");
    var dark = $("#qr-dark");
    var light = $("#qr-light");
    var margin = $("#qr-margin");
    var lastMatrix = null;

    function activeType() {
      var checked = typeInputs.filter(function (i) { return i.checked; })[0];
      return checked ? checked.value : "text";
    }

    function payload() {
      var t = activeType();
      if (t === "url") return window.QR.payload.url($("#qr-url").value);
      if (t === "email") {
        return window.QR.payload.email($("#qr-email").value,
          $("#qr-email-subject").value, $("#qr-email-body").value);
      }
      if (t === "phone") return window.QR.payload.phone($("#qr-phone").value);
      if (t === "sms") return window.QR.payload.sms($("#qr-sms").value, $("#qr-sms-msg").value);
      if (t === "wifi") {
        return window.QR.payload.wifi($("#qr-wifi-ssid").value, $("#qr-wifi-pass").value,
          $("#qr-wifi-enc").value, $("#qr-wifi-hidden").checked);
      }
      if (t === "vcard") {
        return window.QR.payload.vcard({
          firstName: $("#qr-vc-first").value, lastName: $("#qr-vc-last").value,
          org: $("#qr-vc-org").value, title: $("#qr-vc-title").value,
          phone: $("#qr-vc-phone").value, email: $("#qr-vc-email").value,
          url: $("#qr-vc-url").value
        });
      }
      return $("#qr-text").value;
    }

    function render() {
      var data = payload();
      var err = $("#qr-error");
      var dl = $$("[data-qr^=download]");

      if (!data || !data.trim()) {
        stage.innerHTML = '<p class="muted small">Your QR code will appear here.</p>';
        if (err) err.hidden = true;
        dl.forEach(function (b) { b.disabled = true; });
        setText("#qr-meta", "");
        lastMatrix = null;
        return;
      }

      try {
        var matrix = window.QR.encode(data, { ecl: ecl ? ecl.value : "M" });
        lastMatrix = matrix;
        var px = size ? Number(size.value) : 320;
        var m = margin ? Number(margin.value) : 4;
        var scale = Math.max(1, Math.round(px / (matrix.size + m * 2)));
        stage.innerHTML = window.QR.toSvg(matrix, {
          scale: scale, margin: m,
          dark: dark ? dark.value : "#000000",
          light: light ? light.value : "#ffffff"
        });
        setText("#qr-meta", "Version " + matrix.version + " · " + matrix.size + "×" +
          matrix.size + " modules · error correction " + matrix.ecl +
          " · " + data.length + " characters");
        if (err) err.hidden = true;
        dl.forEach(function (b) { b.disabled = false; });
      } catch (e) {
        if (err) { err.textContent = e.message; err.hidden = false; }
        dl.forEach(function (b) { b.disabled = true; });
        setText("#qr-meta", "");
        lastMatrix = null;
      }
    }

    var rerender = debounce(render, 130);

    typeInputs.forEach(function (radio) {
      radio.addEventListener("change", function () {
        $$("[data-qr-panel]").forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-qr-panel") !== activeType();
        });
        render();
      });
    });

    $$("#qr-tool input, #qr-tool textarea, #qr-tool select").forEach(function (el) {
      el.addEventListener("input", rerender);
      el.addEventListener("change", rerender);
    });

    if (size) {
      size.addEventListener("input", function () {
        var label = $("#qr-size-v");
        if (label) label.textContent = size.value + " px";
      });
    }

    $$("[data-qr]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!lastMatrix) return;
        var action = btn.getAttribute("data-qr");
        var px = size ? Number(size.value) : 320;
        var m = margin ? Number(margin.value) : 4;

        if (action === "download-svg") {
          var scale = Math.max(1, Math.round(px / (lastMatrix.size + m * 2)));
          var svg = window.QR.toSvg(lastMatrix, {
            scale: scale, margin: m,
            dark: dark ? dark.value : "#000000",
            light: light ? light.value : "#ffffff"
          });
          download(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "qr-code.svg");
        } else if (action === "download-png") {
          var cnv = document.createElement("canvas");
          // Render at 2x for a crisp print/scan result.
          var s = Math.max(2, Math.round((px * 2) / (lastMatrix.size + m * 2)));
          window.QR.toCanvas(lastMatrix, cnv, {
            scale: s, margin: m,
            dark: dark ? dark.value : "#000000",
            light: light ? light.value : "#ffffff"
          });
          cnv.toBlob(function (blob) {
            if (blob) download(blob, "qr-code.png");
          }, "image/png");
        }
      });
    });

    render();
  })();

  /* ------------------------------------------------------------------ *
   * 10. Text diff / compare
   * ------------------------------------------------------------------ */
  (function () {
    var left = $("#df-left"), right = $("#df-right");
    if (!left || !right || !window.TextDiff) return;

    var D = window.TextDiff;
    var view = "split";

    function options() {
      return {
        ignoreCase: $("#df-case") ? $("#df-case").checked : false,
        ignoreWhitespace: $("#df-ws") ? $("#df-ws").checked : false,
        ignorePunctuation: $("#df-punct") ? $("#df-punct").checked : false
      };
    }

    function renderWords(parts, want) {
      return parts.map(function (p) {
        if (p.type === "equal") return escapeHtml(p.value);
        if (p.type === "insert" && want === "right") return "<ins>" + escapeHtml(p.value) + "</ins>";
        if (p.type === "delete" && want === "left") return "<del>" + escapeHtml(p.value) + "</del>";
        return "";
      }).join("");
    }

    function rowHtml(row, side) {
      var cls = "d-" + row.type;
      var number = side === "left" ? row.leftNumber : row.rightNumber;
      var text = side === "left" ? row.left : row.right;

      if (text === null || text === undefined) {
        return '<tr class="d-empty"><td class="ln"></td><td class="tx"></td></tr>';
      }
      var body;
      if (row.type === "modify" && row.words) {
        body = renderWords(row.words, side);
      } else {
        body = escapeHtml(text);
      }
      return '<tr class="' + cls + '"><td class="ln">' + (number || "") +
        '</td><td class="tx">' + (body || "&nbsp;") + "</td></tr>";
    }

    function render() {
      var opts = options();
      var rows = D.diffLines(left.value, right.value, opts);
      var summary = D.summarize(rows);

      setText("#df-added", summary.added);
      setText("#df-removed", summary.removed);
      setText("#df-modified", summary.modified);
      setText("#df-similarity", summary.similarity + "%");

      var verdict = $("#df-verdict");
      if (verdict) {
        if (!left.value && !right.value) {
          verdict.textContent = "Paste text into both boxes to compare.";
          verdict.className = "note info";
        } else if (summary.identical) {
          verdict.textContent = "The two texts are identical.";
          verdict.className = "note ok";
        } else {
          verdict.textContent = summary.changed + " of " + summary.total +
            " lines differ (" + summary.similarity + "% similar).";
          verdict.className = "note";
        }
      }

      var outEl = $("#df-output");
      if (!outEl) return;

      if (view === "unified") {
        var text = D.toUnified(rows, { leftName: "Original", rightName: "Changed" });
        outEl.innerHTML = '<pre class="mono" style="overflow-x:auto;margin:0;font-size:.85rem;line-height:1.55">' +
          escapeHtml(text) + "</pre>";
      } else {
        var l = rows.map(function (r) { return rowHtml(r, "left"); }).join("");
        var r2 = rows.map(function (r) { return rowHtml(r, "right"); }).join("");
        outEl.innerHTML =
          '<div class="diff-split">' +
          '<div class="diff-pane"><div class="diff-head">Original</div>' +
          '<table class="diff-table"><tbody>' + l + "</tbody></table></div>" +
          '<div class="diff-pane"><div class="diff-head">Changed</div>' +
          '<table class="diff-table"><tbody>' + r2 + "</tbody></table></div>" +
          "</div>";
      }
    }

    var rerender = debounce(render, 200);

    [left, right].forEach(function (el) { el.addEventListener("input", rerender); });
    ["#df-case", "#df-ws", "#df-punct"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.addEventListener("change", render);
    });

    $$("[data-df-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        view = btn.getAttribute("data-df-view");
        $$("[data-df-view]").forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        render();
      });
    });

    $$("[data-df]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-df");
        if (action === "clear") {
          left.value = ""; right.value = ""; render(); left.focus();
        } else if (action === "swap") {
          var t = left.value; left.value = right.value; right.value = t; render();
        } else if (action === "copy-unified") {
          copy(D.toUnified(D.diffLines(left.value, right.value, options()),
            { leftName: "Original", rightName: "Changed" }), btn);
        }
      });
    });

    render();
  })();

  /* ------------------------------------------------------------------ *
   * Shared: current year in the footer
   * ------------------------------------------------------------------ */
  $$("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
