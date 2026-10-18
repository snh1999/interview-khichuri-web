import type React from "react";
import { Button } from "@/components/ui/button";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";

export const LayerControls: React.FC = () => {
  const reorderElements = useSketchBuilderStore((s) => s.reorderElements);
  const selectedElementIds = useSketchBuilderStore((s) => s.selectedElementIds);
  const handleBringToFront = () => reorderElements(selectedElementIds, "top");
  const handleBringForward = () => reorderElements(selectedElementIds, "up");
  const handleSendBackward = () => reorderElements(selectedElementIds, "down");
  const handleSendToBack = () => reorderElements(selectedElementIds, "bottom");
  return (
    <div className="space-y-1.5 border-border border-t pt-2">
      <span className="font-bold text-muted-foreground text-xxs uppercase tracking-wider">
        Layer Hierarchy
      </span>
      <div className="grid grid-cols-4 gap-1">
        <Button
          className="font-mono text-xxs"
          onClick={handleBringToFront}
          size="sm"
          title="Bring to Front"
          variant="outline"
        >
          Front
        </Button>
        <Button
          className="font-mono text-xxs"
          onClick={handleBringForward}
          size="sm"
          title="Bring Forward (Ctrl + ])"
          variant="outline"
        >
          Forward
        </Button>
        <Button
          className="font-mono text-xxs"
          onClick={handleSendBackward}
          size="sm"
          title="Send Backward (Ctrl + [)"
          variant="outline"
        >
          Backward
        </Button>
        <Button
          className="font-mono text-xxs"
          onClick={handleSendToBack}
          size="sm"
          title="Send to Back"
          variant="outline"
        >
          Back
        </Button>
      </div>
    </div>
  );
};
