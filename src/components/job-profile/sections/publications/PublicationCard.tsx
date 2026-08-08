import { TrashIcon } from "@phosphor-icons/react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { type UseFormReturn, useFormContext, useWatch } from "react-hook-form";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
import { Field, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";

interface IProps {
  index: number;
  onRemove: (index: number) => void;
}

const AuthorsInput = ({
  form,
  name,
}: {
  form: UseFormReturn<TProfileFormData>;
  name: `publications.${number}.authors`;
}) => {
  const authors = useWatch({ control: form.control, name }) ?? [];
  const lastSeen = useRef<string>(authors.join(", "));
  const [text, setText] = useState(authors.join(", "));

  useEffect(() => {
    const joined = authors.join(", ");
    if (joined !== lastSeen.current) {
      lastSeen.current = joined;
      setText(joined);
    }
  }, [authors]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // biome-ignore lint/style/useDestructuring: <>
    const value = event.target.value;
    setText(value);
    const parsed = value
      .split(",")
      .map((author) => author.trim())
      .filter(Boolean);
    lastSeen.current = parsed.join(", ");
    form.setValue(name, parsed, { shouldDirty: true });
  };

  return (
    <Field>
      <FieldLabel htmlFor={name}>Authors</FieldLabel>
      <Input
        className="text-xs"
        id={name}
        onChange={handleChange}
        placeholder="Comma-separated author names"
        value={text}
      />
    </Field>
  );
};

export const PublicationCard = ({ index, onRemove }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  const onRemoveClick = () => onRemove(index);

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="mt-3 flex justify-end">
        <Button
          onClick={onRemoveClick}
          size="sm"
          type="button"
          variant="destructive"
        >
          <TrashIcon />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <FormInput
          form={form}
          label="Title"
          name={`publications.${index}.title`}
        />
        <AuthorsInput form={form} name={`publications.${index}.authors`} />
        <FormInput
          form={form}
          label="Publication Type"
          name={`publications.${index}.publicationType`}
          placeholder="e.g. Journal Article, Conference Paper"
        />
        <FormInput
          form={form}
          label="Year"
          name={`publications.${index}.year`}
          placeholder="e.g. 2025"
          type="number"
        />
        <FormInput
          form={form}
          label="Link"
          name={`publications.${index}.link`}
          placeholder="https://..."
          type="url"
        />
        <FormInput
          form={form}
          label="Notes"
          name={`publications.${index}.notes`}
          placeholder="e.g. Journal name, DOI, acceptance details"
          textArea
        />
      </div>
    </div>
  );
};
