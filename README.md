# Synthesis Course Collection

Free, open-access interactive training in evidence synthesis and meta-analysis.

**Live site:** https://mahmood726-cyber.github.io/synthesis-courses/

## What's inside

- **26 interactive courses** covering systematic reviews, meta-analysis (pairwise, NMA, IPD), diagnostic test accuracy (DTA), GRADE, HTA, and methodology
- **12 languages:** English, Arabic, Chinese, French, German, Hindi, Italian, Japanese, Korean, Portuguese, Russian, Spanish
- **Audited:** 3,209 slides across 47 source files, 0 errors at last audit

## How to use

Open `index.html` in any modern browser — or visit the live site above. No install, no login, no tracking. Each course is a single self-contained HTML file with interactive slides.

## New: Synthesis Mission Lab (English)

[Open the hands-on Mission Lab](mission-lab.html), or select **Practice this module** inside the [25-module flagship](synthesis-course.html). A two-way deep link keeps the activity connected to the module you are studying.

The lab contains **25 new investigations using nine interaction types**: multi-select detective work, categorisation/matching, ordered research workflows, paired independent screening and reconciliation, numerical effect-size/DTA exercises, an interactive pooled forest-plot sandbox, a Bayesian prior slider, a peer-reviewed dossier drafting template, and multistage editorial decisions.

- Progress and best practice scores are saved in browser local storage; there is no account or telemetry.
- A Markdown dossier can be exported without uploading research information anywhere.
- The [facilitator guide](MISSION_LAB_TEACHING_GUIDE.md) provides seven classroom games and a six-week, 18-live-hour delivery pattern.
- Datasets are fictional teaching examples. Lab scores do not certify competence or justify clinical recommendations.
- This new activity bank is English-only at launch; the existing 12-language course collection remains available.

### Testing the lab

With Node.js 22+:

~~~sh
npm install --no-save --package-lock=false jsdom@26.1.0
node --check mission-lab.js
node --test tests/mission-lab.test.cjs
~~~

GitHub Actions also runs these checks automatically on related changes.

## Real published R data inside every flagship lesson (new)

Each of the 25 modules in the flagship **Evidence Reversal** course now has an additional **real-data practical slide directly after its objectives**, not just a link to an external learning activity. The compact exercise loads on demand and links to its canonical R data and R reproduction code.

Two small, canonical teaching datasets are used intentionally:

- **6 trials**: Hine et al. (1989), lidocaine after myocardial infarction; reproduce the published R risk-difference result **RD = 0.0294 [0.0038, 0.0551]**, apply inverse-variance weights and explore a true leave-one-out calculation.
- **5 trials**: Berkey et al. (1998), periodontal surgery vs non-surgical treatment; count five independent trials with ten correlated outcomes, and calculate the marginal probing-depth mean difference.

[Open the real-data mini-lab](real-evidence-lab.html?module=7) · [Read the exact data, formulas, R scripts and limitations](REAL_DATA_PROVENANCE.md)

The source study counts, numerical calculations and answer keys are identical across **12 supported language routes**, with translated practice questions. The **new translations are provisional** pending independent specialist/native-language review. Existing flagship translations are preserved. Small teaching datasets are historical examples, **not a comprehensive current clinical evidence review**; other process simulations in the Mission Lab remain labelled as fictional.

### Verify the source calculations

Run the JavaScript regression suite alongside the existing Mission Lab tests:

~~~sh
npm install --no-save --package-lock=false jsdom@26.1.0
node --test tests/real-evidence-lab.test.cjs tests/mission-lab.test.cjs
~~~

For the R-package cross-check, install CRAN metadat and metafor and run **Rscript scripts/verify_small_meta.R**.

## Run locally

```bash
python -m http.server 8000
# then open http://localhost:8000/
```

## License

Open-access educational material. Contributions and translation corrections welcome via GitHub issues.
