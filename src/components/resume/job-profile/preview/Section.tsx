import { ChangedRow } from "./ChangedRow.tsx";
import type { IRow, TPick } from "./preview.helpers.ts";
import { UnchangedRow } from "./UnchangedRow.tsx";

interface IProps {
  title: string;
  rows: IRow[];
  emptyHint?: string;
  selections: Record<string, TPick>;
  edits: Record<string, string>;
  onSelect: (key: string, pick: TPick) => void;
  onEdit: (key: string, value: string | undefined) => void;
}

export const Section = ({
  title,
  rows,
  emptyHint,
  selections,
  edits,
  onSelect,
  onEdit,
}: IProps) => {
  if (rows.length === 0) {
    return (
      <div className="space-y-1">
        <h4 className="text-muted-foreground text-sm font-medium">{title}</h4>
        <div className="bg-muted/50 text-muted-foreground rounded-md p-3 text-xs">
          {emptyHint ?? "No data"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 py-2">
      <h2 className="text-sm font-bold">{title}</h2>
      <div className="bg-muted/50 overflow-hidden rounded-md border text-xs *:py-2 *:text-xs">
        {rows.map((row) =>
          row.changed ? (
            <ChangedRow
              edited={edits[row.key]}
              key={row.key}
              onEdit={onEdit}
              onSelect={onSelect}
              pick={selections[row.key] ?? (row.before ? "before" : "after")}
              row={row}
            />
          ) : (
            <UnchangedRow key={row.key} row={row} />
          )
        )}
      </div>
    </div>
  );
};
