import { SparkleIcon } from "@phosphor-icons/react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import type { CanvasElement, FrameElement } from "../types";

interface FrameControlsProps {
  activeElement: CanvasElement;
}

export const FrameControls: React.FC<FrameControlsProps> = ({
  activeElement,
}) => {
  const updateElement = useSketchBuilderStore((s) => s.updateElement);
  const recordHistory = useSketchBuilderStore((s) => s.recordHistory);
  const setActiveFrameForAi = useSketchBuilderStore(
    (s) => s.setActiveFrameForAi
  );
  const openAiModal = useSketchBuilderStore((s) => s.openAiModal);
  const handleRouteChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateElement(activeElement.id, { route: e.target.value });
  const handleGenerateDesign = () => {
    if (activeElement) {
      setActiveFrameForAi(activeElement.id);
      openAiModal(activeElement.id, "append");
    }
  };
  return (
    <div className="space-y-3 border-border border-t pt-2">
      <div className="font-bold text-muted-foreground text-xxs uppercase tracking-wider">
        Artboard Properties
      </div>

      <div className="space-y-1">
        <span className="text-muted-foreground text-xs">Page Route</span>
        <Input
          className="h-7 bg-background font-mono text-xs"
          onChange={handleRouteChange}
          onFocus={recordHistory}
          type="text"
          value={(activeElement as FrameElement).route || "/"}
        />
      </div>

      <Button
        className="mt-2 w-full font-bold shadow-md"
        onClick={handleGenerateDesign}
        size="sm"
      >
        <SparkleIcon size={14} weight="fill" />
        <span>Add This Page</span>
      </Button>
    </div>
  );
};
