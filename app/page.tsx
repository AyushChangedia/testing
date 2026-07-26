import { Hero } from "@/components/sections/hero";
import { AmbientBackground } from "@/components/experience/ambient-background";
import { Story, QuoteBreak } from "@/components/sections/story";
import { MenuShowcase } from "@/components/sections/menu-showcase";
import { Origins } from "@/components/sections/origins";
import { Chefs } from "@/components/sections/chefs";
import { Gallery } from "@/components/sections/gallery";
import { Reviews } from "@/components/sections/reviews";
import { Offers } from "@/components/sections/offers";
import { Loyalty } from "@/components/sections/loyalty";
import { Events } from "@/components/sections/events";
import { StickyOrderButton } from "@/components/ui/sticky-order";

export default function HomePage() {
  return (
    <>
      <AmbientBackground />
      <span id="top" />

      <Hero />
      <Story />
      <MenuShowcase />
      <QuoteBreak />
      <Origins />
      <Offers />
      <Chefs />
      <Gallery />
      <Reviews />
      <Loyalty />
      <Events />

      <StickyOrderButton />
    </>
  );
}
