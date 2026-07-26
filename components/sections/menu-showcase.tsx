"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { MENU } from "@/lib/data/menu";
import { ItemCard } from "@/components/menu/item-card";
import { Button, SectionHeader } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { prefersReducedMotion, formatPrice } from "@/lib/utils";

const SIGNATURES = MENU.filter((m) => m.tags.includes("chef")).slice(0, 6);
const BESTSELLERS = MENU.filter((m) => m.tags.includes("bestseller")).slice(0, 8);

/**
 * Pinned horizontal scroll. The section sticks while the track translates on
 * the X axis, so vertical scrolling drives horizontal movement.
 */
export function MenuShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    // Horizontal pinning is disorienting on small screens; native scroll there.
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      gsap.registerPlugin(ScrollTrigger);

      const distance = () => track.scrollWidth - window.innerWidth + 96;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <>
      {/* --- Horizontal signature rail --- */}
      <section ref={sectionRef} className="h-scroll-viewport relative lg:h-screen">
        <div className="flex h-full flex-col justify-center py-20 lg:py-0">
          <div className="container-x mb-12 flex flex-wrap items-end justify-between gap-6">
            <SectionHeader
              eyebrow="Chef's Table"
              title="Six things we would put our name on."
              className="max-w-2xl"
            />
            <p className="hidden items-center gap-2 text-[0.6rem] uppercase tracking-[0.3em] text-fg-subtle lg:flex">
              Scroll to explore
              <ArrowRight size={13} className="text-gold-500" />
            </p>
          </div>

          <div
            ref={trackRef}
            className="flex gap-6 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] pb-6 lg:overflow-visible lg:pb-0"
            style={{ scrollbarWidth: "none" }}
          >
            {SIGNATURES.map((item, i) => (
              <article
                key={item.id}
                className="group relative w-[78vw] shrink-0 overflow-hidden rounded-[1.75rem] sm:w-[54vw] lg:w-[30rem]"
              >
                <div className="relative aspect-[3/4] lg:aspect-[4/5]">
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    seed={item.slug}
                    fill
                    sizes="(max-width: 1024px) 78vw, 30rem"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/35 to-transparent" />

                  <span className="absolute left-6 top-6 font-display text-6xl text-cream-100/12">
                    0{i + 1}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold-500">
                      {item.category}
                    </p>
                    <h3 className="mt-2 font-display text-3xl text-cream-100">{item.name}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream-300/85">
                      {item.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="tnum font-display text-2xl text-gold-400">
                        {formatPrice(item.price)}
                      </span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-100/25 text-cream-100 transition-all duration-500 group-hover:border-gold-400 group-hover:bg-gold-400 group-hover:text-noir-950">
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {/* Tail card */}
            <div className="flex w-[78vw] shrink-0 items-center justify-center sm:w-[54vw] lg:w-[24rem]">
              <div className="text-center">
                <p className="font-display text-4xl text-gradient-cream">
                  {MENU.length - SIGNATURES.length} more
                  <br />
                  <span className="italic text-gradient-gold">on the list.</span>
                </p>
                <Button asChild size="lg" className="mt-8" magnetic>
                  <Link href="/menu">
                    See Full Menu
                    <ArrowRight size={14} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Bestseller grid --- */}
      <section id="menu" className="section-y relative">
        <div className="container-x">
          <SectionHeader
            eyebrow="Most Ordered"
            title="What everyone else is having."
            body="Ranked by the last ninety days of orders. The Midnight Velvet Latte has held the top spot for two years running."
          />

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BESTSELLERS.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <Button asChild variant="outline" size="lg" magnetic>
              <Link href="/menu">
                Browse All {MENU.length} Items
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
