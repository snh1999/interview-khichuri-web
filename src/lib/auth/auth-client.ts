import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  lastLoginMethodClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import type { TOauthProviders } from "@/lib/auth/auth.helpers.tsx";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL || typeof baseURL !== "string" || !/^https?:\/\//u.test(baseURL)) {
  throw new Error("Invalid baseUrl");
}

const authClient = createAuthClient({
  baseURL,
  plugins: [
    adminClient(),
    lastLoginMethodClient(),
    passkeyClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        globalThis.location.href = "/confirm-login";
      },
    }),
  ],
});

export const oauthLogin = async (provider: TOauthProviders) =>
  authClient.signIn.social({
    provider,
    callbackURL: globalThis.location.origin,
  });

export const linkSocial = async (provider: TOauthProviders) =>
  authClient.linkSocial({
    provider,
    callbackURL: `${globalThis.location.origin}/profile?tab=accounts`,
  });

export const {
  signIn,
  signUp,
  verifyEmail,
  resetPassword,
  changePassword,
  listSessions,
  revokeOtherSessions,
  revokeSession,
  updateUser,
  changeEmail,
  listAccounts,
  requestPasswordReset,
  sendVerificationEmail,
  signOut,
  unlinkAccount,
  deleteUser,
  useSession,
  getLastUsedLoginMethod,
  admin: authAdmin,
  twoFactor: authTwoFactor,
  passkey: authPasskey,
} = authClient;
