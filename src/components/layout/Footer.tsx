import { FacebookLogoIcon } from "@phosphor-icons/react";
import { Link } from "react-router";

export const Footer = () => (
  <footer>
    <div className="mx-auto flex size-full max-w-7xl items-center justify-between gap-3 px-4 py-3 text-muted-foreground max-sm:flex-col sm:gap-6 sm:px-6">
      <p className="text-balance text-sm max-sm:text-center">
        {`©${new Date().getFullYear()}`}{" "}
        <Link className="text-primary" to="#">
          shadcn/studio
        </Link>
        , Made for better web design
      </p>
      <div className="flex items-center gap-5">
        <FacebookLogoIcon />
      </div>
    </div>
  </footer>
);
