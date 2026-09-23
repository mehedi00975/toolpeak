module.exports = {
  slug: "what-is-a-percentage-increase",
  title: "How to Calculate Percentage Increase",

  description:
    "Percentage increase is the difference divided by the original number, times 100. Here is the formula, worked examples with salaries and prices, and the reversal trap that catches almost everyone.",

  keywords: "percentage increase, how to calculate percentage increase, percent change formula, percentage decrease, percentage difference",

  date: "2026-10-17",
  readingTime: 6,
  related: ["percentage-calculator", "unit-converter", "word-counter"],

  body: `
<p><strong>Subtract the old value from the new one, divide by the old value,
then multiply by 100.</strong></p>

<p>A salary going from $50,000 to $54,000: the difference is $4,000, divided by
50,000 is 0.08, times 100 is an <strong>8 percent increase</strong>.</p>

<p>The same formula handles decreases &mdash; the result simply comes out
negative. A price falling from &pound;80 to &pound;60: the difference is
&minus;20, divided by 80 is &minus;0.25, so a <strong>25 percent
decrease</strong>.</p>

<div class="note">
  <p><strong>Always divide by the original.</strong> This is the single most
  common mistake. The starting value is the baseline the change is measured
  against, and swapping it for the new value gives a different answer every
  time.</p>
</div>

<h2>Why an increase and a decrease of the same size do not cancel</h2>

<p>This is the trap. A stock rises 50 percent, then falls 50 percent. Most
people expect to be back where they started. You are not &mdash; you are down 25
percent.</p>

<ol class="steps">
  <li>Start with $100.</li>
  <li>Up 50 percent: $100 + $50 = $150.</li>
  <li>Down 50 percent: $150 &minus; $75 = $75.</li>
</ol>

<p>The reason is that the second percentage is calculated against a larger
number. Fifty percent of 150 is bigger than fifty percent of 100. Percentages
are always relative to whatever they are applied to, which is why
"up 20 percent then down 20 percent" always loses money, and why a 50 percent
loss needs a 100 percent gain to recover.</p>

<div class="table-scroll">
<table>
  <thead><tr><th>Loss</th><th>Gain needed to break even</th></tr></thead>
  <tbody>
    <tr><td>10%</td><td>11.1%</td></tr>
    <tr><td>20%</td><td>25%</td></tr>
    <tr><td>25%</td><td>33.3%</td></tr>
    <tr><td>50%</td><td>100%</td></tr>
    <tr><td>75%</td><td>300%</td></tr>
    <tr><td>90%</td><td>900%</td></tr>
  </tbody>
</table>
</div>

<h2>Working backwards from a discount</h2>

<p>A jacket is &pound;60 in a 25-percent-off sale. What was it before?</p>

<p>The wrong move is adding 25 percent to &pound;60, which gives &pound;75...
which happens to be right here, but only by coincidence of the numbers. The
reliable method is to divide by what remains:</p>

<p>&pound;60 &divide; 0.75 = <strong>&pound;80</strong>.</p>

<p>Try it with 40 percent off: a &pound;60 item was &pound;60 &divide; 0.6 =
&pound;100. Adding 40 percent to &pound;60 would have given &pound;84, which is
wrong by &pound;16.</p>

<h2>Percentage points are not percentages</h2>

<p>If an interest rate moves from 2 percent to 3 percent, that is a rise of one
<em>percentage point</em> &mdash; but a 50 percent increase in the rate itself.
Both statements are true and they describe the same event.</p>

<p>This distinction is routinely exploited in headlines. "Crime up 100 percent"
sounds alarming; if the count went from 2 incidents to 4, it is also technically
accurate. Whenever a percentage change sounds dramatic, the useful question is
what the underlying numbers were.</p>

<h2>Compounding: percentages applied repeatedly</h2>

<p>Percentage changes multiply rather than add. Three consecutive years of 10
percent growth is not 30 percent:</p>

<ul>
  <li>Year 1: 100 &rarr; 110</li>
  <li>Year 2: 110 &rarr; 121</li>
  <li>Year 3: 121 &rarr; 133.1</li>
</ul>

<p>The total is a 33.1 percent increase. The shortcut is to multiply the growth
factors: 1.1 &times; 1.1 &times; 1.1 = 1.331.</p>

<p>The same works for mixed changes. Up 20 percent then down 10 percent is
1.2 &times; 0.9 = 1.08, an overall 8 percent gain. Order does not matter to the
final figure, which surprises people but follows directly from multiplication
being commutative.</p>

<div class="note">
  <p><strong>The rule of 72:</strong> to estimate how long something takes to
  double at a given growth rate, divide 72 by the rate. At 6 percent a year,
  roughly 12 years. It is an approximation, but it is accurate to within a few
  percent for rates between 4 and 15.</p>
</div>
`,

  faqs: [
    {
      q: "How do I calculate percentage increase?",
      a: "<p>Subtract the original value from the new value, divide the result by the original value, then multiply by 100. From 40 to 50: the difference is 10, divided by 40 is 0.25, so a 25 percent increase.</p>"
    },
    {
      q: "Why doesn't a 50% increase followed by a 50% decrease return to the start?",
      a: "<p>Because the second percentage applies to a larger number. $100 up 50 percent is $150; 50 percent of $150 is $75, leaving you at $75. Percentages are always relative to the value they are applied to, so equal-sized moves in opposite directions never cancel.</p>"
    },
    {
      q: "What is the difference between percent and percentage points?",
      a: "<p>A move from 2 percent to 3 percent is one percentage point, but a 50 percent increase in the rate. Percentage points measure the absolute gap between two percentages; percent measures the relative change between them.</p>"
    },
    {
      q: "How do I find the original price before a discount?",
      a: "<p>Divide the sale price by one minus the discount as a decimal. A $75 item after 25 percent off was $75 &divide; 0.75 = $100. Adding the percentage back onto the sale price gives the wrong answer except by coincidence.</p>"
    }
  ]
};
