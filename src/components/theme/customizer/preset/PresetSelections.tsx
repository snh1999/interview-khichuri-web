import { AccentPicker } from "@/components/theme/customizer/preset/AccentPicker.tsx";
import { PresetRow } from "@/components/theme/customizer/preset/PresetRow.tsx";
import { BUILT_IN_BASES } from "@/lib/theme/theme-preset.ts";
import { useThemeStore } from "@/store/themeStore.ts";

interface IProps {
  hideSaved?: boolean;
}

export const PresetSelection = ({ hideSaved }: Readonly<IProps>) => {
  const { activeBaseId, userPresets, activePresetId } = useThemeStore();

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="mb-0.5 pl-1 font-semibold text-sm">Base</div>
        {BUILT_IN_BASES.map((preset) => (
          <PresetRow
            isActive={activeBaseId === preset.id}
            key={preset.id}
            preset={preset}
          />
        ))}
      </div>

      <AccentPicker />

      {hideSaved && userPresets.length === 0 ? null : (
        <>
          <div className="h-px bg-border" />

          <div className="mt-0.5 pl-1 font-semibold text-sm">Saved</div>
          {userPresets.length === 0 ? (
            <p className="font-mono text-[11px] text-muted-foreground/50">
              No saved presets yet.
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {userPresets.map((preset) => (
                <PresetRow
                  editable
                  isActive={activePresetId === preset.id}
                  key={preset.id}
                  preset={preset}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
