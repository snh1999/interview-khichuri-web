import type React from "react";
import { Input } from "@/components/ui/input";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import type { CanvasElement, StampElement } from "../types";

interface StampEditorProps {
  activeElement: CanvasElement;
}

export const StampEditor: React.FC<StampEditorProps> = ({ activeElement }) => {
  const updateElement = useSketchBuilderStore((s) => s.updateElement);
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateElement(activeElement.id, { label: e.target.value });
  const handleSublabelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateElement(activeElement.id, { sublabel: e.target.value });
  return (
    <div className="space-y-2 border-border border-t pt-2">
      <span className="font-bold text-muted-foreground text-xxs uppercase tracking-wider">
        Component Content
      </span>
      <Input
        className="h-7 bg-background text-xs"
        onChange={handleLabelChange}
        placeholder="Header / Title"
        type="text"
        value={(activeElement as StampElement).label || ""}
      />
      <Input
        className="h-7 bg-background text-xs"
        onChange={handleSublabelChange}
        placeholder="Subtext / Details"
        type="text"
        value={(activeElement as StampElement).sublabel || ""}
      />
    </div>
  );
};
