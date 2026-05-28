import { useThemeStore } from "@/store/themeStore.ts";
import { PresetRow } from "@/components/theme/customizer/preset/PresetRow.tsx";

interface IProps {
  hideSaved?: boolean;
}

export const PresetSelection = ({ hideSaved }: Readonly<IProps>) => {
  const { builtInPresets, userPresets, activePresetId } = useThemeStore();

  return (
    <div className="flex flex-col gap-1">
      <div className="pl-1 text-sm font-semibold">Built-in</div>
      {builtInPresets.map((preset) => (
        <PresetRow
          key={preset.id}
          preset={preset}
          isActive={activePresetId === preset.id}
        />
      ))}

      <div className="bg-border my-2 h-px" />

      {hideSaved && userPresets.length == 0 ? null : (
        <>
          <div className="mt-1 pl-1 text-sm font-semibold">Saved</div>
          {userPresets.length === 0 ? (
            <p className="text-muted-foreground/50 font-mono text-[11px]">
              No saved presets yet.
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {userPresets.map((preset) => (
                <PresetRow
                  key={preset.id}
                  preset={preset}
                  isActive={activePresetId === preset.id}
                  editable
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
