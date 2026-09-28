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
          <div className="bg-card p-6" key={decision.question}>
            <h3 className="font-heading font-semibold text-sm">
              {decision.question}
            </h3>
            <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
              {decision.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
