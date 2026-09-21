import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { deleteUser } from "@/lib/auth/auth-client.ts";

export const ProfileDangerZone = () => (
  <Card className="border border-destructive">
    <CardHeader>
      <CardTitle className="text-destructive">Danger Zone</CardTitle>
      <CardDescription className="text-sm">
        This operation is permanent and cannot be reverted.
      </CardDescription>
    </CardHeader>
    <CardContent>
      Delete your account in three steps:
      <ol className="mt-4 flex list-decimal flex-col gap-2 pl-6">
        <li>Click the button below.</li>
        <li>Check your email for a confirmation link.</li>
        <li>Open the link to confirm deletion.</li>
      </ol>
      <p className="whitespace-normal pt-4 text-destructive">
        NOTE: Once confirmed, your profile, preferences, and all saved data will
        be erased permanently.
      </p>
    </CardContent>
    <CardFooter>
      <AuthActionButton
        action={deleteUser}
        actionLabel="Delete account"
        dialogDescription="This permanently erases your profile, preferences, and all saved data."
        dialogTitle="Delete your account?"
        requireConfirmation
        successMessage="Account deletion started. Check your email to confirm."
        variant="destructive"
      >
        Delete Account Permanently
      </AuthActionButton>
    </CardFooter>
  </Card>
);
