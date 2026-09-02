import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/api";
import { usePagination } from "@/hooks/usePagination.ts";
import { authAdmin, unwrapBetterAuth } from "@/lib/auth/auth-client.ts";

export type TPermissionOptions = Parameters<typeof authAdmin.hasPermission>[0];

export const useGetPermission = (options: TPermissionOptions) =>
  useQuery({
    queryKey: queryKeys.admin.permission(options),
    queryFn: async () =>
      await unwrapBetterAuth(authAdmin.hasPermission(options)),
  });
export const useAdminListUsers = ({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}) =>
  useSuspenseQuery({
    queryKey: queryKeys.admin.users({ page, limit }),
    queryFn: async () =>
      await unwrapBetterAuth(
        authAdmin.listUsers({
          query: {
            limit,
            offset: (page - 1) * limit,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        })
      ),
  });

export const useBanUser = () => {
  const { limit, page } = usePagination();
  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authAdmin.banUser({ userId });
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to ban user");
      }
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
    meta: { invalidates: queryKeys.admin.users({ page, limit }) },
  });
};

export const useUnbanUser = () => {
  const { limit, page } = usePagination();
  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authAdmin.unbanUser({ userId });
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to unban user");
      }
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
    meta: { invalidates: queryKeys.admin.users({ page, limit }) },
  });
};

export const useRemoveUser = () => {
  const { limit, page } = usePagination();
  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authAdmin.removeUser({ userId });
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to delete user");
      }
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
    meta: { invalidates: queryKeys.admin.users({ page, limit }) },
  });
};

export const useRevokeSessionByAdmin = () =>
  useMutation({
    mutationFn: async (userId: string) => {
      const result = await authAdmin.revokeUserSessions({ userId });
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to revoke sessions");
      }
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
    meta: { invalidates: queryKeys.admin.sessions() },
  });
