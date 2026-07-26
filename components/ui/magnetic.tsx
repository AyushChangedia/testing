"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn, isTouchDevice, prefersReducedMotion } from "@/lib/utils";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** How far the element is allowed to travel toward the pointer, in px. */
  strength?: number;
  as?: "div" | "span";
}

/**
 * Pulls its child toward the pointer while hovered, then springs home.
 * No-ops on touch devices and under reduced-motion.
 */
export function Magnetic({ children, className, strength = 18, as = "div" }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const spring = { stiffness: 260, damping: 18, mass: 0.6 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  const handleMove = (e: React.PointerEvent) => {
    if (isTouchDevice() || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    // Normalise by half-size so travel is proportional, not absolute.
    x.set((dx / (r.width / 2)) * strength);
    y.set((dy / (r.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const Comp = as === "span" ? motion.span : motion.div;

  return (
    <Comp
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
    >
      {children}
    </Comp>
  );
}

/** Inner label that counter-moves slightly, exaggerating the magnetic pull. */
export function MagneticLabel({ children, className }: { children: ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const tx = useTransform(x, (v) => v * 0.4);
  return (
    <motion.span style={{ x: tx }} className={cn("pointer-events-none block", className)}>
      {children}
    </motion.span>
  );
}
