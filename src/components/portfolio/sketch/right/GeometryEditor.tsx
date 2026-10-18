import type React from "react";
import { Input } from "@/components/ui/input.tsx";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import type { CanvasElement, ElementChanges } from "../types";
import { getElementsWithContainedChildren } from "../utils/containment";

interface GeometryEditorProps {
  activeElement: CanvasElement;
  isMulti: boolean;
  selectedElements: CanvasElement[];
  updateSelected: (
    changes: ElementChanges,
    shouldRecordHistory?: boolean
  ) => void;
}

export const GeometryEditor: React.FC<GeometryEditorProps> = ({
  activeElement,
  isMulti,
  selectedElements,
  updateSelected,
}) => {
  const recordHistory = useSketchBuilderStore((s) => s.recordHistory);
  const updateElements = useSketchBuilderStore((s) => s.updateElements);
  const { elements } = useCurrentPortfolio();

  // Translate the given elements (frames bring their contained children) along
  // one axis, mirroring a canvas drag so the artboard never moves without its
  // contents. Lines/pens keep their endpoints in step via the store's
  // `withConsistentGeometry`.
  const translate = (ids: string[], dx: number, dy: number) => {
    if (dx === 0 && dy === 0) {
      return;
    }
    recordHistory();
    updateElements(
      getElementsWithContainedChildren(elements, ids).map((el) => ({
        id: el.id,
        changes: dx === 0 ? { y: el.y + dy } : { x: el.x + dx },
      }))
    );
  };

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (isMulti) {
      translate(
        selectedElements.map((el) => el.id),
        val - activeElement.x,
        0
      );
    } else if (activeElement.type === "frame") {
      translate([activeElement.id], val - activeElement.x, 0);
    } else {
      updateSelected({ x: val });
    }
  };
  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (isMulti) {
      translate(
        selectedElements.map((el) => el.id),
        0,
        val - activeElement.y
      );
    } else if (activeElement.type === "frame") {
      translate([activeElement.id], 0, val - activeElement.y);
    } else {
      updateSelected({ y: val });
    }
  };
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(10, Number(e.target.value));
    updateSelected({ width: val });
  };
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(10, Number(e.target.value));
    updateSelected({ height: val });
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-muted-foreground text-xxs uppercase tracking-wider">
          Geometry (px)
        </span>
        {!!isMulti && (
          <span className="font-medium text-[9px] text-amber-500">
            Batch editing {selectedElements.length} items
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
          <span className="font-mono text-muted-foreground text-xxs">X</span>
          <Input
            className="h-auto w-full border-0 bg-transparent px-0 font-mono text-xs focus-visible:ring-0"
            onChange={handleXChange}
            type="number"
            value={Math.round(activeElement.x)}
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
          <span className="font-mono text-muted-foreground text-xxs">Y</span>
          <Input
            className="h-auto w-full border-0 bg-transparent px-0 font-mono text-xs focus-visible:ring-0"
            onChange={handleYChange}
            type="number"
            value={Math.round(activeElement.y)}
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
          <span className="font-mono text-muted-foreground text-xxs">W</span>
          <Input
            className="h-auto w-full border-0 bg-transparent px-0 font-mono text-xs focus-visible:ring-0"
            onChange={handleWidthChange}
            type="number"
            value={Math.round(activeElement.width)}
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
          <span className="font-mono text-muted-foreground text-xxs">H</span>
          <Input
            className="h-auto w-full border-0 bg-transparent px-0 font-mono text-xs focus-visible:ring-0"
            onChange={handleHeightChange}
            type="number"
            value={Math.round(activeElement.height)}
          />
        </div>
      </div>
    </div>
  );
};
