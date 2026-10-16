# Magnesium evidence-reversal integration quality gate

This branch adds an independent **non-religious** clinical evidence-reversal investigation about intravenous magnesium after myocardial infarction.

## Requirements for a merge
- Correct source counts for the six named historical records in `metadat::dat.egger2001` (the reference contains **16** trials, not six).
- The English interactive calculator uses Peto **odds ratios** with visible selection, 95% confidence intervals and information contributions. Do not reinterpret OR as RR.
- GitHub Actions `test-mission-lab` must pass JavaScript syntax, DOM interaction and the 12-language course-route embedding regression suite.
- GitHub Actions `verify-magnesium-r` must independently run `scripts/verify_magnesium_reversal.R` using **metadat and metafor** and pass all selected 5/6- and full 15/16-record comparisons.
- GitHub PR must be mergeable and checks green at the *latest head*. Do not bypass failing tests.

## Scientific and editorial boundaries
- Six rows are a deliberately chosen classroom sensitivity example, not a published six-trial review or treatment recommendation.
- ISIS-4's large information share is not proof of study quality, a causal explanation of the reversal, or evidence that selective publication alone caused differences.
- The chronology follows actual LIMIT-2 and ISIS-4 publications. Learner choices and the deliberately selected six-record teaching sequence are constructed, **not fabricated clinical data or reconstructed historical conversations**.
- All twelve existing language routes remain available. This *new* case is an **English-language pilot** and has not received professional translation review.
- Course stories use **secular narrative structure** (a documented question, developing evidence, a turning point and an accountable conclusion). They do not include religious quotations or arguments.

**Post-merge caveats:** independent expert assessment of clinical teaching framing, native-speaker translation reviews, and live deployed-page verification remain outstanding.
