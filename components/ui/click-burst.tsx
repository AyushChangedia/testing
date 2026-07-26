"use client";

import { useEffect, useRef } from "react";
import { isTouchDevice, prefersReducedMotion } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  hue: number;
}

/**
 * Coffee-bean particle burst on click. Canvas-based so it costs one composited
 * layer regardless of how many particles are alive.
 */
export function ClickBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    let raf = 0;
    let running = false;

    const onClick = (e: PointerEvent) => {
      const count = 16;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 2.2 + Math.random() * 4.2;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.4,
          life: 1,
          size: 2 + Math.random() * 3.4,
          hue: 28 + Math.random() * 22,
        });
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.19; // gravity
        p.vx *= 0.985; // drag
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.019;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.x * 0.02 + p.life * 3);
        // Bean shape: ellipse with a centre crease.
        ctx.fillStyle = `hsl(${p.hue} 48% ${26 + p.life * 22}%)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.68, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `hsl(${p.hue} 40% 12% / 0.8)`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.75, 0);
        ctx.quadraticCurveTo(0, p.size * 0.3, p.size * 0.75, 0);
        ctx.stroke();
        ctx.restore();
      }

      if (particles.length) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
        ctx.clearRect(0, 0, innerWidth, innerHeight);
      }
    };

    window.addEventListener("pointerdown", onClick);
    return () => {
      window.removeEventListener("pointerdown", onClick);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9998]"
    />
  );
}
