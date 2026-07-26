"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Bell,
  Package,
  Users,
  ArrowUpRight,
  AlertTriangle,
  ArrowLeft,
  Search,
} from "lucide-react";
import {
  KPIS,
  REVENUE_SERIES,
  HOURLY,
  CATEGORY_SPLIT,
  TOP_ITEMS,
  ORDERS,
  INVENTORY,
  CUSTOMERS,
  NOTIFICATIONS,
} from "@/lib/data/admin";
import { Counter } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { cn, formatPrice, formatCompact } from "@/lib/utils";

const STATUS_TONE = {
  Delivered: "text-veg bg-veg/12 border-veg/30",
  Preparing: "text-gold-400 bg-gold-500/12 border-gold-500/30",
  "Out for delivery": "text-latte bg-latte/12 border-latte/30",
  Cancelled: "text-danger bg-danger/12 border-danger/30",
} as const;

const STOCK_TONE = {
  ok: "text-veg",
  low: "text-gold-400",
  critical: "text-danger",
} as const;

export function AdminDashboard() {
  const [query, setQuery] = useState("");

  const orders = ORDERS.filter(
    (o) =>
      !query ||
      o.customer.toLowerCase().includes(query.toLowerCase()) ||
      o.id.toLowerCase().includes(query.toLowerCase()),
  );

  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="min-h-dvh bg-noir-950 text-cream-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-noir-950/85 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg-muted transition-colors hover:border-accent hover:text-accent"
              aria-label="Back to the site"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="font-display text-lg tracking-[0.2em] text-gradient-gold">NOIR</p>
              <p className="text-[0.5rem] uppercase tracking-[0.35em] text-fg-subtle">
                Operations
              </p>
            </div>
          </div>

          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle" />
            <label htmlFor="admin-search" className="sr-only">
              Search orders
            </label>
            <input
              id="admin-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders or customers…"
              className="h-10 w-full rounded-full border border-line bg-transparent pl-10 pr-4 text-xs outline-none transition-colors focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg-muted transition-colors hover:text-fg"
              aria-label={`Notifications, ${unread} unread`}
            >
              <Bell size={16} />
              {unread > 0 && (
                <span className="tnum absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.55rem] font-semibold text-noir-950">
                  {unread}
                </span>
              )}
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-500 to-gold-700 text-xs font-semibold text-noir-950">
                AV
              </span>
              <div className="text-left">
                <p className="text-xs text-fg">Aditi Varma</p>
                <p className="text-[0.55rem] text-fg-subtle">Owner</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-x space-y-6 py-8">
        {/* KPI row */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((kpi, i) => {
            const up = kpi.delta >= 0;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="grad-border spotlight relative rounded-2xl bg-bg-elevated/70 p-6"
              >
                <p className="text-[0.58rem] uppercase tracking-[0.25em] text-fg-subtle">
                  {kpi.label}
                </p>
                <p className="mt-3 font-display text-3xl text-cream-100">
                  {kpi.format === "currency" ? (
                    <>
                      <span className="text-gold-400">₹</span>
                      <Counter to={kpi.value} />
                    </>
                  ) : (
                    <Counter to={kpi.value} />
                  )}
                </p>
                <p
                  className={cn(
                    "mt-2 flex items-center gap-1 text-[0.68rem]",
                    up ? "text-veg" : "text-danger",
                  )}
                >
                  {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span className="tnum">
                    {up ? "+" : ""}
                    {kpi.delta.toFixed(1)}%
                  </span>
                  <span className="text-fg-subtle">{kpi.sub}</span>
                </p>
              </motion.div>
            );
          })}
        </section>

        {/* Charts */}
        <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Panel title="Revenue" subtitle="Last 14 days">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={REVENUE_SERIES} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity={0.42} />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgb(245 237 224 / 0.07)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#7d7266", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={18}
                />
                <YAxis
                  tick={{ fill: "#7d7266", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCompact(v as number)}
                  width={44}
                />
                <Tooltip content={<ChartTip currency />} cursor={{ stroke: "#d4af37", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d4af37"
                  strokeWidth={2}
                  fill="url(#rev)"
                  activeDot={{ r: 4, fill: "#f0dda6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Category mix" subtitle="Share of revenue">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={CATEGORY_SPLIT}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={3}
                  stroke="none"
                >
                  {CATEGORY_SPLIT.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTip suffix="%" />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend doubles as an accessible text alternative to the chart */}
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[0.65rem]">
              {CATEGORY_SPLIT.map((c) => (
                <li key={c.name} className="flex items-center gap-2 text-fg-muted">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.fill }} />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="tnum text-fg">{c.value}%</span>
                </li>
              ))}
            </ul>
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Panel title="Covers by hour" subtitle="Today">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={HOURLY} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="rgb(245 237 224 / 0.07)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: "#7d7266", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#7d7266", fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgb(212 175 55 / 0.08)" }} />
                <Bar dataKey="covers" radius={[4, 4, 0, 0]}>
                  {HOURLY.map((h) => (
                    <Cell key={h.hour} fill={h.covers > 100 ? "#d4af37" : "#6f4e37"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Top sellers" subtitle="Last 30 days">
            <ul className="space-y-3">
              {TOP_ITEMS.map((item, i) => (
                <li key={item.slug} className="flex items-center gap-3">
                  <span className="tnum w-4 shrink-0 text-xs text-fg-subtle">{i + 1}</span>
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <SmartImage src={item.image} alt="" seed={item.slug} fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-fg">{item.name}</p>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-mocha to-gold-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.sold / TOP_ITEMS[0].sold) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tnum text-xs text-gold-400">{item.sold}</p>
                    <p className="tnum text-[0.55rem] text-fg-subtle">
                      {formatCompact(item.revenue)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </section>

        {/* Orders */}
        <Panel
          title="Recent orders"
          subtitle={`${orders.length} shown`}
          action={
            <button className="flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.18em] text-gold-500 transition-colors hover:text-gold-300">
              View all
              <ArrowUpRight size={12} />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-xs">
              <thead>
                <tr className="text-[0.58rem] uppercase tracking-[0.2em] text-fg-subtle">
                  <th scope="col" className="pb-3 font-normal">Order</th>
                  <th scope="col" className="pb-3 font-normal">Customer</th>
                  <th scope="col" className="pb-3 font-normal">Item</th>
                  <th scope="col" className="pb-3 font-normal">Channel</th>
                  <th scope="col" className="pb-3 text-right font-normal">Total</th>
                  <th scope="col" className="pb-3 font-normal">Status</th>
                  <th scope="col" className="pb-3 text-right font-normal">When</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-t border-line transition-colors hover:bg-surface">
                    <td className="tnum py-3 text-fg">{order.id}</td>
                    <td className="py-3 text-fg-muted">{order.customer}</td>
                    <td className="max-w-[12rem] truncate py-3 text-fg-subtle">
                      {order.itemName}
                      {order.items > 1 && (
                        <span className="tnum ml-1 text-fg-subtle/70">+{order.items - 1}</span>
                      )}
                    </td>
                    <td className="py-3 text-fg-subtle">{order.channel}</td>
                    <td className="tnum py-3 text-right text-gold-400">{formatPrice(order.total)}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.12em]",
                          STATUS_TONE[order.status],
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="tnum py-3 text-right text-fg-subtle">{order.minutesAgo}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="py-10 text-center text-sm text-fg-muted">
                No orders match “{query}”.
              </p>
            )}
          </div>
        </Panel>

        {/* Inventory + customers + notifications */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Panel title="Inventory" subtitle="Reorder watch" icon={<Package size={14} />}>
            <ul className="space-y-2.5">
              {INVENTORY.map((sku) => (
                <li key={sku.sku} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-fg">{sku.name}</p>
                    <p className="text-[0.55rem] text-fg-subtle">{sku.sku}</p>
                  </div>
                  <span className={cn("tnum shrink-0 text-xs", STOCK_TONE[sku.status])}>
                    {sku.stock}
                    {sku.unit}
                  </span>
                  {sku.status !== "ok" && (
                    <AlertTriangle
                      size={12}
                      className={cn("shrink-0", STOCK_TONE[sku.status])}
                      aria-label={`${sku.status} stock`}
                    />
                  )}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Top customers" subtitle="By lifetime spend" icon={<Users size={14} />}>
            <ul className="space-y-2.5">
              {CUSTOMERS.map((c) => (
                <li key={c.name} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-[0.6rem] text-gold-400">
                    {c.name.split(" ").map((p) => p[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-fg">{c.name}</p>
                    <p className="text-[0.55rem] text-fg-subtle">
                      {c.tier} · {c.orders} orders
                    </p>
                  </div>
                  <span className="tnum shrink-0 text-xs text-gold-400">
                    {formatCompact(c.spent)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Notifications" subtitle={`${unread} unread`} icon={<Bell size={14} />}>
            <ul className="space-y-3">
              {NOTIFICATIONS.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "rounded-xl border p-3",
                    n.unread ? "border-gold-600/25 bg-gold-500/5" : "border-line",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-fg">{n.title}</p>
                    <span className="tnum shrink-0 text-[0.55rem] text-fg-subtle">
                      {n.minutesAgo}m
                    </span>
                  </div>
                  <p className="mt-1 text-[0.65rem] leading-relaxed text-fg-muted">{n.body}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </section>

        <p className="pb-6 text-center text-[0.62rem] text-fg-subtle">
          Demo dashboard — all figures are generated mock data.
        </p>
      </main>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  icon,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grad-border rounded-2xl bg-bg-elevated/70 p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg text-fg">
            {icon && <span className="text-gold-500">{icon}</span>}
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-[0.58rem] uppercase tracking-[0.2em] text-fg-subtle">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

interface TipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string }>;
  label?: string | number;
  currency?: boolean;
  suffix?: string;
}

function ChartTip({ active, payload, label, currency, suffix }: TipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const value = Number(entry.value ?? 0);

  return (
    <div className="glass-strong rounded-xl border border-line px-3 py-2 text-xs">
      <p className="text-fg-subtle">{label ?? entry.name}</p>
      <p className="tnum mt-0.5 text-gold-400">
        {currency ? formatPrice(value) : `${value}${suffix ?? ""}`}
      </p>
    </div>
  );
}
