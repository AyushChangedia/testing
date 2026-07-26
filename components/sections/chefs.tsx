"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Twitter, Linkedin, Sparkles } from "lucide-react";
import { CHEFS } from "@/lib/data/content";
import { SectionHeader } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

export function Chefs() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="chefs" className="section-y relative">
      <div className="container-x">
        <SectionHeader
          eyebrow="The People"
          title="Four people who take this far too seriously."
          body="Between them: forty-six years behind a pass, three national finals, and one ongoing argument about whether cream belongs anywhere near carbonara."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CHEFS.map((chef, i) => {
            const expanded = open === chef.id;
            return (
              <motion.article
                key={chef.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.75, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                <div className="grad-border relative overflow-hidden rounded-[1.5rem] bg-bg-elevated/60">
                  {/* Portrait */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <SmartImage
                      src={chef.image}
                      alt={`Portrait of ${chef.name}`}
                      seed={chef.id}
                      fill
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 23vw"
                      className="object-cover grayscale transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/20 to-transparent" />

                    {/* Socials slide up on hover */}
                    <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 transition-all duration-500 group-focus-within:opacity-100 group-hover:opacity-100">
                      {chef.socials.instagram && <Social icon={<Instagram size={13} />} label={`${chef.name} on Instagram`} />}
                      {chef.socials.x && <Social icon={<Twitter size={13} />} label={`${chef.name} on X`} />}
                      {chef.socials.linkedin && <Social icon={<Linkedin size={13} />} label={`${chef.name} on LinkedIn`} />}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="text-[0.55rem] uppercase tracking-[0.3em] text-gold-500">
                        {chef.role}
                      </p>
                      <h3 className="mt-1.5 font-display text-2xl text-cream-100">{chef.name}</h3>
                      <p className="tnum mt-1 text-[0.65rem] text-cream-300/70">
                        {chef.years} years in the trade
                      </p>
                    </div>
                  </div>

                  {/* Reveal */}
                  <div className="p-5">
                    <p
                      className={cn(
                        "text-xs leading-relaxed text-fg-muted transition-all",
                        expanded ? "line-clamp-none" : "line-clamp-3",
                      )}
                    >
                      {chef.bio}
                    </p>

                    <motion.div
                      initial={false}
                      animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 flex gap-2 rounded-xl border border-gold-600/25 bg-gold-500/6 p-3 text-[0.68rem] leading-relaxed text-gold-200/90">
                        <Sparkles size={12} className="mt-0.5 shrink-0 text-gold-400" />
                        {chef.funFact}
                      </p>
                    </motion.div>

                    <button
                      onClick={() => setOpen(expanded ? null : chef.id)}
                      aria-expanded={expanded}
                      className="mt-3 text-[0.6rem] uppercase tracking-[0.24em] text-gold-500 transition-colors hover:text-gold-300"
                    >
                      {expanded ? "Less" : "Fun fact"}
                    </button>
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

function Social({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-100/25 bg-noir-950/60 text-cream-100 backdrop-blur-md transition-all duration-300 hover:border-gold-400 hover:bg-gold-400 hover:text-noir-950"
    >
      {icon}
    </a>
  );
}
