import {
  ArrowCounterClockwiseIcon,
  BackspaceIcon,
  CheckIcon,
  ChecksIcon,
  EraserIcon,
} from "@phosphor-icons/react";
import { EditableText } from "@/components/common/EditableText.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { DiffText } from "./DiffText.tsx";
import type { IRow, TPick } from "./preview.helpers.ts";

interface IProps {
  row: IRow;
  pick: TPick;
  edited: string | undefined;
  onSelect: (key: string, pick: TPick) => void;
  onEdit: (key: string, value: string | undefined) => void;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <>
export const ChangedRow = ({ row, pick, edited, onSelect, onEdit }: IProps) => {
  const accepted = pick === "after";
  const isModified = edited !== undefined;
  const onDiscard = () => onEdit(row.key, undefined);
  const onRevert = () => onSelect(row.key, "before");
  const onAccept = () => onSelect(row.key, "after");
  const onModifiedEdit = (value: string) => onEdit(row.key, value);
  const onUnmodifiedEdit = (value: string) => onEdit(row.key, value);

  return (
    <div
      className={`border-b border-l-4 px-3 py-2 last:border-0 ${isModified ? "border-l-amber-500" : ""} 
      ${accepted ? "border-l-emerald-500" : "border-l-transparent"}`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-muted-foreground">{row.label}</span>

        <div className="flex shrink-0 items-center gap-1.5">
          {isModified ? (
            <Badge className="px-1 text-[10px]" variant="outline">
              <EraserIcon /> Modified
            </Badge>
            // biome-ignore lint/style/noNestedTernary: <>
          ) : accepted ? (
            <Badge className="px-1 text-[10px]">
              <ChecksIcon /> Accepted
            </Badge>
          ) : null}

          {isModified ? (
            <Button onClick={onDiscard} size="sm" variant="destructive">
              <ArrowCounterClockwiseIcon />
            </Button>
          ) : (
            <div className="flex shrink-0 gap-1.5">
              <Button
                onClick={accepted ? onRevert : onAccept}
                size="sm"
                variant={accepted ? "destructive" : "default"}
              >
                {accepted ? <BackspaceIcon /> : <CheckIcon weight="bold" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {isModified ? (
        <EditableText
          initialValue={edited}
          onSave={onModifiedEdit}
          saveOnBlur={Boolean(edited)}
          type={edited.length > 60 ? "textarea" : "input"}
        >
          <span className="wrap-break-word">{edited || "—"}</span>
        </EditableText>
      ) : (
        <EditableText
          initialValue={row.after ?? row.before ?? ""}
          onSave={onUnmodifiedEdit}
          saveOnBlur={Boolean(edited)}
          type={(row.after ?? "").length > 60 ? "textarea" : "input"}
        >
          <DiffText
            accepted={accepted}
            after={row.after ?? ""}
            before={row.before ?? ""}
          />
        </EditableText>
      )}
    </div>
  );
};
