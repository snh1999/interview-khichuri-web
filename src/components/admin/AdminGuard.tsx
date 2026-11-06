import { Suspense } from "react";
import { Navigate, Outlet } from "react-router";
import { useGetPermission } from "@/api/auth/admin.ts";
import { HOMEPAGE } from "@/app.constants.ts";
import { Spinner } from "@/components/ui/spinner.tsx";

export const AdminGuard = () => {
  const { data, isPending } = useGetPermission({
    permissions: { user: ["list"] },
  });

  if (isPending) {
    return <Spinner />;
  }

  if (data?.success !== true) {
    return <Navigate replace to={HOMEPAGE} />;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <Outlet />
    </Suspense>
  );
};
