import type { IRow } from "./preview.helpers.ts";

export const UnchangedRow = ({ row }: { row: IRow }) => (
  <div className="flex items-center justify-between gap-2 border-b px-3 last:border-0">
    <span className="wrap-break-word text-muted-foreground">{row.label}</span>
    <span className="wrap-break-word text-right">
      {row.after ?? row.before ?? "—"}
    </span>
  </div>
);
