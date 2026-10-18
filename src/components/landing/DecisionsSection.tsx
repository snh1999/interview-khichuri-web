import { CaretDownIcon } from "@phosphor-icons/react";
import { DECISIONS } from "@/components/landing/landing.copy.ts";

export const DecisionsSection = () => (
  <section
    className="border-border/50 border-y bg-muted/20 py-20"
    id="decisions"
  >
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="font-bold font-heading text-2xl tracking-tight sm:text-3xl">
          {DECISIONS.heading}
        </h2>
        <p className="mt-3 text-muted-foreground text-sm">{DECISIONS.sub}</p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-xl bg-foreground/10 ring-1 ring-foreground/10">
        {DECISIONS.items.map((decision) => (
          <details className="group bg-card" key={decision.question}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 transition-colors hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">
              <h3 className="font-heading font-semibold text-sm">
                {decision.question}
              </h3>
              <CaretDownIcon
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                weight="bold"
              />
            </summary>
            <p className="px-6 pb-6 text-muted-foreground text-xs leading-relaxed">
              {decision.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  </section>
);
