"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LivePulse({ ms = 8000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), ms);
    return () => clearInterval(timer);
  }, [router, ms]);
  return null;
}
