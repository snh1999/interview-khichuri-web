import { BrowsersIcon } from "@phosphor-icons/react";
import type React from "react";
import { Button } from "@/components/ui/button.tsx";
import { generateSafeId } from "@/lib/utils";
import type { FrameElement } from "../types";

interface CanvasEmptyStateProps {
  onAddStarterFrame: (frame: FrameElement) => void;
}

export const CanvasEmptyState: React.FC<CanvasEmptyStateProps> = ({
  onAddStarterFrame,
}) => {
  const handleAdd = () => {
    const newFrame: FrameElement = {
      id: generateSafeId("frame"),
      type: "frame",
      title: "Home",
      route: "/",
      isHome: true,
      preset: "desktop",
      x: 80,
      y: 80,
      width: 1040,
      height: 720,
      strokeColor: "#cbd5e1",
      fillColor: "#ffffff",
      strokeWidth: 1,
      opacity: 1,
      zIndex: 1,
      background: "#ffffff",
    };
    onAddStarterFrame(newFrame);
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-auto max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 text-center shadow-xl backdrop-blur-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BrowsersIcon size={24} weight="duotone" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            Canvas is Empty
          </h3>
          <p className="mt-1 text-muted-foreground text-xs">
            Add an artboard frame or select a tool above to start sketching your
            portfolio layout.
          </p>
        </div>
        <Button className="w-full rounded-xl" onClick={handleAdd} size="lg">
          Add Desktop Artboard
        </Button>
      </div>
    </div>
  );
};
