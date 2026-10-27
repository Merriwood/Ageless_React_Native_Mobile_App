"""
make_fitness_diagram.py — renders the agent graph in fitness_spec.py to one SVG.
Adapted from make_diagram.py in Merriwood/propertydd-graph v2.8. Layout is
computed from the spec, not hand-placed: adding an agent or a lane re-flows the
picture. Never edit the SVG by hand; change the spec and run this again.
"""
import textwrap
from fitness_spec import (VERSION, DATE, ORG, DOC_REF, CONFIDENTIAL, TITLE, SUBTITLE,
                     CLUSTERS, INTAKE, NODES, CROSS, SYNTH, DELIVERABLE, GATES,
                     CONTROL, OFFLINE_JOBS, TECHNIQUES)

# ---------------------------------------------------------------- palette
INK, MUTED, LINE, GATE = "#1B2430", "#5A6672", "#C3CBD4", "#B5761B"
BG, PANEL = "#FFFFFF", "#F5F7F9"

# ---------------------------------------------------------------- layout
W = 1500
RAIL_X, RAIL_W = 16, 96
COL_X0, GAP, RIGHT = 132, 12, 72   # right margin holds the re-test and program loops
NCOL = len(CLUSTERS)
COL_W = int((W - COL_X0 - RIGHT - (NCOL - 1) * GAP) / NCOL)
BANDW = W - COL_X0 - RIGHT
CW = int((BANDW - (len(CROSS) - 1) * GAP) / len(CROSS))   # cross-check box width
X_IN = COL_X0 + CW / 2                                    # every lane enters X0 first
MAXROWS = max(len([n for n in NODES if n["cluster"] == c["key"]]) for c in CLUSTERS)

TOP_Y, HDR_H, NH, NGAP = 208, 24, 40, 5
NODES_Y = TOP_Y + HDR_H + 8
FAN_BOTTOM = NODES_Y + (MAXROWS - 1) * (NH + NGAP) + NH
G2_Y = FAN_BOTTOM + 8
RED_Y = G2_Y + 52
CROSS_Y = RED_Y + 86
G3_Y = CROSS_Y + 56
SYN_Y = G3_Y + 34
G3A_Y = SYN_Y + 52                 # G3A sits under S3 only
G4_Y = G3A_Y + 28
DEL_Y = G4_Y + 32
H = DEL_Y + 124

esc = lambda s: s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def wrap(s, n):
    return textwrap.wrap(s, n) or [""]


def box(x, y, w, h, fill, stroke, rx=6, sw=1.1, dash=None, op=1.0):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" '
            f'fill-opacity="{op}" stroke="{stroke}" stroke-width="{sw}"{d}/>')


def text(x, y, s, size=12, fill=INK, weight="normal", anchor="start", ls=0):
    return (f'<text x="{x}" y="{y}" font-family="Helvetica,Arial,sans-serif" '
            f'font-size="{size}" fill="{fill}" font-weight="{weight}" '
            f'text-anchor="{anchor}" letter-spacing="{ls}">{esc(s)}</text>')


TAG = {"built": "BUILT", "data": "DATA ONLY", "proposed": ""}


def node_box(x, y, w, h, code, name, color, status="proposed", bands=""):
    proposed = status == "proposed"
    o = [box(x, y, w, h, color if not proposed else BG, color, rx=6, sw=1.1,
             dash="4 3" if proposed else None, op=0.10 if not proposed else 1.0),
         f'<rect x="{x}" y="{y}" width="3.5" height="{h}" rx="1.5" fill="{color}"/>',
         text(x + 9, y + 14, code, 9.2, color, "bold", ls=0.4)]
    # Age bands and the technique-table marker share the code line.
    meta = " · ".join(t for t in (bands, "FIT-T" if code in TECHNIQUES else "") if t)
    if meta:
        o.append(text(x + 9 + 7 * len(code), y + 14, meta, 7.6, MUTED, "bold"))
    if TAG[status]:
        o.append(text(x + w - 6, y + 14, TAG[status], 7.4, color, "bold", "end", ls=0.5))
    for i, ln in enumerate(wrap(name, int((w - 16) / 6.5))[:2]):
        o.append(text(x + 9, y + 26 + i * 11, ln, 11, INK, "bold"))
    return "".join(o)


def gate_bar(x, y, w, g, h=20, label=None):
    o = [box(x, y, w, h, GATE, GATE, rx=5, sw=1.0, dash="5 3", op=0.09)]
    cx, cy = x + 14, y + h / 2
    o.append(f'<path d="M{cx} {cy-6} L{cx+6} {cy} L{cx} {cy+6} L{cx-6} {cy} Z" fill="{GATE}"/>')
    label = label or f"{g['code']}  {g['name']}  —  {g['rule']}"
    cap = int((w - 44) / 5.25)
    if len(label) > cap:
        label = label[:cap].rsplit(" ", 1)[0] + " ..."
    o.append(text(x + 27, y + h / 2 + 4, label, 9.6, "#6B4A11", "bold"))
    return "".join(o)


def shorten(t, n):
    return t if len(t) <= n else t[:n].rsplit(" ", 1)[0] + "..."


def band_label(x, y, s):
    return text(x, y, s, 10.5, MUTED, "bold", ls=1.6)


def build():
    gate = {g["code"]: g for g in GATES}
    s = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">',
         f'<rect width="{W}" height="{H}" fill="{BG}"/>',
         text(RAIL_X, 30, TITLE, 19, INK, "bold"),
         text(RAIL_X, 48, SUBTITLE, 10.5, MUTED),
         # ---- title block (right) ----
         f'<line x1="{W-RIGHT-300}" y1="12" x2="{W-RIGHT-300}" y2="52" stroke="{LINE}" '
         f'stroke-width="1"/>',
         f'<rect x="{W-RIGHT-284}" y="17" width="9" height="9" rx="2" fill="{INK}"/>',
         text(W - RIGHT - 268, 26, ORG, 12.5, INK, "bold"),
         text(W - RIGHT - 268, 40, DOC_REF, 8.6, MUTED),
         text(W - RIGHT - 268, 51, CONFIDENTIAL, 8.6, MUTED, "italic"),
         f'<line x1="{RAIL_X}" y1="58" x2="{W-RIGHT}" y2="58" stroke="{LINE}"/>']

    # ---- control rail ----------------------------------------------------
    s.append(box(RAIL_X, 72, RAIL_W, FAN_BOTTOM - 72, PANEL, LINE, rx=8))
    s.append(text(RAIL_X + 8, 90, "CONTROL PLANE", 8.4, MUTED, "bold", ls=0.9))
    yy = 104
    for c in CONTROL:
        nl = wrap(c["name"], 15)
        for i, ln in enumerate(nl):
            s.append(text(RAIL_X + 8, yy + i * 11, ln, 9.8, INK, "bold"))
        yy += 11 * len(nl) + 3
        for ln in wrap(shorten(c["note"], 92), 18)[:6]:
            s.append(text(RAIL_X + 8, yy + 9, ln, 8.1, MUTED))
            yy += 9.4
        yy += 10
    s.append(text(RAIL_X + 8, FAN_BOTTOM - 12, "runs beside every node", 8.1, MUTED, "italic"))

    # ---- band 1: intake --------------------------------------------------
    s.append(band_label(COL_X0, 84, "1 · INTAKE & SCOPING"))
    iw = int((BANDW - (len(INTAKE) - 1) * GAP) / len(INTAKE))
    for i, n in enumerate(INTAKE):
        x = COL_X0 + i * (iw + GAP)
        s.append(box(x, 92, iw, 64, "#E9ECF5", "#8B93B8", rx=7))
        s.append(text(x + 11, 109, n["code"], 9.5, "#4A57C4", "bold", ls=0.4))
        for j, ln in enumerate(wrap(n["name"], 32)[:2]):
            s.append(text(x + 11, 123 + j * 12.5, ln, 12, INK, "bold"))
        s.append(text(x + 11, 150, wrap(n["output"], 54)[0], 8.6, MUTED))
    s.append(gate_bar(COL_X0, 164, BANDW, gate["G1"]))

    # ---- band 2: fan-out -------------------------------------------------
    s.append(band_label(COL_X0, 200, "2 · FAN-OUT — PARALLEL LANE AGENTS"))
    s.append(text(W - RIGHT, 200,
                  f"{len(NODES)} agents ({sum(n['status'] == 'built' for n in NODES)} built) · roster by age band · isolated context  |  solid = built or recorded · dashed = proposed · FIT-T = technique table written",
                  9.4, MUTED, "italic", anchor="end"))
    hub = (COL_X0 + BANDW / 2, 184)
    for ci, c in enumerate(CLUSTERS):
        x = COL_X0 + ci * (COL_W + GAP)
        s.append(f'<path d="M{hub[0]} {hub[1]+4} C {hub[0]} {TOP_Y-6}, {x+COL_W/2} {TOP_Y-14}, '
                 f'{x+COL_W/2} {TOP_Y}" fill="none" stroke="{c["color"]}" stroke-width="0.9" '
                 f'opacity="0.5"/>')
        s.append(box(x, TOP_Y, COL_W, HDR_H, c["color"], c["color"], rx=5, op=0.92))
        s.append(text(x + COL_W / 2, TOP_Y + 16, f'{c["key"]} · {c["name"]}', 10.0,
                      "#FFFFFF", "bold", anchor="middle"))
        lane = [n for n in NODES if n["cluster"] == c["key"]]
        for ni, n in enumerate(lane):
            y = NODES_Y + ni * (NH + NGAP)
            s.append(node_box(x, y, COL_W, NH, n["code"], n["name"], c["color"], n["status"],
                              n.get("bands", "")))
        last = NODES_Y + (len(lane) - 1) * (NH + NGAP) + NH
        s.append(f'<line x1="{x+COL_W/2}" y1="{last}" x2="{x+COL_W/2}" y2="{G2_Y-4}" '
                 f'stroke="{c["color"]}" stroke-width="0.9" stroke-dasharray="3 3" '
                 f'opacity="0.55"/>')
    s.append(gate_bar(COL_X0, G2_Y, BANDW, gate["G2"]))

    # ---- band 3: reduce --------------------------------------------------
    s.append(band_label(RAIL_X, RED_Y - 8, "3 · REDUCE — ONE RESULTS SET PER LANE"))
    for ci, c in enumerate(CLUSTERS):
        x = COL_X0 + ci * (COL_W + GAP)
        s.append(box(x, RED_Y, COL_W, 46, c["color"], c["color"], rx=6, sw=1.6, op=0.16))
        s.append(text(x + 9, RED_Y + 14, c["reducer"][0], 9.2, c["color"], "bold", ls=0.4))
        for j, ln in enumerate(wrap(c["reducer"][1], int((COL_W - 16) / 6.2))[:2]):
            s.append(text(x + 9, RED_Y + 27 + j * 11, ln, 10.6, INK, "bold"))
        s.append(f'<path d="M{x+COL_W/2} {RED_Y+46} C {x+COL_W/2} {RED_Y+62}, {X_IN} {RED_Y+62}, '
                 f'{X_IN} {CROSS_Y}" fill="none" stroke="{c["color"]}" stroke-width="1" '
                 f'opacity="0.55"/>')
    for i, t in enumerate(["merge · rank", "trend", "propose only"]):
        s.append(text(RAIL_X, RED_Y + 18 + i * 12, t, 9, MUTED, "bold"))

    # ---- band 4: cross-check --------------------------------------------
    s.append(band_label(RAIL_X, CROSS_Y - 8, "4 · CROSS-CHECK"))
    for i, n in enumerate(CROSS):
        x = COL_X0 + i * (CW + GAP)
        s.append(box(x, CROSS_Y, CW, 48, "#FDF6E7", GATE, rx=6, sw=1.2))
        s.append(text(x + 11, CROSS_Y + 17, n["code"], 9.5, GATE, "bold", ls=0.4))
        for j, ln in enumerate(wrap(n["name"], int((CW - 22) / 6.8))[:2]):
            s.append(text(x + 11, CROSS_Y + 31 + j * 11.5, ln, 11.5, INK, "bold"))
        if i:                                          # X0 -> X1 -> X2 -> X3
            ax = x - GAP / 2
            s.append(f'<path d="M{ax-4} {CROSS_Y+20} l 8 4 l -8 4 Z" fill="{GATE}"/>')
    RE = W - RIGHT
    s.append(f'<path d="M{RE} {CROSS_Y+24} C {W-34} {CROSS_Y+24}, {W-34} {TOP_Y+8}, '
             f'{RE} {TOP_Y+8}" fill="none" stroke="{GATE}" stroke-width="1.2" '
             f'stroke-dasharray="6 4"/>')
    s.append(f'<path d="M{RE} {TOP_Y+8} l 9 -4 l 0 8 Z" fill="{GATE}"/>')
    mid = (TOP_Y + CROSS_Y) / 2
    s.append(f'<text x="{W-36}" y="{mid}" font-family="Helvetica,Arial,sans-serif" font-size="9" '
             f'fill="{GATE}" font-weight="bold" text-anchor="middle" '
             f'transform="rotate(90 {W-36} {mid})">CONDITIONAL RE-TEST — '
             f'old test or thin evidence</text>')
    # ---- evidence return path: everything durable re-enters through N2 ----
    EV = "#2C6E8F"
    ch = COL_X0 - 12
    s.append(f'<path d="M{COL_X0} {CROSS_Y+40} C {ch} {CROSS_Y+40}, {ch} {CROSS_Y}, {ch} 150 '
             f'C {ch} 130, {ch+4} 124, {COL_X0-2} 124" fill="none" stroke="{EV}" '
             f'stroke-width="1.1" stroke-dasharray="5 4" opacity="0.85"/>')
    s.append(f'<path d="M{COL_X0-2} 124 l -8 -4 l 0 8 Z" fill="{EV}" transform="translate(10,0)"/>')
    s.append(f'<text x="{ch-7}" y="{(CROSS_Y+150)/2}" font-family="Helvetica,Arial,sans-serif" '
             f'font-size="8.2" fill="{EV}" font-weight="bold" text-anchor="middle" '
             f'transform="rotate(-90 {ch-7} {(CROSS_Y+150)/2})">NEW TEST RESULTS -> N2</text>')
    s.append(gate_bar(COL_X0, G3_Y, BANDW, gate["G3"]))

    # ---- band 5: synthesize ---------------------------------------------
    s.append(band_label(RAIL_X, SYN_Y - 8, "5 · SYNTHESIZE"))
    sw_ = int((BANDW - 3 * GAP) / 4)
    for i, n in enumerate(SYNTH):
        x = COL_X0 + i * (sw_ + GAP)
        s.append(box(x, SYN_Y, sw_, 46, "#EAF1EC", "#2E7D52", rx=6, sw=1.3))
        s.append(text(x + 11, SYN_Y + 17, n["code"], 9.5, "#2E7D52", "bold", ls=0.4))
        for j, ln in enumerate(wrap(n["name"], 32)[:2]):
            s.append(text(x + 11, SYN_Y + 30 + j * 11, ln, 11, INK, "bold"))
        if n["code"] == "S3":                          # S3 -> G3A -> G4
            s.append(f'<line x1="{x+sw_/2}" y1="{SYN_Y+46}" x2="{x+sw_/2}" y2="{G3A_Y}" '
                     f'stroke="{GATE}" stroke-width="1"/>')
            s.append(gate_bar(x, G3A_Y, sw_, gate["G3A"],
                              label="G3A  Report Sign-Off — owner approves the pages"))
    s.append(gate_bar(COL_X0, G4_Y, BANDW, gate["G4"]))

    # ---- program loop: S4 proposes next period's program, back to N3 -----
    PG, LX, RE = "#2E7D52", W - 10, W - RIGHT
    s.append(f'<path d="M{RE} {SYN_Y+23} H {LX} V 124 H {RE+8}" fill="none" stroke="{PG}" '
             f'stroke-width="1.2" stroke-dasharray="6 4"/>')
    s.append(f'<path d="M{RE} 124 l 9 -4 l 0 8 Z" fill="{PG}"/>')
    pmid = (124 + SYN_Y) / 2
    s.append(f'<text x="{LX-15}" y="{pmid}" font-family="Helvetica,Arial,sans-serif" font-size="9" '
             f'fill="{PG}" font-weight="bold" text-anchor="middle" '
             f'transform="rotate(90 {LX-15} {pmid})">NEXT PROGRAM — S4 -&gt; N3</text>')

    # ---- deliverable -----------------------------------------------------
    s.append(box(RAIL_X, DEL_Y, W - RIGHT - RAIL_X + 26, 40, INK, INK, rx=7, op=0.94))
    s.append(text((W - RIGHT + 26 + RAIL_X) / 2, DEL_Y + 25, DELIVERABLE, 11.4,
                  "#FFFFFF", "bold", anchor="middle"))
    s.append(text(RAIL_X, DEL_Y + 58,
                  "Diamond invariant: agents never read each other's raw output — they contribute "
                  "typed, cited results to a ledger; only the reducers and the cross-check layer "
                  "compare across lanes.", 9.2, MUTED, "italic"))
    s.append(text(RAIL_X, DEL_Y + 70,
                  "Scoring invariant: code, never a language model, sets every score, z-score and "
                  "pass or fail. The wiki is output only: it is rebuilt from the evidence and "
                  "never read back as evidence.", 9.2, MUTED, "italic"))
    s.append(text(RAIL_X, DEL_Y + 82,
                  "Loops: the re-test loop runs inside a period; the program loop runs once per "
                  "period, so a single run has no cycle. Scores use targets, never the program.",
                  9.2, MUTED, "italic"))
    s.append(text(RAIL_X, DEL_Y + 94, OFFLINE_JOBS, 9.2, MUTED, "italic"))
    s.append("</svg>")
    return "".join(s)


OUT = f"{DATE.replace('-', '')}_sterling-fitness-agent-graph_v{VERSION}.svg"

if __name__ == "__main__":
    open(OUT, "w", encoding="utf-8").write(build())
    print(f"{OUT} written — {W}x{H}, {len(NODES)} agents, {NCOL} lanes")
