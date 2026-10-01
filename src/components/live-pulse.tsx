"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LivePulse({ ms = 20000 }: { ms?: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const wait = Math.max(ms, 20000);
    const timer = window.setInterval(() => {
      if (document.hidden || pending) return;
      startTransition(() => {
        router.refresh();
      });
    }, wait);
    return () => window.clearInterval(timer);
  }, [router, ms, pending]);

  return null;
}
