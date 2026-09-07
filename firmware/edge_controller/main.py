"""
Desk / field entrypoint for the intersection brain.
Replace GPIO stubs with gpiozero / gpio on the real board.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path

from algorithm import ApproachState, Counts, Timing, next_phase

try:
    import paho.mqtt.client as mqtt
except ImportError:  # optional on the desk
    mqtt = None


APPROACHES = [
    ApproachState("Calle A", heading_deg=0),
    ApproachState("Calle B", heading_deg=90),
]


def publish(client, payload: dict) -> None:
    if not client:
        print(json.dumps(payload))
        return
    client.publish("smarttrafic/telemetry", json.dumps(payload), qos=1)


def main() -> None:
    timing = Timing()
    client = None
    if mqtt and os.getenv("MQTT_URL"):
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        if os.getenv("MQTT_USER"):
            client.username_pw_set(os.getenv("MQTT_USER"), os.getenv("MQTT_PASSWORD"))
        host = os.getenv("MQTT_URL", "localhost")
        client.tls_set()
        client.connect(host, int(os.getenv("MQTT_PORT", "8883")), 60)
        client.loop_start()

    approaches = APPROACHES
    while True:
        # TODO: replace with camera/radar/button reads
        approaches[0].counts = Counts(m100=4, m200=2, motos=6, cars=3, wait_s=12)
        approaches[1].counts = Counts(m100=0, peds=2, wait_s=4)
        approaches = next_phase(approaches, "normal", timing)
        publish(
            client,
            {
                "intersection": os.getenv("INTERSECTION_CODE", "DEV-DESK"),
                "lights": {a.name: a.color for a in approaches},
                "ts": time.time(),
            },
        )
        time.sleep(1)


if __name__ == "__main__":
    Path("/tmp/smarttrafic").mkdir(exist_ok=True)
    main()
