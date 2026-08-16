import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
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

export const PersonalInformation = memo(({ sectionId }: Readonly<IProps>) => {
  const form = useFormContext<TProfileFormData>();

  return (
    <Card className="px-1" id={sectionId}>
      <CardHeader className="border-b">
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Your basic contact details and identifiers.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput form={form} label="First Name" name="personal.firstName" />
        <FormInput form={form} label="Last Name" name="personal.lastName" />
        <FormInput
          form={form}
          label="Email"
          name="personal.email"
          type="email"
        />
        <FormInput form={form} label="Phone" name="personal.phone" />
        <FormInput form={form} label="Location" name="personal.location" />
        <FormInput form={form} label="Country" name="personal.country" />
      </CardContent>
    </Card>
  );
});
