module.exports = {
  slug: "how-to-calculate-bmi",
  title: "How to Calculate BMI by Hand",

  description:
    "BMI is weight in kilograms divided by height in meters squared. Here is the formula in both metric and imperial, worked examples, and what the number does not tell you.",

  keywords: "how to calculate bmi, bmi formula, bmi calculation, body mass index formula, bmi metric imperial",

  date: "2026-09-12",
  readingTime: 6,
  related: ["bmi-calculator", "unit-converter", "percentage-calculator"],

  body: `
<p><strong>BMI is your weight in kilograms divided by your height in meters,
squared.</strong> A person weighing 70 kg at 1.75 m has a BMI of
70 &divide; (1.75 &times; 1.75) = 22.9.</p>

<p>In pounds and inches the formula needs a conversion factor of 703:
weight in pounds &times; 703 &divide; (height in inches)&sup2;. Someone
weighing 154 lb at 5 ft 9 in (69 inches) works out at
154 &times; 703 &divide; 4761 = 22.7.</p>

<div class="note">
  <p><strong>Why 703?</strong> It converts pounds per square inch into
  kilograms per square meter. One pound is 0.4536 kg and one inch is
  0.0254 m, so the factor is 0.4536 &divide; 0.0254&sup2; = 703.07. Rounding
  it to 703 changes the result by less than 0.01.</p>
</div>

<h2>Working it out step by step</h2>

<p>Metric, for a person of 82 kg and 1.68 m:</p>
<ol class="steps">
  <li>Square the height: 1.68 &times; 1.68 = 2.8224.</li>
  <li>Divide the weight by that: 82 &divide; 2.8224 = 29.05.</li>
  <li>BMI is 29.1, which falls in the overweight band.</li>
</ol>

<p>Imperial, for a person of 180 lb and 5 ft 4 in:</p>
<ol class="steps">
  <li>Convert the height to inches: (5 &times; 12) + 4 = 64 inches.</li>
  <li>Square it: 64 &times; 64 = 4096.</li>
  <li>Multiply weight by 703: 180 &times; 703 = 126,540.</li>
  <li>Divide: 126,540 &divide; 4096 = 30.9.</li>
</ol>

<h2>What the categories mean</h2>

<p>The World Health Organization uses the same cut-offs worldwide for adults:</p>

<div class="table-scroll">
<table>
  <thead><tr><th>BMI</th><th>Category</th><th>Example at 5 ft 9 in / 175 cm</th></tr></thead>
  <tbody>
    <tr><td>Below 18.5</td><td>Underweight</td><td>Under 125 lb / 56.7 kg</td></tr>
    <tr><td>18.5 &ndash; 24.9</td><td>Healthy weight</td><td>125&ndash;168 lb / 56.7&ndash;76.3 kg</td></tr>
    <tr><td>25.0 &ndash; 29.9</td><td>Overweight</td><td>169&ndash;202 lb / 76.6&ndash;91.6 kg</td></tr>
    <tr><td>30.0 &ndash; 34.9</td><td>Obesity class I</td><td>203&ndash;236 lb / 92.1&ndash;107 kg</td></tr>
    <tr><td>35.0 &ndash; 39.9</td><td>Obesity class II</td><td>237&ndash;270 lb / 107.5&ndash;122.5 kg</td></tr>
    <tr><td>40.0 and above</td><td>Obesity class III</td><td>Over 270 lb / 122.5 kg</td></tr>
  </tbody>
</table>
</div>

<h2>The part most BMI pages leave out</h2>

<p>BMI was devised in the 1830s by Adolphe Quetelet, a Belgian statistician who
was describing populations, not diagnosing individuals. He said so himself. The
measure became a clinical shorthand in the 1970s because it is cheap: two
numbers anyone can obtain with a scale and a tape measure.</p>

<p>That cheapness is also its limit. BMI cannot distinguish muscle from fat. A
rugby player and a sedentary person of the same height and weight get the same
score. It says nothing about where fat sits, and abdominal fat carries more
metabolic risk than the same mass on the hips. It reads differently across
ethnic groups: several health bodies use a lower overweight threshold of 23 for
people of South Asian descent, because cardiometabolic risk appears at a lower
BMI.</p>

<p>It is also unreliable for anyone still growing, for pregnant women, and for
adults over about 65, where a slightly higher BMI is associated with better
outcomes.</p>

<h2>A more useful number to pair it with</h2>

<p>Waist circumference takes ten seconds and captures what BMI misses. Measure
around the narrowest part of your torso, usually just above the navel, without
pulling the tape tight. Elevated risk starts at roughly 40 inches (102 cm) for
men and 35 inches (88 cm) for women.</p>

<p>Waist-to-height ratio is simpler still: keep your waist under half your
height. At 5 ft 9 in that means a waist below 34.5 inches. It needs no lookup
table, works across most adult populations, and tracks health outcomes at least
as well as BMI.</p>
`,

  faqs: [
    {
      q: "What is the BMI formula?",
      a: "<p>Metric: weight in kilograms divided by height in meters squared. Imperial: weight in pounds times 703, divided by height in inches squared. Both give the same number &mdash; 70 kg at 1.75 m and 154 lb at 5 ft 9 in are the same person, and both come out around 22.8.</p>"
    },
    {
      q: "What is a healthy BMI?",
      a: "<p>For most adults, 18.5 to 24.9. Below 18.5 is classed as underweight and 25 or above as overweight. Some health bodies use 23 as the overweight threshold for people of South Asian descent, because risk rises at a lower BMI in that population.</p>"
    },
    {
      q: "Is BMI accurate for muscular people?",
      a: "<p>No. BMI uses only height and weight, so it cannot tell muscle from fat. A well-trained athlete can register as overweight or obese while carrying very little body fat. If you lift seriously, waist measurement or a body composition test will tell you more.</p>"
    },
    {
      q: "Does BMI work for children?",
      a: "<p>Not with the adult categories. Children are assessed against age and sex percentile charts, because healthy body composition changes throughout growth. A child's raw BMI number is meaningful only when plotted on those charts, which is a job for a pediatrician.</p>"
    }
  ]
};
