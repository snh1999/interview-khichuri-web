import { FunnelIcon } from "@phosphor-icons/react";
import type { Column, RowData } from "@tanstack/react-table";
import type {
  adminTableFeatures,
  TAdminTable,
} from "@/components/admin/data-table/data-table.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

interface IColumnToggleProps<TData extends RowData> {
  column: Column<typeof adminTableFeatures, TData, unknown>;
}

const ColumnToggle = <TData extends RowData>({
  column,
}: IColumnToggleProps<TData>) => {
  const handleCheckedChange = (value: boolean) =>
    column.toggleVisibility(value);

  return (
    <DropdownMenuCheckboxItem
      checked={column.getIsVisible()}
      onCheckedChange={handleCheckedChange}
    >
      {column.id}
    </DropdownMenuCheckboxItem>
  );
};

interface IDataTableViewOptionsProps<TData extends RowData> {
  table: TAdminTable<TData>;
}

export const DataTableViewOptions = <TData extends RowData>({
  table,
}: IDataTableViewOptionsProps<TData>) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={
        <Button size="sm" variant="outline">
          <FunnelIcon data-icon="inline-start" />
          View
        </Button>
      }
    />
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {table
        .getAllLeafColumns()
        .filter((column) => column.getCanHide())
        .map((column) => (
          <ColumnToggle column={column} key={column.id} />
        ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
