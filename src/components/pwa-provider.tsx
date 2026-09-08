"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Share, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function PwaProvider() {
  const path = usePathname();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    if (isStandalone()) return;
    const dismissed = sessionStorage.getItem("st-pwa-hide") === "1";
    if (dismissed) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    if (isIos()) {
      setIosHint(true);
      setHidden(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || (!installEvent && !iosHint)) return null;

  const dismiss = () => {
    sessionStorage.setItem("st-pwa-hide", "1");
    setHidden(true);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(null);
    setHidden(true);
  };

  return (
    <div className={path.startsWith("/app") ? "pwa-banner pwa-banner-app" : "pwa-banner"}>
      <div className="flex items-start gap-3">
        {installEvent ? <Download size={18} className="mt-0.5 text-[var(--go)]" /> : <Share size={18} className="mt-0.5 text-[var(--wait)]" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Llevar SmartTrafic al teléfono</p>
          <p className="mt-0.5 text-[11px] text-[var(--mute)]">
            {installEvent
              ? "Instálala y ábrela como app, sin navegador."
              : "En Safari: Compartir → Agregar a pantalla de inicio."}
          </p>
        </div>
        {installEvent ? (
          <button className="shrink-0 rounded-full bg-[var(--go)] px-3 py-1.5 text-xs font-semibold text-[#04210f]" onClick={install} type="button">
            Instalar
          </button>
        ) : null}
        <button aria-label="Cerrar" className="shrink-0 p-1 text-white/50" onClick={dismiss} type="button">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
