import { ArrowRightIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import { HERO } from "@/components/landing/landing.copy.ts";
import { ScreenshotFrame } from "@/components/landing/ScreenshotFrame.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";

export const HeroSection = () => (
  <section className="relative overflow-hidden pt-16 pb-20 md:pt-24">
    <div className="absolute inset-0 bg-grid opacity-[0.03]" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--primary)/6%,transparent_60%)]" />

    <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6">
      <Badge className="mb-6" variant="outline">
        {HERO.badge}
      </Badge>

      <h1 className="max-w-4xl font-bold font-heading text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
        {HERO.headline[0]}
        <br />
        <span className="text-muted-foreground">{HERO.headline[1]}</span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-sm leading-relaxed sm:text-base">
        {HERO.sub}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          nativeButton={false}
          render={
            <Link to={HERO.ctaPrimary.href}>
              {HERO.ctaPrimary.label}
              <ArrowRightIcon className="ml-1" weight="bold" />
            </Link>
          }
          size="lg"
        />
        <Button
          nativeButton={false}
          render={
            <a href={HERO.ctaSecondary.href}>{HERO.ctaSecondary.label}</a>
          }
          size="lg"
          variant="outline"
        />
      </div>

      <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {HERO.trust.map((item) => (
          <li
            className="flex items-center gap-1.5 text-muted-foreground text-xs"
            key={item}
          >
            <CheckCircleIcon
              className="h-3.5 w-3.5 shrink-0 text-signal-success-foreground"
              weight="fill"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>

    <div className="relative mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6">
      <ScreenshotFrame
        className="rounded-2xl shadow-2xl shadow-foreground/5"
        priority
        screenshot={HERO.image}
      />
    </div>
  </section>
);
