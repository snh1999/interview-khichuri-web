import { Button } from "@/components/ui/button.tsx";
import { oklchStringToHex } from "@/lib/theme/color-utils.ts";
import { BUILT_IN_ACCENTS } from "@/lib/theme/theme-preset.ts";
import { getSystemTheme } from "@/lib/utils.ts";
import { useThemeStore } from "@/store/themeStore.ts";

const ACCENT_PRESETS = BUILT_IN_ACCENTS;

export const AccentPicker = () => {
  const themeMode = useThemeStore((s) => s.theme);
  const resolvedTheme = themeMode === "system" ? getSystemTheme() : themeMode;
  const activeAccentId = useThemeStore((s) => s.activeAccentId);
  const setAccentPreset = useThemeStore((s) => s.setAccentPreset);

  const removeAccent = () => setAccentPreset(null);

  return (
    <div>
      <div className="mb-1 pl-1 font-semibold text-sm">Accent</div>
      <div className="grid grid-cols-3 gap-2">
        <AccentCard
          isActive={activeAccentId === null}
          presetName="None"
          setPreset={removeAccent}
        />

        {ACCENT_PRESETS.map((preset) => {
          const vars = resolvedTheme === "light" ? preset.light : preset.dark;
          const isActive = activeAccentId === preset.id;
          return (
            <AccentCard
              isActive={isActive}
              key={preset.id}
              presetName={preset.name}
              primary={vars["--primary"]}
              // biome-ignore lint/performance/noJsxPropsBind: <>
              setPreset={() => setAccentPreset(preset.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

const AccentCard = ({
  isActive,
  setPreset,
  presetName,
  primary,
}: Readonly<{
  isActive: boolean;
  setPreset: () => void;
  presetName: string;
  primary?: string;
}>) => (
  <Button
    className={`flex justify-between rounded px-2 ${
      isActive
        ? "border-primary bg-primary/10 text-foreground"
        : "border-muted-foreground/15 text-muted-foreground hover:border-border hover:bg-muted/60"
    }`}
    onClick={setPreset}
    size="lg"
    title={presetName}
    variant="ghost"
  >
    <span className="font-mono text-[13px] leading-none">{presetName}</span>

    <div
      className={`h-3.5 w-3.5 shrink-0 rounded-xs ${
        primary ? "" : "border border-muted-foreground/30 border-dashed"
      }`}
      style={{
        backgroundColor: primary ? oklchStringToHex(primary) : "",
      }}
    />
  </Button>
);
