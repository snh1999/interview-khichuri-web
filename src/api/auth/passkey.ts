import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/api";
import { authPasskey, unwrapBetterAuth } from "@/lib/auth/auth-client.ts";

export const useListPasskey = () =>
  useSuspenseQuery({
    queryKey: queryKeys.auth.passkey,
    queryFn: async () => unwrapBetterAuth(authPasskey.listUserPasskeys()),
  });

export const useAddPasskey = () =>
  useMutation({
    mutationFn: async (data: { name: string }) => authPasskey.addPasskey(data),
    meta: { invalidates: queryKeys.auth.passkey },
  });

export const useDeletePasskey = () =>
  useMutation({
    mutationFn: async (id: string) =>
      authPasskey.deletePasskey(
        { id },
        {
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      ),
    meta: { invalidates: queryKeys.auth.passkey },
  });
