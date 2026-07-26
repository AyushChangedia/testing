"use client";

import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useSpring, type Variants } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { Star } from "lucide-react";
import { cn, groupIndian, prefersReducedMotion } from "@/lib/utils";
import { Magnetic } from "./magnetic";

/* ------------------------------------------------------------------ Button */

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-body font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-45 active:scale-[0.97] cursor-pointer",
  {
    variants: {
      variant: {
        // Gold fill — one primary CTA per view.
        primary:
          "bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 text-noir-950 shadow-[0_8px_36px_-10px_rgb(212_175_55_/_0.65)] hover:shadow-[0_14px_50px_-8px_rgb(212_175_55_/_0.85)]",
        outline:
          "border border-line-strong text-fg hover:border-accent hover:text-accent backdrop-blur-sm",
        ghost: "text-fg-muted hover:bg-surface-hover hover:text-fg",
        glass: "glass text-fg hover:border-accent/50",
        danger: "bg-danger/15 text-danger border border-danger/35 hover:bg-danger/25",
      },
      size: {
        sm: "h-10 px-4 text-xs tracking-[0.14em] uppercase",
        // 44px min height satisfies the touch-target floor.
        md: "h-12 px-7 text-[0.7rem] tracking-[0.2em] uppercase",
        lg: "h-14 px-9 text-xs tracking-[0.22em] uppercase",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  magnetic?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, magnetic, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // `asChild` renders through Radix Slot, which accepts exactly one child —
    // so the hover sheen is a CSS pseudo-element (.btn-sheen) rather than an
    // extra DOM node, and the loading swap is skipped in slot mode.
    const content =
      loading && !asChild ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Working</span>
        </>
      ) : (
        children
      );

    const inner = (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), "btn-sheen", className)}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {content}
      </Comp>
    );

    return magnetic ? <Magnetic strength={12}>{inner}</Magnetic> : inner;
  },
);
Button.displayName = "Button";

/* ------------------------------------------------------------------- Badge */

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "gold" | "veg" | "nonveg" | "danger" | "new";
  className?: string;
}) {
  const tones = {
    default: "border-line-strong text-fg-muted",
    gold: "border-gold-500/45 text-gold-400 bg-gold-500/10",
    veg: "border-veg/50 text-veg bg-veg/10",
    nonveg: "border-nonveg/50 text-nonveg bg-nonveg/10",
    danger: "border-danger/50 text-danger bg-danger/10",
    new: "border-latte/50 text-latte bg-latte/10",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.16em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ Reveal */

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 34, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      delay: i * 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export function Reveal({
  children,
  className,
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      custom={delay}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------------------------------------- SplitText */

/**
 * Per-character entrance. Renders the full string in a visually hidden node so
 * screen readers get clean text rather than a pile of single letters.
 */
export function SplitText({
  text,
  className,
  charClassName,
  delay = 0,
  stagger = 0.028,
  active = true,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  /** Gate the entrance on an external cue (e.g. the intro finishing). */
  active?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const play = inView && active;
  const words = text.split(" ");

  return (
    <Tag className={cn("inline-block", className)}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden className="inline-block">
        {words.map((word, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, ci) => {
              const index = words.slice(0, wi).join(" ").length + ci;
              return (
                <motion.span
                  key={ci}
                  className={cn("inline-block will-change-transform", charClassName)}
                  initial={{ y: "110%", opacity: 0, rotateX: -55 }}
                  animate={play ? { y: "0%", opacity: 1, rotateX: 0 } : undefined}
                  transition={{
                    duration: 0.9,
                    delay: delay + index * stagger,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
            {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    </Tag>
  );
}

/* ------------------------------------------------------------------ Counter */

export function Counter({
  to,
  decimal = false,
  suffix = "",
  className,
  duration = 2,
}: {
  to: number;
  decimal?: boolean;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [display, setDisplay] = useState(decimal ? "0.0" : "0");

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setDisplay(decimal ? to.toFixed(1) : groupIndian(to));
      return;
    }

    const start = performance.now();
    const ms = duration * 1000;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = to * eased;
      setDisplay(decimal ? value.toFixed(1) : groupIndian(value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, decimal, duration]);

  return (
    <span ref={ref} className={cn("tnum", className)}>
      {display}
      {suffix}
    </span>
  );
}

/* --------------------------------------------------------------- StarRating */

export function StarRating({
  value,
  size = 14,
  showValue = false,
  className,
}: {
  value: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-cream-400/35" strokeWidth={1.5} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star size={size} className="text-gold-400" fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
        })}
      </span>
      {showValue && <span className="tnum text-xs text-fg-muted">{value.toFixed(1)}</span>}
    </span>
  );
}

/* ------------------------------------------------------------ SectionHeader */

export function SectionHeader({
  eyebrow,
  title,
  body,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <Reveal>
        <span className="inline-flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.5em] text-gold-500">
          <span className="h-px w-9 bg-gradient-to-r from-transparent to-gold-500" />
          {eyebrow}
        </span>
      </Reveal>
      <SplitText
        as="h2"
        text={title}
        className="max-w-4xl font-display text-title"
        charClassName="text-gradient-cream"
        stagger={0.016}
      />
      {body && (
        <Reveal delay={1}>
          <p
            className={cn(
              "max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg",
              align === "center" && "mx-auto",
            )}
          >
            {body}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ Tilt wrapper */

/** 3D tilt that follows the pointer, with a gloss highlight. */
export function Tilt({
  children,
  className,
  max = 9,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 20 });
  const sry = useSpring(ry, { stiffness: 220, damping: 20 });

  const onMove = (e: React.PointerEvent) => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d", perspective: 1000 }}
      className={cn(glare && "spotlight", "relative", className)}
    >
      {children}
    </motion.div>
  );
}
