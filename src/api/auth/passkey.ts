import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { authPasskey, unwrapBetterAuth } from "@/lib/auth/auth-client.ts";

export const useListPasskey = () =>
  useSuspenseQuery({
    queryKey: queryKeys.auth.passkey,
    queryFn: async () => await unwrapBetterAuth(authPasskey.listUserPasskeys()),
  });

export const useAddPasskey = () =>
  useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await authPasskey.addPasskey(data);
      if (response.error) {
        if (
          "code" in response.error &&
          response.error.code === "SESSION_NOT_FRESH"
        ) {
          throw new Error(
            "Your session is too old to add a passkey for security reasons. Please sign out and sign back in to continue."
          );
        }
        throw new Error(response.error.message ?? "Failed to add passkey");
      }
      return response;
    },
    meta: { invalidates: queryKeys.auth.passkey },
  });

export const useDeletePasskey = () =>
  useMutation({
    mutationFn: async (id: string) => await authPasskey.deletePasskey({ id }),
    meta: { invalidates: queryKeys.auth.passkey },
  });
