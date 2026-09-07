"""SmartTrafic edge brain — same decision rules as platform/src/lib/algorithm.ts"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

Mode = Literal["normal", "school", "market", "night", "eco", "emergency", "failsafe"]
Color = Literal["red", "amber", "green", "flashing_amber", "off"]
Axis = Literal["ns", "ew"]


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
    if mode == "night" and (c.m100 + c.m200 + c.m300) == 0:
        score *= 0.2
    if c.emergency:
        score += 10_000
    return score


def axis_of(heading: int) -> Axis:
    d = heading % 360
    return "ew" if d in (90, 270) else "ns"


def _failsafe(approaches: list[ApproachState]) -> list[ApproachState]:
    for a in approaches:
        a.color = "flashing_amber"
    return approaches


def _set_axis(approaches: list[ApproachState], axis: Axis) -> list[ApproachState]:
    for a in approaches:
        a.color = "green" if axis_of(a.heading_deg) == axis else "red"
        if axis_of(a.heading_deg) != axis:
            a.green_elapsed_s = 0
    return _assert(approaches)


def _assert(approaches: list[ApproachState]) -> list[ApproachState]:
    greens = [a for a in approaches if a.color == "green"]
    axes = {axis_of(g.heading_deg) for g in greens}
    if len(axes) > 1:
        return _failsafe(approaches)
    return approaches


def next_phase(approaches: list[ApproachState], mode: Mode, timing: Timing) -> list[ApproachState]:
    if mode == "failsafe":
        return _failsafe(approaches)

    emergency = next((a for a in approaches if a.counts.emergency), None)
    if emergency:
        return _set_axis(approaches, axis_of(emergency.heading_deg))

    greens = [a for a in approaches if a.color == "green"]
    if not greens:
        winner = max(approaches, key=lambda a: approach_score(a.counts, mode))
        for a in approaches:
            a.green_elapsed_s = 0
        return _set_axis(approaches, axis_of(winner.heading_deg))

    current = axis_of(greens[0].heading_deg)
    group = [a for a in approaches if axis_of(a.heading_deg) == current]
    other = [a for a in approaches if axis_of(a.heading_deg) != current]
    elapsed = max(a.green_elapsed_s for a in group) + 1
    empty = all((a.counts.m100 + a.counts.m200 + a.counts.m300) == 0 for a in group)
    other_score = sum(approach_score(a.counts, mode) for a in other)
    group_score = sum(approach_score(a.counts, mode) for a in group)
    ped_hold = any(a.ped_waiting for a in group) and elapsed < timing.min_ped_s
    incoming = any(a.counts.m200 or a.counts.m300 for a in group)

    if ped_hold:
        for a in group:
            a.green_elapsed_s = elapsed
        return _assert(approaches)

    if (elapsed >= timing.min_green_s and empty and other_score > 2) or (
        elapsed >= timing.max_green_s and other_score >= group_score
    ):
        for a in approaches:
            a.green_elapsed_s = 0
        return _set_axis(approaches, "ew" if current == "ns" else "ns")

    for a in group:
        a.green_elapsed_s = elapsed + (timing.extension_s if incoming and not empty else 0)
    return _assert(approaches)
