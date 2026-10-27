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

status: "built" = runs today in fitness-analytics / the diary app;
        "data"  = the data is recorded but nothing scores it;
        "proposed" = not built.
"""

ORG = "Sterling Fitness · SterlingLife"
DOC_REF = "Agent Graph · draft v0.1 · 2026-10-26 · for owner review"
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
]

# ---------------------------------------------------------------------------
# Fan-out: the lane agents (proposed roster)
# ---------------------------------------------------------------------------
NODES = [
    # Strength Training
    dict(code="ST1", cluster="ST", status="built", name="Training Volume & Muscle Balance",
         mandate="Weekly sets per muscle group against targets (Gate A strength)."),
    dict(code="ST2", cluster="ST", status="built", name="Grip Strength Test (50-59)",
         mandate="Combined grip against US national norms for the age band (Gate B)."),
    dict(code="ST3", cluster="ST", status="built", name="Chair Stand & Arm Curl (60-94)",
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
# Cross-check, scoring and the one legal cycle
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
         mandate="Next quarter's targets, tests due, and any referral a safety flag needs."),
]

DELIVERABLE = ("DIARY WIKI  ->  Sterling Status  ·  925 Score  ·  Fitness Assessment  ·  "
               "Lane results with sources  ·  Next-quarter plan  ·  Referrals")

# ---------------------------------------------------------------------------
# Human-in-the-loop gates
# ---------------------------------------------------------------------------
GATES = [
    dict(code="G1", name="Plan Approval Gate",
         rule="The member approves the agent roster, tests due and targets before any test runs"),
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
