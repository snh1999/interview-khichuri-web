import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { signOut } from "@/lib/auth/auth-client.ts";
import { clearLocalCache } from "@/lib/indexdb.ts";

const logout = async () => {
  await clearLocalCache();
  return signOut();
};

export const LogoutButton = () => (
  <AuthActionButton
    action={logout}
    dialogDescription="Your ATS scores, review recommendations, keyword analysis, and tailoring notes are stored in this browser's local cache. This data is not saved on the server. If others use this browser, they could see this data after you log out."
    requireConfirmation
    successMessage="Logged out, Redirecting"
  >
    Logout
  </AuthActionButton>
);
