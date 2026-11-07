import {
  ArrowDownIcon,
  ArrowsDownUpIcon,
  ArrowUpIcon,
} from "@phosphor-icons/react";
import type { Column, RowData } from "@tanstack/react-table";
import type { adminTableFeatures } from "@/components/admin/data-table/data-table.tsx";
import { Button } from "@/components/ui/button.tsx";

interface IDataTableColumnHeaderProps<TData extends RowData> {
  column: Column<typeof adminTableFeatures, TData, unknown>;
  title: string;
}

export const DataTableColumnHeader = <TData extends RowData>({
  column,
  title,
}: IDataTableColumnHeaderProps<TData>) => {
  if (!column.getCanSort()) {
    return <span>{title}</span>;
  }

  const sorted = column.getIsSorted();
  const handleSort = () => column.toggleSorting(sorted === "asc");

  return (
    <Button className="-ml-2" onClick={handleSort} size="sm" variant="ghost">
      {title}
      {sorted === "asc" ? <ArrowUpIcon data-icon="inline-end" /> : null}
      {sorted === "desc" ? <ArrowDownIcon data-icon="inline-end" /> : null}
      {sorted === false ? (
        <ArrowsDownUpIcon
          className="text-muted-foreground"
          data-icon="inline-end"
        />
      ) : null}
    </Button>
  );
};
