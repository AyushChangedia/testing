# Noir Café

A dark-luxury café and roastery site: a 3D hero, scroll-driven storytelling, a full ordering flow, and an operations dashboard.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run typecheck
```

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion · GSAP + ScrollTrigger · Three.js via React Three Fiber + drei · Lenis · Zustand · Radix primitives · cmdk · Recharts · Lucide.

## Routes

| Route | What's there |
|---|---|
| `/` | Loader, 3D hero, story timeline, pinned horizontal rail, origin map, offers, chefs, gallery, reviews, loyalty, events |
| `/menu` | All 45 items — fuzzy search, category pills, diet filters, price range, sort, compare tray, wishlist, recently viewed |
| `/booking` | Calendar, per-slot availability, party size, occasion, validated details, animated confirmation |
| `/checkout` | Address → payment (UPI / card / COD) → confirmation, with live order summary |
| `/admin` | Revenue, orders, covers, category mix, top sellers, inventory, customers, notifications |

## Architecture

```
app/                    routes + globals.css (design tokens)
components/
  admin/                dashboard
  booking/  checkout/   multi-step forms
  cart/                 drawer + fly-to-cart
  experience/           loader, ambient background
  layout/               navbar, footer, mobile bar
  menu/                 item card, quick view, browser
  providers/            Lenis/GSAP wiring, app chrome
  sections/             homepage sections
  three/                R3F scene (cup, liquid shader, beans, steam)
  ui/                   Button, Reveal, SplitText, Counter, Tilt, Magnetic, cursor, palette
lib/
  data/                 menu (45 items), content, admin mock data
  store/                cart + UI (Zustand)
  types.ts  utils.ts
```

### Design tokens

Three layers in `app/globals.css`: primitives (`--color-noir-*`, `--color-gold-*`, `--color-espresso`…) → semantic, runtime-themeable (`--bg`, `--fg`, `--accent`, `--line`) → component. Dark is the default; `html.light` overrides the semantic layer, and a pre-paint inline script applies the stored choice so there's no flash.

Type is Bodoni Moda (display) over Jost (body), on a fluid `clamp()` scale.

## Notable implementation details

- **Lenis and GSAP share one RAF loop** (`providers/smooth-scroll.tsx`). Two independent loops make pinned sections jitter.
- **No external 3D assets.** drei's `Environment` presets stream an HDR from a third-party CDN, which throws and kills the canvas when that host is unreachable — the scene uses a local lighting rig instead.
- **`SmartImage`** falls back to a deterministic coffee-toned gradient when a remote photo fails, so a dead URL never shows a broken-image icon.
- **Numbers are formatted without `Intl`.** Node and browsers can ship different ICU versions, producing different strings for the same number and tripping hydration mismatches. `groupIndian`/`formatCompact` in `lib/utils.ts` are byte-identical everywhere.
- **Viewport margins are vertical-only** (`"-8% 0px"`). A single-value percentage margin also shrinks the observer box *horizontally*, so elements near the left or right edge never intersect and their entrance animations never fire.
- **Gradient text on animated type is painted per glyph.** `background-clip: text` on a wrapper cannot clip to text inside `inline-block` descendants; the gradient is vertical so it still tiles seamlessly across letters.
- **Performance:** `PerformanceMonitor` degrades shadows/DPR/particle count instead of dropping frames, beans are a single instanced draw call, the cursor trail and click burst are canvas, and the 3D scene, cursor, palette and loader are all `dynamic`.
- **Accessibility:** `prefers-reduced-motion` disables Lenis, the custom cursor, the click burst and every decorative loop; `SplitText` exposes the whole string to screen readers rather than a pile of letters; 44px minimum touch targets; visible focus rings; labelled inputs with errors adjacent and `role="alert"`; modals close on Escape.

## Mock data

Everything is local and deterministic — no backend. `lib/data/admin.ts` uses a seeded PRNG so server and client render identical figures. Checkout, booking, RSVP and newsletter resolve on timers; no payment is processed.

Working coupons: `NOIR20` (20% over ₹800), `FIRSTCUP` (₹150 off over ₹500), `GOLDCLUB` (12%).

Keyboard: `⌘K` / `Ctrl+K` or `/` opens the command palette, `C` opens the cart.

## Images

Menu, gallery and portrait photography is hot-linked from Unsplash's CDN. These URLs could not be verified from the sandbox this was built in (its network policy blocks `images.unsplash.com`), so if any individual photo 404s, `SmartImage` degrades to its gradient — swap the ID in `lib/data/menu.ts` or `lib/data/content.ts`. For production, download and self-host them instead of hot-linking.
