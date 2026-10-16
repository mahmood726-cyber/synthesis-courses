# Synthesis Research Studio + real AllMeta apps

**Status:** Teaching implementation, not yet a validated qualification, registered systematic review or independent comparison against other courses. The source-linked course and AllMeta app source belong to the same GitHub account, but each repository has its own CI and release schedule. Live deployment must be checked separately.

## What is genuinely integrated

The new [Research Studio](research-studio.html) connects six interactive, browser-first educational stations to the existing 25-module flagship course and the actual apps in [AllMeta](https://github.com/mahmood726-cyber/allmeta). The six source-linked stations are embedded in modules **1, 4, 7, 8, 9 and 24**, respectively, through the existing shared `lesson-workshops.js` entrypoint, preserving all 12 established language pages. The new teaching prompts are English-only pilots; other language routes explicitly say **provisional / not professionally translated or reviewed**.

### Six stages

1. **Protocol before analysis.** Learners must write PICO, eligibility/retrieval rule, and an outcome before locally locking their classroom decisions. The matching AllMeta tool is `/allmeta/protocols/`. Local locking is not prospective registration.
2. **Two-pass screening and adjudication.** Uses six genuine archived trial labels and treatment/control death counts from `metadat::dat.egger2001`. Reviewer A's answers are deliberately hidden during the B pass; after both, differences are revealed and each record gets a final decision with a reason. It **does not** authenticate two humans and archived 2×2 counts alone cannot establish original-study eligibility. Advanced real screening is at AllMeta `/screen/index.html`.
3. **Retrospective living-evidence practice.** Learners predict before unlocking four chronological snapshots (1986, 1989, 1992, 1995) from the deliberately selected six magnesium records, fitted with the existing Peto estimator. These are teaching reconstructions, **not** actual prospective living reviews at those dates or a continuously monitored evidence system. AllMeta `/cumulative-subgroup/` and `/evidenceos/` are linked for further exploration. Do not import one dataset under the other clinical endpoint or estimator.
4. **Six-study statistical lab.** Uses `metadat::dat.hine1989` genuine lidocaine 2×2 mortality rows and the existing checked common-effect inverse-variance risk difference (RD) calculator. Learners include/exclude studies and obtain RD, 95% CI, Q and I² before comparing effects in AllMeta. The shared-bus adapter serializes each individual **RD** and its standard error on the **identity** scale.
5. **Peer-review courtroom + targeted practice.** Six methodological questions target protocol decisions, screening uncertainty, analysis scale, bias, certainty and reproducibility. Every wrong answer gets source-compatible explanatory feedback and records a domain-specific misconception; the dashboard links an appropriate AllMeta tool. The system does not grade genuine learner-written scientific reasoning.
6. **Research capstone.** Each learner writes three substantive sections on interpretation, limitations and next reproducible work, then exports a local Markdown dossier with the original source URLs, archived labels, reviewer decision record, quantitative snapshots, analysis decisions and suggested remediation. Completion only indicates structured practice; it is not competency accreditation or expert scientific review.

## AllMeta catalog links — verified against repository source

The following route paths and app titles were checked against the GitHub default-branch catalog `allmeta/hub/projects.js` and each app's corresponding `index.html` or directory. **This verifies that repository files exist, not that deployment or every browser path currently works.**

| Learning role | Repository-listed app | Relative Pages path | Data handoff |
| --- | --- | --- | --- |
| Prespecification | Protocols | `/allmeta/protocols/` | Manual, no automatic protocol registration |
| Retrieval/screening | Screen | `/allmeta/screen/index.html` | Manual separate review work |
| Pooling | MA Workbench | `/allmeta/workbench/index.html` | Shared `ma-studies-v1` or CSV |
| Forest plot | Forest Plot Viewer | `/allmeta/forest-plot/index.html` | Shared `ma-studies-v1` or CSV |
| Model diagnostics | Heterogeneity Explorer | `/allmeta/heterogeneity/index.html` | Shared `ma-studies-v1` or CSV |
| Influence | Influence Diagnostics | `/allmeta/influence/index.html` | Shared `ma-studies-v1` or CSV |
| Independent R | WebR Studio | `/allmeta/webr-studio/index.html` | Manual R code and R packages |
| Appraisal | RoB 2 | `/allmeta/rob2/index.html` | Manual, no automated certainty claim |
| Certainty | GRADE SoF Builder | `/allmeta/grade-sof/index.html` | Manual, not the result of a validated RoB judgement |
| Reporting | PRISMA Flow | `/allmeta/prisma-flow/index.html` | Manual; retrospective archive screening is not a PRISMA review |
| Chronology | Cumulative + Subgroup | `/allmeta/cumulative-subgroup/index.html` | Same bus supported, but timestamped primary data and matching estimator required |
| Monitoring | EvidenceOS | `/allmeta/evidenceos/` | Separate surveillance app, not a guaranteed live background monitor |

AllMeta's schema and source: `allmeta/shared/ma-studies-v1.md` (stable bus contract), `allmeta/shared/ma-studies-v1.js`. The `MaStudies` bus is localStorage key `ma-studies-v1`, envelope `{_schema:"ma-studies-v1", _savedAt:ISO8601, studies:[{label,est,se,moderator,group,year}]}`, with finite effects and positive SEs. Forest Plot Viewer and Workbench have explicit **Load from bus** controls.

## Exact transfer semantics and safety

- The first native data handoff is **Hine six-study RD**, not magnesium Peto OR and not historical BCG log RR. Each `est` is risk difference on the **linear identity scale**, and `se` is its standard error from the source-linked teaching calculator. Set **effect label “Risk difference” and null 0** in AllMeta Workbench and Forest Plot. The bus schema itself cannot enforce the effect label; the learner must choose it in the destination app.
- Synthesis and AllMeta's official Pages paths are normally **same-origin**, hosted on `https://mahmood726-cyber.github.io/`, even though their repository subpaths differ. The browser bus is scoped to the origin, **not to each repository subpath**. The adapter refuses direct staging on local / mirror / unsupported hosts; download `label,est,se` CSV instead.
- It **never** stages automatically. Learners press a clearly labelled button. An occupied `ma-studies-v1` bus is not overwritten without a separate explicit confirmation showing existing row count. If they cancel, no write takes place. Previous unrelated AllMeta data must not silently be combined with Hine outcomes.
- There is no claim of independent recalculation or receipt validation merely because a row is staged. Users must click **Load from bus** in the destination, check effect label/null, inspect source counts, model, estimator, variance and results, then document any difference.
- For `Forest Plot Viewer`, its documented input expects effects already on the analysis scale. RD is identity; logOR/logRR would instead require logarithmic effects and appropriate null 0 on log scale. Don't pool mixed effect measures or transfer the magnesium Peto summary as if it were a study effect.
- AllMeta may change independently. Automated tests validate the serialization *against the documented bus contract and repository catalog*, but the cross-repository end-to-end browser transfer and mobile UI still need a real-device Pages smoke test.

## Real R dataset grounding

- Magnesium: `metadat::dat.egger2001`, **six deliberately chosen** of sixteen records with Peto OR fit. Reproduction: [`scripts/verify_magnesium_reversal.R`](scripts/verify_magnesium_reversal.R). The live-update education scene is retrospectively reconstructed from years, not a full actual living review.
- Lidocaine: `metadat::dat.hine1989`, six trial-arm mortality tables, RD point estimate and variance computed from the source's `small-meta-data.js`. Independent R reproduction: [`scripts/verify_small_meta.R`](scripts/verify_small_meta.R). No patient-level record is used or invented.
- Original source pages: https://wviechtb.github.io/metadat/reference/dat.egger2001.html and https://wviechtb.github.io/metadat/reference/dat.hine1989.html .

## Verification and next scientific quality gates

CI checks source rows, retrospective snapshot ordering, Hine RD, `ma-studies-v1` envelope validity, old-bus preservation, unsupported-origin refusal, the A/B/adjudication sequence, method-correction feedback, the full 12-language lesson insertion, and capstone dossier provenance. Existing 35+ frontend exercises and package-native R checks must continue passing.

Not yet independently established: completed full-text eligibility screening, ongoing study surveillance, external browser transfer on the deployed site, numerical parity between *every* AllMeta app model and R, 12 expertly translated new lesson versions, actual screen-reader audits, human-reviewed capstone competence, reproducible student research beyond the selected educational subset, or superiority to all other courses. These require **separate real validation**, not a marketing claim.

## Six-week teaching integration

| Week | Classroom focus | Research Studio task | Outcome |
| --- | --- | --- | --- |
| 1 | Register first | Protocol station + AllMeta Protocol Builder | Frozen classroom protocol with limitations |
| 2 | Reconcile a source trail | Independent archive-row passes A/B, mandatory final reasons + AllMeta Screen | Adjudication ledger (not validated full-text screening) |
| 3 | A trial changes the plot | Predict four retrospective magnesium snapshots + AllMeta Cumulative | Prediction-to-data evidence update log |
| 4 | Build the estimate yourself | Hine source counts, RD/SE, 95% CI, AllMeta Workbench and Forest Plot | Cross-tool comparative calculations |
| 5 | Defend the science | Peer-review courtroom, RoB 2 and GRADE SoF | Misconception feedback and justified uncertainty |
| 6 | Report what remains uncertain | Capstone + PRISMA and downloadable dossier | Auditable but self-assessed learner submission |

**Instructor rule:** Source data must be real and correctly labelled; every learner-authored inference requires human feedback before scientific approval. More clickable controls are not evidence of better learning. Compare against established courses only with preregistered, independently assessed outcomes on held-out tasks and a common evaluation rubric.
