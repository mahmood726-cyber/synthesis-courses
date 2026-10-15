# Archival magnesium-after-MI evidence-reversal source and calculations

**Primary dataset:** `metadat::dat.egger2001` (16 randomised trial records), official package reference:
https://wviechtb.github.io/metadat/reference/dat.egger2001.html

**Method:** Peto equal-effects odds ratio, as in `metafor::rma.peto()`:
https://wviechtb.github.io/metafor/reference/rma.peto.html

## Selected classroom records (k = 6 of 16)
IDs 1 Morton (1984); 2 Rasmussen (1986); 3 Smith (1986); 6 Shechter (1989); 14 LIMIT-2 (1992); 16 ISIS-4 (1995). Raw event counts are stored in `magnesium-reversal-data.js` and checked against the official reference.

For each study with deaths `a` among `n1` on magnesium and deaths `c` among `n2` controls, the script calculates the observed minus expected count `O−E = a − n1(a+c)/(n1+n2)` and corresponding hypergeometric variance `V = n1*n2*(a+c)*(n1+n2-a-c)/((n1+n2)^2*(n1+n2-1))`. The pooled log(OR) is `sum(O−E)/sum(V)`; the standard error is `sqrt(1/sum(V))`.

- Five deliberately selected older rows: Peto OR **0.622306** (95% CI **0.482841–0.802055**).
- Those five plus ISIS-4: Peto OR **1.027995** (95% CI **0.967911–1.091809**).
- ISIS-4 information share in this six-row exercise: **94.37%**.
- Official package's full fifteen without ISIS-4: printed OR **0.55** (0.44–0.68).
- Official package's full sixteen including ISIS-4: printed OR **1.01** (0.95–1.07).

The selected 5/6 comparison is a **constructed demonstration**, not the published full review. Peto estimates may be unsuitable for particular imbalanced or large-effect data. No clinical outcome has been simulated, but the editorial narrative is fictional. This case is separate from spiritual reflection.

**Independent reproduction:** `Rscript scripts/verify_magnesium_reversal.R` (requires installed `metadat` and `metafor`); the GitHub Actions job `verify-magnesium-r` runs this script, and `test-mission-lab` checks browser interaction. Both must pass on the PR's latest head before merging.
