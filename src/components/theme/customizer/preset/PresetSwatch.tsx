import { oklchStringToHex } from "@/lib/theme/color-utils.ts";
import type { TThemePreset } from "@/components/theme/themes.types.ts";
import { useThemeStore } from "@/store/themeStore.ts";
import { getSystemTheme } from "@/lib/utils.ts";

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
    <div className="border-border flex h-3.5 w-16 overflow-hidden">
      {swatchVars.map((value, index) => (
        <div
          key={index}
          className="flex-1"
          style={{ backgroundColor: oklchStringToHex(value ?? "oklch(0 0 0)") }}
        />
      ))}
    </div>
  );
};
