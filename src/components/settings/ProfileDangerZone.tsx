import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { deleteUser } from "@/lib/auth/auth-client.ts";

export const ProfileDangerZone = () => (
  <Card className="border border-destructive">
    <CardHeader>
      <CardTitle className="text-destructive">Danger Zone</CardTitle>
    </CardHeader>

    <CardContent>
      Account deletion
      <AuthActionButton
        action={() => deleteUser()}
        className="w-full"
        requireConfirmation
        successMessage="Account deletion initiated. Please check your email to confirm."
        variant="destructive"
      >
        Delete Account Permanently
      </AuthActionButton>
    </CardContent>
  </Card>
);
