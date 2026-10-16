# Synthesis — World-Class Interactive Learning Benchmark and Development Gates
_Last benchmark review: 16 October 2026. An ambition and a test plan, **not** a claim of world ranking or accredited learning effectiveness._

## Comparator programmes (verify against their official current sites)
| Programme | Documented offer | Standard that Synthesis must meet or exceed |
|---|---|---|
| Cochrane Interactive Learning | More than 20 hours of self-directed learning, 14 core modules; advanced topics include network meta-analysis, health equity, rapid and living reviews. https://www.cochrane.org/products-and-services/cochrane-interactive-learning | Complete, technically current review workflow, accessible practice and authoritative methods oversight |
| Campbell Collaboration / Carnegie Mellon OLI | Self-paced course from formulation to synthesis with immediate meaningful feedback and formative assessment. https://www.campbellcollaboration.org/get-involved/training/ | Reliable explanations, misconceptions addressed on retry, instructor usability and measured learning |
| JBI Comprehensive Systematic Review Training | Expert-led one-to-five-day practical training, including review protocols, searching, appraisal and synthesis. https://jbi.global/training/systematic-review-training | Authentic protocol development and human assessment, not self-declared competency |
| Covidence Academy | Workflow training in protocols, searching, screening and extracting data, supported by videos and articles. https://academy.covidence.org/ | Repeatable end-to-end review decisions, searchable records and source-level provenance |

No external course's number of possible interactions or audited learning outcomes has been exhaustively measured here. “Most interactive ever” cannot be claimed from counting buttons or assuming competing courses lack features.

## Current auditable Synthesis foundation
- 25 Mission Lab investigations with nine interaction types, protocol/retrieval/screening/analysis/peer review exercises.
- Twenty-five in-lesson source-linked small-k practical activities, backed by `metadat` Hine/Berkey reference records.
- Three other real-data evidence examples: historical BCG, lidocaine and magnesium, with a separately verified magnesium full fifteen/sixteen-trial comparison.
- Existing 12 language routes. New material not independently reviewed in each language remains **provisional**.
- **Evidence Decision Arena** (this change): three documented source sets (each at most six displayed records), five experiential stages, frozen pre-reveal prediction, dynamic 95% CI plot, source links, peer reviewer reasoning, self-check and editable Markdown dossier. Learners can redo assessments, explore every 2–6-record subset, and export evidence decisions locally.
- No learner data is uploaded by the Arena; progress uses device/browser storage. No accreditation or independent expert verification is claimed.

## First-principles standard: genuine interaction, not decorative clicking
An interaction counts towards our effectiveness score only when it requires the learner to make or justify a real methodological choice, manipulate source-linked records, produce an interpretation, or revise work after feedback. Scrolling slides, pressing next, listening to video or collecting badges are **not** counted as substantive practice.

Proposed auditable rubric (0–4 per dimension):
1. **Coverage:** all nine phases from PICO and protocol to search, screening, extraction, RoB, quantitative synthesis, certainty and reporting.
2. **Decision density:** at least three distinct substantive learner decisions per substantive lesson, not counting navigation.
3. **Authenticity:** source-level trial arm counts, exact citations and replayable R methods, with simulated examples explicitly marked.
4. **Adaptive feedback:** error-specific explanations, guided replay and retained reasons for changed decisions.
5. **Statistical fidelity:** deterministic unit tests and package-native R reproductions, with estimator/version differences documented.
6. **Accessibility and equity:** keyboard/screen-reader/mobile tests, offline/browser-only low-bandwidth paths and 12 professionally reviewed languages.
7. **Assessment:** independent adjudication of learner-generated protocols, analyses and conclusions; not self-reported badges.
8. **Teaching effectiveness:** preregistered comparisons measuring ability to complete new unseen review tasks, transfer, retention and error detection.

**Do not publish a comparative ranking unless equivalent competitors have been assessed with a common instrument by independent reviewers.** Publish the methodology, raw aggregate scoring and caveats.

## Six phases to make the course substantially more capable
**A. Practical spine — now:** Embed the multi-case Decision Arena with prespecification, genuine trial manipulation, uncertainty plots, reviewer challenge and downloadable reasoning record. Test its three authentic data families and 12 routes, then independent content QA.

**B. Screen-and-extract adjudication:** Expand beyond the current fictional dual-reviewer mission to real, legally redistributable abstracts and six small historical studies. Capture duplicate decisions, reasons, blinded reviewer passes and adjudication logs; source identifiers must be verifiable.

**C. Analysis and reproducibility:** Provide pairwise meta-analysis, risk difference, odds/risk ratios, random-effects estimators, heterogeneity and influence; then NMA, dose-response, DTA, IPD, health economics where educationally appropriate. Pin `metafor`/`metadat` versions; reproduce every released numerical answer in CI, rather than claiming generic R equivalence.

**D. Real evidence-reversal cases:** Add separate documented clinical narratives (such as magnesium/ISIS-4, lidocaine, and other peer-reviewed published reversals) that reveal findings in chronological order. Never invent trial results or conversations or use scripture as scientific evidence. The writing technique can borrow suspense, memorable imagery, curiosity and a carefully earned conclusion.

**E. Expert and language review:** Bring in independent methods reviewers, clinical specialists, accessibility users and native-speaking translators for the full 12 language versions. Display revision dates and pending review status on each module.

**F. Validate improvement in human learners:** Pilot with novices and experienced review authors; preregister rubric, outcome questions and follow-up retention tests (e.g. immediate and 4 weeks). Test transfer to held-out studies, record substantive decisions per learner and independently blinded scoring. Compare against benchmark courses only when comparable access and scoring can be justified.

## Merge gates for every change
- Pull request describes provenance, exact changed behaviour, foreseeable misuse, tested model and source links.
- For each new numerical exercise, a small verified `metadat`/`metafor` source with a reproduction script or equivalent independent oracle.
- Node syntax, real DOM interactions, keyboard access and 12-route preservation in CI; package-native R tests when numerical source changes.
- No failing checks, no fake “verification” and no claim a teaching selection is a clinical review.
- Publish what has **not** been independently verified (clinical education, translations, real-device UX, learning outcomes).
- Never auto-issue certificates or declare learner competence from locally self-assessed practice alone.

## Priority acceptance checks for Evidence Decision Arena
- Real archived data for magnesium (`metadat::dat.egger2001`, k=6 of 16), BCG (`metafor::dat.bcg`, k=6 of 13) and lidocaine (`metadat::dat.hine1989`, k=6).
- At least **57 valid two-to-six-record selections per case** tested for finite estimates and ordered CIs (171 total). One-record and unrecognised IDs are rejected.
- Decision recorded before revealing estimates; invalid/incorrect peer responses cannot complete a case.
- A learner can write and locally save a self-assessed evidence dossier and export a source-linked Markdown document.
- The new content is accessible from modules 3, 7 and 22 of all 12 routes while clearly flagged as an **English-only provisional pilot**.
- The existing story labs, course routes and source computations retain passing regression checks.
