# Provenance and scope of the real small meta-analysis exercises

**Purpose:** reproduce **two established, small R example datasets**, not generate new clinical evidence. All numerical source rows remain identical across the 12 lesson languages. Exercises deliberately have **k = 5 or 6 independent studies**; no large network or surrogate fabricated trials are relabelled as real.

## 1. Hine et al. 1989 (6 independent trials)

- R object: **metadat::dat.hine1989**, also documented in metafor.
- Primary study synthesis: Hine, L. K., Laird, N., Hewitt, P. & Chalmers, T. C. (1989). *Meta-analytic evidence against prophylactic use of lidocaine in acute myocardial infarction.* Archives of Internal Medicine 149, 2694–2698. [DOI](https://doi.org/10.1001/archinte.1989.00390120056011)
- Data transcription provenance: Normand, S. T. (1999), *Meta-analysis: Formulating, evaluating, combining, and reporting*, Statistics in Medicine 18(3), 321–359, Table I.
- [Official R data + six printed records](https://wviechtb.github.io/metadat/reference/dat.hine1989.html)
- [metafor worked analysis (Normand 1999)](https://www.metafor-project.org/doku.php/analyses:normand1999)

| Study | Lidocaine deaths / total | Control deaths / total |
|---|---:|---:|
| Chopra et al. | 2 / 39 | 1 / 43 |
| Mogensen | 4 / 44 | 4 / 44 |
| Pitt et al. | 6 / 107 | 4 / 110 |
| Darby et al. | 7 / 103 | 5 / 100 |
| Bennett et al. | 7 / 110 | 3 / 106 |
| O'Brien et al. | 11 / 154 | 4 / 146 |

The estimand is **risk difference = proportion of deaths on lidocaine − proportion in control** at the end of the assigned treatment period. Positive RD means more deaths under lidocaine.

The browser demonstration applies the uncorrected within-study binomial sampling variance
**v_i = p1_i(1−p1_i)/n1_i + p0_i(1−p0_i)/n0_i** and inverse-variance weights **w_i = 1/v_i**, producing a common/equal-effect estimate. It is not the risk ratio, odds ratio or Mantel–Haenszel method.

### Independent R reference check

| Field | Browser calculated (unrounded) | Published metafor display |
|---|---:|---:|
| k | 6 | 6 |
| Pooled RD | 0.0294443203 | 0.0294 |
| SE | 0.0130683170 | 0.0131 |
| Lower 95% CI | 0.0038308897 | 0.0038 |
| Upper 95% CI | 0.0550577509 | 0.0551 |
| Q | 0.8596926775 | 0.8597 |
| I² | 0% | 0% |

The official worked R demonstration uses **REML random-effects estimation** and happens to estimate **τ² = 0** for this particular dataset. Under these conditions its pooled estimate coincides with the common-effect inverse-variance calculation within reported rounding. **Do not claim general equivalence of REML and common-effect analyses.**

The browser estimates the Wald interval using z = 1.95996398454; printed R examples round and may use z ~ 1.96. Analyses involving zero cells, sparse events, substantial heterogeneity, cluster randomisation or other effect measures need additional methods. A sensitivity plot is a demonstration, not a recommendation to remove a study based on its observed effect.

## 2. Berkey et al. 1998 (5 independent trials; 10 dependent effect estimates)

- R object: **metadat::dat.berkey1998**.
- Source: Berkey et al. (1998), *Meta-analysis of multiple outcomes by regression with random effects*, Statistics in Medicine 17, 2537–2550, Table I.
- [Official R data and printed rows](https://wviechtb.github.io/metadat/reference/dat.berkey1998.html)
- [metafor worked multivariate analysis](https://www.metafor-project.org/doku.php/analyses:berkey1998)

| Trial | Probing-depth (PD) mean difference | PD variance | Attachment-level (AL) mean difference | AL variance | Within-trial covariance |
|---|---:|---:|---:|---:|---:|
| Pihlstrom | 0.47 | 0.0075 | −0.32 | 0.0077 | 0.0030 |
| Lindhe | 0.20 | 0.0057 | −0.60 | 0.0008 | 0.0009 |
| Knowles | 0.40 | 0.0021 | −0.12 | 0.0014 | 0.0007 |
| Ramfjord | 0.26 | 0.0029 | −0.31 | 0.0015 | 0.0009 |
| Becker | 0.56 | 0.0148 | −0.39 | 0.0304 | 0.0072 |

Each trial contributes **two correlated outcomes**. The mini-lab's pooled PD-only **common-effect marginal** inverse-variance estimate equals **0.3472008702** from the five PD rows; its analogous AL estimate equals **−0.3925838745**. These simple univariate demonstrations **must not be confused with** the official multivariate random-effects R analysis, which models the paired outcomes with within-study covariance.

The five-trial independent sample size **never becomes ten trials** because there are ten outcome rows.

## Reproduction and testing

- [Source counts, model implementation and hardcoded R benchmark](small-meta-data.js).
- [R verification script](scripts/verify_small_meta.R) (requires R and the published metadat/metafor packages).
- [Node JSDOM regression tests](tests/real-evidence-lab.test.cjs), including all 25 real-data mini activities, study counts, 12 language routes, live Bayesian and leave-one-out exercises.
- Run: **node --test tests/real-evidence-lab.test.cjs** (requires jsdom; see README).
- **No live clinical guidance or updated literature search** is implied by reproducing these archived datasets.

## Lesson mechanics

The 25-lesson flagship has one extra exercise slide inserted after each module's learning objectives. It loads only when opened, uses the relevant real R data, shows original trial records, challenges the learner and exposes the reproducible R code. All 12 lesson languages link to the **same numerical data**, model, exact answer keys and source URLs.

| Modules | Teaching task |
|---|---|
| 0, 1, 5 | Count independent trials; calculate actual trial risks and risk differences |
| 2–4, 6 | Protocol, search, eligibility and RoB limitations of historical aggregate data |
| 7–8 | Reproduce published six-study pooled RD, Q and I² |
| 9–12 | Small-study effects, GRADE, living updates and unsuitable DTA interpretations |
| 13 | Bayesian prior-width sensitivity **using the observed Hine RD/SE**, not synthetic trial counts |
| 14–16 | Recognise limitations for NMA, IPD and dose–response methods |
| 17 | Interactive leave-one-out with the **six real Hine trials** |
| 18–20 | Equity, AI search reproducibility and qualitative data requirements |
| 21, 23 | Five-trial Berkey correlated outcomes, sample-unit counting and PD pooling |
| 22, 24 | Audit the evidence chain and avoid unwarranted clinical generalisation |

## Translation quality status

The short prompts and interface labels are supplied in English, Arabic, Chinese, French, German, Hindi, Italian, Japanese, Korean, Portuguese, Russian and Spanish. Numerical expressions, source URLs and correct answers are language-invariant. Structured checks guard missing locale keys, wrong counts and navigation defects.

**The newly authored translations have not been independently checked by professional/native-speaking methods experts.** They are released as provisional educational translations, not as validated clinical guidance. Any graded use in another language should first receive native methodological review, especially for the distinctions between *credible intervals*, *confidence intervals*, *risk differences*, *risk of bias* and *absence of evidence*.

## Rights and responsibility

These are small factual count/effect tables attributed directly to their original publications and published package documentation. We have not copied lengthy article passages. Source links and original citations remain available inside every activity. If upstream records, corrections, permissions or package versions change, re-check transcriptions and re-run reference tests. The source-data verification is **at the R-package/example level**, not a new independent audit of the original trial publications.
