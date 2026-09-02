import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { signOut } from "@/lib/auth/auth-client.ts";
import { clearLocalCache } from "@/lib/indexdb.ts";

const logout = async () => {
  await clearLocalCache();
  return signOut();
};

export const LogoutButton = () => (
  <AuthActionButton action={logout} successMessage="Logged out, Redirecting">
    Logout
  </AuthActionButton>
);
