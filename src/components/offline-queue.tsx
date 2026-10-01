"use client";

import { useEffect, useState } from "react";
import { acknowledgeAlert } from "@/app/app/alertas/actions";
import { Button } from "@/components/ui";

const KEY = "st_offline_acks";

export function OfflineQueue() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const stored = () => {
      try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
      } catch {
        return [];
      }
    };
    setPending(stored().length);
    async function flush() {
      const ids = stored();
      if (!ids.length || !navigator.onLine) return;
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        localStorage.removeItem(KEY);
        setPending(0);
      }
    }
    window.addEventListener("online", flush);
    void flush();
    return () => window.removeEventListener("online", flush);
  }, []);

  if (!pending) return null;
  return (
    <p className="mt-3 text-xs text-[var(--wait)]">
      {pending} acuse{pending === 1 ? "" : "s"} en cola. Se envían al volver la red.
    </p>
  );
}

export function AckButton({ id }: { id: string }) {
  return (
    <form
      action={acknowledgeAlert}
      className="mt-3"
      onSubmit={() => {
        if (typeof navigator !== "undefined" && !navigator.onLine) rememberAck(id);
      }}
    >
      <input name="id" type="hidden" value={id} />
      <Button type="submit" variant="ghost">
        Acusar recibo
      </Button>
    </form>
  );
}

function rememberAck(id: string) {
  try {
    const raw = localStorage.getItem(KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    if (!ids.includes(id)) ids.push(id);
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* private mode */
  }
}
