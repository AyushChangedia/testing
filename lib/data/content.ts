import type { CafeEvent, Chef, GalleryShot, OriginNode, Review } from "@/lib/types";

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const face = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=facearea&facepad=3&w=200&h=200&q=80`;

// ------------------------------------------------------------------ Reviews
export const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Ananya Rao",
    role: "Food critic, The Wanderplate",
    avatar: face("1494790108377-be9c29b29330"),
    rating: 5,
    body: "The 48-hour barrel cold brew is the single best coffee I have had in this country. I have gone back four times to be sure it wasn't luck. It wasn't.",
    date: "2026-06-14",
    verified: true,
  },
  {
    id: "r2",
    name: "Marcus Bell",
    role: "Q-grader, Third Wave Collective",
    avatar: face("1500648767791-00dcc994a43e"),
    rating: 5,
    body: "I cup for a living and I am hard to impress. Their Obsidian double shot was dialled in perfectly at 4pm on a Saturday, which tells you everything about the bar discipline here.",
    date: "2026-05-30",
    verified: true,
  },
  {
    id: "r3",
    name: "Priya Nair",
    role: "Regular since day one",
    avatar: face("1438761681033-6461ffad8d80"),
    rating: 5,
    body: "I came for the interiors and stayed for the saffron latte. Three years later I have a corner table that the staff quietly keep free on Sunday mornings.",
    date: "2026-06-02",
    verified: true,
  },
  {
    id: "r4",
    name: "Daniel Okafor",
    role: "Architect",
    avatar: face("1507003211169-0a1dd7228f2d"),
    rating: 4,
    body: "The lighting design alone is worth the visit. Warm, layered, no glare anywhere. Whoever specified those fixtures understood restaurants.",
    date: "2026-04-18",
    verified: true,
  },
  {
    id: "r5",
    name: "Sofia Marchetti",
    role: "Pastry chef",
    avatar: face("1544005313-94ddf0286df2"),
    rating: 5,
    body: "The Basque cheesecake is properly burnt, properly molten, and properly unapologetic. Most places pull it out ten minutes early out of fear. Not here.",
    date: "2026-06-21",
    verified: true,
  },
  {
    id: "r6",
    name: "Rohan Mehta",
    role: "Founder, Ledgerline",
    avatar: face("1519085360753-af0119f7cbe7"),
    rating: 5,
    body: "I have taken every single investor meeting here for two years. The wifi is fast, the corner booths are quiet, and nobody rushes you out.",
    date: "2026-03-11",
    verified: true,
  },
  {
    id: "r7",
    name: "Leila Haddad",
    role: "Photographer",
    avatar: face("1534528741775-53994a69daeb"),
    rating: 5,
    body: "Every surface in this room photographs well, which almost never happens. The gold leaf cappuccino has paid for my Instagram engagement twice over.",
    date: "2026-05-07",
    verified: true,
  },
  {
    id: "r8",
    name: "James Whitaker",
    role: "Barista trainer",
    avatar: face("1472099645785-5658abf4ff4e"),
    rating: 4,
    body: "Watch the bar for ten minutes and you will see more technique than most cafés show in a year. The cortado is criminally underordered.",
    date: "2026-02-25",
    verified: true,
  },
];

// -------------------------------------------------------------------- Chefs
export const CHEFS: Chef[] = [
  {
    id: "ch1",
    name: "Aditi Varma",
    role: "Founder & Head Roaster",
    image: u("1583394838336-acd977736f90", 700),
    bio: "Twelve years sourcing micro-lots across Coorg, Chikmagalur and Yirgacheffe. Aditi built the roastery around a single conviction: the farmer's name belongs on the bag.",
    funFact: "Can identify a washed Ethiopian blind, in under two sips, roughly nine times out of ten.",
    years: 12,
    socials: { instagram: "#", x: "#", linkedin: "#" },
  },
  {
    id: "ch2",
    name: "Marco Bellini",
    role: "Executive Chef",
    image: u("1577219491135-ce391730fb2c", 700),
    bio: "Trained in Modena, spent six years on the pass in Milan. Marco runs the kitchen on the principle that four perfect ingredients beat twelve interesting ones.",
    funFact: "Refuses to put cream in carbonara and has walked out of restaurants over it.",
    years: 18,
    socials: { instagram: "#", x: "#" },
  },
  {
    id: "ch3",
    name: "Yuki Tanaka",
    role: "Pastry Director",
    image: u("1595152772835-219674b2a8a6", 700),
    bio: "Yuki spent four years in Kyoto and three at a two-star patisserie in Lyon. Her entremets take two days and are gone in ninety seconds.",
    funFact: "Tempers chocolate by feel, not thermometer. She is never more than half a degree out.",
    years: 9,
    socials: { instagram: "#", linkedin: "#" },
  },
  {
    id: "ch4",
    name: "Ibrahim Sesay",
    role: "Head Barista",
    image: u("1506794778202-cad84cf45f1d", 700),
    bio: "National barista finalist three years running. Ibrahim recalibrates the grinder eleven times a day because humidity does not care about your schedule.",
    funFact: "Holds the in-house record for latte art: a nine-layer rosetta, witnessed by four people.",
    years: 7,
    socials: { instagram: "#", x: "#" },
  },
];

// ------------------------------------------------------------- Coffee origins
export const ORIGINS: OriginNode[] = [
  {
    id: "o1",
    country: "Ethiopia",
    region: "Yirgacheffe",
    x: 60.5,
    y: 55.5,
    altitude: "1,900–2,200m",
    notes: ["Bergamot", "Jasmine", "Stone fruit"],
    varietal: "Heirloom",
    farmer: "Tadesse Meskela Cooperative",
    since: 2016,
  },
  {
    id: "o2",
    country: "Colombia",
    region: "Huila",
    x: 25.5,
    y: 58,
    altitude: "1,700–1,950m",
    notes: ["Red apple", "Caramel", "Cocoa"],
    varietal: "Caturra / Castillo",
    farmer: "Finca La Esperanza",
    since: 2018,
  },
  {
    id: "o3",
    country: "India",
    region: "Chikmagalur",
    x: 70.5,
    y: 57,
    altitude: "1,100–1,500m",
    notes: ["Dark chocolate", "Black pepper", "Malt"],
    varietal: "S795 / Kent",
    farmer: "Kelagur Estates",
    since: 2015,
  },
  {
    id: "o4",
    country: "Guatemala",
    region: "Antigua",
    x: 20.5,
    y: 51,
    altitude: "1,500–1,700m",
    notes: ["Toffee", "Orange peel", "Almond"],
    varietal: "Bourbon",
    farmer: "Finca El Volcán",
    since: 2019,
  },
  {
    id: "o5",
    country: "Kenya",
    region: "Kirinyaga",
    x: 62,
    y: 59.5,
    altitude: "1,700–2,000m",
    notes: ["Blackcurrant", "Grapefruit", "Cane sugar"],
    varietal: "SL28 / SL34",
    farmer: "Kiangoi Factory",
    since: 2020,
  },
  {
    id: "o6",
    country: "Indonesia",
    region: "Sumatra",
    x: 76,
    y: 61,
    altitude: "1,200–1,600m",
    notes: ["Cedar", "Tobacco", "Brown spice"],
    varietal: "Typica / Ateng",
    farmer: "Gayo Highlands Union",
    since: 2017,
  },
  {
    id: "o7",
    country: "Brazil",
    region: "Bahia",
    x: 31,
    y: 66,
    altitude: "900–1,200m",
    notes: ["Peanut", "Milk chocolate", "Vanilla"],
    varietal: "Yellow Bourbon",
    farmer: "Fazenda Rio Verde",
    since: 2021,
  },
  {
    id: "o8",
    country: "Vietnam",
    region: "Da Lat",
    x: 78.5,
    y: 55,
    altitude: "1,400–1,600m",
    notes: ["Cacao nib", "Molasses", "Cashew"],
    varietal: "Robusta / Catimor",
    farmer: "Lâm Đồng Smallholders",
    since: 2022,
  },
];

// ------------------------------------------------------------------- Events
export const EVENTS: CafeEvent[] = [
  {
    id: "ev1",
    title: "Vinyl & Velvet: Late Night Jazz",
    kind: "Live Music",
    date: "2026-08-08",
    time: "9:00 PM – 12:00 AM",
    seatsLeft: 8,
    totalSeats: 60,
    host: "The Ronin Quartet",
    image: u("1511192336575-5a79af67a629", 800),
    description:
      "Three sets of standards on original pressings, played by a quartet that has been together eleven years. Kitchen stays open until eleven.",
    price: 800,
  },
  {
    id: "ev2",
    title: "Cupping Lab: Ethiopia vs Kenya",
    kind: "Tasting",
    date: "2026-08-12",
    time: "11:00 AM – 1:00 PM",
    seatsLeft: 3,
    totalSeats: 14,
    host: "Aditi Varma",
    image: u("1442512595331-e89e73853f31", 800),
    description:
      "A blind comparative cupping across six lots. You will leave able to tell a washed Yirgacheffe from an SL28 without being told.",
    price: 1800,
  },
  {
    id: "ev3",
    title: "Latte Art Intensive",
    kind: "Workshop",
    date: "2026-08-16",
    time: "3:00 PM – 6:00 PM",
    seatsLeft: 6,
    totalSeats: 10,
    host: "Ibrahim Sesay",
    image: u("1534778101976-62847782c213", 800),
    description:
      "Milk science, jug control, and the three pours everything else is built on. You will ruin about forty cups. That is the curriculum.",
    price: 2400,
  },
  {
    id: "ev4",
    title: "Pasta From Scratch",
    kind: "Workshop",
    date: "2026-08-23",
    time: "12:00 PM – 4:00 PM",
    seatsLeft: 11,
    totalSeats: 16,
    host: "Marco Bellini",
    image: u("1556910103-1c02745aae4d", 800),
    description:
      "Egg dough, bronze extrusion, and the two sauces that prove your technique. You eat what you make, with a glass of something red.",
    price: 3200,
  },
];

// ------------------------------------------------------------------ Gallery
export const GALLERY: GalleryShot[] = [
  { id: "g1", src: u("1554118811-1e0d58224f24", 800), alt: "Guests at a marble bar under warm pendant lighting", span: 2, kind: "photo" },
  { id: "g2", src: u("1501339847302-ac426a4a7cbb", 800), alt: "Barista tamping a fresh basket of grounds", span: 1, kind: "photo" },
  { id: "g3", src: u("1445116572660-236099ec97a0", 800), alt: "Flat white beside a folded newspaper", span: 1, kind: "photo" },
  { id: "g4", src: u("1559925393-8be0ec4767c8", 800), alt: "Espresso machine group head mid-extraction", span: 2, kind: "video" },
  { id: "g5", src: u("1521017432531-fbd92d768814", 800), alt: "Corner banquette with velvet upholstery", span: 1, kind: "photo" },
  { id: "g6", src: u("1453614512568-c4024d13c247", 800), alt: "Green coffee cherries drying on raised beds", span: 1, kind: "photo" },
  { id: "g7", src: u("1509440159596-0249088772ff", 800), alt: "Pastry counter at golden hour", span: 2, kind: "photo" },
  { id: "g8", src: u("1470337458703-46ad1756a187", 800), alt: "Overhead pour into a ceramic cup", span: 1, kind: "photo" },
  { id: "g9", src: u("1493857671505-72967e2e2760", 800), alt: "Dining room seen from the mezzanine", span: 1, kind: "photo" },
  { id: "g10", src: u("1447933601403-0c6688de566e", 800), alt: "Latte art rosetta from directly above", span: 1, kind: "photo" },
  { id: "g11", src: u("1442975631115-c4f7b05b8a2c", 800), alt: "Roaster drum releasing a batch", span: 2, kind: "video" },
  { id: "g12", src: u("1498804103079-a6351b050096", 800), alt: "Single origin bags on a timber shelf", span: 1, kind: "photo" },
];

// ------------------------------------------------------------------ Timeline
export const TIMELINE = [
  {
    year: "2014",
    title: "A single machine in a garage",
    body: "Aditi bought a second-hand La Marzocco with her savings and started roasting eight kilos a week for friends who kept asking.",
  },
  {
    year: "2017",
    title: "The first room",
    body: "Fourteen seats, one grinder, no menu boards. We wrote the day's offering on brown paper and taped it to the wall.",
  },
  {
    year: "2019",
    title: "Direct trade, properly",
    body: "First contract signed directly with Kelagur Estates. We stopped buying through brokers entirely and never went back.",
  },
  {
    year: "2022",
    title: "The kitchen arrives",
    body: "Marco joined and turned a coffee bar into a restaurant. The 72-hour dough programme started that November.",
  },
  {
    year: "2024",
    title: "Noir, as it stands",
    body: "Ninety covers, an eleven-barrel ageing programme, and a roastery that supplies thirty other cafés in the city.",
  },
  {
    year: "2026",
    title: "What's next",
    body: "A second room opening in the spring, built around a fermentation lab and an open cupping table for anyone who walks in.",
  },
];

export const STATS = [
  { value: 1200000, suffix: "+", label: "Cups poured" },
  { value: 38, suffix: "", label: "Partner farms" },
  { value: 11, suffix: "", label: "Ageing barrels" },
  { value: 4.9, suffix: "/5", label: "Average rating", decimal: true },
];

export const LOYALTY_TIERS = [
  {
    name: "Bean",
    threshold: 0,
    perks: ["1 point per ₹10 spent", "Birthday pastry", "Early access to seasonal menus"],
    color: "#6f4e37",
  },
  {
    name: "Roast",
    threshold: 500,
    perks: ["1.5× points", "Free size upgrade, always", "Priority table booking"],
    color: "#a9744f",
  },
  {
    name: "Gold Leaf",
    threshold: 1500,
    perks: ["2× points", "Complimentary cupping session", "Reserved corner booth", "Bring a guest free once a month"],
    color: "#d4af37",
  },
];

export const FAQS = [
  {
    q: "Do you take reservations for small groups?",
    a: "Yes, for two to six guests through the booking form. Anything larger, email us and we will hold a section for you.",
  },
  {
    q: "Is there parking?",
    a: "Valet from 6pm daily. Before that, the lot behind the building is free for two hours with a validated bill.",
  },
  {
    q: "Can I buy the beans you serve?",
    a: "Every single-origin on the bar is available in 250g bags at the counter, roasted within the previous nine days.",
  },
  {
    q: "Do you cater to allergies?",
    a: "Every item lists its allergens. Tell your server and the kitchen will adjust wherever the dish allows it.",
  },
];
