// import { UpdatePasswordForm } from "@/components/settings/security/UpdatePasswordForm.tsx";
import { useState } from "react";
import { useListAccounts } from "@/api/auth";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard.tsx";
import { PasskeyCard } from "@/components/settings/security/passkey/PasskeyCard.tsx";
import { TwoFactorAuth } from "@/components/settings/security/twofactor/TwofactorAuth.tsx";
import { UpdatePasswordForm } from "@/components/settings/security/UpdatePasswordForm.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useEmailResendCooldown } from "@/hooks/useEmailResendCooldown.ts";
import { requestPasswordReset, useSession } from "@/lib/auth/auth-client.ts";

export const ProfileSecurityTab = () => (
  <div className="space-y-6">
    <AppErrorSuspense fallback={ProfileSkeletonCard}>
      <ProfileSecurity />
    </AppErrorSuspense>

    <AppErrorSuspense>
      <PasskeyCard />
    </AppErrorSuspense>
  </div>
);

export const ProfileSecurity = () => {
  const { data: accounts } = useListAccounts();
  const { data: session } = useSession();
  const { cooldown, markSent } = useEmailResendCooldown();
  const [emailSent, setEmailSent] = useState(false);

  if (!session) {
    return null;
  }

  const { email } = session.user;
  const hasPassword = accounts?.some(
    (account) => account.providerId === "credential"
  );

  const handlePasswordReset = async () => {
    const result = await requestPasswordReset({ email });
    if (!result.error) {
      markSent();
      setEmailSent(true);
    }
    return result;
  };

  return (
    <div className="space-y-6">
      {hasPassword ? (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password for improved security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdatePasswordForm />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Set Password</CardTitle>
            <CardDescription className="whitespace-normal">
              {emailSent
                ? `We sent a password reset link to ${email}. Please check your inbox.`
                : "We will send you a password reset email to set up a password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthActionButton
              action={handlePasswordReset}
              disabled={cooldown > 0}
              successMessage="Password reset email sent"
              variant="outline"
            >
              {emailSent
                ? "Resend Email"
                : "Send Email with Password Reset Link"}
              {cooldown > 0 ? ` (${cooldown}s)` : ""}
            </AuthActionButton>
          </CardContent>
        </Card>
      )}

      {hasPassword ? <TwoFactorAuth /> : null}
    </div>
  );
};

const ProfileSkeletonCard = () => (
  <div className="space-y-6">
    <SkeletonCard>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </SkeletonCard>

    <SkeletonCard compact>
      <Skeleton className="h-10 w-full" />
    </SkeletonCard>
  </div>
);
