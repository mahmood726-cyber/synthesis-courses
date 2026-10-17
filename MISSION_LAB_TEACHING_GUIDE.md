# Synthesis Mission Lab — Facilitator & Teaching Guide

**Status:** Companion resource for the 25-module *Evidence Reversal* flagship course. Exercises are **English-language v1** and are educational simulations, **not** clinical decision-support or evidence that a real publication is erroneous.

## New real-data practical after every module

The flagship course now embeds an extra, short real-dataset exercise slide immediately following each module's objectives. Students interact with original Hine (six myocardial-infarction lidocaine trials) and Berkey (five periodontal trials with two dependent outcomes) examples. This complements, **rather than silently converting**, the Mission Lab's fictional process/decision scenarios.

For a 15-minute real-data workshop, ask learners to (1) identify the actual numerator, denominator and estimand, (2) predict the expected direction, (3) calculate the pooled result/try one sensitivity analysis, (4) reproduce the result using the source R snippet, then (5) list one limitation not resolved by the published table.

Data lineage, exact R reference outputs, conditional method equivalence and translation status are in [REAL_DATA_PROVENANCE.md](REAL_DATA_PROVENANCE.md). The newly authored practice prompts are translated across the 12 course languages, **but specialist/native-speaker sign-off is still outstanding**. Do not use practice scores as accreditation.

## Novice starting route — six evidence decisions (untimed, roughly 10–15 minutes)

Before presenting twenty-five missions, new learners can complete the source-linked [Guided Start](guided-start.html). The challenge follows genuine Hine, Berkey and magnesium trial records in a secular narrative: what can the trial counts establish, how do you calculate a risk difference, what happens when another existing study record is included, what does I²=0 **not** prove, why cannot RD and OR be pooled unchanged, and why do ten correlated measurements not equal ten independent trials?

Ask learners to attempt each decision independently, listen to their explanation of the source, then use their ungraded first-attempt errors to choose focused practice. Wrong responses can be corrected. The result is not a validated pre-test or a certificate. In translated course routes this new content is clearly designated an English-language pilot, still awaiting professional translation and methods review.

**Teaching observation to record (human, not automatically graded):** whether the learner identifies the effect family, reports numerator/denominator correctly, explains a post hoc selection as a sensitivity rather than eligibility decision, and articulates a concrete source-retrieval next step. Save observations and use the held-out capstone rubric in [the comparative review](COURSE_BENCHMARK_MULTIPERSONA_REVIEW_2026.md) before asserting pedagogical effectiveness.

## Learning design

The original flagship course has slides, quizzes, modelling tools, progression and spaced repetition. The Mission Lab is deliberately different: learners have to **make reproducible decisions**, carry out arithmetic, alter assumptions, reconcile disagreements and explain what would change a claim.

Use the learner-facing [Mission Lab](mission-lab.html) alongside [Evidence Reversal](synthesis-course.html). Either site works in the browser without an account. The lab stores participation and the editable dossier in the browser's local storage. Export is a local Markdown download, not a submission to any server. **Do not use learning scores as a credential or competency certification.**

### Repeatable 20-minute micro-workshop

1. **Predict (2 min):** learners write what they expect the evidence to show *before* using a plot or formula.
2. **Investigate (6 min):** work alone; change one assumption at a time; record what changes.
3. **Challenge (5 min):** pair participants; one argues against the conclusion, one reconstructs the analysis.
4. **Adjudicate (5 min):** identify the smallest set of verifiable records needed to resolve disagreement.
5. **Debrief (2 min):** record the uncertainty that survives and the next piece of evidence to retrieve.

### Six-week, 18-live-hour course integration

| Week | Core objective | Mission Lab exercises | Live activity | Evidence artefact |
|---|---|---|---|---|
| 1 | Question, outcomes, prespecification | 0–2 | **Protocol escape room:** reconstruct an auditable workflow before searching | Dated PICO, eligibility, protocol decisions |
| 2 | Retrieval, screening and provenance | 3–5; optional 19 | **Study rescue race:** two reviewers independently decide on ambiguous records | Search log, full-text retrieval list, disagreement ledger |
| 3 | Quantitative analysis & robustness | 7–8, 12, 17 | **Forest-plot tug of war:** vary one study, defend the full-set estimate | Working, inclusion rule, influence/sensitivity note |
| 4 | Bias, missing evidence and certainty | 6, 9–10 | **Bias courtroom:** each group must distinguish evidence of bias from suspicion | Domain-level RoB/GRADE rationale |
| 5 | Advanced and connected evidence | 13–16, 18, 20–21 | **Network tribunal:** compare background care and effect modifiers across comparisons | Transitivity, indirectness, IPD and subgroup caveats |
| 6 | Living, reproducible and publishable synthesis | 11, 22–24 | **Editorial board simulation:** verify an argument before recommending publication | Downloadable dossier, reviewer response and change log |

**Suggested weekly live flow (3 hours):** 35 min teaching, 50 min facilitated investigation, 15 min break, 35 min challenge pairs, 30 min critical debrief and 15 min reflection. Supplement with reading and 1–2 missions asynchronously. The precise allocation is adjustable; do not let scoring displace scientific reflection.

## Seven ready-to-run classroom games

### 1. The missing-trial auction (15 minutes)

Split participants into teams. Give each team ten fictional search tokens. They can "spend" tokens on bibliographic searching (3), a trial registry (2), regulator records (4), citation chasing (1) or a journal press release (1). Ask them to decide *before* learning whether a missing trial exists. Reveal that one completed trial has results available only in regulatory records. Award points for **justified coverage and documentation**, not for lucky guesses. Play Mission 3 after the debate.

### 2. Protocol escape room (12 minutes)

Put the five Mission 2 actions on cards. One student deliberately hides the protocol registration card. Teams must reconstruct a scientifically defensible sequence and explain why changing an outcome after extraction is different from amending the protocol prospectively. Reveal the missing card and have groups reconstruct the audit trail.

### 3. Two-reviewer screening duel (15–25 minutes)

Run Mission 4 in pairs. Reviewer A completes the first pass with no verbal consultation. Swap the device and let Reviewer B complete the second pass. Display the disagreement count, then agree a final verdict for each record. Require a **single-line eligibility reason**, especially for the *Unclear* category. Do not equate reviewer disagreement with incompetence.

### 4. Forest-plot tug of war (20 minutes)

On Mission 7, plot the full synthetic dataset. Divide students into two groups. Ask one to argue for a favourable clinical claim and the other to explain why the large discrepant study matters. Toggle Trial C; calculate what changes. The winner is the group that presents **full-set effect, heterogeneity, sensitivity and honest uncertainty** without silently deleting evidence. Repeat with Mission 17 and restore all trials.

### 5. Bayesian prior showdown (15 minutes)

Use Mission 13. Give half the class a sceptical prior and the other half a weakly informative prior. The likelihood must remain fixed. Each participant records a prior SD, posterior effect and credible interval; students compare interpretations. Discuss conditional probability, priors, prior sensitivity and the boundary between posterior inference and clinical certainty.

### 6. NMA transitivity tribunal (20 minutes)

Teams act as reviewer, trialist and methods editor. The author claims that a connected graph implies exchangeability. The reviewer identifies different background treatments and severity across comparisons. The trialist explains data availability. The editor specifies the minimum analyses/limitations needed before publishing. Use Mission 14 and the Mission 24 editor challenge. Do not treat trial-level regressions as individual-level proof.

### 7. Reproducibility breakout (20 minutes)

Hide one artefact — source records, extraction, code, prespecified decisions or diagnostics. Ask teams whether an independent analyst could replicate the claim. Restore the artefact, compare verification to scientific validity, and have each group document at least two still-untested assumptions. Finish Missions 22–23 and export the Markdown dossier.

## Individual feedback and educator rubric

Scores are **practice feedback**, not a test of clinical or statistical competency. For a human-reviewed capstone, grade the dossier using a written rubric:

| Criterion | Weight | What to look for |
|---|---:|---|
| Protocol-to-claim traceability | 30% | Dated definitions, complete eligibility/source trail, declared deviations |
| Correct methods and sensitivity reasoning | 30% | Appropriate estimand, numerical inputs, dependencies, assumptions and uncertainty |
| Critical evidence appraisal | 25% | Domain-specific bias and GRADE reasoning, missing evidence, transitivity where relevant |
| Clear scientific communication | 15% | Proportionate claims, alternative explanations, concrete unresolved questions |

A self-assessed draft is never automatically certified as correct. Offer constructive commentary and a chance to revise rather than grade purely on a quiz streak.

## Learning accommodations

- All tasks are usable by clicking or with a keyboard; ordering has up/down controls as well as optional pointer dragging.
- Activities are untimed. The "3-minute" journal-club card is an optional discussion prompt, not a countdown.
- Learners may replay tasks; the highest local score is retained. Hints are available without penalty to access (a small points change is only gamification, not summative grading).
- For accessibility, pair spoken instructions with written prompts, avoid speed-only competitions and allow more time for comprehension or calculations.
- This first version is in English. The existing flagship curriculum is available in additional language versions; translations of these new interactive prompts require substantive methodological review rather than unchecked machine translation.

## Data and mathematical limitations

Every lab dataset is fictional. The forest-plot experiment uses inverse-variance fixed-effect pooling on log risk ratios when all event cells are positive. It is **not** a full meta-analysis workflow: among-study heterogeneity, alternative estimators, sparse/zero-event methods and sensitivity to bias can alter substantive conclusions. The I² exercise calculates an index from a provided Q rather than endorsing categorical cut-offs. The Bayesian exercise uses a conjugate normal prior/normal likelihood teaching model; a real trial synthesis will often require more complex assumptions and models.

**Key rule:** make explicit what is simulated, what is calculated, what is assumed and what is established by real primary evidence.

## Running and maintaining

Open the repository locally with the command **python -m http.server 8000**, then visit http://localhost:8000/mission-lab.html. The data and scripts are relative files with no build step. You can also open the HTML page directly from local files in most modern browsers. If access to local storage is denied, activities remain usable but results will not persist.

- **mission-lab-data.js** contains the 25 tasks, labels, correct answers and explanations.
- **mission-lab.js** contains the interaction engine, live calculations, scoring and export.
- **mission-lab.css** contains mobile and accessible styling.
- **tests/mission-lab.test.cjs** tests schema, DOM interaction and worked examples in Node with JSDOM.
- **.github/workflows/mission-lab-checks.yml** runs syntax and DOM checks on changes.

When expanding the bank, preserve the 0–24 linkage to flagship course modules, add a regression test for each new exercise mechanic, and obtain subject-matter review of any change in correct answers or interpretations. Avoid using copyrighted article tables or identifying real trial participants as sample data.

## Design ideas for a future iteration

Add anonymised peer-review rubric forms, opt-in facilitator-led teamwork, screen-reader QA with actual assistive technology, thoroughly reviewed translations and separate calibration exercises. Any scored assessment should be validated against independently adjudicated expert work before claims of learning effectiveness are made.

## Two-person screening and independent course review

Use the [Two-Person Review Exchange](review-exchange.html) to give two independently recruited humans the same six archival magnesium trial *count rows* on **separate devices**. Each completes an eligibility decision and explanation without seeing the other's file. A facilitator imports the two JSON submissions and adjudicates every decision, exporting an audit with descriptive agreement and κ. Labels are **self-declared**, not authenticated; the count rows alone do **not** establish actual eligibility. Ask for the original publications and independent reviewer sign-off for any serious research task. This is different from the previous one-device A/B role simulation.

For a published-program comparison and simulated perspectives from novice, expert, statistician, librarian, facilitator and accessibility lenses, see [Benchmark and multi-persona review](COURSE_BENCHMARK_MULTIPERSONA_REVIEW_2026.md). Simulated personas are not human peer reviewers or course accreditors.
