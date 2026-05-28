import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { Button } from "@/components/ui/button.tsx";
import { PresetSelection } from "@/components/theme/customizer/preset/PresetSelections.tsx";
import { MoonIcon, PaintRollerIcon, SunIcon } from "@phosphor-icons/react";
import { useThemeStore } from "@/store/themeStore.ts";

export const ThemePicker = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline">
            <PaintRollerIcon />
          </Button>
        }
      />
      <PopoverContent className="gap-0">
        <div className="mt-3 mr-2 flex items-center justify-end">
          <Button
            className="w-max"
            variant="outline"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>

        <PresetSelection />
      </PopoverContent>
    </Popover>
  );
};
