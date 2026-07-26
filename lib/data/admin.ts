import { MENU } from "./menu";

/** Deterministic PRNG so the dashboard renders identically on server and client. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const rand = rng(20260725);

const FIRST = ["Aarav", "Diya", "Kabir", "Meera", "Rohan", "Sara", "Ishaan", "Nisha", "Vikram", "Tara", "Arjun", "Leela"];
const LAST = ["Sharma", "Patel", "Nair", "Iyer", "Kapoor", "Bose", "Menon", "Reddy", "Chopra", "Rao"];
const STATUS = ["Delivered", "Preparing", "Out for delivery", "Cancelled"] as const;

export interface AdminOrder {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: (typeof STATUS)[number];
  channel: "Delivery" | "Dine-in" | "Takeaway";
  minutesAgo: number;
  itemName: string;
}

export const ORDERS: AdminOrder[] = Array.from({ length: 24 }, (_, i) => {
  const item = MENU[Math.floor(rand() * MENU.length)];
  const items = 1 + Math.floor(rand() * 4);
  // Weight toward Delivered so the board looks like a healthy service.
  const roll = rand();
  const status =
    roll > 0.82 ? STATUS[1] : roll > 0.7 ? STATUS[2] : roll > 0.96 ? STATUS[3] : STATUS[0];

  return {
    id: `NC${(4820914 - i * 137).toString().slice(-7)}`,
    customer: `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`,
    items,
    total: Math.round(item.price * items * (1 + rand() * 0.35)),
    status,
    channel: rand() > 0.55 ? "Delivery" : rand() > 0.4 ? "Dine-in" : "Takeaway",
    minutesAgo: Math.round(2 + i * 7 + rand() * 12),
    itemName: item.name,
  };
});

export const REVENUE_SERIES = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  const weekend = [0, 6].includes(date.getDay());
  const base = weekend ? 138000 : 96000;
  return {
    date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    revenue: Math.round(base + rand() * 42000),
    orders: Math.round((weekend ? 210 : 150) + rand() * 70),
  };
});

export const HOURLY = [
  { hour: "07", covers: 12 },
  { hour: "08", covers: 48 },
  { hour: "09", covers: 76 },
  { hour: "10", covers: 61 },
  { hour: "11", covers: 44 },
  { hour: "12", covers: 88 },
  { hour: "13", covers: 104 },
  { hour: "14", covers: 72 },
  { hour: "15", covers: 51 },
  { hour: "16", covers: 63 },
  { hour: "17", covers: 79 },
  { hour: "18", covers: 96 },
  { hour: "19", covers: 118 },
  { hour: "20", covers: 132 },
  { hour: "21", covers: 97 },
  { hour: "22", covers: 54 },
];

export const CATEGORY_SPLIT = [
  { name: "Coffee", value: 34, fill: "#d4af37" },
  { name: "Food", value: 27, fill: "#a9744f" },
  { name: "Desserts", value: 18, fill: "#6f4e37" },
  { name: "Cold Coffee", value: 13, fill: "#e3c77b" },
  { name: "Tea & Other", value: 8, fill: "#432f23" },
];

export const TOP_ITEMS = MENU.filter((m) => m.tags.includes("bestseller"))
  .slice(0, 6)
  .map((m, i) => ({
    name: m.name,
    sold: 340 - i * 38 + Math.round(rand() * 25),
    revenue: (340 - i * 38) * m.price,
    image: m.image,
    slug: m.slug,
  }));

export const INVENTORY = [
  { sku: "BN-ETH-YRG", name: "Yirgacheffe green", stock: 42, unit: "kg", reorder: 30, status: "ok" },
  { sku: "BN-COL-HUI", name: "Huila washed", stock: 18, unit: "kg", reorder: 25, status: "low" },
  { sku: "BN-IND-CHK", name: "Chikmagalur estate", stock: 64, unit: "kg", reorder: 30, status: "ok" },
  { sku: "DY-MLK-FUL", name: "Whole milk", stock: 96, unit: "L", reorder: 60, status: "ok" },
  { sku: "DY-MLK-OAT", name: "Oat milk", stock: 22, unit: "L", reorder: 40, status: "low" },
  { sku: "PT-FLR-00", name: "Tipo 00 flour", stock: 8, unit: "kg", reorder: 25, status: "critical" },
  { sku: "CH-VAL-70", name: "Valrhona 70%", stock: 11, unit: "kg", reorder: 10, status: "ok" },
  { sku: "SP-CRD-GRN", name: "Green cardamom", stock: 2.4, unit: "kg", reorder: 3, status: "low" },
] as const;

export const CUSTOMERS = Array.from({ length: 8 }, (_, i) => ({
  name: `${FIRST[i]} ${LAST[i]}`,
  orders: 84 - i * 9,
  spent: Math.round((84 - i * 9) * (380 + rand() * 260)),
  tier: i < 2 ? "Gold Leaf" : i < 5 ? "Roast" : "Bean",
  lastSeen: `${1 + i * 2}d ago`,
}));

export const NOTIFICATIONS = [
  { id: 1, kind: "stock" as const, title: "Tipo 00 flour below reorder point", body: "8kg left, reorder at 25kg. The dough programme needs 14kg a day.", minutesAgo: 12, unread: true },
  { id: 2, kind: "order" as const, title: "Large order placed", body: "NC4820914 — ₹8,240 across 14 items, delivery to Fort District.", minutesAgo: 34, unread: true },
  { id: 3, kind: "review" as const, title: "New 5-star review", body: "“The 48-hour barrel cold brew is the best coffee I've had in this country.”", minutesAgo: 96, unread: true },
  { id: 4, kind: "staff" as const, title: "Ibrahim recalibrated grinder 2", body: "Humidity up 9% since morning. Dose adjusted +0.4g.", minutesAgo: 148, unread: false },
  { id: 5, kind: "booking" as const, title: "Cupping Lab nearly full", body: "3 of 14 seats left for 12 August.", minutesAgo: 210, unread: false },
];

const todayRevenue = REVENUE_SERIES[REVENUE_SERIES.length - 1].revenue;
const yesterdayRevenue = REVENUE_SERIES[REVENUE_SERIES.length - 2].revenue;

export const KPIS = [
  {
    label: "Today's revenue",
    value: todayRevenue,
    format: "currency" as const,
    delta: ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100,
    sub: "vs yesterday",
  },
  {
    label: "Orders today",
    value: REVENUE_SERIES[REVENUE_SERIES.length - 1].orders,
    format: "number" as const,
    delta: 12.4,
    sub: "vs yesterday",
  },
  {
    label: "Average order",
    value: Math.round(todayRevenue / REVENUE_SERIES[REVENUE_SERIES.length - 1].orders),
    format: "currency" as const,
    delta: -2.8,
    sub: "vs yesterday",
  },
  {
    label: "Covers seated",
    value: HOURLY.reduce((n, h) => n + h.covers, 0),
    format: "number" as const,
    delta: 6.1,
    sub: "vs yesterday",
  },
];
