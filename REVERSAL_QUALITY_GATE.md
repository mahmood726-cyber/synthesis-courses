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
- The editorial story is simulated; archived event counts and bibliographic citations are real.
- All twelve existing language routes remain available. This *new* case is an **English-language pilot** and has not received professional translation review.
- Existing Qur’anic reflections are unchanged. No religious claim is used to validate a statistical or clinical result.

**Post-merge caveats:** independent expert assessment of clinical teaching framing, native-speaker translation reviews, and live deployed-page verification remain outstanding.
