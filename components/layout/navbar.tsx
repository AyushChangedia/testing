"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X, ShoppingBag, Search, Sun, Moon, Volume2, VolumeX, Globe } from "lucide-react";
import { useUI } from "@/lib/store/ui";
import { useCart, selectCount } from "@/lib/store/cart";
import { Button } from "@/components/ui/primitives";
import { Magnetic } from "@/components/ui/magnetic";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Menu", href: "/menu" },
  { label: "Story", href: "/#story" },
  { label: "Origins", href: "/#origins" },
  { label: "Events", href: "/#events" },
  { label: "Book", href: "/booking" },
];

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हि" },
  { code: "fr", label: "FR" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);

  const { theme, setTheme, soundOn, toggleSound, setCartOpen, setPaletteOpen, cartPulse, locale, setLocale } =
    useUI();
  const count = useCart(selectCount);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    // Hide on scroll down, reveal on scroll up — but never near the top.
    setHidden(y > prev && y > 320 && !mobileOpen);
  });

  // Close the mobile sheet on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-[130] transition-[background-color,backdrop-filter,border-color,padding] duration-500",
          scrolled
            ? "border-b border-line glass-strong py-3"
            : "border-b border-transparent py-5 sm:py-7",
        )}
      >
        <nav className="container-x flex items-center justify-between gap-4">
          {/* Wordmark */}
          <Magnetic strength={9}>
            <Link href="/" className="group flex items-baseline gap-2" aria-label="Noir Café, home">
              <span className="font-display text-xl tracking-[0.3em] text-gradient-gold sm:text-2xl">
                NOIR
              </span>
              <span className="hidden text-[0.55rem] uppercase tracking-[0.4em] text-fg-subtle transition-colors group-hover:text-gold-500 sm:inline">
                Café
              </span>
            </Link>
          </Magnetic>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-9 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Magnetic strength={7}>
                    <Link
                      href={item.href}
                      data-active={active}
                      className="link-underline text-[0.68rem] uppercase tracking-[0.28em] text-fg-muted transition-colors hover:text-fg data-[active=true]:text-fg"
                    >
                      {item.label}
                    </Link>
                  </Magnetic>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Search the menu — press Control K"
              className="hidden h-11 items-center gap-2 rounded-full border border-line px-4 text-[0.62rem] uppercase tracking-[0.2em] text-fg-subtle transition-colors hover:border-accent hover:text-accent md:inline-flex"
            >
              <Search size={13} />
              <span>Search</span>
              <kbd className="ml-1 rounded border border-line px-1.5 py-0.5 text-[0.55rem] tracking-normal">
                ⌘K
              </kbd>
            </button>

            {/* Locale */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLocaleOpen((v) => !v)}
                aria-label="Change language"
                aria-expanded={localeOpen}
                className="flex h-11 w-11 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
              >
                <Globe size={16} />
              </button>
              <AnimatePresence>
                {localeOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="glass-strong absolute right-0 top-full mt-2 w-24 overflow-hidden rounded-xl p-1"
                  >
                    {LOCALES.map((l) => (
                      <li key={l.code}>
                        <button
                          onClick={() => {
                            setLocale(l.code);
                            setLocaleOpen(false);
                          }}
                          className={cn(
                            "w-full rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-surface-hover",
                            locale === l.code ? "text-gold-400" : "text-fg-muted",
                          )}
                        >
                          {l.label}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Sound */}
            <button
              onClick={toggleSound}
              aria-label={soundOn ? "Mute ambient sound" : "Play ambient sound"}
              aria-pressed={soundOn}
              className="flex h-11 w-11 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Theme */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ y: 18, opacity: 0, rotate: -40 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -18, opacity: 0, rotate: 40 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute"
                >
                  {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Cart */}
            <motion.button
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
              data-cart-anchor
              animate={cartPulse ? { rotate: [0, -13, 11, -7, 0], scale: [1, 1.14, 1] } : undefined}
              transition={{ duration: 0.55, ease: "easeInOut" }}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-hover"
            >
              <ShoppingBag size={17} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="tnum absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-500 px-1 text-[0.6rem] font-semibold text-noir-950"
                  >
                    {count > 99 ? "99+" : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <Button asChild size="sm" className="ml-1 hidden xl:inline-flex" magnetic>
              <Link href="/menu">Order Now</Link>
            </Button>

            {/* Mobile trigger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-hover lg:hidden"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[125] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-noir-950/80 backdrop-blur-xl"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
              className="glass-strong relative flex h-full flex-col justify-center gap-2 px-8 pb-28 pt-24"
            >
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 + i * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={item.href}
                    className="block border-b border-line py-5 font-display text-4xl text-fg transition-colors hover:text-gold-400"
                  >
                    <span className="mr-4 text-xs tracking-widest text-gold-600">
                      0{i + 1}
                    </span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex gap-3"
              >
                <Button asChild size="md" className="flex-1">
                  <Link href="/menu">Order Now</Link>
                </Button>
                <Button asChild variant="outline" size="md" className="flex-1">
                  <Link href="/booking">Book a Table</Link>
                </Button>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
