import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/api";
import { authAdmin } from "@/lib/auth/auth-client.ts";
import { usePagination } from "@/hooks/usePagination.ts";

export type TPermissionOptions = Parameters<typeof authAdmin.hasPermission>[0];

export const useGetPermission = (options: TPermissionOptions) =>
  useQuery({
    queryKey: queryKeys.admin.permission(options),
    queryFn: async () => authAdmin.hasPermission(options),
    select: (response) => response.data,
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
      authAdmin.listUsers({
        query: {
          limit,
          offset: (page - 1) * limit,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      }),
    select: (response) => response.data,
  });

export const useBanUser = () => {
  const { limit, page } = usePagination();
  return useMutation({
    mutationFn: async (userId: string) =>
      authAdmin.banUser(
        { userId },
        {
          onError: (error) => {
            toast.error(error.error.message || "Failed to ban user");
          },
          onSuccess: () => {
            toast.success("User banned");
          },
        }
      ),
    meta: { invalidates: queryKeys.admin.users({ page, limit }) },
  });
};

export const useUnbanUser = () => {
  const { limit, page } = usePagination();
  return useMutation({
    mutationFn: async (userId: string) =>
      authAdmin.unbanUser(
        { userId },
        {
          onError: (error) => {
            toast.error(error.error.message || "Failed to unban user");
          },
          onSuccess: () => {
            toast.success("User unbanned");
          },
        }
      ),
    meta: { invalidates: queryKeys.admin.users({ page, limit }) },
  });
};

export const useRemoveUser = () => {
  const { limit, page } = usePagination();
  return useMutation({
    mutationFn: async (userId: string) =>
      authAdmin.removeUser(
        { userId },
        {
          onError: (error) => {
            toast.error(error.error.message || "Failed to delete user");
          },
          onSuccess: () => {
            toast.success("User deleted");
          },
        }
      ),
    meta: { invalidates: queryKeys.admin.users({ page, limit }) },
  });
};

export const useRevokeSessionByAdmin = () =>
  useMutation({
    mutationFn: async (userId: string) =>
      authAdmin.revokeUserSessions(
        { userId },
        {
          onError: (error) => {
            toast.error(error.error.message);
          },
          onSuccess: () => {
            toast.success("User sessions revoked");
          },
          meta: { invalidates: queryKeys.admin.sessions() },
        }
      ),
  });
