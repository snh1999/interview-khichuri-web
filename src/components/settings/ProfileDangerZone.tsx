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
      Follow the following steps:
      <ol className="mt-4 flex list-decimal flex-col gap-2 pl-6">
        <li>Click the button below.</li>
        <li>Check your email to get the confirmation link</li>
        <li>Follow the link to confirm account deletion.</li>
      </ol>
      <p className="whitespace-normal pt-4 text-destructive">
        NOTE: Upon confirmation, all your personal data, and associated content
        will be permanently erased from our systems. This includes your profile,
        preferences, and any saved information tied to your account.
      </p>
    </CardContent>
    <CardFooter>
      <AuthActionButton
        action={deleteUser}
        requireConfirmation
        successMessage="Account deletion initiated. Please check your email to confirm."
        variant="destructive"
      >
        Delete Account Permanently
      </AuthActionButton>
    </CardFooter>
  </Card>
);
