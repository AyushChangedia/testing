import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { AmbientBackground } from "@/components/experience/ambient-background";
import { SectionHeader } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Noir Café order — UPI, card, or cash on delivery.",
};

export default function CheckoutPage() {
  return (
    <>
      <AmbientBackground />
      <div className="container-x pb-24 pt-36 sm:pt-44">
        <SectionHeader
          eyebrow="Checkout"
          title="Almost there."
          body="Delivery across the Fort District in about forty minutes. Everything is packed hot and sealed."
        />
        <div className="mt-14">
          <CheckoutFlow />
        </div>
      </div>
    </>
  );
}
