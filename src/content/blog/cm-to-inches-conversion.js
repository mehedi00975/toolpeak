module.exports = {
  slug: "cm-to-inches-conversion",
  title: "cm to Inches: Chart and Quick Method",

  description:
    "One centimeter is 0.3937 inches, and one inch is exactly 2.54 cm. Here is the conversion chart, a mental shortcut accurate to within a percent, and the common heights in both units.",

  keywords: "cm to inches, centimeters to inches, cm to inch conversion chart, how many inches in a cm, height conversion",

  date: "2026-09-26",
  readingTime: 5,
  related: ["unit-converter", "percentage-calculator", "bmi-calculator"],

  body: `
<p><strong>Divide centimeters by 2.54 to get inches.</strong> So 30 cm is
30 &divide; 2.54 = 11.81 inches. Going the other way, multiply inches by 2.54:
a 12-inch ruler is 30.48 cm.</p>

<p>That 2.54 is not an approximation. Since the international yard and pound
agreement of 1959, one inch is <em>defined</em> as exactly 25.4 millimeters.
Every inch measurement in the US, the UK, Canada and Australia traces back to
the metric system by definition.</p>

<h2>The mental shortcut</h2>

<p>Dividing by 2.54 in your head is awkward. This is much easier and lands
within about one percent:</p>

<div class="note">
  <p><strong>Halve it, then take off 20 percent.</strong> For 50 cm: half is 25,
  minus 20 percent (5) gives 20 inches. The exact answer is 19.69 inches.</p>
</div>

<p>It works because dividing by 2.54 is close to multiplying by 0.4, and 0.4 is
"half, minus a fifth". For a rough check on a tape measure, it is plenty.</p>

<p>Going from inches to centimeters, the mirror trick is <strong>double it and
add a quarter</strong>: 8 inches becomes 16 plus 4, so about 20 cm. The exact
value is 20.32 cm.</p>

<h2>Conversion chart</h2>

<div class="table-scroll">
<table>
  <thead><tr><th>Centimeters</th><th>Inches</th><th>Rounded</th></tr></thead>
  <tbody>
    <tr><td>1 cm</td><td>0.3937 in</td><td>about &#8532; in</td></tr>
    <tr><td>5 cm</td><td>1.9685 in</td><td>just under 2 in</td></tr>
    <tr><td>10 cm</td><td>3.9370 in</td><td>just under 4 in</td></tr>
    <tr><td>15 cm</td><td>5.9055 in</td><td>about 5&#8532; in</td></tr>
    <tr><td>20 cm</td><td>7.8740 in</td><td>about 7&#8542; in</td></tr>
    <tr><td>25 cm</td><td>9.8425 in</td><td>about 9&#8542; in</td></tr>
    <tr><td>30 cm</td><td>11.811 in</td><td>about 11&#8542; in</td></tr>
    <tr><td>50 cm</td><td>19.685 in</td><td>about 19&#8540; in</td></tr>
    <tr><td>100 cm</td><td>39.370 in</td><td>about 39&#8540; in</td></tr>
  </tbody>
</table>
</div>

<h2>Heights, which is what most people are converting</h2>

<div class="table-scroll">
<table>
  <thead><tr><th>Centimeters</th><th>Feet and inches</th></tr></thead>
  <tbody>
    <tr><td>150 cm</td><td>4 ft 11 in</td></tr>
    <tr><td>155 cm</td><td>5 ft 1 in</td></tr>
    <tr><td>160 cm</td><td>5 ft 3 in</td></tr>
    <tr><td>165 cm</td><td>5 ft 5 in</td></tr>
    <tr><td>170 cm</td><td>5 ft 7 in</td></tr>
    <tr><td>175 cm</td><td>5 ft 9 in</td></tr>
    <tr><td>180 cm</td><td>5 ft 11 in</td></tr>
    <tr><td>185 cm</td><td>6 ft 1 in</td></tr>
    <tr><td>190 cm</td><td>6 ft 3 in</td></tr>
  </tbody>
</table>
</div>

<p>To do a height by hand: divide the centimeters by 2.54 for total inches,
then divide by 12 for feet and keep the remainder. For 178 cm:
178 &divide; 2.54 = 70.08 inches; 70 &divide; 12 = 5 feet with 10 inches left
over. So 5 ft 10 in.</p>

<h2>Where rounding bites</h2>

<p>For a person's height, rounding to the nearest inch is fine. For anything
manufactured, it is not.</p>

<p>A common trap is treating 25 cm and 10 inches as the same. They are 4 mm
apart. Over the length of a bookshelf that is invisible; across ten joints in a
cabinet it accumulates to nearly 4 cm, and the last piece will not fit.</p>

<p>The other trap is the "about 2.5" habit. Using 2.5 instead of 2.54 introduces
a 1.6 percent error. On a 5-meter room that is 8 centimeters, which is the
difference between a rug fitting and not.</p>

<div class="note">
  <p><strong>Rule of thumb:</strong> if the measurement will be cut, drilled or
  ordered, use the full 2.54. If you just want to picture the size, the mental
  shortcut is fine.</p>
</div>
`,

  faqs: [
    {
      q: "How many inches is 1 cm?",
      a: "<p>0.3937 inches, or just under two fifths of an inch. The reverse is exact: one inch is precisely 2.54 cm by international definition, not by measurement.</p>"
    },
    {
      q: "How do I convert cm to inches in my head?",
      a: "<p>Halve the number, then subtract 20 percent. For 40 cm: half is 20, minus 4 gives 16 inches. The exact answer is 15.75, so the estimate is within two percent &mdash; good enough for judging whether something will fit.</p>"
    },
    {
      q: "Is 2.5 cm the same as 1 inch?",
      a: "<p>Close but not equal. An inch is 2.54 cm, so using 2.5 makes everything about 1.6 percent short. Over a couple of centimeters it does not matter; over several meters, or across repeated cuts, it does.</p>"
    },
    {
      q: "What is 170 cm in feet and inches?",
      a: "<p>5 feet 7 inches. Divide 170 by 2.54 to get 66.93 inches, then divide by 12: five feet with about seven inches remaining.</p>"
    }
  ]
};
