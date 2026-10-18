import {
  ArrowDownIcon,
  ArrowUpIcon,
  DesktopIcon,
  DeviceMobileIcon,
  EyeIcon,
  EyeSlashIcon,
  LockSimpleIcon,
  LockSimpleOpenIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type React from "react";
import { useMemo } from "react";
import { toast } from "sonner";
import { ActionButton } from "@/components/ui/button/ActionButton";
import { Button } from "@/components/ui/button.tsx";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import type { CanvasElement, FrameElement } from "../types";
import { isElementContainedInFrame } from "../utils/containment";
import { getCenteredViewport } from "../utils/viewport";
import { getElementIcon } from "./elementIcon";

const childInheritsLock = (frame: FrameElement, child: CanvasElement) =>
  Boolean(child.locked) || Boolean(frame.locked);

const childInheritsVisibility = (frame: FrameElement, child: CanvasElement) =>
  child.visible !== false && frame.visible !== false;

export const FrameTree: React.FC = () => {
  const selectedElementIds = useSketchBuilderStore((s) => s.selectedElementIds);
  const selectElements = useSketchBuilderStore((s) => s.selectElements);
  const toggleElementSelection = useSketchBuilderStore(
    (s) => s.toggleElementSelection
  );
  const updateElement = useSketchBuilderStore((s) => s.updateElement);
  const deleteElement = useSketchBuilderStore((s) => s.deleteElement);
  const reorderElement = useSketchBuilderStore((s) => s.reorderElement);
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
  const handleStopPropagation = (e: React.MouseEvent) => e.stopPropagation();
  const frameElements = useMemo(
    () => elements.filter((el) => el.type === "frame") as FrameElement[],
    [elements]
  );

  const frameChildrenMap = useMemo(() => {
    const map = new Map<string, CanvasElement[]>();
    for (const f of frameElements) {
      map.set(
        f.id,
        elements.filter(
          (el) => el.id !== f.id && isElementContainedInFrame(el, f)
        )
      );
    }
    return map;
  }, [elements, frameElements]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="font-bold text-muted-foreground text-xxs uppercase tracking-wider">
          Artboard Frames ({frameElements.length})
        </span>
      </div>

      <div className="space-y-1.5">
        {frameElements.map((frame) => {
          const isSelected = selectedSet.has(frame.id);
          // Layer panels list front-most first, so "Bring Forward" moves a row
          // up the list. The store array is back-to-front, hence the reverse.
          const frameChildren = [
            ...(frameChildrenMap.get(frame.id) || []),
          ].reverse();

          return (
            <div
              className={`rounded-xl border p-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border/70 bg-muted/20 hover:border-border"
              }`}
              key={frame.id}
            >
              <div className="flex items-center justify-between gap-1">
                {/** biome-ignore lint/a11y/useSemanticElements: container embeds nested interactive controls; a native button cannot wrap them */}
                <div
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-md py-0.5 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                  onClick={(e) => {
                    if (e.shiftKey) {
                      toggleElementSelection(frame.id);
                    } else {
                      selectElements([frame.id]);
                    }
                  }}
                  // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                  onDoubleClick={() => handleCenterOnElement(frame)}
                  // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectElements([frame.id]);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {frame.preset === "mobile" ? (
                    <DeviceMobileIcon
                      className="shrink-0 text-primary"
                      size={14}
                    />
                  ) : (
                    <DesktopIcon className="shrink-0 text-primary" size={14} />
                  )}
                  <span className="truncate font-semibold text-foreground">
                    {frame.title || "Untitled Frame"}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-muted-foreground text-xxs">
                    {frame.route || "/"}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    aria-label="Toggle Visibility"
                    className={`cursor-pointer ${
                      frame.visible === false
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElement(
                        frame.id,
                        {
                          visible: frame.visible === false,
                        },
                        true
                      );
                    }}
                    title="Toggle Visibility"
                    variant="ghost"
                  >
                    {frame.visible === false ? (
                      <EyeSlashIcon size={13} />
                    ) : (
                      <EyeIcon size={13} />
                    )}
                  </Button>
                  <Button
                    aria-label="Toggle Lock"
                    className={`cursor-pointer ${
                      frame.locked
                        ? "font-bold text-amber-500"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElement(frame.id, { locked: !frame.locked }, true);
                    }}
                    title="Toggle Lock"
                    type="button"
                    variant="ghost"
                  >
                    {frame.locked ? (
                      <LockSimpleIcon size={13} weight="bold" />
                    ) : (
                      <LockSimpleOpenIcon size={13} />
                    )}
                  </Button>
                  <ActionButton
                    // biome-ignore lint/performance/noJsxPropsBind: inline action closes over the mapped frame
                    action={() => {
                      deleteElement(frame.id);
                      toast.success(
                        `Deleted page "${frame.title}" and its components`
                      );
                      return Promise.resolve({ error: false });
                    }}
                    aria-label="Delete Frame"
                    dialogDescription={`This will permanently delete "${frame.title}" and all elements inside it. This action cannot be undone.`}
                    dialogTitle="Delete Page Frame"
                    onClick={handleStopPropagation}
                    requireConfirmation
                    size="icon"
                    title="Delete Frame"
                    variant="destructive"
                  >
                    <TrashIcon />
                  </ActionButton>
                </div>
              </div>

              {frameChildren.length > 0 && (
                <div className="mt-2 space-y-1 border-border/80 border-l-2 pl-2.5">
                  {frameChildren.map((child) => {
                    const isChildSelected = selectedSet.has(child.id);
                    const childLocked = childInheritsLock(frame, child);
                    const childVisible = childInheritsVisibility(frame, child);
                    return (
                      // biome-ignore lint/a11y/useSemanticElements: container embeds nested interactive controls; a native button cannot wrap them
                      <div
                        className={`group flex cursor-pointer items-center justify-between rounded-md p-1 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring ${
                          isChildSelected
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        }`}
                        key={child.id}
                        // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                        onClick={(e) => {
                          e.stopPropagation();
                          if (e.shiftKey) {
                            toggleElementSelection(child.id);
                          } else {
                            selectElements([child.id]);
                          }
                        }}
                        // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                        onDoubleClick={() => handleCenterOnElement(child)}
                        // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            selectElements([child.id]);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          {getElementIcon(child)}
                          <span
                            className={`truncate ${childVisible ? "" : "line-through opacity-50"}`}
                          >
                            {child.name || child.type}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5">
                          <Button
                            className={
                              childVisible
                                ? "text-muted-foreground hover:text-foreground"
                                : "text-muted-foreground/40"
                            }
                            // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                            onClick={(e) => {
                              e.stopPropagation();
                              updateElement(
                                child.id,
                                {
                                  visible: child.visible === false,
                                },
                                true
                              );
                            }}
                            size="icon-xs"
                            title="Toggle Visibility"
                            variant="ghost"
                          >
                            {childVisible ? <EyeIcon /> : <EyeSlashIcon />}
                          </Button>
                          <Button
                            className={
                              childLocked
                                ? "font-bold text-amber-500"
                                : "text-muted-foreground hover:text-foreground"
                            }
                            // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                            onClick={(e) => {
                              e.stopPropagation();
                              updateElement(
                                child.id,
                                { locked: !child.locked },
                                true
                              );
                            }}
                            size="icon-xs"
                            title="Toggle Lock"
                            variant="ghost"
                          >
                            {childLocked ? (
                              <LockSimpleIcon weight="bold" />
                            ) : (
                              <LockSimpleOpenIcon />
                            )}
                          </Button>
                          <Button
                            className="text-muted-foreground hover:text-foreground"
                            // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                            onClick={(e) => {
                              e.stopPropagation();
                              reorderElement(child.id, "up");
                            }}
                            size="icon-xs"
                            title="Bring Forward"
                            variant="ghost"
                          >
                            <ArrowUpIcon />
                          </Button>
                          <Button
                            className="text-muted-foreground hover:text-foreground"
                            // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                            onClick={(e) => {
                              e.stopPropagation();
                              reorderElement(child.id, "down");
                            }}
                            size="icon-xs"
                            title="Send Backward"
                            variant="ghost"
                          >
                            <ArrowDownIcon />
                          </Button>
                          <Button
                            className="text-muted-foreground hover:text-destructive"
                            // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(child.id);
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
