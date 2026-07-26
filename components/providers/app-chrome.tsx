"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUI } from "@/lib/store/ui";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileBar } from "@/components/layout/mobile-bar";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Toasts } from "@/components/ui/toasts";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FlyToCart } from "@/components/cart/fly-to-cart";
import { QuickView } from "@/components/menu/quick-view";
import { ClickBurst } from "@/components/ui/click-burst";

// Client-only, non-critical chrome — keeps it out of the initial bundle.
const Cursor = dynamic(() => import("@/components/ui/cursor").then((m) => m.Cursor), { ssr: false });
const CommandPalette = dynamic(
  () => import("@/components/ui/command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);
const Loader = dynamic(() => import("@/components/experience/loader").then((m) => m.Loader), {
  ssr: false,
});

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setTheme = useUI((s) => s.setTheme);
  const isAdmin = pathname?.startsWith("/admin");

  // Sync store with whatever the pre-paint script already applied.
  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, [setTheme]);

  if (isAdmin) {
    return (
      <>
        {children}
        <Toasts />
        <CommandPalette />
      </>
    );
  }

  return (
    <>
      {pathname === "/" && <Loader />}
      <Cursor />
      <ClickBurst />
      <ScrollProgress />
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <MobileBar />
      <CartDrawer />
      <FlyToCart />
      <QuickView />
      <Toasts />
      <CommandPalette />
    </>
  );
}
