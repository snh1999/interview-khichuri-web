import type React from "react";
import { Textarea } from "@/components/ui/textarea.tsx";

interface InlineTextEditorProps {
  value: string;
  left: number;
  top: number;
  width: number;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  value,
  left,
  top,
  width,
  onChange,
  onCommit,
  onCancel,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    onChange(e.target.value);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };
  return (
    <div className="absolute z-50" style={{ left, top, width }}>
      <Textarea
        autoFocus
        className="resize-none rounded-md border-primary bg-foreground p-1 text-background text-xs shadow-lg placeholder:text-background/50 dark:bg-foreground dark:text-background"
        onBlur={onCommit}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type something"
        rows={2}
        value={value}
      />
    </div>
  );
};
