import type { FieldValues } from "react-hook-form";
import { type ILookupEntry, useCreateLookup, useRoles } from "@/api/lookups";
import {
  FormCombobox,
  type TComboboxProps,
} from "@/components/common/form/combobox/FormCombobox.tsx";

export const RolesCombobox = <T extends FieldValues>({
  name,
  form,
  label = "Role",
  placeholder = "Select a role",
  ...rest
}: Readonly<TComboboxProps<T>>) => {
  const roles = useRoles();
  const createRole = useCreateLookup("roles");

  const handleCreateRole = async (roleName: string) => {
    const created = await createRole.mutateAsync({ name: roleName });
    form.setValue(name as never, created.id as never);
  };

  const optionMapping = (item: ILookupEntry) => ({
    label: item.name,
    value: item.id,
  });

  return (
    <FormCombobox
      creatable
      data={roles.data}
      form={form}
      label={label}
      name={name}
      onCreateItem={handleCreateRole}
      placeholder={placeholder}
      toOption={optionMapping}
      {...rest}
    />
  );
};
