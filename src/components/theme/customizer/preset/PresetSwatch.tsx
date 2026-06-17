import type { TThemePreset } from "@/components/theme/themes.types.ts";
import { oklchStringToHex } from "@/lib/theme/color-utils.ts";
import { getSystemTheme } from "@/lib/utils.ts";
import { useThemeStore } from "@/store/themeStore.ts";

export const PresetSwatch = ({
  preset,
}: Readonly<{ preset: TThemePreset }>) => {
  const theme = useThemeStore((state) => state.theme);
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  const vars = resolvedTheme === "light" ? preset.light : preset.dark;
  const swatchVars = [
    vars["--primary"],
    vars["--secondary"],
    vars["--muted-foreground"],
    vars["--destructive"],
  ];

  return (
    <div className="flex h-3.5 w-16 overflow-hidden border-border">
      {swatchVars.map((value) => (
        <div
          className="flex-1"
          key={value[0]}
          style={{ backgroundColor: oklchStringToHex(value ?? "oklch(0 0 0)") }}
        />
      ))}
    </div>
  );
};
