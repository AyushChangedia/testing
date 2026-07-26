"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  Check,
  CalendarDays,
  Sparkles,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const TIMES = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00",
];

// Deterministic pseudo-availability so the UI has texture without a backend.
function slotsFor(dateKey: string, time: string) {
  let h = 0;
  const s = dateKey + time;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 7;
}

const OCCASIONS = ["None", "Birthday", "Anniversary", "Business", "Date night"] as const;

export function BookingForm() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState<(typeof OCCASIONS)[number]>("None");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Calendar grid, Monday-first.
  const grid = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7;
    const cells: Array<Date | null> = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    }
    return cells;
  }, [month]);

  const dateKey = selected ? selected.toISOString().slice(0, 10) : "";

  const validate = () => {
    const next: Record<string, string> = {};
    if (!selected) next.date = "Choose a date for your booking.";
    if (!time) next.time = "Choose a time.";
    if (name.trim().length < 2) next.name = "Enter the name for the reservation.";
    if (!/^[\d\s+()-]{8,}$/.test(phone)) next.phone = "Enter a phone number we can reach you on.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      next.email = "That email address doesn't look right.";
    setErrors(next);
    return next;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      // Move focus to the first problem. Deferred by a frame because the error
      // nodes for date/time only exist once React has committed setErrors.
      const firstKey = Object.keys(next)[0];
      requestAnimationFrame(() => {
        const el = document.getElementById(`booking-${firstKey}`);
        el?.focus();
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setConfirmed(true);
    }, 1100);
  };

  if (confirmed && selected && time) {
    return <Confirmation date={selected} time={time} guests={guests} name={name} />;
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      {/* Left: date + time */}
      <div className="space-y-8">
        {/* Calendar */}
        <fieldset className="grad-border rounded-2xl bg-bg-elevated/60 p-6">
          <legend className="sr-only">Choose a date</legend>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              disabled={
                month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth()
              }
              aria-label="Previous month"
              className="flex h-11 w-11 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-hover disabled:opacity-30"
            >
              <ChevronLeft size={17} />
            </button>
            <p className="font-display text-xl">
              {month.toLocaleString("en-IN", { month: "long", year: "numeric" })}
            </p>
            <button
              type="button"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              aria-label="Next month"
              className="flex h-11 w-11 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-hover"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1 text-center">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} className="pb-2 text-[0.6rem] uppercase tracking-widest text-fg-subtle">
                {d}
              </span>
            ))}

            {grid.map((day, i) => {
              if (!day) return <span key={`e${i}`} />;
              const past = day < today;
              const isSelected = selected?.toDateString() === day.toDateString();
              const isToday = day.toDateString() === today.toDateString();

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={past}
                  onClick={() => {
                    setSelected(day);
                    setTime(null);
                    setErrors((e) => ({ ...e, date: "" }));
                  }}
                  aria-pressed={isSelected}
                  aria-label={day.toDateString()}
                  className={cn(
                    "relative flex h-11 items-center justify-center rounded-xl text-sm transition-colors",
                    past && "cursor-not-allowed text-fg-subtle/25",
                    !past && !isSelected && "text-fg-muted hover:bg-surface-hover hover:text-fg",
                    isSelected && "text-noir-950",
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="day-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="tnum relative">{day.getDate()}</span>
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-gold-500" />
                  )}
                </button>
              );
            })}
          </div>

          {errors.date && (
            <p id="booking-date" tabIndex={-1} role="alert" className="mt-3 text-xs text-danger">
              {errors.date}
            </p>
          )}
        </fieldset>

        {/* Times */}
        <fieldset className="grad-border rounded-2xl bg-bg-elevated/60 p-6">
          <legend className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.28em] text-fg-subtle">
            <Clock size={12} />
            Sitting time
          </legend>

          {!selected ? (
            <p className="mt-4 text-sm text-fg-muted">Pick a date to see what's free.</p>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {TIMES.map((t) => {
                const left = slotsFor(dateKey, t);
                const full = left === 0;
                const active = time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={full}
                    onClick={() => {
                      setTime(t);
                      setErrors((e) => ({ ...e, time: "" }));
                    }}
                    aria-pressed={active}
                    className={cn(
                      "flex h-14 flex-col items-center justify-center rounded-xl border text-xs transition-colors",
                      full && "cursor-not-allowed border-line/50 text-fg-subtle/30 line-through",
                      !full && !active && "border-line text-fg-muted hover:border-gold-600 hover:text-fg",
                      active && "border-gold-500 bg-gold-500/12 text-gold-300",
                    )}
                  >
                    <span className="tnum">{t}</span>
                    {!full && (
                      <span className="tnum mt-0.5 text-[0.55rem] text-fg-subtle">{left} left</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {errors.time && (
            <p id="booking-time" tabIndex={-1} role="alert" className="mt-3 text-xs text-danger">
              {errors.time}
            </p>
          )}
        </fieldset>
      </div>

      {/* Right: party + details */}
      <div className="space-y-8">
        <fieldset className="grad-border rounded-2xl bg-bg-elevated/60 p-6">
          <legend className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.28em] text-fg-subtle">
            <Users size={12} />
            Party size
          </legend>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              aria-label="Fewer guests"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors hover:border-gold-500 hover:text-gold-400"
            >
              <Minus size={16} />
            </button>

            <div className="text-center">
              <AnimatePresence mode="popLayout">
                <motion.p
                  key={guests}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="tnum font-display text-5xl text-gradient-gold"
                >
                  {guests}
                </motion.p>
              </AnimatePresence>
              <p className="mt-1 text-[0.6rem] uppercase tracking-[0.25em] text-fg-subtle">
                {guests === 1 ? "Guest" : "Guests"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(12, g + 1))}
              aria-label="More guests"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors hover:border-gold-500 hover:text-gold-400"
            >
              <Plus size={16} />
            </button>
          </div>

          {guests > 6 && (
            <p className="mt-4 rounded-xl border border-gold-600/30 bg-gold-500/8 p-3 text-[0.68rem] text-gold-200/90">
              Parties over six are seated in the mezzanine. We'll call to confirm the layout.
            </p>
          )}
        </fieldset>

        <fieldset className="grad-border space-y-4 rounded-2xl bg-bg-elevated/60 p-6">
          <legend className="text-[0.6rem] uppercase tracking-[0.28em] text-fg-subtle">
            Your details
          </legend>

          <Field
            id="booking-name"
            label="Name"
            required
            value={name}
            onChange={setName}
            error={errors.name}
            autoComplete="name"
          />
          <Field
            id="booking-phone"
            label="Phone"
            required
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={setPhone}
            error={errors.phone}
            autoComplete="tel"
            helper="We only call if something changes."
          />
          <Field
            id="booking-email"
            label="Email"
            type="email"
            inputMode="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            autoComplete="email"
            helper="Optional — for the confirmation."
          />

          <div>
            <label
              htmlFor="booking-occasion"
              className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.2em] text-fg-subtle"
            >
              Occasion
            </label>
            <select
              id="booking-occasion"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value as typeof occasion)}
              className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-line bg-transparent px-4 text-sm text-fg outline-none transition-colors focus:border-accent"
            >
              {OCCASIONS.map((o) => (
                <option key={o} value={o} className="bg-noir-900">
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="booking-notes"
              className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.2em] text-fg-subtle"
            >
              Special requests
            </label>
            <textarea
              id="booking-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, a quiet corner, a cake at the end of the meal…"
              className="w-full resize-none rounded-xl border border-line bg-transparent p-4 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle/60 focus:border-accent"
            />
            <p className="mt-1.5 text-[0.62rem] text-fg-subtle">
              The kitchen reads every one of these.
            </p>
          </div>
        </fieldset>

        {/* Summary + submit */}
        <div className="grad-border rounded-2xl bg-bg-elevated/60 p-6">
          <dl className="space-y-2 text-sm">
            <SummaryRow
              label="Date"
              value={
                selected
                  ? selected.toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                    })
                  : "—"
              }
            />
            <SummaryRow label="Time" value={time ?? "—"} />
            <SummaryRow label="Guests" value={String(guests)} />
            {occasion !== "None" && <SummaryRow label="Occasion" value={occasion} />}
          </dl>

          <Button type="submit" size="lg" className="mt-6 w-full" loading={submitting}>
            Confirm Reservation
          </Button>
          <p className="mt-3 text-center text-[0.62rem] text-fg-subtle">
            We hold the table for 15 minutes past your sitting time.
          </p>
        </div>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  helper,
  required,
  type = "text",
  inputMode,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  type?: string;
  inputMode?: "text" | "tel" | "email";
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.2em] text-fg-subtle">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        className={cn(
          "h-12 w-full rounded-xl border bg-transparent px-4 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle/60",
          error ? "border-danger" : "border-line focus:border-accent",
        )}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[0.68rem] text-danger">
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-helper`} className="mt-1.5 text-[0.62rem] text-fg-subtle">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-2">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="tnum text-fg">{value}</dd>
    </div>
  );
}

function Confirmation({
  date,
  time,
  guests,
  name,
}: {
  date: Date;
  time: string;
  guests: number;
  name: string;
}) {
  const reference = `NOIR-${date.getDate()}${date.getMonth() + 1}-${time.replace(":", "")}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="grad-border relative mx-auto max-w-xl overflow-hidden rounded-[1.75rem] bg-bg-elevated/70 p-10 text-center"
    >
      {/* Celebratory beans */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-2 w-2.5 rounded-full bg-gold-400"
          style={{ left: `${8 + i * 6.4}%`, top: "45%" }}
          initial={{ opacity: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -140 - (i % 4) * 40],
            x: [(i % 2 ? 1 : -1) * (10 + i * 4)],
            scale: [0, 1, 0.4],
            rotate: [0, 220],
          }}
          transition={{ duration: 1.8, delay: 0.15 + i * 0.05, ease: "easeOut" }}
        />
      ))}

      <motion.span
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
        className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold-500/45 bg-gold-500/12"
      >
        <Check size={34} className="text-gold-400" strokeWidth={1.5} />
      </motion.span>

      <h2 className="mt-7 font-display text-4xl text-gradient-cream">Table confirmed</h2>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">
        Thank you, {name.split(" ")[0]}. We have you down and the corner booth is looking good.
      </p>

      <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line text-left">
        <Cell icon={<CalendarDays size={13} />} label="Date" value={date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />
        <Cell icon={<Clock size={13} />} label="Time" value={time} />
        <Cell icon={<Users size={13} />} label="Guests" value={String(guests)} />
      </dl>

      <p className="mt-6 flex items-center justify-center gap-2 text-[0.65rem] text-fg-subtle">
        <Sparkles size={12} className="text-gold-500" />
        Reference <span className="tnum text-gold-400">{reference}</span>
      </p>

      <Button
        variant="outline"
        size="md"
        className="mt-7"
        onClick={() => window.location.reload()}
      >
        Book another table
      </Button>
    </motion.div>
  );
}

function Cell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-bg-elevated p-4">
      <dt className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.2em] text-fg-subtle">
        {icon}
        {label}
      </dt>
      <dd className="tnum mt-1.5 font-display text-lg text-fg">{value}</dd>
    </div>
  );
}
