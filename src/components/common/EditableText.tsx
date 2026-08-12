import { PencilIcon } from "@phosphor-icons/react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  useState,
} from "react";
import { Button } from "@/components/ui/button.tsx";
import { DatePicker } from "@/components/ui/custom/DatePicker.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

type TDataType = string | Date | number;

interface IProps<T extends TDataType> {
  initialValue: T;
  onSave: (value: T) => void;
  saveOnBlur?: boolean;
  hideEditButton?: boolean;
  children: ReactNode;
  type?: "textarea" | "input";
}

export const EditableText = <T extends TDataType>({
  initialValue,
  onSave,
  saveOnBlur,
  hideEditButton,
  children,
  type = "input",
}: Readonly<IProps<T>>) => {
  const [draft, setDraft] = useState(initialValue);
  const [editing, setEditing] = useState(false);

  const saveText = () => {
    const trimmed = typeof draft === "string" ? draft.trim() : draft;
    if (trimmed) {
      onSave(trimmed as T);
    }
    setEditing(false);
  };

  const onBlur = () => {
    if (saveOnBlur) {
      saveText();
    }
    setEditing(false);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setDraft(event.target.value as T);

  const handlePencilClick = () => setEditing(true);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter") {
      saveText();
      setEditing(false);
    }
    if (event.key === "Escape") {
      setEditing(false);
    }
  };

  return (
    <>
      {editing ? (
        // biome-ignore lint/style/noNestedTernary: <>
        type === "textarea" ? (
          <Textarea
            autoFocus
            className="text-foreground text-xs"
            onBlur={onBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={draft as string}
          />
          // biome-ignore lint/style/noNestedTernary: <>
        ) : initialValue instanceof Date ? (
          <DatePicker
            autoFocus
            onBlur={onBlur}
            // biome-ignore lint/performance/noJsxPropsBind: <>
            onChange={(date) => date && setDraft(date as T)}
            value={draft}
          />
        ) : (
          <Input
            autoFocus
            className="text-foreground text-xs"
            onBlur={onBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={draft as string | number}
          />
        )
      ) : (
        children
      )}
      <Button
        aria-label="Rename preset"
        hidden={hideEditButton}
        onClick={handlePencilClick}
        size="icon-xs"
        variant="ghost"
      >
        <PencilIcon />
      </Button>
    </>
  );
};
