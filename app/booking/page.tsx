import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/booking-form";
import { AmbientBackground } from "@/components/experience/ambient-background";
import { SectionHeader } from "@/components/ui/primitives";
import { FAQS } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Book a Table",
  description:
    "Reserve a table at Noir Café. Two to twelve guests, seven days a week, from 7:30am until late.",
};

export default function BookingPage() {
  return (
    <>
      <AmbientBackground />
      <div className="container-x pb-24 pt-36 sm:pt-44">
        <SectionHeader
          eyebrow="Reservations"
          title="Hold a table. Stay as long as you like."
          body="Two to twelve guests. We keep the corner booths back for walk-ins until 6pm, so if you want one, book early."
        />

        <div className="mt-14">
          <BookingForm />
        </div>

        {/* FAQ */}
        <section className="mt-24">
          <h2 className="font-display text-3xl text-gradient-cream">Before you come</h2>
          <dl className="mt-8 grid gap-4 md:grid-cols-2">
            {FAQS.map((faq) => (
              <div key={faq.q} className="grad-border rounded-2xl bg-bg-elevated/60 p-6">
                <dt className="font-display text-lg text-fg">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-fg-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
