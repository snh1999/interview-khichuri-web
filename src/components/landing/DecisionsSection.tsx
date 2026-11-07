import { CaretDownIcon } from "@phosphor-icons/react";
import { DECISIONS } from "@/components/landing/landing.copy.ts";

export const DecisionsSection = () => (
  <section
    className="border-border/50 bg-muted/20 border-y py-20"
    id="decisions"
  >
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {DECISIONS.heading}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">{DECISIONS.sub}</p>
      </div>

      <div className="bg-foreground/10 ring-foreground/10 grid gap-px overflow-hidden rounded-xl ring-1">
        {DECISIONS.items.map((decision) => (
          <details className="group bg-card" key={decision.question}>
            <summary className="hover:bg-accent/40 focus-visible:outline-ring flex cursor-pointer list-none items-center justify-between gap-4 p-6 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">
              <h3 className="font-heading text-sm font-semibold">
                {decision.question}
              </h3>
              <CaretDownIcon
                aria-hidden="true"
                className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                weight="bold"
              />
            </summary>
            <p className="text-muted-foreground px-6 pb-6 text-xs leading-relaxed">
              {decision.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  </section>
);
