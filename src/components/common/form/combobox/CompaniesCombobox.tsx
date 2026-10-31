import { type KeyboardEvent, useEffect, useMemo, useRef } from "react";
import { useCompanies } from "@/api/lookups";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import {
  AppCombobox,
  type IComboboxOption,
} from "@/components/common/form/combobox/AppCombobox.tsx";
import { Skeleton } from "@/components/ui/skeleton";

interface ICompaniesComboboxProps {
  companyId: number | null;
  companyName: string;
  onChange: (companyId: number | null, companyName: string) => void;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
}

const comboboxFallback = () => <Skeleton className="h-7 w-full rounded-md" />;

const identityOption = (option: IComboboxOption) => option;

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
  error,
}: Readonly<ICompaniesComboboxProps>) => {
  const { data: companies } = useCompanies();
  const typedRef = useRef(companyName);

  useEffect(() => {
    typedRef.current = companyName;
  }, [companyName]);

  const realOptions = useMemo<IComboboxOption[]>(
    () =>
      companies.map((company) => ({
        value: company.id,
        label: company.name,
      })),
    [companies]
  );

  const options = useMemo(() => {
    const typed = companyName.trim();
    if (companyId !== null || !typed) {
      return realOptions;
    }
    return [...realOptions, { label: typed, value: typed }];
  }, [realOptions, companyId, companyName]);

  const handleChange = (next: string | number | null) => {
    if (typeof next === "number") {
      const company = realOptions.find((option) => option.value === next);
      onChange(next, company?.label ?? "");
      return;
    }
    onChange(null, next ?? "");
  };

  const handleInputValueChange = (next: string) => {
    typedRef.current = next;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }
    const typed = typedRef.current.trim();
    if (!typed) {
      return;
    }
    const matches = realOptions.some((option) =>
      option.label.toLowerCase().includes(typed.toLowerCase())
    );
    if (matches) {
      return;
    }
    event.preventDefault();
    onChange(null, typed);
  };

  return (
    <AppCombobox
      data={options}
      description={description}
      disabled={disabled}
      emptyText="Enter to select company"
      error={error}
      label={label}
      onChange={handleChange}
      onInputValueChange={handleInputValueChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      toOption={identityOption}
      value={companyId ?? (companyName.trim() || null)}
    />
  );
};
