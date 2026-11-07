import type React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";

interface RightSidebarEmptyProps {
  themeSwatches: string[];
  themeName?: string;
}

export const RightSidebarEmpty: React.FC<RightSidebarEmptyProps> = ({
  themeSwatches,
  themeName,
}) => {
  const setStrokeColor = useSketchBuilderStore((s) => s.setStrokeColor);
  const setFillColor = useSketchBuilderStore((s) => s.setFillColor);

  return (
    <aside className="border-border bg-card text-muted-foreground z-20 flex h-full w-64 flex-col justify-between overflow-y-auto border-l p-4 text-xs select-none sm:w-72">
      <div className="space-y-6">
        <div>
          <div className="text-foreground mb-2 text-xs font-bold tracking-wider uppercase">
            Inspector & Styles
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Select an element or frame on the canvas to inspect and customize
            its properties.
          </p>
        </div>

        <div className="border-border bg-muted/20 space-y-3 rounded-2xl border p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-foreground text-xs font-bold">
              Active Palette
            </span>
            <span className="text-muted-foreground text-xxs font-mono">
              {themeName || "Custom"}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {themeSwatches.slice(0, 10).map((color) => (
              <Button
                className="border-border/80 rounded-lg border shadow-xs hover:scale-110"
                key={color}
                // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped swatch color
                onClick={() => {
                  setStrokeColor(color);
                  setFillColor(color);
                  toast.success(`Active color set to ${color}`);
                }}
                size="icon"
                style={{ backgroundColor: color }}
                title={`Select ${color}`}
                type="button"
                variant="ghost"
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
