"""SmartTrafic edge brain — same decision rules as src/lib/algorithm.ts"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

Mode = Literal["normal", "school", "market", "night", "eco", "emergency", "failsafe"]
Color = Literal["red", "amber", "green", "flashing_amber", "off"]
Axis = Literal["ns", "ew"]
Phase = Literal["service", "yellow", "allred"]


@dataclass
class Counts:
    m100: int = 0
    m200: int = 0
    m300: int = 0
    wait_s: float = 0.0
    motos: int = 0
    cars: int = 0
    buses: int = 0
    trucks: int = 0
    peds: int = 0
    emergency: bool = False


@dataclass
class Timing:
    min_green_s: int = 8
    max_green_s: int = 60
    yellow_s: int = 3
    all_red_s: int = 1
    min_ped_s: int = 12
    extension_s: int = 3


@dataclass
class ApproachState:
    name: str
    heading_deg: int = 0
    counts: Counts = field(default_factory=Counts)
    color: Color = "red"
    green_elapsed_s: float = 0.0
    ped_waiting: bool = False
    phase: Phase = "service"
    phase_elapsed_s: float = 0.0
    serving_axis: Axis | None = None
    pending_axis: Axis | None = None


def approach_score(c: Counts, mode: Mode) -> float:
    score = (
        c.m100 * 1.0
        + c.m200 * 1.6
        + c.m300 * 2.4
        + c.wait_s * 0.08
        + c.motos * 0.45
        + c.buses * 2.2
        + c.trucks * 2.8
        + c.peds * 1.8
    )
    if mode == "school":
        score += c.peds * 2.5
    if mode == "market":
        score += c.peds * 1.4 + c.wait_s * 0.12 + c.buses * 0.6
    if mode == "night" and (c.m100 + c.m200 + c.m300) == 0:
        score *= 0.2
    if mode == "eco" and not c.emergency:
        score *= 0.85
    if c.emergency:
        score += 10_000
    return score


def effective_timing(mode: Mode, timing: Timing) -> Timing:
    if mode != "eco":
        return timing
    return Timing(
        min_green_s=timing.min_green_s,
        max_green_s=min(timing.max_green_s, 20),
        yellow_s=timing.yellow_s,
        all_red_s=timing.all_red_s,
        min_ped_s=timing.min_ped_s,
        extension_s=0,
    )


def axis_of(heading: int) -> Axis:
    d = heading % 360
    return "ew" if d in (90, 270) else "ns"


def _failsafe(approaches: list[ApproachState]) -> list[ApproachState]:
    for a in approaches:
        a.color = "flashing_amber"
        a.phase = "service"
        a.phase_elapsed_s = 0
        a.pending_axis = None
    return approaches


def _assert(approaches: list[ApproachState]) -> list[ApproachState]:
    greens = [a for a in approaches if a.color == "green"]
    axes = {axis_of(g.heading_deg) for g in greens}
    if len(axes) > 1:
        return _failsafe(approaches)
    return approaches


def _set_axis(approaches: list[ApproachState], axis: Axis) -> list[ApproachState]:
    for a in approaches:
        on = axis_of(a.heading_deg) == axis
        a.color = "green" if on else "red"
        if not on:
            a.green_elapsed_s = 0
        a.phase = "service"
        a.phase_elapsed_s = 0
        a.serving_axis = axis
        a.pending_axis = None
    return _assert(approaches)


def _begin_yellow(approaches: list[ApproachState], serving: Axis, pending: Axis) -> list[ApproachState]:
    for a in approaches:
        a.color = "amber" if axis_of(a.heading_deg) == serving else "red"
        a.phase = "yellow"
        a.phase_elapsed_s = 0
        a.serving_axis = serving
        a.pending_axis = pending
    return approaches


def _hold(approaches: list[ApproachState], phase: Phase, elapsed: float, serving: Axis, pending: Axis) -> list[ApproachState]:
    for a in approaches:
        a.color = "amber" if phase == "yellow" and axis_of(a.heading_deg) == serving else "red"
        a.phase = phase
        a.phase_elapsed_s = elapsed
        a.serving_axis = serving
        a.pending_axis = pending
    return approaches


def next_phase(approaches: list[ApproachState], mode: Mode, timing_in: Timing) -> list[ApproachState]:
    timing = effective_timing(mode, timing_in)
    if mode == "failsafe":
        return _failsafe(approaches)

    phase = approaches[0].phase if approaches else "service"
    elapsed_phase = (approaches[0].phase_elapsed_s if approaches else 0) + 1
    serving = approaches[0].serving_axis if approaches else None
    pending = approaches[0].pending_axis if approaches else None

    if phase == "yellow" and serving and pending:
        if elapsed_phase >= timing.yellow_s:
            return _hold(approaches, "allred", 0, serving, pending)
        return _hold(approaches, "yellow", elapsed_phase, serving, pending)

    if phase == "allred" and pending:
        if elapsed_phase >= timing.all_red_s:
            for a in approaches:
                a.green_elapsed_s = 0
            return _set_axis(approaches, pending)
        return _hold(approaches, "allred", elapsed_phase, serving or pending, pending)

    emergency = next((a for a in approaches if a.counts.emergency), None)
    greens = [a for a in approaches if a.color == "green"]
    current: Axis = axis_of(greens[0].heading_deg) if greens else (serving or "ns")

    if emergency:
        target = axis_of(emergency.heading_deg)
        if greens and current != target:
            return _begin_yellow(approaches, current, target)
        if not greens:
            for a in approaches:
                a.green_elapsed_s = 0
            return _set_axis(approaches, target)

    if not greens:
        winner = max(approaches, key=lambda a: approach_score(a.counts, mode))
        for a in approaches:
            a.green_elapsed_s = 0
        return _set_axis(approaches, axis_of(winner.heading_deg))

    group = [a for a in approaches if axis_of(a.heading_deg) == current]
    other = [a for a in approaches if axis_of(a.heading_deg) != current]
    elapsed = max(a.green_elapsed_s for a in group) + 1
    empty = all((a.counts.m100 + a.counts.m200 + a.counts.m300) == 0 for a in group)
    other_score = sum(approach_score(a.counts, mode) for a in other)
    group_score = sum(approach_score(a.counts, mode) for a in group)
    ped_hold = any(a.ped_waiting for a in group) and elapsed < timing.min_ped_s
    incoming = any(a.counts.m200 or a.counts.m300 for a in group)
    nxt: Axis = "ew" if current == "ns" else "ns"

    if ped_hold:
        for a in group:
            a.green_elapsed_s = elapsed
            a.phase = "service"
            a.serving_axis = current
        return _assert(approaches)

    if (elapsed >= timing.min_green_s and empty and other_score > 2) or (
        elapsed >= timing.max_green_s and other_score >= group_score
    ):
        return _begin_yellow(approaches, current, nxt)

    for a in group:
        a.green_elapsed_s = elapsed + (timing.extension_s if incoming and not empty else 0)
        a.phase = "service"
        a.serving_axis = current
    return _assert(approaches)
