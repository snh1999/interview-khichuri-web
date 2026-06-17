import { TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { EditableText } from "@/components/common/EditableText.tsx";
import { PresetSwatch } from "@/components/theme/customizer/preset/PresetSwatch.tsx";
import type { TThemePreset } from "@/components/theme/themes.types.ts";
import { Button } from "@/components/ui/button.tsx";
import { ButtonGroup } from "@/components/ui/button-group.tsx";
import { useThemeStore } from "@/store/themeStore.ts";

export const PresetRow = ({
  preset,
  isActive,
  editable,
}: Readonly<{
  preset: TThemePreset;
  isActive: boolean;
  editable?: boolean;
}>) => {
  const [hover, setHover] = useState(false);
  const showEdit = hover && editable;

  const { loadPreset, deleteUserPreset, renameUserPreset } = useThemeStore();

  const onLoad = () => loadPreset(preset);
  const onDelete = () => {
    if (editable) {
      deleteUserPreset(preset.id);
    }
  };
  const onRename = (name: string) => {
    if (editable) {
      renameUserPreset(preset.id, name);
    }
  };

  return (
    <ButtonGroup
      className={`flex w-full rounded p-1 ${
        isActive ? "bg-primary/25" : "text-muted-foreground hover:bg-muted/60"
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <EditableText
        hideEditButton={!showEdit}
        initialValue={preset.name}
        onSave={onRename}
      >
        <Button
          className="flex-1 justify-between text-muted-foreground hover:no-underline"
          onClick={onLoad}
          size="sm"
          variant="link"
        >
          {preset.name}
          {showEdit ? null : <PresetSwatch preset={preset} />}
        </Button>
      </EditableText>

      <Button
        aria-label="Delete preset"
        hidden={!showEdit}
        onClick={onDelete}
        size="icon-xs"
        variant="ghost"
      >
        <TrashIcon size={11} />
      </Button>
    </ButtonGroup>
  );
};
