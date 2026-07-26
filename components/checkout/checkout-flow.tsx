"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPin,
  CreditCard,
  Smartphone,
  Wallet,
  Check,
  ChevronRight,
  ShoppingBag,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  useCart,
  lineKey,
  unitPrice,
  selectSubtotal,
  selectDiscount,
  selectTax,
  selectDelivery,
  selectTotal,
  selectEarnedPoints,
} from "@/lib/store/cart";
import { getItem } from "@/lib/data/menu";
import { Button } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { cn, formatPrice } from "@/lib/utils";

type Step = "address" | "payment" | "done";
type PaymentMethod = "upi" | "card" | "cod";

const STEPS: Array<{ key: Step; label: string }> = [
  { key: "address", label: "Delivery" },
  { key: "payment", label: "Payment" },
  { key: "done", label: "Confirmed" },
];

export function CheckoutFlow() {
  const [step, setStep] = useState<Step>("address");
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "Mumbai",
    pincode: "",
    slot: "asap",
    upi: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const cart = useCart();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);

  const subtotal = selectSubtotal(cart);
  const discount = selectDiscount(cart);
  const tax = selectTax(cart);
  const delivery = selectDelivery(cart);
  const total = selectTotal(cart);
  const points = selectEarnedPoints(cart);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  if (lines.length === 0 && step !== "done") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl border border-dashed border-line py-24 text-center">
        <ShoppingBag size={34} className="text-fg-subtle" />
        <div>
          <p className="font-display text-2xl">Your cart is empty</p>
          <p className="mt-2 text-sm text-fg-muted">
            Add something first — checkout will be here when you get back.
          </p>
        </div>
        <Button asChild size="md">
          <Link href="/menu">Browse the Menu</Link>
        </Button>
      </div>
    );
  }

  const validateAddress = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "We need a name for the order.";
    if (!/^[\d\s+()-]{8,}$/.test(form.phone)) next.phone = "Enter a reachable phone number.";
    if (form.line1.trim().length < 4) next.line1 = "Enter the street address.";
    if (!/^\d{6}$/.test(form.pincode)) next.pincode = "PIN code should be six digits.";
    setErrors(next);
    if (Object.keys(next).length) {
      focusFirstError(Object.keys(next)[0]);
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    const next: Record<string, string> = {};
    if (method === "upi" && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(form.upi))
      next.upi = "Enter a UPI ID like name@bank.";
    if (method === "card") {
      if (form.cardNumber.replace(/\s/g, "").length < 15)
        next.cardNumber = "Enter the full card number.";
      if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) next.cardExpiry = "Use MM/YY.";
      if (!/^\d{3,4}$/.test(form.cardCvv)) next.cardCvv = "CVV is 3 or 4 digits.";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      focusFirstError(Object.keys(next)[0]);
      return false;
    }
    return true;
  };

  const placeOrder = () => {
    if (!validatePayment()) return;
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      setStep("done");
      clear();
    }, 1600);
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div>
      {/* Progress */}
      <ol className="mx-auto mb-12 flex max-w-lg items-center justify-between">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <li key={s.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border text-xs transition-colors",
                    done && "border-veg bg-veg/15 text-veg",
                    current && "border-gold-500 bg-gold-500/15 text-gold-400",
                    !done && !current && "border-line text-fg-subtle",
                  )}
                >
                  {done ? <Check size={15} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-[0.58rem] uppercase tracking-[0.2em]",
                    current ? "text-fg" : "text-fg-subtle",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="mx-2 h-px flex-1 bg-line">
                  <motion.span
                    className="block h-px bg-gold-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: done ? 1 : 0 }}
                    style={{ transformOrigin: "left" }}
                    transition={{ duration: 0.5 }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {step === "done" ? (
        <OrderConfirmed points={points} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* Form column */}
          <div>
            <AnimatePresence mode="wait">
              {step === "address" && (
                <motion.section
                  key="address"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="grad-border space-y-5 rounded-2xl bg-bg-elevated/60 p-7"
                >
                  <h2 className="flex items-center gap-2 font-display text-2xl">
                    <MapPin size={18} className="text-gold-500" />
                    Where are we sending it?
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input id="co-name" label="Full name" required value={form.name} onChange={set("name")} error={errors.name} autoComplete="name" />
                    <Input id="co-phone" label="Phone" required type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} error={errors.phone} autoComplete="tel" />
                  </div>

                  <Input id="co-line1" label="Address" required value={form.line1} onChange={set("line1")} error={errors.line1} autoComplete="address-line1" placeholder="Flat, building, street" />
                  <Input id="co-line2" label="Landmark" value={form.line2} onChange={set("line2")} autoComplete="address-line2" placeholder="Optional" />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input id="co-city" label="City" value={form.city} onChange={set("city")} autoComplete="address-level2" />
                    <Input id="co-pincode" label="PIN code" required inputMode="numeric" value={form.pincode} onChange={set("pincode")} error={errors.pincode} autoComplete="postal-code" />
                  </div>

                  {/* Delivery slot */}
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-fg-subtle">
                      <Clock size={11} />
                      When
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        { key: "asap", label: "As soon as possible", sub: "35–45 min" },
                        { key: "60", label: "In an hour", sub: "Scheduled" },
                        { key: "evening", label: "This evening", sub: "After 6pm" },
                      ].map((slot) => (
                        <button
                          key={slot.key}
                          type="button"
                          onClick={() => set("slot")(slot.key)}
                          aria-pressed={form.slot === slot.key}
                          className={cn(
                            "flex min-h-[3.5rem] flex-col items-start justify-center rounded-xl border px-4 py-3 text-left transition-colors",
                            form.slot === slot.key
                              ? "border-gold-500 bg-gold-500/10"
                              : "border-line hover:border-line-strong",
                          )}
                        >
                          <span className="text-xs text-fg">{slot.label}</span>
                          <span className="text-[0.6rem] text-fg-subtle">{slot.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => validateAddress() && setStep("payment")}
                  >
                    Continue to Payment
                    <ChevronRight size={15} />
                  </Button>
                </motion.section>
              )}

              {step === "payment" && (
                <motion.section
                  key="payment"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="grad-border space-y-5 rounded-2xl bg-bg-elevated/60 p-7"
                >
                  <h2 className="flex items-center gap-2 font-display text-2xl">
                    <CreditCard size={18} className="text-gold-500" />
                    How would you like to pay?
                  </h2>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { key: "upi" as const, label: "UPI", icon: Smartphone, sub: "Instant" },
                      { key: "card" as const, label: "Card", icon: CreditCard, sub: "Visa, MC, Amex" },
                      { key: "cod" as const, label: "Cash", icon: Wallet, sub: "On delivery" },
                    ].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMethod(m.key)}
                        aria-pressed={method === m.key}
                        className={cn(
                          "flex min-h-[5rem] flex-col items-center justify-center gap-1.5 rounded-xl border transition-colors",
                          method === m.key
                            ? "border-gold-500 bg-gold-500/10 text-gold-300"
                            : "border-line text-fg-muted hover:border-line-strong",
                        )}
                      >
                        <m.icon size={19} />
                        <span className="text-xs">{m.label}</span>
                        <span className="text-[0.55rem] text-fg-subtle">{m.sub}</span>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {method === "upi" && (
                      <motion.div key="upi" {...fade}>
                        <Input
                          id="co-upi"
                          label="UPI ID"
                          required
                          value={form.upi}
                          onChange={set("upi")}
                          error={errors.upi}
                          placeholder="yourname@bank"
                          helper="You'll approve the request in your UPI app."
                        />
                      </motion.div>
                    )}

                    {method === "card" && (
                      <motion.div key="card" {...fade} className="space-y-4">
                        <Input
                          id="co-cardNumber"
                          label="Card number"
                          required
                          inputMode="numeric"
                          autoComplete="cc-number"
                          value={form.cardNumber}
                          onChange={(v) =>
                            set("cardNumber")(
                              v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(),
                            )
                          }
                          error={errors.cardNumber}
                          placeholder="4242 4242 4242 4242"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            id="co-cardExpiry"
                            label="Expiry"
                            required
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            value={form.cardExpiry}
                            onChange={(v) => {
                              const digits = v.replace(/\D/g, "").slice(0, 4);
                              set("cardExpiry")(
                                digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits,
                              );
                            }}
                            error={errors.cardExpiry}
                            placeholder="MM/YY"
                          />
                          <Input
                            id="co-cardCvv"
                            label="CVV"
                            required
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            type="password"
                            value={form.cardCvv}
                            onChange={(v) => set("cardCvv")(v.replace(/\D/g, "").slice(0, 4))}
                            error={errors.cardCvv}
                            placeholder="•••"
                          />
                        </div>
                      </motion.div>
                    )}

                    {method === "cod" && (
                      <motion.p
                        key="cod"
                        {...fade}
                        className="rounded-xl border border-line bg-surface p-4 text-xs leading-relaxed text-fg-muted"
                      >
                        Pay the rider in cash or by card on arrival. Please keep the exact amount
                        handy where you can — it speeds everyone up.
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <p className="flex items-center gap-2 text-[0.65rem] text-fg-subtle">
                    <ShieldCheck size={13} className="text-veg" />
                    This is a demo checkout. No payment is processed and no card data is stored.
                  </p>

                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" onClick={() => setStep("address")}>
                      Back
                    </Button>
                    <Button size="lg" className="flex-1" loading={processing} onClick={placeOrder}>
                      Pay {formatPrice(total)}
                    </Button>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* Summary column */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="grad-border rounded-2xl bg-bg-elevated/60 p-6">
              <h2 className="font-display text-xl">Order summary</h2>

              <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto">
                {lines.map((line) => {
                  const item = getItem(line.id);
                  if (!item) return null;
                  const each = unitPrice(line.id, line.size);
                  return (
                    <li key={lineKey(line)} className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                        <SmartImage
                          src={item.image}
                          alt={item.name}
                          seed={item.slug}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                        <span className="tnum absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.55rem] font-semibold text-noir-950">
                          {line.qty}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-fg">{item.name}</p>
                        <p className="text-[0.62rem] text-fg-subtle">Size {line.size}</p>
                      </div>
                      <span className="tnum shrink-0 text-xs text-gold-400">
                        {formatPrice(each * line.qty)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <dl className="mt-5 space-y-2 border-t border-line pt-5 text-xs">
                <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
                {discount > 0 && (
                  <SummaryRow label="Discount" value={`−${formatPrice(discount)}`} tone="veg" />
                )}
                <SummaryRow label="GST (5%)" value={formatPrice(tax)} />
                <SummaryRow
                  label="Delivery"
                  value={delivery === 0 ? "Free" : formatPrice(delivery)}
                  tone={delivery === 0 ? "veg" : undefined}
                />
                <div className="!mt-4 flex items-baseline justify-between border-t border-line pt-4">
                  <dt className="font-display text-lg">Total</dt>
                  <dd className="tnum font-display text-2xl text-gold-400">{formatPrice(total)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/**
 * Sends focus to the first invalid field after a failed submit (WCAG 3.3.1).
 * Deferred a frame so nodes rendered by the error state already exist.
 */
function focusFirstError(key: string) {
  requestAnimationFrame(() => {
    const el = document.getElementById(`co-${key}`);
    el?.focus();
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22 },
};

function Input({
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
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  type?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  autoComplete?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : helper ? `${id}-help` : undefined}
        className={cn(
          "h-12 w-full rounded-xl border bg-transparent px-4 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle/55",
          error ? "border-danger" : "border-line focus:border-accent",
        )}
      />
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-[0.68rem] text-danger">
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-help`} className="mt-1.5 text-[0.62rem] text-fg-subtle">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: "veg" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-fg-muted">{label}</dt>
      <dd className={cn("tnum", tone === "veg" ? "text-veg" : "text-fg")}>{value}</dd>
    </div>
  );
}

function OrderConfirmed({ points }: { points: number }) {
  const orderId = `NC${Date.now().toString().slice(-7)}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="grad-border relative mx-auto max-w-xl overflow-hidden rounded-[1.75rem] bg-bg-elevated/70 p-10 text-center"
    >
      {/* Steam rising from the confirmation */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-24 h-16 w-px bg-gradient-to-t from-cream-300/40 to-transparent"
          style={{ marginLeft: (i - 1) * 14 }}
          animate={{ opacity: [0, 0.6, 0], y: [10, -50], scaleX: [1, 2.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
        />
      ))}

      <motion.span
        initial={{ scale: 0, rotate: -120 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 15, delay: 0.15 }}
        className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold-500/45 bg-gold-500/12"
      >
        <Check size={34} className="text-gold-400" strokeWidth={1.5} />
      </motion.span>

      <h2 className="mt-7 font-display text-4xl text-gradient-cream">Order placed</h2>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">
        The kitchen has it. Grinding starts in about four minutes — we'll text you when the rider
        picks it up.
      </p>

      <div className="mt-8 flex items-center justify-center gap-6 text-sm">
        <div>
          <p className="text-[0.55rem] uppercase tracking-[0.25em] text-fg-subtle">Order</p>
          <p className="tnum mt-1 font-display text-lg text-fg">{orderId}</p>
        </div>
        <span className="h-8 w-px bg-line" />
        <div>
          <p className="text-[0.55rem] uppercase tracking-[0.25em] text-fg-subtle">Arriving</p>
          <p className="tnum mt-1 font-display text-lg text-fg">35–45 min</p>
        </div>
        <span className="h-8 w-px bg-line" />
        <div>
          <p className="text-[0.55rem] uppercase tracking-[0.25em] text-fg-subtle">Points</p>
          <p className="tnum mt-1 font-display text-lg text-gold-400">+{points}</p>
        </div>
      </div>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="md">
          <Link href="/menu">Order Something Else</Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </motion.div>
  );
}
