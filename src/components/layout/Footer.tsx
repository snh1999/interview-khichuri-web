import { FacebookLogoIcon } from "@phosphor-icons/react";

export const Footer = () => (
  <footer className="hidden">
    <div className="mx-auto flex size-full max-w-7xl items-center justify-between gap-3 px-4 py-3 text-muted-foreground max-sm:flex-col sm:gap-6 sm:px-6">
      <div className="flex items-center gap-5">
        <FacebookLogoIcon />
      </div>
    </div>
  </footer>
);
