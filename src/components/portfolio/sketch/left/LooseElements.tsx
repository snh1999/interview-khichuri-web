import {
  EyeIcon,
  EyeSlashIcon,
  LockSimpleIcon,
  LockSimpleOpenIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type React from "react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import type { CanvasElement, FrameElement } from "../types";
import { isElementContainedInFrame } from "../utils/containment";
import { getCenteredViewport } from "../utils/viewport";
import { getElementIcon } from "./elementIcon";

export const LooseElements: React.FC = () => {
  const selectedElementIds = useSketchBuilderStore((s) => s.selectedElementIds);
  const selectElements = useSketchBuilderStore((s) => s.selectElements);
  const toggleElementSelection = useSketchBuilderStore(
    (s) => s.toggleElementSelection
  );
  const updateElement = useSketchBuilderStore((s) => s.updateElement);
  const deleteElement = useSketchBuilderStore((s) => s.deleteElement);
  const setViewport = useSketchBuilderStore((s) => s.setViewport);
  const currentPortfolio = useCurrentPortfolio();
  const { elements } = currentPortfolio;

  const selectedSet = useMemo(
    () => new Set(selectedElementIds),
    [selectedElementIds]
  );

  const handleCenterOnElement = (el: CanvasElement) => {
    setViewport(getCenteredViewport(el, currentPortfolio.viewport));
    toast.info(`Focused on ${el.name || el.type}`);
  };

  const frameElements = useMemo(
    () => elements.filter((el) => el.type === "frame") as FrameElement[],
    [elements]
  );

  const looseElements = useMemo(
    () =>
      elements.filter(
        (el) =>
          el.type !== "frame" &&
          !frameElements.some((f) => isElementContainedInFrame(el, f))
      ),
    [elements, frameElements]
  );

  if (looseElements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 border-border/60 border-t pt-2">
      <div className="px-1 font-bold text-muted-foreground text-xxs uppercase tracking-wider">
        Loose Canvas Elements ({looseElements.length})
      </div>
      <div className="space-y-1">
        {looseElements.map((el) => {
          const isSelected = selectedSet.has(el.id);
          return (
            // biome-ignore lint/a11y/useSemanticElements: container embeds nested interactive controls; a native button cannot wrap them
            <div
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-1.5 transition-all focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring ${
                isSelected
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
              }`}
              key={el.id}
              // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
              onClick={(e) => {
                e.stopPropagation();
                if (e.shiftKey) {
                  toggleElementSelection(el.id);
                } else {
                  selectElements([el.id]);
                }
              }}
              // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
              onDoubleClick={() => handleCenterOnElement(el)}
              // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  selectElements([el.id]);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex min-w-0 items-center gap-1.5">
                {getElementIcon(el)}
                <span
                  className={`truncate ${el.visible === false ? "line-through opacity-50" : ""}`}
                >
                  {el.name || el.type}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  className="text-muted-foreground hover:text-foreground"
                  // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                  onClick={(e) => {
                    e.stopPropagation();
                    updateElement(
                      el.id,
                      {
                        visible: el.visible === false,
                      },
                      true
                    );
                  }}
                  size="icon-xs"
                  title="Toggle Visibility"
                  variant="ghost"
                >
                  {el.visible === false ? <EyeSlashIcon /> : <EyeIcon />}
                </Button>
                <Button
                  className="text-muted-foreground hover:text-foreground"
                  // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                  onClick={(e) => {
                    e.stopPropagation();
                    updateElement(el.id, { locked: !el.locked }, true);
                  }}
                  size="icon-xs"
                  title="Toggle Lock"
                  variant="ghost"
                >
                  {el.locked ? (
                    <LockSimpleIcon className="text-amber-500" weight="bold" />
                  ) : (
                    <LockSimpleOpenIcon />
                  )}
                </Button>
                <Button
                  className="text-muted-foreground hover:text-destructive"
                  // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(el.id);
                  }}
                  size="icon-xs"
                  title="Delete Element"
                  variant="ghost"
                >
                  <TrashIcon />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
