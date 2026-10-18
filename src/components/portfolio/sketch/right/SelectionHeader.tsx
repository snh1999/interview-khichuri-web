import { CopyIcon, SlidersIcon, TrashIcon } from "@phosphor-icons/react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/button/ActionButton";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import type { CanvasElement } from "../types";

interface SelectionHeaderProps {
  activeElement?: CanvasElement;
  isMulti: boolean;
  selectedElements: CanvasElement[];
}

export const SelectionHeader: React.FC<SelectionHeaderProps> = ({
  activeElement,
  isMulti,
  selectedElements,
}) => {
  const duplicateSelectedElements = useSketchBuilderStore(
    (s) => s.duplicateSelectedElements
  );
  const deleteSelectedElements = useSketchBuilderStore(
    (s) => s.deleteSelectedElements
  );
  const handleDelete = () => {
    deleteSelectedElements();
    return Promise.resolve({ error: false });
  };
  return (
    <div className="flex items-center justify-between border-border border-b pb-3">
      <div className="flex items-center gap-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
        <SlidersIcon className="text-primary" size={15} />
        <span>
          {isMulti
            ? `${selectedElements.length} Items Selected`
            : activeElement?.name || activeElement?.type.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          className="text-muted-foreground hover:text-foreground"
          onClick={duplicateSelectedElements}
          size="icon"
          title="Duplicate (Ctrl+D)"
          variant="ghost"
        >
          <CopyIcon size={13} />
        </Button>
        <ActionButton
          action={handleDelete}
          dialogDescription={
            selectedElements.length > 0
              ? `This will permanently delete ${selectedElements.length} selected element(s) and their contained children. This action cannot be undone.`
              : "Delete selected elements?"
          }
          dialogTitle="Delete Selected"
          requireConfirmation
          size="icon"
          title="Delete (Del / Backspace)"
          variant="destructive"
        >
          <TrashIcon size={14} />
        </ActionButton>
      </div>
    </div>
  );
};
