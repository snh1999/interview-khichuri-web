import { MoonIcon, PaintRollerIcon, SunIcon } from "@phosphor-icons/react";
import { PresetSelection } from "@/components/theme/customizer/preset/PresetSelections.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { useThemeStore } from "@/store/themeStore.ts";

export const ThemePicker = () => {
  const { theme, setTheme } = useThemeStore();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

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
          <Button className="w-max" onClick={toggleTheme} variant="outline">
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>

        <PresetSelection hideSaved />
      </PopoverContent>
    </Popover>
  );
};
