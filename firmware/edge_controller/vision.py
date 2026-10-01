"""Count source for the edge brain.

Drop a counts.json next to this file (or set COUNTS_PATH) when a camera or radar
is attached. Without that file the desk loop uses a small synthetic queue.
The weight file for a detector is not in this repo: replace read_counts() with
the model call on the board. This module only defines the contract.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

from algorithm import Counts


def read_counts() -> list[Counts]:
    path = Path(os.getenv("COUNTS_PATH", Path(__file__).with_name("counts.json")))
    if path.exists():
        raw = json.loads(path.read_text(encoding="utf-8"))
        rows = raw if isinstance(raw, list) else raw.get("approaches", [])
        out: list[Counts] = []
        for row in rows:
            counts = row.get("counts", row)
            out.append(
                Counts(
                    m100=int(counts.get("m100", 0)),
                    m200=int(counts.get("m200", 0)),
                    m300=int(counts.get("m300", 0)),
                    wait_s=float(counts.get("waitS", counts.get("wait_s", 0))),
                    motos=int(counts.get("motos", 0)),
                    cars=int(counts.get("cars", 0)),
                    buses=int(counts.get("buses", 0)),
                    trucks=int(counts.get("trucks", 0)),
                    peds=int(counts.get("peds", 0)),
                    emergency=bool(counts.get("emergency", False)),
                )
            )
        return out
    return [
        Counts(m100=4, m200=2, motos=6, cars=3, wait_s=12),
        Counts(m100=0, peds=2, wait_s=4),
    ]
