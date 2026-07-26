"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Coffee, CalendarDays } from "lucide-react";
import { Button, SplitText } from "@/components/ui/primitives";
import { scrollToId } from "@/components/providers/smooth-scroll";
import { useUI } from "@/lib/store/ui";

// The 3D scene is heavy and below-the-hero on mobile — never block first paint.
const CoffeeScene = dynamic(
  () => import("@/components/three/coffee-scene").then((m) => m.CoffeeScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-40 w-40 rounded-full bg-gradient-to-br from-mocha/30 to-transparent blur-3xl" />
      </div>
    ),
  },
);

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const introDone = useUI((s) => s.introDone);

  /*
   * The hero copy is cued off the intro, but it must never depend on it alone.
   * The loader advances on requestAnimationFrame, which browsers throttle in a
   * background tab — so a stalled intro would otherwise leave the headline
   * invisible indefinitely. This fallback guarantees the reveal either way.
   */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (introDone) {
      setReady(true);
      return;
    }
    const id = window.setTimeout(() => setReady(true), 4200);
    return () => window.clearTimeout(id);
  }, [introDone]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Cinematic depart: text lifts and blurs, scene sinks and scales.
  const textY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const textBlur = useTransform(scrollYProgress, [0, 0.6], ["blur(0px)", "blur(12px)"]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.22]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pb-24 pt-32"
    >
      {/* 3D layer */}
      <motion.div
        style={{ y: sceneY, scale: sceneScale }}
        className="absolute inset-0 z-0"
        aria-hidden
      >
        <CoffeeScene className="h-full w-full" />
      </motion.div>

      {/* Liquid wave behind the headline */}
      <motion.svg
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[54%] z-[1] w-[150%] -translate-x-1/2 -translate-y-1/2 opacity-40 sm:w-[110%]"
        viewBox="0 0 1200 300"
        style={{ opacity: textOpacity }}
      >
        <defs>
          <linearGradient id="wave-a" x1="0" x2="1">
            <stop offset="0%" stopColor="#6f4e37" stopOpacity="0" />
            <stop offset="50%" stopColor="#d4af37" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#6f4e37" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave-b" x1="0" x2="1">
            <stop offset="0%" stopColor="#a9744f" stopOpacity="0" />
            <stop offset="50%" stopColor="#a9744f" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a9744f" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 150 Q150 90 300 150 T600 150 T900 150 T1200 150"
          stroke="url(#wave-a)"
          strokeWidth="1.5"
          fill="none"
          animate={{
            d: [
              "M0 150 Q150 90 300 150 T600 150 T900 150 T1200 150",
              "M0 150 Q150 210 300 150 T600 150 T900 150 T1200 150",
              "M0 150 Q150 90 300 150 T600 150 T900 150 T1200 150",
            ],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0 170 Q200 120 400 170 T800 170 T1200 170"
          stroke="url(#wave-b)"
          strokeWidth="1"
          fill="none"
          animate={{
            d: [
              "M0 170 Q200 120 400 170 T800 170 T1200 170",
              "M0 170 Q200 220 400 170 T800 170 T1200 170",
              "M0 170 Q200 120 400 170 T800 170 T1200 170",
            ],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        />
      </motion.svg>

      {/* Legibility scrim — the 3D scene behind the copy is bright in places,
          and body text must clear 4.5:1 wherever the cup happens to rotate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(58% 44% at 50% 52%, rgb(5 4 3 / 0.82) 0%, rgb(5 4 3 / 0.55) 45%, transparent 78%)",
        }}
      />

      {/* Headline block */}
      <motion.div
        style={{ y: textY, opacity: textOpacity, filter: textBlur }}
        className="container-x relative z-10 flex flex-col items-center text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 18 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 inline-flex items-center gap-3 rounded-full border border-line px-5 py-2 text-[0.58rem] uppercase tracking-[0.42em] text-gold-500 backdrop-blur-sm"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-400" />
          </span>
          Est. 2014 · Direct Trade Roastery
        </motion.span>

        <h1 className="font-display text-hero text-balance">
          <span className="block overflow-hidden pb-[0.08em]">
            <SplitText
              text="Every Cup"
              charClassName="text-gradient-cream"
              active={ready}
              delay={0.3}
              stagger={0.035}
            />
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <SplitText
              text="Tells A Story."
              className="italic"
              charClassName="text-gradient-gold-v"
              active={ready}
              delay={0.52}
              stagger={0.035}
            />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 26 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-fg-muted sm:text-lg"
        >
          Single-origin beans traced to the farm, roasted nine days before they reach your cup, and
          poured in a room built for staying longer than you planned.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.22, ease: [0.16, 1, 0.3, 1] }}
          className="mt-11 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" magnetic className="w-full sm:w-auto">
            <Link href="/menu">
              <Coffee size={14} />
              Order Now
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            magnetic
            className="w-full sm:w-auto"
            onClick={() => scrollToId("menu")}
          >
            Explore Menu
          </Button>
          <Button asChild variant="ghost" size="lg" magnetic className="w-full sm:w-auto">
            <Link href="/booking">
              <CalendarDays size={14} />
              Book a Table
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.button
        onClick={() => scrollToId("story")}
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 1.8, duration: 1 }}
        style={{ opacity: textOpacity }}
        aria-label="Scroll to the story section"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-fg-subtle transition-colors hover:text-gold-400"
      >
        <span className="text-[0.55rem] uppercase tracking-[0.42em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={15} />
        </motion.span>
      </motion.button>

      {/* Bottom fade into the next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-t from-bg to-transparent" />
    </section>
  );
}
