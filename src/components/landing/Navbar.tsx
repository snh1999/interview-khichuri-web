import { BowlFoodIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import { LOGIN_PAGE, REGISTER_PAGE } from "@/app.constants.ts";
import { NAV_ITEMS } from "@/components/landing/landing.copy.ts";
import { Button } from "@/components/ui/button.tsx";

export const Navbar = () => (
  <header className="sticky top-0 z-50 flex h-14 w-full items-center border-border/50 border-b bg-background/80 backdrop-blur-md">
    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6">
      <Link className="flex items-center gap-2" to="/">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          <BowlFoodIcon className="h-4 w-4 text-primary" weight="fill" />
        </span>
        <span className="font-heading font-medium text-sm tracking-tight">
          Interview Khichuri
        </span>
      </Link>

      <nav className="hidden items-center gap-6 md:flex">
        {NAV_ITEMS.map((item) => (
          <a
            className="text-muted-foreground text-xs transition-colors hover:text-foreground"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button
          nativeButton={false}
          render={<Link to={LOGIN_PAGE} />}
          size="lg"
          variant="ghost"
        >
          Log in
        </Button>
        <Button
          nativeButton={false}
          render={<Link to={REGISTER_PAGE} />}
          size="lg"
        >
          Start prepping
        </Button>
      </div>
    </div>
  </header>
);
