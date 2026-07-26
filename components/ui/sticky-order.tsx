"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart, selectCount, selectSubtotal } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { formatPrice } from "@/lib/utils";

/**
 * Persistent order affordance that appears past the hero. Shows the live cart
 * when there is one, otherwise a plain call to action.
 */
export function StickyOrderButton() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const count = useCart(selectCount);
  const cart = useCart();
  const subtotal = selectSubtotal(cart);

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 900));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          // Sits clear of the mobile bottom nav.
          className="fixed bottom-24 right-4 z-[145] hidden lg:bottom-8 lg:right-8 lg:block"
        >
          {count > 0 ? (
            <button
              onClick={() => setCartOpen(true)}
              className="btn-sheen group relative flex h-14 items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 pl-5 pr-6 text-noir-950 shadow-[0_14px_50px_-12px_rgb(212_175_55_/_0.8)] transition-transform hover:scale-105 active:scale-100"
            >
              <span className="relative flex items-center gap-3">
                <span className="relative">
                  <ShoppingBag size={18} />
                  <span className="tnum absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-noir-950 px-1 text-[0.55rem] font-semibold text-gold-400">
                    {count}
                  </span>
                </span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[0.55rem] uppercase tracking-[0.2em] opacity-70">
                    View order
                  </span>
                  <span className="tnum text-sm font-semibold">{formatPrice(subtotal)}</span>
                </span>
              </span>
            </button>
          ) : (
            <Link
              href="/menu"
              className="btn-sheen relative flex h-14 items-center gap-2 overflow-hidden rounded-full border border-line glass-strong px-7 text-[0.66rem] uppercase tracking-[0.22em] text-fg transition-colors hover:border-accent hover:text-accent"
            >
              <ShoppingBag size={15} />
              Order Now
            </Link>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
