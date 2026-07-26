"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Timer, Sparkles, ArrowRight } from "lucide-react";
import { MENU } from "@/lib/data/menu";
import { Badge, Button, SectionHeader } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { useCart } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { formatPrice } from "@/lib/utils";

const OFFER_ITEMS = MENU.filter((m) => m.compareAt).slice(0, 3);

/** Counts down to the next midnight — a real deadline, recomputed on mount. */
function useCountdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const deadline = new Date();
    deadline.setHours(24, 0, 0, 0);

    const tick = () => setRemaining(Math.max(0, deadline.getTime() - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // null until mounted, so server and client markup agree.
  if (remaining === null) return null;

  const total = Math.floor(remaining / 1000);
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function Offers() {
  const countdown = useCountdown();
  const add = useCart((s) => s.add);
  const toast = useUI((s) => s.toast);

  return (
    <section id="offers" className="section-y relative">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeader
            eyebrow="Limited Release"
            title="Gone at midnight, genuinely."
            body="Three seasonal pours at a reduced price until the clock runs out. We do not extend these."
            className="max-w-2xl"
          />

          {/* Countdown */}
          <div className="flex items-center gap-3">
            <Timer size={16} className="text-gold-500" />
            <div className="flex gap-2" role="timer" aria-live="off">
              {countdown ? (
                <>
                  <Unit value={countdown.hours} label="hrs" />
                  <Separator />
                  <Unit value={countdown.minutes} label="min" />
                  <Separator />
                  <Unit value={countdown.seconds} label="sec" />
                </>
              ) : (
                // Reserve the exact footprint to avoid layout shift on hydrate.
                <>
                  <Unit value={0} label="hrs" />
                  <Separator />
                  <Unit value={0} label="min" />
                  <Separator />
                  <Unit value={0} label="sec" />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {OFFER_ITEMS.map((item, i) => {
            const off = Math.round((1 - item.price / item.compareAt!) * 100);
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 0.75, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative overflow-hidden rounded-[1.75rem]"
              >
                <div className="relative aspect-[4/5]">
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    seed={item.slug}
                    fill
                    sizes="(max-width: 1024px) 92vw, 31vw"
                    className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/40 to-transparent" />

                  {/* Rotating discount seal */}
                  <div className="absolute right-5 top-5">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                      className="relative flex h-20 w-20 items-center justify-center"
                    >
                      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                        <defs>
                          <path
                            id={`circle-${item.id}`}
                            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                          />
                        </defs>
                        <text className="fill-gold-400 text-[10px] uppercase tracking-[0.28em]">
                          <textPath href={`#circle-${item.id}`}>
                            Limited · Ends midnight · Limited ·
                          </textPath>
                        </text>
                      </svg>
                      <span className="tnum font-display text-xl text-gold-300">−{off}%</span>
                    </motion.div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="mb-3 flex gap-2">
                      <Badge tone="gold">
                        <Sparkles size={9} />
                        {item.tags.includes("seasonal") ? "Seasonal" : "Limited"}
                      </Badge>
                    </div>
                    <h3 className="font-display text-2xl text-cream-100">{item.name}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-cream-300/80">
                      {item.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div>
                        <span className="tnum font-display text-2xl text-gold-400">
                          {formatPrice(item.price)}
                        </span>
                        <span className="tnum ml-2 text-xs text-cream-300/50 line-through">
                          {formatPrice(item.compareAt!)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          add(item.id, "M", 1);
                          toast({ title: "Added to cart", body: item.name, tone: "success" });
                        }}
                      >
                        Add
                        <ArrowRight size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="tnum flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-bg-elevated/70 font-display text-2xl text-gold-400">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1.5 text-[0.5rem] uppercase tracking-[0.25em] text-fg-subtle">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return <span className="self-center pb-5 font-display text-xl text-fg-subtle">:</span>;
}
