"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn, prefersReducedMotion } from "@/lib/utils";

/**
 * The page's living backdrop: gradient mesh, drifting blurred orbs, a moving
 * light sweep, grain, and a pointer-tracked spotlight. Fixed and pointer-inert,
 * so it costs nothing in layout and never intercepts clicks.
 */
export function AmbientBackground({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Background hue shifts as you travel down the page.
  const hueShift = useTransform(scrollYProgress, [0, 0.5, 1], [0, 18, -10]);
  const meshScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const meshRotate = useTransform(scrollYProgress, [0, 1], [0, 24]);
  // Hooks belong at the top level, never inside a JSX style object.
  const meshFilter = useTransform(hueShift, (v) => `hue-rotate(${v}deg)`);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || prefersReducedMotion()) return;

    let raf = 0;
    const target = { x: 50, y: 40 };
    const current = { x: 50, y: 40 };

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 100;
      target.y = (e.clientY / window.innerHeight) * 100;
    };

    const loop = () => {
      current.x += (target.x - current.x) * 0.045;
      current.y += (target.y - current.y) * 0.045;
      host.style.setProperty("--px", `${current.x}%`);
      host.style.setProperty("--py", `${current.y}%`);
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg", className)}
      style={{ ["--px" as string]: "50%", ["--py" as string]: "40%" }}
    >
      {/* Gradient mesh — the base colour field */}
      <motion.div
        className="absolute inset-[-25%]"
        style={{
          scale: meshScale,
          rotate: meshRotate,
          filter: meshFilter,
          background: `
            radial-gradient(48% 42% at 22% 26%, rgb(111 78 55 / 0.30), transparent 62%),
            radial-gradient(38% 36% at 80% 18%, rgb(212 175 55 / 0.15), transparent 60%),
            radial-gradient(52% 46% at 72% 78%, rgb(67 47 35 / 0.42), transparent 66%),
            radial-gradient(40% 40% at 12% 82%, rgb(169 116 79 / 0.16), transparent 62%)
          `,
        }}
      />

      {/* Drifting blurred orbs — depth layer */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-screen"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.left,
            top: orb.top,
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
            opacity: orb.opacity,
          }}
          animate={{
            x: [0, orb.dx, -orb.dx * 0.6, 0],
            y: [0, -orb.dy, orb.dy * 0.5, 0],
            scale: [1, 1.14, 0.94, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.4,
          }}
        />
      ))}

      {/* Pointer spotlight — the room lights follow you */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(520px circle at var(--px) var(--py), rgb(212 175 55 / 0.09), transparent 62%)",
        }}
      />

      {/* Slow light sweep across the whole field */}
      <motion.div
        className="absolute inset-y-0 w-[45%]"
        style={{
          background:
            "linear-gradient(100deg, transparent, rgb(240 221 166 / 0.045) 45%, transparent)",
        }}
        animate={{ left: ["-45%", "115%"] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", repeatDelay: 5 }}
      />

      {/* Fine vertical rule grid — architectural structure */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--fg) 1px, transparent 1px)",
          backgroundSize: "clamp(80px, 12vw, 190px) 100%",
        }}
      />

      {/* Vignette keeps focus centred */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(100% 78% at 50% 42%, transparent 42%, var(--bg) 100%)",
        }}
      />

      <div className="grain absolute inset-0" />
    </div>
  );
}

const ORBS = [
  { size: 620, left: "-8%", top: "2%", color: "rgb(111 78 55 / 0.5)", blur: 130, opacity: 0.55, dx: 130, dy: 90, duration: 26 },
  { size: 460, left: "62%", top: "-6%", color: "rgb(212 175 55 / 0.26)", blur: 120, opacity: 0.4, dx: -110, dy: 130, duration: 31 },
  { size: 540, left: "48%", top: "58%", color: "rgb(169 116 79 / 0.34)", blur: 145, opacity: 0.45, dx: 90, dy: -110, duration: 35 },
  { size: 380, left: "6%", top: "62%", color: "rgb(67 47 35 / 0.6)", blur: 110, opacity: 0.5, dx: 140, dy: 70, duration: 29 },
  { size: 300, left: "82%", top: "40%", color: "rgb(240 221 166 / 0.14)", blur: 100, opacity: 0.35, dx: -80, dy: -90, duration: 23 },
];
