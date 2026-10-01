# Satellite: applies a color. It does not decide phases.
# Desk: reads /tmp/smarttrafic-sat.json {"color":"red|amber|green"}.
# Board: replace the file read with ESP-NOW or MQTT smarttrafic/{code}/sat/{approach}.

import json
import time

try:
    from machine import Pin
except ImportError:
    Pin = None


RELAYS = {}
CMD = "/tmp/smarttrafic-sat.json"


def setup():
    if not Pin:
        return
    RELAYS["red"] = Pin(14, Pin.OUT)
    RELAYS["amber"] = Pin(27, Pin.OUT)
    RELAYS["green"] = Pin(26, Pin.OUT)


def apply(color: str) -> None:
    wanted = "amber" if color in ("amber", "flashing_amber") else color
    for name, pin in RELAYS.items():
        pin.value(1 if name == wanted else 0)
    print("SATELLITE", wanted)


def read_color() -> str:
    try:
        with open(CMD, encoding="utf-8") as handle:
            body = json.load(handle)
        return str(body.get("color") or "red")
    except Exception:
        return "red"


def main():
    setup()
    while True:
        apply(read_color())
        time.sleep(0.5)


if __name__ == "__main__":
    main()
