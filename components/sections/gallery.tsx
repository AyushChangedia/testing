"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { GALLERY } from "@/lib/data/content";
import { SectionHeader } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

export function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i === null ? null : (i + dir + GALLERY.length) % GALLERY.length));

  // Keyboard control for the lightbox.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const current = index !== null ? GALLERY[index] : null;

  return (
    <section id="gallery" className="section-y relative">
      <div className="container-x">
        <SectionHeader
          eyebrow="The Room"
          title="Photographs, mostly taken at golden hour."
          body="The corner booth at 5pm in November is, by consensus, the best seat in the building."
        />

        {/* Masonry via CSS columns — content-driven heights, no JS layout pass */}
        <div className="mt-14 columns-2 gap-4 sm:gap-5 lg:columns-3 xl:columns-4">
          {GALLERY.map((shot, i) => (
            <motion.button
              key={shot.id}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-6% 0px" }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setIndex(i)}
              aria-label={`Open image: ${shot.alt}`}
              className={cn(
                "group relative mb-4 block w-full overflow-hidden rounded-2xl sm:mb-5",
                shot.span === 2 ? "aspect-[3/4]" : "aspect-square",
              )}
            >
              <SmartImage
                src={shot.src}
                alt={shot.alt}
                seed={shot.id}
                fill
                sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 23vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-noir-950/85 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {shot.kind === "video" && (
                <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-cream-100/30 bg-noir-950/60 text-cream-100 backdrop-blur-md">
                  <Play size={13} fill="currentColor" />
                </span>
              )}

              <span className="absolute inset-x-0 bottom-0 translate-y-3 p-4 text-left text-[0.65rem] leading-snug text-cream-200 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {shot.alt}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[175] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
          >
            <div className="absolute inset-0 bg-noir-950/93 backdrop-blur-xl" onClick={() => setIndex(null)} />

            <button
              onClick={() => setIndex(null)}
              aria-label="Close viewer"
              className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-line text-cream-100 transition-colors hover:bg-surface-hover"
            >
              <X size={20} />
            </button>

            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-line text-cream-100 transition-colors hover:bg-surface-hover sm:left-8"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-line text-cream-100 transition-colors hover:bg-surface-hover sm:right-8"
            >
              <ChevronRight size={22} />
            </button>

            <motion.figure
              key={current.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-[1] max-h-[86dvh] w-full max-w-4xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <SmartImage
                  src={current.src}
                  alt={current.alt}
                  seed={current.id}
                  fill
                  sizes="90vw"
                  className="object-cover"
                  priority
                />
              </div>
              <figcaption className="mt-4 flex items-center justify-between gap-4 text-xs text-cream-300/80">
                <span>{current.alt}</span>
                <span className="tnum shrink-0 text-fg-subtle">
                  {(index ?? 0) + 1} / {GALLERY.length}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
