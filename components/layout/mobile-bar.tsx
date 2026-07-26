"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { Home, Coffee, CalendarDays, ShoppingBag, Search } from "lucide-react";
import { useUI } from "@/lib/store/ui";
import { useCart, selectCount } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Menu", href: "/menu", icon: Coffee },
  { label: "Book", href: "/booking", icon: CalendarDays },
] as const;

/** Bottom navigation for small screens — 4 destinations max, always labelled. */
export function MobileBar() {
  const pathname = usePathname();
  const setCartOpen = useUI((s) => s.setCartOpen);
  const setPaletteOpen = useUI((s) => s.setPaletteOpen);
  const count = useCart(selectCount);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240);
  });

  return (
    <motion.nav
      aria-label="Primary"
      animate={{ y: hidden ? 110 : 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong fixed inset-x-0 bottom-0 z-[140] border-t border-line lg:hidden"
      // Keep clear of the iOS home indicator.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch justify-around px-2 py-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl transition-colors",
                  active ? "text-gold-400" : "text-fg-subtle",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-tab"
                    className="absolute inset-0 rounded-xl bg-gold-500/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={18} className="relative" />
                <span className="relative text-[0.58rem] uppercase tracking-[0.14em]">
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}

        <li className="flex-1">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex min-h-[52px] w-full flex-col items-center justify-center gap-1 rounded-xl text-fg-subtle"
          >
            <Search size={18} />
            <span className="text-[0.58rem] uppercase tracking-[0.14em]">Search</span>
          </button>
        </li>

        <li className="flex-1">
          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart, ${count} items`}
            className="relative flex min-h-[52px] w-full flex-col items-center justify-center gap-1 rounded-xl text-fg-subtle"
          >
            <span className="relative">
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="tnum absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.55rem] font-semibold text-noir-950">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </span>
            <span className="text-[0.58rem] uppercase tracking-[0.14em]">Cart</span>
          </button>
        </li>
      </ul>
    </motion.nav>
  );
}
