import type React from "react";
import { Input } from "@/components/ui/input";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import type { CanvasElement, StampElement } from "../types";

interface StampEditorProps {
  activeElement: CanvasElement;
}

export const StampEditor: React.FC<StampEditorProps> = ({ activeElement }) => {
  const updateElement = useSketchBuilderStore((s) => s.updateElement);
  const recordHistory = useSketchBuilderStore((s) => s.recordHistory);
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateElement(activeElement.id, { label: e.target.value });
  const handleSublabelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateElement(activeElement.id, { sublabel: e.target.value });
  const handleFocus = () => recordHistory();
  return (
    <div className="border-border space-y-2 border-t pt-2">
      <span className="text-muted-foreground text-xxs font-bold tracking-wider uppercase">
        Component Content
      </span>
      <Input
        className="bg-background h-7 text-xs"
        onChange={handleLabelChange}
        onFocus={handleFocus}
        placeholder="Header / Title"
        type="text"
        value={(activeElement as StampElement).label || ""}
      />
      <Input
        className="bg-background h-7 text-xs"
        onChange={handleSublabelChange}
        onFocus={handleFocus}
        placeholder="Subtext / Details"
        type="text"
        value={(activeElement as StampElement).sublabel || ""}
      />
    </div>
  );
};
