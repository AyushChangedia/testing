"use client";

import { useEffect, useRef, useState } from "react";
import { isTouchDevice, prefersReducedMotion } from "@/lib/utils";

interface TrailDot {
  x: number;
  y: number;
  life: number;
}

/**
 * Custom cursor: a precise dot, a lagging ring, and a liquid coffee trail
 * rendered on canvas. Disabled entirely on touch and for reduced-motion users,
 * where the native cursor is restored via the `custom-cursor` html class.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");
    return () => document.documentElement.classList.remove("custom-cursor");
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const canvas = canvasRef.current;
    if (!dot || !ring || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pointer };
    const dotPos = { ...pointer };
    const trail: TrailDot[] = [];
    let hovering = false;
    let pressed = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      trail.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (trail.length > 26) trail.shift();

      const target = (e.target as HTMLElement | null)?.closest?.(
        'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]',
      );
      const next = Boolean(target);
      if (next !== hovering) {
        hovering = next;
        ring.dataset.hover = String(next);
      }
    };

    const onDown = () => {
      pressed = true;
      ring.dataset.press = "true";
    };
    const onUp = () => {
      pressed = false;
      ring.dataset.press = "false";
    };
    const onLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnter = () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    const render = () => {
      // Dot tracks fast, ring lags — creates the elastic feel.
      dotPos.x += (pointer.x - dotPos.x) * 0.62;
      dotPos.y += (pointer.y - dotPos.y) * 0.62;
      ringPos.x += (pointer.x - ringPos.x) * 0.16;
      ringPos.y += (pointer.y - ringPos.y) * 0.16;

      dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`;
      const scale = pressed ? 0.75 : hovering ? 2.1 : 1;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale})`;

      // Liquid coffee trail
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        t.life *= 0.9;
        if (t.life < 0.02) continue;
        const r = 26 * t.life * (i / trail.length + 0.35);
        const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, r);
        g.addColorStop(0, `rgba(212, 175, 55, ${0.16 * t.life})`);
        g.addColorStop(0.5, `rgba(169, 116, 79, ${0.09 * t.life})`);
        g.addColorStop(1, "rgba(111, 78, 55, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      while (trail.length && trail[0].life < 0.02) trail.shift();

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-gold-400 transition-opacity duration-300"
      />
      <div
        ref={ringRef}
        data-hover="false"
        data-press="false"
        className="absolute left-0 top-0 h-9 w-9 rounded-full border border-gold-500/60 transition-[opacity,background-color,border-color] duration-300 data-[hover=true]:border-gold-400 data-[hover=true]:bg-gold-400/10 data-[press=true]:bg-gold-400/25"
      />
    </div>
  );
}
