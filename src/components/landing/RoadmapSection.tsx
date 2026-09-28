import { ROADMAP } from "@/components/landing/landing.copy.ts";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

export const RoadmapSection = () => (
  <section className="py-20" id="roadmap">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="font-bold font-heading text-2xl tracking-tight sm:text-3xl">
          {ROADMAP.heading}
        </h2>
        <p className="mt-3 text-muted-foreground text-sm">{ROADMAP.sub}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ROADMAP.items.map((item) => (
          <Card className="h-full" key={item.title} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <item.icon
                  className="h-4 w-4 text-muted-foreground"
                  weight="duotone"
                />
                {item.title}
              </CardTitle>
              <CardAction>
                <Badge
                  variant={
                    item.label === "Next"
                      ? "default"
                      : // biome-ignore lint/style/noNestedTernary: <>
                        item.label === "Alpha"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {item.label}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <CardDescription className="leading-relaxed">
                {item.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
