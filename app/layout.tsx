import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { AppChrome } from "@/components/providers/app-chrome";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bodoni",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://noir.cafe"),
  title: {
    default: "Noir Café — Every Cup Tells A Story",
    template: "%s · Noir Café",
  },
  description:
    "A dark-luxury café and roastery. Single-origin coffee, a 72-hour dough programme, and a room built for lingering.",
  keywords: ["café", "coffee", "roastery", "single origin", "fine dining", "specialty coffee"],
  openGraph: {
    title: "Noir Café — Every Cup Tells A Story",
    description: "Single-origin coffee, direct trade, and a room built for lingering.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050403" },
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
  ],
  width: "device-width",
  initialScale: 1,
  // Never block zoom — pinch-to-zoom is an accessibility requirement.
  maximumScale: 5,
};

/**
 * Applies the stored theme before first paint so there is no light-mode flash
 * on a dark-theme reload.
 */
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('noir-theme');
    if (t === 'light') document.documentElement.classList.add('light');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bodoni.variable} ${jost.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[300] focus:rounded-full focus:bg-gold-500 focus:px-6 focus:py-3 focus:text-sm focus:font-medium focus:text-noir-950"
        >
          Skip to main content
        </a>
        <SmoothScroll>
          <AppChrome>{children}</AppChrome>
        </SmoothScroll>
      </body>
    </html>
  );
}
