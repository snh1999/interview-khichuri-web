import { PresetSwatch } from "@/components/theme/customizer/preset/PresetSwatch.tsx";
import { TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button.tsx";
import { EditableText } from "@/components/common/EditableText.tsx";
import { useState } from "react";
import { useThemeStore } from "@/store/themeStore.ts";
import type { TThemePreset } from "@/components/theme/themes.types.ts";
import { ButtonGroup } from "@/components/ui/button-group.tsx";

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
    if (editable) deleteUserPreset(preset.id);
  };
  const onRename = (name: string) => {
    if (editable) renameUserPreset(preset.id, name);
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
        initialValue={preset.name}
        onSave={onRename}
        hideEditButton={!showEdit}
      >
        <Button
          variant="link"
          size="sm"
          className="text-muted-foreground flex-1 justify-between hover:no-underline"
          onClick={onLoad}
        >
          {preset.name}
          {showEdit ? null : <PresetSwatch preset={preset} />}
        </Button>
      </EditableText>

      <Button
        hidden={!showEdit}
        size="icon-xs"
        variant="ghost"
        aria-label="Delete preset"
        onClick={onDelete}
      >
        <TrashIcon size={11} />
      </Button>
    </ButtonGroup>
  );
};
