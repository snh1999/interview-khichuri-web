import type { ILookupEntry } from "@/api/lookups";
import type { IComboboxOption } from "@/components/common/form/combobox/FormCombobox.tsx";

export const lookupToComboboxMap = (data: ILookupEntry): IComboboxOption => ({
  label: data.name,
  value: data.id,
});
