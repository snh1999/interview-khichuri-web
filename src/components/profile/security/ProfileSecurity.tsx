import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { UpdatePasswordForm } from "@/components/profile/security/UpdatePasswordForm.tsx";
import { useListAccounts } from "@/api/auth";
import { TwoFactorAuth } from "@/components/profile/security/twofactor/TwofactorAuth.tsx";
import { PasskeyCard } from "@/components/profile/security/passkey/PasskeyCard.tsx";
import { requestPasswordReset, useSession } from "@/lib/auth/auth-client.ts";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";

export const ProfileTab = () => {
  return (
    <div className="space-y-6">
      <AppErrorSuspense Fallback={ProfileSkeletonCard}>
        <ProfileSecurity />
      </AppErrorSuspense>

      <AppErrorSuspense>
        <PasskeyCard />
      </AppErrorSuspense>
    </div>
  );
};

export const ProfileSecurity = () => {
  const { data: accounts } = useListAccounts();
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  const email = session.user.email;
  const hasPassword = accounts?.some(
    (account) => account.providerId === "credential"
  );

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
            <CardDescription>
              We will send you a password reset email to set up a password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthActionButton
              variant="outline"
              successMessage="Password reset email sent"
              action={() => requestPasswordReset({ email })}
            >
              Send Email with Password Reset Link
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
