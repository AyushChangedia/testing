"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useUI } from "@/lib/store/ui";
import { prefersReducedMotion } from "@/lib/utils";

const PHASES = ["Grinding", "Tamping", "Extracting", "Steaming", "Serving"];

/**
 * Loading screen: a cup that fills with coffee as progress advances, then a
 * curtain-lift reveal into the homepage.
 */
export function Loader() {
  const setBooted = useUI((s) => s.setBooted);
  const setIntroDone = useUI((s) => s.setIntroDone);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const startedAt = useRef(Date.now());

  const p = useMotionValue(0);
  const smooth = useSpring(p, { stiffness: 60, damping: 20 });
  const fillHeight = useTransform(smooth, (v) => `${v}%`);
  const waveY = useTransform(smooth, (v) => `${100 - v}%`);
  // Must live at the top level: calling this inside the conditional JSX below
  // changes the hook count when the loader exits, which crashes the tree.
  const barScaleX = useTransform(smooth, (v) => v / 100);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const duration = reduced ? 700 : 2600;

    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - startedAt.current;
      // Ease-out so it decelerates into 100 rather than snapping.
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 2.4);
      const next = Math.round(eased * 100);
      setProgress(next);
      p.set(next);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setBooted(true);
        window.setTimeout(() => setExiting(true), reduced ? 60 : 320);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [p, setBooted]);

  // Lock scroll while the loader owns the screen.
  useEffect(() => {
    if (gone) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [gone]);

  const phase = PHASES[Math.min(PHASES.length - 1, Math.floor((progress / 100) * PHASES.length))];

  return (
    <AnimatePresence
      onExitComplete={() => {
        setGone(true);
        setIntroDone(true);
      }}
    >
      {!exiting && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-noir-950"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Curtain panels that split apart on exit */}
          <motion.div
            className="absolute inset-x-0 top-0 z-10 bg-noir-950"
            initial={{ height: "50%" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-10 bg-noir-950"
            initial={{ height: "50%" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          />

          <div className="relative z-20 flex flex-col items-center gap-10 px-6">
            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <p className="font-display text-4xl tracking-[0.32em] text-gradient-gold sm:text-5xl">
                NOIR
              </p>
              <p className="mt-2 text-[0.6rem] uppercase tracking-[0.65em] text-cream-400">
                Café &amp; Roastery
              </p>
            </motion.div>

            {/* The filling cup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <svg width="132" height="150" viewBox="0 0 132 150" fill="none" aria-hidden>
                <defs>
                  <clipPath id="cup-interior">
                    {/* Tapered cup interior — the fill is masked to this shape. */}
                    <path d="M27 34 L105 34 L95 122 Q94 132 84 132 L48 132 Q38 132 37 122 Z" />
                  </clipPath>
                  <linearGradient id="brew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8a5a33" />
                    <stop offset="45%" stopColor="#4a2f1d" />
                    <stop offset="100%" stopColor="#1a100a" />
                  </linearGradient>
                  <linearGradient id="rim-gold" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8f6f1f" />
                    <stop offset="50%" stopColor="#f0dda6" />
                    <stop offset="100%" stopColor="#8f6f1f" />
                  </linearGradient>
                </defs>

                {/* Saucer */}
                <ellipse cx="66" cy="141" rx="52" ry="7" fill="#141010" />
                <ellipse cx="66" cy="139" rx="52" ry="7" stroke="url(#rim-gold)" strokeWidth="1" fill="none" opacity="0.5" />

                {/* Handle */}
                <path
                  d="M105 52 Q126 56 126 74 Q126 92 103 96"
                  stroke="url(#rim-gold)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.85"
                />

                {/* Liquid, clipped to the interior */}
                <g clipPath="url(#cup-interior)">
                  <motion.g style={{ y: waveY }}>
                    <rect x="20" y="0" width="92" height="140" fill="url(#brew)" />
                    {/* Surface wave riding on top of the fill */}
                    <motion.path
                      d="M20 0 Q34 -7 48 0 T76 0 T104 0 T132 0 L132 12 L20 12 Z"
                      fill="#8a5a33"
                      animate={{ x: [0, -28, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      opacity="0.9"
                    />
                  </motion.g>
                </g>
                <motion.rect
                  x="20"
                  width="92"
                  fill="url(#brew)"
                  style={{ height: fillHeight, y: 0 }}
                  clipPath="url(#cup-interior)"
                  opacity="0"
                />

                {/* Cup outline drawn over the liquid */}
                <path
                  d="M27 34 L105 34 L95 122 Q94 132 84 132 L48 132 Q38 132 37 122 Z"
                  stroke="url(#rim-gold)"
                  strokeWidth="2.5"
                  fill="none"
                />
                <ellipse cx="66" cy="34" rx="39" ry="7" stroke="url(#rim-gold)" strokeWidth="2.5" fill="none" />

                {/* Steam wisps */}
                {[0, 1, 2].map((i) => (
                  <motion.path
                    key={i}
                    d={`M${52 + i * 14} 24 q6 -10 0 -20 q-6 -10 0 -18`}
                    stroke="#d9cdbb"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: [0, 0.55, 0], pathLength: [0, 1, 1], y: [6, -10] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      delay: i * 0.45,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </svg>
            </motion.div>

            {/* Progress readout */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="flex w-[min(78vw,22rem)] flex-col gap-3"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[0.62rem] uppercase tracking-[0.4em] text-cream-400">
                  {phase}
                </span>
                <span className="tnum font-display text-2xl text-gold-400">
                  {String(progress).padStart(3, "0")}
                </span>
              </div>
              <div className="h-px w-full overflow-hidden bg-cream-100/12">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-700 via-gold-400 to-gold-300"
                  style={{ scaleX: barScaleX, transformOrigin: "left" }}
                />
              </div>
            </motion.div>
          </div>

          <div className="grain pointer-events-none absolute inset-0 z-30" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
