import { useFormContext } from "react-hook-form";
import { LookupCombobox } from "@/components/common/form/combobox/LookupCombobox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import { EXPERIENCE_LEVELS } from "@/components/job-profile/profile.data.ts";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
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

        <div className="flex gap-2">
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
        </div>

        <div className="col-span-1 flex flex-col gap-4 md:col-span-2">
          <LookupCombobox
            form={form}
            idsName="professional.skills"
            label="Skills"
            names="professional.skillNames"
          />

          <LookupCombobox
            form={form}
            idsName="professional.industries"
            label="Industries"
            names="professional.industriesNames"
            placeholder="Search or type to add industries"
            schema="industries"
          />
        </div>
      </CardContent>
    </Card>
  );
};
