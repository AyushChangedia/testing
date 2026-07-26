"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Counter, Reveal, SectionHeader, SplitText } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { STATS, TIMELINE } from "@/lib/data/content";

/**
 * Sticky storytelling: a cup fills with coffee as the pinned column scrolls
 * through the brand narrative.
 */
export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Fill level tracks scroll through the middle 60% of the section.
  const fillY = useTransform(scrollYProgress, [0.15, 0.75], ["100%", "8%"]);
  const steamOpacity = useTransform(scrollYProgress, [0.55, 0.8], [0, 0.7]);
  const cupRotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);

  return (
    <section id="story" className="section-y relative">
      <div className="container-x">
        <SectionHeader
          eyebrow="Our Story"
          title="It started with eight kilos a week and a stubborn opinion."
          body="Noir began because the coffee available in this city was fine, and fine was not interesting. Twelve years later the opinion has not softened."
        />

        <div ref={ref} className="mt-20 grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          {/* Sticky filling cup */}
          <div className="lg:sticky lg:top-32 lg:h-[70vh]">
            <div className="flex h-full items-center justify-center">
              <motion.div style={{ rotate: cupRotate }} className="relative">
                <svg width="260" height="300" viewBox="0 0 260 300" fill="none" aria-hidden>
                  <defs>
                    <clipPath id="story-cup">
                      <path d="M56 78 L204 78 L186 236 Q184 254 166 254 L94 254 Q76 254 74 236 Z" />
                    </clipPath>
                    <linearGradient id="story-brew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a9744f" />
                      <stop offset="35%" stopColor="#5a3a26" />
                      <stop offset="100%" stopColor="#1a100a" />
                    </linearGradient>
                    <linearGradient id="story-gold" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8f6f1f" />
                      <stop offset="50%" stopColor="#f0dda6" />
                      <stop offset="100%" stopColor="#8f6f1f" />
                    </linearGradient>
                  </defs>

                  {/* Steam appears once the cup is nearly full */}
                  <motion.g style={{ opacity: steamOpacity }}>
                    {[0, 1, 2].map((i) => (
                      <motion.path
                        key={i}
                        d={`M${104 + i * 26} 62 q10 -18 0 -34 q-10 -16 0 -30`}
                        stroke="#d9cdbb"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        fill="none"
                        animate={{ y: [8, -14], opacity: [0, 0.65, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
                      />
                    ))}
                  </motion.g>

                  {/* Saucer */}
                  <ellipse cx="130" cy="268" rx="94" ry="13" fill="#0f0c0a" />
                  <ellipse cx="130" cy="265" rx="94" ry="13" stroke="url(#story-gold)" strokeWidth="1.4" fill="none" opacity="0.45" />

                  {/* Handle */}
                  <path
                    d="M204 108 Q246 116 246 152 Q246 188 200 196"
                    stroke="url(#story-gold)"
                    strokeWidth="7"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.9"
                  />

                  {/* Liquid */}
                  <g clipPath="url(#story-cup)">
                    <motion.g style={{ y: fillY }}>
                      <rect x="40" y="0" width="180" height="280" fill="url(#story-brew)" />
                      <motion.path
                        d="M40 2 Q68 -10 96 2 T152 2 T208 2 T264 2 L264 20 L40 20 Z"
                        fill="#a9744f"
                        animate={{ x: [0, -56, 0] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.g>
                  </g>

                  {/* Cup outline */}
                  <path
                    d="M56 78 L204 78 L186 236 Q184 254 166 254 L94 254 Q76 254 74 236 Z"
                    stroke="url(#story-gold)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <ellipse cx="130" cy="78" rx="74" ry="13" stroke="url(#story-gold)" strokeWidth="3" fill="none" />
                </svg>

                <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gold-500/10 blur-[80px]" />
              </motion.div>
            </div>
          </div>

          {/* Timeline */}
          <ol className="relative space-y-14 border-l border-line pl-8 lg:pl-12">
            {TIMELINE.map((entry, i) => (
              <motion.li
                key={entry.year}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-18% 0px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                {/* Node */}
                <span className="absolute -left-[2.55rem] top-1.5 flex h-3 w-3 items-center justify-center lg:-left-[3.55rem]">
                  <span className="absolute h-3 w-3 rounded-full bg-gold-500/25" />
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-gold-400"
                    animate={{ scale: [1, 1.6, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
                  />
                </span>

                <span className="tnum font-display text-3xl text-gold-500/70">{entry.year}</span>
                <h3 className="mt-2 font-display text-2xl text-fg">{entry.title}</h3>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-fg-muted">{entry.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i}>
              <div className="group relative h-full bg-bg-elevated/80 p-7 text-center transition-colors duration-500 hover:bg-surface-hover sm:p-9">
                <p className="font-display text-4xl text-gradient-gold sm:text-5xl">
                  <Counter
                    to={stat.value}
                    decimal={"decimal" in stat && Boolean(stat.decimal)}
                    suffix={stat.suffix}
                  />
                </p>
                <p className="mt-2 text-[0.62rem] uppercase tracking-[0.28em] text-fg-subtle">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Full-bleed parallax quote panel used between heavier sections. */
export function QuoteBreak() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-14%", "14%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.18, 1.05, 1.18]);

  return (
    <section ref={ref} className="relative h-[75vh] overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-[-15%]">
        <SmartImage
          src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1800&q=80"
          alt="Coffee cherries drying on raised beds at origin"
          seed="quote-break"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-noir-950/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg" />

      <div className="container-x relative flex h-full items-center justify-center">
        <blockquote className="max-w-3xl text-center">
          <SplitText
            as="p"
            text="You cannot roast your way out of a bad harvest."
            className="font-display text-title italic"
            charClassName="text-gradient-cream"
            stagger={0.014}
          />
          <Reveal delay={1}>
            <footer className="mt-7 text-[0.62rem] uppercase tracking-[0.4em] text-gold-500">
              Aditi Varma · Founder &amp; Head Roaster
            </footer>
          </Reveal>
        </blockquote>
      </div>
    </section>
  );
}
