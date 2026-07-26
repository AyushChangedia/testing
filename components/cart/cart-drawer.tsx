"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { useUI } from "@/lib/store/ui";
import {
  useCart,
  lineKey,
  unitPrice,
  selectSubtotal,
  selectDiscount,
  selectTax,
  selectDelivery,
  selectTotal,
  selectEarnedPoints,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/store/cart";
import { getItem } from "@/lib/data/menu";
import { Button, Badge } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { formatPrice, cn } from "@/lib/utils";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const toast = useUI((s) => s.toast);

  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const couponError = useCart((s) => s.couponError);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const applyCoupon = useCart((s) => s.applyCoupon);
  const removeCoupon = useCart((s) => s.removeCoupon);

  const cart = useCart();
  const subtotal = selectSubtotal(cart);
  const discount = selectDiscount(cart);
  const tax = selectTax(cart);
  const delivery = selectDelivery(cart);
  const total = selectTotal(cart);
  const points = selectEarnedPoints(cart);

  const [code, setCode] = useState("");

  // Escape route + scroll lock while the drawer owns the screen.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const afterDiscount = subtotal - discount;
  const toFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - afterDiscount);
  const freeProgress = Math.min(100, (afterDiscount / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Scrim — strong enough to isolate the drawer */}
          <div
            className="absolute inset-0 bg-noir-950/75 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="glass-strong absolute right-0 top-0 flex h-full w-full flex-col border-l border-line sm:w-[27rem]"
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <div className="flex items-center gap-3">
                <ShoppingBag size={17} className="text-gold-400" />
                <h2 className="font-display text-xl">Your Order</h2>
                {lines.length > 0 && (
                  <span className="tnum rounded-full bg-gold-500/15 px-2 py-0.5 text-[0.62rem] text-gold-400">
                    {lines.reduce((n, l) => n + l.qty, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="flex h-10 w-10 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
              >
                <X size={18} />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-24 w-24 items-center justify-center rounded-full border border-line"
                >
                  <ShoppingBag size={30} className="text-fg-subtle" />
                </motion.div>
                <div>
                  <p className="font-display text-2xl">Nothing brewing yet</p>
                  <p className="mt-2 text-sm text-fg-muted">
                    Your cart is empty. The Midnight Velvet Latte is where most people start.
                  </p>
                </div>
                <Button onClick={() => setOpen(false)} asChild size="md">
                  <Link href="/menu">Explore the Menu</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Free delivery meter */}
                <div className="border-b border-line px-6 py-4">
                  <div className="mb-2 flex items-center gap-2 text-[0.68rem] text-fg-muted">
                    <Truck size={13} className={cn(toFreeDelivery === 0 && "text-veg")} />
                    {toFreeDelivery === 0 ? (
                      <span className="text-veg">Free delivery unlocked</span>
                    ) : (
                      <span>
                        <span className="tnum text-gold-400">{formatPrice(toFreeDelivery)}</span> away
                        from free delivery
                      </span>
                    )}
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-surface">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400"
                      animate={{ width: `${freeProgress}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                {/* Lines */}
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => {
                      const item = getItem(line.id);
                      if (!item) return null;
                      const key = lineKey(line);
                      const each = unitPrice(line.id, line.size);

                      return (
                        <motion.li
                          key={key}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="flex gap-4 py-5"
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                            <SmartImage
                              src={item.image}
                              alt={item.name}
                              seed={item.slug}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-fg">{item.name}</p>
                                <p className="mt-0.5 text-[0.68rem] text-fg-subtle">
                                  Size {line.size} · {formatPrice(each)} each
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  remove(key);
                                  toast({ title: `${item.name} removed` });
                                }}
                                aria-label={`Remove ${item.name}`}
                                className="shrink-0 rounded-full p-2 text-fg-subtle transition-colors hover:bg-danger/15 hover:text-danger"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-3">
                              <div className="flex items-center gap-1 rounded-full border border-line p-1">
                                <button
                                  onClick={() => setQty(key, line.qty - 1)}
                                  aria-label={`Decrease quantity of ${item.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-surface-hover"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="tnum w-7 text-center text-xs">{line.qty}</span>
                                <button
                                  onClick={() => setQty(key, line.qty + 1)}
                                  aria-label={`Increase quantity of ${item.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-surface-hover"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <span className="tnum text-sm text-gold-400">
                                {formatPrice(each * line.qty)}
                              </span>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>

                {/* Summary */}
                <div className="border-t border-line px-6 py-5">
                  {/* Coupon */}
                  {coupon ? (
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-veg/35 bg-veg/10 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag size={13} className="text-veg" />
                        <div>
                          <p className="text-xs font-medium text-veg">{coupon.code}</p>
                          <p className="text-[0.62rem] text-fg-muted">{coupon.label}</p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[0.62rem] uppercase tracking-widest text-fg-subtle transition-colors hover:text-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label htmlFor="coupon" className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.2em] text-fg-subtle">
                        Promo code
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="coupon"
                          value={code}
                          onChange={(e) => setCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && applyCoupon(code)) setCode("");
                          }}
                          placeholder="NOIR20"
                          aria-invalid={Boolean(couponError)}
                          aria-describedby={couponError ? "coupon-error" : undefined}
                          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 text-xs uppercase tracking-widest text-fg outline-none transition-colors placeholder:text-fg-subtle/60 focus:border-accent"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (applyCoupon(code)) {
                              toast({ title: "Coupon applied", tone: "success" });
                              setCode("");
                            }
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                      {couponError && (
                        <p id="coupon-error" role="alert" className="mt-2 text-[0.68rem] text-danger">
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}

                  <dl className="space-y-2 text-xs">
                    <Row label="Subtotal" value={formatPrice(subtotal)} />
                    {discount > 0 && (
                      <Row label="Discount" value={`−${formatPrice(discount)}`} tone="veg" />
                    )}
                    <Row label="GST (5%)" value={formatPrice(tax)} />
                    <Row
                      label="Delivery"
                      value={delivery === 0 ? "Free" : formatPrice(delivery)}
                      tone={delivery === 0 ? "veg" : undefined}
                    />
                    <div className="!mt-4 flex items-baseline justify-between border-t border-line pt-4">
                      <dt className="font-display text-lg">Total</dt>
                      <dd className="tnum font-display text-2xl text-gold-400">
                        {formatPrice(total)}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-3 flex items-center gap-1.5 text-[0.62rem] text-fg-subtle">
                    <span className="h-1 w-1 rounded-full bg-gold-500" />
                    Earns <span className="tnum text-gold-400">{points}</span> loyalty points
                  </p>

                  <Button asChild size="lg" className="mt-5 w-full" onClick={() => setOpen(false)}>
                    <Link href="/checkout">
                      Checkout
                      <ArrowRight size={14} />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "veg";
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-fg-muted">{label}</dt>
      <dd className={cn("tnum", tone === "veg" ? "text-veg" : "text-fg")}>{value}</dd>
    </div>
  );
}
