module.exports = {
  slug: "percentage-calculator",
  title: "Percentage Calculator",
  h1: "Percentage Calculator",
  description:
    "Free percentage calculator. Work out X% of Y, what percent A is of B, percentage increase or decrease, plus discounts, tips and sales tax. Instant results.",
  keywords: "percentage calculator, what is 20 percent of 150, percentage change calculator, percent increase, discount calculator, tip calculator",

  tool: `
<div class="card">
  <h2 style="margin-top:0">1. What is X% of Y?</h2>
  <div class="fields">
    <div>
      <label class="lbl" for="pc-of-a">Percentage (%)</label>
      <input type="number" id="pc-of-a" value="20" step="any" inputmode="decimal">
    </div>
    <div>
      <label class="lbl" for="pc-of-b">of this number</label>
      <input type="number" id="pc-of-b" value="150" step="any" inputmode="decimal">
    </div>
  </div>
  <div class="result-box">
    <span class="lbl" style="margin:0">Result</span>
    <span class="out" id="pc-of-out">30</span>
  </div>
</div>

<div class="card">
  <h2 style="margin-top:0">2. A is what percent of B?</h2>
  <div class="fields">
    <div>
      <label class="lbl" for="pc-what-a">This number</label>
      <input type="number" id="pc-what-a" value="30" step="any" inputmode="decimal">
    </div>
    <div>
      <label class="lbl" for="pc-what-b">is what percent of</label>
      <input type="number" id="pc-what-b" value="150" step="any" inputmode="decimal">
    </div>
  </div>
  <div class="result-box">
    <span class="lbl" style="margin:0">Result</span>
    <span class="out" id="pc-what-out">20%</span>
  </div>
</div>

<div class="card">
  <h2 style="margin-top:0">3. Percentage increase or decrease</h2>
  <div class="fields">
    <div>
      <label class="lbl" for="pc-ch-a">From (original)</label>
      <input type="number" id="pc-ch-a" value="150" step="any" inputmode="decimal">
    </div>
    <div>
      <label class="lbl" for="pc-ch-b">To (new)</label>
      <input type="number" id="pc-ch-b" value="180" step="any" inputmode="decimal">
    </div>
  </div>
  <div class="result-box">
    <span class="lbl" style="margin:0">Change</span>
    <span class="out" id="pc-ch-out">+20% increase</span>
  </div>
</div>

<div class="card">
  <h2 style="margin-top:0">4. Discount, tip or sales tax</h2>
  <div class="fields">
    <div>
      <label class="lbl" for="pc-adj-base">Amount</label>
      <input type="number" id="pc-adj-base" value="80" step="any" inputmode="decimal">
    </div>
    <div>
      <label class="lbl" for="pc-adj-pct">Percentage (%)</label>
      <input type="number" id="pc-adj-pct" value="25" step="any" inputmode="decimal">
    </div>
    <div>
      <label class="lbl" for="pc-adj-dir">Direction</label>
      <select id="pc-adj-dir">
        <option value="decrease">Subtract (discount)</option>
        <option value="increase">Add (tip / tax / markup)</option>
      </select>
    </div>
  </div>
  <div class="result-box">
    <span class="lbl" style="margin:0">Final amount</span>
    <span class="out" id="pc-adj-out">60</span>
    <p class="hint" id="pc-adj-detail" style="margin-bottom:0"></p>
  </div>
</div>`,

  intro: `
<p class="lede">Four percentage calculators on one page: a percentage of a number, one number as a percentage of another, the change between two values, and a discount or tip. Every field updates as you type.</p>`,

  content: `
<h2>How to use each calculator</h2>
<ol class="steps">
  <li><strong>"What is X% of Y"</strong> — for tips, commissions, tax and sale prices. Enter 20 and 150 to get 30.</li>
  <li><strong>"A is what percent of B"</strong> — for test scores and shares of a total. Enter 30 and 150 to get 20%.</li>
  <li><strong>Percentage change</strong> — for growth and price movements. From 150 to 180 is a 20% increase; from 180 to 150 is a 16.67% decrease.</li>
  <li><strong>Discount or tip</strong> — enter the amount and the rate, then pick whether to add or subtract. $80 with 25% off gives $60.</li>
</ol>

<h2>The three formulas, written out</h2>
<p>Each calculator above is one line of arithmetic. Knowing them means you can sanity-check any answer, including one from a calculator you do not control.</p>
<ul>
  <li><strong>Percentage of a number:</strong> <code>(percent &divide; 100) &times; number</code>. So 20% of 150 = 0.20 &times; 150 = 30.</li>
  <li><strong>One number as a percentage of another:</strong> <code>(part &divide; whole) &times; 100</code>. So 30 out of 150 = (30 &divide; 150) &times; 100 = 20%.</li>
  <li><strong>Percentage change:</strong> <code>((new &minus; old) &divide; old) &times; 100</code>. So 150 to 180 = ((180 &minus; 150) &divide; 150) &times; 100 = +20%.</li>
</ul>

<h2>The mistake almost everyone makes</h2>
<p>Percentage increases and decreases are not symmetrical, and this trips up more people than any other percentage question. If a $100 jacket rises 20% to $120, then falls 20%, it does not return to $100 — it lands at $96. The reason is that the increase was 20% <em>of 100</em> while the decrease was 20% <em>of 120</em>. The base changed.</p>
<p>The same asymmetry explains why a stock that drops 50% needs to gain 100% just to break even. A useful habit: whenever you see a percentage, ask "percent of what?" before you do anything else.</p>

<h2>Percentage points versus percent</h2>
<p>If an interest rate moves from 4% to 6%, that is a rise of <strong>2 percentage points</strong>, but a <strong>50% increase</strong>. Both statements are true and they describe the same event. News headlines routinely mix these up, and the difference matters enormously for mortgages, credit cards and poll results. When you want to describe the absolute gap between two percentages, say "percentage points". When you want the relative change, use the percentage change calculator above.</p>

<h2>Everyday examples worth knowing by heart</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Situation</th><th>Shortcut</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td>10% of anything</td><td>Move the decimal one place left</td><td>10% of $46.50 = $4.65</td></tr>
    <tr><td>20% tip (US restaurant)</td><td>Take 10%, then double it</td><td>$46.50 &rarr; $4.65 &rarr; $9.30</td></tr>
    <tr><td>15% tip</td><td>10% plus half of that 10%</td><td>$46.50 &rarr; $4.65 + $2.33 = $6.98</td></tr>
    <tr><td>25% off</td><td>Divide by 4, subtract</td><td>£80 &minus; £20 = £60</td></tr>
    <tr><td>Price plus 8% sales tax</td><td>Multiply by 1.08</td><td>$25 &times; 1.08 = $27</td></tr>
    <tr><td>Reversing a 20% discount</td><td>Divide the sale price by 0.8</td><td>$60 &divide; 0.8 = $75 original</td></tr>
  </tbody>
</table>
</div>

<h2>Working backwards from a final price</h2>
<p>A frequent real-world question is the reverse of a discount: you paid $60 after 20% off, so what was the sticker price? Do not add 20% to $60 — that gives $72, which is wrong. Because $60 represents 80% of the original, divide by 0.8 to get $75. The same logic strips sales tax from a receipt total: if the total includes 8% tax, divide by 1.08 to recover the pre-tax amount.</p>`,

  faqs: [
    {
      q: "What is 20 percent of 150?",
      a: "<p>30. Multiply 150 by 0.20, or take 10% of 150 (which is 15) and double it. The first calculator on this page does it as you type, and works with decimals such as 7.5% too.</p>"
    },
    {
      q: "How do I calculate percentage increase between two numbers?",
      a: "<p>Subtract the old value from the new value, divide by the old value, then multiply by 100. Going from 150 to 180: (180 &minus; 150) &divide; 150 &times; 100 = 20% increase. A negative result means a decrease.</p>"
    },
    {
      q: "Why does a 20% rise followed by a 20% fall not return to the start?",
      a: "<p>Because the second percentage is taken from a larger base. $100 plus 20% is $120; 20% of $120 is $24, so you land at $96, not $100. To reverse a 20% increase exactly, divide by 1.2 instead of subtracting 20%.</p>"
    },
    {
      q: "What is the difference between percent and percentage points?",
      a: "<p>Percentage points measure the absolute gap between two percentages; percent measures the relative change. A move from 4% to 6% is 2 percentage points and simultaneously a 50% increase. Financial and polling reports depend on the distinction, so it is worth stating which one you mean.</p>"
    }
  ],

  related: ["unit-converter", "bmi-calculator", "age-calculator"]
};
