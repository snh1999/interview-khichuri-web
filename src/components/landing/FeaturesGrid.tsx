import { FEATURES } from "@/components/landing/landing.copy.ts";

export const FeaturesGrid = () => (
  <section className="border-border/50 border-y py-20" id="features">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {FEATURES.heading}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">{FEATURES.sub}</p>
      </div>

      <div className="bg-foreground/10 ring-foreground/10 grid gap-px overflow-hidden rounded-xl ring-1 md:grid-cols-3">
        {FEATURES.items.map((feature) => (
          <div
            className="bg-card hover:bg-accent/40 p-6 transition-colors"
            key={feature.title}
          >
            <span className="bg-primary/10 text-primary mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg">
              <feature.icon className="h-5 w-5" weight="duotone" />
            </span>
            <h3 className="font-heading text-sm font-semibold">
              {feature.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
