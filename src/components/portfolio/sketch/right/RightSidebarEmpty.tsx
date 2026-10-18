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
    <aside className="z-20 flex h-full w-64 select-none flex-col justify-between overflow-y-auto border-border border-l bg-card p-4 text-muted-foreground text-xs sm:w-72">
      <div className="space-y-6">
        <div>
          <div className="mb-2 font-bold text-foreground text-xs uppercase tracking-wider">
            Inspector & Styles
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Select an element or frame on the canvas to inspect and customize
            its properties.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-3.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-xs">
              Active Palette
            </span>
            <span className="font-mono text-muted-foreground text-xxs">
              {themeName || "Custom"}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {themeSwatches.slice(0, 10).map((color) => (
              <Button
                className="rounded-lg border border-border/80 shadow-xs hover:scale-110"
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
