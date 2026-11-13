"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Registers the service worker and surfaces two small, honest pieces of
 * offline UI:
 *
 *  1. An offline banner when the browser goes offline — so a shopper never
 *     mistakes a cached page for a live one.
 *  2. An "Install app" button when the browser offers one (Android/Chrome,
 *     desktop). iOS has no install prompt API, so nothing is shown there
 *     rather than a button that does nothing.
 */
export function ServiceWorkerBridge() {
  const [offline, setOffline] = useState(false);
  const [installEvent, setInstallEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Register after load so it never competes with first paint.
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration failures are non-fatal — the site works online */
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    setOffline(!navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  const prompt = installEvent as (Event & { prompt?: () => Promise<void> }) | null;
  const canInstall = Boolean(prompt?.prompt);

  return (
    <>
      {offline ? (
        <div
          role="status"
          className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-[var(--color-warn-soft)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--color-warn-ink)]"
        >
          <Icon name="wifi-off" size={13} />
          You are offline — pages you have visited still open, but prices and stock may be out of date.
        </div>
      ) : null}

      {canInstall ? (
        <button
          type="button"
          onClick={async () => {
            await prompt?.prompt?.();
            setInstallEvent(null);
          }}
          className="fixed bottom-4 right-4 z-40 hidden items-center gap-2 rounded-full bg-[var(--color-brand)] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[var(--shadow-lift)] transition-transform hover:scale-[1.02] sm:flex"
        >
          <Icon name="download" size={14} />
          Install app
        </button>
      ) : null}
    </>
  );
}
