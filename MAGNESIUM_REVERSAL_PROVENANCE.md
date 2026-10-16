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

The selected 5/6 comparison is a **constructed demonstration**, not the published full review. Peto estimates may be unsuitable for particular imbalanced or large-effect data. No clinical outcome, researcher's conversation or trial finding has been invented. The learning choices and study inclusion order are constructed for education; the clinical chronology is anchored in original publications.

**Independent reproduction:** `Rscript scripts/verify_magnesium_reversal.R` (requires installed `metadat` and `metafor`); the GitHub Actions job `verify-magnesium-r` runs this script, and `test-mission-lab` checks browser interaction. Both must pass on the PR's latest head before merging.

## Documented chronology (not a fictional case)

- **1991:** The `metadat` source reproduces a seven-early-trial Peto OR of **0.45 (95% CI 0.28–0.71)**, as in the Teo et al. overview. Historical source: https://doi.org/10.1136/bmj.303.6816.1499
- **1992:** LIMIT-2 randomised **2,316** patients with suspected acute MI, reporting **28-day** mortality **7.8% with magnesium versus 10.3% with placebo**. The original report is https://pubmed.ncbi.nlm.nih.gov/1351547/ . In the official R archive, early trial IDs 1–7 plus LIMIT-2 (ID 14) give an illustrative full-eight-record Peto OR of **0.65 (0.51–0.82)**.
- **1995:** ISIS-4 randomised **58,050** patients in a factorial study. The magnesium comparison was against **open control**, reporting **five-week** deaths of **2,216/29,011 (7.64%) versus 2,103/29,039 (7.24%)**, without a significant mortality reduction: https://pubmed.ncbi.nlm.nih.gov/7661937/ . The 16-trial R exercise is retrospective and is *not* the full current evidence base.

The browser's three acts follow these **real publications**, while questions and the six-row selection are deliberately scripted teaching devices, **not** historical transcripts or formal trial inclusion decisions. Different timing, dose, background care, publication selection and statistical assumptions have been discussed as potential reasons for divergent results; the six-record subset cannot assign causes. See the later Cochrane synthesis for wider context: https://pmc.ncbi.nlm.nih.gov/articles/PMC8407081/ .

**Verification:** `scripts/verify_magnesium_reversal.R` independently checks the early 7/8-trial, full 15/16-trial, and selected 5/6-trial Peto results with `metadat` and `metafor`. The interactive table also ranks the leave-one-out influence of each selected record (change in log OR); numerical influence is not proof of quality, bias or eligibility.
