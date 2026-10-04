import { CheckCircleIcon } from "@phosphor-icons/react";
import type { IScreenshot } from "@/components/landing/ScreenshotFrame.tsx";
import { ScreenshotFrame } from "@/components/landing/ScreenshotFrame.tsx";
import { Badge } from "@/components/ui/badge.tsx";

interface IDive {
  readonly description: string;
  readonly features: readonly string[];
  readonly image: IScreenshot;
  readonly number: string;
  readonly subtitle: string;
  readonly title: string;
}

interface IDiveSectionProps {
  readonly dive: IDive;
  readonly index: number;
  readonly last?: boolean;
}

export const DiveSection = ({
  dive,
  index,
  last = false,
}: Readonly<IDiveSectionProps>) => {
  const isReversed = index % 2 === 1;

  return (
    <section
      className={`border-border/50 py-20 ${last ? "" : "border-b"}`}
      id={index === 0 ? "dives" : undefined}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={`flex flex-col items-center gap-10 lg:flex-row lg:gap-16 ${
            isReversed ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2.5">
              <Badge variant="outline">{dive.number}</Badge>
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
                {dive.subtitle}
              </p>
            </div>
            <h2 className="font-bold font-heading text-2xl tracking-tight sm:text-3xl">
              {dive.title}
            </h2>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              {dive.description}
            </p>
            <ul className="mt-6 space-y-2.5">
              {dive.features.map((feature) => (
                <li className="flex items-start gap-2.5" key={feature}>
                  <CheckCircleIcon
                    className="mt-0.5 h-4 w-4 shrink-0 text-signal-success-foreground"
                    weight="fill"
                  />
                  <span className="text-xs leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full flex-1">
            <ScreenshotFrame screenshot={dive.image} />
          </div>
        </div>
      </div>
    </section>
  );
};
