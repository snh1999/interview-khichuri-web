import { XIcon } from "@phosphor-icons/react";
import { type ICompany, useCompanies } from "@/api/lookups";
import { AppCombobox } from "@/components/common/form/combobox/AppCombobox.tsx";
import { Button } from "@/components/ui/button.tsx";

interface IProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export const CompanyFilter = ({ value, onChange }: Readonly<IProps>) => {
  const { data: companies } = useCompanies();
  const selected = companies.find((company) => company.id === value);

  const handleChange = (next: string | number | null) =>
    onChange(next === null ? null : Number(next));
  const toOption = (company: ICompany) => ({
    label: company.name,
    value: company.id,
  });
  const clear = () => onChange(null);
  return (
    <div className="flex items-center gap-2">
      <AppCombobox
        data={companies}
        hideChips
        onChange={handleChange}
        placeholder="All companies"
        toOption={toOption}
        value={value}
      />
      {selected ? (
        <Button
          aria-label="Clear company filter"
          onClick={clear}
          size="icon-sm"
          variant="ghost"
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
};
