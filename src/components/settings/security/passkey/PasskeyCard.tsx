import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAddPasskey } from "@/api/auth";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { PasskeyItems } from "@/components/settings/security/passkey/PasskeyItems.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";

const passkeySchema = z.object({
  name: z.string().min(1),
});
type PasskeyForm = z.infer<typeof passkeySchema>;

export const PasskeyCard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mutateAsync: addPasskey } = useAddPasskey();

  const form = useForm<PasskeyForm>({
    resolver: zodResolver(passkeySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data: PasskeyForm) => {
    await addPasskey(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  });

  const handleDialogOpen = (open: boolean) => {
    if (open) {
      form.reset();
    }
    setIsDialogOpen(open);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passkeys</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Spinner className="h-15" />}>
          <PasskeyItems />
        </Suspense>

        <Dialog onOpenChange={handleDialogOpen} open={isDialogOpen}>
          <DialogTrigger
            render={<Button className="mt-4">New Passkey</Button>}
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Passkey</DialogTitle>
              <DialogDescription>
                Create a new passkey for secure, passwordless authentication.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={onSubmit}>
              <FormInput form={form} label="Name" name="name" />
              <AsyncButton
                className="w-full"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                Add
              </AsyncButton>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
