"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, Eye, Flame, Leaf, Scale } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { SmartImage } from "@/components/ui/smart-image";
import { Badge, StarRating, Tilt } from "@/components/ui/primitives";
import { useCart } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { cn, formatPrice } from "@/lib/utils";

export function ItemCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const add = useCart((s) => s.add);
  const favorites = useCart((s) => s.favorites);
  const toggleFavorite = useCart((s) => s.toggleFavorite);
  const toggleCompare = useCart((s) => s.toggleCompare);
  const compare = useCart((s) => s.compare);

  const setQuickView = useUI((s) => s.setQuickView);
  const triggerFly = useUI((s) => s.triggerFly);
  const toast = useUI((s) => s.toast);

  const isFav = favorites.includes(item.id);
  const inCompare = compare.includes(item.id);

  const handleAdd = () => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      triggerFly({
        from: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 3 },
        image: item.image,
        label: item.name,
      });
    }
    add(item.id, "M", 1);
    toast({ title: "Added to cart", body: item.name, tone: "success" });
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.75, delay: (index % 4) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group h-full"
    >
      <Tilt max={7} className="h-full">
        <div className="grad-border relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-bg-elevated/60 backdrop-blur-sm transition-shadow duration-500 group-hover:shadow-[0_30px_80px_-30px_rgb(212_175_55_/_0.4)]">
          {/* Media */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <SmartImage
              src={item.image}
              alt={item.name}
              seed={item.slug}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 23vw"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.09]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/25 to-transparent" />

            {/* Top-left tags */}
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {item.tags.includes("bestseller") && <Badge tone="gold">Bestseller</Badge>}
              {item.tags.includes("new") && <Badge tone="new">New</Badge>}
              {item.tags.includes("limited") && <Badge tone="danger">Limited</Badge>}
              {item.compareAt && (
                <Badge tone="danger">
                  −{Math.round((1 - item.price / item.compareAt) * 100)}%
                </Badge>
              )}
            </div>

            {/* Veg / non-veg marker */}
            <div className="absolute right-3 top-3 flex flex-col gap-2">
              <span
                aria-label={item.veg ? "Vegetarian" : "Non-vegetarian"}
                title={item.veg ? "Vegetarian" : "Non-vegetarian"}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-[5px] border-2 bg-noir-950/70 backdrop-blur-sm",
                  item.veg ? "border-veg" : "border-nonveg",
                )}
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    item.veg ? "bg-veg" : "bg-nonveg",
                  )}
                />
              </span>
            </div>

            {/* Hover actions — also reachable by keyboard, never hover-only */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <button
                onClick={() => toggleFavorite(item.id)}
                aria-label={isFav ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
                aria-pressed={isFav}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-noir-950/70 backdrop-blur-md transition-colors hover:border-danger hover:text-danger"
              >
                <motion.span animate={isFav ? { scale: [1, 1.45, 1] } : {}} transition={{ duration: 0.4 }}>
                  <Heart size={15} className={cn(isFav && "fill-danger text-danger")} />
                </motion.span>
              </button>
              <button
                onClick={() => toggleCompare(item.id)}
                aria-label={`${inCompare ? "Remove from" : "Add to"} comparison`}
                aria-pressed={inCompare}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border bg-noir-950/70 backdrop-blur-md transition-colors",
                  inCompare ? "border-gold-500 text-gold-400" : "border-line hover:border-gold-500",
                )}
              >
                <Scale size={15} />
              </button>
              <button
                onClick={() => setQuickView(item.id)}
                aria-label={`Quick view ${item.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-noir-950/70 backdrop-blur-md transition-colors hover:border-gold-500 hover:text-gold-400"
              >
                <Eye size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg leading-tight text-fg transition-colors group-hover:text-gold-300">
                {item.name}
              </h3>
              <div className="shrink-0 text-right">
                <p className="tnum font-display text-lg text-gold-400">{formatPrice(item.price)}</p>
                {item.compareAt && (
                  <p className="tnum text-[0.65rem] text-fg-subtle line-through">
                    {formatPrice(item.compareAt)}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-fg-muted">
              {item.description}
            </p>

            {/* Meta row */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.62rem] text-fg-subtle">
              <StarRating value={item.rating} size={11} showValue />
              <span>·</span>
              <span className="tnum">{item.calories} kcal</span>
              <span>·</span>
              <span className="tnum">{item.prepMinutes} min</span>
              {item.spiceLevel > 0 && (
                <>
                  <span>·</span>
                  <span
                    className="flex items-center gap-0.5"
                    aria-label={`Spice level ${item.spiceLevel} of 3`}
                  >
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Flame
                        key={i}
                        size={10}
                        className={cn(i < item.spiceLevel ? "text-danger" : "text-fg-subtle/30")}
                        fill={i < item.spiceLevel ? "currentColor" : "none"}
                      />
                    ))}
                  </span>
                </>
              )}
            </div>

            {/* Ingredients preview */}
            <p className="mt-3 line-clamp-1 text-[0.62rem] text-fg-subtle/80">
              <Leaf size={9} className="mr-1 inline" />
              {item.ingredients.slice(0, 3).join(" · ")}
              {item.ingredients.length > 3 && ` +${item.ingredients.length - 3}`}
            </p>

            {/* Add */}
            <button
              onClick={handleAdd}
              className="group/btn mt-5 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-line text-[0.66rem] uppercase tracking-[0.2em] text-fg transition-all duration-300 hover:border-transparent hover:bg-gradient-to-r hover:from-gold-600 hover:via-gold-500 hover:to-gold-400 hover:text-noir-950"
            >
              <Plus size={13} className="transition-transform duration-300 group-hover/btn:rotate-90" />
              Add to Cart
            </button>
          </div>
        </div>
      </Tilt>
    </motion.article>
  );
}
