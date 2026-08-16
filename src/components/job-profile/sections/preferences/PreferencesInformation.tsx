import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useRoles } from "@/api/lookups";
import { FormCombobox } from "@/components/common/form/combobox/FormCombobox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import {
  COVER_LETTER_TONES,
  CURRENCIES,
  REMOTE_PREFERENCES,
} from "@/components/job-profile/profile.data.ts";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { lookupToComboboxMap } from "@/components/lookups/lookup.helpers.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface IProps {
  sectionId: string;
}

export const PreferencesInformation = memo(
  ({ sectionId }: Readonly<IProps>) => {
    const form = useFormContext<TProfileFormData>();

    const { data: roles } = useRoles();

    return (
      <Card className="px-1" id={sectionId}>
        <CardHeader className="border-b">
          <CardTitle>Job Preferences</CardTitle>
          <CardDescription>
            Your career preferences and salary expectations.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <FormCombobox
            data={roles}
            form={form}
            label="Role Preferences"
            multiple
            name="preferences.titles"
            placeholder="Choose your desired roles"
            toOption={lookupToComboboxMap}
          />

          <div className="grid grid-cols-3 gap-3">
            <FormSelect
              form={form}
              label="Job Type"
              name="preferences.workType"
              selectData={REMOTE_PREFERENCES}
            />

            <FormInput
              form={form}
              label="Location Preference"
              name="preferences.preferredLocation"
            />

            <FormSelect
              form={form}
              label="Cover Letter Tone"
              name="preferences.coverLetterTone"
              selectData={COVER_LETTER_TONES}
            />

            <FormInput
              description="Used to filter jobs"
              form={form}
              label="Minimum Salary"
              name="preferences.salaryLower"
              type="number"
            />

            <FormInput
              description="Used for application"
              form={form}
              label="Expected Salary"
              name="preferences.salaryExpected"
              type="number"
            />

            <FormSelect
              form={form}
              label="Currency"
              name="preferences.currency"
              selectData={CURRENCIES}
            />
          </div>
        </CardContent>
      </Card>
    );
  }
);
