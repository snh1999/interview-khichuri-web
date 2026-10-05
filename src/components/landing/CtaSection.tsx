import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import { CTA } from "@/components/landing/landing.copy.ts";
import { Button } from "@/components/ui/button.tsx";

export const CtaSection = () => (
  <section className="py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col items-center px-4 text-center sm:px-6">
        <h2 className="max-w-2xl font-bold font-heading text-2xl tracking-tight sm:text-3xl">
          {CTA.heading}
        </h2>
        <p className="mt-3 max-w-lg text-muted-foreground text-sm leading-relaxed">
          {CTA.sub}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button
            nativeButton={false}
            render={
              <Link to={CTA.primary.href}>
                {CTA.primary.label}
                <ArrowRightIcon className="ml-1" weight="bold" />
              </Link>
            }
            size="lg"
          />
          <Button
            nativeButton={false}
            render={<Link to={CTA.secondary.href}>{CTA.secondary.label}</Link>}
            size="lg"
            variant="outline"
          />
        </div>
      </div>
    </div>
  </section>
);
