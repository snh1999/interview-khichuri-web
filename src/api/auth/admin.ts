import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { queryKeys } from "@/api";
import { useAdminUsersQueryParams } from "@/api/admin";
import { HOMEPAGE } from "@/app.constants.ts";
import {
  authAdmin,
  unwrapBetterAuth,
  useSession,
} from "@/lib/auth/auth-client.ts";

export type TPermissionOptions = Parameters<typeof authAdmin.hasPermission>[0];

export const useGetPermission = (options: TPermissionOptions) =>
  useQuery({
    queryKey: queryKeys.admin.permission(options),
    queryFn: async () =>
      await unwrapBetterAuth(authAdmin.hasPermission(options)),
  });

const useAdminUserInvalidation = () => {
  const filters = useAdminUsersQueryParams();

  return (userId: string, extra: readonly unknown[] = []) => [
    queryKeys.admin.users(filters as Record<string, unknown>),
    queryKeys.admin.user(userId),
    ...extra,
  ];
};

const throwIfError = (error: { message?: string } | null, fallback: string) => {
  if (error) {
    throw new Error(error.message ?? fallback);
  }
};

export const useAdminUserSessions = (userId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.admin.sessions({ userId }),
    queryFn: async () =>
      await unwrapBetterAuth(
        authAdmin.listUserSessions({ userId: userId ?? "" })
      ),
    enabled: Boolean(userId),
  });

export const useImpersonateUser = () => {
  const navigate = useNavigate();
  const { refetch } = useSession();
  const invalidationKeys = useAdminUserInvalidation();

  return useMutation({
    mutationFn: async (userId: string) =>
      await unwrapBetterAuth(authAdmin.impersonateUser({ userId })),
    onSuccess: async () => {
      await refetch();
      navigate(HOMEPAGE);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to impersonate user"
      );
    },
    meta: { invalidates: (userId: string) => invalidationKeys(userId) },
  });
};

export const useBanUser = () => {
  const invalidationKeys = useAdminUserInvalidation();

  return useMutation({
    mutationFn: async ({
      userId,
      banReason,
      banExpiresIn,
    }: {
      userId: string;
      banReason?: string;
      banExpiresIn?: number;
    }) => {
      const result = await authAdmin.banUser({
        userId,
        banReason,
        banExpiresIn,
      });
      throwIfError(result.error, "Failed to ban user");
      return result;
    },
    onSuccess: () => {
      toast.success("User banned");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to ban user"
      );
    },
    meta: {
      invalidates: (variables: { userId: string }) =>
        invalidationKeys(variables.userId),
    },
  });
};

export const useUnbanUser = () => {
  const invalidationKeys = useAdminUserInvalidation();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authAdmin.unbanUser({ userId });
      throwIfError(result.error, "Failed to unban user");
      return result;
    },
    onSuccess: () => {
      toast.success("User unbanned");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to unban user"
      );
    },
    meta: { invalidates: (userId: string) => invalidationKeys(userId) },
  });
};

export const useRemoveUser = () => {
  const invalidationKeys = useAdminUserInvalidation();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authAdmin.removeUser({ userId });
      throwIfError(result.error, "Failed to delete user");
      return result;
    },
    onSuccess: () => {
      toast.success("User deleted");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove user"
      );
    },
    meta: { invalidates: (userId: string) => invalidationKeys(userId) },
  });
};

export const useRevokeSessionByAdmin = () => {
  const invalidationKeys = useAdminUserInvalidation();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authAdmin.revokeUserSessions({ userId });
      throwIfError(result.error, "Failed to revoke sessions");
      return result;
    },
    onSuccess: () => {
      toast.success("User sessions revoked");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke session"
      );
    },
    meta: {
      invalidates: (userId: string) =>
        invalidationKeys(userId, [queryKeys.admin.sessions({ userId })]),
    },
  });
};

export const useRevokeUserSession = () => {
  const invalidationKeys = useAdminUserInvalidation();

  return useMutation({
    mutationFn: async ({
      sessionToken,
    }: {
      userId: string;
      sessionToken: string;
    }) => {
      const result = await authAdmin.revokeUserSession({ sessionToken });
      throwIfError(result.error, "Failed to revoke session");
      return result;
    },
    onSuccess: () => {
      toast.success("Session revoked");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke session"
      );
    },
    meta: {
      invalidates: (variables: { userId: string }) =>
        invalidationKeys(variables.userId, [
          queryKeys.admin.sessions({ userId: variables.userId }),
        ]),
    },
  });
};

export const useSetUserRole = () => {
  const invalidationKeys = useAdminUserInvalidation();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "admin" | "user";
    }) => {
      const result = await authAdmin.setRole({ userId, role });
      throwIfError(result.error, "Failed to update role");
      return result;
    },
    onSuccess: () => {
      toast.success("Role updated");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update role"
      );
    },
    meta: {
      invalidates: (variables: { userId: string }) =>
        invalidationKeys(variables.userId),
    },
  });
};

export const useSetUserPassword = () => {
  const invalidationKeys = useAdminUserInvalidation();

  return useMutation({
    mutationFn: async ({
      userId,
      newPassword,
    }: {
      userId: string;
      newPassword: string;
    }) => {
      const result = await authAdmin.setUserPassword({ userId, newPassword });
      throwIfError(result.error, "Failed to set password");
      return result;
    },
    onSuccess: () => {
      toast.success("Password updated");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to set password"
      );
    },
    meta: {
      invalidates: (variables: { userId: string }) =>
        invalidationKeys(variables.userId),
    },
  });
};

export const useVerifyUserEmail = () => {
  const invalidationKeys = useAdminUserInvalidation();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authAdmin.updateUser({
        userId,
        data: { emailVerified: true },
      });
      throwIfError(result.error, "Failed to verify email");
      return result;
    },
    onSuccess: () => {
      toast.success("Email verified");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to verify email"
      );
    },
    meta: { invalidates: (userId: string) => invalidationKeys(userId) },
  });
};
