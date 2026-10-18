import type React from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import type { CanvasElement, ElementChanges } from "../types";
import type { MixedState } from "./constants";

interface SliderControlsProps {
  activeElement: CanvasElement;
  strokeWidthState: MixedState;
  opacityState: MixedState;
  cornerRadiusState: MixedState;
  disabled?: boolean;
  updateSelected: (
    changes: ElementChanges,
    shouldRecordHistory?: boolean
  ) => void;
}

export const SliderControls: React.FC<SliderControlsProps> = ({
  activeElement,
  strokeWidthState,
  opacityState,
  cornerRadiusState,
  disabled = false,
  updateSelected,
}) => {
  const strokeWidth = useSketchBuilderStore((s) => s.strokeWidth);
  const setStrokeWidth = useSketchBuilderStore((s) => s.setStrokeWidth);
  const opacity = useSketchBuilderStore((s) => s.opacity);
  const setOpacity = useSketchBuilderStore((s) => s.setOpacity);
  const cornerRadius = useSketchBuilderStore((s) => s.cornerRadius);
  const setCornerRadius = useSketchBuilderStore((s) => s.setCornerRadius);
  const handleStrokeWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, Number(e.target.value));
    updateSelected({ strokeWidth: val });
    setStrokeWidth(val);
  };
  const handleStrokeWidthSlide = (v: number | readonly number[]) => {
    const val = typeof v === "number" ? v : v[0];
    updateSelected({ strokeWidth: val });
    setStrokeWidth(val);
  };
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(100, Math.max(0, Number(e.target.value))) / 100;
    updateSelected({ opacity: val });
    setOpacity(val);
  };
  const handleOpacitySlide = (v: number | readonly number[]) => {
    const val = typeof v === "number" ? v : v[0];
    const op = val / 100;
    updateSelected({ opacity: op });
    setOpacity(op);
  };
  const handleCornerRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, Number(e.target.value));
    updateSelected({ cornerRadius: val });
    setCornerRadius(val);
  };
  const handleCornerRadiusSlide = (v: number | readonly number[]) => {
    const val = typeof v === "number" ? v : v[0];
    updateSelected({ cornerRadius: val });
    setCornerRadius(val);
  };
  return (
    <div className="space-y-4 border-border border-t pt-2">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>Stroke Width</span>
          <div className="flex items-center gap-1">
            {strokeWidthState.isMixed ? (
              <span className="mr-1 font-mono text-[9px] text-amber-500">
                Mixed
              </span>
            ) : null}
            <Input
              className="h-5 w-12 rounded border-border bg-background px-1 text-right font-mono text-xs focus-visible:ring-0"
              max={24}
              min={0}
              onChange={handleStrokeWidthChange}
              placeholder="—"
              type="number"
              value={
                strokeWidthState.isMixed
                  ? ""
                  : activeElement.strokeWidth || strokeWidth
              }
            />
            <span className="font-mono text-xxs">px</span>
          </div>
        </div>
        <Slider
          disabled={disabled}
          max={24}
          min={0}
          onValueChange={handleStrokeWidthSlide}
          step={1}
          value={[
            strokeWidthState.isMixed
              ? 2
              : activeElement.strokeWidth || strokeWidth,
          ]}
        />
      </div>

      {/* Opacity (Min 0 allowed) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>Opacity</span>
          <div className="flex items-center gap-1">
            {opacityState.isMixed ? (
              <span className="mr-1 font-mono text-[9px] text-amber-500">
                Mixed
              </span>
            ) : null}
            <Input
              className="h-5 w-12 rounded border-border bg-background px-1 text-right font-mono text-xs focus-visible:ring-0"
              max={100}
              min={0}
              onChange={handleOpacityChange}
              placeholder="—"
              type="number"
              value={
                opacityState.isMixed
                  ? ""
                  : Math.round((activeElement.opacity ?? opacity) * 100)
              }
            />
            <span className="font-mono text-xxs">%</span>
          </div>
        </div>
        <Slider
          disabled={disabled}
          max={100}
          min={0}
          onValueChange={handleOpacitySlide}
          step={5}
          value={[
            opacityState.isMixed
              ? 100
              : (activeElement.opacity ?? opacity) * 100,
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>Corner Radius</span>
          <div className="flex items-center gap-1">
            {cornerRadiusState.isMixed ? (
              <span className="mr-1 font-mono text-[9px] text-amber-500">
                Mixed
              </span>
            ) : null}
            <Input
              className="h-5 w-12 rounded border-border bg-background px-1 text-right font-mono text-xs focus-visible:ring-0"
              max={60}
              min={0}
              onChange={handleCornerRadiusChange}
              placeholder="—"
              type="number"
              value={
                cornerRadiusState.isMixed
                  ? ""
                  : (activeElement.cornerRadius ?? cornerRadius)
              }
            />
            <span className="font-mono text-xxs">px</span>
          </div>
        </div>
        <Slider
          disabled={disabled}
          max={60}
          min={0}
          onValueChange={handleCornerRadiusSlide}
          step={2}
          value={[
            cornerRadiusState.isMixed
              ? 8
              : (activeElement.cornerRadius ?? cornerRadius),
          ]}
        />
      </div>
    </div>
  );
};
