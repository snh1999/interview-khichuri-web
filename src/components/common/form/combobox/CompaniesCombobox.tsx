import { useEffect, useMemo, useState } from "react";
import { useCompanies } from "@/api/lookups";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox.tsx";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field.tsx";
import { Skeleton } from "@/components/ui/skeleton";

interface ICompanyOption {
  value: number;
  label: string;
}

interface ICompaniesComboboxProps {
  companyId: number | null;
  companyName: string;
  onChange: (companyId: number | null, companyName: string) => void;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

const comboboxFallback = () => <Skeleton className="h-7 w-full rounded-md" />;

export const CompaniesCombobox = (props: Readonly<ICompaniesComboboxProps>) => (
  <AppErrorSuspense fallback={comboboxFallback}>
    <CompaniesComboboxInner {...props} />
  </AppErrorSuspense>
);

const CompaniesComboboxInner = ({
  companyId,
  companyName,
  onChange,
  label = "Company",
  placeholder = "Type or select a company...",
  description,
  disabled = false,
}: Readonly<ICompaniesComboboxProps>) => {
  const { data: companies } = useCompanies();
  const options = useMemo<ICompanyOption[]>(
    () =>
      companies.map((company) => ({
        value: company.id,
        label: company.name,
      })),
    [companies]
  );
  const optionMap = useMemo(
    () => new Map(options.map((o) => [o.value, o])),
    [options]
  );

  const [inputValue, setInputValue] = useState<string>(companyName);

  useEffect(() => {
    const selected = companyId === null ? undefined : optionMap.get(companyId);
    setInputValue(selected?.label ?? companyName ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, companyName, optionMap]);

  const currentValue =
    companyId === null ? null : (optionMap.get(companyId) ?? null);
  const itemToStringValue = (opt: ICompanyOption) => opt.label;

  const handleValueChange = (
    next: ICompanyOption | ICompanyOption[] | null
  ): void => {
    const option = Array.isArray(next) ? (next[0] ?? null) : next;
    if (option) {
      onChange(option.value, option.label);
    } else {
      onChange(null, inputValue.trim() || "");
    }
  };

  const handleBlur = (): void => {
    const typed = inputValue.trim();
    if (typed && companyId !== null) {
      const exists = options.some(
        (o) => o.label.toLowerCase() === typed.toLowerCase()
      );
      if (!exists) {
        onChange(null, typed);
      }
    }
    onChange(companyId ?? null, typed || "");
  };

  return (
    <Field>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <Combobox
        autoHighlight
        disabled={disabled}
        inputValue={inputValue}
        items={options}
        itemToStringValue={itemToStringValue}
        onInputValueChange={setInputValue}
        onValueChange={handleValueChange}
        value={currentValue}
      >
        <ComboboxInput onBlur={handleBlur} placeholder={placeholder} />
        <ComboboxContent>
          <ComboboxEmpty>No companies found.</ComboboxEmpty>
          <ComboboxList>
            {(opt: ICompanyOption) => (
              <ComboboxItem key={opt.value} value={opt}>
                {opt.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  );
};
