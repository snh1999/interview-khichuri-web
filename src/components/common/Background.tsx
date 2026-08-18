import { CodeIcon, TerminalIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

export const Background = ({
  children,
}: Readonly<{ children?: ReactNode }>) => (
  <div className="relative flex h-dvh overflow-hidden bg-background/95">
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />

    <div className="absolute top-20 left-20 hidden text-muted-foreground/30 lg:block">
      <TerminalIcon className="h-12 w-12" weight="thin" />
    </div>
    <div className="absolute right-20 bottom-20 hidden text-muted-foreground/30 lg:block">
      <CodeIcon className="h-16 w-16" weight="thin" />
    </div>
    <div className="absolute top-1/3 right-32 hidden rotate-12 text-muted-foreground/30 lg:block">
      <CodeIcon className="h-10 w-10" weight="thin" />
    </div>

    <ScrollArea className="relative z-10 flex w-full items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md">{children}</div>
    </ScrollArea>
  </div>
);
