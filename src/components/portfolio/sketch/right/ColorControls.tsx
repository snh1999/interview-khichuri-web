import type React from "react";
import { Button } from "@/components/ui/button.tsx";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import type { CanvasElement, ElementChanges, ThemeConfig } from "../types";
import { type MixedState, toValidHex6 } from "./constants";

interface ColorControlsProps {
  activeElement: CanvasElement;
  strokeColorState: MixedState;
  fillColorState: MixedState;
  theme: ThemeConfig;
  themeSwatches: string[];
  updateSelected: (
    changes: ElementChanges,
    shouldRecordHistory?: boolean
  ) => void;
}

const formatColorState = (isMixed: boolean, color?: string) => {
  if (isMixed) {
    return "Mixed";
  }
  if (color === "transparent") {
    return "None";
  }
  return color ?? "";
};

export const ColorControls: React.FC<ColorControlsProps> = ({
  activeElement,
  strokeColorState,
  fillColorState,
  theme,
  themeSwatches,
  updateSelected,
}) => {
  const strokeColor = useSketchBuilderStore((s) => s.strokeColor);
  const setStrokeColor = useSketchBuilderStore((s) => s.setStrokeColor);
  const fillColor = useSketchBuilderStore((s) => s.fillColor);
  const setFillColor = useSketchBuilderStore((s) => s.setFillColor);
  const handleToggleStroke = () => {
    const next =
      activeElement.strokeColor === "transparent"
        ? theme.textColor || "var(--foreground)"
        : "transparent";
    updateSelected({ strokeColor: next });
    setStrokeColor(next);
  };
  const handleStrokeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSelected({ strokeColor: e.target.value });
    setStrokeColor(e.target.value);
  };
  const handleToggleFill = () => {
    const next =
      activeElement.fillColor === "transparent"
        ? theme.surfaceColor || "#ffffff"
        : "transparent";
    updateSelected({ fillColor: next });
    setFillColor(next);
  };
  const handleFillColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSelected({ fillColor: e.target.value });
    setFillColor(e.target.value);
  };
  const applySwatch = (swatch: string) => {
    const changes = { strokeColor: swatch, fillColor: `${swatch}22` };
    updateSelected(changes);
    setStrokeColor(swatch);
    setFillColor(`${swatch}22`);
  };
  return (
    <div className="space-y-3 border-border border-t pt-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-muted-foreground text-xxs uppercase tracking-wider">
          Stroke & Fill Colors
        </span>
        {strokeColorState.isMixed || fillColorState.isMixed ? (
          <span className="font-mono text-[9px] text-amber-500">
            Mixed Colors
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1 rounded-xl border border-border bg-muted/30 p-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Stroke</span>
            <Button
              className={`rounded border text-xxs ${
                activeElement.strokeColor === "transparent"
                  ? "border-destructive/30 bg-destructive/20 font-bold text-destructive"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
              onClick={handleToggleStroke}
              variant="ghost"
            >
              {activeElement.strokeColor === "transparent" ? "None" : "Color"}
            </Button>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-muted-foreground text-xxs">
              {formatColorState(
                strokeColorState.isMixed,
                activeElement.strokeColor
              )}
            </span>
            <input
              className="h-6 w-6 cursor-pointer rounded-md border-0 bg-transparent"
              onChange={handleStrokeColorChange}
              type="color"
              value={toValidHex6(
                activeElement.strokeColor === "transparent"
                  ? "#000000"
                  : activeElement.strokeColor || strokeColor,
                "#000000"
              )}
            />
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-border bg-muted/30 p-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Fill</span>
            <Button
              className={`rounded border text-xxs ${
                activeElement.fillColor === "transparent"
                  ? "border-destructive/30 bg-destructive/20 font-bold text-destructive"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
              onClick={handleToggleFill}
              variant="ghost"
            >
              {activeElement.fillColor === "transparent" ? "None" : "Color"}
            </Button>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-muted-foreground text-xxs">
              {formatColorState(
                fillColorState.isMixed,
                activeElement.fillColor
              )}
            </span>
            <input
              className="h-6 w-6 cursor-pointer rounded-md border-0 bg-transparent"
              onChange={handleFillColorChange}
              type="color"
              value={toValidHex6(
                activeElement.fillColor === "transparent"
                  ? "#ffffff"
                  : activeElement.fillColor || fillColor,
                "#ffffff"
              )}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1 pt-1">
        {themeSwatches.slice(0, 12).map((c) => (
          <Button
            className="rounded-md border border-border/80 hover:scale-110"
            key={c}
            // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped swatch color
            onClick={() => applySwatch(c)}
            size="icon-sm"
            style={{ backgroundColor: c }}
            title={c}
            type="button"
            variant="ghost"
          />
        ))}
      </div>
    </div>
  );
};
