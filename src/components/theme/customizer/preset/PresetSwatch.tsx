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
    vars["--background"],
    vars["--chart-2"],
    vars["--chart-3"],
  ];

  return (
    <div className="border-border flex h-3.5 w-16 overflow-hidden">
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
