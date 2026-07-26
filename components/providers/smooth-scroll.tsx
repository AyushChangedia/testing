"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/lib/utils";

let registered = false;

/**
 * Wires Lenis to GSAP's ticker so ScrollTrigger and Lenis share one RAF loop.
 * Two independent loops cause visible jitter on pinned sections.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }

    // Honour the OS setting: no hijacked scroll for reduced-motion users.
    if (prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Native momentum on touch feels better than an emulated one.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Expose for components that need to jump (nav links, palette).
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as Window & { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // Reset scroll + recalculate triggers on route change.
  useEffect(() => {
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}
