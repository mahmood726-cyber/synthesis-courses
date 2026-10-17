# Synthesis Courses — External Benchmark and Multi-Persona Review
_Research date: 17 October 2026. Prepared from published course descriptions and the connected Synthesis repository. Not an independent evaluation, accreditation decision, or declaration of world ranking._

## Executive verdict

**Synthesis has a credible differentiator:** real small-k `metadat`/`metafor` exercises embedded in 25 flagship lessons, three reproducible evidence-decision cases, a six-stage Research Studio using actual AllMeta software, downloadable source-linked reports, and preservation of 12 legacy course-language routes. On the latest audited main branch, numerical checks are pinned to package-native R for Hine, Berkey and selected magnesium datasets, and its frontend suite had **46 passing automated tests**.

**The biggest unclosed gap is human scientific and pedagogical validation.** A JS test proving a button works does not demonstrate that a learner can conduct a new systematic review. Three or four buttons are not equivalent to a well-designed intervention. The existing Research Studio's A/B screening passes happen locally on one device and cannot establish independent human participation. This PR adds a separate, file-exchange *facility* for real separate-device human passes; it does not claim anyone has used it independently yet.

## Benchmark methodology (auditable but necessarily incomplete)

Evidence types:
- **D** — official provider's public current course description (not hands-on access to all restricted lessons).
- **R** — repository source inspection and recently passing project CI, not observed learner outcomes.
- **U** — unverified/unmeasured, never treated as absence.

Comparable assessment dimensions: (1) full systematic-review workflow, (2) authentic data manipulation, (3) feedback and transfer tasks, (4) supervised expert instruction, (5) genuine human collaboration, (6) clinical/statistical fidelity, (7) accessibility and languages, (8) measured learner outcomes.

**No cross-provider total score or first-place ranking is justified:** the published descriptions do not expose standardised interaction counts, attrition, learner pre/post tests, expertise assessment, accessible content or independent external assessments for all competitors. Competitor characteristics not documented publicly are recorded as **U**, not zero.

## Competitors and documented strengths

| Programme | Documented offer / source | Relative benchmark for Synthesis | Evidence |
|---|---|---|---|
| **Cochrane Interactive Learning** | 14 independent modules and more than 20 hours covering systematic reviews, GRADE, network meta-analysis, equity, qualitative evidence synthesis, rapid and living reviews. It documents subscriptions and certificates. https://www.cochrane.org/products-and-services/cochrane-interactive-learning | Match comprehensive methodology, reliable editorial updating, advanced theory, certificates only after legitimate assessment. Actual controlled feature-by-feature usage comparison **U**. | D |
| **Campbell Collaboration / CMU Open Learning Initiative** | Self-paced course, **40 listed modules** from question through searching, screening, coding, effect measures, synthesis and updating, with formative assessments/immediate feedback; instructor access available. https://oli.cmu.edu/courses/systematic-reviews-and-meta-analysis/ and https://www.campbellcollaboration.org/2023/05/first-systematic-review-online-course-for-social-science/ | Match learning-science scaffolding, misconception feedback, comprehensive transferable skills and instructor visibility. Actual lesson interaction density **U**. | D |
| **JBI Comprehensive Systematic Review Training** | Expert-supported one-, three- or five-day practical programme, including focused questions, searching, critical appraisal, synthesis, and development of a review protocol. https://jbi.global/training/systematic-review-training | Match substantive mentorship and expert review of actual student work; browser simulations alone are not equivalent. | D |
| **Covidence Academy** | Articles, webinars and practical guidance for review protocol, searching, independent screening, conflict resolution, risk of bias and extraction. https://academy.covidence.org/learn/ and https://academy.covidence.org/ | Match operational team workflow, reviewer adjudication and research-project audit trails. The academy and the Covidence production platform are **different products**; do not confuse them. | D |
| **Oxford Centre for Evidence-Based Medicine — Meta-analysis** | University module covering basic and advanced statistical methods; offered as a short course or within an MSc programme. https://www.cebm.ox.ac.uk/study-with-us/meta-analysis | Match sound advanced methods, instructor assessment, formal academic standards and defensible examples. Course-level student outcomes **U**. | D |
| **Synthesis + AllMeta** | 25 in-lesson real data practicles, three BCG/magnesium/lidocaine source-linked investigation types, 25 Mission Lab exercises, six-stage simulated review with AllMeta integration, 12 *existing routes* (new English prompts unreviewed). Source: https://github.com/mahmood726-cyber/synthesis-courses and https://github.com/mahmood726-cyber/allmeta | Strength: browser-native manipulation of traceable archived event counts with export and R reproduction. Gap: real human credentials, real external review, evaluated outcomes, professionally translated new content and end-to-end deployed Pages QA. | R |

**Positioning:** Synthesis is unusual for the combination of real archived trial events, multiple methods apps, branching evidence narratives and browser-only provenance records. Claims that it beats Cochrane, JBI, Campbell, Covidence Academy or Oxford are **not established**. Course release should claim its actual capabilities rather than “most interactive ever.”

## Structured multi-persona critique — simulated expert lenses, not independent people

These are analytical lenses generated to identify failures. **No real external methodologist, reviewer, statistician, learner, educator or accessibility auditor contributed comments to this report.** No quotations or ratings below are misattributed to an external human.

| Lens | What they would examine | Finding against Synthesis source and public competitors | Priority |
|---|---|---|---|
| **Novice medical student** | Does the first 20 minutes explain PICO, counts, eligibility and what to click without overwhelming? | Many entry points (26-course hub, 25 missions, Decision Arena, Research Studio, AllMeta) create navigation and terminology load. There is no validated novice onboarding assessment. | **High** — add diagnostic starter route and observed beginner usability |
| **Cochrane-style methods editor** | Did screening use prespecified eligibility, full-text sourcing and verifiable exclusions? | The six magnesium rows are a transparent historical *subset*, but archive counts alone cannot support final eligibility. A self-asserted completed capstone is not a scientific review. | **Critical** — expert-reviewed full-text case packs, protocol deviation ledger and held-out transfer tasks |
| **R/metafor statistician** | Does every estimator/CI/input scale agree with a versioned oracle, including sparse data? | Good pinned R checks for Hine, Berkey and magnesium, and RD-vs-Peto distinctions. Across the broader 128-entry AllMeta catalog, parity and all model interactions have **not** been independently verified here. | **High** — version lock and model-specific oracle suites before allowing advanced claims |
| **Evidence librarian** | Can learners run, document and replay a genuinely comprehensive, dated search? | AllMeta search links and screening simulations are helpful. An archive of six trial rows is **not** independent database retrieval, deduplication or documented comprehensive searching. | **High** — real search assignments with a validated answer key and librarian review |
| **Learning scientist / facilitator** | Does interactive activity improve unseen-task transfer and delayed retention? | The simulator has checkable actions and feedback, but no preregistered comparative study showing learner improvement, no blinded capstone ratings and no validated mastery standard. | **Critical** — pilot, preregistration, external graders and retention follow-up |
| **Accessibility and localisation reviewer** | Could a screen-reader or RTL-language learner complete the same work independently? | Keyboard controls and mobile CSS exist, but no actual assistive-technology test or native-speaker methods review of new English-only practicals. Twelve routes are not equivalent to twelve verified translations of the new content. | **High** — WCAG audit and expert reviews for each language |
| **Research-team facilitator** | Do Reviewer A and Reviewer B actually make separate decisions without seeing each other's answers? | Research Studio A/B passes are separate *views*, not two authenticated humans. The new Review Exchange makes self-declared independent file export, two-pack import and adjudication possible across devices; identity and independence still require human governance. | **High** — observed real two-reviewer pilot; retain sign-off outside app |
| **Clinical research supervisor** | Are historical treatment results and applicability framed responsibly? | Case stories label real archive counts, model assumptions and retrospective selection. Need specialist review of wording to ensure no classroom point estimate is mistaken for modern clinical guidance. | **High** — independent clinical sign-off of released case narratives |

### Multi-person review vs. multi-persona review

**Multi-persona:** the eight perspectives above are *simulated critiques* from one AI system. Their purpose is to expose weaknesses, not certify education quality or scientific correctness.

**Multi-person:** independent humans complete their own screening/teaching review files, which are later compared and adjudicated. The new [Two-Person Review Exchange](review-exchange.html) supports that offline file-mediated process for six authentic magnesium archive rows, with reasons, three possible decisions, agreement rate, Cohen's κ where defined and final audit exports. It does not verify the identities, qualifications, signatures, chronology or independence of the humans. Genuine reviewers must be recruited and supervised separately.

## Real independent review protocol (not yet executed)

1. **Recruit** at least two external evidence-synthesis methodologists, one information specialist, one medical statistician, one educator, one screen-reader/keyboard tester, two students new to meta-analysis, and fluent expert reviewers for each translation. Record qualifications and conflicts; do not invent participants.
2. **Blind** individuals to each other's responses. Give each identical release SHA, dated source manifest and primary study documents, not only effect-count rows. Ask for an independent methods/accuracy review and a reproducible written rubric.
3. **Adjudicate** in a separate meeting, preserving original files, conflicting judgements, rationale and resolution. Use Cohen's κ descriptively, not as a threshold for competence.
4. **Verify technical findings** in R with pinned package versions, held-out datasets and full-method assumptions. Separate coding correctness from review eligibility and clinical validity.
5. **Pilot teaching effectiveness** with novices and experienced reviewers. Predefine a transfer task on unseen trials, two blinded expert graders and a delayed retention task. Use a sample-size calculation for an adequately powered controlled study; do not claim success from a small convenience pilot.

### Proposed held-out assessment (100 points; provisional rubric, not psychometrically validated)

| Domain | Points | Observable outcome |
|---|---:|---|
| Question, protocol and deviations | 15 | Dated PICO, eligibility rule, endpoint and transparent deviations |
| Searching and provenance | 15 | Reproducible strategy, record accountability, references and missing sources |
| Independent screening and adjudication | 15 | Corrected, justified decisions with auditable reasons |
| Data extraction | 10 | Source-consistent numerator/denominator and missing-data handling |
| Appropriate meta-analysis | 20 | Correct effect family, model, code and interval reproduction |
| Risk of bias and certainty | 15 | Domain-level judgements supported by primary sources |
| Interpretation and reproducibility | 10 | Cautious conclusion, scripts and unresolved limitations |

Prespecified primary comparison: blinded expert score on an **unseen** small review. Secondary: critical-error frequency, time to valid solution, participant satisfaction, task completion and four-week retention. Scores, thresholds and rubrics require independent calibration before research claims.

## Prioritised course-development decisions

**P0:** Human review of screening and clinical cases; exclude unsupported competency certificates; source-level transfer testing; comprehensive search audit; real independent two-person pilot; R oracle checks.

**P1:** 15-minute beginner diagnostic lesson; guided pathways novice vs advanced; reviewed translation of new English content; a facilitator dashboard with opt-in anonymised class results (if privacy and consent are addressed).

**P2:** Adaptive practice derived from *observed* misconceptions and blinded human scoring, not generated confidence; head-to-head trial against a named comparator with equivalent materials and predefined outcome thresholds.

## Evidence, reproducibility and limits

- Synthesis: https://github.com/mahmood726-cyber/synthesis-courses ; benchmark source file `WORLD_CLASS_INTERACTIVE_COURSE_BENCHMARK.md`; human-file exchange code `review-exchange-core.js`.
- Published Campbell/OLI course details and educational design: https://oli.cmu.edu/courses/systematic-reviews-and-meta-analysis/ and https://www.campbellcollaboration.org/2023/05/first-systematic-review-online-course-for-social-science/
- Cochrane: https://www.cochrane.org/products-and-services/cochrane-interactive-learning
- JBI: https://jbi.global/training/systematic-review-training
- Covidence: https://academy.covidence.org/learn/
- Oxford: https://www.cebm.ox.ac.uk/study-with-us/meta-analysis

**Remaining verification:** protected/access-controlled modules were not independently completed; competitors were not asked to participate; no paid course subscriptions, user-identity checks, learning trials or external human peer review were performed. Public descriptions and source code form the basis for this preliminary benchmark, nothing more.

## Hourly follow-up: novice entry and meaningful interaction (17 October 2026)

This is a **new iteration of the simulated multi-persona critique**, not feedback from independent external people. The original eight-lens review identified novice cognitive overload as a High priority. The course hub, 25 Mission Lab activities, 25 real-data labs, Evidence Decision Arena, Research Studio and Reviewer Exchange all remain valuable, but a first-time learner needs an explicit first 10–15 minutes.

**Implemented response:** [Start Here — six real-data decisions](guided-start.html), a source-linked guided path grounded in three established \`metadat\` records: Hine 1989 (six mortality trials; 2/39 vs 1/43 in the first study), Berkey 1998 (five trials and ten correlated outcome rows), and magnesium-after-MI Egger 2001 (separate Peto odds-ratio teaching example). The six actions require *source interpretation, an actual numerical risk difference, a prereveal influence prediction, cautious I² interpretation, a correct effect-family choice, and recognition of dependent outcomes*. Learners receive immediate reasoned feedback, a before/after source-derived risk-difference uncertainty plot, private first-attempt history and links to the appropriate existing exercises.

**Simulated reviewer lenses and release conditions:**

| Perspective | Specific challenge to this change | Evidence available now | Unresolved requirement |
|---|---|---|---|
| Beginner | Will a novice actually understand risk difference and confidence intervals before joining the major simulations? | Sequential choices and immediate explanations; no enforced timer or account | Observe 5–10 novices without assistance; collect task success, time, confusion and retention |
| Evidence-methods reviewer | Does the source table get mistaken for a complete clinical review? | Every task cites original R dataset and notes that trial eligibility needs independent source assessment | External methodologist review of every answer and narrative |
| Statistician | Is the individual-trial RD and all-six source benchmark exactly reproducible? | Hine \`metadat\` rows and existing R reference script; automated unit checks are planned/required in PR | Independent check of effect family, estimator, variance convention and paired 5-vs-6 comparison |
| Learning scientist | Is the new assessment truly diagnostic and psychometrically sound? | First-attempt errors trigger specific practice recommendations; no competence badge | Calibration, held-out validation and controlled learning-outcome comparison |
| UX/accessibility | Can keyboard and assistive-technology learners complete it? | Native buttons/input, status messaging, focusable exercises, reduced-motion support, JSDOM 12-route checks | Real NVDA/VoiceOver and mobile usability audit |
| Multilingual learner | Does navigation imply the new content is professionally translated? | Existing 12 language routes preserved; English-only newcomer module marked provisional | Expert native-speaker and methods reviews of all translated new prompts |

**Discriminating standard:** a learner manipulating genuine trial counts and explaining an effect has made a substantive interaction; pressing Next does not count. This adds a documented onboarding experience, **not** evidence that Synthesis outperforms Cochrane, JBI, Campbell/OLI, Covidence Academy or Oxford. Genuine human validation remains the critical gap.

Current comparator provider pages reviewed 17 October 2026: Cochrane (>20 hours, 14 modules) https://www.cochrane.org/products-and-services/cochrane-interactive-learning ; Campbell/OLI (40 listed modules) https://oli.cmu.edu/courses/systematic-reviews-and-meta-analysis/ ; JBI (expert-led practical protocol) https://jbi.global/training/systematic-review-training ; Covidence Academy (workflow articles/webinars) https://academy.covidence.org/learn/ ; Oxford meta-analysis short course https://www.cebm.ox.ac.uk/study-with-us/meta-analysis .

