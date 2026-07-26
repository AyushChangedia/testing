"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Mountain, Sprout, User } from "lucide-react";
import { ORIGINS } from "@/lib/data/content";
import { SectionHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/**
 * Interactive origin map. Coordinates are percentages on a stylised
 * equirectangular world, so no map library or tile server is needed.
 */
export function Origins() {
  const [active, setActive] = useState<string | null>(null);
  const selected = ORIGINS.find((o) => o.id === active) ?? null;

  return (
    <section id="origins" className="section-y relative">
      <div className="container-x">
        <SectionHeader
          eyebrow="Coffee Origins"
          title="Thirty-eight farms. Every one of them has a name."
          body="We buy direct, we pay above Fairtrade floor, and we print the farm on the bag. Hover a marker to follow the bean from soil to cup."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
          {/* Map */}
          <div className="grad-border relative overflow-hidden rounded-[1.75rem] bg-bg-elevated/50 p-4 sm:p-7">
            <div className="relative aspect-[2/1] w-full">
              {/* Landmass silhouettes — stylised, not geographically exact */}
              <svg viewBox="0 0 100 50" className="absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                  <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#271e18" />
                    <stop offset="100%" stopColor="#14100d" />
                  </linearGradient>
                  <radialGradient id="belt">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* The coffee belt */}
                <rect x="0" y="21" width="100" height="12" fill="url(#belt)" />
                <line x1="0" y1="27" x2="100" y2="27" stroke="#d4af37" strokeWidth="0.12" strokeDasharray="1 1.5" opacity="0.45" />

                {/* Continents */}
                <g fill="url(#land)" stroke="#432f23" strokeWidth="0.14">
                  <path d="M12 12 L22 9 L28 14 L26 21 L20 26 L15 22 Z" />
                  <path d="M22 28 L28 27 L31 34 L28 44 L23 40 L21 33 Z" />
                  <path d="M45 10 L56 8 L60 13 L57 18 L48 17 Z" />
                  <path d="M50 19 L60 18 L64 26 L61 36 L54 33 L49 25 Z" />
                  <path d="M62 10 L80 7 L88 13 L84 20 L72 22 L64 17 Z" />
                  <path d="M66 22 L74 21 L78 27 L72 31 L67 27 Z" />
                  <path d="M80 33 L90 32 L92 39 L85 42 L79 38 Z" />
                </g>
              </svg>

              {/* Travelling beans along the belt */}
              {!selected &&
                [0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    aria-hidden
                    className="absolute h-1.5 w-2 rounded-full bg-gold-400/70"
                    style={{ top: `${52 + i * 2}%` }}
                    animate={{ left: ["-3%", "103%"] }}
                    transition={{
                      duration: 12 + i * 3,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 3.4,
                    }}
                  />
                ))}

              {/* Flight path from the selected origin to the café */}
              <AnimatePresence>
                {selected && (
                  <svg
                    viewBox="0 0 100 50"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    aria-hidden
                  >
                    <motion.path
                      d={`M${selected.x} ${selected.y / 2} Q${(selected.x + 70.5) / 2} ${
                        Math.min(selected.y / 2, 28.5) - 12
                      } 70.5 28.5`}
                      stroke="#d4af37"
                      strokeWidth="0.28"
                      fill="none"
                      strokeDasharray="1.4 1"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.85 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <motion.circle
                      r="0.7"
                      fill="#f0dda6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <animateMotion
                        dur="2.4s"
                        repeatCount="indefinite"
                        path={`M${selected.x} ${selected.y / 2} Q${(selected.x + 70.5) / 2} ${
                          Math.min(selected.y / 2, 28.5) - 12
                        } 70.5 28.5`}
                      />
                    </motion.circle>
                  </svg>
                )}
              </AnimatePresence>

              {/* Markers */}
              {ORIGINS.map((origin) => {
                const isActive = active === origin.id;
                return (
                  <button
                    key={origin.id}
                    onMouseEnter={() => setActive(origin.id)}
                    onFocus={() => setActive(origin.id)}
                    onClick={() => setActive(isActive ? null : origin.id)}
                    aria-label={`${origin.region}, ${origin.country}`}
                    aria-pressed={isActive}
                    className="absolute -translate-x-1/2 -translate-y-1/2 p-3"
                    style={{ left: `${origin.x}%`, top: `${origin.y}%` }}
                  >
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <motion.span
                        className="absolute h-3 w-3 rounded-full bg-gold-400/45"
                        animate={{ scale: [1, 2.4, 1], opacity: [0.55, 0, 0.55] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
                      />
                      <span
                        className={cn(
                          "relative h-2 w-2 rounded-full transition-all duration-300",
                          isActive ? "scale-150 bg-gold-300" : "bg-gold-500",
                        )}
                      />
                    </span>
                  </button>
                );
              })}

              {/* Destination marker */}
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: "70.5%", top: "57%" }}
              >
                <span className="flex items-center gap-1 rounded-full border border-gold-500/45 bg-noir-950/80 px-2 py-1 backdrop-blur-sm">
                  <MapPin size={9} className="text-gold-400" />
                  <span className="text-[0.5rem] uppercase tracking-[0.15em] text-gold-300">
                    Mumbai
                  </span>
                </span>
              </span>
            </div>
          </div>

          {/* Detail panel */}
          <div className="grad-border relative min-h-[22rem] overflow-hidden rounded-[1.75rem] bg-bg-elevated/50 p-7">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="text-[0.6rem] uppercase tracking-[0.35em] text-gold-500">
                    Since {selected.since}
                  </p>
                  <h3 className="mt-3 font-display text-3xl text-fg">{selected.region}</h3>
                  <p className="text-sm text-fg-muted">{selected.country}</p>

                  <dl className="mt-6 space-y-4 text-sm">
                    <Detail icon={<Mountain size={14} />} label="Altitude" value={selected.altitude} />
                    <Detail icon={<Sprout size={14} />} label="Varietal" value={selected.varietal} />
                    <Detail icon={<User size={14} />} label="Producer" value={selected.farmer} />
                  </dl>

                  <div className="mt-6">
                    <p className="text-[0.58rem] uppercase tracking-[0.28em] text-fg-subtle">
                      Cup notes
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {selected.notes.map((note) => (
                        <span
                          key={note}
                          className="rounded-full border border-gold-600/35 bg-gold-500/8 px-3 py-1 text-[0.65rem] text-gold-300"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full flex-col items-center justify-center gap-4 text-center"
                >
                  <MapPin size={28} className="text-fg-subtle" />
                  <div>
                    <p className="font-display text-xl text-fg">Pick an origin</p>
                    <p className="mt-1.5 max-w-xs text-sm text-fg-muted">
                      Eight active sourcing regions across the coffee belt. Hover or tap a marker to
                      see who grows it.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-line pb-3">
      <span className="mt-0.5 text-gold-600">{icon}</span>
      <div>
        <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-fg-subtle">{label}</dt>
        <dd className="mt-0.5 text-fg">{value}</dd>
      </div>
    </div>
  );
}
