import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { AmbientBackground } from "@/components/experience/ambient-background";
import { SectionHeader } from "@/components/ui/primitives";
import { MENU } from "@/lib/data/menu";

export const metadata: Metadata = {
  title: "The Menu",
  description:
    "Forty-five items across coffee, tea, breakfast, pizza, pasta and dessert. Single-origin espresso, a 72-hour dough programme, and a pastry counter that changes weekly.",
};

export default function MenuPage() {
  return (
    <>
      <AmbientBackground />
      <div className="pt-36 sm:pt-44">
        <div className="container-x">
          <SectionHeader
            eyebrow="The Full List"
            title="Every one of these was argued over."
            body={`All ${MENU.length} items list their calories, allergens and origin. Filter by diet, sort by whatever matters to you, and press ⌘K to search from anywhere.`}
          />
        </div>
        <div className="mt-12">
          <MenuBrowser />
        </div>
      </div>
    </>
  );
}
