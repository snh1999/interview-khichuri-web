import { EnvelopeIcon, UserIcon } from "@phosphor-icons/react";
import type { User } from "better-auth";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { useUpdateProfileForm } from "@/components/settings/update/UpdateProfileForm.helpers.ts";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";

interface IProp {
  user: User;
}
export const UpdateProfileForm = ({ user }: Readonly<IProp>) => {
  const { form, isLoading, onSubmit } = useUpdateProfileForm(user);
  const resetForm = () => form.reset();

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-3 pb-4">
          <FormInput
            form={form}
            label="Name"
            name="name"
            placeholder="John Doe"
            StartComponent={<UserIcon />}
            type="text"
          />

          <FormInput
            form={form}
            label="Email"
            name="email"
            placeholder="dev@example.com"
            StartComponent={<EnvelopeIcon />}
            type="email"
          />
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Button
            disabled={!form.formState.isDirty}
            onClick={resetForm}
            size="lg"
            variant="outline"
          >
            Reset
          </Button>

          <AsyncButton
            disabled={!form.formState.isDirty}
            isLoading={isLoading}
            size="lg"
            type="submit"
          >
            Update
          </AsyncButton>
        </CardFooter>
      </form>
    </Card>
  );
};
