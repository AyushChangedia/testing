"use client";

import { BadgeCheck, Quote } from "lucide-react";
import { REVIEWS } from "@/lib/data/content";
import { SectionHeader, StarRating } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import type { Review } from "@/lib/types";

/** Two counter-scrolling marquee rows. Pauses on hover; stops under reduced-motion. */
export function Reviews() {
  const top = REVIEWS.slice(0, 4);
  const bottom = REVIEWS.slice(4);

  return (
    <section id="reviews" className="section-y relative overflow-hidden">
      <div className="container-x">
        <SectionHeader
          eyebrow="Reviews"
          title="Four thousand people have opinions. Here are eight."
          body="Verified from orders placed in the last year. We do not filter the four-star ones out."
          align="center"
        />
      </div>

      <div className="marquee-host mt-14 space-y-5">
        <MarqueeRow items={top} duration={48} />
        <MarqueeRow items={bottom} duration={56} reverse />
      </div>

      {/* Edge fades so cards dissolve rather than clip */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg to-transparent sm:w-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg to-transparent sm:w-40" />
    </section>
  );
}

function MarqueeRow({
  items,
  duration,
  reverse,
}: {
  items: Review[];
  duration: number;
  reverse?: boolean;
}) {
  // Duplicated once so the -50% translate loops seamlessly.
  const doubled = [...items, ...items];

  return (
    <div className="flex overflow-hidden">
      <div
        className="marquee-track flex shrink-0 gap-5"
        style={{
          ["--marquee-duration" as string]: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {doubled.map((review, i) => (
          <ReviewCard key={`${review.id}-${i}`} review={review} aria-hidden={i >= items.length} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review, ...rest }: { review: Review } & React.HTMLAttributes<HTMLElement>) {
  return (
    <article
      {...rest}
      className="grad-border spotlight group relative w-[85vw] shrink-0 rounded-[1.5rem] bg-bg-elevated/60 p-7 backdrop-blur-sm sm:w-[26rem]"
    >
      <Quote size={26} className="text-gold-600/35" />

      <p className="mt-4 text-sm leading-relaxed text-fg-muted">{review.body}</p>

      <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
          <SmartImage
            src={review.avatar}
            alt=""
            seed={review.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-medium text-fg">
            {review.name}
            {review.verified && (
              <BadgeCheck size={13} className="shrink-0 text-gold-400" aria-label="Verified order" />
            )}
          </p>
          <p className="truncate text-[0.65rem] text-fg-subtle">{review.role}</p>
        </div>
        <StarRating value={review.rating} size={12} />
      </div>
    </article>
  );
}
