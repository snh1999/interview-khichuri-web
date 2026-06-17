import { PresetRow } from "@/components/theme/customizer/preset/PresetRow.tsx";
import { useThemeStore } from "@/store/themeStore.ts";

interface IProps {
  hideSaved?: boolean;
}

export const PresetSelection = ({ hideSaved }: Readonly<IProps>) => {
  const { builtInPresets, userPresets, activePresetId } = useThemeStore();

  return (
    <div className="flex flex-col gap-1">
      <div className="pl-1 font-semibold text-sm">Built-in</div>
      {builtInPresets.map((preset) => (
        <PresetRow
          isActive={activePresetId === preset.id}
          key={preset.id}
          preset={preset}
        />
      ))}

      {hideSaved && userPresets.length === 0 ? null : (
        <>
          <div className="my-2 h-px bg-border" />

          <div className="mt-1 pl-1 font-semibold text-sm">Saved</div>
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
