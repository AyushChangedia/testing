"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Coffee, CalendarDays, Home, LayoutDashboard, Mic, ShoppingBag, Heart } from "lucide-react";
import { useUI } from "@/lib/store/ui";
import { useCart } from "@/lib/store/cart";
import { MENU } from "@/lib/data/menu";
import { formatPrice } from "@/lib/utils";

/** ⌘K / Ctrl+K palette: navigation, menu search, and quick actions. */
export function CommandPalette() {
  const open = useUI((s) => s.paletteOpen);
  const setOpen = useUI((s) => s.setPaletteOpen);
  const setQuickView = useUI((s) => s.setQuickView);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const toast = useUI((s) => s.toast);
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
        return;
      }

      // Escape must work even though focus is inside the search input, so it is
      // handled before the typing guard below.
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
        return;
      }

      // Single-key shortcuts, but never while typing in a field.
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "/") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key.toLowerCase() === "c") setCartOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen, setCartOpen]);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[180] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-noir-950/80 backdrop-blur-lg"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ y: -22, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -14, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="glass-strong relative w-full max-w-2xl overflow-hidden rounded-2xl border border-line shadow-[0_40px_120px_-30px_rgb(0_0_0_/_0.9)]"
          >
            <Command shouldFilter loop label="Command palette">
              <div className="flex items-center gap-3 border-b border-line px-5">
                <Search size={16} className="shrink-0 text-fg-subtle" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  autoFocus
                  placeholder="Search the menu, jump to a page, or run an action…"
                  className="h-14 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle/70"
                />
                {/* Voice search UI — visual affordance for a real STT hookup */}
                <button
                  onClick={() => {
                    setListening((v) => !v);
                    toast({
                      title: listening ? "Voice search stopped" : "Voice search is a demo",
                      body: listening ? undefined : "Wire this to the Web Speech API to go live.",
                    });
                  }}
                  aria-label="Voice search"
                  aria-pressed={listening}
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fg-subtle transition-colors hover:text-gold-400"
                >
                  {listening && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-danger/25"
                      animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  )}
                  <Mic size={15} className={listening ? "text-danger" : undefined} />
                </button>
                <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-[0.6rem] text-fg-subtle sm:block">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[54vh] overflow-y-auto p-2">
                <Command.Empty className="px-4 py-10 text-center text-sm text-fg-muted">
                  Nothing matched “{query}”. Try “latte”, “pizza”, or “booking”.
                </Command.Empty>

                <Command.Group
                  heading="Navigate"
                  className="px-2 py-1.5 text-[0.58rem] uppercase tracking-[0.28em] text-fg-subtle [&_[cmdk-group-items]]:mt-1"
                >
                  <Row icon={<Home size={14} />} label="Home" onSelect={() => go("/")} />
                  <Row icon={<Coffee size={14} />} label="Full Menu" onSelect={() => go("/menu")} />
                  <Row
                    icon={<CalendarDays size={14} />}
                    label="Book a Table"
                    onSelect={() => go("/booking")}
                  />
                  <Row
                    icon={<ShoppingBag size={14} />}
                    label="Checkout"
                    onSelect={() => go("/checkout")}
                  />
                  <Row
                    icon={<LayoutDashboard size={14} />}
                    label="Admin Dashboard"
                    onSelect={() => go("/admin")}
                  />
                </Command.Group>

                <Command.Group
                  heading="Actions"
                  className="px-2 py-1.5 text-[0.58rem] uppercase tracking-[0.28em] text-fg-subtle [&_[cmdk-group-items]]:mt-1"
                >
                  <Row
                    icon={<ShoppingBag size={14} />}
                    label="Open cart"
                    hint="C"
                    onSelect={() => {
                      setOpen(false);
                      setCartOpen(true);
                    }}
                  />
                  <Row
                    icon={<Heart size={14} />}
                    label="Reorder my usual — Midnight Velvet Latte"
                    onSelect={() => {
                      add("c01", "M", 1);
                      setOpen(false);
                      toast({ title: "Reordered", body: "Midnight Velvet Latte", tone: "success" });
                    }}
                  />
                </Command.Group>

                <Command.Group
                  heading="Menu"
                  className="px-2 py-1.5 text-[0.58rem] uppercase tracking-[0.28em] text-fg-subtle [&_[cmdk-group-items]]:mt-1"
                >
                  {MENU.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={`${item.name} ${item.category} ${item.ingredients.join(" ")}`}
                      onSelect={() => {
                        setOpen(false);
                        setQuickView(item.id);
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-fg-muted transition-colors data-[selected=true]:bg-surface-hover data-[selected=true]:text-fg"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface text-[0.6rem] text-gold-500">
                        {item.category.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="flex-1 truncate">{item.name}</span>
                      <span className="tnum shrink-0 text-xs text-gold-400">
                        {formatPrice(item.price)}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[0.58rem] text-fg-subtle">
                <span className="flex gap-3">
                  <span>↑↓ navigate</span>
                  <span>↵ select</span>
                </span>
                <span>Noir Café</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  icon,
  label,
  hint,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-fg-muted transition-colors data-[selected=true]:bg-surface-hover data-[selected=true]:text-fg"
    >
      <span className="text-gold-500">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && (
        <kbd className="rounded border border-line px-1.5 py-0.5 text-[0.55rem]">{hint}</kbd>
      )}
    </Command.Item>
  );
}
