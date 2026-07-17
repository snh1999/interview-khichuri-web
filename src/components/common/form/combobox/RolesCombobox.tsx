import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { useCreateLookup, useRoles } from "@/api/lookups";
import { FormCombobox } from "@/components/common/form/combobox/FormCombobox.tsx";

interface IProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
}

export const RolesCombobox = <T extends FieldValues>({
  form,
  name,
  label = "Role",
  placeholder = "Select a role",
}: Readonly<IProps<T>>) => {
  const roles = useRoles();
  const createRole = useCreateLookup("roles");

  const handleCreateRole = async (roleName: string) => {
    const created = await createRole.mutateAsync({ name: roleName });
    form.setValue(name as never, created.id as never);
  };

  return (
    <FormCombobox
      creatable
      data={roles.data}
      form={form}
      label={label}
      name={name}
      onCreateItem={handleCreateRole}
      placeholder={placeholder}
      toOption={(item) => ({ value: item.id, label: item.name })}
    />
  );
};
