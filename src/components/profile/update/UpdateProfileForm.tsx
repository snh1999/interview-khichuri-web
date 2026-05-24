import { useUpdateProfileForm } from "@/components/profile/update/UpdateProfileForm.helpers.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { EnvelopeIcon, UserIcon } from "@phosphor-icons/react";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import type { User } from "better-auth";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

interface IProp {
  user: User;
}
export const UpdateProfileForm = ({ user }: Readonly<IProp>) => {
  const { form, isLoading, onSubmit } = useUpdateProfileForm(user);

  return (
    <Card>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormInput
            form={form}
            name="email"
            label="Email"
            type="email"
            placeholder="dev@example.com"
            StartComponent={<EnvelopeIcon />}
          />

          <FormInput
            form={form}
            name="name"
            label="Name"
            type="text"
            placeholder="John Doe"
            StartComponent={<UserIcon />}
          />

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              disabled={!form.formState.isDirty}
              onClick={() => form.reset()}
            >
              Reset
            </Button>

            <AsyncButton
              type="submit"
              isLoading={isLoading}
              disabled={!form.formState.isDirty}
              size="lg"
            >
              Update User
            </AsyncButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
