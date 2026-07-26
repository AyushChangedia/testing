"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Gift, Crown } from "lucide-react";
import { LOYALTY_TIERS } from "@/lib/data/content";
import { useCart } from "@/lib/store/cart";
import { Button, SectionHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function Loyalty() {
  const points = useCart((s) => s.points);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  const currentTier =
    [...LOYALTY_TIERS].reverse().find((t) => points >= t.threshold) ?? LOYALTY_TIERS[0];
  const nextTier = LOYALTY_TIERS.find((t) => t.threshold > points);
  const ceiling = nextTier?.threshold ?? LOYALTY_TIERS[LOYALTY_TIERS.length - 1].threshold;
  const progress = Math.min(100, (points / ceiling) * 100);

  return (
    <section id="loyalty" className="section-y relative">
      <div className="container-x">
        <SectionHeader
          eyebrow="Gold Leaf Club"
          title="Loyalty that is actually worth the plastic."
          body="Points on every order, a free pastry on your birthday, and a booth we keep back for members on Sunday mornings."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.25fr]">
          {/* Membership card */}
          <div ref={ref} className="lg:sticky lg:top-32 lg:self-start">
            <motion.div
              initial={{ opacity: 0, rotateY: -18, y: 30 }}
              animate={inView ? { opacity: 1, rotateY: 0, y: 0 } : {}}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ rotateY: 7, rotateX: -5, scale: 1.02 }}
              style={{ transformStyle: "preserve-3d", perspective: 1200 }}
              className="relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl border border-gold-600/35 p-7"
            >
              {/* Card face */}
              <div className="absolute inset-0 bg-gradient-to-br from-espresso via-noir-800 to-noir-950" />
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "radial-gradient(70% 60% at 20% 15%, rgb(212 175 55 / 0.5), transparent 65%)",
                }}
              />
              {/* Sweeping holographic sheen */}
              <motion.div
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-gold-300/18 to-transparent"
                animate={{ left: ["-40%", "130%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
              />
              <div className="grain absolute inset-0" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-xl tracking-[0.28em] text-gradient-gold">NOIR</p>
                    <p className="mt-0.5 text-[0.5rem] uppercase tracking-[0.4em] text-cream-400">
                      Member since 2024
                    </p>
                  </div>
                  <Crown size={20} className="text-gold-400" />
                </div>

                {/* Chip */}
                <div className="h-8 w-11 rounded-md bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 opacity-90" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[0.5rem] uppercase tracking-[0.3em] text-cream-400">
                      Current tier
                    </p>
                    <p
                      className="font-display text-2xl"
                      style={{ color: currentTier.color }}
                    >
                      {currentTier.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.5rem] uppercase tracking-[0.3em] text-cream-400">Points</p>
                    <p className="tnum font-display text-2xl text-cream-100">{points}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Progress to next tier */}
            <div className="mt-6">
              <div className="mb-2 flex items-baseline justify-between text-xs">
                <span className="text-fg-muted">
                  {nextTier ? (
                    <>
                      <span className="tnum text-gold-400">{nextTier.threshold - points}</span> points
                      to {nextTier.name}
                    </>
                  ) : (
                    "Top tier reached"
                  )}
                </span>
                <span className="tnum text-fg-subtle">
                  {points} / {ceiling}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-mocha via-gold-600 to-gold-400"
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${progress}%` } : {}}
                  transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>

          {/* Tiers */}
          <div className="space-y-4">
            {LOYALTY_TIERS.map((tier, i) => {
              const unlocked = points >= tier.threshold;
              const isCurrent = tier.name === currentTier.name;

              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, x: 34 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "grad-border relative rounded-2xl bg-bg-elevated/60 p-6 transition-colors",
                    isCurrent && "bg-gold-500/6",
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${tier.color}22`, color: tier.color }}
                      >
                        <Gift size={16} />
                      </span>
                      <div>
                        <h3 className="font-display text-xl" style={{ color: tier.color }}>
                          {tier.name}
                        </h3>
                        <p className="tnum text-[0.65rem] text-fg-subtle">
                          {tier.threshold === 0 ? "From your first order" : `${tier.threshold}+ points`}
                        </p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="rounded-full border border-gold-500/45 bg-gold-500/10 px-3 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-gold-400">
                        You are here
                      </span>
                    )}
                  </div>

                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-xs text-fg-muted">
                        <Check
                          size={13}
                          className={cn("mt-0.5 shrink-0", unlocked ? "text-veg" : "text-fg-subtle/45")}
                        />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}

            <Button size="lg" className="w-full" magnetic>
              Join the Gold Leaf Club
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
