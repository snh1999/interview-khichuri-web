import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { deleteUser } from "@/lib/auth/auth-client.ts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

export const ProfileDangerZone = () => {
  return (
    <Card className="border-destructive border">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
      </CardHeader>

      <CardContent>
        Account deletion
        <AuthActionButton
          requireConfirmation
          variant="destructive"
          className="w-full"
          successMessage="Account deletion initiated. Please check your email to confirm."
          action={() => deleteUser()}
        >
          Delete Account Permanently
        </AuthActionButton>
      </CardContent>
    </Card>
  );
};
