import { CAPABILITY_BAND } from "@/components/landing/landing.copy.ts";
import { ScreenshotFrame } from "@/components/landing/ScreenshotFrame.tsx";

export const CapabilityBand = () => (
  <section className="border-border/50 border-y bg-muted/20 py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="font-bold font-heading text-2xl tracking-tight sm:text-3xl">
          {CAPABILITY_BAND.heading}
        </h2>
        <p className="mt-3 text-muted-foreground text-sm">
          {CAPABILITY_BAND.sub}
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {CAPABILITY_BAND.items.map((item) => (
          <div className="flex flex-col" key={item.title}>
            <ScreenshotFrame screenshot={item.image} />
            <div className="mt-4 flex items-start gap-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-4 w-4" weight="duotone" />
              </span>
              <div>
                <h3 className="font-heading font-semibold text-sm">
                  {item.title}
                </h3>
                <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
