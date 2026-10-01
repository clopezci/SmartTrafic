"""Desk / field entrypoint. GPIO stays stubbed until the board is wired.

Counts come from counts.json (vision or a replay). Orders come from MQTT
smarttrafic/{code}/cmd or from GET /api/commands.
"""

from __future__ import annotations

import json
import os
import time
import urllib.request
from pathlib import Path

from algorithm import ApproachState, Counts, Timing, next_phase
from vision import read_counts

try:
    import paho.mqtt.client as mqtt
except ImportError:
    mqtt = None


def sign(raw: str) -> str:
    import hashlib
    import hmac

    secret = os.getenv("INGEST_HMAC_SECRET") or os.getenv("SESSION_SECRET") or ""
    if not secret:
        return ""
    return hmac.new(secret.encode(), raw.encode(), hashlib.sha256).hexdigest()


def pull_commands(code: str) -> list[dict]:
    base = os.getenv("INGEST_URL", "").rstrip("/")
    if not base:
        return []
    sig = sign(code)
    req = urllib.request.Request(
        f"{base}/api/commands?code={code}",
        headers={"x-smarttrafic-signature": sig} if sig else {},
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            body = json.loads(res.read().decode())
    except Exception as exc:
        print("commands", exc)
        return []
    commands = body.get("commands") or []
    for cmd in commands:
        ack = json.dumps({"id": cmd.get("id")}).encode()
        ack_req = urllib.request.Request(
            f"{base}/api/commands",
            data=ack,
            headers={
                "Content-Type": "application/json",
                "x-smarttrafic-signature": sign(ack.decode()),
            },
            method="POST",
        )
        try:
            urllib.request.urlopen(ack_req, timeout=5).read()
        except Exception as exc:
            print("ack", exc)
    return commands


def apply_commands(commands: list[dict], mode: str) -> str:
    for cmd in commands:
        payload = cmd.get("payload") or {}
        if isinstance(payload, str):
            payload = json.loads(payload)
        nxt = payload.get("mode")
        if nxt:
            mode = str(nxt)
            Path("/tmp/smarttrafic-mode.txt").write_text(mode, encoding="utf-8")
    return mode


def publish(client, topic: str, payload: dict) -> None:
    raw = json.dumps(payload)
    if not client:
        print(raw)
        return
    client.publish(topic, raw, qos=1)


def main() -> None:
    timing = Timing()
    code = os.getenv("INTERSECTION_CODE", "DEV-DESK")
    client = None
    mode = "normal"
    if mqtt and os.getenv("MQTT_URL"):
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        if os.getenv("MQTT_USER"):
            client.username_pw_set(os.getenv("MQTT_USER"), os.getenv("MQTT_PASSWORD"))
        host = os.getenv("MQTT_URL", "localhost").replace("mqtts://", "").replace("mqtt://", "")
        client.tls_set()

        def on_message(_c, _u, msg):
            Path("/tmp/smarttrafic-cmd.json").write_bytes(msg.payload)

        client.on_message = on_message
        client.connect(host, int(os.getenv("MQTT_PORT", "8883")), 60)
        client.subscribe(f"smarttrafic/{code}/cmd", qos=1)
        client.loop_start()

    approaches = [
        ApproachState("Calle A", heading_deg=0, color="green"),
        ApproachState("Calle B", heading_deg=90, color="red"),
    ]
    while True:
        counts = read_counts()
        if len(counts) >= 1:
            approaches[0].counts = counts[0]
        if len(counts) >= 2:
            approaches[1].counts = counts[1]
        cmd_file = Path("/tmp/smarttrafic-cmd.json")
        if cmd_file.exists():
            try:
                mode = apply_commands([{"payload": json.loads(cmd_file.read_text(encoding="utf-8"))}], mode)
            except Exception:
                pass
            cmd_file.unlink(missing_ok=True)
        mode = apply_commands(pull_commands(code), mode)
        approaches = next_phase(approaches, mode, timing)  # type: ignore[arg-type]
        publish(
            client,
            f"smarttrafic/{code}/telemetry",
            {
                "code": code,
                "mode": mode,
                "phase": approaches[0].phase,
                "approaches": [
                    {
                        "name": a.name,
                        "headingDeg": a.heading_deg,
                        "color": a.color,
                        "greenElapsedS": a.green_elapsed_s,
                        "phase": a.phase,
                        "counts": {
                            "m100": a.counts.m100,
                            "m200": a.counts.m200,
                            "m300": a.counts.m300,
                            "waitS": a.counts.wait_s,
                            "motos": a.counts.motos,
                            "cars": a.counts.cars,
                            "buses": a.counts.buses,
                            "trucks": a.counts.trucks,
                            "peds": a.counts.peds,
                            "emergency": a.counts.emergency,
                        },
                    }
                    for a in approaches
                ],
                "ts": time.time(),
            },
        )
        time.sleep(1)


if __name__ == "__main__":
    Path("/tmp/smarttrafic").mkdir(exist_ok=True)
    main()
