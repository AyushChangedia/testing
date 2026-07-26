"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[120] h-[2px] origin-left bg-gradient-to-r from-gold-700 via-gold-400 to-latte"
      style={{ scaleX }}
    />
  );
}
