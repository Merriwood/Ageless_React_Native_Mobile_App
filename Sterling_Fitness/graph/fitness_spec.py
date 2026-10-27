"""
fitness_spec.py — Single source of truth for the Sterling Fitness agent graph
(fan-out -> reduce -> cross-check -> synthesize), modelled on the Property DD
diamond graph (Merriwood/propertydd-graph, dd_spec.py v2.8).

The diagram (make_fitness_diagram.py) is generated from the structures below, so
the picture and the spec cannot drift apart. DRAFT v0.1 for owner review: the
lanes are the owner's (2026-10-26); the agents are proposed. No technique, test
or norm is chosen here. Each agent's methods and published sources are set in
its technique table, under the evidence standard (published, current,
empirical, age-appropriate, covering ages 50 and up).

v0.2 (2026-10-27): glossary, the exercise model (body part -> movement ->
exercise) and the ST1 technique table (GLOSSARY, EXERCISE_MODEL, TECHNIQUES,
SOURCES, DEVIATIONS, OPEN_DECISIONS below), and N3 Program Builder with the
program loop S4 -> N3, approved at G1 each period. ST1 stays ONE agent: its method is the same at every
age and only the weekly target changes, so the age band is a parameter N1
supplies, not a second agent. Agents split by age only where the test itself
differs (ST2 grip at 50-59, ST3 Senior Fitness Test from 60).

status: "built" = runs today in fitness-analytics / the diary app;
        "data"  = the data is recorded but nothing scores it;
        "proposed" = not built.
"""

VERSION, DATE = "0.2", "2026-10-27"
ORG = "Sterling Fitness · SterlingLife"
DOC_REF = f"Agent Graph · draft v{VERSION} · {DATE} · for owner review"
CONFIDENTIAL = "Method only: no member results in this file"

TITLE = "Sterling Fitness — Wellness Agent Graph"
SUBTITLE = ("Fan-out to 7 wellness lanes  |  Reduce to one results set per lane  "
            "|  Cross-check and score in code  |  Synthesize to the diary wiki")

# ---------------------------------------------------------------------------
# Lanes. Two-letter codes, because one-letter "G" would collide with the gates.
# ---------------------------------------------------------------------------
CLUSTERS = [
    dict(key="ST", name="Strength Training", color="#4A57C4",
         reducer=("R-ST", "Strength Results Set")),
    dict(key="CA", name="Cardio Training", color="#B0454A",
         reducer=("R-CA", "Cardio Results Set")),
    dict(key="CG", name="Cognition", color="#7B4B94",
         reducer=("R-CG", "Cognition Results Set")),
    dict(key="NU", name="Nutrition", color="#2E7D52",
         reducer=("R-NU", "Nutrition Results Set")),
    dict(key="BA", name="Balance", color="#A9761C",
         reducer=("R-BA", "Balance Results Set")),
    dict(key="HV", name="Hearing / Vision", color="#2C6E8F",
         reducer=("R-HV", "Hearing & Vision Results Set")),
    dict(key="SO", name="Social Engagement", color="#8A5A3C",
         reducer=("R-SO", "Social Results Set")),
]

# ---------------------------------------------------------------------------
# Intake (the top of the diamond)
# ---------------------------------------------------------------------------
INTAKE = [
    dict(code="N0", name="Member Intake & Goals", status="data",
         mandate="Records age, sex, goals and anything that limits exercise. "
                 "Everything downstream is judged against this record.",
         output="MemberContext (age band, sex, goals, limits)"),
    dict(code="N1", name="Scope & Age-Band Profiler", status="proposed",
         mandate="Decides which agents run this quarter and which test fits the "
                 "member's age band (grip at 50-59, Senior Fitness Test from 60). "
                 "A test with no published norms for the age band does not run.",
         output="ScopePlan (agent roster, tests due, dates)"),
    dict(code="N2", name="Evidence Pipeline (service)", status="built",
         mandate="The only writer to the evidence store: app sets and weight "
                 "(derive_fitness.py), quarterly test results (diary form), diary "
                 "entries (masked copy for any language model).",
         output="Evidence store + masked working copy"),
    dict(code="N3", name="Program Builder", status="proposed",
         mandate="Picks the member's exercises for each movement from EXERCISE_MODEL, by "
                 "written rules: limits (N0), age band (N1), rotation schedule. Code only. "
                 "Starts from S4's proposal after the first period.",
         output="Program (exercises per movement, per week)"),
]

# ---------------------------------------------------------------------------
# Fan-out: the lane agents (proposed roster)
# ---------------------------------------------------------------------------
NODES = [
    # Strength Training
    dict(code="ST1", cluster="ST", status="built", name="Training Volume & Muscle Balance",
         bands="50-64 · 65+",
         mandate="Weekly sets and training days per body part, against the target "
                 "for the member's age band (Gate A strength)."),
    dict(code="ST2", cluster="ST", status="built", name="Grip Strength Test (50-59)",
         bands="50-59",
         mandate="Combined grip against US national norms for the age band (Gate B)."),
    dict(code="ST3", cluster="ST", status="built", name="Chair Stand & Arm Curl (60-94)",
         bands="60-94",
         mandate="Senior Fitness Test strength items against age-band norms (Gate B)."),
    dict(code="ST4", cluster="ST", status="proposed", name="Load & Progression",
         mandate="Weight lifted and effort over time. Needs load and reps-in-reserve data."),
    dict(code="ST5", cluster="ST", status="proposed", name="Muscle Loss Screen",
         mandate="Screens for age-related muscle loss (sarcopenia) from strength results."),
    # Cardio Training
    dict(code="CA1", cluster="CA", status="built", name="Aerobic Volume (MET-minutes)",
         mandate="Weekly MET-minutes against the target (Gate A cardio)."),
    dict(code="CA2", cluster="CA", status="built", name="2-Minute Step Test (60-94)",
         mandate="Senior Fitness Test endurance item against age-band norms (Gate B)."),
    dict(code="CA3", cluster="CA", status="proposed", name="Endurance Test (50-59)",
         mandate="Gap today: no endurance test is scored at 50-59."),
    dict(code="CA4", cluster="CA", status="proposed", name="Daily Steps & Activity",
         mandate="Activity outside planned training."),
    dict(code="CA5", cluster="CA", status="proposed", name="Heart Rate & Intensity",
         mandate="Effort level during cardio. Needs heart-rate data."),
    # Cognition
    dict(code="CG1", cluster="CG", status="proposed", name="Cognitive Screen",
         mandate="A validated screening test. Positive results need a qualified reviewer (G2)."),
    dict(code="CG2", cluster="CG", status="proposed", name="Mental Activity",
         mandate="Learning, reading and similar activity, from the diary."),
    dict(code="CG3", cluster="CG", status="proposed", name="Sleep",
         mandate="Sleep length and regularity."),
    dict(code="CG4", cluster="CG", status="proposed", name="Modifiable Risk Factors",
         mandate="Published modifiable risk factors. Derived health inference: §1.9 applies."),
    # Nutrition
    dict(code="NU1", cluster="NU", status="data", name="Body Weight Trend",
         mandate="Weight is recorded daily in the app; nothing scores it yet."),
    dict(code="NU2", cluster="NU", status="proposed", name="Protein Intake",
         mandate="Protein per kg of body weight. Needs a food record."),
    dict(code="NU3", cluster="NU", status="proposed", name="Diet Quality",
         mandate="A validated diet-quality score."),
    dict(code="NU4", cluster="NU", status="proposed", name="Undernutrition Screen",
         mandate="A validated screen for poor nutrition in older adults."),
    # Balance
    dict(code="BA1", cluster="BA", status="proposed", name="Single-Leg Stance",
         mandate="Static balance timed test against age-band norms."),
    dict(code="BA2", cluster="BA", status="proposed", name="8-Foot Up-and-Go",
         mandate="Senior Fitness Test agility and balance item."),
    dict(code="BA3", cluster="BA", status="proposed", name="Fall Risk Screen",
         mandate="A published fall-risk screen. A positive result is a safety flag."),
    dict(code="BA4", cluster="BA", status="proposed", name="Balance Practice (yoga, tai chi)",
         mandate="Balance and mobility sessions. Today these are recorded but unscored."),
    # Hearing / Vision
    dict(code="HV1", cluster="HV", status="proposed", name="Hearing Screen",
         mandate="A validated self-administered hearing test or questionnaire."),
    dict(code="HV2", cluster="HV", status="proposed", name="Vision Screen",
         mandate="A validated vision check or questionnaire."),
    dict(code="HV3", cluster="HV", status="proposed", name="Exams & Devices",
         mandate="Dates of last hearing and eye exams, and devices in use."),
    # Social Engagement
    dict(code="SO1", cluster="SO", status="proposed", name="Loneliness Scale",
         mandate="A validated short loneliness scale."),
    dict(code="SO2", cluster="SO", status="proposed", name="Social Network Size",
         mandate="A validated social-network scale."),
    dict(code="SO3", cluster="SO", status="proposed", name="Social Activity",
         mandate="Time with others, from the diary."),
]

# ---------------------------------------------------------------------------
# Cross-check and scoring. Two loops, both drawn: the re-test loop (X3, inside a
# period) and the program loop (S4 -> N3, once per period, so one run has no cycle).
# ---------------------------------------------------------------------------
CROSS = [
    dict(code="X0", name="Citation & Norms Verifier",
         mandate="Every result names its protocol and norm source; the member's age "
                 "is inside the norm's age band; the norms review is not overdue."),
    dict(code="X1", name="Cross-Lane Contradiction Detector",
         mandate="Finds results that disagree across lanes, such as high training "
                 "volume with falling grip, or weight loss with low protein."),
    dict(code="X2", name="Scoring Engine (code only)",
         mandate="Gate A wellness score, Gate B z-scores and Sterling Status. "
                 "Python only; no language model sets a number."),
    dict(code="X3", name="Re-Test Controller",
         mandate="A test older than 120 days, or thin evidence, sends a re-test back "
                 "to G1; the new result re-enters through N2."),
]

# ---------------------------------------------------------------------------
# Synthesis (the bottom point of the diamond)
# ---------------------------------------------------------------------------
SYNTH = [
    dict(code="S1", name="925 Score", status="built",
         mandate="Monthly Gate A score and Sterling Status."),
    dict(code="S2", name="Fitness Assessment", status="built",
         mandate="Quarterly test results against age-band norms, lane by lane."),
    dict(code="S3", name="Wiki Writer", status="built",
         mandate="fitness_wiki.py writes the diary wiki pages from the scores; "
                 "approved text blocks only."),
    dict(code="S4", name="Plan & Referrals", status="proposed",
         mandate="Next period's program, targets and tests due, and any referral a safety "
                 "flag needs. The program goes back to N3 and waits for G1."),
]

DELIVERABLE = ("DIARY WIKI  ->  Sterling Status  ·  925 Score  ·  Fitness Assessment  ·  "
               "Lane results with sources  ·  Next-quarter plan  ·  Referrals")

# ---------------------------------------------------------------------------
# Human-in-the-loop gates
# ---------------------------------------------------------------------------
GATES = [
    dict(code="G1", name="Plan Approval Gate",
         rule="The member approves the program, agent roster, tests due and targets before anything runs"),
    dict(code="G2", name="Screen Review Gate",
         rule="A qualified reviewer confirms any positive health screen before it is reported"),
    dict(code="G3", name="Status Gate",
         rule="Code sets Sterling Status; any safety flag goes to referral first"),
    dict(code="G3A", name="Report Sign-Off Gate",
         rule="The owner approves page layout and wording before the wiki is written"),
    dict(code="G4", name="Release Gate",
         rule="Nothing leaves the member's local store without prior written authorization (§1.9)"),
]

# ---------------------------------------------------------------------------
# Control plane (cross-cutting services, the left rail)
# ---------------------------------------------------------------------------
CONTROL = [
    dict(name="Evidence Ledger",
         note="Source record, date and protocol on every result."),
    dict(name="Norms Library",
         note="Cited norms, reviewed yearly."),
    dict(name="Capture Layer",
         note="App, test form, diary."),
    dict(name="Assumption Register",
         note="Placeholders stay labelled."),
    dict(name="Safety Flags",
         note="Positive screens go to G2."),
    dict(name="Privacy Guard",
         note="Health data stays local."),
]

OFFLINE_JOBS = ("Offline, not graph nodes: the yearly norms review, and evaluation "
                "against recorded tests.")

# ---------------------------------------------------------------------------
# Sources, by id. Every technique step names its sources by these ids.
# ---------------------------------------------------------------------------
SOURCES = {
    "WHO2020": dict(
        cite="Bull FC, Al-Ansari SS, Biddle S, et al. World Health Organization 2020 "
             "guidelines on physical activity and sedentary behaviour. Br J Sports Med "
             "2020;54(24):1451-1462. doi:10.1136/bjsports-2020-102955",
        covers="Adults 18-64 and older adults 65+, separate recommendations",
        used="Muscle-strengthening work on all major muscle groups, 2 or more days a week",
        checked="Recommendation known; re-read the text before approval"),
    "PAG2018": dict(
        cite="Piercy KL, Troiano RP, Ballard RM, et al. The Physical Activity Guidelines "
             "for Americans. JAMA 2018;320(19):2020-2028. doi:10.1001/jama.2018.14854",
        covers="US adults and older adults",
        used="Same 2-days-a-week, all-major-muscle-groups rule as WHO2020",
        checked="Recommendation known; re-read the text before approval"),
    "NSCA2019": dict(
        cite="Fragala MS, Cadore EL, Dorgo S, et al. Resistance training for older adults: "
             "position statement from the National Strength and Conditioning Association. "
             "J Strength Cond Res 2019;33(8):2019-2052. doi:10.1519/JSC.0000000000003230",
        covers="Older adults (the NSCA's first statement for this group)",
        used="2-3 sets per major muscle group, 2-3 sessions a week",
        checked="Citation confirmed (PubMed 31343601). Set and session figures confirmed "
                "only through a published summary; read the full text before approval"),
    "BORDE2015": dict(
        cite="Borde R, Hortobágyi T, Granacher U. Dose-response relationships of resistance "
             "training in healthy old adults: a systematic review and meta-analysis. "
             "Sports Med 2015;45(12):1693-1720. doi:10.1007/s40279-015-0385-9",
        covers="25 randomized trials, mean age 65 and over",
        used="2-3 sets per exercise; 3 sessions a week",
        checked="Citation and inclusion rule confirmed. Dose figures from secondary "
                "sources only, and they disagree on intensity (50-70% vs 70-79% of 1RM), "
                "so intensity is not used. Read the full text (PMC4656698) before approval"),
    "SCHOEN2017": dict(
        cite="Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly "
             "resistance training volume and increases in muscle mass: a systematic review "
             "and meta-analysis. J Sports Sci 2017;35(11):1073-1082. "
             "doi:10.1080/02640414.2016.1210197",
        covers="Mostly young adults: NOT age-appropriate under the evidence standard",
        used="Context only: sets per muscle group per week is the standard volume unit; "
             "more weekly sets gave more growth up to 10+",
        checked="Findings confirmed through the authors' published comments"),
    "RALSTON2017": dict(
        cite="Ralston GW, Kilgore L, Wyatt FB, Baker JS. The effect of weekly set volume on "
             "strength gain: a meta-analysis. Sports Med 2017;47(12):2585-2601. "
             "doi:10.1007/s40279-017-0762-7",
        covers="Mostly young adults: NOT age-appropriate under the evidence standard",
        used="Context only: graded dose-response between weekly sets and strength",
        checked="Citation and finding confirmed (PubMed 28755103)"),
}

# ---------------------------------------------------------------------------
# Glossary and code key: every term is defined once here and used the same
# way in every document. The tables page prints both at the top.
# ---------------------------------------------------------------------------
GLOSSARY = [
    ("Body part", "body_part", "What gets scored, e.g. Legs."),
    ("Movement", "movement", "The kind of motion, e.g. Knee bend."),
    ("Main muscles", "muscles", "The muscles a movement works. Described, never scored."),
    ("Exercise", "exercise_id", "What the member does and logs, e.g. Leg Press (legPress). The id never changes; the name may."),
    ("Set", "sets", "One round of an exercise, as logged in the app."),
    ("Age band", "age_band", "The member's age range. It picks targets and tests."),
    ("Target", "target", "The weekly amount a body part should get. Same for everyone in "
                         "an age band."),
    ("Program", "program", "The exercises assigned to one member for a period. Built by "
                           "code (N3), approved by the member (G1)."),
]

CODE_KEY = [
    ("N0-N3", "Intake: member record, age-band planner, evidence store, program builder"),
    ("ST1-ST5 ...", "Agents, by lane (ST = Strength, CA = Cardio, ...)"),
    ("R-xx", "Results set for one lane"),
    ("X0-X3", "Checks: sources, contradictions, scoring, re-tests"),
    ("S1-S4", "Outputs: 925 score, assessment, wiki, plan"),
    ("G1-G4", "Approval gates: a person must approve before work continues"),
    ("D# / O#", "Deviation (code differs from this table) / open owner decision"),
]

# ---------------------------------------------------------------------------
# Exercise model (proposed, documents only). Body part -> Movement -> Exercise.
# Three body parts. The scoring code still uses four groups (push and pull
# separate): see D5. Exercise ids are the app's ids (exercises.ts). Muscles
# describe a movement; they are not scored. Every row needs a source (rule 6).
# ---------------------------------------------------------------------------
BODY_PARTS = [
    ("upper_body", "Upper body"),
    ("core", "Core"),
    ("legs", "Legs"),
]

# One dict per movement. side: "push" or "pull" (upper body only, see O4).
# exercises: (exercise_id, name, where, note). where: "app" = in the app today,
# "logged" = logged but skipped by the code (D4), "new" = not in the app yet.
# The app's own ids stay as they are (rule 2); new ids use the same camelCase.
EXERCISE_MODEL = [
    # Upper body
    dict(part="upper_body", side="push", movement="Push forward",
         muscles="Chest, front shoulders, triceps",
         exercises=[("chestPress", "Chest Press", "app", ""),
                    ("pushUp", "Push-up", "logged", ""),
                    ("wallPushUp", "Wall Push-up", "new", "")]),
    dict(part="upper_body", side="push", movement="Push overhead",
         muscles="Shoulders, triceps",
         exercises=[("military", "Overhead Press", "app", "App name today: Military"),
                    ("seatedDumbbellPress", "Seated Dumbbell Shoulder Press", "new", "")]),
    dict(part="upper_body", side="push", movement="Arm straighten",
         muscles="Triceps",
         exercises=[("triceps", "Triceps Extension", "app", "App name today: Triceps"),
                    ("tricepsPushdown", "Triceps Pushdown", "new", "")]),
    dict(part="upper_body", side="pull", movement="Pull down",
         muscles="Upper back (lats), biceps",
         exercises=[("lat", "Lat Pulldown", "app", "App name today: Lat"),
                    ("assistedPullUp", "Assisted Pull-up", "new", "")]),
    dict(part="upper_body", side="pull", movement="Pull back",
         muscles="Middle back, rear shoulders, biceps",
         exercises=[("row", "Seated Row", "app", "App name today: Row"),
                    ("bandRow", "Band Row", "new", "")]),
    dict(part="upper_body", side="pull", movement="Arm bend",
         muscles="Biceps",
         exercises=[("bicepCurls", "Biceps Curl", "app", ""),
                    ("hammerCurl", "Hammer Curl", "new", "")]),
    dict(part="upper_body", side="pull", movement="To confirm (O3)",
         muscles="To confirm",
         exercises=[("overheadPull", "Overhead Pull", "app", "What this exercise is: O3"),
                    ("crunch", "Shoulder Crunch", "app", "App name today: Crunch. Not a "
                                                         "stomach crunch. O3")]),
    # Core
    dict(part="core", side="", movement="Trunk curl",
         muscles="Front stomach muscles (rectus abdominis)",
         exercises=[("abs", "Ab Crunch", "app", "App name today: Abs"),
                    ("abMachineCrunch", "Ab Machine Crunch", "new", "")]),
    dict(part="core", side="", movement="Trunk twist and side bend",
         muscles="Side stomach muscles (obliques)",
         exercises=[("sideBend", "Side Bend", "new", ""),
                    ("standingCableTwist", "Standing Cable Twist", "new", "")]),
    dict(part="core", side="", movement="Back raise",
         muscles="Lower back",
         exercises=[("birdDog", "Bird Dog", "new", ""),
                    ("backExtension", "Back Extension", "new", "")]),
    dict(part="core", side="", movement="Hold steady",
         muscles="Deep stomach muscles, lower back",
         exercises=[("plank", "Plank", "new", ""),
                    ("wallPlank", "Wall Plank", "new", "")]),
    # Legs
    dict(part="legs", side="", movement="Knee bend",
         muscles="Quadriceps, glutes",
         exercises=[("legPress", "Leg Press", "app", ""),
                    ("squat", "Squat", "logged", ""),
                    ("sitToStand", "Sit-to-Stand", "new", "")]),
    dict(part="legs", side="", movement="Hip bend",
         muscles="Glutes, hamstrings",
         exercises=[("hipBridge", "Hip Bridge", "new", ""),
                    ("hipHinge", "Hip Hinge", "new", ""),
                    ("deadlift", "Deadlift", "new", "")]),
    dict(part="legs", side="", movement="Knee curl",
         muscles="Hamstrings",
         exercises=[("hamstringCurl", "Hamstring Curl", "new", "")]),
    dict(part="legs", side="", movement="Leg out to the side",
         muscles="Hip abductors (glute medius, tensor fasciae latae)",
         exercises=[("sideLegRaise", "Side Leg Raise", "new", ""),
                    ("hipAbductionMachine", "Hip Abduction Machine", "new", "")]),
    dict(part="legs", side="", movement="Leg in",
         muscles="Adductors (inner thigh)",
         exercises=[("hipAdductionMachine", "Hip Adduction Machine", "new", ""),
                    ("ballSqueeze", "Ball Squeeze", "new", "")]),
    dict(part="legs", side="", movement="Knee lift",
         muscles="Hip flexors",
         exercises=[("standingKneeRaise", "Standing Knee Raise", "new", ""),
                    ("marchInPlace", "March in Place", "new", "")]),
    dict(part="legs", side="", movement="Heel raise",
         muscles="Calves",
         exercises=[("heelRaise", "Heel Raise", "new", "")]),
    dict(part="legs", side="", movement="Toe raise",
         muscles="Shin (tibialis anterior)",
         exercises=[("toeRaise", "Toe Raise", "new", "")]),
]

EXERCISE_RULES = [
    "Score by body part. Log by exercise.",
    "Each exercise has a permanent id. Never match logs by name.",
    "Compare weight and progress only within the same exercise (ST4).",
    "Code builds the program from written rules (N3). A language model never does.",
    "The member approves the program before it starts (G1).",
    "Score against targets, never against the program, so changing exercises keeps "
    "the score consistent.",
    "Every movement and exercise needs a published source before it ships.",
]

# ---------------------------------------------------------------------------
# Technique tables (FIT-T). One entry per agent. Four columns per step:
# step, what it does, rule or source, status. Longer notes go to an appendix.
# An empty source list means a program rule set by the owner, not research.
# ---------------------------------------------------------------------------
TECHNIQUES = {
    "ST1": dict(
        purpose="Checks that each body part gets enough strength work, often enough, "
                "for the member's age band. One agent for all ages: only the target "
                "changes, and N1 supplies the band.",
        steps=[
            dict(id="ST1.1", step="Load target and program",
                 does="Reads the age band from N1 and loads that band's weekly targets, and "
                      "the member's approved program from N3. Stops and reports if the band "
                      "has no approved target.",
                 sources=["NSCA2019", "BORDE2015"], status="proposed",
                 note="First, because the band is known before ST1 runs. 65+: 2-3 sets per "
                      "body part per session, 2-3 sessions a week, so 4-9 sets a week. "
                      "Today one placeholder table for all ages: legs 10, push 8, pull 8, "
                      "core 5. See D3, O1, O2."),
            dict(id="ST1.2", step="Find body part",
                 does="Looks up the body part of each logged exercise in the exercise model.",
                 sources=[], status="built",
                 note="The guidelines (WHO2020, PAG2018) ask for all major muscle groups; "
                      "the three body parts are the program's own split. See D4, D5, O3."),
            dict(id="ST1.3", step="Count sets",
                 does="Adds up sets per body part, Sunday to Saturday.",
                 sources=[], status="built",
                 note="Every logged set counts. See D1."),
            dict(id="ST1.4", step="Count days",
                 does="Counts the days each body part was trained. Target: 2 or more.",
                 sources=["WHO2020", "PAG2018"], status="proposed",
                 note="Same target for every age band. Not scored today. See D2."),
            dict(id="ST1.5", step="Score",
                 does="Per body part: sets / target, capped at 1. Score = 100 x the "
                      "average of the three.",
                 sources=[], status="built",
                 note="The cap stops extra work on one body part from making up for one "
                      "that was skipped."),
            dict(id="ST1.6", step="Compare with program",
                 does="Counts how many of the program's exercises were done this week.",
                 sources=[], status="proposed",
                 note="Reported, not scored, so rotating exercises never changes the score. "
                      "See O5."),
            dict(id="ST1.7", step="Report",
                 does="Sends sets, days, age band, target, the target's sources and the "
                      "program count to R-ST.",
                 sources=[], status="proposed",
                 note="X0 needs the sources to check every result."),
        ]),
}

DEVIATIONS = [
    dict(id="D1", agent="ST1",
         text="The fitness_analytics.py docstring describes a 'hard set' rule (3 or fewer "
              "reps in reserve, or at least 60% of estimated 1RM). The code counts every "
              "logged set, because the app records no weight or effort. Fix: reword the "
              "docstring to match the code. Weight and effort belong to ST4."),
    dict(id="D2", agent="ST1",
         text="Training days per body part (ST1.4) are not counted or scored."),
    dict(id="D3", agent="ST1",
         text="The weekly targets are one placeholder table for every age, with no source."),
    dict(id="D4", agent="ST1",
         text="Squats and push-ups are logged but skipped by the code (EXCLUDED_EXERCISES). "
              "The exercise model counts them."),
    dict(id="D5", agent="ST1",
         text="The scoring code uses four groups (lower_body, upper_push, upper_pull, core) "
              "and averages four. The model has three body parts (legs, upper_body, core)."),    dict(id="D6", agent="ST1",
         text="The scoring code matches logs by the app's names (e.g. 'Military'), not by id. "
              "Switch matching to ids before any app name changes, or logged sets stop counting."),
]

OPEN_DECISIONS = [
    dict(id="O1", agent="ST1",
         text="Ages 50-64: no study on weekly sets was found for this age group. "
              "Recommended: use the 65+ range (4-9) and label it 'not validated under 65'. "
              "It is the lower, safer dose."),
    dict(id="O2", agent="ST1",
         text="The weekly target. Recommended: 6 sets per body part, e.g. 3 sets on 2 days "
              "or 2 sets on 3 days."),
    dict(id="O3", agent="ST1",
         text="Which movement are Overhead Pull and Crunch (shoulder crunch)? Both count "
              "as upper body, pull today."),
    dict(id="O4", agent="ST1",
         text="Upper body now holds both push and pull. One target for the whole upper body "
              "could be met by pull work alone. Recommended: the upper body target counts "
              "push and pull separately (6 sets each), using each movement's side."),
    dict(id="O5", agent="ST1",
         text="Should following the program count toward the score? Recommended: no. "
              "Report it only (ST1.6), so the score means the same thing whichever "
              "exercises a member is assigned."),
]
