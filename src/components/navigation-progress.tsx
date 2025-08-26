"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

function isInternalAnchor(element: Element): HTMLAnchorElement | null {
  if (!(element instanceof HTMLElement)) return null;
  const anchor = element.closest("a[href]") as HTMLAnchorElement | null;
  if (!anchor) return null;
  const href = anchor.getAttribute("href") || "";
  if (anchor.target === "_blank") return null;
  // Only same-origin, app-internal paths
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  return isInternal ? anchor : null;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = React.useState(false);
  const clickEventRef = React.useRef<((e: MouseEvent) => void) | null>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const anchor = target ? isInternalAnchor(target) : null;
      if (!anchor) return;
      // If same path (hash change), ignore
      try {
        const url = new URL(anchor.href, window.location.href);
        const current = new URL(window.location.href);
        if (url.pathname === current.pathname && url.search === current.search)
          return;
      } catch {}
      setLoading(true);
    };
    clickEventRef.current = handler;
    document.addEventListener("click", handler, true);
    return () => {
      document.removeEventListener("click", handler, true);
    };
  }, []);

  React.useEffect(() => {
    if (!loading) return;
    // Safety timeout in case navigation is cancelled
    const timeout = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timeout);
  }, [loading]);

  React.useEffect(() => {
    // Pathname changed => navigation finished
    setLoading(false);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm flex items-center justify-center">
      <div className="inline-flex items-center gap-2 text-muted-foreground">
        <svg
          className="size-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span>Carregando…</span>
      </div>
    </div>
  );
}

export default NavigationProgress;
