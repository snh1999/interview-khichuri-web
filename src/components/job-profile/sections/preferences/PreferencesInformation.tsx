import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useRoles } from "@/api/lookups";
import { FormCombobox } from "@/components/common/form/combobox/FormCombobox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import {
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

          <div className="grid grid-cols-1 gap-3 border-t pt-4">
            <div>
              <p className="font-medium text-sm">Your voice (optional)</p>
              <p className="text-muted-foreground text-xs">
                Paste a cover letter or outreach email you like. AI drafts will
                match its tone and phrasing.
              </p>
            </div>

            <FormInput
              form={form}
              label="Cover Letter Template"
              name="preferences.coverLetterTemplate"
              placeholder="Paste an example cover letter…"
              rows={8}
              textArea
            />

            <FormInput
              form={form}
              label="Outreach Email Template"
              name="preferences.outreachEmailTemplate"
              placeholder="Paste an example outreach email…"
              rows={8}
              textArea
            />

            <FormInput
              form={form}
              label="LinkedIn DM Template"
              name="preferences.linkedinDmTemplate"
              placeholder="Paste an example LinkedIn message…"
              rows={5}
              textArea
            />
          </div>
        </CardContent>
      </Card>
    );
  }
);
