import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IProps {
  sectionId: string;
}

const LINK_TYPES = [
  { value: "github", label: "GitHub" },
  { value: "gitlab", label: "GitLab" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "portfolio", label: "Portfolio" },
  { value: "blog", label: "Blog" },
  { value: "other", label: "Other" },
] as const;

export const LinksSection = ({ sectionId }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({ control: form.control, name: "links" });

  return (
    <Card className="px-1" id={sectionId}>
      <CardHeader>
        <CardTitle>Links</CardTitle>
        <CardAction className="pt-2 pr-1">
          <Button
            className="rounded-full bg-primary/50"
            onClick={() => appendLink({ type: "other", url: "" })}
            size="icon-sm"
          >
            <PlusIcon weight="bold" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {linkFields.map((field, index) => (
          <div className="flex items-center gap-2" key={field.id}>
            <FormSelect
              form={form}
              label="Type"
              name={`links.${index}.type`}
              placeholder="test"
              selectData={LINK_TYPES}
            />
            <FormInput form={form} label="Url" name={`links.${index}.url`} />
            <Button
              className="mt-6"
              onClick={() => removeLink(index)}
              variant="destructive"
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
        {linkFields.length === 0 && (
          <p className="text-center text-muted-foreground text-xs italic">
            No links added yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
