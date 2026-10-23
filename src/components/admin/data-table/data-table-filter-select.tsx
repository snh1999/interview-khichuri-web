import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

const ALL = "__all__";

interface IDataTableFilterSelectOption {
  value: string;
  label: string;
}

interface IDataTableFilterSelectProps {
  label: string;
  allLabel: string;
  value: string;
  options: IDataTableFilterSelectOption[];
  onChange: (value: string) => void;
}

export const DataTableFilterSelect = ({
  label,
  allLabel,
  value,
  options,
  onChange,
}: IDataTableFilterSelectProps) => {
  const handleValueChange = (next: string | null) => {
    onChange(next === ALL || next === null ? "" : next);
  };
  const items = [{ label: allLabel, value: ALL }, ...options];

  return (
    <Select
      items={items}
      onValueChange={handleValueChange}
      value={value || ALL}
    >
      <SelectTrigger aria-label={label} size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
