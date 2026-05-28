import { CodeIcon, TerminalIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export const Background = ({
  children,
}: Readonly<{ children?: ReactNode }>) => {
  return (
    <div className="bg-background/95 relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="text-muted-foreground/30 absolute top-20 left-20 hidden lg:block">
        <TerminalIcon className="h-12 w-12" weight="thin" />
      </div>
      <div className="text-muted-foreground/30 absolute right-20 bottom-20 hidden lg:block">
        <CodeIcon className="h-16 w-16" weight="thin" />
      </div>
      <div className="text-muted-foreground/30 absolute top-1/3 right-32 hidden rotate-12 lg:block">
        <CodeIcon className="h-10 w-10" weight="thin" />
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
};
