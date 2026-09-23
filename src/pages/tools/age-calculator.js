module.exports = {
  slug: "age-calculator",
  title: "Age Calculator — Years, Months & Days",
  h1: "Age Calculator",
  description:
    "Free age calculator. Enter a date of birth to get exact age in years, months and days, plus total weeks, hours, the day you were born and your next birthday countdown.",
  keywords: "age calculator, how old am i, date of birth calculator, age in days, birthday countdown, chronological age calculator",

  tool: `
<div class="card">
  <div class="fields">
    <div>
      <label class="lbl" for="age-dob">Date of birth</label>
      <input type="date" id="age-dob" value="1995-06-15">
    </div>
    <div>
      <label class="lbl" for="age-on">Age at date</label>
      <input type="date" id="age-on">
      <p class="hint">Defaults to today. Change it to find an age on any date.</p>
    </div>
  </div>

  <div class="result-box">
    <span class="lbl" style="margin:0">Exact age</span>
    <span class="out out-lg">
      <span id="age-y">&mdash;</span> years,
      <span id="age-m">&mdash;</span> months,
      <span id="age-d">&mdash;</span> days
    </span>
    <p class="hint" id="age-msg" style="margin-bottom:0"></p>
  </div>

  <div class="statgrid">
    <div class="stat"><b id="age-months">&mdash;</b><span>Total months</span></div>
    <div class="stat"><b id="age-weeks">&mdash;</b><span>Total weeks</span></div>
    <div class="stat"><b id="age-days">&mdash;</b><span>Total days</span></div>
    <div class="stat"><b id="age-hours">&mdash;</b><span>Total hours</span></div>
    <div class="stat"><b id="age-minutes">&mdash;</b><span>Total minutes</span></div>
    <div class="stat"><b id="age-dow">&mdash;</b><span>Born on a</span></div>
  </div>

  <div class="statgrid">
    <div class="stat hero"><b id="age-next">&mdash;</b><span>Until next birthday</span></div>
    <div class="stat"><b id="age-next-date">&mdash;</b><span>Next birthday date</span></div>
    <div class="stat"><b id="age-turning">&mdash;</b><span>Turning</span></div>
  </div>
</div>`,

  intro: `
<p class="lede">Enter a date of birth and get the exact age in years, months and days — plus total weeks, hours and minutes lived, the weekday you were born on, and a countdown to the next birthday.</p>`,

  content: `
<h2>How to use the age calculator</h2>
<ol class="steps">
  <li><strong>Enter the date of birth.</strong> Use the date picker or type it directly.</li>
  <li><strong>Leave the second date as today</strong> for a current age, or change it to work out an age on a specific date — a school cut-off, a visa deadline, or a date in the past.</li>
  <li><strong>Read the exact age.</strong> Years, months and days appear together, the way official forms ask for them.</li>
  <li><strong>Scroll for the totals</strong> if you need age in weeks, days, hours or minutes.</li>
</ol>

<h2>How exact age is actually calculated</h2>
<p>Age is not simply days divided by 365. The correct method — the one used by passports, insurers, schools and this calculator — counts whole calendar years first, then whole months, then leftover days.</p>
<p>Take a birth date of 15 June 1995 with a reference date of 7 September 2026. Subtract the years: 2026 minus 1995 is 31. Compare months: September (9) is after June (6), so no adjustment. Compare days: 7 is before 15, so borrow a month, which leaves 2 months and 23 days. The exact age is <strong>31 years, 2 months, 23 days</strong>.</p>
<p>Because months have 28 to 31 days, "borrowing" uses the real length of the preceding month rather than an average. That is why a naive calculation with 30-day months can be off by a day or two.</p>

<h2>Leap years and February 29 birthdays</h2>
<p>Roughly 1 in 1,461 people is born on 29 February. In common years there is no such date, so a decision has to be made about when the birthday falls. This calculator rolls the birthday forward to 1 March in non-leap years, which is the convention used in the United States and most of Europe for legal age. Some jurisdictions — including parts of Asia and New Zealand — treat 28 February as the birthday instead. The difference matters for exactly one day every four years, but if you are calculating a legal threshold, check your local rule.</p>
<p>The leap-year rule itself catches people out: a year is a leap year if it is divisible by 4, except centuries, unless the century is divisible by 400. So 1900 was not a leap year, but 2000 was.</p>

<h2>Where an exact age is required</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Situation</th><th>What is usually needed</th></tr></thead>
  <tbody>
    <tr><td>Passport and visa forms</td><td>Age in completed years on the date of application</td></tr>
    <tr><td>School enrollment</td><td>Age on a fixed cut-off date, often 31 August or 1 September</td></tr>
    <tr><td>Pediatric medicine</td><td>Age in months up to 3 years; dosing depends on it</td></tr>
    <tr><td>Insurance underwriting</td><td>Age at next birthday, which can be a year higher than current age</td></tr>
    <tr><td>Retirement and pensions</td><td>Exact date a threshold age is reached, not the year</td></tr>
    <tr><td>Sports eligibility</td><td>Age on a season cut-off date, commonly 1 January</td></tr>
  </tbody>
</table>
</div>

<h2>Age in days, weeks and hours</h2>
<p>The totals below the main result are straight elapsed counts, so they are useful for milestone spotting. A 10,000-day milestone arrives at about 27 years and 4 months. The 1 billion second mark — a genuinely good excuse for a party — lands at roughly 31 years and 8 months. Hours and minutes are computed from whole days, so they do not depend on the time of day you were born.</p>

<h2>Everything stays on your device</h2>
<p>A date of birth is personal data. This page does the arithmetic in your browser using the standard JavaScript date functions already built into it. No date is transmitted, logged or stored, and the tool keeps working with the network switched off.</p>`,

  faqs: [
    {
      q: "How do I calculate my exact age in years, months and days?",
      a: "<p>Subtract the birth year from the current year, then adjust for the month and day. If the current day is earlier in the month than your birth day, borrow days from the previous month and reduce the month count by one; if the resulting month count is negative, borrow a year. The calculator above does all of this automatically.</p>"
    },
    {
      q: "How does the calculator handle a 29 February birthday?",
      a: "<p>In leap years the birthday falls on 29 February as normal. In common years it rolls forward to 1 March, which is the usual convention in the US and most of Europe. A few jurisdictions treat 28 February as the birthday, so check the local rule if you are working out a legal threshold.</p>"
    },
    {
      q: "Can I find my age on a date in the past or future?",
      a: "<p>Yes. Change the \"Age at date\" field to any date on or after the date of birth. This is how you check a school cut-off, an eligibility date or how old somebody was at a particular event.</p>"
    },
    {
      q: "Why does my age in days not match my age in years times 365?",
      a: "<p>Because leap years add an extra day roughly every four years. Over 40 years that is about 10 extra days. The day total shown here is the true elapsed count between the two dates, so it is always more accurate than multiplying by 365.</p>"
    }
  ],

  related: ["percentage-calculator", "bmi-calculator", "unit-converter"]
};
