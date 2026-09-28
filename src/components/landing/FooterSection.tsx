import { BowlFoodIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import { FOOTER, SOCIAL_LINKS } from "@/components/landing/landing.copy.ts";

export const FooterSection = () => (
  <footer className="border-border/50 border-t bg-muted/20 py-14">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <Link className="flex items-center gap-2" to="/">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <BowlFoodIcon
                className="h-3.5 w-3.5 text-primary"
                weight="fill"
              />
            </span>
            <span className="font-heading font-medium text-sm tracking-tight">
              Interview Khichuri
            </span>
          </Link>
          <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
            {FOOTER.tagline}
          </p>
        </div>

        <div className="flex flex-wrap gap-10 sm:gap-16">
          {FOOTER.columns.map((column) => (
            <div key={column.heading}>
              <h3 className="font-medium text-xs">{column.heading}</h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => {
                  const content = (
                    <>
                      {"icon" in link && link.icon ? (
                        <link.icon className="h-3.5 w-3.5" weight="fill" />
                      ) : null}
                      {link.label}
                    </>
                  );

                  return (
                    <li key={link.href}>
                      {"external" in link && link.external ? (
                        <a
                          className="flex items-center gap-1.5 text-muted-foreground text-xs transition-colors hover:text-foreground"
                          href={link.href}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {content}
                        </a>
                      ) : (
                        <a
                          className="text-muted-foreground text-xs transition-colors hover:text-foreground"
                          href={link.href}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col-reverse items-center gap-4 border-border/50 border-t pt-6 sm:flex-row sm:justify-between">
        <p className="text-muted-foreground text-xs">
          Built by{" "}
          <a
            className="text-foreground underline-offset-4 hover:underline"
            href="https://github.com/snh1999"
            rel="noreferrer"
            target="_blank"
          >
            snh1999
          </a>
          . Open source, MIT licensed.
        </p>
        <ul className="flex items-center gap-4">
          {SOCIAL_LINKS.map((link) => (
            <li key={link.href}>
              <a
                aria-label={link.label}
                className="text-muted-foreground transition-colors hover:text-foreground"
                href={link.href}
                rel="noreferrer"
                target="_blank"
              >
                <link.icon className="h-4 w-4" weight="fill" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </footer>
);
