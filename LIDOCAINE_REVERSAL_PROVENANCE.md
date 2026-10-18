# Lidocaine prophylaxis after myocardial infarction — source and calculation provenance

This secular three-act retrospective educational investigation contrasts a plausible surrogate outcome (ventricular fibrillation) with mortality results. Predictions and reveal sequence are instructional constructs, **not** historical transcripts or prospective review decisions. It is not medical guidance.

## Verified, distinct dated evidence stages

1. **December 1989 — original review.** Hine LK, Laird N, Hewitt P, Chalmers TC. *Meta-analytic evidence against prophylactic use of lidocaine in acute myocardial infarction.* Arch Intern Med 149:2694–2698. [Original paper](https://doi.org/10.1001/archinte.1989.00390120056011) · [PubMed](https://pubmed.ncbi.nlm.nih.gov/2688587/). This review considered **14 randomised trials** and distinguished ventricular fibrillation reduction from mortality. Its relevant hospital-phase treatment-period mortality synthesis raised concern, with risk difference about **+0.029** (95% CI **+0.004 to +0.055**, lidocaine minus control). This cannot be relabelled an all-population or modern-treatment conclusion.
2. **1999 — archived teaching data.** Normand ST, *Statistics in Medicine* 18:321–359, Table I; official [metadat::dat.hine1989 six-row object](https://wviechtb.github.io/metadat/reference/dat.hine1989.html) and [metafor example](https://www.metafor-project.org/doku.php/analyses:normand1999). The **six** archive rows are not the full 14-trial review. They yield RD **+0.0294443203**, SE **0.0130683170**, 95% CI **+0.0038308897 to +0.0550577509**, Q **0.8596926775** and estimated REML tau² **0**.
3. **2015 — broader Cochrane review.** [Original review text](https://pmc.ncbi.nlm.nih.gov/articles/PMC8454263/) reports all-cause mortality across **18 studies/11,727 participants**, risk ratio **1.02 (95% CI 0.82–1.27)**. This is a different evidence base, effect measure and potentially timing/population mix. The six-study archive does *not* reproduce its result. An RD cannot sensibly be subtracted from an RR, and a confidence interval spanning benefit and harm cannot prove no effect or equivalence.

## Exact authentic archive data

Lidocaine deaths/total versus control:
- Chopra: **2/39 vs 1/43**;
- Mogensen: **4/44 vs 4/44**;
- Pitt: **6/107 vs 4/110**;
- Darby: **7/103 vs 5/100**;
- Bennett: **7/110 vs 3/106**;
- O'Brien: **11/154 vs 4/146**.

The lesson computes treatment-minus-control risk differences, with per-record uncorrected binomial variance and common-effect inverse-variance weights. For these six only, the common-effect result coincides with native package REML because its estimated tau² is zero, not due to generic REML/common-effect equivalence.

**Independent numerical gate:** scripts/verify_lidocaine_story.R genuinely loads native metadat and metafor, checks original arm counts, the full REML estimate, normal CI, Q and tau² and compares every one of 57 possible 2–6 trial subsets to native metafor common-effect fits. The existing scripts/verify_small_meta.R is also run, not replaced. Frontend tests ensure staged real-data reveal, reversible pre-reveal predictions, misconception-specific responses, partial selection refusals, and a locally created, learner-authored first-commit-ready Markdown. That file is **not** committed to Git on the learner's behalf.

**Scope:** An English-only pilot inserted without changing any of the 12 original flagship language pages or translating prose. Other routes must visibly disclose provisional / untranslated status. No novel patient results, modern treatment advice, original full-text re-extraction, formal review registration, independent human assessment, professional translation, established efficacy, or WCAG conformance is claimed.

**Six SIMULATED review lenses (not real human reviewers):** methods/statistics (effect measure, trial count); clinical educator (surrogate vs mortality); novice (clear staged challenge); accessibility (keyboard/skip/recovery); multilingual learner (English-only disclosure); critical reviewer (source chronology/inference limitations). True external expert and learner testing remains a release-quality gate.
