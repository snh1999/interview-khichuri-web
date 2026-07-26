import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import type {
  ArrayPath,
  FieldArray,
  FieldValues,
  Path,
  UseFormReturn,
} from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

interface IProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: ArrayPath<T>;
  label?: string;
  placeholder?: string;
}

export const FormArrayInput = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
}: IProps<T>) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  const arrayError = form.formState.errors[name] as unknown as
    | { message?: string }
    | undefined;

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <div className="flex items-center gap-2" key={field.id}>
            <InputGroup className="flex-1">
              <InputGroupInput
                {...form.register(`${name}.${index}.value` as Path<T>)}
                placeholder={placeholder}
              />
            </InputGroup>
            <Button
              onClick={() => remove(index)}
              size="icon"
              type="button"
              variant="destructive"
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        ))}
        <div>
          <Button
            className="text-xs"
            onClick={() => append({ value: "" } as FieldArray<T, ArrayPath<T>>)}
            size="sm"
            type="button"
            variant="outline"
          >
            <PlusIcon className="size-3" />
            Add link
          </Button>
        </div>
      </div>
      {arrayError ? <FieldError errors={[arrayError]} /> : null}
    </Field>
  );
};
