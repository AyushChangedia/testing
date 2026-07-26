"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn, gradientFor } from "@/lib/utils";

type Props = Omit<ImageProps, "onError" | "placeholder"> & {
  /** Seed for the fallback gradient — defaults to alt text. */
  seed?: string;
  wrapperClassName?: string;
};

/**
 * Image with a graceful, on-brand fallback.
 *
 * Remote photography can 404 or be blocked by a network policy; when that
 * happens we render a deterministic coffee-toned gradient instead of a broken
 * image icon, so the layout never collapses.
 */
export function SmartImage({ seed, alt, className, wrapperClassName, ...props }: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [from, to] = gradientFor(seed ?? String(alt ?? "noir"));

  if (failed) {
    return (
      <div
        aria-label={typeof alt === "string" ? alt : undefined}
        role="img"
        className={cn("relative h-full w-full overflow-hidden", wrapperClassName, className)}
        style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
      >
        <div className="grain absolute inset-0" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(70% 60% at 30% 25%, rgb(212 175 55 / 0.22), transparent 70%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", wrapperClassName)}>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100",
        )}
        style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
      />
      <Image
        alt={alt}
        className={cn(
          "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  );
}
