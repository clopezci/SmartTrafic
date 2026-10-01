"""Controlador del letrero de texto.

Pregunta el mensaje vigente y lo deja en pantalla.
Si no hay señal, conserva el último texto.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import time
import urllib.request
from pathlib import Path

HOLD = Path(os.getenv("BOARD_HOLD_PATH", "/tmp/smarttrafic-board.json"))


def sign(raw: str) -> str:
    secret = os.getenv("INGEST_HMAC_SECRET") or os.getenv("SESSION_SECRET") or ""
    if not secret:
        return ""
    return hmac.new(secret.encode(), raw.encode(), hashlib.sha256).hexdigest()


def hold(text: str, kind: str | None) -> None:
    HOLD.write_text(json.dumps({"text": text, "kind": kind}, ensure_ascii=False), encoding="utf-8")
    print(text or "(pantalla en blanco)")


def pull(code: str) -> dict | None:
    base = os.getenv("INGEST_URL", "").rstrip("/")
    if not base:
        return None
    sig = sign(code)
    battery = os.getenv("BOARD_BATTERY", "")
    query = f"code={code}"
    if battery:
        query += f"&battery={battery}"
    req = urllib.request.Request(
        f"{base}/api/boards?{query}",
        headers={"x-smarttrafic-signature": sig} if sig else {},
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as res:
            return json.loads(res.read().decode())
    except Exception:
        return None


def main() -> None:
    code = os.getenv("BOARD_CODE", "TB-01")
    last = ""
    if HOLD.exists():
        try:
            last = json.loads(HOLD.read_text(encoding="utf-8")).get("text", "")
        except Exception:
            last = ""
    while True:
        payload = pull(code)
        if payload and payload.get("ok"):
            text = str(payload.get("text") or "")
            if text != last:
                hold(text, payload.get("kind"))
                last = text
        elif last:
            print(last)
        time.sleep(int(os.getenv("BOARD_POLL_S", "20")))


if __name__ == "__main__":
    main()
