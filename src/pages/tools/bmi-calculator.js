module.exports = {
  slug: "bmi-calculator",
  title: "BMI Calculator — Healthy Weight Range",
  h1: "BMI Calculator",
  description:
    "Free BMI calculator in metric (kg, cm) and imperial (lb, ft, in). See your body mass index, WHO category and the healthy weight range for your height.",
  keywords: "bmi calculator, body mass index, healthy weight range, bmi chart, bmi kg cm, bmi calculator men women",

  tool: `
<div class="card" id="bmi-tool">
  <div class="checks" role="radiogroup" aria-label="Unit system">
    <label><input type="radio" name="bmi-unit" value="metric" checked> Metric (kg, cm)</label>
    <label><input type="radio" name="bmi-unit" value="imperial"> Imperial (lb, ft, in)</label>
  </div>

  <div id="bmi-metric">
    <div class="fields">
      <div>
        <label class="lbl" for="bmi-kg">Weight (kg)</label>
        <input type="number" id="bmi-kg" value="70" step="any" min="1" max="700" inputmode="decimal">
      </div>
      <div>
        <label class="lbl" for="bmi-cm">Height (cm)</label>
        <input type="number" id="bmi-cm" value="175" step="any" min="50" max="272" inputmode="decimal">
      </div>
    </div>
  </div>

  <div id="bmi-imperial" hidden>
    <div class="fields">
      <div>
        <label class="lbl" for="bmi-lb">Weight (lb)</label>
        <input type="number" id="bmi-lb" value="154" step="any" min="1" inputmode="decimal">
      </div>
      <div>
        <label class="lbl" for="bmi-ft">Height (ft)</label>
        <input type="number" id="bmi-ft" value="5" step="1" min="1" max="8" inputmode="numeric">
      </div>
      <div>
        <label class="lbl" for="bmi-in">Height (in)</label>
        <input type="number" id="bmi-in" value="9" step="any" min="0" max="11.9" inputmode="decimal">
      </div>
    </div>
  </div>

  <div class="result-box">
    <span class="lbl" style="margin:0">Your BMI</span>
    <span class="out out-lg" id="bmi-value">&mdash;</span>
    <p style="margin:.4rem 0 0"><span class="badge" id="bmi-category">Enter height and weight</span></p>
    <div class="meter"><i id="bmi-bar" style="width:0"></i></div>
    <p class="hint" id="bmi-advice" style="margin-bottom:0"></p>
  </div>

  <div class="statgrid">
    <div class="stat"><b id="bmi-range">&mdash;</b><span>Healthy range for your height</span></div>
    <div class="stat"><b id="bmi-asian">&mdash;</b><span>Asian-Pacific category</span></div>
    <div class="stat"><b id="bmi-prime">&mdash;</b><span>BMI prime</span></div>
  </div>

  <p class="note">BMI is a population screening tool, not a diagnosis. It cannot tell muscle from fat, and it says nothing about where body fat sits. Talk to a clinician before acting on any number here.</p>
</div>`,

  intro: `
<p class="lede">Enter your height and weight in metric or imperial units to get your body mass index, the World Health Organization category it falls into, and the weight range considered healthy for your height.</p>`,

  content: `
<h2>How to use the BMI calculator</h2>
<ol class="steps">
  <li><strong>Pick your units.</strong> Metric takes kilograms and centimeters; imperial takes pounds plus feet and inches.</li>
  <li><strong>Enter height and weight.</strong> The result updates as you type — there is no submit button.</li>
  <li><strong>Read the category and the range.</strong> The healthy weight range is calculated for your specific height, which is far more actionable than the BMI number on its own.</li>
</ol>

<h2>The formula</h2>
<p>Metric: <code>BMI = weight in kg &divide; (height in meters)&sup2;</code>. Someone who is 70 kg and 1.75 m has a BMI of 70 &divide; (1.75 &times; 1.75) = <strong>22.9</strong>.</p>
<p>Imperial: <code>BMI = 703 &times; weight in lb &divide; (height in inches)&sup2;</code>. Someone who is 154 lb and 69 inches (5 ft 9 in) has a BMI of 703 &times; 154 &divide; (69 &times; 69) = <strong>22.7</strong>. The tiny gap between the two examples is rounding, not a different formula.</p>

<h2>WHO categories for adults</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>BMI</th><th>Category</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td class="num">Below 18.5</td><td>Underweight</td><td>May indicate undernutrition or an underlying condition</td></tr>
    <tr><td class="num">18.5 &ndash; 24.9</td><td>Healthy weight</td><td>Lowest average risk in large population studies</td></tr>
    <tr><td class="num">25.0 &ndash; 29.9</td><td>Overweight</td><td>Increased risk of type 2 diabetes and hypertension</td></tr>
    <tr><td class="num">30.0 &ndash; 34.9</td><td>Obesity class I</td><td>Clinical intervention usually recommended</td></tr>
    <tr><td class="num">35.0 &ndash; 39.9</td><td>Obesity class II</td><td>Substantially increased risk</td></tr>
    <tr><td class="num">40.0 and above</td><td>Obesity class III</td><td>Severely increased risk</td></tr>
  </tbody>
</table>
</div>

<h2>What BMI gets wrong</h2>
<p>BMI was devised in the 1830s by Adolphe Quetelet as a way to describe populations, not individuals. It compares mass to height squared and knows nothing else about you. That creates several well-documented blind spots.</p>
<p><strong>It cannot distinguish muscle from fat.</strong> A rugby player and a sedentary adult of the same height and weight get an identical BMI, despite completely different body composition. Athletes are routinely classified as overweight or obese by BMI alone.</p>
<p><strong>It ignores fat distribution.</strong> Visceral fat around the abdomen carries far more metabolic risk than fat on the hips and thighs, yet BMI treats them the same. Waist circumference and waist-to-height ratio capture that difference; a waist measurement under half your height is a useful rule of thumb.</p>
<p><strong>It shifts with age and ethnicity.</strong> Older adults lose muscle and gain fat at a stable BMI. Risk also rises at lower thresholds for people of South Asian, Chinese and other Asian backgrounds, which is why the calculator shows the Asian-Pacific category alongside the WHO one: those cut-offs treat 23 as the top of the healthy range and 27.5 as the high-risk threshold.</p>
<p><strong>It does not apply to everyone.</strong> BMI is not valid for children and teenagers, who need age-and-sex percentile charts, nor for pregnant women, nor for people with significant muscle wasting or limb loss.</p>

<h2>Better questions than "what is my BMI"</h2>
<p>If your BMI is near a boundary, the number itself is rarely the useful part. More informative measures include waist circumference, blood pressure, resting heart rate, fasting glucose and lipid panel, and simple functional markers such as how you handle two flights of stairs. Weight trend over months matters more than a single reading, since day-to-day fluctuation of 1&ndash;2 kg from hydration and food volume is completely normal.</p>

<h2>Reading the healthy weight range</h2>
<p>The range shown is the weight span that would place you between BMI 18.5 and 24.9 at your current height. It is deliberately wide — for a 175 cm adult it spans roughly 57 to 76 kg — because there is no single correct weight for a given height. Where you sit inside that band depends on build, muscle mass and history.</p>`,

  faqs: [
    {
      q: "What is a healthy BMI?",
      a: "<p>For most adults the World Health Organization defines 18.5 to 24.9 as the healthy range. For people of Asian descent many clinicians use a lower band of 18.5 to 23, because cardiometabolic risk rises at a lower BMI in those populations. The calculator shows both classifications.</p>"
    },
    {
      q: "Is BMI accurate for athletes and muscular people?",
      a: "<p>No. BMI cannot tell muscle from fat, so a muscular person is often classified as overweight or even obese despite low body fat. If you train seriously with weights, use body fat percentage, waist measurement or a DEXA scan instead of relying on BMI.</p>"
    },
    {
      q: "Does BMI work for children?",
      a: "<p>Not with these adult categories. Children and teenagers are assessed with age-and-sex-specific percentile charts, because healthy body composition changes throughout growth. A pediatrician or a CDC growth chart is the right reference for anyone under 20.</p>"
    },
    {
      q: "How much weight do I need to lose to reach a healthy BMI?",
      a: "<p>The calculator shows the healthy weight range for your exact height and states the difference between your current weight and the nearest edge of that range. A sustainable rate is roughly 0.5 to 1 kg (1 to 2 lb) per week; faster loss tends to cost muscle as well as fat.</p>"
    }
  ],

  related: ["unit-converter", "percentage-calculator", "age-calculator"]
};
