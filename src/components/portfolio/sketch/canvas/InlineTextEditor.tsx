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
        className="border-primary bg-foreground text-background placeholder:text-background/50 dark:bg-foreground dark:text-background resize-none rounded-md p-1 text-xs shadow-lg"
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
