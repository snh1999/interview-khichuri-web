import { PencilIcon } from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";

interface IProps {
  initialValue: string;
  onSave: (value: string) => void;
  saveOnBlur?: boolean;
  hideEditButton?: boolean;
  children: ReactNode;
}

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
    if (trimmed) {
      onSave(trimmed);
    }
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
          className="text-foreground text-xs"
          onBlur={onBlur}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              saveText();
            }
            if (event.key === "Escape") {
              setEditing(false);
            }
          }}
          value={draft}
        />
      ) : (
        children
      )}
      <Button
        aria-label="Rename preset"
        hidden={hideEditButton}
        onClick={() => setEditing(true)}
        size="icon-xs"
        variant="ghost"
      >
        <PencilIcon />
      </Button>
    </>
  );
};
