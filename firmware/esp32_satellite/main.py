# MicroPython / Arduino-style satellite: receives {"color":"red|amber|green"} over ESP-NOW or local Wi-Fi.
# Do not take decisions here. The brain does.

import json
import time

try:
    import network
    from machine import Pin
except ImportError:
    network = None
    Pin = None


RELAYS = {}


def setup():
    if not Pin:
        return
    RELAYS["red"] = Pin(14, Pin.OUT)
    RELAYS["amber"] = Pin(27, Pin.OUT)
    RELAYS["green"] = Pin(26, Pin.OUT)


def apply(color: str) -> None:
    for name, pin in RELAYS.items():
        pin.value(1 if name == color else 0)
    print("SATELLITE", color)


def main():
    setup()
    while True:
        # Replace with MQTT subscribe / ESP-NOW callback
        apply("red")
        time.sleep(1)


if __name__ == "__main__":
    main()
