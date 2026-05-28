import { Input } from "@/components/ui/input.tsx";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { PencilIcon } from "@phosphor-icons/react";

type IProps = {
  initialValue: string;
  onSave: (value: string) => void;
  saveOnBlur?: boolean;
  hideEditButton?: boolean;
  children: ReactNode;
};

export const EditableText = ({
  initialValue,
  onSave,
  saveOnBlur,
  hideEditButton,
  children,
}: Readonly<IProps>) => {
  const [draft, setDraft] = useState(initialValue);

  const [editing, setEditing] = useState(false);

  const saveText = () => {
    const trimmed = draft.trim();
    if (trimmed) onSave(trimmed);
    setEditing(false);
  };

  const onBlur = () => {
    if (saveOnBlur) {
      saveText();
    }
    setEditing(false);
  };

  return (
    <>
      {editing ? (
        <Input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={onBlur}
          onKeyDown={(event) => {
            if (event.key === "Enter") saveText();
            if (event.key === "Escape") setEditing(false);
          }}
          className="text-foreground text-xs"
        />
      ) : (
        children
      )}
      <Button
        hidden={hideEditButton}
        size="icon-xs"
        variant="ghost"
        aria-label="Rename preset"
        onClick={() => setEditing(true)}
      >
        <PencilIcon />
      </Button>
    </>
  );
};
