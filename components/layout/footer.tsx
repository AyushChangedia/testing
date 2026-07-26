"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Youtube, MapPin, Phone, Mail, ArrowUpRight, Send } from "lucide-react";
import { Button, Reveal } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { GALLERY } from "@/lib/data/content";
import { useUI } from "@/lib/store/ui";
import { scrollToId } from "@/components/providers/smooth-scroll";

const HOURS = [
  { day: "Monday – Thursday", time: "7:30 – 23:00" },
  { day: "Friday", time: "7:30 – 01:00" },
  { day: "Saturday", time: "8:30 – 01:00" },
  { day: "Sunday", time: "8:30 – 22:00" },
];

const SOCIALS = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "X", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

export function Footer() {
  const toast = useUI((s) => s.toast);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("Enter a valid email address, like you@example.com.");
      return;
    }
    setError(null);
    setSending(true);
    // Demo backend: resolves locally so the flow is fully explorable.
    window.setTimeout(() => {
      setSending(false);
      setEmail("");
      toast({
        title: "You're on the list",
        body: "Seasonal menus and event invites, roughly monthly.",
        tone: "success",
      });
    }, 900);
  };

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-noir-950/60 pb-28 lg:pb-0">
      {/* Floating beans */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-2.5 w-3.5 rounded-full bg-gradient-to-br from-caramel/50 to-espresso/60"
            style={{ left: `${8 + i * 10.5}%`, top: `${15 + ((i * 37) % 60)}%` }}
            animate={{
              y: [0, -26, 0],
              x: [0, i % 2 ? 14 : -14, 0],
              rotate: [0, 180, 360],
              opacity: [0.2, 0.55, 0.2],
            }}
            transition={{
              duration: 11 + i * 1.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        ))}
      </div>

      <div className="container-x relative">
        {/* Newsletter */}
        <Reveal className="border-b border-line py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-title text-gradient-cream">
                Come for the coffee.
                <br />
                <span className="italic text-gradient-gold">Stay on the list.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-fg-muted">
                Seasonal menus, cupping invitations and the occasional confession from the roastery.
                Monthly at most, never sold on.
              </p>
            </div>

            <form onSubmit={subscribe} noValidate className="w-full">
              <label htmlFor="newsletter" className="mb-2 block text-[0.6rem] uppercase tracking-[0.3em] text-fg-subtle">
                Email address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="newsletter"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "newsletter-error" : undefined}
                  className="h-14 flex-1 rounded-full border border-line bg-transparent px-6 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle/60 focus:border-accent"
                />
                <Button type="submit" size="lg" loading={sending} magnetic>
                  <Send size={14} />
                  Subscribe
                </Button>
              </div>
              {error && (
                <p id="newsletter-error" role="alert" className="mt-2 text-xs text-danger">
                  {error}
                </p>
              )}
            </form>
          </div>
        </Reveal>

        {/* Columns */}
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="font-display text-2xl tracking-[0.3em] text-gradient-gold">
              NOIR
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-fg-muted">
              A café, a roastery, and a room built for staying longer than you planned. Direct trade
              since 2014.
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-fg-muted transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 hover:text-gold-400"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[0.6rem] uppercase tracking-[0.35em] text-gold-500">Visit</h3>
            <ul className="mt-5 space-y-3 text-sm text-fg-muted">
              <li className="flex gap-3">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gold-600" />
                <span>
                  14 Lantern Lane, Fort District
                  <br />
                  Mumbai 400001
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={15} className="mt-0.5 shrink-0 text-gold-600" />
                <a href="tel:+912212345678" className="link-underline">
                  +91 22 1234 5678
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={15} className="mt-0.5 shrink-0 text-gold-600" />
                <a href="mailto:hello@noir.cafe" className="link-underline">
                  hello@noir.cafe
                </a>
              </li>
            </ul>

            {/* Map placeholder — a real embed would go here */}
            <div className="relative mt-5 h-28 overflow-hidden rounded-xl border border-line">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, #14100d, #1c1611), repeating-linear-gradient(0deg, transparent, transparent 13px, rgb(212 175 55 / 0.08) 13px, rgb(212 175 55 / 0.08) 14px), repeating-linear-gradient(90deg, transparent, transparent 13px, rgb(212 175 55 / 0.08) 13px, rgb(212 175 55 / 0.08) 14px)",
                }}
              />
              <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
                <MapPin size={18} className="text-gold-400" />
                <span className="text-[0.55rem] uppercase tracking-[0.2em] text-fg-subtle">
                  Fort District
                </span>
              </span>
              <a
                href="https://maps.google.com/?q=Fort+District+Mumbai"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0"
                aria-label="Open location in Google Maps"
              />
            </div>
          </div>

          <div>
            <h3 className="text-[0.6rem] uppercase tracking-[0.35em] text-gold-500">Hours</h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {HOURS.map((h) => (
                <li key={h.day} className="flex justify-between gap-4 text-fg-muted">
                  <span>{h.day}</span>
                  <span className="tnum text-fg">{h.time}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 text-sm">
              {[
                { label: "Full Menu", href: "/menu" },
                { label: "Book a Table", href: "/booking" },
                { label: "Admin Demo", href: "/admin" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-center gap-1.5 text-fg-muted transition-colors hover:text-gold-400"
                >
                  {l.label}
                  <ArrowUpRight
                    size={13}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[0.6rem] uppercase tracking-[0.35em] text-gold-500">
              From the room
            </h3>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {GALLERY.slice(0, 6).map((shot) => (
                <a
                  key={shot.id}
                  href="#"
                  className="group relative aspect-square overflow-hidden rounded-lg"
                  aria-label={shot.alt}
                >
                  <SmartImage
                    src={shot.src}
                    alt={shot.alt}
                    seed={shot.id}
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-noir-950/45 opacity-0 transition-opacity group-hover:opacity-100" />
                  <Instagram
                    size={14}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-cream-100 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-line py-8 text-[0.68rem] text-fg-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} Noir Café &amp; Roastery. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="link-underline">Privacy</a>
            <a href="#" className="link-underline">Terms</a>
            <button onClick={() => scrollToId("top")} className="link-underline">
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
