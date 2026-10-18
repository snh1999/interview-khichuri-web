import {
  CheckIcon,
  DesktopIcon,
  DeviceMobileIcon,
  StackIcon,
} from "@phosphor-icons/react";
import type React from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button";
import type { CanvasElement, FrameElement, StampType } from "../types";
import { isElementContainedInFrame } from "../utils/containment";

interface FrameStepProps {
  frames: FrameElement[];
  selectedFrameIds: string[];
  onToggleFrame: (frameId: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  elements: CanvasElement[];
  detectedSections: StampType[];
  detectedElementCount: number;
  activeFrames: FrameElement[];
}

export const FrameStep: React.FC<FrameStepProps> = ({
  frames,
  selectedFrameIds,
  onToggleFrame,
  onSelectAll,
  onClear,
  elements,
  detectedSections,
  detectedElementCount,
  activeFrames,
}) => {
  // Frames that share a route (desktop + mobile) are one page; group them so
  // that is visible at a glance.
  const groups = frames.reduce<Map<string, FrameElement[]>>((acc, frame) => {
    const route = frame.route || "/";
    acc.set(route, [...(acc.get(route) ?? []), frame]);
    return acc;
  }, new Map());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="font-bold text-md text-muted-foreground">
          Select Artboards to Transform
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={selectedFrameIds.length === frames.length}
            onClick={onSelectAll}
            size="sm"
            type="button"
            variant="ghost"
          >
            Select all
          </Button>
          <Button
            disabled={selectedFrameIds.length === 0}
            onClick={onClear}
            size="sm"
            type="button"
            variant="ghost"
          >
            Clear
          </Button>
        </div>
      </div>

      {[...groups.entries()].map(([route, routeFrames], index) => (
        <div className="space-y-2" key={route}>
          <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
            <span>Page {index + 1}</span>
            <span className="font-mono text-muted-foreground">{route}</span>
            {routeFrames.length > 1 && (
              <Badge>{routeFrames.length} artboards · one page</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {routeFrames.map((frame) => {
              const isSelected = selectedFrameIds.includes(frame.id);
              const count = elements.filter(
                (el) =>
                  el.id !== frame.id &&
                  (el.frameId === frame.id ||
                    isElementContainedInFrame(el, frame))
              ).length;

              return (
                <button
                  className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                  key={frame.id}
                  // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped frame
                  onClick={() => onToggleFrame(frame.id)}
                  type="button"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {frame.preset === "mobile" ? (
                        <DeviceMobileIcon className="text-primary" size={18} />
                      ) : (
                        <DesktopIcon className="text-primary" size={18} />
                      )}
                      <span className="font-bold text-foreground text-sm">
                        {frame.title || "Untitled Frame"}
                      </span>
                    </div>
                    <span
                      className={`flex size-5 items-center justify-center rounded-md border ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}
                    >
                      {isSelected && <CheckIcon size={12} weight="bold" />}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-muted-foreground text-xs">
                    <span>{count} components</span>
                    <span>•</span>
                    <span>{frame.route || "/"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {activeFrames.length > 0 && (
        <div className="mt-4 space-y-2 rounded-2xl border border-border/80 bg-muted/40 p-4">
          <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
            <StackIcon className="text-primary" size={14} />
            <span>
              Detected Wireframe Modules ({detectedElementCount} elements)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {detectedSections.length > 0 ? (
              detectedSections.map((sec) => <Badge key={sec}>{sec}</Badge>)
            ) : (
              <span className="text-muted-foreground text-xs">
                Standard layout structure (wireframe stamps will be synthesized)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
