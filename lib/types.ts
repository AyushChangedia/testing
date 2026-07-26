export type Category =
  | "Coffee"
  | "Cold Coffee"
  | "Espresso"
  | "Desserts"
  | "Pizza"
  | "Pasta"
  | "Sandwich"
  | "Tea"
  | "Milkshakes"
  | "Mocktails"
  | "Breakfast";

export type SpiceLevel = 0 | 1 | 2 | 3;

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  category: Category;
  price: number;
  /** Pre-discount price, when the item is on offer. */
  compareAt?: number;
  description: string;
  story: string;
  image: string;
  rating: number;
  reviewCount: number;
  calories: number;
  ingredients: string[];
  allergens: string[];
  spiceLevel: SpiceLevel;
  veg: boolean;
  prepMinutes: number;
  tags: Array<"bestseller" | "new" | "chef" | "seasonal" | "limited">;
  origin?: string;
  caffeineMg?: number;
}

export interface CartLine {
  id: string;
  qty: number;
  /** Size multiplier applied to unit price. */
  size: "S" | "M" | "L";
  note?: string;
}

export interface Coupon {
  code: string;
  kind: "percent" | "flat";
  value: number;
  minSubtotal: number;
  label: string;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  body: string;
  date: string;
  verified: boolean;
}

export interface Chef {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  funFact: string;
  years: number;
  socials: { instagram?: string; x?: string; linkedin?: string };
}

export interface OriginNode {
  id: string;
  country: string;
  region: string;
  /** Equirectangular projection coordinates, 0–100 of the map box. */
  x: number;
  y: number;
  altitude: string;
  notes: string[];
  varietal: string;
  farmer: string;
  since: number;
}

export interface CafeEvent {
  id: string;
  title: string;
  kind: "Live Music" | "Workshop" | "Tasting";
  date: string;
  time: string;
  seatsLeft: number;
  totalSeats: number;
  host: string;
  image: string;
  description: string;
  price: number;
}

export interface GalleryShot {
  id: string;
  src: string;
  alt: string;
  /** Masonry row span weight. */
  span: 1 | 2;
  kind: "photo" | "video";
}
