"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Heart, Flame, Clock, Zap, MapPin } from "lucide-react";
import { useUI } from "@/lib/store/ui";
import { useCart } from "@/lib/store/cart";
import { getItem, SIZE_MULTIPLIER } from "@/lib/data/menu";
import { SmartImage } from "@/components/ui/smart-image";
import { Badge, Button, StarRating } from "@/components/ui/primitives";
import { cn, formatPrice, groupIndian } from "@/lib/utils";
import type { CartLine } from "@/lib/types";

const SIZES: Array<{ key: CartLine["size"]; label: string }> = [
  { key: "S", label: "Small" },
  { key: "M", label: "Regular" },
  { key: "L", label: "Large" },
];

export function QuickView() {
  const id = useUI((s) => s.quickViewId);
  const setQuickView = useUI((s) => s.setQuickView);
  const triggerFly = useUI((s) => s.triggerFly);
  const toast = useUI((s) => s.toast);

  const add = useCart((s) => s.add);
  const markViewed = useCart((s) => s.markViewed);
  const favorites = useCart((s) => s.favorites);
  const toggleFavorite = useCart((s) => s.toggleFavorite);

  const [size, setSize] = useState<CartLine["size"]>("M");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const item = id ? getItem(id) : null;

  // Reset per-item state and record the view.
  useEffect(() => {
    if (!id) return;
    setSize("M");
    setQty(1);
    setNote("");
    markViewed(id);
  }, [id, markViewed]);

  // Escape closes — required escape route for modals.
  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickView(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [id, setQuickView]);

  const isFav = item ? favorites.includes(item.id) : false;
  const price = item ? Math.round(item.price * SIZE_MULTIPLIER[size]) : 0;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[155] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-noir-950/80 backdrop-blur-lg"
            onClick={() => setQuickView(null)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="qv-title"
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="glass-strong relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] border border-line sm:max-w-4xl sm:rounded-[2rem]"
          >
            <button
              onClick={() => setQuickView(null)}
              aria-label="Close quick view"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-noir-950/60 text-fg backdrop-blur-md transition-colors hover:bg-noir-950"
            >
              <X size={18} />
            </button>

            <div className="grid gap-0 md:grid-cols-2">
              {/* Media */}
              <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[30rem]">
                <SmartImage
                  src={item.image}
                  alt={item.name}
                  seed={item.slug}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-950/85 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-noir-950/60" />
                <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <Badge key={t} tone={t === "bestseller" ? "gold" : t === "new" ? "new" : "default"}>
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Detail */}
              <div className="flex flex-col p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-[4px] border-2",
                      item.veg ? "border-veg" : "border-nonveg",
                    )}
                    aria-label={item.veg ? "Vegetarian" : "Non-vegetarian"}
                  >
                    <span className={cn("h-2 w-2 rounded-full", item.veg ? "bg-veg" : "bg-nonveg")} />
                  </span>
                  <span className="text-[0.6rem] uppercase tracking-[0.3em] text-gold-500">
                    {item.category}
                  </span>
                </div>

                <h2 id="qv-title" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                  {item.name}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <StarRating value={item.rating} size={14} showValue />
                  <span className="text-xs text-fg-subtle">
                    ({groupIndian(item.reviewCount)} reviews)
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-fg-muted">{item.description}</p>
                <p className="mt-3 border-l-2 border-gold-600/50 pl-4 text-xs italic leading-relaxed text-fg-subtle">
                  {item.story}
                </p>

                {/* Facts */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Fact icon={<Zap size={13} />} label="Calories" value={`${item.calories}`} />
                  <Fact icon={<Clock size={13} />} label="Prep" value={`${item.prepMinutes} min`} />
                  {item.caffeineMg != null && (
                    <Fact icon={<Flame size={13} />} label="Caffeine" value={`${item.caffeineMg}mg`} />
                  )}
                  <Fact
                    icon={<Flame size={13} />}
                    label="Spice"
                    value={item.spiceLevel === 0 ? "None" : "★".repeat(item.spiceLevel)}
                  />
                </div>

                {item.origin && (
                  <p className="mt-4 flex items-center gap-1.5 text-[0.68rem] text-fg-subtle">
                    <MapPin size={11} className="text-gold-500" />
                    Sourced from {item.origin}
                  </p>
                )}

                {/* Ingredients */}
                <div className="mt-5">
                  <p className="text-[0.6rem] uppercase tracking-[0.25em] text-fg-subtle">
                    Ingredients
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="rounded-full border border-line px-2.5 py-1 text-[0.62rem] text-fg-muted"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                  {item.allergens.length > 0 && (
                    <p className="mt-2.5 text-[0.62rem] text-danger/90">
                      Contains: {item.allergens.join(", ")}
                    </p>
                  )}
                </div>

                {/* Size */}
                <div className="mt-6">
                  <p className="mb-2 text-[0.6rem] uppercase tracking-[0.25em] text-fg-subtle">Size</p>
                  <div className="flex gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setSize(s.key)}
                        aria-pressed={size === s.key}
                        className={cn(
                          "h-11 flex-1 rounded-full border text-[0.65rem] uppercase tracking-[0.15em] transition-all duration-300",
                          size === s.key
                            ? "border-gold-500 bg-gold-500/12 text-gold-300"
                            : "border-line text-fg-muted hover:border-line-strong",
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div className="mt-4">
                  <label
                    htmlFor="qv-note"
                    className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.25em] text-fg-subtle"
                  >
                    Special request <span className="normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    id="qv-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Extra hot, oat milk, no sugar…"
                    className="h-11 w-full rounded-full border border-line bg-transparent px-4 text-xs text-fg outline-none transition-colors placeholder:text-fg-subtle/60 focus:border-accent"
                  />
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full border border-line p-1">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-surface-hover"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="tnum w-8 text-center text-sm">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(99, q + 1))}
                      aria-label="Increase quantity"
                      className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-surface-hover"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleFavorite(item.id)}
                    aria-label={isFav ? "Remove from wishlist" : "Save to wishlist"}
                    aria-pressed={isFav}
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isFav ? "border-danger text-danger" : "border-line hover:border-danger",
                    )}
                  >
                    <Heart size={16} className={cn(isFav && "fill-current")} />
                  </button>

                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      const el = document.querySelector("[data-cart-anchor]");
                      if (el) {
                        const r = el.getBoundingClientRect();
                        triggerFly({
                          from: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
                          image: item.image,
                          label: item.name,
                        });
                        void r;
                      }
                      add(item.id, size, qty);
                      toast({
                        title: "Added to cart",
                        body: `${qty} × ${item.name} (${size})`,
                        tone: "success",
                      });
                      setQuickView(null);
                    }}
                  >
                    Add · {formatPrice(price * qty)}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line px-3 py-2.5">
      <span className="flex items-center gap-1 text-[0.55rem] uppercase tracking-[0.18em] text-fg-subtle">
        {icon}
        {label}
      </span>
      <p className="tnum mt-1 text-sm text-fg">{value}</p>
    </div>
  );
}
