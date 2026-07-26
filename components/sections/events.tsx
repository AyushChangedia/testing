"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Music, GraduationCap, Coffee, Users, Clock, ArrowRight } from "lucide-react";
import { EVENTS } from "@/lib/data/content";
import { Badge, Button, SectionHeader } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { useUI } from "@/lib/store/ui";
import { cn, formatPrice } from "@/lib/utils";
import type { CafeEvent } from "@/lib/types";

const KIND_ICON = {
  "Live Music": Music,
  Workshop: GraduationCap,
  Tasting: Coffee,
} as const;

const FILTERS = ["All", "Live Music", "Workshop", "Tasting"] as const;

export function Events() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [rsvpd, setRsvpd] = useState<string[]>([]);
  const toast = useUI((s) => s.toast);

  const visible = filter === "All" ? EVENTS : EVENTS.filter((e) => e.kind === filter);

  const rsvp = (event: CafeEvent) => {
    if (rsvpd.includes(event.id)) return;
    setRsvpd((r) => [...r, event.id]);
    toast({
      title: "Seat reserved",
      body: `${event.title} · ${formatDate(event.date)}`,
      tone: "success",
    });
  };

  return (
    <section id="events" className="section-y relative">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeader
            eyebrow="What's On"
            title="The room does more than serve coffee."
            body="Late jazz on original pressings, cupping labs, and workshops where you will ruin about forty cups learning to pour."
            className="max-w-2xl"
          />

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events by type">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn(
                  "h-11 rounded-full border px-5 text-[0.62rem] uppercase tracking-[0.18em] transition-all duration-300",
                  filter === f
                    ? "border-gold-500 bg-gold-500/12 text-gold-300"
                    : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {visible.map((event, i) => {
            const Icon = KIND_ICON[event.kind];
            const booked = rsvpd.includes(event.id);
            const filled = ((event.totalSeats - event.seatsLeft) / event.totalSeats) * 100;
            const scarce = event.seatsLeft <= 5;

            return (
              <motion.article
                key={event.id}
                layout
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 0.7, delay: (i % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="grad-border spotlight group relative overflow-hidden rounded-[1.5rem] bg-bg-elevated/60"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative aspect-[16/10] shrink-0 sm:aspect-auto sm:w-44">
                    <SmartImage
                      src={event.image}
                      alt={event.title}
                      seed={event.id}
                      fill
                      sizes="(max-width: 640px) 92vw, 11rem"
                      className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir-950/70 to-transparent sm:bg-gradient-to-r" />

                    {/* Date chip */}
                    <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl border border-line bg-noir-950/80 px-3 py-2 backdrop-blur-md">
                      <span className="tnum font-display text-xl leading-none text-gold-400">
                        {new Date(event.date).getDate()}
                      </span>
                      <span className="mt-0.5 text-[0.5rem] uppercase tracking-[0.2em] text-cream-400">
                        {new Date(event.date).toLocaleString("en-IN", { month: "short" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2">
                      <Icon size={13} className="text-gold-500" />
                      <span className="text-[0.58rem] uppercase tracking-[0.28em] text-gold-500">
                        {event.kind}
                      </span>
                      {scarce && <Badge tone="danger">{event.seatsLeft} left</Badge>}
                    </div>

                    <h3 className="mt-2.5 font-display text-xl leading-tight text-fg">
                      {event.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-fg-muted">
                      {event.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.65rem] text-fg-subtle">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {event.host}
                      </span>
                    </div>

                    {/* Seat meter */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-[0.6rem] text-fg-subtle">
                        <span>
                          <span className="tnum">{event.totalSeats - event.seatsLeft}</span> of{" "}
                          <span className="tnum">{event.totalSeats}</span> taken
                        </span>
                        <span className="tnum text-gold-400">{formatPrice(event.price)}</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-surface">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            scarce
                              ? "bg-gradient-to-r from-danger/70 to-danger"
                              : "bg-gradient-to-r from-gold-700 to-gold-400",
                          )}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${filled}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={booked ? "outline" : "primary"}
                      className="mt-5 w-full"
                      onClick={() => rsvp(event)}
                      disabled={booked}
                    >
                      {booked ? "Reserved" : "RSVP"}
                      {!booked && <ArrowRight size={12} />}
                    </Button>
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
  });
}
