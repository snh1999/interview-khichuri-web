import type { IRow } from "./preview.helpers.ts";

export const UnchangedRow = ({ row }: { row: IRow }) => (
  <div className="flex items-center justify-between gap-2 border-b px-3 last:border-0">
    <span className="text-muted-foreground wrap-break-word">{row.label}</span>
    <span className="text-right wrap-break-word">
      {row.after ?? row.before ?? "—"}
    </span>
  </div>
);
