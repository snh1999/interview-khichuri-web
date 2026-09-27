import { FEATURES } from "@/components/landing/landing.copy.ts";

export const FeaturesGrid = () => (
  <section className="border-border/50 border-y py-20" id="features">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="font-bold font-heading text-2xl tracking-tight sm:text-3xl">
          {FEATURES.heading}
        </h2>
        <p className="mt-3 text-muted-foreground text-sm">{FEATURES.sub}</p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-xl bg-foreground/10 ring-1 ring-foreground/10 md:grid-cols-3">
        {FEATURES.items.map((feature) => (
          <div
            className="bg-card p-6 transition-colors hover:bg-accent/40"
            key={feature.title}
          >
            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <feature.icon className="h-5 w-5" weight="duotone" />
            </span>
            <h3 className="font-heading font-semibold text-sm">
              {feature.title}
            </h3>
            <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
