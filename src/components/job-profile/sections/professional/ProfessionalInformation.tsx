import { useFormContext } from "react-hook-form";
import { useIndustries, useTopics } from "@/api/lookups";
import { FormCombobox } from "@/components/common/form/combobox/FormCombobox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import { EXPERIENCE_LEVELS } from "@/components/job-profile/profile.data.ts";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { lookupToComboboxMap } from "@/components/lookups/lookup.helpers.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IProps {
  sectionId: string;
}

export const ProfessionalInformation = ({ sectionId }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  const { data: topics } = useTopics();
  const { data: industries } = useIndustries();

  return (
    <Card className="px-1" id={sectionId}>
      <CardHeader className="border-b">
        <CardTitle>Professional Information</CardTitle>
        <CardDescription>
          Your current role, experience level, and skills.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          form={form}
          label="Current Job Title"
          name="professional.title"
        />

        <FormSelect
          form={form}
          label="Experience Level"
          name="professional.experienceLevel"
          placeholder="choose your experience level"
          selectData={EXPERIENCE_LEVELS}
        />

        <FormInput
          form={form}
          label="Years of Experience"
          name="professional.yearsOfExperience"
          type="number"
        />

        <div className="flex flex-col gap-4">
          <FormCombobox
            data={topics}
            form={form}
            label="Skills"
            multiple
            name="professional.skills"
            placeholder="Choose your skills"
            toOption={lookupToComboboxMap}
          />

          <FormCombobox
            data={industries}
            form={form}
            label="Industries"
            multiple
            name="professional.industries"
            placeholder="Choose your skills"
            toOption={lookupToComboboxMap}
          />
        </div>
      </CardContent>
    </Card>
  );
};
