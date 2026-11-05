import { CAPABILITY_BAND } from "@/components/landing/landing.copy.ts";
import { ScreenshotFrame } from "@/components/landing/ScreenshotFrame.tsx";

export const CapabilityBand = () => (
  <section className="border-border/50 bg-muted/20 border-y py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {CAPABILITY_BAND.heading}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          {CAPABILITY_BAND.sub}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {CAPABILITY_BAND.items.map((item) => (
          <div className="flex flex-col" key={item.title}>
            <ScreenshotFrame screenshot={item.image} />
            <div className="mt-4 flex items-start gap-3">
              <span className="bg-primary/10 text-primary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <item.icon className="h-4 w-4" weight="duotone" />
              </span>
              <div>
                <h3 className="font-heading text-sm font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
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
