import { useSession } from "@/lib/auth/auth-client.ts";
import { PasswordInput } from "@/components/common/form/PasswordInput.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { QRCodeVerify } from "@/components/profile/security/twofactor/QRCodeVerify.tsx";
import { useTwoFactorAuthForm } from "@/components/profile/security/twofactor/twofactor.helpers.ts";

export const TwoFactorAuth = () => {
  const { data } = useSession();
  const isEnabled = data?.user.twoFactorEnabled ?? false;

  const { twoFactorData, clearTwoFactorData, onSubmit, form, isLoading } =
    useTwoFactorAuthForm(isEnabled);

  if (twoFactorData != null) {
    return <QRCodeVerify {...twoFactorData} clearCodes={clearTwoFactorData} />;
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>Two-Factor Authentication</CardTitle>
        <Badge variant={isEnabled ? "default" : "secondary"}>
          {isEnabled ? "Enabled" : "Disabled"}
        </Badge>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <PasswordInput form={form} name="password" label="Password" />

          <AsyncButton
            type="submit"
            disabled={isLoading || !form.formState.isValid}
            className="w-full"
            variant={isEnabled ? "destructive" : "default"}
          >
            {isEnabled ? "Disable 2FA" : "Enable 2FA"}
          </AsyncButton>
        </form>
      </CardContent>
    </Card>
  );
};
