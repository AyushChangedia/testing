"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUI } from "@/lib/store/ui";
import { SmartImage } from "@/components/ui/smart-image";
import { prefersReducedMotion } from "@/lib/utils";

/**
 * Arcs a thumbnail of the added item from the card to the cart icon, trailing
 * coffee beans behind it. Purely decorative — the cart count updates
 * independently, so nothing breaks if this is skipped.
 */
export function FlyToCart() {
  const fly = useUI((s) => s.fly);
  const clearFly = useUI((s) => s.clearFly);
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!fly) return;
    if (prefersReducedMotion()) {
      clearFly();
      return;
    }
    const anchor = document.querySelector("[data-cart-anchor]");
    if (!anchor) {
      clearFly();
      return;
    }
    const r = anchor.getBoundingClientRect();
    setTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

    const id = window.setTimeout(clearFly, 950);
    return () => window.clearTimeout(id);
  }, [fly, clearFly]);

  return (
    <AnimatePresence>
      {fly && target && (
        <>
          {/* The item itself */}
          <motion.div
            key={fly.key}
            initial={{
              x: fly.from.x - 40,
              y: fly.from.y - 40,
              scale: 1,
              opacity: 1,
              borderRadius: 16,
            }}
            animate={{
              x: target.x - 18,
              y: target.y - 18,
              scale: 0.18,
              opacity: 0.9,
              borderRadius: 999,
            }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.85, ease: [0.32, 0.06, 0.25, 1] }}
            className="pointer-events-none fixed left-0 top-0 z-[170] h-20 w-20 overflow-hidden shadow-[0_10px_40px_-8px_rgb(212_175_55_/_0.7)]"
          >
            <SmartImage
              src={fly.image}
              alt=""
              seed={fly.label}
              fill
              sizes="80px"
              className="object-cover"
            />
          </motion.div>

          {/* Bean trail */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={`${fly.key}-b${i}`}
              initial={{ x: fly.from.x, y: fly.from.y, opacity: 0, scale: 0.4 }}
              animate={{
                x: target.x,
                y: target.y,
                opacity: [0, 1, 0],
                scale: [0.4, 1, 0.3],
              }}
              transition={{
                duration: 0.9,
                delay: 0.05 + i * 0.05,
                ease: [0.32, 0.06, 0.25, 1],
              }}
              className="pointer-events-none fixed left-0 top-0 z-[169] h-2 w-2.5 rounded-full bg-gradient-to-br from-caramel to-espresso"
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
}
