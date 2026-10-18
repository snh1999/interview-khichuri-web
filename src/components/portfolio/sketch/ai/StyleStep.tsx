import type React from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { STYLE_PRESETS } from "./stylePresets";

interface StyleStepProps {
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
}

export const StyleStep: React.FC<StyleStepProps> = ({
  selectedPresetId,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-4">
      <div className="font-bold text-md text-muted-foreground">
        Choose Aesthetic Theme & Tone
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {STYLE_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <button
              className={`flex w-full cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/50"
              }`}
              key={preset.id}
              // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped style preset
              onClick={() => onSelectPreset(preset.id)}
              type="button"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">
                    {preset.name}
                  </span>
                  <Badge variant="secondary">{preset.badge}</Badge>
                </div>
                <p
                  className="line-clamp-1 text-muted-foreground text-xs leading-relaxed"
                  title={preset.vibe}
                >
                  {preset.vibe}
                </p>
              </div>

              <div className="mt-2 flex items-center gap-2 border-border/60 border-t pt-3">
                <div className="flex items-center gap-1.5">
                  {[preset.primary, preset.accent, preset.bg].map((data) => (
                    <div
                      className="h-5 w-5 rounded-full border border-border"
                      key={data}
                      style={{ backgroundColor: data }}
                    />
                  ))}
                </div>
                <span className="ml-auto text-muted-foreground text-xs">
                  {preset.primary}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
