import { DesktopIcon, PlusIcon } from "@phosphor-icons/react";
import type React from "react";
import { Button } from "@/components/ui/button";

interface AiModalEmptyStateProps {
  onCreateFrame: () => void;
}

export const AiModalEmptyState: React.FC<AiModalEmptyStateProps> = ({
  onCreateFrame,
}) => (
  <div className="mx-auto max-w-md space-y-4 px-4 py-12 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
      <DesktopIcon size={24} />
    </div>
    <div className="space-y-1">
      <h3 className="font-bold text-foreground text-sm">
        No Artboards on Canvas
      </h3>
      <p className="text-muted-foreground text-xs leading-relaxed">
        Sketch a wireframe first so AI can detect sections and dimensions — or
        generate the whole site from your prompt.
      </p>
    </div>
    <Button onClick={onCreateFrame}>
      <PlusIcon size={14} weight="bold" />
      <span>Create Desktop Frame (1040x720)</span>
    </Button>
  </div>
);
