"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Leaf, Flame, Star, Scale, ArrowUpDown } from "lucide-react";
import { MENU, CATEGORIES, PRICE_BOUNDS } from "@/lib/data/menu";
import { ItemCard } from "@/components/menu/item-card";
import { Badge, Button } from "@/components/ui/primitives";
import { useCart } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { cn, formatPrice } from "@/lib/utils";
import type { Category, MenuItem } from "@/lib/types";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "calories";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "featured", label: "Featured" },
  { key: "rating", label: "Top rated" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "calories", label: "Lightest first" },
];

const DIETS = [
  { key: "veg", label: "Vegetarian", icon: Leaf },
  { key: "mild", label: "Not spicy", icon: Flame },
  { key: "top", label: "4.8+ rating", icon: Star },
] as const;

/** Scores an item against a query; higher is better, 0 means no match. */
function score(item: MenuItem, q: string) {
  if (!q) return 1;
  const needle = q.toLowerCase();
  const name = item.name.toLowerCase();

  if (name === needle) return 100;
  if (name.startsWith(needle)) return 80;
  if (name.includes(needle)) return 60;
  if (item.category.toLowerCase().includes(needle)) return 40;
  if (item.ingredients.some((i) => i.toLowerCase().includes(needle))) return 30;
  if (item.description.toLowerCase().includes(needle)) return 18;
  if (item.origin?.toLowerCase().includes(needle)) return 14;
  // Fuzzy: all query characters appear in order somewhere in the name.
  let cursor = 0;
  for (const ch of needle) {
    cursor = name.indexOf(ch, cursor);
    if (cursor === -1) return 0;
    cursor++;
  }
  return 6;
}

export function MenuBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [maxPrice, setMaxPrice] = useState(PRICE_BOUNDS.max);
  const [diets, setDiets] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Keeps typing responsive while the grid re-filters.
  const deferredQuery = useDeferredValue(query);

  const favorites = useCart((s) => s.favorites);
  const recentlyViewed = useCart((s) => s.recentlyViewed);
  const compare = useCart((s) => s.compare);
  const clearCompare = useCart((s) => s.clearCompare);
  const setQuickView = useUI((s) => s.setQuickView);

  const results = useMemo(() => {
    const scored = MENU.map((item) => ({ item, s: score(item, deferredQuery.trim()) })).filter(
      (r) => r.s > 0,
    );

    let list = scored
      .filter(({ item }) => category === "All" || item.category === category)
      .filter(({ item }) => item.price <= maxPrice)
      .filter(({ item }) => !diets.includes("veg") || item.veg)
      .filter(({ item }) => !diets.includes("mild") || item.spiceLevel === 0)
      .filter(({ item }) => !diets.includes("top") || item.rating >= 4.8);

    switch (sort) {
      case "price-asc":
        list = list.sort((a, b) => a.item.price - b.item.price);
        break;
      case "price-desc":
        list = list.sort((a, b) => b.item.price - a.item.price);
        break;
      case "rating":
        list = list.sort((a, b) => b.item.rating - a.item.rating);
        break;
      case "calories":
        list = list.sort((a, b) => a.item.calories - b.item.calories);
        break;
      default:
        // Relevance first when searching, otherwise bestsellers bubble up.
        list = list.sort((a, b) => {
          if (deferredQuery.trim()) return b.s - a.s;
          const rank = (m: MenuItem) =>
            (m.tags.includes("bestseller") ? 2 : 0) + (m.tags.includes("chef") ? 1 : 0);
          return rank(b.item) - rank(a.item) || b.item.rating - a.item.rating;
        });
    }

    return list.map((r) => r.item);
  }, [deferredQuery, category, sort, maxPrice, diets]);

  const activeFilters =
    (category !== "All" ? 1 : 0) + diets.length + (maxPrice < PRICE_BOUNDS.max ? 1 : 0);

  const reset = () => {
    setCategory("All");
    setDiets([]);
    setMaxPrice(PRICE_BOUNDS.max);
    setQuery("");
  };

  const compareItems = MENU.filter((m) => compare.includes(m.id));
  const favoriteItems = MENU.filter((m) => favorites.includes(m.id));
  const recentItems = recentlyViewed
    .map((id) => MENU.find((m) => m.id === id))
    .filter((m): m is MenuItem => Boolean(m));

  return (
    <div className="container-x pb-24">
      {/* Search + controls */}
      <div className="sticky top-20 z-30 -mx-[clamp(1.25rem,4vw,3.5rem)] px-[clamp(1.25rem,4vw,3.5rem)] py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-fg-subtle"
            />
            <label htmlFor="menu-search" className="sr-only">
              Search the menu
            </label>
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${MENU.length} items — try “truffle”, “cold brew”, “pistachio”…`}
              className="h-14 w-full rounded-full border border-line bg-bg-elevated/70 pl-13 pr-12 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle/65 focus:border-accent"
              style={{ paddingLeft: "3.25rem" }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex gap-3">
            <div className="relative flex-1 lg:flex-none">
              <ArrowUpDown
                size={14}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle"
              />
              <label htmlFor="menu-sort" className="sr-only">
                Sort results
              </label>
              <select
                id="menu-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-14 w-full cursor-pointer appearance-none rounded-full border border-line bg-bg-elevated/70 pl-10 pr-9 text-xs text-fg outline-none transition-colors focus:border-accent lg:w-56"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key} className="bg-noir-900">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className={cn(
                "relative flex h-14 items-center gap-2 rounded-full border px-6 text-xs transition-colors",
                filtersOpen || activeFilters
                  ? "border-gold-500 text-gold-400"
                  : "border-line text-fg-muted hover:border-line-strong",
              )}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilters > 0 && (
                <span className="tnum flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.6rem] font-semibold text-noir-950">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {(["All", ...CATEGORIES] as const).map((cat) => {
            const active = category === cat;
            const n = cat === "All" ? MENU.length : MENU.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                aria-pressed={active}
                className={cn(
                  "relative h-11 shrink-0 rounded-full border px-5 text-[0.65rem] uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "border-transparent text-noir-950"
                    : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="cat-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-500 to-gold-400"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">
                  {cat}
                  <span className="tnum ml-1.5 opacity-60">{n}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter drawer */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid gap-6 rounded-2xl border border-line bg-bg-elevated/70 p-6 sm:grid-cols-2">
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.25em] text-fg-subtle">
                    Dietary
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DIETS.map((d) => {
                      const on = diets.includes(d.key);
                      return (
                        <button
                          key={d.key}
                          onClick={() =>
                            setDiets((prev) =>
                              on ? prev.filter((x) => x !== d.key) : [...prev, d.key],
                            )
                          }
                          aria-pressed={on}
                          className={cn(
                            "flex h-11 items-center gap-2 rounded-full border px-4 text-xs transition-colors",
                            on
                              ? "border-veg bg-veg/12 text-veg"
                              : "border-line text-fg-muted hover:border-line-strong",
                          )}
                        >
                          <d.icon size={13} />
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="price-range"
                    className="flex items-baseline justify-between text-[0.6rem] uppercase tracking-[0.25em] text-fg-subtle"
                  >
                    Max price
                    <span className="tnum text-sm normal-case tracking-normal text-gold-400">
                      {formatPrice(maxPrice)}
                    </span>
                  </label>
                  <input
                    id="price-range"
                    type="range"
                    min={PRICE_BOUNDS.min}
                    max={PRICE_BOUNDS.max}
                    step={10}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface accent-gold-500"
                  />
                  <div className="tnum mt-2 flex justify-between text-[0.6rem] text-fg-subtle">
                    <span>{formatPrice(PRICE_BOUNDS.min)}</span>
                    <span>{formatPrice(PRICE_BOUNDS.max)}</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Button variant="ghost" size="sm" onClick={reset}>
                    Reset all filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result count */}
      <p className="mt-6 text-xs text-fg-subtle" role="status" aria-live="polite">
        <span className="tnum text-fg">{results.length}</span>{" "}
        {results.length === 1 ? "item" : "items"}
        {query && (
          <>
            {" "}
            for “<span className="text-gold-400">{query}</span>”
          </>
        )}
      </p>

      {/* Grid */}
      {results.length > 0 ? (
        <motion.div
          layout
          className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {results.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-5 rounded-2xl border border-dashed border-line py-20 text-center">
          <Search size={30} className="text-fg-subtle" />
          <div>
            <p className="font-display text-2xl">Nothing matches that</p>
            <p className="mt-2 max-w-sm text-sm text-fg-muted">
              Try a broader search, or clear the filters to see all forty items.
            </p>
          </div>
          <Button variant="outline" size="md" onClick={reset}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Recently viewed */}
      {recentItems.length > 0 && (
        <Rail title="Recently viewed" items={recentItems} onOpen={setQuickView} />
      )}

      {/* Wishlist */}
      {favoriteItems.length > 0 && (
        <Rail title="Your wishlist" items={favoriteItems} onOpen={setQuickView} />
      )}

      {/* Compare tray */}
      <AnimatePresence>
        {compareItems.length > 0 && (
          <motion.div
            initial={{ y: 130, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 130, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-strong fixed inset-x-4 bottom-24 z-[135] rounded-2xl border border-line p-4 lg:inset-x-auto lg:right-8 lg:bottom-8 lg:w-[34rem]"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="flex items-center gap-2 text-xs text-fg-muted">
                <Scale size={14} className="text-gold-400" />
                Comparing <span className="tnum text-fg">{compareItems.length}</span>
                {compareItems.length === 1 && " — add one more"}
              </p>
              <button
                onClick={clearCompare}
                className="text-[0.6rem] uppercase tracking-widest text-fg-subtle transition-colors hover:text-danger"
              >
                Clear
              </button>
            </div>

            {compareItems.length > 1 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-[0.68rem]">
                  <thead className="text-fg-subtle">
                    <tr>
                      <th scope="col" className="py-1 pr-3 font-normal">Item</th>
                      <th scope="col" className="py-1 pr-3 font-normal">Price</th>
                      <th scope="col" className="py-1 pr-3 font-normal">Rating</th>
                      <th scope="col" className="py-1 font-normal">kcal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareItems.map((c) => (
                      <tr key={c.id} className="border-t border-line">
                        <td className="max-w-[10rem] truncate py-2 pr-3 text-fg">{c.name}</td>
                        <td className="tnum py-2 pr-3 text-gold-400">{formatPrice(c.price)}</td>
                        <td className="tnum py-2 pr-3">{c.rating}</td>
                        <td className="tnum py-2">{c.calories}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Rail({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: MenuItem[];
  onOpen: (id: string) => void;
}) {
  return (
    <section className="mt-20">
      <h2 className="font-display text-2xl text-fg">{title}</h2>
      <div className="mt-5 flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onOpen(item.id)}
            className="group flex w-56 shrink-0 flex-col rounded-2xl border border-line bg-bg-elevated/60 p-4 text-left transition-colors hover:border-gold-600/50"
          >
            <span className="truncate text-sm text-fg group-hover:text-gold-300">{item.name}</span>
            <span className="mt-1 text-[0.62rem] text-fg-subtle">{item.category}</span>
            <span className="tnum mt-3 text-sm text-gold-400">{formatPrice(item.price)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
