"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X, AlertTriangle } from "lucide-react";
import { useUI } from "@/lib/store/ui";

export function Toasts() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismissToast);

  return (
    <div
      // polite + non-focusing: announced without stealing keyboard position
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-24 right-4 z-[160] flex w-[min(92vw,23rem)] flex-col gap-3 sm:bottom-8 sm:right-8"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.22 } }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass-strong pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-[0_20px_60px_-20px_rgb(0_0_0_/_0.8)]"
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                t.tone === "danger"
                  ? "bg-danger/20 text-danger"
                  : t.tone === "success"
                    ? "bg-veg/20 text-veg"
                    : "bg-gold-500/20 text-gold-400"
              }`}
            >
              {t.tone === "danger" ? <AlertTriangle size={14} /> : <Check size={14} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">{t.title}</p>
              {t.body && <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{t.body}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="-m-1 shrink-0 rounded-full p-1 text-fg-subtle transition-colors hover:text-fg"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
